<script setup lang="ts">
import { useAuth } from "@/composables/useAuth";
import { staffRoleLabel } from "@/composables/session";
import MemberRoleManager from "@/components/admin/MemberRoleManager.vue";
import AdminHomeManager from "@/components/admin/AdminHomeManager.vue";
import AdminWorshipStatus from "@/components/admin/AdminWorshipStatus.vue";
import "../styles/Admin.css";

const { isAdmin, isSuperAdmin } = useAuth();
</script>

<template>
  <div class="page">
    <section class="section">
      <div class="section-header">
        <div>
          <h1 class="section-title">관리 대시보드</h1>
          <p class="section-subtitle">Vision과 집회안내에서 {{ staffRoleLabel }} 기능으로 수정/삭제/추가를 할 수 있습니다.</p>
        </div>
      </div>
      <div class="admin-links">
        <RouterLink to="/vision" class="admin-card">
          <h3>👥 비전 관리</h3>
          <p>팀원 정보 수정 및 관리</p>
        </RouterLink>
        <RouterLink to="/worship-log" class="admin-card">
          <h3>📅 집회안내 관리</h3>
          <p>집회 정보 추가, 수정, 삭제</p>
        </RouterLink>
        <!--
        <RouterLink to="/tickets" class="admin-card">
          <h3>🎫 집회신청 관리</h3>
          <p>집회 신청 현황 관리</p>
        </RouterLink>
        -->
      </div>
      <MemberRoleManager v-if="isSuperAdmin" />
      <AdminHomeManager v-if="isAdmin" />
      <AdminWorshipStatus />
    </section>
  </div>
</template>
