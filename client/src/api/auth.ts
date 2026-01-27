import axios from "./axios";

// ==========================================
// Definition of authentication-related types
// Need to be modified to match the actual response after completing the backend API
// ==========================================

export interface User {
  id: number;
  email: string;
  name: string;
  role: "admin" | "member" | "user";
  phone?: string;
  is_active: boolean;
  email_verified: boolean;
  created_at?: string;
  last_login_at?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  phone?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data?: User;
}

export interface SessionResponse {
  success: boolean;
  authenticated: boolean;
  data: {
    userId: number;
    email: string;
    role: "admin" | "member" | "user";
    name: string;
  } | null;
}

// ==========================================
// Authentication API client
// Uncomment and use after completing the backend API
// ==========================================

export const authApi = {
  // join the membership
  register: (data: RegisterRequest) =>
    axios.post<AuthResponse>("/auth/register", data),

  // log in
  login: (data: LoginRequest) => axios.post<AuthResponse>("/auth/login", data),

  // log out
  logout: () => axios.post<AuthResponse>("/auth/logout"),

  // Check current user information
  getCurrentUser: () => axios.get<{ success: boolean; data: User }>("/auth/me"),

  // Check session (check login status)
  checkSession: () => axios.get<SessionResponse>("/auth/session"),

  // change password
  changePassword: (data: ChangePasswordRequest) =>
    axios.post<AuthResponse>("/auth/change-password", data),

  // Password reset request (send email)
  forgotPassword: (email: string) =>
    axios.post<AuthResponse>("/auth/forgot-password", { email }),

  // reset password
  resetPassword: (email: string, token: string, newPassword: string) =>
    axios.post<AuthResponse>("/auth/reset-password", {
      email,
      resetToken: token,
      newPassword,
    }),
};
