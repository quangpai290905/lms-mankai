import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubmissionController } from './submission.controller';
import { SubmissionService } from './submission.service';
import { SubmissionRepository } from './repositories/submission.repository';
import { Submission } from './database/submission.entity';
import { LessonItem } from '../lessons/database/lesson-item.entity';
import { Class } from '../temp_classes/database/class.entity'; // 👈 Import Class

@Module({
  imports: [
    // 👇 THÊM Class VÀO ĐÂY
    TypeOrmModule.forFeature([Submission, LessonItem, Class]),
  ],
  controllers: [SubmissionController],
  providers: [SubmissionService, SubmissionRepository],
  exports: [SubmissionService, SubmissionRepository],
})
export class SubmissionModule {}
