import { SubmissionStatus } from '../../database/submission.entity';
import { StudentResponseDto } from 'src/modules/student/dtos/response/student-response.dto';

export class SubmissionResponseDto {
  id: string;
  studentId: string;
  student?: StudentResponseDto;

  classId?: string; // 👈 Thêm ID lớp
  className?: string; // 👈 Thêm tên lớp (nếu cần hiển thị)

  gitLink: string;
  description?: string;
  status: SubmissionStatus;
  feedback?: string;
  reviewerId?: string;
  score?: number;
  createdAt: Date;
  updatedAt: Date;
  lessonItemId: string;
  lessonItemTitle?: string;

  constructor(submission: any) {
    this.id = submission.id;
    this.studentId = submission.studentId;
    if (submission.student) {
      this.student = new StudentResponseDto(submission.student);
    }

    // Map thông tin Class
    this.classId = submission.classId;
    if (submission.class) {
      this.className = submission.class.name;
    }

    this.gitLink = submission.gitLink;
    this.description = submission.description;
    this.status = submission.status;
    this.feedback = submission.feedback;
    this.reviewerId = submission.reviewerId;
    this.score = submission.score;
    this.createdAt = submission.createdAt;
    this.updatedAt = submission.updatedAt;
    this.lessonItemId = submission.lessonItemId;

    if (submission.lessonItem) {
      this.lessonItemTitle = submission.lessonItem.title || 'Bài tập không tên';
    }
  }
}
