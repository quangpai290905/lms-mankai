import {
  IsBoolean,
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePostDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  slug: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  excerpt?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  coverUrl?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  tags?: string[]; // TypeORM simple-array xử lý mảng string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  author?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  featured?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  views?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  readMins?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  seoTitle?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  seoDesc?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  publishedAt?: Date;
}
