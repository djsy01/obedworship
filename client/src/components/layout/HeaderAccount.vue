<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuth } from '@/composables/useAuth';
import { sessionName, staffRoleLabel } from '@/composables/session';

const router = useRouter();
const { isLoggedIn, isAdmin, logout } = useAuth();
const showDropdown = ref(false);
const navigate = (path: string) => { showDropdown.value = false; router.push(path); };
const handleLogout = () => {
  if (confirm('로그아웃 하시겠습니까?')) { logout(); navigate('/'); }
};
const handleClickOutside = (event: MouseEvent) => {
  if (!(event.target as HTMLElement).closest('.user-menu-wrapper')) showDropdown.value = false;
};
onMounted(() => document.addEventListener('click', handleClickOutside));
onUnmounted(() => document.removeEventListener('click', handleClickOutside));
</script>

<template>
  <div class="auth-area desktop-auth">
    <RouterLink v-if="!isLoggedIn" to="/login" class="btn primary" role="button">로그인</RouterLink>
    <div v-else class="user-menu-wrapper">
      <div class="user-chip" @click="showDropdown = !showDropdown">
        <span class="user-name">{{ sessionName }}</span>
        <span class="dropdown-arrow">▼</span>
      </div>
      <div v-if="showDropdown" class="dropdown-menu">
        <button class="dropdown-item" @click="navigate('/mypage')">👤 마이페이지</button>
        <button v-if="isAdmin" class="dropdown-item admin" @click="navigate('/admin')">⚙️ {{ staffRoleLabel }}</button>
        <button class="dropdown-item logout" @click="handleLogout">🚪 로그아웃</button>
      </div>
    </div>
  </div>
</template>
