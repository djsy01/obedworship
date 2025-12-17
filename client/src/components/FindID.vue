<template>
  <div class="login-container">
    <div class="login-box">
      <h3>아이디 찾기</h3>
      
      <form class="login-form" @submit.prevent="handleFindId">
        <p class="section-subtitle" style="margin-bottom: 1.5rem;">
            가입 시 등록한 이름과 휴대폰 번호를 입력하여 아이디를 찾습니다.
        </p>
        <div class="input-group">
          <label htmlFor="name">이름</label>
          <input type="text" id="name" v-model="name" required />
        </div>
        
        <div class="input-group">
          <label htmlFor="phoneNumber">휴대폰 번호</label>
          <input 
            type="tel" 
            id="phoneNumber" 
            v-model="phoneNumber" 
            placeholder="010-0000-0000"
            required 
          />
        </div>
        
        <button 
          type="submit" 
          class="btn primary login-btn"
          :disabled="isIdFound"
        >
          아이디 찾기
        </button>
      </form>
      
      <div v-if="isIdFound" class="result-box">
        <p>회원님의 아이디는 <strong>{{ foundId }}</strong> 입니다.</p>
        <RouterLink to="/login" class="btn primary small">로그인으로 돌아가기</RouterLink>
      </div>

      <div class="form-links">
        <RouterLink to="/login">로그인</RouterLink>
        <RouterLink to="/reset-password">비밀번호 재설정하기</RouterLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import '../styles/Login.css'

const router = useRouter()
const name = ref('')
const phoneNumber = ref('')
const isIdFound = ref(false)
const foundId = ref('')

// [새 Mock 함수] 이름과 휴대폰 번호로 아이디 찾기
const handleFindId = async () => {
  // Mock: 실제로는 백엔드 API 통신이 필요함
  // const response = await apiClient.post('/auth/find-id', { name: name.value, phoneNumber: phoneNumber.value });
  
  if (name.value === '홍길동' && phoneNumber.value === '010-1234-5678') {
    // Mock: 백엔드에서 마스킹된 아이디를 받았다고 가정
    foundId.value = 'h***@obed.com' 
    isIdFound.value = true
  } else {
    alert('입력 정보와 일치하는 아이디를 찾을 수 없습니다.')
    isIdFound.value = false
  }
}
</script>

<style scoped>
.result-box {
  margin-top: 1.5rem;
  padding: 1rem;
  border: 1px solid #f0d4e0;
  background: #fff7f9;
  border-radius: 0.5rem;
  text-align: center;
}
.result-box p {
  font-size: 1rem;
  margin: 0 0 1rem;
}
.result-box strong {
  color: #4a1f2f;
  font-weight: 700;
}
.section-subtitle {
    font-size: 0.9rem;
    color: #555;
}
</style>