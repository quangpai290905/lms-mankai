import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Quiz } from './quiz.entity';
import { QuizQuestion } from './quiz-question.entity';

@Entity('quiz_question_assignments')
@Index(['quiz', 'question'], { unique: true }) // Đảm bảo 1 câu hỏi chỉ được thêm 1 lần vào 1 quiz
export class QuizQuestionAssignment {
  @PrimaryGeneratedColumn('uuid')
  assignment_id: string;

  @ManyToOne(() => Quiz, (quiz) => quiz.questionAssignments, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'quiz_id' })
  quiz: Quiz;

  @ManyToOne(() => QuizQuestion, (question) => question.assignments, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'question_id' })
  question: QuizQuestion;

  @Column({ type: 'int', default: 0 })
  order_index: number;
}
