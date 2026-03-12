import { IsArray, IsNotEmpty, IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateVocabularyDto {
  @ApiProperty({ example: '日本' })
  @IsString()
  @IsNotEmpty()
  word: string;

  @ApiProperty({ example: 'じかん' })
  @IsString()
  @IsNotEmpty()
  reading: string;

  @ApiProperty({ example: 'Nhật Bản' })
  @IsString()
  @IsNotEmpty()
  meaning: string;

  @ApiProperty({ example: 'uuid-topic' })
  @IsString()
  @IsNotEmpty()
  topicId: string;

  @ApiProperty({ example: [1, 5], required: false })
  @IsOptional()
  @IsArray()
  kanjiIds?: number[];
}
