import { SubmissionResponseDto } from './submission-response.dto';

export class PaginatedSubmissionsResponseDto {
  data: SubmissionResponseDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;

  constructor(
    data: SubmissionResponseDto[],
    total: number,
    page: number,
    limit: number,
  ) {
    this.data = data;
    this.total = total;
    this.page = page;
    this.limit = limit;
    this.totalPages = Math.ceil(total / limit);
  }
}
