// File: src/modules/submission/services/submission.service.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { SubmissionRepository } from './repositories/submission.repository';
import { Submission, SubmissionStatus } from './database/submission.entity';
import {
  LessonItem,
  LessonItemType,
} from '../lessons/database/lesson-item.entity';
import { CreateSubmissionDto } from './dtos/request/create-submission.dto';
import { SearchSubmissionDto } from './dtos/request/search-submission.dto';
import { SubmissionResponseDto } from './dtos/response/submission-response.dto';
import { PaginatedSubmissionsResponseDto } from './dtos/response/paginated-submissions-response.dto';
import { GradeSubmissionDto } from './dtos/request/grade-submission.dto';
import { Class } from 'src/modules/classes/database/class.entity';

@Injectable()
export class SubmissionService {
  constructor(
    private readonly submissionCustomRepo: SubmissionRepository,

    @InjectRepository(Submission)
    private readonly submissionTypeOrmRepo: Repository<Submission>,

    @InjectRepository(LessonItem)
    private readonly lessonItemRepository: Repository<LessonItem>,

    // 👇 Inject Class Repository nếu cần validate kỹ
    @InjectRepository(Class)
    private readonly classRepository: Repository<Class>,
  ) {}

  // --- 1. TẠO BÀI NỘP ---
  async create(
    createSubmissionDto: CreateSubmissionDto,
    studentId: string,
  ): Promise<SubmissionResponseDto> {
    const { lessonItemId, classId, gitLink, description } = createSubmissionDto;

    // 1. Check Class tồn tại
    const classExists = await this.classRepository.findOneBy({
      class_id: classId,
    });
    if (!classExists) throw new NotFoundException('Lớp học không tồn tại.');

    // 2. Check bài tập
    const lessonItem = await this.lessonItemRepository.findOne({
      where: { id: lessonItemId },
    });
    if (!lessonItem) throw new NotFoundException('Bài tập không tồn tại.');
    if (lessonItem.type !== LessonItemType.ESSAY) {
      throw new BadRequestException(
        'Chỉ được nộp bài cho bài tập tự luận (Essay).',
      );
    }

    // 3. Check bài cũ (TRONG PHẠM VI LỚP HỌC NÀY)
    let submission = await this.submissionTypeOrmRepo.findOne({
      where: {
        studentId,
        lessonItemId,
        classId: classId, // 👈 Quan trọng: Chỉ check trong lớp này
      },
    });

    if (submission) {
      if (submission.status === SubmissionStatus.APPROVED) {
        throw new BadRequestException(
          'Bài tập này đã ĐẬU trong lớp này, không cần nộp lại.',
        );
      }
      // Resubmit
      submission.gitLink = gitLink;
      submission.description = description;
      submission.status = SubmissionStatus.PENDING;
      await this.submissionTypeOrmRepo.save(submission);
    } else {
      // Create new
      submission = this.submissionTypeOrmRepo.create({
        studentId,
        lessonItemId,
        classId, // 👈 Lưu classId
        gitLink,
        description,
        status: SubmissionStatus.PENDING,
      });
      await this.submissionTypeOrmRepo.save(submission);
    }

    // Load full data
    const finalSubmission = await this.submissionTypeOrmRepo.findOne({
      where: { id: submission.id },
      relations: ['student', 'lessonItem', 'class'], // Load thêm class info nếu cần
    });

    return new SubmissionResponseDto(finalSubmission);
  }

  // --- 2. CHẤM ĐIỂM ---
  async grade(
    id: string,
    dto: GradeSubmissionDto,
    reviewerId: string,
  ): Promise<SubmissionResponseDto> {
    const submission = await this.submissionTypeOrmRepo.findOne({
      where: { id },
      relations: ['student', 'lessonItem', 'class'],
    });

    if (!submission) {
      throw new NotFoundException('Không tìm thấy bài nộp');
    }

    if (dto.status) submission.status = dto.status;

    if (dto.score !== undefined && dto.score !== null) {
      submission.score = dto.score;
    }

    if (dto.feedback !== undefined) {
      submission.feedback = dto.feedback;
    }

    submission.reviewerId = reviewerId;

    const savedSubmission = await this.submissionTypeOrmRepo.save(submission);

    return new SubmissionResponseDto(savedSubmission);
  }

  // --- FIND ALL (ADMIN) ---
  async findAll(
    searchDto: SearchSubmissionDto,
  ): Promise<PaginatedSubmissionsResponseDto> {
    const { submissions, total } =
      await this.submissionCustomRepo.findAll(searchDto);

    const submissionDtos = submissions.map(
      (submission) => new SubmissionResponseDto(submission),
    );

    return new PaginatedSubmissionsResponseDto(
      submissionDtos,
      total,
      searchDto.page || 1,
      searchDto.limit || 10,
    );
  }

  async findOne(id: string): Promise<SubmissionResponseDto> {
    const submission = await this.submissionTypeOrmRepo.findOne({
      where: { id },
      relations: ['student', 'lessonItem', 'class'],
    });

    if (!submission) {
      throw new NotFoundException('Bài nộp không tồn tại');
    }

    return new SubmissionResponseDto(submission);
  }

  // --- GET MY SUBMISSIONS ---
  // Cần sửa lại logic này nếu muốn lấy theo class, hiện tại lấy tất cả lịch sử
  async findByStudentId(studentId: string): Promise<SubmissionResponseDto[]> {
    const submissions =
      await this.submissionCustomRepo.findByStudentId(studentId);

    return submissions.map(
      (submission) => new SubmissionResponseDto(submission),
    );
  }
}
