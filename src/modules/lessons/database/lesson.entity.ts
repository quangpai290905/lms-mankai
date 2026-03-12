import { Session } from '../../sessions/database/session.entity';
import { LessonItem } from './lesson-item.entity'; // <-- Import mới
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('lessons')
export class Lesson {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ type: 'int', default: 0 })
  duration: number; // Tổng thời lượng (tự tính hoặc nhập)

  @Column({ type: 'int', default: 0 })
  order: number;

  @ManyToOne(() => Session, (session) => session.lessons, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'session_id' })
  session: Session;

  // 👇 QUAN HỆ MỚI
  @OneToMany(() => LessonItem, (item) => item.lesson)
  items: LessonItem[];

  // ❌ NẾU CÓ QUAN HỆ QUIZ Ở ĐÂY THÌ XÓA LUÔN (vì quiz giờ link qua items)
  // @OneToMany(() => Quiz, (quiz) => quiz.lesson)
  // quizzes: Quiz[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
