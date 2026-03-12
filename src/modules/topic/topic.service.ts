import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Topic } from './entity/topic.entity';
import { CreateTopicDto } from './dto/create-topic.dto';
import { UpdateTopicDto } from './dto/update-topic.dto';

@Injectable()
export class TopicService {
  constructor(
    @InjectRepository(Topic)
    private readonly topicRepo: Repository<Topic>,
  ) {}

  // ➕ CREATE
  async create(dto: CreateTopicDto) {
    const topic = this.topicRepo.create(dto);
    return this.topicRepo.save(topic);
  }

  // 🔍 LIST + SEARCH + PAGINATION
  async findAll(params: {
    q?: string;
    level?: string;
    page?: number;
    limit?: number;
  }) {
    const { q, level, page = 1, limit = 10 } = params;

    const query = this.topicRepo
      .createQueryBuilder('topic')
      .loadRelationCountAndMap('topic.vocabCount', 'topic.vocabularies');

    if (q) {
      query.andWhere('topic.name ILIKE :q', { q: `%${q}%` });
    }

    if (level) {
      query.andWhere('topic.level = :level', { level });
    }

    query
      .orderBy('topic.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await query.getManyAndCount();

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // 🔎 GET ONE (Có load vocabularies)
  async findOne(id: string) {
    const topic = await this.topicRepo.findOne({
      where: { id },
      relations: ['vocabularies'], // Chỉ load vocabularies khi xem chi tiết
    });

    if (!topic) {
      throw new NotFoundException('Topic không tồn tại');
    }

    return topic;
  }

  // ✏️ UPDATE
  async update(id: string, dto: UpdateTopicDto) {
    const topic = await this.findOne(id);
    Object.assign(topic, dto);
    return this.topicRepo.save(topic);
  }

  // 🧹 HARD DELETE (Xóa cứng)
  async remove(id: string) {
    const topic = await this.findOne(id);

    // Sử dụng remove() thay vì softRemove().
    // Vì bên Entity Vocabulary bạn đã set { onDelete: 'CASCADE' }
    // nên toàn bộ vocabulary con sẽ tự động bị xóa theo.
    await this.topicRepo.remove(topic);

    return {
      message: 'Đã xóa vĩnh viễn Topic và toàn bộ dữ liệu liên quan.',
    };
  }
}
