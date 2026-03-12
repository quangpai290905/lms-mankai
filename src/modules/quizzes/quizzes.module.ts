import { Module } from '@nestjs/common';
import { QuizzesService } from './quizzes.service';
import { QuizzesController } from './quizzes.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Quiz } from './database/quiz.entity';
import { QuizQuestion } from './database/quiz-question.entity';
import { QuizResult } from './database/quiz-result.entity';
import { AuthModule } from '../auth/auth.module';
import { QuizQuestionAssignment } from './database/quiz-question-assignment.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Quiz,
      QuizQuestion,
      QuizResult,
      QuizQuestionAssignment,
    ]),
    AuthModule,
  ],
  controllers: [QuizzesController],
  providers: [QuizzesService],
})
export class QuizzesModule {}
