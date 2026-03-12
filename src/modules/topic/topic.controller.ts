import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';

import { TopicService } from './topic.service';
import { CreateTopicDto } from './dto/create-topic.dto';
import { UpdateTopicDto } from './dto/update-topic.dto';

// Import các Guard và Enum từ hệ thống Shared
import { RolesGuard } from '../../shared/guard/roles.guard'; // ⚠️ Hãy trỏ đúng đường dẫn
import { Roles } from '../../shared/decorators/roles.decorator'; // ⚠️ Hãy trỏ đúng đường dẫn
import { UserRole } from 'src/constant/enum'; // ⚠️ Enum UserRole

@ApiTags('Topic')
@ApiBearerAuth('JWT-auth') // Khớp với cấu hình Swagger
@UseGuards(AuthGuard('jwt')) // Bảo vệ toàn bộ Controller
@Controller('topics')
export class TopicController {
  constructor(private readonly topicService: TopicService) {}

  // 🔍 LIST + SEARCH + PAGINATION (Cho phép Teacher/Student xem)
  @Get()
  @ApiOperation({ summary: 'Danh sách topic (search + phân trang)' })
  @ApiQuery({ name: 'q', required: false })
  @ApiQuery({ name: 'level', required: false, example: 'N5' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  findAll(
    @Query('q') q?: string,
    @Query('level') level?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.topicService.findAll({
      q,
      level,
      page: Number(page) || 1,
      limit: Number(limit) || 10,
    });
  }

  // 🔎 DETAIL
  @Get(':id')
  @ApiOperation({ summary: 'Chi tiết topic' })
  @ApiParam({ name: 'id' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.topicService.findOne(id);
  }

  // ➕ CREATE (ADMIN + TEACHER)
  @Post()
  @Roles(UserRole.ADMIN, UserRole.TEACHER) // ✅ Phân quyền chuẩn
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Tạo topic (Admin, Teacher)' })
  create(@Body() dto: CreateTopicDto) {
    return this.topicService.create(dto);
  }

  // ✏️ UPDATE (ADMIN + TEACHER)
  @Put(':id')
  @Roles(UserRole.ADMIN, UserRole.TEACHER) // ✅ Phân quyền chuẩn
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Cập nhật topic (Admin, Teacher)' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateTopicDto) {
    return this.topicService.update(id, dto);
  }

  // 🧹 HARD DELETE (CHỈ ADMIN)
  // Xóa cứng rất nguy hiểm nên chỉ để Admin
  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Xóa VĨNH VIỄN topic (Admin only)' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.topicService.remove(id);
  }
}
