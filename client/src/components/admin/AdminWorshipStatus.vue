<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { worshipApi, type Worship } from "@/api/worship";

const worships = ref<Worship[]>([]);
const loading = ref(true);
const upcomingWorships = computed(() => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return worships.value.filter(worship => new Date(worship.date) >= today).length;
});
const recentWorships = computed(() => worships.value.slice(0, 10)
  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
onMounted(async () => {
  try {
    worships.value = (await worshipApi.getAll()).data;
  } catch (error) {
    console.error("집회 조회 실패:", error);
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div class="dashboard-section">
    <h2 class="section-title-sub">집회 현황</h2>
    <div v-if="loading" class="loading">로딩 중...</div>
    <div v-else-if="!worships.length" class="empty">집회 정보가 없습니다.</div>
    <div v-else class="stats-grid">
      <div class="stat-card">
        <div class="stat-value">{{ worships.length }}</div>
        <div class="stat-label">전체 집회</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">{{ upcomingWorships }}</div>
        <div class="stat-label">예정 집회</div>
      </div>
    </div>
    <div class="recent-worships">
      <h3 class="list-title">최근 집회</h3>
      <div class="table-wrapper">
        <table class="table">
          <thead><tr><th>제목</th><th>날짜</th><th>설교자</th><th>예배팀</th></tr></thead>
          <tbody>
            <tr v-for="worship in recentWorships" :key="worship.id">
              <td class="title-cell">{{ worship.title }}</td>
              <td>{{ new Date(worship.date).toLocaleDateString("ko-KR") }}</td>
              <td>{{ worship.preacher }}</td>
              <td>{{ worship.worship_team }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
