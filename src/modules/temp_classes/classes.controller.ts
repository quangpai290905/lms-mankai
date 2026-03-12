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
  Request,
} from '@nestjs/common';
import { ClassesService } from './classes.service';
import { CreateClassDto } from './dtos/create-class.dto';
import { UpdateClassDto } from './dtos/update-class.dto';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../../shared/guard/roles.guard';
import { Roles } from '../../shared/decorators/roles.decorator';
import { UserRole } from 'src/constant/enum';

@ApiTags('Classes (Lớp học)')
@ApiBearerAuth('JWT-auth')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('classes')
export class ClassesController {
  constructor(private readonly classesService: ClassesService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Tạo lớp học mới' })
  create(@Body() createClassDto: CreateClassDto) {
    return this.classesService.create(createClassDto);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @ApiOperation({
    summary: 'Lấy danh sách lớp (Admin thấy hết, Teacher thấy lớp mình)',
  })
  findAll(@Request() req) {
    return this.classesService.findAll(req.user);
  }

  @Get('my-enrollments')
  @Roles(UserRole.STUDENT, UserRole.TEACHER, UserRole.ADMIN) // Cho phép Student truy cập
  @ApiOperation({ summary: 'Lấy danh sách lớp đang học của user hiện tại' })
  getMyEnrollments(@Request() req) {
    return this.classesService.findMyClasses(req.user.user_id);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @ApiOperation({ summary: 'Lấy chi tiết lớp học' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.classesService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Cập nhật lớp học' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateClassDto: UpdateClassDto,
  ) {
    return this.classesService.update(id, updateClassDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Xóa lớp học' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.classesService.remove(id);
  }

  @Post(':id/students')
  @ApiOperation({ summary: 'Thêm học viên vào lớp' })
  async addStudent(
    @Param('id') classId: string,
    @Body('studentId') studentId: string,
  ) {
    return this.classesService.addStudentToClass(classId, studentId);
  }

  @Get(':id/students')
  @ApiOperation({ summary: 'Lấy danh sách học viên trong lớp' })
  async getClassStudents(@Param('id') classId: string) {
    return this.classesService.getStudentsByClass(classId);
  }
  @Delete(':classId/students/:studentId')
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @ApiOperation({ summary: 'Xóa học viên khỏi lớp' })
  async removeStudent(
    @Param('classId') classId: string,
    @Param('studentId') studentId: string,
  ) {
    return this.classesService.removeStudentFromClass(classId, studentId);
  }
}
