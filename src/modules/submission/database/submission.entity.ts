import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { User } from 'src/modules/auth/database/user.entity';
import { LessonItem } from 'src/modules/lessons/database/lesson-item.entity';
import { Class } from 'src/modules/classes/database/class.entity'; // 👈 Import Class

export enum SubmissionStatus {
  PENDING = 'pending',
  REVIEWED = 'reviewed',
  REJECTED = 'rejected',
  APPROVED = 'approved',
}

@Entity('submissions')
// 👇 QUAN TRỌNG: Khóa unique bao gồm student + lessonItem + class
// Giúp học viên có thể nộp lại bài này ở lớp khác (học lại)
@Unique(['studentId', 'lessonItemId', 'classId'])
export class Submission {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  studentId: string;

  @Column({ type: 'uuid' })
  lessonItemId: string;

  // 👇 THÊM CỘT NÀY
  @Column({ type: 'uuid', nullable: true })
  classId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'studentId' })
  student: User;

  @ManyToOne(() => LessonItem, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'lessonItemId' })
  lessonItem: LessonItem;

  // 👇 THÊM RELATION NÀY
  @ManyToOne(() => Class, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'classId' })
  class: Class;

  @Column({ type: 'text' })
  gitLink: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({
    type: 'enum',
    enum: SubmissionStatus,
    default: SubmissionStatus.PENDING,
  })
  status: SubmissionStatus;

  @Column({ type: 'text', nullable: true })
  feedback?: string;

  @Column({ type: 'decimal', precision: 4, scale: 2, nullable: true })
  score: number;

  @Column({ type: 'uuid', nullable: true })
  reviewerId?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
