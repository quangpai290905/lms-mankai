// src/modules/kanji/dto/create-kanji.dto.ts
import { IsNotEmpty, IsString, IsArray, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateKanjiDto {
  @ApiProperty({ example: '一' })
  @IsString()
  @IsNotEmpty()
  kanji: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  onyomi?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  kunyomi?: string;

  @ApiProperty({ type: [String] })
  @IsArray()
  meanings: string[];

  @ApiProperty({ required: false, example: 'Mẹo nhớ...' })
  @IsOptional()
  @IsString()
  mnemonic?: string;

  @ApiProperty({ required: false, example: 'N5' })
  @IsOptional()
  @IsString()
  jlpt?: string;
}
