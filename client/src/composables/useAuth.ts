import { computed, ref } from 'vue'

const isLoggedInRef = ref(false)
const userRoleRef = ref<'user' | 'admin' | null>(null)

const initAuth = () => {
  const storedRole = localStorage.getItem('userRole')
  const storedToken = localStorage.getItem('token')
  if (storedRole && storedToken) {
    isLoggedInRef.value = true
    userRoleRef.value = storedRole as 'user' | 'admin'
  }
}

initAuth()

export function useAuth() {
  const isLoggedIn = computed(() => isLoggedInRef.value)
  const isAdmin = computed(() => userRoleRef.value === 'admin')

  const login = (email: string, password: string) => {
    if (email === 'admin@obed.com' && password === 'admin123') {
      isLoggedInRef.value = true
      userRoleRef.value = 'admin'
      localStorage.setItem('userRole', 'admin')
      localStorage.setItem('token', 'mock-admin-token')
      localStorage.setItem('userName', '관리자')
      localStorage.setItem('userEmail', email)
    } else if (email && password) {
      isLoggedInRef.value = true
      userRoleRef.value = 'user'
      localStorage.setItem('userRole', 'user')
      localStorage.setItem('token', 'mock-user-token')
      localStorage.setItem('userName', '홍길동')
      localStorage.setItem('userEmail', email)
    }
  }

  const logout = () => {
    isLoggedInRef.value = false
    userRoleRef.value = null
    localStorage.removeItem('userRole')
    localStorage.removeItem('token')
    localStorage.removeItem('userName')
    localStorage.removeItem('userEmail')
  }

  return {
    isLoggedIn,
    isAdmin,
    login,
    logout,
  }
}