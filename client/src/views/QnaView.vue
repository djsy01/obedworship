<!-- src/views/QnaView.vue -->
<template>
  <div class="page">
    <section class="section">
      <div class="section-header">
        <div>
          <h1 class="section-title">Q&amp;A</h1>
          <p class="section-subtitle">
            OBED, 집회, 악보, 참여에 대한 질문을 남겨주세요. 질문자는 화면에
            표시되지 않습니다.
          </p>
        </div>

        <div class="section-controls">
          <button
            class="btn primary"
            type="button"
            @click="handleAskClick"
          >
            질문 남기기
          </button>
        </div>
      </div>

      <!-- 질문 작성 모달/패널 -->
      <div v-if="showAskForm" class="panel">
        <h2 class="panel-title">질문 남기기</h2>
        <form class="form-grid" @submit.prevent>
          <label class="field">
            <span class="field-label">카테고리</span>
            <select v-model="askCategory">
              <option value="집회">집회</option>
              <option value="악보">악보</option>
              <option value="기타">기타</option>
            </select>
          </label>

          <label class="field">
            <span class="field-label">제목</span>
            <input
              v-model="askTitle"
              type="text"
              placeholder="질문 제목을 입력하세요"
            />
          </label>

          <label class="field field--full">
            <span class="field-label">내용</span>
            <textarea
              v-model="askContent"
              rows="4"
              placeholder="궁금한 내용을 자세히 작성해주세요"
            />
          </label>

          <p class="panel-hint">
            ※ 질문자는 화면에 표시되지 않으며, 관리자만 내부적으로 확인합니다.
          </p>

          <div class="form-actions">
            <button class="btn" type="button" @click="showAskForm = false">
              취소
            </button>
            <button class="btn primary" type="submit">
              (Mock) 등록
            </button>
          </div>
        </form>
      </div>

      <div class="qna-list">
        <article
          v-for="q in qnas"
          :key="q.id"
          class="qna-card"
        >
          <div class="qna-header">
            <span class="qna-category">[{{ q.category }}]</span>
            <h2 class="qna-title">{{ q.title }}</h2>
          </div>

          <p class="qna-meta">
            질문자: 비공개 · {{ q.date }} ·
            <span class="qna-status" :data-status="q.status">
              {{ q.status === 'ANSWERED' ? '답변 완료' : '답변 대기' }}
            </span>
          </p>

          <p class="qna-question">
            {{ q.content }}
          </p>

          <div
            v-if="q.answer"
            class="qna-answer"
          >
            <p class="qna-answer-label">관리자 답변</p>
            <p class="qna-answer-content">
              {{ q.answer }}
            </p>
            <p class="qna-answer-meta">
              {{ q.answerDate }}
            </p>
          </div>

          <!-- 관리자 전용 답변 버튼 -->
          <div v-if="isAdmin" class="qna-admin-actions">
            <button
              class="btn small"
              type="button"
              @click="openAnswerEditor(q.id)"
            >
              {{ q.answer ? '답변 수정' : '답변 작성' }}
            </button>
          </div>

          <!-- 관리자 답변 입력 (간단 버전, 실제로는 모달/별도 폼 추천) -->
          <div
            v-if="editingAnswerId === q.id && isAdmin"
            class="panel panel--inline"
          >
            <form @submit.prevent>
              <label class="field field--full">
                <span class="field-label">답변 내용</span>
                <textarea
                  v-model="answerDraft"
                  rows="3"
                  placeholder="관리자 답변을 작성해주세요"
                />
              </label>
              <div class="form-actions">
                <button
                  class="btn small"
                  type="button"
                  @click="cancelAnswerEdit"
                >
                  취소
                </button>
                <button class="btn small primary" type="submit">
                  (Mock) 저장
                </button>
              </div>
            </form>
          </div>
        </article>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAuth } from '@/composables/useAuth'

type QnaStatus = 'WAITING' | 'ANSWERED'

type QnaItem = {
  id: number
  category: string
  title: string
  content: string
  date: string
  status: QnaStatus
  answer?: string
  answerDate?: string
}

const { isLoggedIn, isAdmin } = useAuth()

const showAskForm = ref(false)
const askCategory = ref('집회')
const askTitle = ref('')
const askContent = ref('')

const qnas = ref<QnaItem[]>([
  {
    id: 1,
    category: '집회',
    title: '집회 시작 시간은 몇 시인가요?',
    content: '보혈 찬양집회는 몇 시에 시작하는지 궁금합니다.',
    date: '2025-03-01',
    status: 'ANSWERED',
    answer: '안녕하세요, OBED입니다. 집회는 오후 7시에 시작합니다.',
    answerDate: '2025-03-02',
  },
  {
    id: 2,
    category: '악보',
    title: '악보는 어디까지 공유되나요?',
    content: '집회에서 사용한 모든 곡의 악보를 받을 수 있는지 궁금합니다.',
    date: '2025-02-15',
    status: 'WAITING',
  },
])

const editingAnswerId = ref<number | null>(null)
const answerDraft = ref('')

const handleAskClick = () => {
  if (!isLoggedIn.value) {
    alert('로그인 후 질문을 남길 수 있습니다. (현재는 mock 상태)')
    // 실제 구현에서는 로그인 페이지로 라우팅
    // router.push({ name: 'login', query: { redirect: '/qna' } })
    return
  }
  showAskForm.value = true
}

const openAnswerEditor = (id: number) => {
  editingAnswerId.value = id
  const target = qnas.value.find((q) => q.id === id)
  answerDraft.value = target?.answer ?? ''
}

const cancelAnswerEdit = () => {
  editingAnswerId.value = null
  answerDraft.value = ''
}
</script>
