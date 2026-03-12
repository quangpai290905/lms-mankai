import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { QuizResult } from './quiz-result.entity';
import { QuizQuestionAssignment } from './quiz-question-assignment.entity';

@Entity('quizzes')
export class Quiz {
  @PrimaryGeneratedColumn('uuid')
  quiz_id: string;

  @Column({ length: 200 })
  title: string;

  @Column()
  duration: number;

  @OneToMany(() => QuizQuestionAssignment, (assignment) => assignment.quiz)
  questionAssignments: QuizQuestionAssignment[];

  @OneToMany(() => QuizResult, (result) => result.quiz)
  results: QuizResult[];

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;
}
