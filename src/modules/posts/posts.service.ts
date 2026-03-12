import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm'; // <-- 1. IMPORT Like
import { Post } from './post.entity'; // (Kiểm tra lại tên file post.entity.ts của bạn)
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';

// 2. (Tùy chọn) Định nghĩa một kiểu dữ liệu cho rõ ràng
interface FindAllOptions {
  page: number;
  limit: number;
  search: string;
}

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private postsRepository: Repository<Post>,
  ) {}

  create(createPostDto: CreatePostDto) {
    // (Logic tạo mới của bạn)
    const newPost = this.postsRepository.create(createPostDto);
    return this.postsRepository.save(newPost);
  }

  // === 3. SỬA HÀM FINDALL NÀY ===
  async findAll(options: FindAllOptions) {
    const { page, limit, search } = options;

    // Tính toán 'skip' (bỏ qua bao nhiêu)
    const skip = (page - 1) * limit;

    // 4. Xây dựng điều kiện 'where'
    const whereCondition = search
      ? { title: Like(`%${search}%`) } // Tìm kiếm theo 'title' (hoặc 'content')
      : {}; // Nếu không có search thì để trống

    // 5. Dùng findAndCount để lấy cả dữ liệu và tổng số
    const [results, total] = await this.postsRepository.findAndCount({
      where: whereCondition,
      take: limit, // Giới hạn (limit)
      skip: skip, // Bỏ qua (offset)
      order: { createdAt: 'DESC' }, // Sắp xếp (tùy chọn)
    });

    // 6. Trả về kết quả đã phân trang
    return {
      data: results,
      totalItems: total,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
    };
  }

  findOne(id: number) {
    return this.postsRepository.findOneBy({ id });
  }

  update(id: number, updatePostDto: UpdatePostDto) {
    return this.postsRepository.update(id, updatePostDto);
  }

  remove(id: number) {
    return this.postsRepository.delete(id);
  }
}
