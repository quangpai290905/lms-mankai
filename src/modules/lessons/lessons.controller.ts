// ✅ src/modules/lessons/lessons.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { LessonsService } from './lessons.service';
import { CreateLessonDto } from './dtos/create-lesson.dto';
import { UpdateLessonDto } from './dtos/update-lesson.dto';
import { CreateLessonItemDto } from './dtos/create-lesson-item.dto';
import { UpdateLessonItemDto } from './dtos/update-lesson-item.dto';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../../shared/guard/roles.guard';
import { Roles } from 'src/shared/decorators/roles.decorator';
import { UserRole } from 'src/constant/enum';

@ApiTags('05. Lessons')
@ApiBearerAuth('JWT-auth')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('lessons')
export class LessonsController {
  constructor(private readonly lessonsService: LessonsService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  create(@Body() createLessonDto: CreateLessonDto) {
    return this.lessonsService.create(createLessonDto);
  }

  @Get()
  findAll() {
    return this.lessonsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.lessonsService.findOne(id);
  }

  // 👇👇👇 KHÔI PHỤC LẠI 2 HÀM NÀY ĐỂ SỬA VÀ XÓA BÀI HỌC 👇👇👇

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @ApiOperation({ summary: 'Cập nhật thông tin bài học (Tiêu đề, thứ tự)' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateLessonDto: UpdateLessonDto,
  ) {
    return this.lessonsService.update(id, updateLessonDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @ApiOperation({ summary: 'Xóa một bài học' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.lessonsService.remove(id);
  }

  // 👆👆👆 HẾT PHẦN KHÔI PHỤC 👆👆👆

  // --- CÁC API CHO ITEMS (VIDEO/TEXT/QUIZ) ---

  @Post(':id/items')
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  addItem(
    @Param('id', ParseUUIDPipe) lessonId: string,
    @Body() dto: CreateLessonItemDto,
  ) {
    return this.lessonsService.addItem(lessonId, dto);
  }

  @Patch('items/:itemId')
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  updateItem(
    @Param('itemId', ParseUUIDPipe) itemId: string,
    @Body() dto: UpdateLessonItemDto,
  ) {
    return this.lessonsService.updateItem(itemId, dto);
  }

  @Delete('items/:itemId')
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  removeItem(@Param('itemId', ParseUUIDPipe) itemId: string) {
    return this.lessonsService.removeItem(itemId);
  }
}
