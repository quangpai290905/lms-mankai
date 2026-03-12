// src/modules/auth/dtos/change-password.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty({ example: '12345678', description: 'Mật khẩu cũ hiện tại' })
  @IsNotEmpty()
  @IsString()
  oldPassword: string;

  @ApiProperty({
    example: 'newPassword@123',
    description: 'Mật khẩu mới (tối thiểu 8 ký tự)',
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(8, { message: 'Mật khẩu mới phải có ít nhất 8 ký tự' })
  newPassword: string;
}
