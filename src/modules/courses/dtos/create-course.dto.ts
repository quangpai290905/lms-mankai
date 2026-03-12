import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsNumber,
  Min,
} from 'class-validator';
import { CourseLevel } from '../database/courses.entity';

export class CreateCourseDto {
  @ApiProperty({
    description: 'Tên của khóa học',
    example: 'Lập trình NestJS từ A đến Z',
  })
  @IsString()
  @IsNotEmpty({ message: 'Tiêu đề không được để trống' })
  title: string;

  @ApiProperty({
    description: 'Mô tả chi tiết về nội dung khóa học',
    required: false,
    example: 'Khóa học này sẽ giúp bạn thành thạo NestJS trong 1 tháng.',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Link ảnh đại diện khóa học',
    required: false,
    example: 'https://example.com/thumbnail.jpg',
  })
  @IsString()
  @IsOptional()
  thumbnail?: string;

  @ApiProperty({
    description: 'Giá của khóa học',
    required: false,
    example: 499000,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  price?: number;

  @ApiProperty({
    description: 'Trình độ yêu cầu',
    required: false,
    enum: CourseLevel,
    example: CourseLevel.BEGINNER,
  })
  @IsEnum(CourseLevel)
  @IsOptional()
  level?: CourseLevel;

  // Đã xóa instructorId
}
