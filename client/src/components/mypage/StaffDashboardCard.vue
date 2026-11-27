<script setup lang="ts">
import { onMounted, ref } from "vue";
import { worshipApi } from "@/api/worship";

defineProps<{ roleLabel: string }>();
const total = ref<number>();
onMounted(async () => {
  try {
    total.value = (await worshipApi.getAll()).data.length;
  } catch (error) {
    console.error("집회 수 조회 실패:", error);
  }
});
</script>

<template>
  <div class="admin-dashboard-card">
    <h3 class="card-title">{{ roleLabel }} 대시보드</h3>
    <div class="dashboard-stats">
      <div class="stat-box">
        <div class="stat-icon">📅</div>
        <div class="stat-info">
          <span class="stat-label">전체 집회</span>
          <span class="stat-value">{{ total ?? "—" }}</span>
        </div>
      </div>
      <!--
      <div class="stat-box">
        <div class="stat-icon">👥</div>
        <div class="stat-info">
          <span class="stat-label">총 신청자</span>
          <span class="stat-value">{{ totalApplications }}</span>
        </div>
      </div>
      <div class="stat-box">
        <div class="stat-icon">🎫</div>
        <div class="stat-info">
          <span class="stat-label">총 인원</span>
          <span class="stat-value">{{ totalPartySize }}</span>
        </div>
      </div>
      -->
    </div>
    <div class="dashboard-actions">
      <RouterLink to="/admin" class="btn primary small">⚙️ 관리 대시보드</RouterLink>
      <!--
      <RouterLink to="/tickets" class="btn primary small">📋 집회 관리</RouterLink>
      <button class="btn small" @click="showAdminApplications = true">👥 신청 현황 보기</button>
      -->
    </div>
  </div>
</template>
