<template>
  <div class="page">
    <section class="section">
      <div class="section-header">
        <div>
          <h1 class="section-title">악보</h1>
          <p class="section-subtitle">
            로그인한 팀원/참여자는 예배에서 사용한 곡들의 악보를 내려받을 수
            있습니다.
          </p>
        </div>

        <div class="section-controls">
          <button
            v-if="isAdmin"
            class="btn primary"
            type="button"
            @click="showAddForm = !showAddForm"
          >
            {{ showAddForm ? '추가 취소' : '악보 추가' }}
          </button>
        </div>
      </div>

      <div
        v-if="showAddForm && isAdmin"
        class="panel"
      >
        <h2 class="panel-title">새 악보 추가</h2>
        <form class="form-grid" @submit.prevent>
          <label class="field">
            <span class="field-label">곡 제목</span>
            <input type="text" placeholder="곡 제목을 입력하세요" />
          </label>

          <label class="field">
            <span class="field-label">Key</span>
            <input type="text" placeholder="예: A, Bb, C" />
          </label>

          <label class="field">
            <span class="field-label">BPM</span>
            <input type="number" placeholder="예: 72" />
          </label>

          <label class="field">
            <span class="field-label">카테고리 / 집회</span>
            <input type="text" placeholder="보혈집회 2025-03 등" />
          </label>

          <label class="field">
            <span class="field-label">악보 파일</span>
            <input type="file" />
          </label>

          <div class="form-actions">
            <button class="btn primary" type="submit">
              (Mock) 저장
            </button>
          </div>
        </form>
        <p class="panel-hint">
          ※ 현재는 UI만 구현된 상태입니다. 실제 업로드/저장은 서버 API와 연동해서
          처리해주세요.
        </p>
      </div>

      <div class="section-controls section-controls--inline">
        <label class="field field--inline">
          <span class="field-label">검색</span>
          <input
            v-model="keyword"
            type="text"
            placeholder="곡 제목으로 검색"
          />
        </label>
      </div>

      <div class="table-wrapper">
        <table class="table">
          <thead>
            <tr>
              <th>곡 제목</th>
              <th>Key</th>
              <th>BPM</th>
              <th>카테고리</th>
              <th>다운로드</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="s in filteredScores" :key="s.id">
              <td>{{ s.title }}</td>
              <td>{{ s.key }}</td>
              <td>{{ s.bpm }}</td>
              <td>{{ s.category }}</td>
              <td>
                <button
                  class="btn small"
                  type="button"
                  :disabled="!isLoggedIn"
                >
                  {{ isLoggedIn ? '다운로드' : '로그인 필요' }}
                </button>
              </td>
            </tr>
            <tr v-if="filteredScores.length === 0">
              <td colspan="5" class="empty-text">
                해당 조건에 맞는 악보가 없습니다.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useAuth } from '@/composables/useAuth'

type Score = {
  id: number
  title: string
  key: string
  bpm: number
  category: string
}

const { isLoggedIn, isAdmin } = useAuth()

const scores = ref<Score[]>([
  {
    id: 1,
    title: '내 이름 아시죠',
    key: 'A',
    bpm: 70,
    category: '보혈집회 2025-03',
  },
  {
    id: 2,
    title: '예수, 하나님의 공의',
    key: 'G',
    bpm: 68,
    category: '주일 3부',
  },
])

const keyword = ref('')
const showAddForm = ref(false)

const filteredScores = computed(() => {
  if (!keyword.value.trim()) return scores.value
  const k = keyword.value.toLowerCase()
  return scores.value.filter((s) => s.title.toLowerCase().includes(k))
})
</script>