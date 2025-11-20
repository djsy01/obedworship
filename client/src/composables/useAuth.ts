// src/composables/useAuth.ts
import { computed, ref } from 'vue'

const isLoggedInRef = ref(true) // 디자인 확인용: true/false 바꿔보면서 쓰기
const isAdminRef = ref(true)    // true면 관리자 버튼 보임

export function useAuth() {
  const isLoggedIn = computed(() => isLoggedInRef.value)
  const isAdmin = computed(() => isAdminRef.value)

  return {
    isLoggedIn,
    isAdmin,
  }
}
