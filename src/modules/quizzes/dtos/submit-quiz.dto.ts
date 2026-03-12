import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsNotEmpty,
  ValidateNested,
  IsUUID,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';

class AnswerDto {
  @ApiProperty({ description: 'ID (uuid) của câu hỏi' })
  @IsNotEmpty()
  @IsUUID()
  question_id: string;

  // SỬA: Bỏ @IsString() để chấp nhận cả string, number, hoặc object (cho điền từ)
  @ApiProperty({
    description:
      'Đáp án người dùng chọn. Có thể là string (trắc nghiệm) hoặc object {index, answer} (điền từ)',
    example: 'Đáp án A',
  })
  @IsNotEmpty()
  selected_answer: any;
}

export class SubmitQuizDto {
  @ApiProperty({ type: [AnswerDto], description: 'Danh sách các câu trả lời' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AnswerDto)
  answers: AnswerDto[];

  @ApiProperty({
    description: 'ID của LessonItem đang làm bài',
    required: false,
  })
  @IsUUID()
  @IsOptional()
  lessonItemId?: string;
}
