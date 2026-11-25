<script setup lang="ts">
import { reactive, ref } from "vue";
import { qnaApi, type CreateQnaDto } from "@/api/qna";

const emit = defineEmits<{ saved: []; cancel: [] }>();
const question = reactive<CreateQnaDto>({ category: "집회", title: "", content: "" });
const saving = ref(false);
async function submit() {
  const title = question.title.trim();
  const content = question.content.trim();
  if (saving.value || !title || !content) return;
  saving.value = true;
  try {
    await qnaApi.create({ ...question, title, content });
    emit("saved");
  } catch {
    alert("질문 등록에 실패했습니다.");
  } finally {
    saving.value = false;
  }
}
</script>

<template>
  <form class="qna-ask-panel" @submit.prevent="submit">
    <h2>새 질문 작성</h2>
    <div class="form-group">
      <label for="qna-category" class="field-label">카테고리</label>
      <select id="qna-category" v-model="question.category" class="form-input">
        <option>집회</option><option>악보</option><option>기타</option>
      </select>
    </div>
    <div class="form-group">
      <label for="qna-title" class="field-label">제목</label>
      <input id="qna-title" v-model="question.title" class="form-input" maxlength="200" required />
    </div>
    <div class="form-group">
      <label for="qna-content" class="field-label">내용</label>
      <textarea id="qna-content" v-model="question.content" class="form-textarea" rows="5" required />
    </div>
    <div class="form-actions">
      <button class="btn btn--primary" type="submit" :disabled="saving">질문 등록</button>
      <button class="btn btn--secondary" type="button" @click="emit('cancel')">취소</button>
    </div>
  </form>
</template>
