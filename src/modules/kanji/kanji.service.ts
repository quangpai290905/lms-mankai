// src/modules/kanji/kanji.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Kanji } from './database/kanji.entity';
import { CreateKanjiDto } from './dtos/create-kanji.dto';

@Injectable()
export class KanjiService {
  constructor(
    @InjectRepository(Kanji)
    private readonly kanjiRepo: Repository<Kanji>,
  ) {}

  // ➕ TẠO HOẶC CẬP NHẬT (Logic thông minh cho Script Import)
  async create(dto: CreateKanjiDto) {
    // 1. Kiểm tra xem chữ Hán này đã có trong DB chưa (theo ký tự kanji)
    let kanji = await this.kanjiRepo.findOne({
      where: { kanji: dto.kanji },
    });

    if (kanji) {
      // 2a. Nếu có rồi -> Update thông tin mới
      Object.assign(kanji, dto);
    } else {
      // 2b. Nếu chưa có -> Tạo mới
      kanji = this.kanjiRepo.create(dto);
    }

    // 3. Lưu xuống (save xử lý được cả tạo mới và cập nhật)
    return this.kanjiRepo.save(kanji);
  }

  // 🔍 TÌM KIẾM & LỌC (Phục vụ tra từ điển)
  async findAll(params: {
    jlpt?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const { jlpt, search, page = 1, limit = 20 } = params;

    const query = this.kanjiRepo.createQueryBuilder('kanji');

    // Lọc theo cấp độ (N5, N4...)
    if (jlpt) {
      query.andWhere('kanji.jlpt = :jlpt', { jlpt });
    }

    // Tìm kiếm (theo mặt chữ, âm on, âm kun hoặc nghĩa)
    if (search) {
      query.andWhere(
        '(kanji.kanji LIKE :search OR kanji.onyomi LIKE :search OR kanji.kunyomi LIKE :search)',
        { search: `%${search}%` },
      );
    }

    // Phân trang
    query.skip((page - 1) * limit).take(limit);

    const [data, total] = await query.getManyAndCount();

    return {
      data,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  // 🔎 CHI TIẾT
  async findOne(id: number) {
    const kanji = await this.kanjiRepo.findOne({ where: { id } });
    if (!kanji) throw new NotFoundException(`Kanji có ID ${id} không tồn tại`);
    return kanji;
  }

  // 🗑 XÓA (Admin only)
  async remove(id: number) {
    const kanji = await this.findOne(id);
    return this.kanjiRepo.remove(kanji);
  }

  async importBulk(dtos: CreateKanjiDto[]) {
    const results = [];

    // Duyệt qua từng phần tử trong mảng JSON gửi lên
    for (const dto of dtos) {
      // Kiểm tra xem chữ này có chưa (tránh trùng lặp)
      let kanji = await this.kanjiRepo.findOne({ where: { kanji: dto.kanji } });

      if (kanji) {
        // Nếu có rồi -> Cập nhật
        Object.assign(kanji, dto);
      } else {
        // Nếu chưa -> Tạo mới
        kanji = this.kanjiRepo.create(dto);
      }

      const saved = await this.kanjiRepo.save(kanji);
      results.push(saved);
    }

    return {
      message: `Đã xử lý ${results.length} chữ Kanji`,
      data: results,
    };
  }
}
