import { authApi } from "@/api/auth";
import { clearSession, isLoggedIn, mockToken, sessionToken, setSession } from "./session";

const mockUsers = {
  "admin@obed.com:admin123": { id: 1, name: "관리자", role: "admin" },
  "operator@obed.com:operator123": { id: 2, name: "운영자", role: "operator" },
  "member@obed.com:member123": { id: 3, name: "멤버", role: "member" },
} as const;

export async function login(email: string, password: string) {
  try {
    const { data } = await authApi.login({ email, password });
    if (!data.success || !data.data || !data.token) throw new Error(data.message);
    setSession(data.token, data.data);
  } catch (error) {
    const key = email + ":" + password;
    if (import.meta.env.DEV && Object.hasOwn(mockUsers, key)) {
      setSession(mockToken, { ...mockUsers[key as keyof typeof mockUsers], email });
      return;
    }
    throw error;
  }
}

export async function checkSession() {
  const token = sessionToken();
  if (import.meta.env.DEV && token === mockToken) return isLoggedIn.value;
  if (!token) {
    clearSession(null);
    return false;
  }
  try {
    const { data } = await authApi.checkSession();
    if (token !== sessionToken()) return isLoggedIn.value;
    if (data.authenticated && data.data) {
      const { userId: id, ...user } = data.data;
      setSession(token, { id, ...user });
      return true;
    }
    clearSession(token);
  } catch {
    return false;
  }
  return false;
}
