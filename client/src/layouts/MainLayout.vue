<script setup lang="ts">
import { ref, computed, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuth } from '@/composables/useAuth';
import { assetApi } from '@/api/assets';
import AppHeader from '@/components/layout/AppHeader.vue';
import MobileMenu from '@/components/layout/MobileMenu.vue';
import AppFooter from '@/components/layout/AppFooter.vue';

const router = useRouter();
const { isLoggedIn, isAdmin, logout } = useAuth();

const logo = ref('');
const playlist = ref<string[]>([]);
const showMobileMenu = ref(false);

const lockScroll = () => { document.body.style.overflow = 'hidden'; document.body.style.position = 'fixed'; document.body.style.width = '100%'; };
const unlockScroll = () => { document.body.style.overflow = ''; document.body.style.position = ''; document.body.style.width = ''; };

const toggleMobileMenu = () => { showMobileMenu.value ? closeMobileMenu() : (showMobileMenu.value = true, lockScroll()); };
const closeMobileMenu = () => { showMobileMenu.value = false; unlockScroll(); };

const handleMobileLogout = () => {
  if (confirm('로그아웃 하시겠습니까?')) { logout(); closeMobileMenu(); router.push('/'); }
};
const handleGoToMypage = () => { closeMobileMenu(); router.push('/mypage'); };

const userName = computed(() => {
  if (!isLoggedIn.value) return '';
  return localStorage.getItem('userName') || (isAdmin.value ? '관리자' : '사용자');
});

const loadAssets = async () => {
  try {
    const logoRes = await assetApi.getByKey('home_logo');
    if (logoRes.data.file_url) logo.value = logoRes.data.file_url;
  } catch {}
  try {
    const songsRes = await assetApi.getByCategory('songs');
    if (Array.isArray(songsRes.data) && songsRes.data.length > 0) {
      playlist.value = songsRes.data
        .slice().sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0))
        .filter((s) => s.file_url).map((s) => s.file_url as string);
    }
  } catch {}
};

loadAssets();
onUnmounted(unlockScroll);
</script>

<template>
  <div class="app-root">
    <AppHeader :logo="logo" :playlist="playlist" @toggle-mobile-menu="toggleMobileMenu" />
    <MobileMenu
      :show="showMobileMenu"
      :is-logged-in="isLoggedIn"
      :user-name="userName"
      :is-admin="isAdmin"
      @close="closeMobileMenu"
      @go-to-mypage="handleGoToMypage"
      @logout="handleMobileLogout"
    />
    <main class="app-main"><slot /></main>
    <AppFooter />
  </div>
</template>
