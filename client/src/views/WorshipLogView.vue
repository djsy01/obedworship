<!-- src/views/WorshipLogView.vue -->
<template>
  <div class="page">
    <section class="section">
      <div class="section-header">
        <h1 class="section-title">집회안내 · 기록</h1>

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

      <div class="log-list">
        <article
          v-for="w in filteredLogs"
          :key="w.id"
          class="log-card"
        >
          <p class="log-date">{{ w.date }}</p>
          <h2 class="log-title">{{ w.title }}</h2>
          <p class="log-meta">
            설교: {{ w.preacher }} · 인도: {{ w.leader }}
          </p>
          <p class="log-desc">
            {{ w.description }}
          </p>
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

type WorshipLog = {
  id: number
  date: string
  year: number
  title: string
  preacher: string
  leader: string
  description: string
}

// 더미 데이터 (나중에 API 데이터로 교체)
const logs = ref<WorshipLog[]>([
  {
    id: 1,
    date: '2025-03-15',
    year: 2025,
    title: '보혈 찬양집회',
    preacher: 'OOO 목사',
    leader: 'OBED Worship',
    description: '보혈과 십자가를 주제로 드려진 찬양집회입니다.',
  },
  {
    id: 2,
    date: '2024-12-06',
    year: 2024,
    title: '평안을 너희에게',
    preacher: 'OOO 목사',
    leader: 'OBED Worship',
    description: '요한복음 14:27 말씀을 나누며 평안을 선포하는 집회입니다.',
  },
])

const selectedYear = ref<string>('')

const years = computed(() =>
  Array.from(new Set(logs.value.map((l) => l.year))).sort((a, b) => b - a),
)

const filteredLogs = computed(() => {
  if (!selectedYear.value) return logs.value
  const year = Number(selectedYear.value)
  return logs.value.filter((l) => l.year === year)
})
</script>
