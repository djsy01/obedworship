<script setup lang="ts">
import { ref } from "vue";
import { useAuth } from "@/composables/useAuth";

const emit = defineEmits<{ close: [] }>();
const { changePassword, error, loading } = useAuth();
const current = ref("");
const password = ref("");
const confirmation = ref("");
async function submit() {
  if (loading.value || !current.value || !password.value || !confirmation.value) return;
  if (password.value !== confirmation.value) {
    alert("새 비밀번호가 일치하지 않습니다.");
    return;
  }
  if (!(await changePassword(current.value, password.value))) {
    alert(error.value || "비밀번호 변경에 실패했습니다.");
    return;
  }
  alert("비밀번호를 변경했습니다. 다시 로그인해주세요.");
  emit("close");
}
</script>

<template>
  <div class="modal-overlay" @click="emit('close')">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h2 class="modal-title">비밀번호 변경</h2>
        <button class="modal-close" @click="emit('close')">✕</button>
      </div>
      <div class="modal-body">
        <form class="form-grid" @submit.prevent="submit">
          <label class="field field--full">
            <span class="field-label">현재 비밀번호</span>
            <input v-model="current" type="password" autocomplete="current-password" required />
          </label>
          <label class="field field--full">
            <span class="field-label">새 비밀번호</span>
            <input v-model="password" type="password" autocomplete="new-password" required />
          </label>
          <label class="field field--full">
            <span class="field-label">새 비밀번호 확인</span>
            <input v-model="confirmation" type="password" autocomplete="new-password" required />
          </label>
          <div class="form-actions">
            <button class="btn" type="button" @click="emit('close')">취소</button>
            <button class="btn primary" type="submit" :disabled="loading">변경</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
