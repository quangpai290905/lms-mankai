import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  Column,
  Index,
  RelationId,
} from 'typeorm';
import { Class } from './class.entity';
import { User } from 'src/modules/auth/database/user.entity';

@Entity('enrollments')
@Index(['class', 'student'], { unique: true }) // 1 học viên không được vào 1 lớp 2 lần
export class Enrollment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Class, (cls) => cls.enrollments, {
    onDelete: 'CASCADE',
    eager: false,
  })
  @JoinColumn({ name: 'class_id' })
  class: Class;

  @RelationId((enrollment: Enrollment) => enrollment.class)
  class_id: string;

  @ManyToOne(() => User, (user) => user.enrollments, {
    onDelete: 'CASCADE',
    eager: false,
  })
  @JoinColumn({ name: 'student_id' })
  student: User;

  @RelationId((enrollment: Enrollment) => enrollment.student)
  student_id: string;

  @Column({ type: 'float', default: 0 })
  progress: number;

  @CreateDateColumn()
  joined_at: Date;
}
