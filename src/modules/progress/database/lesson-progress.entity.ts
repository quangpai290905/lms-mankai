import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  Unique,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  JoinColumn,
} from 'typeorm';
import { User } from 'src/modules/auth/database/user.entity';

export enum LessonStatus {
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
}

@Entity()
@Unique(['userId', 'lessonItemId', 'classId'])
export class LessonProgress {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' }) // 👈 Thêm dòng này: Map relation vào cột userId ở trên
  user: User;

  @Column({ type: 'uuid' })
  @Index()
  courseId: string;

  @Column({ type: 'uuid' })
  @Index()
  sessionId: string;

  @Column({ type: 'uuid' })
  @Index()
  lessonId: string;

  @Column({ type: 'uuid' })
  @Index()
  lessonItemId: string;

  @Column({ type: 'uuid', nullable: true })
  @Index()
  classId: string;

  @Column({
    type: 'enum',
    enum: LessonStatus,
    default: LessonStatus.IN_PROGRESS,
  })
  status: LessonStatus;

  @Column({ type: 'int', default: 0 })
  percentage: number;

  @Column({ type: 'int', nullable: true })
  lastPosition: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
