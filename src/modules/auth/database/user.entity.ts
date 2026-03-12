import { Exclude } from 'class-transformer';
import { UserRole } from 'src/constant/enum';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToMany,
} from 'typeorm';
import { Enrollment } from '../../classes/database/enrollment.entity';
import { Class } from '../../classes/database/class.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  user_id: string;

  @Column({ length: 20, nullable: true, unique: true })
  student_code: string;

  @Column({ length: 100 })
  full_name: string;

  @Column({ length: 100, unique: true })
  email: string;

  @Column({ length: 255 })
  @Exclude()
  password: string;

  @Column({ length: 20, nullable: true })
  phone: string;

  @Column({ type: 'text', nullable: true })
  address?: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.STUDENT })
  role: UserRole;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'date', nullable: true })
  dateOfBirth?: Date;

  @Column({ nullable: true })
  gender?: string;

  @Column({ length: 255, nullable: true })
  avatar: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @Column({ nullable: true })
  @Exclude()
  hashed_refresh_token: string;

  // Học viên → Enrollment
  @OneToMany(() => Enrollment, (enrollment) => enrollment.student)
  enrollments: Enrollment[];

  // Giáo viên → các lớp đang dạy
  @ManyToMany(() => Class, (cls) => cls.teachers)
  teaching_classes: Class[];
}
