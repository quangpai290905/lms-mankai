import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LessonProgress } from './database/lesson-progress.entity';
import { ProgressService } from './progress.service';
import { ProgressController } from './progress.controller';
// 👇 Import Module bài học
import { LessonsModule } from '../lessons/lessons.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([LessonProgress]),
    LessonsModule, // 👈 THÊM VÀO ĐÂY
  ],
  providers: [ProgressService],
  controllers: [ProgressController],
  exports: [ProgressService],
})
export class ProgressModule {}
