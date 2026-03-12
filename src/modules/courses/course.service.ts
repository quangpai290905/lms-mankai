import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateCourseDto } from './dtos/create-course.dto';
import { UpdateCourseDto } from './dtos/update-course.dto';
import { Course } from './database/courses.entity';

@Injectable()
export class CoursesService {
  constructor(
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
  ) {}

  // 1. TẠO KHÓA HỌC
  async create(createCourseDto: CreateCourseDto): Promise<Course> {
    const course = this.courseRepository.create(createCourseDto);
    return this.courseRepository.save(course);
  }

  // 2. LẤY DANH SÁCH KHÓA HỌC (PHÂN TRANG)
  findAll(paginationOptions: {
    page: number;
    limit: number;
  }): Promise<Course[]> {
    const { page, limit } = paginationOptions;

    return this.courseRepository.find({
      take: limit,
      skip: (page - 1) * limit,
      relations: ['classes'], // ⬅ KHÓA HỌC THUỘC NHỮNG LỚP NÀO
      order: { createdAt: 'DESC' },
    });
  }

  // 3. LẤY CHI TIẾT KHÓA HỌC
  async findOne(id: string): Promise<Course> {
    const course = await this.courseRepository.findOne({
      where: { id },
      relations: [
        'classes', // ⬅ Lớp chứa khóa học
        'sessions',
        'sessions.lessons',
        'sessions.lessons.items',
      ],
      order: {
        sessions: {
          order: 'ASC',
          createdAt: 'ASC',
          lessons: {
            order: 'ASC',
            createdAt: 'ASC',
            items: {
              orderIndex: 'ASC',
            },
          },
        },
      },
    });

    if (!course) {
      throw new NotFoundException(`Không tìm thấy khóa học với ID #${id}`);
    }
    return course;
  }

  // 4. UPDATE
  async update(id: string, updateCourseDto: UpdateCourseDto): Promise<Course> {
    const updatedCourse = await this.courseRepository.preload({
      id,
      ...updateCourseDto,
    });

    if (!updatedCourse) {
      throw new NotFoundException(`Không tìm thấy khóa học với ID #${id}`);
    }

    return this.courseRepository.save(updatedCourse);
  }

  // 5. XÓA KHÓA HỌC
  async remove(id: string): Promise<Course> {
    const course = await this.findOne(id);
    return this.courseRepository.remove(course);
  }

  // 6. LẤY TOÀN BỘ CHƯƠNG TRÌNH HỌC (FULL CURRICULUM)
  async findFullCurriculum(id: string) {
    const course = await this.courseRepository.findOne({
      where: { id },
      relations: ['sessions', 'sessions.lessons', 'sessions.lessons.items'],
      order: {
        sessions: {
          order: 'ASC',
          createdAt: 'ASC',
          lessons: {
            order: 'ASC',
            createdAt: 'ASC',
            items: {
              orderIndex: 'ASC',
            },
          },
        },
      },
    });

    if (!course) {
      throw new NotFoundException(`Không tìm thấy khóa học #${id}`);
    }

    return course.sessions;
  }
}
