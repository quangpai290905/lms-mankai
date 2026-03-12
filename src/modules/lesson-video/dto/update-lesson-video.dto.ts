// src/modules/lesson-video/dto/update-lesson-video.dto.ts
// ĐỔI import từ '@nestjs/mapped-types' SANG '@nestjs/swagger'
import { PartialType } from '@nestjs/swagger';
import { CreateLessonVideoDto } from './create-lesson-video.dto';

export class UpdateLessonVideoDto extends PartialType(CreateLessonVideoDto) {}
