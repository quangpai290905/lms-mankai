// src/modules/quizzes/quizzes.controller.ts
import {
  Controller,
  Post,
  Body,
  Param,
  UseGuards,
  Get,
  Patch,
  Delete,
  ParseUUIDPipe,
  Put,
  Query,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { QuizzesService } from './quizzes.service';
import { GetUser } from '../../shared/decorators/get-user.decorator';
import { User } from '../auth/database/user.entity';
import { UserRole } from 'src/constant/enum';
import { SubmitQuizDto } from './dtos/submit-quiz.dto';
// --- THÊM ApiOperation, ApiBody ---
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiParam,
  ApiResponse,
  ApiBody,
} from '@nestjs/swagger';
import { Roles } from '../../shared/decorators/roles.decorator';
import { RolesGuard } from '../../shared/guard/roles.guard';
import { CreateQuizDto } from './dtos/create-quiz.dto';
import { UpdateQuizDto } from './dtos/update-quiz.dto';
import { AssignQuestionDto } from './dtos/assign-question.dto';

@ApiTags('08. Quizzes')
@ApiBearerAuth('JWT-auth')
@UseGuards(AuthGuard('jwt'))
@Controller('quizzes')
export class QuizzesController {
  constructor(private readonly quizzesService: QuizzesService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Tạo một "vỏ" quiz mới (Admin, Teacher)' })
  @ApiBody({ type: CreateQuizDto }) // <-- Đã thêm
  create(@Body() createQuizDto: CreateQuizDto) {
    return this.quizzesService.create(createQuizDto);
  }
  @Get()
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Lấy danh sách tất cả quiz' })
  findAll() {
    return this.quizzesService.findAll();
  }
  @Get(':id')
  @ApiOperation({
    summary: 'Lấy thông tin chi tiết một bài quiz (và các câu hỏi của nó)',
  })
  findOne(@Param('id', ParseUUIDPipe) id: string, @GetUser() user: User) {
    const includeAnswers =
      user.role === UserRole.ADMIN || user.role === UserRole.TEACHER;
    return this.quizzesService.findOne(id, includeAnswers);
  }

  // --- THÊM MỚI TẠI ĐÂY ---
  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Cập nhật thông tin quiz (Admin, Teacher)' })
  @ApiBody({ type: UpdateQuizDto })
  // --- KẾT THÚC THÊM MỚI ---
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateQuizDto: UpdateQuizDto,
  ) {
    return this.quizzesService.update(id, updateQuizDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Xóa một quiz (Admin, Teacher)' }) // <-- Thêm mô tả
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.quizzesService.remove(id);
  }

  // --- THÊM MỚI TẠI ĐÂY ---
  @Post(':id/submit')
  @Roles(UserRole.STUDENT) // <-- Giả định Student mới nộp bài
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Nộp bài làm quiz (Student)' })
  @ApiBody({ type: SubmitQuizDto })
  // --- KẾT THÚC THÊM MỚI ---
  submitQuiz(
    @Param('id', ParseUUIDPipe) quizId: string,
    @GetUser() user: User,
    @Body() submitQuizDto: SubmitQuizDto,
  ) {
    return this.quizzesService.submitAndGradeQuiz(
      user.user_id,
      quizId,
      submitQuizDto,
    );
  }

  @Put(':quizId/questions') // <-- ĐỔI SANG PUT VÀ THAY ĐỔI ROUTE
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @UseGuards(RolesGuard)
  @ApiOperation({
    summary: 'Gán câu hỏi cho quiz',
  })
  @ApiBody({ type: AssignQuestionDto }) // <-- Đã thêm
  updateQuizQuestions(
    // <-- Đổi tên method
    @Param('quizId', ParseUUIDPipe) quizId: string,
    @Body() assignDto: AssignQuestionDto, // <-- Vẫn dùng DTO mảng
  ) {
    // Gọi phương thức service mới
    return this.quizzesService.assignQuizQuestions(quizId, assignDto);
  }

  @Delete('unassign-question/:assignmentId')
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Gỡ một câu hỏi ra khỏi quiz (Admin, Teacher)' })
  unassignQuestion(@Param('assignmentId', ParseUUIDPipe) assignmentId: string) {
    return this.quizzesService.unassignQuestionFromQuiz(assignmentId);
  }

  @Get(':quizId/results') // API: GET /quizzes/:id/results
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Lấy danh sách kết quả làm bài của Quiz' })
  async getQuizResults(
    @Param('quizId', ParseUUIDPipe) quizId: string,
    @Query('lessonItemId') lessonItemId?: string, // Optional filter
  ) {
    return this.quizzesService.getResultsByQuizId(quizId);
  }
}
