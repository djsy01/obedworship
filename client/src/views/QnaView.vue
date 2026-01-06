<template>
  <div class="page">
    <section class="section">
      <div class="section-header">
        <div>
          <h1 class="section-title">Q&A</h1>
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
            💬 질문 남기기
          </button>
        </div>
      </div>

      <!-- 통계 정보 -->
      <div class="qna-stats">
        <div class="stat-card">
          <div class="stat-label">전체 질문</div>
          <div class="stat-value">{{ qnas.length }}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">답변 완료</div>
          <div class="stat-value">{{ answeredCount }}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">답변 대기</div>
          <div class="stat-value">{{ waitingCount }}</div>
        </div>
      </div>

      <!-- 카테고리 필터 -->
      <div class="qna-filters">
        <button
          class="filter-btn"
          :class="{ active: selectedCategory === '' }"
          @click="selectedCategory = ''"
        >
          <span>📋 전체</span>
        </button>
        <button
          class="filter-btn"
          :class="{ active: selectedCategory === '집회' }"
          @click="selectedCategory = '집회'"
        >
          <span>🙏 집회</span>
        </button>
        <button
          class="filter-btn"
          :class="{ active: selectedCategory === '악보' }"
          @click="selectedCategory = '악보'"
        >
          <span>🎼 악보</span>
        </button>
        <button
          class="filter-btn"
          :class="{ active: selectedCategory === '기타' }"
          @click="selectedCategory = '기타'"
        >
          <span>💭 기타</span>
        </button>
      </div>

      <!-- 질문 작성 패널 -->
      <div v-if="showAskForm" class="panel qna-ask-panel">
        <h2 class="panel-title">💭 질문 남기기</h2>
        <form class="form-grid" @submit.prevent="handleSubmitQuestion">
          <label class="field">
            <span class="field-label">카테고리</span>
            <select v-model="askCategory" required>
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
              required
            />
          </label>

          <label class="field field--full">
            <span class="field-label">내용</span>
            <textarea
              v-model="askContent"
              rows="4"
              placeholder="궁금한 내용을 자세히 작성해주세요"
              required
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
              등록
            </button>
          </div>
        </form>
      </div>

      <div class="qna-list">
        <article
          v-for="q in filteredQnas"
          :key="q.id"
          class="qna-card"
        >
          <div class="qna-header">
            <span class="qna-category">{{ q.category }}</span>
            <h2 class="qna-title">{{ q.title }}</h2>
          </div>

          <p class="qna-meta">
            <span class="qna-meta-item">
              <span class="qna-meta-icon">👤</span>
              질문자: 비공개
            </span>
            <span class="qna-meta-item">
              <span class="qna-meta-icon">📅</span>
              {{ q.date }}
            </span>
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
              class="btn small primary"
              type="button"
              @click="openAnswerEditor(q.id)"
            >
              {{ q.answer ? '✏️ 답변 수정' : '💬 답변 작성' }}
            </button>
          </div>

          <!-- 관리자 답변 입력 -->
          <div
            v-if="editingAnswerId === q.id && isAdmin"
            class="panel panel--inline"
          >
            <form @submit.prevent="handleSubmitAnswer">
              <label class="field field--full">
                <span class="field-label">답변 내용</span>
                <textarea
                  v-model="answerDraft"
                  rows="3"
                  placeholder="관리자 답변을 작성해주세요"
                  required
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
                  💾 저장
                </button>
              </div>
            </form>
          </div>
        </article>

        <div v-if="filteredQnas.length === 0" class="qna-empty">
          <div class="qna-empty-icon">💬</div>
          <h3>{{ selectedCategory ? `"${selectedCategory}" 카테고리에` : '' }} 등록된 질문이 없습니다</h3>
          <p>{{ selectedCategory ? '다른 카테고리를 선택하거나 ' : '' }}첫 번째 질문을 남겨보세요!</p>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAuth } from '@/composables/useAuth'
import '../styles/Qna.css'

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
const selectedCategory = ref('')

