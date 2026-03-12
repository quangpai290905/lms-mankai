import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LessonsService } from './lessons.service';
import { LessonsController } from './lessons.controller';
import { Lesson } from './database/lesson.entity';
import { Session } from '../sessions/database/session.entity';
import { LessonItem } from './database/lesson-item.entity'; // 👈 Import Entity
import { Quiz } from '../quizzes/database/quiz.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Lesson, Session, LessonItem, Quiz])],
  controllers: [LessonsController],
  providers: [LessonsService],
  // 🔥 QUAN TRỌNG: Export TypeOrmModule để module khác dùng được Repository của LessonItem
  exports: [TypeOrmModule, LessonsService],
})
export class LessonsModule {}
