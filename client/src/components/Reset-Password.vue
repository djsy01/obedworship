<script setup lang="ts">
import { computed, reactive, ref, toRef } from "vue";
import { useRouter } from "vue-router";
import { authApi } from "@/api/auth";
import {
  usePasswordStrength,
  PASSWORD_STRENGTH_LABEL,
} from "@/composables/usePasswordStrength";
import "../styles/Login.css";
import "../styles/Register.css";

const router = useRouter();
// 1: 이메일 인증, 2: 비밀번호 변경
const step = ref(1);
const isEmailVerified = ref(false);
const isSendingCode = ref(false);
const isSubmitting = ref(false);

const formData = reactive({
  email: "",
  verificationCode: "",
  newPassword: "",
  confirmNewPassword: "",
});

const { passwordStrength, passwordError, confirmPasswordError, isPasswordStrongEnough } =
  usePasswordStrength(toRef(formData, "newPassword"), toRef(formData, "confirmNewPassword"));

const canSubmit = computed(
  () =>
    isPasswordStrongEnough.value &&
    confirmPasswordError.value === null &&
    formData.confirmNewPassword.length > 0,
);

const handleSendEmail = async () => {
  if (!formData.email) {
    alert("이메일을 입력해주세요.");
    return;
  }

  isSendingCode.value = true;
  try {
    await authApi.forgotPassword(formData.email);
    alert("입력하신 이메일로 인증번호가 발송되었습니다.");
  } catch (error: any) {
    alert(error.response?.data?.message || "인증번호 발송에 실패했습니다.");
  } finally {
    isSendingCode.value = false;
  }
};

const handleVerifyEmail = async () => {
  if (!formData.verificationCode) {
    alert("인증번호를 입력해주세요.");
    return;
  }

  try {
    await authApi.verifyResetCode(formData.email, formData.verificationCode);
    alert("이메일 인증이 완료되었습니다. 새 비밀번호를 입력해주세요.");
    isEmailVerified.value = true;
    step.value = 2;
  } catch (error: any) {
    alert(error.response?.data?.message || "인증번호가 일치하지 않습니다.");
  }
};

const handleSubmit = async () => {
  if (!canSubmit.value) {
    alert("비밀번호 조건을 확인해주세요.");
    return;
  }

  isSubmitting.value = true;
  try {
    await authApi.resetPassword(formData.email, formData.newPassword);
    alert("비밀번호 재설정이 완료되었습니다! 새로운 비밀번호로 로그인해주세요.");
    router.push("/login");
  } catch (error: any) {
    alert(error.response?.data?.message || "비밀번호 재설정에 실패했습니다.");
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<style scoped>
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

<template>
  <div class="login-container">
    <div class="login-box">
      <h3>비밀번호 재설정</h3>

      <form class="login-form" @submit.prevent="handleSubmit">
        <div v-if="step === 1">
          <p class="section-subtitle">가입하신 이메일로 인증번호를 받아 확인합니다.</p>
          <div class="input-group">
            <label htmlFor="email">이메일</label>
            <input
              type="email"
              id="email"
              v-model="formData.email"
              required
              :disabled="isEmailVerified"
              placeholder="example@email.com"
            />
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
                :disabled="isEmailVerified || isSendingCode"
              >
                {{ isSendingCode ? "발송 중..." : "인증 발송" }}
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
          <p class="section-subtitle">새로운 비밀번호를 입력해주세요.</p>
          <div class="input-group">
            <label htmlFor="newPassword">새 비밀번호</label>
            <input
              type="password"
              id="newPassword"
              v-model="formData.newPassword"
              required
            />
            <p
              v-if="passwordStrength"
              class="password-strength"
              :class="passwordStrength"
            >
              비밀번호 강도: {{ PASSWORD_STRENGTH_LABEL[passwordStrength] }}
            </p>
            <p v-if="passwordError" class="field-error">{{ passwordError }}</p>
          </div>
          <div class="input-group">
            <label htmlFor="confirmNewPassword">새 비밀번호 확인</label>
            <input
              type="password"
              id="confirmNewPassword"
              v-model="formData.confirmNewPassword"
              required
            />
            <p v-if="confirmPasswordError" class="field-error">
              {{ confirmPasswordError }}
            </p>
          </div>
          <button
            type="submit"
            class="btn primary login-btn"
            :disabled="!canSubmit || isSubmitting"
          >
            {{ isSubmitting ? "처리 중..." : "비밀번호 재설정" }}
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
