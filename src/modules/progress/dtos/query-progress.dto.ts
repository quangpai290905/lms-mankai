import { IsOptional, IsUUID } from 'class-validator';

export class QueryLessonProgressDto {
  @IsUUID()
  userId: string;

  @IsOptional()
  @IsUUID()
  courseId?: string;

  @IsOptional()
  @IsUUID()
  sessionId?: string;

  @IsOptional()
  @IsUUID()
  lessonId?: string;

  @IsOptional()
  @IsUUID()
  lessonItemId?: string;

  @IsOptional()
  @IsUUID()
  classId?: string;
}
