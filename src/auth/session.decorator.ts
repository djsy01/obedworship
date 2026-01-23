import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { SessionUser } from '../types/session.types';

// 세션에서 현재 사용자 정보를 가져오는 데코레이터
export const CurrentUser = createParamDecorator(
  (data: keyof SessionUser | undefined, ctx: ExecutionContext): SessionUser | any => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.session?.userId
      ? {
          userId: request.session.userId,
          email: request.session.email,
          role: request.session.role,
          name: request.session.name,
        }
      : null;

    return data && user ? user[data] : user;
  },
);

// 세션 객체 자체를 가져오는 데코레이터
export const Session = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.session;
  },
);
