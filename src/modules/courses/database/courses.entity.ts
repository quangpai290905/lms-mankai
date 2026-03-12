import { Session } from '../../sessions/database/session.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  ManyToMany,
} from 'typeorm';
import { Class } from '../../temp_classes/database/class.entity';

export enum CourseLevel {
  BEGINNER = 'Beginner',
  INTERMEDIATE = 'Intermediate',
  ADVANCED = 'Advanced',
  ALL_LEVELS = 'All Levels',
}

@Entity('courses')
export class Course {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0.0 })
  price: number;

  @Column({ nullable: true })
  thumbnail: string;

  @Column({
    type: 'enum',
    enum: CourseLevel,
    default: CourseLevel.ALL_LEVELS,
  })
  level: CourseLevel;

  // Quan hệ ngược với Classes (để many-to-many hoạt động đúng)
  @ManyToMany(() => Class, (cls) => cls.courses)
  classes: Class[];

  // Quan hệ Session (1 course có nhiều session)
  @OneToMany(() => Session, (session) => session.course)
  sessions: Session[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
