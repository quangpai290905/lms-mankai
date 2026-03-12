import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository, DataSource } from 'typeorm';
import { Quiz } from './database/quiz.entity';
import { QuizQuestion } from './database/quiz-question.entity'; // Sửa lại đường dẫn import nếu cần
import { QuizResult } from './database/quiz-result.entity';
import { SubmitQuizDto } from './dtos/submit-quiz.dto';
import { CreateQuizDto } from './dtos/create-quiz.dto';
import { UpdateQuizDto } from './dtos/update-quiz.dto';
import { QuizQuestionAssignment } from './database/quiz-question-assignment.entity';
import { AssignQuestionDto } from './dtos/assign-question.dto';
import { QuestionType } from 'src/constant/enum'; // Import Enum Type

@Injectable()
export class QuizzesService {
  constructor(
    @InjectRepository(Quiz) private quizzesRepository: Repository<Quiz>,
    @InjectRepository(QuizQuestion)
    private questionsRepository: Repository<QuizQuestion>,
    @InjectRepository(QuizResult)
    private resultsRepository: Repository<QuizResult>,
    @InjectRepository(QuizQuestionAssignment)
    private assignmentRepository: Repository<QuizQuestionAssignment>,
    private dataSource: DataSource,
  ) {}

  async create(createQuizDto: CreateQuizDto): Promise<Quiz> {
    const newQuiz = this.quizzesRepository.create(createQuizDto);
    return this.quizzesRepository.save(newQuiz);
  }

  async findAll(): Promise<Quiz[]> {
    return this.quizzesRepository.find();
  }

  async assignQuizQuestions(
    quizId: string,
    assignDto: AssignQuestionDto,
  ): Promise<QuizQuestionAssignment[]> {
    const { assignments } = assignDto;
    const questionIds = assignments.map((a) => a.question_id);

    return this.dataSource.transaction(async (entityManager) => {
      const quiz = await entityManager.findOneBy(Quiz, { quiz_id: quizId });
      if (!quiz) throw new NotFoundException('Quiz not found');

      let questionMap = new Map<string, QuizQuestion>();
      if (questionIds.length > 0) {
        const questions = await entityManager.find(QuizQuestion, {
          where: { question_id: In(questionIds) },
        });

        if (questions.length !== questionIds.length) {
          const foundIds = questions.map((q) => q.question_id);
          const notFound = questionIds.filter((id) => !foundIds.includes(id));
          throw new NotFoundException(
            `Questions not found: ${notFound.join(', ')}`,
          );
        }
        questionMap = new Map(questions.map((q) => [q.question_id, q]));
      }

      await entityManager.delete(QuizQuestionAssignment, {
        quiz: { quiz_id: quizId },
      });

      if (assignments.length === 0) {
        return [];
      }

      const newAssignments = assignments.map((item) => {
        const question = questionMap.get(item.question_id);
        return entityManager.create(QuizQuestionAssignment, {
          quiz: quiz,
          question: question,
          order_index: item.order_index || 0,
        });
      });

      return entityManager.save(QuizQuestionAssignment, newAssignments);
    });
  }

  async unassignQuestionFromQuiz(
    assignmentId: string,
  ): Promise<{ message: string }> {
    const assignment = await this.assignmentRepository.findOneBy({
      assignment_id: assignmentId,
    });
    if (!assignment) throw new NotFoundException('Assignment not found');

    await this.assignmentRepository.remove(assignment);
    return { message: 'Question unassigned from quiz' };
  }

  // --- SỬA LOGIC FIND ONE ---
  async findOne(id: string, includeCorrectAnswers = false): Promise<any> {
    const quiz = await this.quizzesRepository.findOneBy({ quiz_id: id });
    if (!quiz) throw new NotFoundException(`Quiz with ID ${id} not found`);

    const assignments = await this.assignmentRepository
      .createQueryBuilder('assignment')
      .leftJoinAndSelect('assignment.question', 'question')
      .where('assignment.quiz_id = :quizId', { quizId: id })
      .orderBy('assignment.order_index', 'ASC')
      .getMany();

    const questions = assignments.map((a) => {
      const questionData = a.question;

      // Xử lý ẩn đáp án đúng trong JSON answers
      if (!includeCorrectAnswers && questionData.answers) {
        // Map qua mảng answers và loại bỏ thuộc tính 'isCorrect'
        questionData.answers = questionData.answers.map((ans) => {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { isCorrect, ...rest } = ans;
          return rest;
        });
      }

      return {
        ...questionData,
        order_index: a.order_index,
        assignment_id: a.assignment_id,
      };
    });

    return {
      ...quiz,
      questions: questions,
    };
  }

  async update(id: string, updateQuizDto: UpdateQuizDto): Promise<Quiz> {
    const quiz = await this.quizzesRepository.preload({
      quiz_id: id,
      ...updateQuizDto,
    });
    if (!quiz) throw new NotFoundException(`Quiz with ID ${id} not found`);
    return this.quizzesRepository.save(quiz);
  }

