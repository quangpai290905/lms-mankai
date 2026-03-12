// src/modules/users/dtos/response/student-courses-response.dto.ts
import { Course } from '../../../courses/database/courses.entity';
import { ApiProperty } from '@nestjs/swagger';

export class CourseDto {
  @ApiProperty({ example: 'c1a2b3', description: 'ID khóa học' })
  id: string;

  @ApiProperty({ example: 'Tiếng Anh cơ bản', description: 'Tên khóa học' })
  title: string;

  @ApiProperty({
    example: 'Khóa học dành cho người mới bắt đầu',
    description: 'Mô tả khóa học',
    nullable: true,
  })
  description?: string;

  @ApiProperty({ example: 0, description: 'Giá khóa học' })
  price: number;

  @ApiProperty({
    example: 'https://...',
    description: 'Thumbnail',
    nullable: true,
  })
  thumbnail?: string;

  @ApiProperty({ example: 'Beginner', description: 'Level khóa học' })
  level: string;
}

export class StudentCoursesResponseDto {
  @ApiProperty({
    type: [CourseDto],
    description: 'Danh sách khóa học của học viên',
  })
  courses: CourseDto[];

  constructor(courses: Course[]) {
    this.courses = courses.map((course) => ({
      id: course.id,
      title: course.title,
      description: course.description,
      price: Number(course.price),
      thumbnail: course.thumbnail,
      level: course.level,
    }));
  }
}
