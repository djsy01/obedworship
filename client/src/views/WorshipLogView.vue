<template>
  <div class="page">
    <section class="section">
      <div class="section-header">
        <h1 class="section-title">집회안내</h1>

        <div class="section-controls">
          <label class="field">
            <span class="field-label">연도</span>
            <select v-model="selectedYear">
              <option value="">전체</option>
              <option
                v-for="year in years"
                :key="year"
                :value="year"
              >
                {{ year }}
              </option>
            </select>
          </label>
        </div>
      </div>

      <div class="log-grid">
        <article
          v-for="w in filteredLogs"
          :key="w.id"
          class="log-card"
          @click="goToDetail(w.id)"
        >
          <p class="log-date">{{ w.date }}</p>
          <h2 class="log-title">{{ w.title }}</h2>
          <p class="log-meta">
            설교: {{ w.preacher }} · 찬양: {{ w.worship }}
            <template v-if="w.guest && w.guest.trim() !== ''">
              · 초청 간사: {{ w.guest }}
            </template>
          </p>
          <p class="log-desc">
            {{ w.description }}
          </p>
          
          <!-- 관리자 전용 액션 버튼 -->
          <div v-if="isAdmin" class="admin-card-actions" @click.stop>
            <button class="btn-icon edit" @click="editWorship(w.id)" title="편집">
              ✏️
            </button>
            <button class="btn-icon delete" @click="deleteWorship(w.id)" title="삭제">
              🗑️
            </button>
          </div>
          
          <div class="log-arrow">
            <span>자세히 보기 →</span>
          </div>
        </article>

        <p v-if="filteredLogs.length === 0" class="empty-text">
          해당 조건에 맞는 집회 기록이 없습니다.
        </p>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import '../styles/WorshipLog.css'

const router = useRouter()

type WorshipLog = {
  id: number
  date: string
  year: number
  title: string
  preacher: string
  worship: string
  guest?: string
  description: string
}

// 더미 데이터 (나중에 API 데이터로 교체)
const logs = ref<WorshipLog[]>([
  {
    id: 1,
    date: '2025-03-22',
    year: 2025,
    title: '하나됨',
    preacher: '민찬기 목사',
    worship: 'OBED Worship',
    description: '호흡있는 모든 자들은 찬양하라',
  },
  {
    id: 2,
    date: '2025-12-06',
    year: 2025,
    title: '샬롬',
    preacher: '박훈 목사',
    worship: 'OBED Worship',
    guest: '찬양사역자 오은',
    description: '너희는 마음에 근심하지도 말고 두려워하지도 말라',
  },
  {
    id: 3,
    date: '2026-02-15',
    year: 2026,
    title: '은혜',
    preacher: '김철수 목사',
    worship: 'OBED Worship',
    description: '주님의 은혜가 충만한 예배',
  },
  {
    id: 4,
    date: '2027-01-20',
    year: 2027,
    title: '새로운 시작',
    preacher: '이영희 목사',
    worship: 'OBED Worship',
    guest: '찬양사역자 김준',
    description: '새해 첫 집회, 주님과 함께 새롭게 시작하는 시간',
  },
])

const selectedYear = ref<string>('')

const years = computed(() =>
  Array.from(new Set(logs.value.map((l) => l.year))).sort((a, b) => b - a),
)

const filteredLogs = computed(() => {
  let filtered = logs.value;
  if (selectedYear.value) {
    const year = Number(selectedYear.value);
    filtered = logs.value.filter((l) => l.year === year);
  }

  return filtered.sort((a, b) => b.id - a.id);
});

const goToDetail = (id: number) => {
  router.push({ name: 'worship-detail', params: { id: id.toString() } })
}

const editWorship = (id: number) => {
  // TODO: 편집 모달 또는 편집 페이지로 이동
  console.log('편집:', id)
  alert(`집회 ${id} 편집 기능 구현 예정`)
}

const deleteWorship = (id: number) => {
  if (confirm('정말 이 집회를 삭제하시겠습니까?')) {
    // TODO: API 호출하여 삭제
    console.log('삭제:', id)
    alert(`집회 ${id} 삭제 기능 구현 예정`)
  }
}
</script>