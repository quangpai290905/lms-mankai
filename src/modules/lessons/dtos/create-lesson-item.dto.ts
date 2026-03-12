import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  IsNumber,
} from 'class-validator';
import { LessonItemType } from '../database/lesson-item.entity';

export class CreateLessonItemDto {
  @ApiProperty({ enum: LessonItemType, example: LessonItemType.VIDEO })
  @IsEnum(LessonItemType)
  @IsNotEmpty()
  type: LessonItemType;

  @ApiProperty({ description: 'Thứ tự trong bài học', example: 1 })
  @IsNumber()
  @IsOptional()
  orderIndex?: number;

  @ApiProperty({ description: 'Tiêu đề phụ', required: false })
  @IsString()
  @IsOptional()
  title?: string;

  // --- Dành cho Video ---
  @ApiProperty({ description: 'URL Video (Youtube)', required: false })
  @IsString()
  @IsOptional()
  videoUrl?: string;

  // --- Dành cho Text / Essay ---
  @ApiProperty({
    description: 'Nội dung HTML hoặc Đề bài luận',
    required: false,
  })
  @IsString()
  @IsOptional()
  textContent?: string;

  // --- Dành cho Quiz ---
  @ApiProperty({ description: 'ID của Quiz (đã tạo trước)', required: false })
  @IsUUID()
  @IsOptional()
  quizId?: string;
}
