import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';

import { Vocabulary } from './entity/vocabulary.entity';
import { Topic } from '../topic/entity/topic.entity';
import { Kanji } from '../kanji/database/kanji.entity';
import { CreateVocabularyDto } from './dto/create-vocabulary.dto';
import { UpdateVocabularyDto } from './dto/update-vocabulary.dto';

@Injectable()
export class VocabularyService {
  constructor(
    @InjectRepository(Vocabulary)
    private readonly vocabRepo: Repository<Vocabulary>,

    @InjectRepository(Topic)
    private readonly topicRepo: Repository<Topic>,

    @InjectRepository(Kanji)
    private readonly kanjiRepo: Repository<Kanji>,
  ) {}

  /**
   * 🟢 HELPER: Tách các ký tự Kanji ra khỏi chuỗi
   * Ví dụ: "日本" -> ["日", "本"]
   * Ví dụ: "食べます" -> ["食"]
   */
  private extractKanji(text: string): string[] {
    const kanjiRegex = /[\u4e00-\u9faf]/g; // Regex dải mã Unicode của Kanji
    return text.match(kanjiRegex) || [];
  }

  /**
   * 🟢 TẠO MỚI (Có tự động link Kanji)
   */
  async create(dto: CreateVocabularyDto) {
    const topic = await this.topicRepo.findOne({
      where: { id: dto.topicId },
    });
    if (!topic) throw new NotFoundException('Topic không tồn tại');

    // 1. Lấy Kanji người dùng chọn thủ công (nếu có)
    let kanjiList = dto.kanjiIds?.length
      ? await this.kanjiRepo.find({ where: { id: In(dto.kanjiIds) } })
      : [];

    // 2. 🟢 AUTO-DETECT: Tự động quét Kanji từ mặt chữ
    const detectedChars = this.extractKanji(dto.word);
    if (detectedChars.length > 0) {
      const autoKanjis = await this.kanjiRepo.find({
        where: { kanji: In(detectedChars) },
      });

      // Gộp vào list (tránh trùng lặp với cái đã chọn thủ công)
      for (const k of autoKanjis) {
        if (!kanjiList.find((existing) => existing.id === k.id)) {
          kanjiList.push(k);
        }
      }
    }

    // 3. Tạo và lưu
    const vocab = this.vocabRepo.create({
      word: dto.word,
      reading: dto.reading,
      meaning: dto.meaning,
      topic,
      kanjiList, // TypeORM tự xử lý bảng trung gian
    });

    return this.vocabRepo.save(vocab);
  }

  /**
   * 🟢 IMPORT HÀNG LOẠT (Dùng cho Excel/JSON Import)
   * Tối ưu hiệu suất: Load Kanji 1 lần thay vì query trong vòng lặp
   */
  async importBulk(topicId: string, dtos: CreateVocabularyDto[]) {
    const topic = await this.topicRepo.findOne({ where: { id: topicId } });
    if (!topic) throw new NotFoundException('Topic không tồn tại');

    // Bước 1: Thu thập tất cả chữ Kanji xuất hiện trong file Excel/JSON
    const allCharsSet = new Set<string>();
    dtos.forEach((dto) => {
      this.extractKanji(dto.word).forEach((char) => allCharsSet.add(char));
    });
    const allChars = Array.from(allCharsSet);

    // Bước 2: Load từ điển Kanji từ DB lên bộ nhớ (Map)
    let kanjiMap = new Map<string, Kanji>();
    if (allChars.length > 0) {
      const kanjis = await this.kanjiRepo.find({
        where: { kanji: In(allChars) },
      });
      kanjis.forEach((k) => kanjiMap.set(k.kanji, k));
    }

    // Bước 3: Duyệt qua từng từ và tạo Entity
    const vocabulariesToSave = [];
    for (const dto of dtos) {
      // Tìm Kanji tương ứng trong Map đã load
      const detectedChars = this.extractKanji(dto.word);
      const linkedKanjis = detectedChars
        .map((char) => kanjiMap.get(char))
        .filter((k) => !!k); // Chỉ lấy những chữ Kanji CÓ trong DB

      const vocab = this.vocabRepo.create({
        word: dto.word,
        reading: dto.reading,
        meaning: dto.meaning,
        topic: topic,
        kanjiList: linkedKanjis,
      });
      vocabulariesToSave.push(vocab);
    }

    // Bước 4: Lưu tất cả 1 lần
    return this.vocabRepo.save(vocabulariesToSave);
  }

  // --- CÁC HÀM KHÁC GIỮ NGUYÊN ---

  async findAll(params: {
    page: number;
    limit: number;
    topic_id?: string;
    search?: string;
  }) {
    const { page, limit, topic_id, search } = params;
    const query = this.vocabRepo
      .createQueryBuilder('vocab')
      .leftJoinAndSelect('vocab.kanjiList', 'kanjiList')
      .leftJoinAndSelect('vocab.topic', 'topic')
      .orderBy('vocab.createdAt', 'DESC');

    if (topic_id) {
      query.andWhere('topic.id = :topicId', { topicId: topic_id });
    }

    if (search) {
      query.andWhere(
        '(vocab.word ILIKE :search OR vocab.meaning ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    query.skip((page - 1) * limit).take(limit);
    const [data, total] = await query.getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  findByTopic(topicId: string) {
    return this.vocabRepo.find({
      where: { topic: { id: topicId } },
      relations: ['kanjiList'],
      order: { createdAt: 'ASC' },
    });
  }

  async findOne(id: string) {
    const vocab = await this.vocabRepo.findOne({
      where: { id },
      relations: ['kanjiList', 'topic'],
    });
    if (!vocab) throw new NotFoundException('Vocabulary không tồn tại');
    return vocab;
  }

  async update(id: string, dto: UpdateVocabularyDto) {
    const vocab = await this.findOne(id);
    if (dto.topicId) {
      const topic = await this.topicRepo.findOne({
        where: { id: dto.topicId },
      });
      if (!topic) throw new NotFoundException('Topic mới không tồn tại');
      vocab.topic = topic;
    }
    // Update fields...
    if (dto.kanjiIds) {
      vocab.kanjiList = await this.kanjiRepo.find({
        where: { id: In(dto.kanjiIds) },
      });
    }
    // Note: Nếu muốn update cũng tự detect Kanji thì thêm logic extractKanji ở đây
    if (dto.word) vocab.word = dto.word;
    if (dto.reading) vocab.reading = dto.reading;
    if (dto.meaning) vocab.meaning = dto.meaning;

    return this.vocabRepo.save(vocab);
  }

  async updateKanji(vocabId: string, kanjiIds: number[]) {
    const vocab = await this.findOne(vocabId);
    const kanjiList = await this.kanjiRepo.find({
      where: { id: In(kanjiIds) },
    });
    vocab.kanjiList = kanjiList;
    return this.vocabRepo.save(vocab);
  }

  async remove(id: string) {
    const vocab = await this.findOne(id);
    await this.vocabRepo.remove(vocab);
    return { message: 'Đã xóa vĩnh viễn vocabulary thành công' };
  }
}
