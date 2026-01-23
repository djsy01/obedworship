import {
  Controller,
  Post,
  Get,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  Session as SessionDecorator,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto, ChangePasswordDto } from './auth.dto';
import { Public } from './public.decorator';
import { CurrentUser } from './session.decorator';
import { SessionUser } from '../types/session.types';
import { Session } from 'express-session';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  // 회원가입 (Public)
  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() registerDto: RegisterDto) {
    const user = await this.authService.register(registerDto);
    return {
      success: true,
      message: '회원가입이 완료되었습니다.',
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  }

  // 로그인 (Public)
  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() loginDto: LoginDto,
    @SessionDecorator() session: Session & { userId?: number; email?: string; role?: string; name?: string },
  ) {
    const user = await this.authService.login(loginDto);

    // 세션에 사용자 정보 저장
    session.userId = user.id;
    session.email = user.email;
    session.role = user.role;
    session.name = user.name;

    return {
      success: true,
      message: '로그인되었습니다.',
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  }

  // 로그아웃
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@SessionDecorator() session: Session) {
    return new Promise((resolve, reject) => {
      session.destroy((err) => {
        if (err) {
          reject(new UnauthorizedException('로그아웃에 실패했습니다.'));
        } else {
          resolve({
            success: true,
            message: '로그아웃되었습니다.',
          });
        }
      });
    });
  }

  // 현재 사용자 정보 조회
  @Get('me')
  @HttpCode(HttpStatus.OK)
  async getCurrentUser(@CurrentUser() user: SessionUser) {
    if (!user) {
      throw new UnauthorizedException('로그인이 필요합니다.');
    }

    const userData = await this.authService.getCurrentUser(user.userId);

    return {
      success: true,
      data: userData,
    };
  }

  // 세션 확인 (Public) - 프론트엔드에서 세션 유효성 체크용
  @Public()
  @Get('session')
  @HttpCode(HttpStatus.OK)
  async checkSession(@SessionDecoator() session: Session & { userId?: number; email?: string; role?: string; name?: string }) {
    if (!session.userId) {
      return {
        success: false,
        authenticated: false,
        data: null,
      };
    }

    return {
      success: true,
      authenticated: true,
      data: {
        userId: session.userId,
        email: session.email,
        role: session.role,
        name: session.name,
      },
    };
  }

  // 비밀번호 변경
  @Post('change-password')
  @HttpCode(HttpStatus.OK)
  async changePassword(@CurrentUser() user: SessionUser, @Body() changePasswordDto: ChangePasswordDto) {
    if (!user) {
      throw new UnauthorizedException('로그인이 필요합니다.');
    }

    await this.authService.changePassword(user.userId, changePasswordDto);

    return {
      success: true,
      message: '비밀번호가 변경되었습니다.',
    };
  }
}
