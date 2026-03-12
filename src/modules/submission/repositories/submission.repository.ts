// src/modules/submission/repositories/submission.repository.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Submission } from '../database/submission.entity';
import { CreateSubmissionDto } from '../dtos/request/create-submission.dto';
import { SearchSubmissionDto } from '../dtos/request/search-submission.dto';

@Injectable()
export class SubmissionRepository {
  constructor(
    @InjectRepository(Submission)
    private submissionRepository: Repository<Submission>,
  ) {}

  async create(
    createSubmissionDto: CreateSubmissionDto,
    studentId: string,
  ): Promise<Submission> {
    const submission = this.submissionRepository.create({
      ...createSubmissionDto,
      studentId,
    });
    return this.submissionRepository.save(submission);
  }

  async findAll(
    searchDto: SearchSubmissionDto,
  ): Promise<{ submissions: Submission[]; total: number }> {
    const {
      search,
      studentId,
      gitLink,
      status,
      classId,
      lessonItemId, // 👈 1. PHẢI lấy lessonItemId ra ở đây
      page = 1,
      limit = 10,
    } = searchDto;
    const skip = (page - 1) * limit;

    const queryBuilder = this.submissionRepository
      .createQueryBuilder('submission')
      .leftJoinAndSelect('submission.student', 'student')
      .leftJoinAndSelect('submission.class', 'class')
      .leftJoinAndSelect('submission.lessonItem', 'lessonItem');

    // Dùng where(1=1) để các điều kiện andWhere phía sau luôn đúng logic
    queryBuilder.where('1=1');

    if (search) {
      queryBuilder.andWhere(
        '(submission.gitLink LIKE :search OR submission.description LIKE :search OR student.full_name LIKE :search OR student.email LIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (studentId) {
      queryBuilder.andWhere('submission.studentId = :studentId', { studentId });
    }

    if (classId) {
      queryBuilder.andWhere('submission.classId = :classId', { classId });
    }

    // 👈 2. QUAN TRỌNG: Thêm điều kiện lọc đúng bài học
    if (lessonItemId) {
      queryBuilder.andWhere('submission.lessonItemId = :lessonItemId', {
        lessonItemId,
      });
    }

    if (gitLink) {
      queryBuilder.andWhere('submission.gitLink LIKE :gitLink', {
        gitLink: `%${gitLink}%`,
      });
    }

    if (status) {
      queryBuilder.andWhere('submission.status = :status', { status });
    }

    const [submissions, total] = await queryBuilder
      .orderBy('submission.createdAt', 'DESC')
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return { submissions, total };
  }

  async findByStudentId(studentId: string): Promise<Submission[]> {
    return this.submissionRepository.find({
      where: { studentId },
      order: { createdAt: 'DESC' },
      relations: ['student', 'class', 'lessonItem'],
    });
  }
}
