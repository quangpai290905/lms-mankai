import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ProgressService } from './progress.service';
import { UpsertLessonProgressDto } from './dtos/upsert-progress.dto';
import { QueryLessonProgressDto } from './dtos/query-progress.dto';
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';
@ApiTags('09. Progress')
@Controller('progress')
export class ProgressController {
  constructor(private readonly service: ProgressService) {}

  @Post()
  @ApiOperation({ summary: 'Cập nhật/tạo mới tiến độ học' })
  @ApiBody({ type: UpsertLessonProgressDto })
  async upsert(@Body() dto: UpsertLessonProgressDto) {
    return this.service.upsert(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Lấy tiến độ học' })
  async get(@Query() query: QueryLessonProgressDto) {
    return this.service.get(query);
  }

  @Get('class-summary')
  @ApiOperation({ summary: 'Lấy bảng tổng hợp tiến độ của một lớp' })
  async getClassSummary(
    @Query('classId') classId: string,
    @Query('courseIds') courseIds: string, // Frontend gửi chuỗi "id1,id2"
    @Query('studentIds') studentIds: string, // Frontend gửi chuỗi "id1,id2"
  ) {
    if (!classId || !courseIds || !studentIds) return {};

    const cIds = courseIds.split(',');
    const sIds = studentIds.split(',');

    return this.service.getClassProgress(classId, sIds, cIds);
  }
}
