import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, IsNull, In } from 'typeorm';
import {
  LessonProgress,
  LessonStatus,
} from './database/lesson-progress.entity';
import { UpsertLessonProgressDto } from './dtos/upsert-progress.dto';
import { QueryLessonProgressDto } from './dtos/query-progress.dto';
import { LessonItem } from '../lessons/database/lesson-item.entity';
@Injectable()
export class ProgressService {
  constructor(
    @InjectRepository(LessonProgress)
    private readonly repo: Repository<LessonProgress>,

    // 👇 Inject Repository của LessonItem để đếm tổng số bài
    @InjectRepository(LessonItem)
    private readonly lessonItemRepo: Repository<LessonItem>,
  ) {}

  async upsert(dto: UpsertLessonProgressDto) {
    const {
      userId,
      courseId,
      sessionId,
      lessonId,
      lessonItemId,
      classId,
      status,
      percentage,
      lastPosition,
    } = dto;

    const where: FindOptionsWhere<LessonProgress> = {
      userId,
      lessonItemId,
    };

    if (classId) {
      where.classId = classId;
    } else {
      where.classId = IsNull();
    }

    const existing = await this.repo.findOne({ where });

    if (existing) {
      existing.courseId = courseId;
      existing.sessionId = sessionId;
      existing.lessonId = lessonId;
      existing.lessonItemId = lessonItemId;
      existing.classId = classId ?? null;
      if (existing.status === LessonStatus.COMPLETED) {
      } else {
        if (status) existing.status = status;
      }

      if (typeof percentage === 'number') {
        existing.percentage = Math.max(existing.percentage, percentage);
      }

      if (typeof lastPosition === 'number') {
        existing.lastPosition = lastPosition;
      }
      return this.repo.save(existing);
    }

    const created = this.repo.create({
      userId,
      courseId,
      sessionId,
      lessonId,
      lessonItemId,
      classId: classId ?? null,
      status: status ?? LessonStatus.IN_PROGRESS,
      percentage: percentage ?? 0,
      lastPosition: lastPosition ?? null,
    });
    return this.repo.save(created);
  }

  async get(query: QueryLessonProgressDto) {
    const { userId, courseId, sessionId, lessonId, lessonItemId, classId } =
      query;

    const where: FindOptionsWhere<LessonProgress> = { userId };

    if (courseId) {
      where.courseId = courseId;
    }
    if (sessionId) {
      where.sessionId = sessionId;
    }
    if (lessonId) {
      where.lessonId = lessonId;
    }
    if (lessonItemId) {
      where.lessonItemId = lessonItemId;
    }
    if (typeof classId !== 'undefined') {
      where.classId = classId ?? null;
    }

    return this.repo.find({ where, order: { updatedAt: 'DESC' } });
  }

  async getClassProgress(
    classId: string,
    studentIds: string[],
    courseIds: string[],
  ) {
    // 1. Tính TỔNG SỐ BÀI HỌC (Total Items) cho từng khóa
    // Chạy song song để nhanh hơn
    const coursesTotalItems = await Promise.all(
      courseIds.map(async (cId) => {
        const total = await this.lessonItemRepo.count({
          where: {
            lesson: { session: { course: { id: cId } } }, // Relation: Item -> Lesson -> Session -> Course
          },
        });
        return { courseId: cId, total };
      }),
    );

    // 2. Dùng QueryBuilder để đếm số bài COMPLETED, Group theo User và Course
    // SELECT userId, courseId, COUNT(*) as completedCount FROM lesson_progress ... GROUP BY userId, courseId
    const rawProgress = await this.repo
      .createQueryBuilder('lp')
      .select('lp.userId', 'userId')
      .addSelect('lp.courseId', 'courseId')
      .addSelect('COUNT(lp.id)', 'completedCount')
      .where('lp.classId = :classId', { classId })
      .andWhere('lp.userId IN (:...studentIds)', { studentIds })
      .andWhere('lp.courseId IN (:...courseIds)', { courseIds })
      .andWhere('lp.status = :status', { status: LessonStatus.COMPLETED }) // Chỉ tính bài đã hoàn thành
      .groupBy('lp.userId')
      .addGroupBy('lp.courseId')
      .getRawMany();

    // 3. Mapping dữ liệu trả về Frontend
    const result = {};

    studentIds.forEach((sId) => {
      const userProgressList = [];

      coursesTotalItems.forEach(({ courseId, total }) => {
        // Tìm bản ghi tiến độ của user này trong khóa này từ kết quả raw
        const found = rawProgress.find(
          (p) => p.userId === sId && p.courseId === courseId,
        );

        const completedCount = found ? parseInt(found.completedCount, 10) : 0;

        // Tránh chia cho 0
        const percent =
          total > 0 ? Math.round((completedCount / total) * 100) : 0;

        userProgressList.push({ courseId, percent });
      });

      result[sId] = userProgressList;
    });

    return result; // Cấu trúc: { "studentId1": [{ courseId: "...", percent: 50 }, ...], ... }
  }
}
