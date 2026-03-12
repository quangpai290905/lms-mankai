import {
  IsOptional,
  IsString,
  IsInt,
  Min,
  Max,
  IsEnum,
  IsUUID,
} from 'class-validator';
import { Type } from 'class-transformer';
import { SubmissionStatus } from '../../database/submission.entity';

export class SearchSubmissionDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  studentId?: string;

  // 👇 Thêm filter theo lớp
  @IsOptional()
  @IsUUID()
  classId?: string;

  @IsOptional()
  @IsString()
  gitLink?: string;

  @IsOptional()
  @IsEnum(SubmissionStatus)
  status?: SubmissionStatus;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @IsOptional()
  @IsString()
  lessonItemId?: string;
}
