// src/modules/kanji/kanji.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  UseGuards,
  ParseIntPipe,
  ParseArrayPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';

import { KanjiService } from './kanji.service';
import { CreateKanjiDto } from './dtos/create-kanji.dto';
import { RolesGuard } from '../../shared/guard/roles.guard'; // Đường dẫn có thể khác tuỳ project bạn
import { Roles } from '../../shared/decorators/roles.decorator';
import { UserRole } from 'src/constant/enum';

@ApiTags('Kanji') // Gom nhóm API trong Swagger
@Controller('kanji')
export class KanjiController {
  constructor(private readonly kanjiService: KanjiService) {}

  // ➕ CREATE / IMPORT (Admin, Teacher)
  @Post()
  @ApiBearerAuth('JWT-auth')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @ApiOperation({ summary: 'Tạo hoặc Cập nhật Kanji (Admin/Teacher)' })
  create(@Body() dto: CreateKanjiDto) {
    return this.kanjiService.create(dto);
  }

  // 🔍 LIST (Public - Ai cũng tra được)
  @Get()
  @ApiOperation({ summary: 'Tra cứu danh sách Kanji' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 20 })
  @ApiQuery({
    name: 'jlpt',
    required: false,
    example: 'N5',
    description: 'Lọc theo cấp độ',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Tìm theo chữ, âm on/kun',
  })
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('jlpt') jlpt?: string,
    @Query('search') search?: string,
  ) {
    return this.kanjiService.findAll({
      page: Number(page) || 1,
      limit: Number(limit) || 20,
      jlpt,
      search,
    });
  }

  // 🔎 DETAIL (Public)
  @Get(':id')
  @ApiOperation({ summary: 'Xem chi tiết Kanji' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.kanjiService.findOne(id);
  }

  // 🗑 DELETE (Admin only)
  @Delete(':id')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Xóa Kanji (Admin)' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.kanjiService.remove(id);
  }

  @Post('import')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Import hàng loạt Kanji (JSON Array)' })
  importBulk(
    @Body(new ParseArrayPipe({ items: CreateKanjiDto })) dtos: CreateKanjiDto[],
  ) {
    return this.kanjiService.importBulk(dtos);
  }
}
