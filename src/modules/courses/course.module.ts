import { Module } from '@nestjs/common';
import { CoursesService } from './course.service';
import { CoursesController } from './course.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Course } from './database/courses.entity';
import { Class } from '../classes/database/class.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Course, Class])],
  controllers: [CoursesController],
  providers: [CoursesService],
})
export class CoursesModule {}
