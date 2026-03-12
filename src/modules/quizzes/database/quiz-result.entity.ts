import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from '../../auth/database/user.entity';
import { Quiz } from './quiz.entity';
// 👇 Import LessonItem
import { LessonItem } from '../../lessons/database/lesson-item.entity';

@Entity('quiz_results')
export class QuizResult {
  @PrimaryGeneratedColumn('uuid')
  result_id: string;

  @Index()
  @Column({ type: 'uuid' })
  quiz_id: string;

  @Index()
  @Column()
  user_id: string;

  @Index()
  @Column({ type: 'uuid', nullable: true })
  lesson_item_id: string;

  @Column('decimal', { precision: 5, scale: 2 })
  score: number;

  @CreateDateColumn()
  submitted_at: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Quiz, (quiz) => quiz.results)
  @JoinColumn({ name: 'quiz_id' })
  quiz: Quiz;

  // 👇 THÊM RELATION (Optional)
  @ManyToOne(() => LessonItem)
  @JoinColumn({ name: 'lesson_item_id' })
  lessonItem: LessonItem;
}
