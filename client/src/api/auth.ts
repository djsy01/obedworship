import axios from "./axios";
import type { User, LoginRequest, RegisterRequest, ChangePasswordRequest, AuthResponse, SessionResponse } from "./auth-types";
export type * from "./auth-types";

import { verificationFlow } from "./verification";
const signup = verificationFlow("/auth/verify-code");
const reset = verificationFlow("/auth/verify-reset-code");

export const authApi = {
  sendVerification: (email: string) =>
    axios.post<AuthResponse>("/auth/send-verification", { email }),

  verifyCode: (email: string, code: string) =>
    signup.verify(email, code),

  register: (data: RegisterRequest) =>
    axios.post<AuthResponse>("/auth/register", { ...data, verificationToken: signup.token(data.email) }),

  login: (data: LoginRequest) => axios.post<AuthResponse>("/auth/login", data),

  logout: () => axios.post<AuthResponse>("/auth/logout"),

  getCurrentUser: () => axios.get<{ success: boolean; data: User }>("/auth/me"),

  checkSession: () => axios.get<SessionResponse>("/auth/session"),

  changePassword: (data: ChangePasswordRequest) =>
    axios.post<AuthResponse>("/auth/change-password", data),

  forgotPassword: (email: string) =>
    axios.post<AuthResponse>("/auth/forgot-password", { email }),

  verifyResetCode: (email: string, code: string) =>
    reset.verify(email, code),

  resetPassword: (email: string, newPassword: string) =>
    axios.post<AuthResponse>("/auth/reset-password", {
      email,
      newPassword,
      verificationToken: reset.token(email),
    }),
};
