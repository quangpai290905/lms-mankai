// src/modules/auth/auth.service.ts
import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './database/user.entity';
import { RegisterAuthDto } from './dtos/register-auth.dto';
import { LoginAuthDto } from './dtos/login-auth.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UserRole } from 'src/constant/enum';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async register(registerAuthDto: RegisterAuthDto): Promise<User> {
    const { email, password, full_name, phone, studentCode } = registerAuthDto;

    const existingUser = await this.usersRepository.findOneBy({ email });
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    let finalStudentCode = studentCode;
    if (finalStudentCode) {
      const existingCode = await this.usersRepository.findOneBy({
        student_code: finalStudentCode,
      });
      if (existingCode)
        throw new ConflictException('Student code already exists');
    } else {
      const timestamp = Date.now().toString().slice(-6);
      finalStudentCode = `SV${timestamp}`;
    }

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = this.usersRepository.create({
      email,
      password: hashedPassword,
      full_name,
      phone,
      role: UserRole.STUDENT,
      student_code: finalStudentCode,
    });

    await this.usersRepository.save(newUser);
    delete newUser.password;
    return newUser;
  }

  async login(
    loginAuthDto: LoginAuthDto,
  ): Promise<{ access_token: string; refresh_token: string }> {
    const { email, password } = loginAuthDto;

    const user = await this.usersRepository.findOneBy({ email });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordMatching = await bcrypt.compare(password, user.password);
    if (!isPasswordMatching) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { email: user.email, sub: user.user_id, role: user.role };

    const [access_token, refresh_token] = await Promise.all([
      this.jwtService.sign(payload, {
        secret: this.configService.get<string>('JWT_SECRET'),
        expiresIn: this.configService.get<string>('JWT_EXPIRES_IN'),
      }),
      this.jwtService.sign(payload, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRES_IN'),
      }),
    ]);

    const salt = await bcrypt.genSalt();
    const hashedRt = await bcrypt.hash(refresh_token, salt);

    await this.usersRepository.update(user.user_id, {
      hashed_refresh_token: hashedRt,
    });

    return { access_token, refresh_token };
  }

  async refreshToken(user: User): Promise<{ access_token: string }> {
    const payload = {
      email: user.email,
      sub: user.user_id,
      role: user.role,
    };

    const access_token = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_SECRET'),
      expiresIn: this.configService.get<string>('JWT_EXPIRES_IN'),
    });

    return { access_token };
  }
  async logout(userId: string) {
    // Set hashed_refresh_token về null
    return this.usersRepository.update(userId, { hashed_refresh_token: null });
  }
}
