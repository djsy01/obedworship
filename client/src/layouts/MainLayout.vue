<script setup lang="ts">
import { ref, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuth } from '@/composables/useAuth';
import { sessionName } from '@/composables/session';
import { useHeaderAssets } from '@/composables/useHeaderAssets';
import AppHeader from '@/components/layout/AppHeader.vue';
import MobileMenu from '@/components/layout/MobileMenu.vue';
import AppFooter from '@/components/layout/AppFooter.vue';

const router = useRouter();
const { isLoggedIn, isAdmin, logout } = useAuth();

const { logo, playlist } = useHeaderAssets();
const showMobileMenu = ref(false);

const lockScroll = () => { document.body.style.overflow = 'hidden'; document.body.style.position = 'fixed'; document.body.style.width = '100%'; };
const unlockScroll = () => { document.body.style.overflow = ''; document.body.style.position = ''; document.body.style.width = ''; };

const toggleMobileMenu = () => { showMobileMenu.value ? closeMobileMenu() : (showMobileMenu.value = true, lockScroll()); };
const closeMobileMenu = () => { showMobileMenu.value = false; unlockScroll(); };

const handleMobileLogout = () => {
  if (confirm('로그아웃 하시겠습니까?')) { logout(); closeMobileMenu(); router.push('/'); }
};
const handleGoToMypage = () => { closeMobileMenu(); router.push('/mypage'); };

onUnmounted(unlockScroll);
</script>

<template>
  <div class="app-root">
    <AppHeader :logo="logo" :playlist="playlist" @toggle-mobile-menu="toggleMobileMenu" />
    <MobileMenu
      :show="showMobileMenu"
      :is-logged-in="isLoggedIn"
      :user-name="sessionName"
      :is-admin="isAdmin"
      @close="closeMobileMenu"
      @go-to-mypage="handleGoToMypage"
      @logout="handleMobileLogout"
    />
    <main class="app-main"><slot /></main>
    <AppFooter />
  </div>
</template>
