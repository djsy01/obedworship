import { isAxiosError } from "axios";
import { ref } from "vue";
import { authApi } from "@/api/auth";
import { checkSession, login as authenticate } from "./auth-session";
import { clearSession, currentUser, isAdmin, isLoggedIn, isSuperAdmin, sessionToken } from "./session";

const loading = ref(false);
const error = ref<string | null>(null);

async function submit(action: () => Promise<unknown>, fallback: string) {
  loading.value = true;
  error.value = null;
  try {
    await action();
    return true;
  } catch (cause) {
    error.value = (isAxiosError(cause) && cause.response?.data?.message) || fallback;
    return false;
  } finally {
    loading.value = false;
  }
}

const login = (email: string, password: string) =>
  submit(() => authenticate(email, password), "이메일 또는 비밀번호가 일치하지 않습니다.");

const register = (email: string, password: string, name: string, phone?: string) =>
  submit(async () => {
    const { data } = await authApi.register({ email, password, name, phone });
    if (!data.success) throw new Error(data.message);
  }, "회원가입에 실패했습니다.");

async function logout() {
  clearSession(sessionToken());
  try {
    await authApi.logout();
  } catch {
    return;
  }
}

async function changePassword(currentPassword: string, newPassword: string) {
  const token = sessionToken();
  return submit(async () => {
    const { data } = await authApi.changePassword({ currentPassword, newPassword });
    if (!data.success) throw new Error(data.message);
    clearSession(token, true);
  }, "비밀번호 변경에 실패했습니다.");
}

export function useAuth() {
  return { isLoggedIn, isAdmin, isSuperAdmin, isMember: isLoggedIn, currentUser, loading, error,
    login, register, logout, checkSession, changePassword, clearError: () => { error.value = null; } };
}
