<script setup lang="ts">
import QnaAnswerForm from "./QnaAnswerForm.vue";
import { qnaApi, type Qna } from "@/api/qna";

const props = defineProps<{ question: Qna; isAdmin: boolean; editing: boolean }>();
const emit = defineEmits<{ edit: []; cancel: []; saved: [] }>();
const date = new Intl.DateTimeFormat("ko-KR", { dateStyle: "long", timeStyle: "short" });
async function remove() {
  if (!confirm("정말 삭제하시겠습니까?")) return;
  try {
    await qnaApi.delete(props.question.id);
    emit("saved");
  } catch {
    alert("질문 삭제에 실패했습니다.");
  }
}
</script>

<template>
  <article class="qna-card">
    <div class="qna-header">
      <span class="qna-category">{{ question.category }}</span>
      <h3 class="qna-title">{{ question.title }}</h3>
    </div>
    <div class="qna-meta">
      <span class="qna-meta-item">👤 {{ question.author_label }}</span>
      <span class="qna-meta-item">📅 {{ date.format(new Date(question.created_at)) }}</span>
      <span class="qna-status" :data-status="question.status">
        {{ question.status === "ANSWERED" ? "답변완료" : "답변대기" }}
      </span>
    </div>
    <div class="qna-question">{{ question.content }}</div>
    <div v-if="question.answer && !editing" class="qna-answer">
      <div class="qna-answer-label">관리자 답변</div>
      <div class="qna-answer-content">{{ question.answer }}</div>
      <div v-if="question.answer_date" class="qna-answer-meta">{{ date.format(new Date(question.answer_date)) }}</div>
    </div>
    <QnaAnswerForm v-if="isAdmin && editing" :id="question.id" :initial-answer="question.answer"
      @cancel="emit('cancel')" @saved="emit('saved')" />
    <div v-if="isAdmin || question.can_delete" class="qna-admin-actions">
      <button v-if="isAdmin && !editing" class="btn btn--primary btn--sm" @click="emit('edit')">
        {{ question.answer ? "답변 수정" : "답변하기" }}
      </button>
      <button v-if="question.can_delete" class="btn btn--danger btn--sm" @click="remove">삭제</button>
    </div>
  </article>
</template>
