// src/modules/sessions/sessions.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { SessionsService } from './sessions.service';
import { CreateSessionDto } from './dtos/create-session.dto';
import { UpdateSessionDto } from './dtos/update-session.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Session } from './database/session.entity';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../../shared/guard/roles.guard';
import { Roles } from 'src/shared/decorators/roles.decorator';
import { UserRole } from 'src/constant/enum';

@ApiTags('04. Sessions')
@ApiBearerAuth('JWT-auth')
// Giữ lại Guards ở cấp Controller để đảm bảo tất cả request đều phải login và qua bước kiểm tra role
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('sessions')
export class SessionsController {
  constructor(private readonly sessionsService: SessionsService) {}

  // --- CHỨC NĂNG GHI (Chỉ Admin & Teacher) ---

  @Post()
  @Roles(UserRole.ADMIN, UserRole.TEACHER) // Chỉ Admin và Teacher được tạo
  @ApiOperation({ summary: 'Tạo một chương/buổi học mới' })
  @ApiResponse({ status: 201, description: 'Tạo thành công.', type: Session })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ.' })
  @ApiResponse({ status: 401, description: 'Chưa xác thực.' })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập.' })
  create(@Body() createSessionDto: CreateSessionDto) {
    return this.sessionsService.create(createSessionDto);
  }

  // --- CHỨC NĂNG XEM (Admin, Teacher & Student) ---

  @Get()
  @Roles(UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT) // Thêm Student
  @ApiOperation({ summary: 'Lấy danh sách tất cả các chương' })
  @ApiResponse({ status: 200, description: 'Thành công.', type: [Session] })
  @ApiResponse({ status: 401, description: 'Chưa xác thực.' })
  findAll() {
    return this.sessionsService.findAll();
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT) // Thêm Student
  @ApiOperation({ summary: 'Lấy thông tin chi tiết một chương' })
  @ApiParam({ name: 'id', description: 'ID (UUID) của chương', type: String })
  @ApiResponse({ status: 200, description: 'Thành công.', type: Session })
  @ApiResponse({ status: 401, description: 'Chưa xác thực.' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy chương này.' })
  findOne(@Param('id') id: string) {
    return this.sessionsService.findOne(id);
  }

  // --- CHỨC NĂNG SỬA/XÓA (Chỉ Admin & Teacher) ---

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.TEACHER) // Chỉ Admin và Teacher được sửa
  @ApiOperation({ summary: 'Cập nhật thông tin một chương' })
  @ApiParam({ name: 'id', description: 'ID (UUID) của chương', type: String })
  @ApiResponse({
    status: 200,
    description: 'Cập nhật thành công.',
    type: Session,
  })
  @ApiResponse({ status: 401, description: 'Chưa xác thực.' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy chương này.' })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập.' })
  update(@Param('id') id: string, @Body() updateSessionDto: UpdateSessionDto) {
    return this.sessionsService.update(id, updateSessionDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.TEACHER) // Chỉ Admin và Teacher được xóa
  @ApiOperation({ summary: 'Xóa một chương' })
  @ApiParam({ name: 'id', description: 'ID (UUID) của chương', type: String })
  @ApiResponse({ status: 200, description: 'Xóa thành công.' })
  @ApiResponse({ status: 401, description: 'Chưa xác thực.' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy chương này.' })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập.' })
  remove(@Param('id') id: string) {
    return this.sessionsService.remove(id);
  }
}
