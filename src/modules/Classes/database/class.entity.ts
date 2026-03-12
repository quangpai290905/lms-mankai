import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { Course } from '../../courses/database/courses.entity';
import { User } from 'src/modules/auth/database/user.entity';
import { Enrollment } from './enrollment.entity';

export enum ClassStatus {
  PENDING = 'Pending',
  ACTIVE = 'Active',
  FINISHED = 'Finished',
  CANCELED = 'Canceled',
}

@Entity('classes')
export class Class {
  @PrimaryGeneratedColumn('uuid')
  class_id: string;

  @Column({ unique: true })
  code: string;

  @Column()
  name: string;

  @Column({ type: 'date', nullable: true })
  start_date: Date;

  @Column({ type: 'date', nullable: true })
  end_date: Date;

  @Column({ type: 'enum', enum: ClassStatus, default: ClassStatus.PENDING })
  status: ClassStatus;

  // Quan hệ nhiều-nhiều với Course
  @ManyToMany(() => Course, (course) => course.classes)
  @JoinTable({ name: 'class_courses' })
  courses: Course[];

  // Quan hệ nhiều-nhiều với User (giáo viên)
  @ManyToMany(() => User)
  @JoinTable({ name: 'class_teachers' })
  teachers: User[];

  // Quan hệ 1-nhiều với Enrollment
  @OneToMany(() => Enrollment, (enrollment) => enrollment.class)
  enrollments: Enrollment[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
