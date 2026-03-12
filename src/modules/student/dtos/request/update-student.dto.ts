import {
  IsString,
  IsOptional,
  IsPhoneNumber,
  IsBoolean,
  IsEmail,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateStudentDto {
  @ApiPropertyOptional({
    example: 'newemail@example.com',
    description: 'Email mới',
  })
  @IsOptional()
  @IsEmail({}, { message: 'Email không hợp lệ' })
  email?: string;

  @ApiPropertyOptional({ example: 'Nguyễn Văn B', description: 'Họ và tên' })
  @IsOptional()
  @IsString()
  full_name?: string;

  @ApiPropertyOptional({ example: '0987654321', description: 'Số điện thoại' })
  @IsOptional()
  @IsPhoneNumber('VN', { message: 'Số điện thoại không hợp lệ' })
  phone?: string;

  @ApiPropertyOptional({ example: 'Hồ Chí Minh', description: 'Địa chỉ' })
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

  @ApiPropertyOptional({ example: false, description: 'Trạng thái hoạt động' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ example: '1995-05-15', description: 'Ngày sinh' })
  @IsOptional()
  dateOfBirth?: Date;

  @ApiPropertyOptional({ example: 'female', description: 'Giới tính' })
  @IsOptional()
  @IsString()
  gender?: string;
}
