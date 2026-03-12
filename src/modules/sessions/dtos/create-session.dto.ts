// src/modules/sessions/dtos/create-session.dto.ts
import { ApiProperty } from '@nestjs/swagger'; // <-- Import decorator
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  IsNumber,
} from 'class-validator';

export class CreateSessionDto {
  @ApiProperty({
    description: 'Tiêu đề của chương học',
    example: 'Chương 1: Bắt đầu với NestJS',
  })
  @IsString()
  @IsNotEmpty({ message: 'Tiêu đề không được để trống' })
  title: string;

  @ApiProperty({
    description: 'Thứ tự hiển thị của chương học',
    required: false, // Quan trọng khi dùng @IsOptional
    example: 1,
  })
  @IsNumber()
  @IsOptional()
  order?: number;

  @ApiProperty({
    description: 'ID của khóa học mà chương này thuộc về',
    example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
  })
  @IsUUID()
  @IsNotEmpty({ message: 'courseId không được để trống' })
  courseId: string;
}
