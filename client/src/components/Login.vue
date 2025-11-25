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
// import apiClient from "@/api/axiosConfig"; // 실제 통신 시 필요
import '../styles/Login.css'

const router = useRouter()
const email = ref('')
const password = ref('')

// Mock API 통신 함수
const mockLoginApi = async (email: string, password: string) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (email === 'admin@obed.com' && password === 'admin123') {
        // Mock 성공
        resolve({ token: 'mock-token-admin' })
      } else if (email && password) {
        // Mock 일반 사용자 성공
        resolve({ token: 'mock-token-user' })
      } else {
        // Mock 실패
        reject(new Error('아이디 또는 비밀번호를 확인해주세요.'))
      }
    }, 500)
  })
}

const handleSubmit = async () => {
  try {
    // 실제 구현에서는 apiClient.post('/auth/login', { email: email.value, password: password.value }); 사용
    await mockLoginApi(email.value, password.value) 
    
    // 성공 시 로그인 상태 처리 (useAuth 등)
    alert("로그인에 성공했습니다! (프론트엔드 테스트)");
    // handleLogin(); // useAuth 업데이트
    router.push("/");
  } catch (error: any) {
    alert(`로그인에 실패했습니다. ${error.message || '다시 시도해주세요.'}`);
  }
}
</script>