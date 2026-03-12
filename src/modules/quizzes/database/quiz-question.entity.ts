import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  Index,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { QuizQuestionAssignment } from './quiz-question-assignment.entity';
import { QuestionType } from 'src/constant/enum';

@Entity('quiz_questions')
export class QuizQuestion {
  @PrimaryGeneratedColumn('uuid')
  question_id: string;

  @Column('text')
  question_text: string;

  @Index()
  @Column({ length: 100, nullable: true })
  category: string;

  @Column({
    type: 'enum',
    enum: QuestionType,
    default: QuestionType.MULTIPLE_CHOICE,
  })
  type: QuestionType;

  @Column({ type: 'json' })
  answers: any;

  @OneToMany(() => QuizQuestionAssignment, (assignment) => assignment.question)
  assignments: QuizQuestionAssignment[];

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;
}
