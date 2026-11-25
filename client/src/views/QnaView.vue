<script setup lang="ts">
import { useQuestions } from "@/composables/useQuestions";
import { useAuth } from "@/composables/useAuth";
import QnaCard from "@/components/qna/QnaCard.vue";
import QnaQuestionForm from "@/components/qna/QnaQuestionForm.vue";
import "../styles/Qna.css";

const { isLoggedIn, isAdmin } = useAuth();
const categories = ["전체", "집회", "악보", "기타"] as const;
const { category, questions, asking, loading, failed, editing, answered, reload } = useQuestions();
</script>

<template>
  <div class="page">
    <div class="section">
      <div class="page-container">
        <div class="page-header">
          <h1 class="page-title">Q&amp;A</h1>
          <p class="page-description">궁금한 점을 질문해주세요</p>
        </div>
        <div class="qna-stats">
          <div class="stat-card"><div class="stat-label">전체 질문</div><div class="stat-value">{{ questions.length }}</div></div>
          <div class="stat-card"><div class="stat-label">답변 대기</div><div class="stat-value">{{ questions.length - answered }}</div></div>
          <div class="stat-card"><div class="stat-label">답변 완료</div><div class="stat-value">{{ answered }}</div></div>
        </div>
        <div class="qna-filters">
          <button v-for="item in categories" :key="item" class="filter-btn"
            :class="{ active: category === item }" @click="category = item">{{ item }}</button>
          <button class="filter-btn" :disabled="!isLoggedIn" @click="asking = !asking">
            {{ !isLoggedIn ? "로그인 후 질문하기" : asking ? "질문 취소" : "질문하기" }}
          </button>
        </div>
        <QnaQuestionForm v-if="asking && isLoggedIn" @cancel="asking = false" @saved="asking = false; reload()" />
        <div v-if="loading" class="qna-loading"><div class="loading-spinner"></div><p>불러오는 중...</p></div>
        <div v-else-if="failed" class="qna-empty" role="alert">
          <p>질문을 불러오지 못했습니다.</p><button class="btn" @click="reload">다시 시도</button>
        </div>
        <div v-else-if="questions.length" class="qna-list">
          <QnaCard v-for="question in questions" :key="question.id" :question="question" :is-admin="isAdmin"
            :editing="editing === question.id" @edit="editing = question.id" @cancel="editing = undefined"
            @saved="editing = undefined; reload()" />
        </div>
        <div v-else class="qna-empty">
          <div class="qna-empty-icon">💬</div><h3>등록된 질문이 없습니다</h3><p>첫 번째 질문을 남겨보세요!</p>
        </div>
      </div>
    </div>
  </div>
</template>
