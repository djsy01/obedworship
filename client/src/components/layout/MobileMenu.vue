<script setup lang="ts">
defineProps<{ show: boolean; isLoggedIn: boolean; userName: string; isAdmin: boolean }>();
const emit = defineEmits<{
  close: [];
  'go-to-mypage': [];
  logout: [];
}>();

const handleTouchStart = (e: TouchEvent) => { (e.currentTarget as HTMLElement & { _touchX?: number })._touchX = e.touches[0].clientX; };
const handleTouchMove = (e: TouchEvent) => {
  const el = e.currentTarget as HTMLElement & { _touchX?: number };
  if (Math.abs(e.touches[0].clientX - (el._touchX ?? 0)) > 10) e.preventDefault();
};
</script>

<template>
  <transition name="mobile-menu">
    <div v-if="show" class="mobile-menu-overlay" @click="emit('close')" @touchmove.prevent>
      <nav class="mobile-nav" @click.stop @touchstart="handleTouchStart" @touchmove="handleTouchMove">
        <div class="mobile-nav-header">
          <span class="mobile-nav-title">메뉴</span>
          <button class="mobile-nav-close" @click="emit('close')">✕</button>
        </div>
        <div class="mobile-nav-links">
          <RouterLink to="/" class="mobile-nav-link" @click="emit('close')">홈</RouterLink>
          <RouterLink to="/vision" class="mobile-nav-link" @click="emit('close')">비전</RouterLink>
          <RouterLink to="/worship-log" class="mobile-nav-link" @click="emit('close')">집회안내</RouterLink>
          <RouterLink to="/scores" class="mobile-nav-link" @click="emit('close')">악보</RouterLink>
          <!-- <RouterLink to="/applications" class="mobile-nav-link" @click="emit('close')">집회신청</RouterLink> -->
          <RouterLink to="/map" class="mobile-nav-link" @click="emit('close')">오시는길</RouterLink>
          <RouterLink to="/qna" class="mobile-nav-link" @click="emit('close')">Q&amp;A</RouterLink>
          <div class="mobile-nav-divider"></div>
          <RouterLink v-if="!isLoggedIn" to="/login" class="mobile-nav-link login-link" @click="emit('close')">로그인</RouterLink>
          <template v-else>
            <div class="mobile-user-info">{{ userName }}</div>
            <button @click="emit('go-to-mypage')" class="mobile-nav-link">👤 마이페이지</button>
            <button @click="emit('logout')" class="mobile-nav-link logout-link">🚪 로그아웃</button>
          </template>
        </div>
      </nav>
    </div>
  </transition>
</template>
