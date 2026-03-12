import { IsOptional, IsString, IsInt, Min, Max, IsEnum } from 'class-validator'; // <<< THÊM IsEnum
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger'; // <<< THÊM
import { UserRole } from 'src/constant/enum'; // <<< THÊM

export class SearchStudentDto {
  @ApiPropertyOptional({ description: 'Tìm kiếm chung (email, tên, sđt)' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Lọc theo email' })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiPropertyOptional({ description: 'Lọc theo tên' })
  @IsOptional()
  @IsString()
  full_name?: string;

  // --- THÊM MỚI TẠI ĐÂY ---
  @ApiPropertyOptional({ enum: UserRole, description: 'Lọc theo vai trò' })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;
  // --- KẾT THÚC THÊM MỚI ---

  @ApiPropertyOptional({ description: 'Số trang', default: 1, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Số lượng mục/trang',
    default: 10,
    minimum: 1,
    maximum: 100,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(1000)
  limit?: number = 10;
}
