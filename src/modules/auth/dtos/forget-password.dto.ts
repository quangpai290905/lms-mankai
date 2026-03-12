import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class ForgotPasswordDto {
  @ApiProperty({ example: 'test@example.com', description: 'Email đã đăng ký' })
  @IsNotEmpty()
  @IsEmail()
  email: string;
}
