import { computed, ref } from 'vue'
// import { authApi, type User } from '@/api/auth' // 백엔드 완성 후 주석 해제

// ==========================================
// 인증 상태 관리
// ==========================================

// 현재 사용자 정보 (백엔드 연동 시 User 타입 사용)
// admin, operator = 관리자 권한 / member, user = 일반 권한
type UserRole = 'admin' | 'operator' | 'member' | 'user'

interface CurrentUser {
  id?: number
  email: string
  name: string
  role: UserRole
}

const isLoggedInRef = ref(false)
const userRef = ref<CurrentUser | null>(null)
const loadingRef = ref(false)
const errorRef = ref<string | null>(null)

// ==========================================
// 초기화 - 페이지 로드 시 인증 상태 복원
// ==========================================
const initAuth = () => {
  const storedToken = localStorage.getItem('token')
  const storedUserStr = localStorage.getItem('user')

  if (storedToken && storedUserStr) {
    try {
      const storedUser = JSON.parse(storedUserStr)
      isLoggedInRef.value = true
      userRef.value = {
        id: storedUser.userId ? parseInt(storedUser.userId) : undefined,
        email: storedUser.email || '',
        name: storedUser.name || '',
        role: storedUser.role as UserRole,
      }
    } catch {
      // 기존 방식 호환
      const storedRole = localStorage.getItem('userRole')
      const storedEmail = localStorage.getItem('userEmail')
      const storedName = localStorage.getItem('userName')
      if (storedRole) {
        isLoggedInRef.value = true
        userRef.value = {
          email: storedEmail || '',
          name: storedName || '',
          role: storedRole as UserRole,
        }
      }
    }
  }
}

// 앱 시작 시 초기화
initAuth()

