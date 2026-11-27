<script setup lang="ts">
import { ref } from "vue";
import { qnaApi } from "@/api/qna";

const props = defineProps<{ id: number; initialAnswer?: string | null }>();
const emit = defineEmits<{ cancel: []; saved: [] }>();
const answer = ref(props.initialAnswer ?? "");
const saving = ref(false);
async function saveAnswer() {
  if (saving.value || !answer.value.trim()) return;
  saving.value = true;
  try {
    await qnaApi.answer(props.id, { answer: answer.value.trim() });
    emit("saved");
  } catch {
    alert("답변 등록에 실패했습니다.");
  } finally {
    saving.value = false;
  }
}
</script>

<template>
  <form class="panel--inline" @submit.prevent="saveAnswer">
    <label class="field-label">답변 작성
      <textarea v-model="answer" class="form-textarea" rows="4" required />
    </label>
    <div class="form-actions">
      <button class="btn btn--primary" type="submit" :disabled="saving">저장</button>
      <button class="btn btn--secondary" type="button" @click="emit('cancel')">취소</button>
    </div>
  </form>
</template>
