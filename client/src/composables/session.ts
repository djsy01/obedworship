import { computed, ref, shallowRef } from "vue";
import type { User, UserRole } from "@/api/auth-types";

type SessionUser = Pick<User, "id" | "email" | "name" | "role">;
const signedInUser = shallowRef<SessionUser | null>(null);
export const sessionExpired = ref(false);
export const currentUser = computed(() => signedInUser.value);
export const isLoggedIn = computed(() => currentUser.value !== null);
export const isAdmin = computed(() => ["admin", "operator"].some(role => role === currentUser.value?.role));
export const isSuperAdmin = computed(() => currentUser.value?.role === "admin");
export const roleLabels: Record<UserRole, string> = {
  admin: "관리자",
  operator: "운영자",
  user: "일반 사용자",
};
export const sessionName = computed(() => {
  const user = currentUser.value;
  if (!user) return "";
  return localStorage.getItem("userName") || roleLabels[user.role] || "사용자";
});
export const sessionToken = () => localStorage.getItem("token");
export const mockToken = "mock-dev-only-token";

export function setSession(token: string, { id, email, name, role: savedRole }: SessionUser) {
  const role = savedRole === "admin" || savedRole === "operator" ? savedRole : "user";
  localStorage.setItem("token", token);
  localStorage.setItem("user", JSON.stringify({ userId: String(id), email, name, role }));
  signedInUser.value = { id, email, name, role };
  sessionExpired.value = false;
}

export function clearSession(token: string | null, expired = false) {
  if (token !== sessionToken()) return;
  signedInUser.value = null;
  for (const key of ["token", "user", "userRole", "userName", "userEmail"]) {
    localStorage.removeItem(key);
  }
  sessionExpired.value = expired;
}

if (import.meta.env.DEV && sessionToken() === mockToken) {
  try {
    const user = JSON.parse(localStorage.getItem("user") || "null");
    if (user) setSession(mockToken, { ...user, id: Number(user.userId) });
  } catch {
    clearSession(mockToken);
  }
}
