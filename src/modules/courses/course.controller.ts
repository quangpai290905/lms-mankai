import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CoursesService } from './course.service';
import { CreateCourseDto } from './dtos/create-course.dto';
import { UpdateCourseDto } from './dtos/update-course.dto';
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { Course } from './database/courses.entity';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../../shared/guard/roles.guard';
import { Roles } from 'src/shared/decorators/roles.decorator';
import { UserRole } from 'src/constant/enum';

@ApiTags('03. Courses')
@ApiBearerAuth('JWT-auth')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @ApiOperation({ summary: 'Tạo một khóa học mới' })
  @ApiResponse({
    status: 201,
    description: 'Tạo khóa học thành công.',
    type: Course,
  })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập.' })
  create(@Body() createCourseDto: CreateCourseDto) {
    // Đã bỏ @Request() req và tham số req.user
    return this.coursesService.create(createCourseDto);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT)
  @ApiOperation({ summary: 'Lấy danh sách khóa học' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  findAll(@Query('page') page = 1, @Query('limit') limit = 10) {
    return this.coursesService.findAll({ page, limit });
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT)
  @ApiOperation({ summary: 'Lấy thông tin chi tiết khóa học' })
  findOne(@Param('id') id: string) {
    return this.coursesService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @ApiOperation({ summary: 'Cập nhật thông tin khóa học' })
  update(@Param('id') id: string, @Body() updateCourseDto: UpdateCourseDto) {
    return this.coursesService.update(id, updateCourseDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @ApiOperation({ summary: 'Xóa một khóa học' })
  remove(@Param('id') id: string) {
    return this.coursesService.remove(id);
  }

  @Get(':id/full-structure')
  @Roles(UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT)
  @ApiOperation({
    summary: 'Lấy toàn bộ cấu trúc bài học (Session -> Lesson -> Items)',
  })
  getFullStructure(@Param('id') id: string) {
    return this.coursesService.findFullCurriculum(id);
  }
}
