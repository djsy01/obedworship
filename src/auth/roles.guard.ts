import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { users_role } from '@prisma/client';

export const ROLES_KEY = 'roles';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // @Roles() 데코레이터에서 설정한 역할 목록 가져오기
    const requiredRoles = this.reflector.getAllAndOverride<users_role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // 역할 제한이 없으면 통과
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const session = request.session;

    // 세션에 역할 정보가 없으면 차단
    if (!session || !session.role) {
      throw new ForbiddenException('권한이 없습니다.');
    }

    // 사용자의 역할이 필요한 역할 목록에 포함되어 있는지 확인
    const hasRole = requiredRoles.includes(session.role as users_role);

    if (!hasRole) {
      throw new ForbiddenException('이 작업을 수행할 권한이 없습니다.');
    }

    return true;
  }
}
