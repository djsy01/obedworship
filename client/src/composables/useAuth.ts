/**
 * useAuth.ts - Authentication Composable for OBED Worship
 *
 * 실제 백엔드(server/routes/auth.js)를 우선 호출합니다.
 * 아래의 admin@obed.com 등 하드코딩 계정은 "로컬 개발 중 백엔드가 아직 안 붙었을 때"를 위한
 * 폴백이며, import.meta.env.DEV(로컬 dev 서버)에서만 동작합니다.
 * 프로덕션 빌드에서는 이 폴백이 완전히 비활성화되어, VITE_BASE_URL이 잘못 설정되어 있어도
 * 공개된 계정 정보로 관리자 권한을 얻을 수 없습니다.
 *
 * Role System (4 roles):
 * - admin: Full administrator access
 * - operator: Same privileges as admin (co-administrator)
 * - member: OBED Worship team member (logged in, basic access)
 * - user: General user (logged in, basic access)
 *
 * Permission Groups:
 * - isAdmin: admin OR operator (can manage content)
 * - isMember: Any logged in user (can access member features)
 *
 * [DEV ONLY] Mock Test Accounts — 로컬 개발(`npm run dev`)에서만 사용 가능:
 * - admin@obed.com / admin123 -> admin role
 * - operator@obed.com / operator123 -> operator role
 * - member@obed.com / member123 -> member role
 */
import { computed, ref } from "vue";
import { authApi } from "@/api/auth";

// ==========================================
// TYPE DEFINITIONS
// ==========================================

/**
 * User roles - 4 role permission system
 * admin, operator = Admin privileges (can manage content)
 * member, user = Regular privileges (can view/use features)
 */
type UserRole = "admin" | "operator" | "member" | "user";

interface CurrentUser {
  id?: number;
  email: string;
  name: string;
  role: UserRole;
}

const isLoggedInRef = ref(false);
const userRef = ref<CurrentUser | null>(null);
const loadingRef = ref(false);
const errorRef = ref<string | null>(null);

// ==========================================
// Reset - restore authentication state on page load
// ==========================================
const initAuth = () => {
  const storedToken = localStorage.getItem("token");
  const storedUserStr = localStorage.getItem("user");

  if (storedToken && storedUserStr) {
    try {
      const storedUser = JSON.parse(storedUserStr);
      isLoggedInRef.value = true;
      userRef.value = {
        id: storedUser.userId ? parseInt(storedUser.userId) : undefined,
        email: storedUser.email || "",
        name: storedUser.name || "",
        role: storedUser.role as UserRole,
      };
    } catch {
      // Compatible with existing method
      const storedRole = localStorage.getItem("userRole");
      const storedEmail = localStorage.getItem("userEmail");
      const storedName = localStorage.getItem("userName");
      if (storedRole) {
        isLoggedInRef.value = true;
        userRef.value = {
          email: storedEmail || "",
          name: storedName || "",
          role: storedRole as UserRole,
        };
      }
    }
  }
};

// Initialize when app starts
initAuth();

