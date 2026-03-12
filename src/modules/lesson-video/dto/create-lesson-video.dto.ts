// src/modules/lesson-video/dto/create-lesson-video.dto.ts
import { IsNotEmpty, IsOptional, IsString, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'; // <--- Import này quan trọng

export class CreateLessonVideoDto {
  @ApiProperty({
    description: 'Tiêu đề của video bài học',
    example: 'Giới thiệu về NestJS',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({
    description: 'Mô tả ngắn về nội dung video',
    example: 'Video này hướng dẫn setup cơ bản...',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'URL của video (Youtube, Vimeo, hoặc file server)',
    example: 'https://www.youtube.com/watch?v=abcdef',
  })
  @IsString()
  @IsNotEmpty()
  videoUrl: string;

  @ApiPropertyOptional({
    description: 'Thời lượng video tính bằng giây',
    example: 120,
  })
  @IsNumber()
  @IsOptional()
  duration?: number;
}
