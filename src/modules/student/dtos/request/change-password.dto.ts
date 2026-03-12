import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ChangePasswordDto {
  @ApiProperty({
    example: 'oldPassword123',
    description: 'Mật khẩu hiện tại',
    minLength: 6,
  })
  @IsString()
  @MinLength(6, { message: 'Mật khẩu hiện tại không hợp lệ' })
  currentPassword: string;

  @ApiProperty({
    example: 'newPassword123',
    description: 'Mật khẩu mới',
    minLength: 6,
  })
  @IsString()
  @MinLength(6, { message: 'Mật khẩu mới phải có ít nhất 6 ký tự' })
  newPassword: string;
}
