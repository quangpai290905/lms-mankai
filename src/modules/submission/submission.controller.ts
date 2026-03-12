import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  Patch,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { SubmissionService } from './submission.service';
import { CreateSubmissionDto } from './dtos/request/create-submission.dto';
import { SearchSubmissionDto } from './dtos/request/search-submission.dto';
import { SubmissionResponseDto } from './dtos/response/submission-response.dto';
import { PaginatedSubmissionsResponseDto } from './dtos/response/paginated-submissions-response.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/shared/guard/roles.guard';
import type { AuthenticatedRequest } from 'src/shared/types';
import { Roles } from 'src/shared/decorators/roles.decorator';
import { UserRole } from 'src/constant/enum';
import { GradeSubmissionDto } from './dtos/request/grade-submission.dto';
@ApiTags('10. Submissions (Student & Admin)')
@Controller()
export class SubmissionController {
  constructor(private readonly submissionService: SubmissionService) {}

  // ... (Giữ nguyên Post create, Get getMySubmissions, Get findAll)
  @Post('submissions')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Nộp bài link Git' })
  async create(
    @Request() req: AuthenticatedRequest,
    @Body() createSubmissionDto: CreateSubmissionDto,
  ): Promise<SubmissionResponseDto> {
    const userId = req.user!.user_id;
    return this.submissionService.create(createSubmissionDto, userId);
  }

  @Get('submissions/my')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  async getMySubmissions(@Request() req: AuthenticatedRequest) {
    return this.submissionService.findByStudentId(req.user!.user_id);
  }

  @Get('admin/submissions')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @ApiBearerAuth('JWT-auth')
  async findAll(@Query() searchDto: SearchSubmissionDto) {
    return this.submissionService.findAll(searchDto);
  }

  @Get('admin/submissions/:id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @ApiBearerAuth('JWT-auth')
  async findOne(@Param('id') id: string) {
    return this.submissionService.findOne(id);
  }

  // 👇👇👇 API MỚI: CHẤM ĐIỂM 👇👇👇
  @Patch('admin/submissions/:id/grade')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Chấm điểm bài nộp (Admin/Teacher)' })
  @ApiParam({ name: 'id', description: 'ID bài nộp' })
  @ApiBody({ type: GradeSubmissionDto })
  @ApiResponse({
    status: 200,
    description: 'Chấm điểm thành công',
    type: SubmissionResponseDto,
  })
  async gradeSubmission(
    @Param('id') id: string,
    @Body() dto: GradeSubmissionDto,
    @Request() req: AuthenticatedRequest,
  ): Promise<SubmissionResponseDto> {
    const reviewerId = req.user!.user_id;
    return this.submissionService.grade(id, dto, reviewerId);
  }
}
