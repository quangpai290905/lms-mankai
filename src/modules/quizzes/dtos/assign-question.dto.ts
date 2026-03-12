// assign-question.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsUUID,
  IsNumber,
  IsOptional,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class AssignmentItemDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsUUID()
  question_id: string;

  @ApiProperty({ default: 0 })
  @IsOptional()
  @IsNumber()
  order_index: number;
}

export class AssignQuestionDto {
  @ApiProperty({
    type: [AssignmentItemDto],
    description: 'Mảng các câu hỏi cần gán',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AssignmentItemDto)
  assignments: AssignmentItemDto[];
}
