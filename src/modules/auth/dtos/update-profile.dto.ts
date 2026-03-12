import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsPhoneNumber } from 'class-validator';

export class UpdateProfileDto {
  @ApiProperty({
    required: false,
    example: 'Nguyen Van B',
    description: 'Họ và tên mới',
  })
  @IsOptional()
  @IsString()
  full_name?: string;

  @ApiProperty({
    required: false,
    example: '0912345678',
    description: 'Số điện thoại mới',
  })
  @IsOptional()
  @IsPhoneNumber('VN')
  phone?: string;
}
