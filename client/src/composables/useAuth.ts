import { computed, ref } from "vue";
// import { authApi, type User } from '@/api/auth' // Uncomment after completing the backend

// ==========================================
// Manage authentication status
// ==========================================

// Current user information (User type used when linking backend)
// admin, operator = administrator privileges / member, user = general privileges
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
  //login
  // TODO: Change to actual API call after completing the backend
  // ==========================================
  const login = async (email: string, password: string): Promise<boolean> => {
    loadingRef.value = true;
    errorRef.value = null;

    try {
      // ========== Backend integration code (uncomment and use) ==========
      // const response = await authApi.login({ email, password })
      // if (response.data.success && response.data.data) {
      //   const user = response.data.data
      //   isLoggedInRef.value = true
      //   userRef.value = {
      //     id: user.id,
      //     email: user.email,
      //     name: user.name,
      //     role: user.role,
      //   }
      //   localStorage.setItem('userRole', user.role)
      //   localStorage.setItem('userName', user.name)
      //   localStorage.setItem('userEmail', user.email)
      //   return true
      // }
      // return false
      // ========================================================

      // ========== Mock login (used until backend completion) ==========
      await new Promise((resolve) => setTimeout(resolve, 500)); // API call simulation

      // Administrator account
      if (email === "admin@obed.com" && password === "admin123") {
        isLoggedInRef.value = true;
        userRef.value = { id: 1, email, name: "관리자", role: "admin" };
        localStorage.setItem("token", "mock-admin-token");
        localStorage.setItem(
          "user",
          JSON.stringify({
            userId: "1",
            email,
            name: "관리자",
            role: "admin",
          }),
        );
        return true;
      }

      // Administrator account (same privileges as administrator)
      if (email === "operator@obed.com" && password === "operator123") {
        isLoggedInRef.value = true;
        userRef.value = { id: 2, email, name: "운영자", role: "operator" };
        localStorage.setItem("token", "mock-operator-token");
        localStorage.setItem(
          "user",
          JSON.stringify({
            userId: "2",
            email,
            name: "운영자",
            role: "operator",
          }),
        );
        return true;
      }

      // member account
      if (email === "member@obed.com" && password === "member123") {
        isLoggedInRef.value = true;
        userRef.value = { id: 3, email, name: "멤버", role: "member" };
        localStorage.setItem("token", "mock-member-token");
        localStorage.setItem(
          "user",
          JSON.stringify({
            userId: "3",
            email,
            name: "멤버",
            role: "member",
          }),
        );
        return true;
      }

      // Regular user (any other email/password)
      if (email && password) {
        isLoggedInRef.value = true;
        userRef.value = { id: 4, email, name: "홍길동", role: "user" };
        localStorage.setItem("token", "mock-user-token");
        localStorage.setItem(
          "user",
          JSON.stringify({
            userId: "4",
            email,
            name: "홍길동",
            role: "user",
          }),
        );
        return true;
      }

      errorRef.value = "이메일 또는 비밀번호가 일치하지 않습니다.";
      return false;
      // ========================================================
    } catch (err: any) {
      errorRef.value = err.response?.data?.message || "로그인에 실패했습니다.";
      return false;
    } finally {
      loadingRef.value = false;
    }
  };

  // ==========================================
  // Sign up
  // TODO: Change to actual API call after completing the backend
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
      // ========== Backend integration code (uncomment and use) ==========
      // const response = await authApi.register({ email, password, name, phone })
      // if (response.data.success) {
      //   return true
      // }
      // errorRef.value = response.data.message || '회원가입에 실패했습니다.'
      // return false
      // ========================================================

      // ========== Mock membership registration (used until backend completion) ==========
      await new Promise((resolve) => setTimeout(resolve, 500));

      if (email && password && name) {
        console.log("회원가입 성공 (Mock):", { email, name, phone });
        return true;
      }

      errorRef.value = "모든 필수 항목을 입력해주세요.";
      return false;
      // ========================================================
    } catch (err: any) {
      errorRef.value =
        err.response?.data?.message || "회원가입에 실패했습니다.";
      return false;
    } finally {
      loadingRef.value = false;
    }
  };

  // ==========================================
  // logout
  // TODO: Change to actual API call after completing the backend
  // ==========================================
  const logout = async (): Promise<void> => {
    try {
      // ========== Backend integration code (uncomment and use) ==========
      // await authApi.logout()
      // ========================================================
    } catch (err) {
      console.error("로그아웃 API 실패:", err);
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
  // TODO: Change to actual API call after completing the backend
  // ==========================================
  const checkSession = async (): Promise<boolean> => {
    try {
      // ========== Backend integration code (uncomment and use) ==========
      // const response = await authApi.checkSession()
      // if (response.data.authenticated && response.data.data) {
      //   isLoggedInRef.value = true
      //   userRef.value = {
      //     id: response.data.data.userId,
      //     email: response.data.data.email,
      //     name: response.data.data.name,
      //     role: response.data.data.role,
      //   }
      //   return true
      // }
      // // 세션 만료 시 로컬 상태 초기화
      // await logout()
      // return false
      // ========================================================

      // ========== Check Mock session (used until backend completion) ==========
      return isLoggedInRef.value;
      // ========================================================
    } catch (err) {
      console.error("세션 확인 실패:", err);
      return false;
    }
  };

  // ==========================================
  // change password
  // TODO: Change to actual API call after completing the backend
  // ==========================================
  const changePassword = async (
    currentPassword: string,
    newPassword: string,
  ): Promise<boolean> => {
    loadingRef.value = true;
    errorRef.value = null;

    try {
      // ========== Backend integration code (uncomment and use) ==========
      // const response = await authApi.changePassword({ currentPassword, newPassword })
      // if (response.data.success) {
      //   return true
      // }
      // errorRef.value = response.data.message
      // return false
      // ========================================================

      // ========== Mock (used until backend completion) ==========
      await new Promise((resolve) => setTimeout(resolve, 500));
      console.log("비밀번호 변경 (Mock)");
      return true;
      // ========================================================
    } catch (err: any) {
      errorRef.value =
        err.response?.data?.message || "비밀번호 변경에 실패했습니다.";
      return false;
    } finally {
      loadingRef.value = false;
    }
  };

  // Error initialization
  const clearError = () => {
    errorRef.value = null;
  };

  return {
    // situation
    isLoggedIn,
    isAdmin,
    isMember,
    currentUser,
    loading,
    error,

    //method
    login,
    register,
    logout,
    checkSession,
    changePassword,
    clearError,
  };
}
