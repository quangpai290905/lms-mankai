import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
  IsArray,
  IsBoolean,
  IsNumber,
} from 'class-validator';

import { QuestionType } from 'src/constant/enum';

class MultiAnswerDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  answer: string;

  @ApiProperty()
  @IsBoolean()
  isCorrect: boolean;
}

class FillInBlankAnswerDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  answer: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  index: number;
}

export class CreateBankQuestionDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  question_text: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  category?: string;

  @ApiProperty({ enum: QuestionType, default: QuestionType.MULTIPLE_CHOICE })
  @IsNotEmpty()
  @IsEnum(QuestionType)
  type: QuestionType;

  @ApiProperty({
    description: 'Danh sách đáp án, cấu trúc phụ thuộc vào type',
    example: [
      { answer: 'Đáp án A', isCorrect: true },
      { answer: 'Đáp án B', isCorrect: false },
    ],
  })
  @IsArray()
  @IsNotEmpty()
  answers: MultiAnswerDto[] | FillInBlankAnswerDto[];
}

export class UpdateBankQuestionDto {
  @ApiPropertyOptional() @IsOptional() @IsString() question_text?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() category?: string;

  @ApiPropertyOptional({ enum: QuestionType })
  @IsOptional()
  @IsEnum(QuestionType)
  type?: QuestionType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  answers?: any[];
}
