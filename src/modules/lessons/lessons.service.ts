// ✅ src/modules/lessons/lessons.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Lesson } from './database/lesson.entity';
import { Session } from '../sessions/database/session.entity';
import { LessonItem } from './database/lesson-item.entity';
import { CreateLessonDto } from './dtos/create-lesson.dto';
import { UpdateLessonDto } from './dtos/update-lesson.dto';
import { CreateLessonItemDto } from './dtos/create-lesson-item.dto';
import { UpdateLessonItemDto } from './dtos/update-lesson-item.dto';

@Injectable()
export class LessonsService {
  constructor(
    @InjectRepository(Lesson) private lessonRepo: Repository<Lesson>,
    @InjectRepository(Session) private sessionRepo: Repository<Session>,
    @InjectRepository(LessonItem) private itemRepo: Repository<LessonItem>,
  ) {}

  async create(createLessonDto: CreateLessonDto): Promise<Lesson> {
    const { sessionId, ...rest } = createLessonDto;
    const session = await this.sessionRepo.findOneBy({ id: sessionId });
    if (!session) throw new NotFoundException('Session not found');

    const lastLesson = await this.lessonRepo.findOne({
      where: { session: { id: sessionId } },
      order: { order: 'DESC' },
    });
    const newOrder = lastLesson ? lastLesson.order + 1 : 1;

    const lesson = this.lessonRepo.create({
      ...rest,
      order: newOrder,
      session,
    });
    return this.lessonRepo.save(lesson);
  }

  findAll(): Promise<Lesson[]> {
    // Thêm relation 'session' nếu cần lọc ở frontend (nhưng logic mới đã dùng session để load tree rồi)
    return this.lessonRepo.find({
      order: { order: 'ASC' },
      relations: ['session'],
    });
  }

  async findOne(id: string): Promise<Lesson> {
    const lesson = await this.lessonRepo.findOne({
      where: { id },
      relations: ['items'],
      order: { items: { orderIndex: 'ASC' } },
    });
    if (!lesson) throw new NotFoundException(`Lesson #${id} not found`);
    return lesson;
  }

  // 👇👇👇 KHÔI PHỤC LOGIC SỬA/XÓA 👇👇👇

  async update(id: string, updateLessonDto: UpdateLessonDto): Promise<Lesson> {
    const lesson = await this.findOne(id);
    // Loại bỏ sessionId khỏi updateDto nếu có, để tránh lỗi đổi session
    const { ...rest } = updateLessonDto;
    Object.assign(lesson, rest);
    return this.lessonRepo.save(lesson);
  }

  async remove(id: string): Promise<void> {
    const result = await this.lessonRepo.delete(id);
    if (result.affected === 0)
      throw new NotFoundException(`Lesson #${id} not found`);
  }

  // 👆👆👆 HẾT PHẦN KHÔI PHỤC 👆👆👆

  // --- LOGIC ITEMS ---

  async addItem(
    lessonId: string,
    dto: CreateLessonItemDto,
  ): Promise<LessonItem> {
    const lesson = await this.lessonRepo.findOneBy({ id: lessonId });
    if (!lesson) throw new NotFoundException('Lesson not found');

    const newItem = this.itemRepo.create({
      ...dto,
      lesson: lesson,
      resource_quiz_id: dto.quizId,
    });
    return this.itemRepo.save(newItem);
  }

  async updateItem(
    itemId: string,
    dto: UpdateLessonItemDto,
  ): Promise<LessonItem> {
    const item = await this.itemRepo.findOneBy({ id: itemId });
    if (!item) throw new NotFoundException('Item not found');

    const { quizId, ...rest } = dto;
    Object.assign(item, rest);
    if (quizId) item.resource_quiz_id = quizId;

    return this.itemRepo.save(item);
  }

  async removeItem(itemId: string): Promise<void> {
    const result = await this.itemRepo.delete(itemId);
    if (result.affected === 0) throw new NotFoundException('Item not found');
  }
}