// ==========================================
// useAuth Composable
// ==========================================
export function useAuth() {
  // Computed 속성
  const isLoggedIn = computed(() => isLoggedInRef.value)
  // admin과 operator 모두 관리자 권한
  const isAdmin = computed(
    () => userRef.value?.role === 'admin' || userRef.value?.role === 'operator'
  )
  // member와 user는 일반 권한 (모든 로그인 사용자 포함)
  const isMember = computed(() => isLoggedInRef.value)
  const currentUser = computed(() => userRef.value)
  const loading = computed(() => loadingRef.value)
  const error = computed(() => errorRef.value)

  // ==========================================
  // 로그인
  // TODO: 백엔드 완성 후 실제 API 호출로 변경
  // ==========================================
  const login = async (email: string, password: string): Promise<boolean> => {
    loadingRef.value = true
    errorRef.value = null

    try {
      // ========== 백엔드 연동 코드 (주석 해제하여 사용) ==========
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

      // ========== Mock 로그인 (백엔드 완성 전까지 사용) ==========
      await new Promise((resolve) => setTimeout(resolve, 500)) // API 호출 시뮬레이션

      // 관리자 계정
      if (email === 'admin@obed.com' && password === 'admin123') {
        isLoggedInRef.value = true
        userRef.value = { id: 1, email, name: '관리자', role: 'admin' }
        localStorage.setItem('token', 'mock-admin-token')
        localStorage.setItem('user', JSON.stringify({
          userId: '1', email, name: '관리자', role: 'admin'
        }))
        return true
      }

      // 운영자 계정 (관리자와 동일 권한)
      if (email === 'operator@obed.com' && password === 'operator123') {
        isLoggedInRef.value = true
        userRef.value = { id: 2, email, name: '운영자', role: 'operator' }
        localStorage.setItem('token', 'mock-operator-token')
        localStorage.setItem('user', JSON.stringify({
          userId: '2', email, name: '운영자', role: 'operator'
        }))
        return true
      }

      // 멤버 계정
      if (email === 'member@obed.com' && password === 'member123') {
        isLoggedInRef.value = true
        userRef.value = { id: 3, email, name: '멤버', role: 'member' }
        localStorage.setItem('token', 'mock-member-token')
        localStorage.setItem('user', JSON.stringify({
          userId: '3', email, name: '멤버', role: 'member'
        }))
        return true
      }

      // 일반 사용자 (모든 다른 이메일/비밀번호)
      if (email && password) {
        isLoggedInRef.value = true
        userRef.value = { id: 4, email, name: '홍길동', role: 'user' }
        localStorage.setItem('token', 'mock-user-token')
        localStorage.setItem('user', JSON.stringify({
          userId: '4', email, name: '홍길동', role: 'user'
        }))
        return true
      }

      errorRef.value = '이메일 또는 비밀번호가 일치하지 않습니다.'
      return false
      // ========================================================
    } catch (err: any) {
      errorRef.value = err.response?.data?.message || '로그인에 실패했습니다.'
      return false
    } finally {
      loadingRef.value = false
    }
  }

  // ==========================================
  // 회원가입
  // TODO: 백엔드 완성 후 실제 API 호출로 변경
  // ==========================================
  const register = async (
    email: string,
    password: string,
    name: string,
    phone?: string
  ): Promise<boolean> => {
    loadingRef.value = true
    errorRef.value = null

    try {
      // ========== 백엔드 연동 코드 (주석 해제하여 사용) ==========
      // const response = await authApi.register({ email, password, name, phone })
      // if (response.data.success) {
      //   return true
      // }
      // errorRef.value = response.data.message || '회원가입에 실패했습니다.'
      // return false
      // ========================================================

      // ========== Mock 회원가입 (백엔드 완성 전까지 사용) ==========
      await new Promise((resolve) => setTimeout(resolve, 500))

      if (email && password && name) {
        console.log('회원가입 성공 (Mock):', { email, name, phone })
        return true
      }

      errorRef.value = '모든 필수 항목을 입력해주세요.'
      return false
      // ========================================================
    } catch (err: any) {
      errorRef.value = err.response?.data?.message || '회원가입에 실패했습니다.'
      return false
    } finally {
      loadingRef.value = false
    }
  }

  // ==========================================
  // 로그아웃
  // TODO: 백엔드 완성 후 실제 API 호출로 변경
  // ==========================================
  const logout = async (): Promise<void> => {
    try {
      // ========== 백엔드 연동 코드 (주석 해제하여 사용) ==========
      // await authApi.logout()
      // ========================================================
    } catch (err) {
      console.error('로그아웃 API 실패:', err)
    } finally {
      // 로컬 상태 초기화
      isLoggedInRef.value = false
      userRef.value = null
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      // 기존 키들도 정리
      localStorage.removeItem('userRole')
      localStorage.removeItem('userName')
      localStorage.removeItem('userEmail')
    }
  }

  // ==========================================
  // 세션 확인 (페이지 새로고침 시 인증 상태 확인)
  // TODO: 백엔드 완성 후 실제 API 호출로 변경
  // ==========================================
  const checkSession = async (): Promise<boolean> => {
    try {
      // ========== 백엔드 연동 코드 (주석 해제하여 사용) ==========
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

      // ========== Mock 세션 확인 (백엔드 완성 전까지 사용) ==========
      return isLoggedInRef.value
      // ========================================================
    } catch (err) {
      console.error('세션 확인 실패:', err)
      return false
    }
  }

  // ==========================================
  // 비밀번호 변경
  // TODO: 백엔드 완성 후 실제 API 호출로 변경
  // ==========================================
  const changePassword = async (
    currentPassword: string,
    newPassword: string
  ): Promise<boolean> => {
    loadingRef.value = true
    errorRef.value = null

    try {
      // ========== 백엔드 연동 코드 (주석 해제하여 사용) ==========
      // const response = await authApi.changePassword({ currentPassword, newPassword })
      // if (response.data.success) {
      //   return true
      // }
      // errorRef.value = response.data.message
      // return false
      // ========================================================

      // ========== Mock (백엔드 완성 전까지 사용) ==========
      await new Promise((resolve) => setTimeout(resolve, 500))
      console.log('비밀번호 변경 (Mock)')
      return true
      // ========================================================
    } catch (err: any) {
      errorRef.value = err.response?.data?.message || '비밀번호 변경에 실패했습니다.'
      return false
    } finally {
      loadingRef.value = false
    }
  }

  // 에러 초기화
  const clearError = () => {
    errorRef.value = null
  }

  return {
    // 상태
    isLoggedIn,
    isAdmin,
    isMember,
    currentUser,
    loading,
    error,

    // 메서드
    login,
    register,
    logout,
    checkSession,
    changePassword,
    clearError,
  }
}
