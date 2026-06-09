<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuth } from '@/composables/useAuth';

const props = defineProps<{ logo: string; playlist: string[] }>();
const emit = defineEmits<{ 'toggle-mobile-menu': [] }>();

const router = useRouter();
const { isLoggedIn, isAdmin, logout } = useAuth();

const currentTrackIndex = ref(0);
const audioPlayer = ref<HTMLAudioElement | null>(null);
const showDropdown = ref(false);

const userName = computed(() => {
  if (!isLoggedIn.value) return '';
  return localStorage.getItem('userName') || (isAdmin.value ? '관리자' : '사용자');
});

const handleEnded = () => {
  if (!props.playlist.length) return;
  currentTrackIndex.value = (currentTrackIndex.value + 1) % props.playlist.length;
  setTimeout(() => { audioPlayer.value?.load(); audioPlayer.value?.play(); }, 50);
};

const navigate = (path: string) => { showDropdown.value = false; router.push(path); };
const handleLogout = () => {
  if (confirm('로그아웃 하시겠습니까?')) { logout(); showDropdown.value = false; router.push('/'); }
};
const handleClickOutside = (e: MouseEvent) => {
  if (!(e.target as HTMLElement).closest('.user-menu-wrapper')) showDropdown.value = false;
};

onMounted(() => document.addEventListener('click', handleClickOutside));
onUnmounted(() => document.removeEventListener('click', handleClickOutside));
</script>

<template>
  <header class="app-header">
    <div class="header-inner">
      <RouterLink to="/" class="logo">
        <img :src="logo" alt="OBED Logo" class="logo-img" />
        <div class="logo-text">
          <span class="logo-main">OBED</span>
          <span class="logo-sub">Worship</span>
        </div>
      </RouterLink>

      <div class="header-player">
        <audio ref="audioPlayer" controls :src="playlist[currentTrackIndex]" @ended="handleEnded" class="mini-audio"></audio>
      </div>

      <nav class="nav desktop-nav">
        <RouterLink to="/" class="nav-link">홈</RouterLink>
        <RouterLink to="/vision" class="nav-link">비전</RouterLink>
        <RouterLink to="/worship-log" class="nav-link">집회안내</RouterLink>
        <RouterLink to="/scores" class="nav-link">악보</RouterLink>
        <!-- <RouterLink to="/tickets" class="nav-link">집회신청</RouterLink> -->
        <RouterLink to="/map" class="nav-link">오시는길</RouterLink>
        <RouterLink to="/qna" class="nav-link">Q&amp;A</RouterLink>
      </nav>

      <div class="auth-area desktop-auth">
        <RouterLink v-if="!isLoggedIn" to="/login" class="btn primary" role="button">로그인</RouterLink>
        <div v-else class="user-menu-wrapper">
          <div class="user-chip" @click="showDropdown = !showDropdown">
            <span class="user-name">{{ userName }}</span>
            <span class="dropdown-arrow">▼</span>
          </div>
          <div v-if="showDropdown" class="dropdown-menu">
            <button @click="navigate('/mypage')" class="dropdown-item">👤 마이페이지</button>
            <button v-if="isAdmin" @click="navigate('/admin')" class="dropdown-item admin">⚙️ 관리자</button>
            <button @click="handleLogout" class="dropdown-item logout">🚪 로그아웃</button>
          </div>
        </div>
      </div>

      <button class="mobile-menu-btn" @click="emit('toggle-mobile-menu')" aria-label="메뉴">
        <span class="hamburger-line"></span>
        <span class="hamburger-line"></span>
        <span class="hamburger-line"></span>
      </button>
    </div>
  </header>
</template>
