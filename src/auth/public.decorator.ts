import { SetMetadata } from '@nestjs/common';
import { IS_PUBLIC_KEY } from './auth.guard';

// 인증 없이 접근 가능한 엔드포인트를 표시하는 데코레이터
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
