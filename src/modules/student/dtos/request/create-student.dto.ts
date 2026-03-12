import {
  IsEmail,
  IsString,
  MinLength,
  IsOptional,
  IsPhoneNumber,
  IsEnum,
  IsBoolean,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from 'src/constant/enum';

export class CreateStudentDto {
  @ApiProperty({
    example: 'student1@example.com',
    description: 'Email học viên',
  })
  @IsEmail({}, { message: 'Email không hợp lệ' })
  email: string;

  @ApiPropertyOptional({
    example: 'SV001',
    description: 'Mã sinh viên (chỉ dành cho Student)',
  })
  @IsOptional()
  @IsString()
  studentCode?: string;

  @ApiProperty({
    example: 'password123',
    description: 'Mật khẩu (tối thiểu 6 ký tự)',
    minLength: 6,
  })
  @IsString()
  @MinLength(6, { message: 'Mật khẩu phải có ít nhất 6 ký tự' })
  password: string;

  @ApiProperty({ example: 'Nguyễn Văn A', description: 'Họ và tên' })
  @IsString()
  full_name: string;

  @ApiPropertyOptional({ example: '0123456789', description: 'Số điện thoại' })
  @IsOptional()
  @IsPhoneNumber('VN', { message: 'Số điện thoại không hợp lệ' })
  phone?: string;

  @ApiPropertyOptional({ example: 'Hà Nội', description: 'Địa chỉ' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({
    example: 'https://example.com/avatar.jpg',
    description: 'Link avatar',
  })
  @IsOptional()
  @IsString()
  avatar?: string;

  @ApiPropertyOptional({
    enum: UserRole,
    example: UserRole.STUDENT,
    description: 'Vai trò',
  })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @ApiPropertyOptional({
    example: true,
    description: 'Trạng thái hoạt động',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ example: '2000-01-01', description: 'Ngày sinh' })
  @IsOptional()
  dateOfBirth?: Date;

  @ApiPropertyOptional({ example: 'male', description: 'Giới tính' })
  @IsOptional()
  @IsString()
  gender?: string;
}
