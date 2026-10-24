<script setup lang="ts">
import { computed, reactive, ref, toRef } from "vue";
import { useRouter } from "vue-router";
import { authApi } from "@/api/auth";
import { useAuth } from "@/composables/useAuth";
import {
  usePasswordStrength,
  PASSWORD_STRENGTH_LABEL,
} from "@/composables/usePasswordStrength";
import "../styles/Register.css";

const router = useRouter();
const { register, loading: isSubmitting, error: registerError } = useAuth();
const isVerified = ref(false);
const isSendingCode = ref(false);

const formData = reactive({
  email: "",
  verificationCode: "",
  name: "",
  phoneNumber: "",
  password: "",
  confirmPassword: "",
});

const { passwordStrength, passwordError, confirmPasswordError, isPasswordStrongEnough } =
  usePasswordStrength(toRef(formData, "password"), toRef(formData, "confirmPassword"));

const canSubmit = computed(() =>
  isVerified.value &&
  isPasswordStrongEnough.value &&
  confirmPasswordError.value === null &&
  formData.confirmPassword.length > 0,
);

const handleSendVerification = async () => {
  if (!formData.email) {
    alert("이메일을 입력해주세요.");
    return;
  }

  isSendingCode.value = true;
  try {
    await authApi.sendVerification(formData.email);
    alert("인증번호가 발송되었습니다. 이메일을 확인해주세요.");
  } catch (error: any) {
    alert(error.response?.data?.message || "인증번호 발송에 실패했습니다.");
  } finally {
    isSendingCode.value = false;
  }
};

const handleVerifyCode = async () => {
  if (!formData.verificationCode) {
    alert("인증번호를 입력해주세요.");
    return;
  }

  try {
    await authApi.verifyCode(formData.email, formData.verificationCode);
    alert("이메일 인증이 완료되었습니다.");
    isVerified.value = true;
  } catch (error: any) {
    alert(error.response?.data?.message || "인증번호가 올바르지 않습니다.");
  }
};

const handleSubmit = async () => {
  if (!isVerified.value) {
    alert("이메일 인증을 먼저 완료해주세요.");
    return;
  }
  if (!canSubmit.value) {
    alert("비밀번호 조건을 확인해주세요.");
    return;
  }

  const ok = await register(
    formData.email,
    formData.password,
    formData.name,
    formData.phoneNumber,
  );

  if (ok) {
    alert("회원가입이 완료되었습니다!");
    router.push("/login");
  } else {
    alert(registerError.value || "회원가입에 실패했습니다.");
  }
};
</script>

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
              :disabled="isVerified || isSendingCode"
            >
              {{ isSendingCode ? "발송 중..." : "인증요청" }}
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
          <input
            type="text"
            id="name"
            v-model="formData.name"
            placeholder="name"
            required
          />
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
          <input
            type="password"
            id="password"
            v-model="formData.password"
            placeholder="password"
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
          <label htmlFor="confirmPassword">비밀번호 확인</label>
          <input
            type="password"
            id="confirmPassword"
            v-model="formData.confirmPassword"
            placeholder="confirm password"
            required
          />
          <p v-if="confirmPasswordError" class="field-error">
            {{ confirmPasswordError }}
          </p>
        </div>

        <button
          type="submit"
          class="btn primary register-btn"
          :disabled="!canSubmit || isSubmitting"
        >
          {{ isSubmitting ? "처리 중..." : "회원가입" }}
        </button>
      </form>

      <div class="form-links">
        <span>이미 계정이 있으신가요?</span>
        <RouterLink to="/login">로그인</RouterLink>
      </div>
    </div>
  </div>
</template>
