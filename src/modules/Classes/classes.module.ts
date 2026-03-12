// ✅ src/modules/classes/classes.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClassesService } from './classes.service';
import { ClassesController } from './classes.controller';
import { Class } from './database/class.entity';
import { Course } from '../courses/database/courses.entity';
import { User } from '../auth/database/user.entity';
import { Enrollment } from './database/enrollment.entity'; // 👈 Import mới

@Module({
  imports: [
    // 👇 Thêm Enrollment vào mảng này
    TypeOrmModule.forFeature([Class, Course, User, Enrollment]),
  ],
  controllers: [ClassesController],
  providers: [ClassesService],
})
export class ClassesModule {}
