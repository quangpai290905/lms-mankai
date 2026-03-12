// src/modules/sessions/sessions.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Course } from '../courses/database/courses.entity';
import { Repository } from 'typeorm';
import { CreateSessionDto } from './dtos/create-session.dto';
import { UpdateSessionDto } from './dtos/update-session.dto'; // <-- Import cái này
import { Session } from './database/session.entity';

@Injectable()
export class SessionsService {
  constructor(
    @InjectRepository(Session)
    private readonly sessionRepository: Repository<Session>,
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
  ) {}

  async create(createSessionDto: CreateSessionDto): Promise<Session> {
    const { courseId, ...rest } = createSessionDto;

    const course = await this.courseRepository.findOneBy({ id: courseId });
    if (!course) {
      throw new NotFoundException(
        `Không tìm thấy khóa học với ID: ${courseId}`,
      );
    }

    // 👇 TÍNH TOÁN ORDER TỰ ĐỘNG 👇
    const lastSession = await this.sessionRepository.findOne({
      where: { course: { id: courseId } },
      order: { order: 'DESC' },
    });

    const newOrder = lastSession ? lastSession.order + 1 : 1;

    const newSession = this.sessionRepository.create({
      ...rest,
      order: newOrder, // ✅ Gán giá trị tự động
      course: course,
    });

    return this.sessionRepository.save(newSession);
  }

  async findAll(): Promise<Session[]> {
    return this.sessionRepository.find({
      order: { order: 'ASC' },
      relations: ['course', 'lessons', 'lessons.items'], // <-- QUAN TRỌNG: Lấy luôn cả lessons và items bên trong
    });
  }
  async findOne(id: string): Promise<Session> {
    const session = await this.sessionRepository.findOne({
      where: { id },
      relations: ['course', 'lessons', 'lessons.items'], // <-- SỬA: Lấy thêm 'lessons' để biết session có bài gì
      order: {
        lessons: { order: 'ASC' }, // Sắp xếp bài học bên trong
      },
    });
    if (!session) {
      throw new NotFoundException(`Không tìm thấy chương với ID #${id}`);
    }
    return session;
  }

  // SỬA: Thay `any` bằng `UpdateSessionDto`
  async update(
    id: string,
    updateSessionDto: UpdateSessionDto,
  ): Promise<Session> {
    const session = await this.sessionRepository.preload({
      id,
      ...updateSessionDto,
    });
    if (!session) {
      throw new NotFoundException(`Không tìm thấy chương với ID #${id}`);
    }
    return this.sessionRepository.save(session);
  }

  async remove(id: string): Promise<Session> {
    const session = await this.findOne(id);
    // Lưu ý: Nếu Database chưa set ON DELETE CASCADE,
    // lệnh này sẽ lỗi nếu Session đang chứa Lesson.
    // Hãy đảm bảo entity Session có @OneToMany(..., { cascade: true })
    return this.sessionRepository.remove(session);
  }
}
