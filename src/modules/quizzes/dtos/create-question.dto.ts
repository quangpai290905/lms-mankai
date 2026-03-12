import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsIn,
  IsNotEmpty,
  IsString,
  IsOptional,
  IsNumber,
} from 'class-validator';

export class CreateQuestionDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  question_text: string;

  @ApiProperty() @IsNotEmpty() @IsString() option_a: string;
  @ApiProperty() @IsNotEmpty() @IsString() option_b: string;
  @ApiProperty() @IsNotEmpty() @IsString() option_c: string;
  @ApiProperty() @IsNotEmpty() @IsString() option_d: string;

  @ApiProperty({
    example: 'a',
    description: "Đáp án đúng, phải là 'a', 'b', 'c', hoặc 'd'",
  })
  @IsNotEmpty()
  @IsString()
  @IsIn(['a', 'b', 'c', 'd'])
  correct_answer: string;

  @ApiPropertyOptional({ description: 'Thứ tự của câu hỏi', default: 0 })
  @IsOptional()
  @IsNumber()
  order_index?: number;
}
