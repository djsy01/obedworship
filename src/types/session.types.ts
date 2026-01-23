import 'express-session';

declare module 'express-session' {
  interface SessionData {
    userId?: number;
    email?: string;
    role?: 'admin' | 'member' | 'user';
    name?: string;
  }
}

export interface SessionUser {
  userId: number;
  email: string;
  role: 'admin' | 'member' | 'user';
  name: string;
}
