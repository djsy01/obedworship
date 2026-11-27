<script setup lang="ts">
import { ref } from "vue";
import { isAdmin } from "@/composables/session";
import { useMyProfile } from "@/components/mypage/useMyProfile";
import ProfileCard from "@/components/mypage/ProfileCard.vue";
import ProfileEditModal from "@/components/mypage/ProfileEditModal.vue";
import PasswordModal from "@/components/mypage/PasswordModal.vue";
import StaffDashboardCard from "@/components/mypage/StaffDashboardCard.vue";
import "../styles/MyPage.css";

const { profile, loading, error, roleLabel, load, save } = useMyProfile();
const editOpen = ref(false);
const passwordOpen = ref(false);
async function saveProfile(name: string, phone: string) {
  if (await save(name, phone)) editOpen.value = false;
}
</script>

<template>
  <div class="page">
    <section class="section">
      <div class="section-header">
        <div>
          <h1 class="section-title">마이페이지</h1>
          <p class="section-subtitle">내 정보를 <!--와 집회 신청 내역을--> 확인하고 관리할 수 있습니다.</p>
        </div>
      </div>
      <div v-if="loading" class="loading">로딩 중...</div>
      <div v-else-if="error" class="error-message">
        <p>정보를 가져오지 못했습니다.</p>
        <button class="btn primary" @click="load">다시 시도</button>
      </div>
      <div v-else class="mypage-grid">
        <ProfileCard :profile="profile" :role-label="roleLabel" @edit="editOpen = true" @password="passwordOpen = true" />
        <StaffDashboardCard v-if="isAdmin" :role-label="roleLabel" />
      </div>
      <!-- 신청 UI: TicketHistoryFilters.vue, TicketHistoryList.vue, TicketAdminModal.vue, TicketDetailModal.vue -->
    </section>
    <ProfileEditModal v-if="editOpen" :profile="profile" @close="editOpen = false" @save="saveProfile" />
    <PasswordModal v-if="passwordOpen" @close="passwordOpen = false" />
  </div>
</template>
