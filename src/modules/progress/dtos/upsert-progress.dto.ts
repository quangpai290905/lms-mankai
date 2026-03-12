import { IsInt, IsOptional, IsEnum, Min, Max, IsUUID } from 'class-validator';
import { LessonStatus } from '../database/lesson-progress.entity';

export class UpsertLessonProgressDto {
  @IsUUID()
  userId: string;

  @IsUUID()
  courseId: string;

  @IsUUID()
  sessionId: string;

  @IsUUID()
  lessonId: string;

  @IsUUID()
  lessonItemId: string;

  @IsOptional()
  @IsUUID()
  classId?: string;

  @IsOptional()
  @IsEnum(LessonStatus)
  status?: LessonStatus;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  percentage?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  lastPosition?: number;
}
