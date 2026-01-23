import { Injectable, UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { RegisterDto, LoginDto, ChangePasswordDto } from './auth.dto';
import { users, users_role } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

  // 회원가입
  async register(registerDto: RegisterDto): Promise<Omit<users, 'password_hash'>> {
    const { email, password, name, phone } = registerDto;

    // 이메일 중복 체크
    const existingUser = await this.prisma.users.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('이미 사용 중인 이메일입니다.');
    }

    // 비밀번호 해싱 (bcrypt salt rounds: 12)
    const saltRounds = 12;
    const password_hash = await bcrypt.hash(password, saltRounds);

    // 사용자 생성
    const user = await this.prisma.users.create({
      data: {
        email,
        password_hash,
        name,
        phone: phone || null,
        role: users_role.user, // 기본 역할은 user
        is_active: true,
        email_verified: false, // 이메일 인증은 추후 구현
      },
    });

    // 비밀번호 제외하고 반환
    const { password_hash: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  // 로그인
  async login(loginDto: LoginDto): Promise<Omit<users, 'password_hash'>> {
    const { email, password } = loginDto;

    // 사용자 조회
    const user = await this.prisma.users.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('이메일 또는 비밀번호가 일치하지 않습니다.');
    }

    // 계정 비활성화 체크
    if (!user.is_active) {
      throw new UnauthorizedException('비활성화된 계정입니다. 관리자에게 문의하세요.');
    }

    // 비밀번호 확인
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      throw new UnauthorizedException('이메일 또는 비밀번호가 일치하지 않습니다.');
    }

    // 마지막 로그인 시간 업데이트
    await this.prisma.users.update({
      where: { id: user.id },
      data: { last_login_at: new Date() },
    });

    // 비밀번호 제외하고 반환
    const { password_hash: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  // 현재 사용자 정보 조회
  async getCurrentUser(userId: number): Promise<Omit<users, 'password_hash'>> {
    const user = await this.prisma.users.findUnique({
      where: { id: userId },
      include: {
        members: {
          include: {
            member_roles: true,
            member_worship_positions: true,
            member_step_positions: true,
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('사용자를 찾을 수 없습니다.');
    }

    const { password_hash: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  // 비밀번호 변경
  async changePassword(userId: number, changePasswordDto: ChangePasswordDto): Promise<void> {
    const { currentPassword, newPassword } = changePasswordDto;

    // 현재 사용자 조회
    const user = await this.prisma.users.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('사용자를 찾을 수 없습니다.');
    }

    // 현재 비밀번호 확인
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password_hash);

    if (!isPasswordValid) {
      throw new BadRequestException('현재 비밀번호가 일치하지 않습니다.');
    }

    // 새 비밀번호가 현재 비밀번호와 같은지 체크
    if (currentPassword === newPassword) {
      throw new BadRequestException('새 비밀번호는 현재 비밀번호와 달라야 합니다.');
    }

    // 새 비밀번호 해싱
    const saltRounds = 12;
    const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

    // 비밀번호 업데이트
    await this.prisma.users.update({
      where: { id: userId },
      data: { password_hash: newPasswordHash },
    });
  }

  // 사용자 ID로 조회 (세션 검증용)
  async validateUserById(userId: number): Promise<Omit<users, 'password_hash'> | null> {
    const user = await this.prisma.users.findUnique({
      where: { id: userId },
    });

    if (!user || !user.is_active) {
      return null;
    }

    const { password_hash: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  // 이메일로 사용자 찾기 (비밀번호 재설정용)
  async findByEmail(email: string): Promise<users | null> {
    return this.prisma.users.findUnique({
      where: { email },
    });
  }

  // 비밀번호 재설정 (토큰 검증 후)
  async resetPassword(email: string, newPassword: string): Promise<void> {
    const user = await this.findByEmail(email);

    if (!user) {
      throw new BadRequestException('사용자를 찾을 수 없습니다.');
    }

    const saltRounds = 12;
    const password_hash = await bcrypt.hash(newPassword, saltRounds);

    await this.prisma.users.update({
      where: { id: user.id },
      data: { password_hash },
    });
  }
}
