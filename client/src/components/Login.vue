<script setup lang="ts">
import { ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuth } from "@/composables/useAuth";
import "../styles/Login.css";

const router = useRouter();
const route = useRoute();
const { login, error, loading } = useAuth();

const email = ref("");
const password = ref("");

const handleSubmit = async () => {
  if (loading.value) return;
  if (await login(email.value, password.value)) await router.replace("/");
};
</script>

<template>
  <div class="login-container">
    <div class="login-box">
      <h3>로그인</h3>
      <p v-if="route.query.expired === '1'" role="status">세션이 종료되었습니다. 다시 로그인해주세요.</p>
      <p v-if="error" role="alert">{{ error }}</p>
      <form class="login-form" @submit.prevent="handleSubmit">
        <div class="input-group">
          <label htmlFor="email">이메일</label>
          <input
            type="email"
            id="email"
            v-model="email"
            placeholder="example@email.com"
            required
          />
        </div>
        <div class="input-group">
          <label htmlFor="password">비밀번호</label>
          <input
            type="password"
            id="password"
            v-model="password"
            placeholder="password"
            required
          />
        </div>

        <button type="submit" class="btn primary login-btn" :disabled="loading">로그인</button>
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
