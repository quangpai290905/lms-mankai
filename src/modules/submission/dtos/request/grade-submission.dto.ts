// File: src/modules/submission/dtos/request/grade-submission.dto.ts
import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SubmissionStatus } from '../../database/submission.entity';

export class GradeSubmissionDto {
  @ApiProperty({ enum: SubmissionStatus, description: 'Trạng thái bài nộp' })
  @IsOptional() // <--- THÊM DÒNG NÀY: Để tránh lỗi nếu lỡ gửi thiếu status
  @IsEnum(SubmissionStatus)
  status?: SubmissionStatus;

  @ApiPropertyOptional({ description: 'Điểm số (0-100)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  score?: number;

  @ApiPropertyOptional({ description: 'Nhận xét của giáo viên' })
  @IsOptional()
  @IsString()
  feedback?: string;
}
