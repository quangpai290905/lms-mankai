import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StudentController } from './controllers/student.controller';
import { StudentService } from './services/student.service';
import { StudentRepository } from './repositories/student.repository';
import { User } from '../auth/database/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [StudentController],
  providers: [StudentService, StudentRepository],
  exports: [StudentService, StudentRepository],
})
export class StudentModule {}
