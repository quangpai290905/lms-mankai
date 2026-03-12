// src/modules/users/controllers/student.controller.ts
import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
  ApiConsumes,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { StudentService } from '../services/student.service';
import { CreateStudentDto } from '../dtos/request/create-student.dto';
import { UpdateStudentDto } from '../dtos/request/update-student.dto';
import { UpdateProfileDto } from '../dtos/request/update-profile.dto';
import { ChangePasswordDto } from '../dtos/request/change-password.dto';
import { SearchStudentDto } from '../dtos/request/search-student.dto';
import { StudentResponseDto } from '../dtos/response/student-response.dto';
import { PaginatedStudentsResponseDto } from '../dtos/response/paginated-students-response.dto';
import { CreateStudentBulkDto } from '../dtos/request/create-student-bulk.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../../../shared/guard/roles.guard';
import { Roles } from '../../../shared/decorators/roles.decorator';
import { UserRole } from 'src/constant/enum';
import type { AuthenticatedRequest } from '../../../shared/types';

@ApiTags('02. Users (Admin & Profile)')
@Controller('users')
export class StudentController {
  constructor(private readonly studentService: StudentService) {}

  @Post('admin')
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Admin tạo user mới (student/teacher)' })
  @ApiBody({ type: CreateStudentDto })
  @ApiResponse({ status: 201, type: StudentResponseDto })
  create(@Body() dto: CreateStudentDto) {
    return this.studentService.create(dto);
  }

  @Post('admin/bulk')
  @Roles(UserRole.ADMIN)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Tạo hàng loạt sinh viên (Admin only)' })
  @ApiBody({ type: CreateStudentBulkDto })
  createBulk(@Body() dto: CreateStudentBulkDto) {
    return this.studentService.createBulk(dto);
  }

  @Post('admin/import')
  @Roles(UserRole.ADMIN)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Import user từ file Excel' })
  @ApiConsumes('multipart/form-data')
  @ApiQuery({
    name: 'role',
    enum: UserRole,
    required: true,
    description: 'Role cần import (Student/Teacher)',
  }) // 👈 Thêm docs cho Swagger
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  async importStudents(
    @UploadedFile() file: Express.Multer.File,
    @Query('role') role: UserRole = UserRole.STUDENT, // 👈 Nhận query param
  ) {
    if (!file) throw new BadRequestException('Vui lòng upload file Excel');
    // Gọi service với role
    return this.studentService.importStudents(file, role);
  }

  @Get('admin')
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Admin lấy danh sách users' })
  @ApiQuery({ name: 'search', required: false })
  findAll(@Query() searchDto: SearchStudentDto) {
    return this.studentService.findAll(searchDto);
  }

  @Get('admin/:id')
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiParam({ name: 'id' })
  findOne(@Param('id') id: string) {
    return this.studentService.findOne(id);
  }

  @Patch('admin/:id')
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiParam({ name: 'id' })
  update(@Param('id') id: string, @Body() dto: UpdateStudentDto) {
    return this.studentService.update(id, dto);
  }

  @Delete('admin/:id')
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth('JWT-auth')
  @ApiParam({ name: 'id' })
  delete(@Param('id') id: string) {
    return this.studentService.delete(id);
  }

  // ===================== Profile =====================
  @Get('profile/me')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  getMyProfile(@Request() req: AuthenticatedRequest) {
    return this.studentService.findOne(req.user!.user_id);
  }

  @Patch('profile/me')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  updateProfile(
    @Request() req: AuthenticatedRequest,
    @Body() dto: UpdateProfileDto,
  ) {
    return this.studentService.updateProfile(req.user!.user_id, dto);
  }

  @Patch('profile/password')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.OK)
  changePassword(
    @Request() req: AuthenticatedRequest,
    @Body() dto: ChangePasswordDto,
  ) {
    return this.studentService.changePassword(req.user!.user_id, dto);
  }

  // ✅ Lấy danh sách khóa học của học viên
  @Get('profile/me/courses')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  getMyCourses(@Request() req: AuthenticatedRequest) {
    return this.studentService.getCoursesOfStudent(req.user!.user_id);
  }
}
