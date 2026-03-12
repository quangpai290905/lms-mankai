import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { QuizQuestion } from '../quizzes/database/quiz-question.entity';
import {
  CreateBankQuestionDto,
  UpdateBankQuestionDto,
} from './dtos/questions.dto';
import * as XLSX from 'xlsx';
import type { Express } from 'express';
import { QuestionType } from 'src/constant/enum';

@Injectable()
export class QuestionsService {
  constructor(
    @InjectRepository(QuizQuestion)
    private questionsRepository: Repository<QuizQuestion>,
  ) {}

  create(dto: CreateBankQuestionDto) {
    // Dữ liệu 'answers' đã là JSON object từ DTO, TypeORM sẽ tự xử lý khi lưu vào cột json
    const newQuestion = this.questionsRepository.create(dto);
    return this.questionsRepository.save(newQuestion);
  }

  findAll() {
    return this.questionsRepository.find();
  }

  async findOne(id: string) {
    const q = await this.questionsRepository.findOneBy({ question_id: id });
    if (!q) throw new NotFoundException('Question not found');
    return q;
  }

  async update(id: string, dto: UpdateBankQuestionDto) {
    // Khi update JSON, cần cẩn thận vì nó sẽ ghi đè toàn bộ cột answers
    const question = await this.questionsRepository.preload({
      question_id: id,
      ...dto,
    });
    if (!question) throw new NotFoundException('Question not found');
    return this.questionsRepository.save(question);
  }

  async remove(id: string) {
    const q = await this.findOne(id);
    await this.questionsRepository.remove(q);
    return { message: 'Question removed from bank' };
  }

  async importFromExcel(file?: Express.Multer.File) {
    if (!file) throw new BadRequestException('File is required');

    const workbook = XLSX.read(file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames?.[0];
    if (!sheetName) throw new BadRequestException('Excel file is empty');

    const worksheet = workbook.Sheets[sheetName];
    // Đọc Excel thành JSON
    const rows = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet, {
      defval: null,
      raw: false,
      blankrows: false,
    });

    if (!rows.length)
      throw new BadRequestException('No data found in Excel file');

    const entities: QuizQuestion[] = [];
    const errors: string[] = [];
    const validKeys = ['a', 'b', 'c', 'd'];

    rows.forEach((row, index) => {
      const rowNumber = index + 2;

      // 1. Nhận diện loại câu hỏi (Mặc định là MULTIPLE_CHOICE nếu không ghi)
      const rawType = row['type']?.toString().trim().toUpperCase();
      const type =
        rawType === 'FILL_IN_THE_BLANK'
          ? QuestionType.FILL_IN_THE_BLANK
          : QuestionType.MULTIPLE_CHOICE;

      const questionText = row['question_text']?.toString().trim();
      const category = row['category']?.toString().trim() ?? null;

      if (!questionText) {
        errors.push(`Row ${rowNumber}: Missing question_text`);
        return;
      }

      // === XỬ LÝ TRẮC NGHIỆM ===
      if (type === QuestionType.MULTIPLE_CHOICE) {
        const optionA = row['option_a']?.toString().trim();
        const optionB = row['option_b']?.toString().trim();
        const optionC = row['option_c']?.toString().trim();
        const optionD = row['option_d']?.toString().trim();
        const correctAnswer = row['correct_answer']
          ?.toString()
          .trim()
          .toLowerCase();

        if (!optionA || !optionB || !correctAnswer) {
          errors.push(
            `Row ${rowNumber} (MC): Missing options or correct_answer`,
          );
          return;
        }
        if (!validKeys.includes(correctAnswer)) {
          errors.push(
            `Row ${rowNumber} (MC): correct_answer must be 'a','b','c','d'`,
          );
          return;
        }

        const answers = [
          { answer: optionA, isCorrect: correctAnswer === 'a' },
          { answer: optionB, isCorrect: correctAnswer === 'b' },
        ];
        if (optionC)
          answers.push({ answer: optionC, isCorrect: correctAnswer === 'c' });
        if (optionD)
          answers.push({ answer: optionD, isCorrect: correctAnswer === 'd' });

        entities.push(
          this.questionsRepository.create({
            question_text: questionText,
            category,
            type: QuestionType.MULTIPLE_CHOICE,
            answers,
          }),
        );
      }

      // === XỬ LÝ ĐIỀN TỪ ===
      else if (type === QuestionType.FILL_IN_THE_BLANK) {
        // Logic: "correct_answers" chứa các từ, cách nhau bởi dấu chấm phẩy (;)
        // Ví dụ: "mèo;chuột"
        const answersStr = row['correct_answers']?.toString().trim();

        if (!answersStr) {
          errors.push(
            `Row ${rowNumber} (FillBlank): Missing correct_answers column`,
          );
          return;
        }

        const answerList = answersStr.split(';').map((s) => s.trim());

        // Tính toán index dựa trên vị trí từ trong câu hỏi (cách đơn giản: split space)
        // Lưu ý: Logic này tương đối cơ bản, nó giả định cấu trúc câu hỏi khớp với logic frontend
        const words = questionText.split(/\s+/);
        const generatedAnswers: any[] = [];
        let blankCounter = 0;

        words.forEach((word, idx) => {
          if (word.includes('__')) {
            if (answerList[blankCounter]) {
              generatedAnswers.push({
                index: idx, // Lưu index của từ trong câu
                answer: answerList[blankCounter],
                isCorrect: true,
              });
            }
            blankCounter++;
          }
        });

        if (generatedAnswers.length === 0) {
          errors.push(
            `Row ${rowNumber} (FillBlank): No blanks (__) found in question text or answers mismatch`,
          );
          return;
        }

        entities.push(
          this.questionsRepository.create({
            question_text: questionText,
            category,
            type: QuestionType.FILL_IN_THE_BLANK,
            answers: generatedAnswers,
          }),
        );
      }
    });

    if (!entities.length) {
      // Trả về lỗi chi tiết
      return { imported: 0, errors };
    }

    await this.questionsRepository.save(entities);
    return { imported: entities.length, errors };
  }
}