  async remove(id: string): Promise<{ message: string }> {
    await this.dataSource.transaction(async (entityManager) => {
      const quiz = await entityManager.findOneBy(Quiz, { quiz_id: id });
      if (!quiz) throw new NotFoundException(`Quiz with ID ${id} not found`);

      await entityManager.delete(QuizResult, { quiz_id: id });
      await entityManager.delete(QuizQuestionAssignment, {
        quiz: { quiz_id: id },
      });
      await entityManager.remove(quiz);
    });
    return { message: `Quiz with ID ${id} has been deleted` };
  }

  // --- SỬA LOGIC CHẤM ĐIỂM (QUAN TRỌNG) ---
  async submitAndGradeQuiz(
    userId: string,
    quizId: string,
    submitQuizDto: SubmitQuizDto,
  ) {
    // 1. Lấy danh sách câu hỏi chuẩn của Quiz từ DB
    const quizAssignments = await this.assignmentRepository.find({
      where: { quiz: { quiz_id: quizId } },
      relations: ['question'],
    });

    const correctQuestions = quizAssignments.map((a) => a.question);

    if (correctQuestions.length === 0) {
      throw new NotFoundException(
        `Quiz with ID ${quizId} not found or has no questions.`,
      );
    }

    const validQuestionIds = correctQuestions.map((q) => q.question_id);
    let correctAnswersCount = 0;

    // 2. Duyệt qua từng câu trả lời của học sinh
    submitQuizDto.answers.forEach((studentAnswer) => {
      if (!validQuestionIds.includes(studentAnswer.question_id)) return;

      const question = correctQuestions.find(
        (q) => q.question_id === studentAnswer.question_id,
      );

      // Gọi hàm helper để kiểm tra đúng sai
      if (
        question &&
        this.checkAnswer(question, studentAnswer.selected_answer)
      ) {
        correctAnswersCount++;
      }
    });

    // 3. Tính điểm
    const score = (correctAnswersCount / correctQuestions.length) * 100;

    const newResult = this.resultsRepository.create({
      user_id: userId,
      quiz_id: quizId,
      lesson_item_id: submitQuizDto.lessonItemId,
      score,
    });
    await this.resultsRepository.save(newResult);

    return {
      quizId,
      totalQuestions: correctQuestions.length,
      correctAnswers: correctAnswersCount,
      score: parseFloat(score.toFixed(2)),
      message: 'Quiz submitted successfully!',
    };
  }

  async getResultsByQuizId(quizId: string, lessonItemId?: string) {
    const whereCondition: any = { quiz_id: quizId };
    if (lessonItemId) {
      whereCondition.lesson_item_id = lessonItemId;
    }
    return this.resultsRepository.find({
      where: whereCondition,
      relations: ['user'],
      order: { score: 'DESC' },
    });
  }

  // --- HELPER FUNCTION: Kiểm tra đáp án ---
  private checkAnswer(question: QuizQuestion, userAnswer: any): boolean {
    if (!question.answers) return false;

    // 1. Logic cho Trắc nghiệm (Multiple Choice)
    if (question.type === QuestionType.MULTIPLE_CHOICE) {
      // userAnswer mong đợi là string (ví dụ: "Hà Nội") hoặc index, tùy FE gửi
      // Ở đây giả định FE gửi text đáp án giống như trong DB
      const correctOptions = question.answers
        .filter((a: any) => a.isCorrect === true)
        .map((a: any) => a.answer); // Lấy danh sách text các đáp án đúng

      // Kiểm tra xem user gửi lên có nằm trong list đáp án đúng không
      return correctOptions.includes(userAnswer);
    }

    // 2. Logic cho Điền từ (Fill in the blank)
    if (question.type === QuestionType.FILL_IN_THE_BLANK) {
      // userAnswer mong đợi dạng: { index: 1, answer: "text" } hoặc mảng các object đó
      // question.answers trong DB dạng: [{ index: 1, answer: "text" }]

      // Nếu user gửi mảng (nhiều chỗ trống)
      if (Array.isArray(userAnswer)) {
        // Logic: Phải đúng HẾT các ô trống mới tính điểm (strict mode)
        // Hoặc có thể tính điểm thành phần (ở đây làm strict mode đơn giản)
        const dbAnswers = question.answers as any[];
        if (userAnswer.length !== dbAnswers.length) return false;

        return userAnswer.every((uItem) => {
          const match = dbAnswers.find((d) => d.index === uItem.index);
          return (
            match &&
            match.answer.trim().toLowerCase() ===
              uItem.answer.trim().toLowerCase()
          );
        });
      }

      // Nếu user gửi 1 object lẻ (trường hợp chỉ có 1 chỗ trống)
      const dbAnswer = question.answers.find(
        (a: any) => a.index === userAnswer.index,
      );
      return (
        dbAnswer &&
        dbAnswer.answer.trim().toLowerCase() ===
          userAnswer.answer.trim().toLowerCase()
      );
    }

    return false;
  }
}
