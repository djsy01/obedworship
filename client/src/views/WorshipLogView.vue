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

      <div class="log-list">
        <article
          v-for="w in filteredLogs"
          :key="w.id"
          class="log-card"
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
</script>