const qnas = ref<QnaItem[]>([
  {
    id: 1,
    category: '집회',
    title: '집회 시작 시간은 몇 시인가요?',
    content: '보혈 찬양집회는 몇 시에 시작하는지 궁금합니다. 늦게 도착하면 입장이 제한되나요?',
    date: '2025-03-01',
    status: 'ANSWERED',
    answer: '안녕하세요, OBED입니다. 집회는 오후 7시에 시작합니다. 예배당 입장은 6시 30분부터 가능하며, 늦게 오셔도 입장 가능하니 걱정하지 않으셔도 됩니다.',
    answerDate: '2025-03-02',
  },
  {
    id: 2,
    category: '악보',
    title: '악보는 어디까지 공유되나요?',
    content: '집회에서 사용한 모든 곡의 악보를 받을 수 있는지 궁금합니다. 저작권 문제는 어떻게 되나요?',
    date: '2025-02-15',
    status: 'WAITING',
  },
  {
    id: 3,
    category: '기타',
    title: '찬양팀에 참여하고 싶은데 어떻게 하나요?',
    content: '저는 기타를 연주할 수 있는데 OBED 찬양팀에 참여하고 싶습니다. 어떤 절차가 필요한가요?',
    date: '2025-02-10',
    status: 'ANSWERED',
    answer: '찬양팀 참여에 관심 가져주셔서 감사합니다! Q&A 섹션에서 "찬양팀 참여 문의"로 별도 문의를 남겨주시면, 팀장님께서 연락을 드릴 예정입니다. 또는 집회 후에 직접 찾아와 주셔도 좋습니다.',
    answerDate: '2025-02-11',
  },
  {
    id: 4,
    category: '집회',
    title: '주차는 가능한가요?',
    content: '차를 가지고 가려고 하는데 주차 공간이 있는지 궁금합니다.',
    date: '2025-02-05',
    status: 'ANSWERED',
    answer: '예수인교회 지하주차장을 이용하실 수 있습니다. 주차 공간이 넉넉하니 편하게 이용해주세요.',
    answerDate: '2025-02-06',
  },
  {
    id: 5,
    category: '악보',
    title: '자작곡 악보도 공유되나요?',
    content: 'OBED에서 직접 만든 곡들의 악보도 다운로드할 수 있나요?',
    date: '2025-01-28',
    status: 'WAITING',
  },
])

const editingAnswerId = ref<number | null>(null)
const answerDraft = ref('')

// 통계 계산
const answeredCount = computed(() => qnas.value.filter(q => q.status === 'ANSWERED').length)
const waitingCount = computed(() => qnas.value.filter(q => q.status === 'WAITING').length)

// 필터링된 질문 목록
const filteredQnas = computed(() => {
  if (!selectedCategory.value) {
    return qnas.value
  }
  return qnas.value.filter(q => q.category === selectedCategory.value)
})

const handleAskClick = () => {
  if (!isLoggedIn.value) {
    alert('로그인 후 질문을 남길 수 있습니다.')
    return
  }
  showAskForm.value = true
}

const handleSubmitQuestion = () => {
  if (!askTitle.value.trim() || !askContent.value.trim()) {
    alert('제목과 내용을 모두 입력해주세요.')
    return
  }

  // Mock: 새 질문 추가
  const newId = Math.max(...qnas.value.map(q => q.id), 0) + 1
  const newQuestion: QnaItem = {
    id: newId,
    category: askCategory.value,
    title: askTitle.value,
    content: askContent.value,
    date: new Date().toISOString().split('T')[0],
    status: 'WAITING',
  }

  qnas.value.unshift(newQuestion)

  // 폼 초기화
  askTitle.value = ''
  askContent.value = ''
  askCategory.value = '집회'
  showAskForm.value = false

  alert('질문이 등록되었습니다!')
}

const openAnswerEditor = (id: number) => {
  editingAnswerId.value = id
  const target = qnas.value.find((q) => q.id === id)
  answerDraft.value = target?.answer ?? ''
}

const handleSubmitAnswer = () => {
  if (!answerDraft.value.trim()) {
    alert('답변 내용을 입력해주세요.')
    return
  }

  const target = qnas.value.find((q) => q.id === editingAnswerId.value)
  if (target) {
    target.answer = answerDraft.value
    target.answerDate = new Date().toISOString().split('T')[0]
    target.status = 'ANSWERED'
    
    alert('답변이 저장되었습니다!')
    cancelAnswerEdit()
  }
}

const cancelAnswerEdit = () => {
  editingAnswerId.value = null
  answerDraft.value = ''
}
</script>