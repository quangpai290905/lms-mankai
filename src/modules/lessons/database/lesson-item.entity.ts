import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Lesson } from './lesson.entity';
import { Quiz } from '../../quizzes/database/quiz.entity';

export enum LessonItemType {
  VIDEO = 'Video',
  TEXT = 'Text',
  QUIZ = 'Quiz',
  ESSAY = 'Essay',
}

@Entity('lesson_items')
export class LessonItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: LessonItemType })
  type: LessonItemType;

  @Column({ type: 'int', default: 1 })
  orderIndex: number;

  @Column({ nullable: true })
  title: string; // Tiêu đề phụ cho phần nội dung này (nếu cần)

  // --- DỮ LIỆU CHO VIDEO ---
  @Column({ nullable: true })
  videoUrl: string; // URL YouTube/Vimeo

  @Column({ nullable: true })
  duration: number; // Thời lượng (giây)

  // --- DỮ LIỆU CHO TEXT & ESSAY ---
  @Column({ type: 'text', nullable: true })
  textContent: string; // HTML content hoặc Đề bài luận

  // --- DỮ LIỆU CHO QUIZ ---
  @Column({ type: 'uuid', nullable: true })
  resource_quiz_id: string;

  @ManyToOne(() => Quiz, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'resource_quiz_id' })
  quiz: Quiz;

  // --- LIÊN KẾT VỚI LESSON ---
  @ManyToOne(() => Lesson, (lesson) => lesson.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'lesson_id' })
  lesson: Lesson;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
