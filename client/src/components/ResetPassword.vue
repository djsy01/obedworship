<template>
  <div class="login-container">
    <div class="login-box">
      <h3>비밀번호 재설정</h3>

      <form class="login-form" @submit.prevent="handleSubmit">
        <div v-if="step === 1">
          <p class="section-subtitle">
            등록된 이메일과 사용자 정보를 입력해주세요.
          </p>
          <div class="input-group">
            <label htmlFor="email">이메일</label>
            <input type="email" id="email" v-model="formData.email" required :disabled="isEmailVerified" />
          </div>
          <div class="input-group">
            <label htmlFor="name">이름</label>
            <input type="text" id="name" v-model="formData.name" required :disabled="isEmailVerified" />
          </div>
          <div class="input-group">
            <label htmlFor="phoneNumber">전화번호</label>
            <input type="tel" id="phoneNumber" v-model="formData.phoneNumber" placeholder="010-0000-0000" required :disabled="isEmailVerified" />
          </div>

          <div class="input-group">
            <label htmlFor="verificationCode">인증번호</label>
            <div class="input-with-button">
              <input 
                type="text" 
                id="verificationCode" 
                v-model="formData.verificationCode" 
                required 
                :disabled="isEmailVerified"
                placeholder="인증코드 6자리"
              />
              <button 
                type="button" 
                class="btn primary"
                @click="handleSendEmail" 
                :disabled="isEmailVerified"
              >
                인증 발송
              </button>
            </div>
          </div>
          
          <button 
            type="button" 
            class="btn login-btn"
            @click="handleVerifyEmail"
            :disabled="isEmailVerified"
          >
            인증 확인
          </button>

          <p v-if="isEmailVerified" class="panel-hint">
            이메일 인증이 완료되었습니다. 새 비밀번호를 입력해주세요.
          </p>
        </div>

        <div v-if="step === 2">
          <p class="section-subtitle">
            새로운 비밀번호를 입력해주세요.
          </p>
          <div class="input-group">
            <label htmlFor="newPassword">새 비밀번호</label>
            <input type="password" id="newPassword" v-model="formData.newPassword" required />
          </div>
          <div class="input-group">
            <label htmlFor="confirmNewPassword">새 비밀번호 확인</label>
            <input type="password" id="confirmNewPassword" v-model="formData.confirmNewPassword" required />
          </div>
          <button type="submit" class="btn primary login-btn">
            비밀번호 재설정
          </button>
        </div>
      </form>
      
      <div class="form-links">
        <RouterLink to="/login">로그인</RouterLink>
        <RouterLink to="/find-id">아이디 찾기</RouterLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import '../styles/Login.css'
import '../styles/Register.css'

const router = useRouter()
const step = ref(1) // 1: 인증, 2: 비밀번호 변경
const isEmailVerified = ref(false)
const mockEmailCode = '222222' // Mock 인증 코드

const formData = reactive({
  email: '',
  name: '',
  phoneNumber: '',
  verificationCode: '',
  newPassword: '',
  confirmNewPassword: ''
})

// Mock API: 이메일 인증번호 발송
const handleSendEmail = async () => {
  if (!formData.email || !formData.name || !formData.phoneNumber) {
    alert("이메일, 이름, 전화번호를 모두 입력해주세요.");
    return;
  }
  
  // 실제 구현: 서버 API 호출 (입력 정보로 사용자 확인 후 인증번호 발송)
  alert(`[Mock] 인증번호(${mockEmailCode})가 ${formData.email}로 발송되었습니다. (사용자 정보 확인 완료 가정)`)
}

// Mock API: 이메일 인증번호 확인
const handleVerifyEmail = () => {
  if (formData.verificationCode === mockEmailCode) {
    alert('이메일 인증이 완료되었습니다. 다음 단계로 이동합니다.')
    isEmailVerified.value = true
    step.value = 2 // 비밀번호 변경 단계로 이동
  } else {
    alert('인증번호가 일치하지 않습니다.')
  }
}

// Mock API: 최종 비밀번호 재설정
const handleSubmit = async () => {
  if (formData.newPassword !== formData.confirmNewPassword) {
    alert("새 비밀번호가 일치하지 않습니다.")
    return
  }

  // 실제 구현: 서버 API 호출
  // 비밀번호 재설정 성공했다고 가정
  alert("비밀번호 재설정이 완료되었습니다! 새로운 비밀번호로 로그인해주세요. (프론트엔드 테스트)")
  router.push("/login")
}
</script>

<style scoped>
/* ResetPasswordView 고유 스타일 */
.panel-hint {
  font-size: 0.8rem;
  color: #4a1f2f;
  margin-top: 1rem;
  font-weight: 500;
}
.section-subtitle {
  margin: 0 0 1rem;
  font-size: 0.9rem;
  color: #555;
}
</style>