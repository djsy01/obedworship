import { computed, ref } from 'vue'

// 실제 구현에서는 localStorage, sessionStorage, Vuex, Pinia 등에서 가져와야 함
const isLoggedInRef = ref(false) // 로그인 상태
const userRoleRef = ref<'user' | 'admin' | null>(null) // 사용자 역할

export function useAuth() {
  const isLoggedIn = computed(() => isLoggedInRef.value)
  const isAdmin = computed(() => userRoleRef.value === 'admin')

  // Mock 로그인 함수 (실제로는 API 호출 후 설정)
  const login = (email: string, password: string) => {
    // Mock: admin@obed.com으로 로그인하면 관리자
    if (email === 'admin@obed.com' && password === 'admin123') {
      isLoggedInRef.value = true
      userRoleRef.value = 'admin'
      // 실제로는: localStorage.setItem('userRole', 'admin')
    } else if (email && password) {
      isLoggedInRef.value = true
      userRoleRef.value = 'user'
      // 실제로는: localStorage.setItem('userRole', 'user')
    }
  }

  const logout = () => {
    isLoggedInRef.value = false
    userRoleRef.value = null
    // 실제로는: localStorage.removeItem('userRole')
  }

  // 초기화 시 localStorage에서 복구 (실제 구현 예시)
  // const initAuth = () => {
  //   const storedRole = localStorage.getItem('userRole')
  //   const storedToken = localStorage.getItem('token')
  //   if (storedRole && storedToken) {
  //     isLoggedInRef.value = true
  //     userRoleRef.value = storedRole as 'user' | 'admin'
  //   }
  // }
  // initAuth()

  return {
    isLoggedIn,
    isAdmin,
    login,
    logout,
  }
}