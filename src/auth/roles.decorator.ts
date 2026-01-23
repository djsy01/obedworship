import { SetMetadata } from '@nestjs/common';
import { users_role } from '@prisma/client';
import { ROLES_KEY } from './roles.guard';

// 특정 역할만 접근 가능하도록 설정하는 데코레이터
export const Roles = (...roles: users_role[]) => SetMetadata(ROLES_KEY, roles);
