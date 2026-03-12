// src/modules/auth/auth.controller.ts
import {
  Controller,
  Post,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  Request,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterAuthDto } from './dtos/register-auth.dto';
import { LoginAuthDto } from './dtos/login-auth.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtRefreshGuard } from 'src/shared/guard/jwt-refresh.guard';
// Đảm bảo import JwtAuthGuard (guard check Access Token)
import { JwtAuthGuard } from '../../shared/guard/auth.guard';

@ApiTags('01. Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Đăng ký tài khoản mới' })
  @ApiResponse({ status: 201, description: 'Tạo tài khoản thành công.' })
  register(@Body() registerAuthDto: RegisterAuthDto) {
    return this.authService.register(registerAuthDto);
  }

  @HttpCode(HttpStatus.OK)
  @Post('login')
  @ApiOperation({ summary: 'Đăng nhập vào hệ thống' })
  @ApiResponse({
    status: 200,
    description: 'Đăng nhập thành công, trả về access_token và refresh_token.',
  })
  login(@Body() loginAuthDto: LoginAuthDto) {
    return this.authService.login(loginAuthDto);
  }

  @UseGuards(JwtRefreshGuard)
  @Post('refresh')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Làm mới Access Token' })
  refreshToken(@Request() req) {
    const user = req.user;
    return this.authService.refreshToken(user);
  }

  // 🟢 MỚI: API Logout
  @UseGuards(JwtAuthGuard) // Cần access token hợp lệ để biết ai đang logout
  @Post('logout')
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Đăng xuất (Xóa Refresh Token)' })
  async logout(@Request() req) {
    const userId = req.user.user_id; // Lấy ID từ token payload
    await this.authService.logout(userId);
    return { message: 'Đăng xuất thành công' };
  }
}
