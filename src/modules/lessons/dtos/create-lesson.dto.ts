import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  IsNumber,
} from 'class-validator';

export class CreateLessonDto {
  @ApiProperty({
    description: 'Tiêu đề của bài học',
    example: 'Bài 1: Giới thiệu',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ description: 'Thứ tự hiển thị', required: false, example: 1 })
  @IsNumber()
  @IsOptional()
  order?: number;

  @ApiProperty({ description: 'ID của chương học', example: 'uuid-session' })
  @IsUUID()
  @IsNotEmpty()
  sessionId: string;

  // ❌ ĐÃ XÓA type
}
