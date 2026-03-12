import { IsString, IsOptional, IsPhoneNumber } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateProfileDto {
  @ApiPropertyOptional({ example: 'Nguyễn Văn C', description: 'Họ và tên' })
  @IsOptional()
  @IsString()
  full_name?: string;

  @ApiPropertyOptional({ example: '0123456789', description: 'Số điện thoại' })
  @IsOptional()
  @IsPhoneNumber('VN', { message: 'Số điện thoại không hợp lệ' })
  phone?: string;

  @ApiPropertyOptional({ example: 'Đà Nẵng', description: 'Địa chỉ' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({
    example: 'https://example.com/new-avatar.jpg',
    description: 'Link avatar',
  })
  @IsOptional()
  @IsString()
  avatar?: string;

  @ApiPropertyOptional({ example: '1995-05-15', description: 'Ngày sinh' })
  @IsOptional()
  dateOfBirth?: Date;

  @ApiPropertyOptional({ example: 'female', description: 'Giới tính' })
  @IsOptional()
  @IsString()
  gender?: string;
}
