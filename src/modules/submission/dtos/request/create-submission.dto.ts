// src/modules/submissions/dtos/request/create-submission.dto.ts
import {
  IsString,
  IsUrl,
  IsOptional,
  IsUUID,
  IsNotEmpty,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSubmissionDto {
  @ApiProperty({
    description: 'ID của bài tập (Lesson Item ID)',
    example: 'uuid-...',
  })
  @IsNotEmpty()
  @IsUUID()
  lessonItemId: string;

  // 👇 THÊM TRƯỜNG NÀY
  @ApiProperty({
    description: 'ID của lớp học hiện tại',
    example: 'uuid-class',
  })
  @IsNotEmpty()
  @IsUUID()
  classId: string;

  @ApiProperty({ example: 'https://github.com/...' })
  @IsUrl({}, { message: 'Link Git không hợp lệ' })
  gitLink: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;
}
