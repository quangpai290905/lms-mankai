// src/modules/lesson-video/lesson-video.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
// --- THÊM ApiOperation, ApiBody ---
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';
import { LessonVideoService } from './lesson-video.service';
import { CreateLessonVideoDto } from './dto/create-lesson-video.dto';
import { UpdateLessonVideoDto } from './dto/update-lesson-video.dto';

@ApiTags('06. Lesson Videos')
@Controller('lesson-videos')
export class LessonVideoController {
  constructor(private readonly lessonVideoService: LessonVideoService) {}

  // --- THÊM MỚI TẠI ĐÂY ---
  @Post()
  @ApiOperation({ summary: 'Tạo một video bài học mới' })
  @ApiBody({ type: CreateLessonVideoDto })
  // --- KẾT THÚC THÊM MỚI ---
  create(@Body() dto: CreateLessonVideoDto) {
    return this.lessonVideoService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách video bài học' }) // <-- Thêm mô tả
  findAll() {
    return this.lessonVideoService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Xem chi tiết video bài học' }) // <-- Thêm mô tả
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.lessonVideoService.findOne(id);
  }

  // --- THÊM MỚI TẠI ĐÂY ---
  @Patch(':id')
  @ApiOperation({ summary: 'Cập nhật video bài học' })
  @ApiBody({ type: UpdateLessonVideoDto })
  // --- KẾT THÚC THÊM MỚI ---
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateLessonVideoDto,
  ) {
    return this.lessonVideoService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa video bài học' }) // <-- Thêm mô tả
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.lessonVideoService.remove(id);
  }
}
