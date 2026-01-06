<template>
  <div class="register-container">
    <div class="register-box">
      <h3>회원가입</h3>
      
      <form class="register-form" @submit.prevent="handleSubmit">
        <div class="input-group">
          <label htmlFor="email">이메일</label>
          <div class="input-with-button">
            <input 
              type="email" 
              id="email" 
              v-model="formData.email" 
              required 
              :disabled="isVerified"
              placeholder="example@email.com"
            />
            <button 
              type="button" 
              class="btn primary"
              @click="handleSendVerification" 
              :disabled="isVerified"
            >
              인증요청
            </button>
          </div>
        </div>
        
        <div class="input-group">
          <label htmlFor="verificationCode">인증번호</label>
          <div class="input-with-button">
            <input 
              type="text" 
              id="verificationCode" 
              v-model="formData.verificationCode" 
              required 
              :disabled="isVerified"
              placeholder="인증코드 6자리"
            />
            <button 
              type="button" 
              class="btn"
              @click="handleVerifyCode" 
              :disabled="isVerified"
            >
              확인
            </button>
          </div>
        </div>
        
        <div class="input-group">
          <label htmlFor="name">사용자 이름</label>
          <input type="text" id="name" v-model="formData.name" required />
        </div>
        
        <div class="input-group">
          <label htmlFor="phoneNumber">전화번호</label>
          <input 
            type="tel" 
            id="phoneNumber" 
            v-model="formData.phoneNumber" 
            placeholder="010-0000-0000"
            required 
          />
        </div>
        
        <div class="input-group">
          <label htmlFor="password">비밀번호</label>
          <input type="password" id="password" v-model="formData.password" required />
        </div>
        <div class="input-group">
          <label htmlFor="confirmPassword">비밀번호 확인</label>
          <input type="password" id="confirmPassword" v-model="formData.confirmPassword" required />
        </div>
        
        <button type="submit" class="btn primary register-btn">회원가입</button>
      </form>
      
      <div class="form-links">
        <span>이미 계정이 있으신가요?</span>
        <RouterLink to="/login">로그인</RouterLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
// import apiClient from "@/api/axiosConfig"; // 실제 통신 시 필요
import '../styles/Register.css'

const router = useRouter()
const isVerified = ref(false)

const formData = reactive({
  email: "",
  verificationCode: "",
  name: "",
  phoneNumber: "",
  password: "",
  confirmPassword: ""
})

// Mock API: '인증요청' 버튼 클릭 핸들러
const handleSendVerification = async () => {
  if (!formData.email) {
    alert("이메일을 입력해주세요.");
    return;
  }
  
  // 실제 구현: await apiClient.post("/auth/send-verification", { email: formData.email });
  alert("인증 코드가 발송되었습니다. 이메일을 확인해주세요. (프론트엔드 테스트)");
};

// Mock API: '확인' 버튼 (인증번호 검증) 클릭 핸들러
const handleVerifyCode = async () => {
  if (!formData.verificationCode) {
    alert("인증 코드를 입력해주세요.");
    return;
  }
  
  // 실제 구현: await apiClient.post("/auth/verify-code", { email: formData.email, code: formData.verificationCode });
  if (formData.verificationCode === '123456') { // Mock 인증 코드
    alert("이메일 인증이 완료되었습니다. (프론트엔드 테스트)");
    isVerified.value = true; // 인증 성공 시 상태 변경
  } else {
    alert("인증 코드가 올바르지 않습니다.");
  }
};

// Mock API: '회원가입' 버튼 클릭 핸들러
const handleSubmit = async () => {
  if (!isVerified.value) {
    alert("이메일 인증을 먼저 완료해주세요.");
    return;
  }
  if (formData.password !== formData.confirmPassword) {
    alert("비밀번호가 일치하지 않습니다.");
    return;
  }

  try {
    const userData = {
      email: formData.email,
      name: formData.name,
      phoneNumber: formData.phoneNumber,
      password: formData.password
    };
    
    // 실제 구현: await apiClient.post("/auth/register", userData);
    console.log("Mock Registration Data:", userData);

    alert("회원가입이 완료되었습니다! (프론트엔드 테스트)");
    router.push("/login");
  } catch (error: any) {
    alert(`회원가입 실패: ${error.message || '다시 시도해주세요.'}`);
  }
};
</script>