// ==========================================
// useAuth Composable
// ==========================================
export function useAuth() {
  // Computed property
  const isLoggedIn = computed(() => isLoggedInRef.value);
  // Both admin and operator have administrator privileges
  const isAdmin = computed(
    () => userRef.value?.role === "admin" || userRef.value?.role === "operator",
  );
  // member and user have general permissions (including all logged in users)
  const isMember = computed(() => isLoggedInRef.value);
  const currentUser = computed(() => userRef.value);
  const loading = computed(() => loadingRef.value);
  const error = computed(() => errorRef.value);

  // ==========================================
  // login — 실제 백엔드 우선 호출, 실패 시 [DEV ONLY] mock 폴백
  // ==========================================
  const login = async (email: string, password: string): Promise<boolean> => {
    loadingRef.value = true;
    errorRef.value = null;

    try {
      const response = await authApi.login({ email, password });
      if (response.data.success && response.data.data) {
        const user = response.data.data;
        isLoggedInRef.value = true;
        userRef.value = {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
        if (response.data.token) {
          localStorage.setItem("token", response.data.token);
        }
        localStorage.setItem(
          "user",
          JSON.stringify({ userId: String(user.id), email: user.email, name: user.name, role: user.role }),
        );
        return true;
      }
      errorRef.value = response.data.message || "로그인에 실패했습니다.";
      return false;
    } catch (err: any) {
      // [DEV ONLY] 백엔드(VITE_BASE_URL)가 아직 로컬에 안 붙어있을 때만 쓰는 폴백.
      // 프로덕션 빌드에서는 import.meta.env.DEV가 false라 이 블록이 아예 실행되지 않는다 —
      // 즉 admin@obed.com 같은 계정은 배포된 사이트에서는 통하지 않는다.
      if (import.meta.env.DEV) {
        await new Promise((resolve) => setTimeout(resolve, 300));

        const mockAccounts: Record<string, { id: number; name: string; role: "admin" | "operator" | "member" }> = {
          "admin@obed.com:admin123": { id: 1, name: "관리자", role: "admin" },
          "operator@obed.com:operator123": { id: 2, name: "운영자", role: "operator" },
          "member@obed.com:member123": { id: 3, name: "멤버", role: "member" },
        };
        const mock = mockAccounts[`${email}:${password}`];
        if (mock) {
          isLoggedInRef.value = true;
          userRef.value = { id: mock.id, email, name: mock.name, role: mock.role };
          localStorage.setItem("token", "mock-dev-only-token");
          localStorage.setItem(
            "user",
            JSON.stringify({ userId: String(mock.id), email, name: mock.name, role: mock.role }),
          );
          return true;
        }
      }

      errorRef.value = err.response?.data?.message || "이메일 또는 비밀번호가 일치하지 않습니다.";
      return false;
    } finally {
      loadingRef.value = false;
    }
  };

  // ==========================================
  // Sign up — 실제 백엔드 호출
  // ==========================================
  const register = async (
    email: string,
    password: string,
    name: string,
    phone?: string,
  ): Promise<boolean> => {
    loadingRef.value = true;
    errorRef.value = null;

    try {
      const response = await authApi.register({ email, password, name, phone });
      if (response.data.success) {
        return true;
      }
      errorRef.value = response.data.message || "회원가입에 실패했습니다.";
      return false;
    } catch (err: any) {
      errorRef.value = err.response?.data?.message || "회원가입에 실패했습니다.";
      return false;
    } finally {
      loadingRef.value = false;
    }
  };

  // ==========================================
  // logout
  // ==========================================
  const logout = async (): Promise<void> => {
    try {
      await authApi.logout();
    } catch (err) {
      console.error("Logout API failed:", err);
    } finally {
      // initialize local state
      isLoggedInRef.value = false;
      userRef.value = null;
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      // Clean up existing keys as well
      localStorage.removeItem("userRole");
      localStorage.removeItem("userName");
      localStorage.removeItem("userEmail");
    }
  };

  // ==========================================
  // Check session (check authentication status when page refresh)
  // ==========================================
  const checkSession = async (): Promise<boolean> => {
    try {
      const response = await authApi.checkSession();
      if (response.data.authenticated && response.data.data) {
        isLoggedInRef.value = true;
        userRef.value = {
          id: response.data.data.userId,
          email: response.data.data.email,
          name: response.data.data.name,
          role: response.data.data.role,
        };
        return true;
      }
      // Reset local state when session expires
      await logout();
      return false;
    } catch (err) {
      console.error("Session check failed:", err);
      // [DEV ONLY] 백엔드가 아직 안 붙어있으면 로컬에 저장된 mock 상태를 유지한다.
      if (import.meta.env.DEV) {
        return isLoggedInRef.value;
      }
      return false;
    }
  };

  // ==========================================
  // change password — 실제 백엔드 호출
  // ==========================================
  const changePassword = async (
    currentPassword: string,
    newPassword: string,
  ): Promise<boolean> => {
    loadingRef.value = true;
    errorRef.value = null;

    try {
      const response = await authApi.changePassword({ currentPassword, newPassword });
      if (response.data.success) {
        return true;
      }
      errorRef.value = response.data.message || "비밀번호 변경에 실패했습니다.";
      return false;
    } catch (err: any) {
      errorRef.value = err.response?.data?.message || "비밀번호 변경에 실패했습니다.";
      return false;
    } finally {
      loadingRef.value = false;
    }
  };

  /**
   * Clear any error messages
   */
  const clearError = () => {
    errorRef.value = null;
  };

  return {
    // State (reactive)
    isLoggedIn,       // Boolean: User is logged in
    isAdmin,          // Boolean: User is admin or operator
    isMember,         // Boolean: User is logged in (any role)
    currentUser,      // User object or null
    loading,          // Boolean: API call in progress
    error,            // Error message or null

    // Methods
    login,            // Login with email/password
    register,         // Register new user
    logout,           // Logout and clear state
    checkSession,     // Verify session is still valid
    changePassword,   // Change user password
    clearError,       // Clear error message
  };
}
