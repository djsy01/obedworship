import axios from './axios'

// ==========================================
// 인증 관련 타입 정의
// 백엔드 API 완성 후 실제 응답에 맞게 수정 필요
// ==========================================

export interface User {
  id: number
  email: string
  name: string
  role: 'admin' | 'member' | 'user'
  phone?: string
  is_active: boolean
  email_verified: boolean
  created_at?: string
  last_login_at?: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  password: string
  name: string
  phone?: string
}

export interface ChangePasswordRequest {
  currentPassword: string
  newPassword: string
}

export interface AuthResponse {
  success: boolean
  message: string
  data?: User
}

export interface SessionResponse {
  success: boolean
  authenticated: boolean
  data: {
    userId: number
    email: string
    role: 'admin' | 'member' | 'user'
    name: string
  } | null
}

// ==========================================
// 인증 API 클라이언트
// 백엔드 API 완성 후 주석 해제하여 사용
// ==========================================

export const authApi = {
  // 회원가입
  register: (data: RegisterRequest) => axios.post<AuthResponse>('/auth/register', data),

  // 로그인
  login: (data: LoginRequest) => axios.post<AuthResponse>('/auth/login', data),

  // 로그아웃
  logout: () => axios.post<AuthResponse>('/auth/logout'),

  // 현재 사용자 정보 조회
  getCurrentUser: () => axios.get<{ success: boolean; data: User }>('/auth/me'),

  // 세션 확인 (로그인 상태 체크)
  checkSession: () => axios.get<SessionResponse>('/auth/session'),

  // 비밀번호 변경
  changePassword: (data: ChangePasswordRequest) =>
    axios.post<AuthResponse>('/auth/change-password', data),

  // 비밀번호 재설정 요청 (이메일 발송)
  forgotPassword: (email: string) =>
    axios.post<AuthResponse>('/auth/forgot-password', { email }),

  // 비밀번호 재설정
  resetPassword: (email: string, token: string, newPassword: string) =>
    axios.post<AuthResponse>('/auth/reset-password', {
      email,
      resetToken: token,
      newPassword,
    }),
}
