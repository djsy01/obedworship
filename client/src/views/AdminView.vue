<template>
  <div class="page">
    <section class="section">
      <div class="section-header">
        <div>
          <h1 class="section-title">관리 대시보드</h1>
          <p class="section-subtitle">
            Vision, 집회안내, 집회신청에서 관리자 기능으로 수정/삭제/추가를 할
            수 있습니다.
          </p>
        </div>
      </div>

      <!-- 관리 링크 -->
      <div class="admin-links">
        <RouterLink to="/vision" class="admin-card">
          <h3>👥 비전 관리</h3>
          <p>팀원 정보 수정 및 관리</p>
        </RouterLink>

        <RouterLink to="/worship-log" class="admin-card">
          <h3>📅 집회안내 관리</h3>
          <p>집회 정보 추가, 수정, 삭제</p>
        </RouterLink>

        <RouterLink to="/tickets" class="admin-card">
          <h3>🎫 집회신청 관리</h3>
          <p>집회 신청 현황 관리</p>
        </RouterLink>
      </div>

      <!-- 집회 현황 -->
      <div class="dashboard-section">
        <h2 class="section-title-sub">집회 현황</h2>

        <div v-if="loading" class="loading">로딩 중...</div>
        <div v-else-if="worships.length === 0" class="empty">
          집회 정보가 없습니다.
        </div>
        <div v-else class="stats-grid">
          <div class="stat-card">
            <div class="stat-value">{{ totalWorships }}</div>
            <div class="stat-label">전체 집회</div>
          </div>

          <div class="stat-card">
            <div class="stat-value">{{ currentYearWorships }}</div>
            <div class="stat-label">{{ currentYear }}년 집회</div>
          </div>

          <div class="stat-card">
            <div class="stat-value">{{ upcomingWorships }}</div>
            <div class="stat-label">예정 집회</div>
          </div>
        </div>

        <!-- 최근 집회 목록 -->
        <div class="recent-worships">
          <h3 class="list-title">최근 집회</h3>
          <div class="table-wrapper">
            <table class="table">
              <thead>
                <tr>
                  <th>제목</th>
                  <th>날짜</th>
                  <th>설교자</th>
                  <th>예배팀</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="worship in recentWorships" :key="worship.id">
                  <td class="title-cell">{{ worship.title }}</td>
                  <td>{{ formatDate(worship.date) }}</td>
                  <td>{{ worship.preacher }}</td>
                  <td>{{ worship.worship_team }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { RouterLink } from "vue-router";
import { useAuth } from "@/composables/useAuth";
import { worshipApi, type Worship } from "@/api/worship";

const { isAdmin } = useAuth();
const worships = ref<Worship[]>([]);
const loading = ref(false);

const currentYear = new Date().getFullYear();

// 집회 조회
const fetchWorships = async () => {
  loading.value = true;
  try {
    const response = await worshipApi.getAll();
    worships.value = response.data;
  } catch (error) {
    console.error("집회 조회 실패:", error);
  } finally {
    loading.value = false;
  }
};

// 날짜 포맷팅
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString("ko-KR");
};

// 통계 계산
const totalWorships = computed(() => worships.value.length);

const currentYearWorships = computed(
  () => worships.value.filter((w) => w.year === currentYear).length,
);

const upcomingWorships = computed(() => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return worships.value.filter((w) => new Date(w.date) >= today).length;
});

const recentWorships = computed(() =>
  worships.value
    .slice(0, 10)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
);

// 초기 로드
onMounted(() => {
  if (!isAdmin.value) {
    alert("관리자만 접근 가능합니다");
    window.history.back();
  }
  fetchWorships();
});
</script>
