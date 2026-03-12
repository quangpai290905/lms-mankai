import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString, IsNumber } from 'class-validator';

export class UpdateQuestionDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  question_text?: string;

  @ApiPropertyOptional() @IsOptional() @IsString() option_a?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() option_b?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() option_c?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() option_d?: string;

  @ApiPropertyOptional({
    example: 'a',
    description: "Đáp án đúng, phải là 'a', 'b', 'c', hoặc 'd'",
  })
  @IsOptional()
  @IsString()
  @IsIn(['a', 'b', 'c', 'd'])
  correct_answer?: string;

  @ApiPropertyOptional({ description: 'Thứ tự của câu hỏi' })
  @IsOptional()
  @IsNumber()
  order_index?: number;
}
