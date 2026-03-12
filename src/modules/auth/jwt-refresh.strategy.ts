// src/modules/auth/jwt-refresh.strategy.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './database/user.entity';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import * as bcrypt from 'bcrypt';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      // Dùng secret của REFRESH TOKEN
      secretOrKey: configService.get<string>('JWT_REFRESH_SECRET'),
      // Bắt buộc request phải được truyền vào hàm validate
      passReqToCallback: true,
    });
  }

  async validate(
    req: Request,
    payload: { sub: string; email: string; role: string },
  ) {
    const user = await this.usersRepository.findOneBy({ user_id: payload.sub });
    if (!user) {
      throw new UnauthorizedException();
    }

    // Lấy RT từ header
    const refreshToken = req.get('authorization').replace('Bearer', '').trim();

    // Kiểm tra xem RT có trong DB và có khớp không
    if (!user.hashed_refresh_token) {
      throw new UnauthorizedException(
        'Access Denied. No refresh token on record.',
      );
    }

    const isTokenMatching = await bcrypt.compare(
      refreshToken,
      user.hashed_refresh_token,
    );

    if (!isTokenMatching) {
      throw new UnauthorizedException('Access Denied. Token mismatch.');
    }

    // Xóa password và rt hash trước khi trả về user
    delete user.password;
    delete user.hashed_refresh_token;
    return user;
  }
}
