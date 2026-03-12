import { ApiProperty } from '@nestjs/swagger';
import { IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateStudentDto } from './create-student.dto';

export class CreateStudentBulkDto {
  @ApiProperty({
    type: [CreateStudentDto],
    description: 'Danh sách sinh viên cần tạo',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateStudentDto)
  students: CreateStudentDto[];
}
