// src/modules/classes/classes.service.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm'; // [Cập nhật] Đảm bảo đã import In
import { Class, ClassStatus } from './database/class.entity'; // [Cập nhật] Import thêm ClassStatus
import { CreateClassDto } from './dtos/create-class.dto';
import { UpdateClassDto } from './dtos/update-class.dto';
import { Course } from '../courses/database/courses.entity';
import { User } from '../auth/database/user.entity';
import { Enrollment } from './database/enrollment.entity';
import { UserRole } from 'src/constant/enum';

@Injectable()
export class ClassesService {
  constructor(
    @InjectRepository(Class) private classRepo: Repository<Class>,
    @InjectRepository(Course) private courseRepo: Repository<Course>,
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Enrollment)
    private enrollmentRepo: Repository<Enrollment>,
  ) {}

  // 1. CREATE
  async create(dto: CreateClassDto): Promise<Class> {
    let courses = [];
    let teachers = [];

    if (dto.courseIds && dto.courseIds.length > 0) {
      courses = await this.courseRepo.findBy({
        id: In(dto.courseIds),
      });
      if (courses.length !== dto.courseIds.length) {
        throw new NotFoundException('Một số khóa học không tồn tại');
      }
    }

    if (dto.teacherIds && dto.teacherIds.length > 0) {
      teachers = await this.userRepo.findBy({
        user_id: In(dto.teacherIds),
      });
      if (teachers.length !== dto.teacherIds.length) {
        throw new NotFoundException('Một số giảng viên không tồn tại');
      }
    }

    const existing = await this.classRepo.findOneBy({ code: dto.code });
    if (existing)
      throw new BadRequestException(`Class Code '${dto.code}' already exists`);

    const newClass = this.classRepo.create({
      ...dto,
      courses,
      teachers,
    });
    return this.classRepo.save(newClass);
  }

  // 2. FIND ALL
  async findAll(currentUser: any): Promise<any[]> {
    const query = this.classRepo
      .createQueryBuilder('class')
      .leftJoinAndSelect('class.courses', 'courses')
      .leftJoinAndSelect('class.teachers', 'teachers')
      .loadRelationCountAndMap('class.total_students', 'class.enrollments')
      .orderBy('class.created_at', 'DESC');

    if (currentUser.role === UserRole.TEACHER) {
      query.where('teachers.user_id = :teacherId', {
        teacherId: currentUser.user_id,
      });
    }
    return query.getMany();
  }

  // 3. FIND ONE
  async findOne(id: string): Promise<Class> {
    const classInfo = await this.classRepo.findOne({
      where: { class_id: id },
      relations: ['courses', 'teachers'],
    });
    if (!classInfo) throw new NotFoundException('Class not found');
    return classInfo;
  }

  // 4. UPDATE
  async update(id: string, dto: UpdateClassDto): Promise<Class> {
    const existingClass = await this.classRepo.findOne({
      where: { class_id: id },
      relations: ['courses', 'teachers'],
    });
    if (!existingClass) throw new NotFoundException('Class not found');

    if (dto.courseIds) {
      if (dto.courseIds.length > 0) {
        const courses = await this.courseRepo.findBy({ id: In(dto.courseIds) });
        if (courses.length !== dto.courseIds.length)
          throw new NotFoundException('Khóa học không tồn tại');
        existingClass.courses = courses;
      } else {
        existingClass.courses = [];
      }
    }

    if (dto.teacherIds) {
      if (dto.teacherIds.length > 0) {
        const teachers = await this.userRepo.findBy({
          user_id: In(dto.teacherIds),
        });
        if (teachers.length !== dto.teacherIds.length)
          throw new NotFoundException('Giảng viên không tồn tại');
        existingClass.teachers = teachers;
      } else {
        existingClass.teachers = [];
      }
    }

    const { courseIds, teacherIds, ...simpleFields } = dto;
    Object.assign(existingClass, simpleFields);

    return this.classRepo.save(existingClass);
  }

  // 5. REMOVE
  async remove(id: string): Promise<void> {
    const result = await this.classRepo.delete(id);
    if (result.affected === 0) throw new NotFoundException('Class not found');
  }

  // =================================================================
  // 👇 [QUAN TRỌNG] PHẦN ĐÃ SỬA ĐỔI LOGIC TẠI ĐÂY
  // =================================================================
  async addStudentToClass(classId: string, studentId: string) {
    // 1. Kiểm tra lớp học tồn tại
    const classInfo = await this.classRepo.findOneBy({ class_id: classId });
    if (!classInfo) throw new NotFoundException('Class not found');

    // 2. Kiểm tra học sinh tồn tại
    const student = await this.userRepo.findOneBy({ user_id: studentId });
    if (!student) throw new NotFoundException('Student not found');

    // 3. [MỚI] Tìm xem học sinh này có đang trong bất kỳ lớp nào chưa kết thúc không?
    // (Status là PENDING hoặc ACTIVE)
    const busyEnrollment = await this.enrollmentRepo.findOne({
      where: {
        student: { user_id: studentId },
        class: {
          status: In([ClassStatus.PENDING, ClassStatus.ACTIVE]),
        },
      },
      relations: ['class'], // Join bảng class để lấy status và tên lớp
    });

    // 4. Xử lý logic chặn
    if (busyEnrollment) {
      // Trường hợp 1: Đang học chính lớp này -> Báo đã tham gia
      if (busyEnrollment.class.class_id === classId) {
        throw new ConflictException('Học viên đã có trong lớp học này rồi');
      }

      // Trường hợp 2: Đang học lớp khác -> Báo bận
      throw new ConflictException(
        `Học viên đang theo học lớp '${busyEnrollment.class.name}' (Trạng thái: ${busyEnrollment.class.status}). Không thể tham gia lớp mới lúc này.`,
      );
    }

    // 5. Nếu rảnh rỗi thì cho tạo mới
    const enrollment = this.enrollmentRepo.create({
      class: classInfo,
      student: student,
    });
    return this.enrollmentRepo.save(enrollment);
  }
  // =================================================================

  async getStudentsByClass(classId: string) {
    const enrollments = await this.enrollmentRepo.find({
      where: { class: { class_id: classId } },
      relations: ['student'],
      order: { joined_at: 'DESC' },
    });

    return enrollments.map((e) => ({
      enrollment_id: e.id,
      student_id: e.student.user_id,
      full_name: e.student.full_name,
      email: e.student.email,
      avatar: e.student.avatar,
      joined_at: e.joined_at,
      phone: e.student.phone,
      address: e.student.address,
      gender: e.student.gender,
      student_code: e.student.student_code,
      dateOfBirth: e.student.dateOfBirth,
    }));
  }

  async removeStudentFromClass(
    classId: string,
    studentId: string,
  ): Promise<void> {
    const enrollment = await this.enrollmentRepo.findOne({
      where: {
        class: { class_id: classId },
        student: { user_id: studentId },
      },
    });
    if (!enrollment)
      throw new NotFoundException('Học viên không có trong lớp này');
    await this.enrollmentRepo.remove(enrollment);
  }

  async findMyClasses(userId: string) {
    // 1. Tìm các enrollment của user này
    const enrollments = await this.enrollmentRepo.find({
      where: { student: { user_id: userId } },
      relations: ['class', 'class.courses'], // Join để lấy thông tin Lớp và Khóa học
    });

    // 2. Flatten dữ liệu: { courseId, classId }
    // Mục đích: Để Frontend dễ dàng map (Course A -> Class 1)
    const result = [];
    enrollments.forEach((enrol) => {
      if (enrol.class && enrol.class.courses) {
        enrol.class.courses.forEach((course) => {
          result.push({
            courseId: course.id,
            classId: enrol.class.class_id,
            className: enrol.class.name,
            classStatus: enrol.class.status,
          });
        });
      }
    });

    return result;
  }
}
