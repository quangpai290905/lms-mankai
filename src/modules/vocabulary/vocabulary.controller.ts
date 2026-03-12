import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Delete,
  UseGuards,
  ParseUUIDPipe,
  Query,
  ParseArrayPipe,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiTags,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';

import { VocabularyService } from './vocabulary.service';
import { CreateVocabularyDto } from './dto/create-vocabulary.dto';
import { UpdateVocabularyDto } from './dto/update-vocabulary.dto';
import { UpdateVocabularyKanjiDto } from './dto/update-vocabulary-kanji.dto';

import { RolesGuard } from '../../shared/guard/roles.guard';
import { Roles } from '../../shared/decorators/roles.decorator';
import { UserRole } from 'src/constant/enum';

@ApiTags('Vocabulary')
@ApiBearerAuth('JWT-auth')
@UseGuards(AuthGuard('jwt'))
@Controller('vocabulary')
export class VocabularyController {
  constructor(private readonly vocabService: VocabularyService) {}

  // 🟢 ĐÃ SỬA: Xử lý an toàn cho page và limit
  @Get()
  @ApiOperation({ summary: 'Lấy danh sách Vocabulary (Pagination, Filter)' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @ApiQuery({ name: 'topic_id', required: false })
  @ApiQuery({ name: 'search', required: false })
  findAll(
    @Query('page') page: any = 1, // Để type any để nhận cả string/undefined
    @Query('limit') limit: any = 10,
    @Query('topic_id') topic_id?: string,
    @Query('search') search?: string,
  ) {
    // Logic an toàn: Nếu convert ra NaN hoặc <= 0 thì lấy mặc định
    const pageNumber = Number(page) > 0 ? Number(page) : 1;
    const limitNumber = Number(limit) > 0 ? Number(limit) : 10;

    return this.vocabService.findAll({
      page: pageNumber,
      limit: limitNumber,
      topic_id,
      search,
    });
  }

  // ... (Các hàm importBulk, create, update, delete khác giữ nguyên)
  @Post('import/:topicId')
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Import nhiều từ vựng vào Topic (Auto link Kanji)' })
  importBulk(
    @Param('topicId', ParseUUIDPipe) topicId: string,
    @Body(new ParseArrayPipe({ items: CreateVocabularyDto }))
    dtos: CreateVocabularyDto[],
  ) {
    return this.vocabService.importBulk(topicId, dtos);
  }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Tạo vocabulary mới (Admin, Teacher)' })
  create(@Body() dto: CreateVocabularyDto) {
    return this.vocabService.create(dto);
  }

  @Get('topic/:topicId')
  @ApiOperation({ summary: 'Lấy danh sách từ vựng theo Topic (No pagination)' })
  findByTopic(@Param('topicId', ParseUUIDPipe) topicId: string) {
    return this.vocabService.findByTopic(topicId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy chi tiết vocabulary' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.vocabService.findOne(id);
  }

  @Put(':id')
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Cập nhật thông tin từ vựng (Admin, Teacher)' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateVocabularyDto,
  ) {
    return this.vocabService.update(id, dto);
  }

  @Patch(':id/kanji')
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Cập nhật danh sách Kanji cho từ vựng' })
  updateKanji(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateVocabularyKanjiDto,
  ) {
    return this.vocabService.updateKanji(id, dto.kanjiIds);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Xóa VĨNH VIỄN từ vựng (Admin, Teacher)' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.vocabService.remove(id);
  }
}
