// src/modules/auth/dtos/register-auth.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  IsOptional,
  IsPhoneNumber,
} from 'class-validator';

export class RegisterAuthDto {
  @ApiProperty({ example: 'Nguyen Van A', description: 'Họ và tên đầy đủ' })
  @IsNotEmpty()
  @IsString()
  full_name: string;

  @ApiProperty({
    required: false,
    example: 'SV2024001',
    description: 'Mã sinh viên',
  })
  @IsOptional()
  @IsString()
  studentCode?: string;

  @ApiProperty({
    example: 'test@example.com',
    description: 'Email duy nhất của người dùng',
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({
    example: '12345678',
    description: 'Mật khẩu phải có ít nhất 8 ký tự',
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  password: string;

  @ApiProperty({
    required: false,
    example: '0987654321',
    description: 'Số điện thoại (tùy chọn)',
  })
  @IsOptional()
  @IsPhoneNumber('VN')
  phone?: string;
}
