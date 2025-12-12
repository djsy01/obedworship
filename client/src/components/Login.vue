<template>
  <div class="login-container">
    <div class="login-box">
      <h3>로그인</h3>
      <form class="login-form" @submit.prevent="handleSubmit">
        <div class="input-group">
          <label htmlFor="email">이메일</label>
          <input type="email" id="email" v-model="email" required />
        </div>
        <div class="input-group">
          <label htmlFor="password">비밀번호</label>
          <input type="password" id="password" v-model="password" required />
        </div>
        
        <button type="submit" class="btn primary login-btn">로그인</button>
      </form>
      
      <div class="form-links">
        <RouterLink to="/register">회원가입</RouterLink>
      </div>
      <div class="form-links">
        <RouterLink to="/find-id">아이디 찾기</RouterLink>
        <RouterLink to="/reset-password">비밀번호 재설정하기</RouterLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import '../styles/Login.css'

const router = useRouter()
const { login } = useAuth()

const email = ref('')
const password = ref('')

const handleSubmit = async () => {
  try {
    // useAuth의 login 함수 호출
    login(email.value, password.value)
    
    // 성공 시
    alert("로그인에 성공했습니다!")
    router.push("/")
  } catch (error: any) {
    alert(`로그인에 실패했습니다. ${error.message || '다시 시도해주세요.'}`)
  }
}
</script>