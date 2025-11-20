<!-- src/layouts/MainLayout.vue -->
<template>
  <div class="app-root">
    <header class="app-header">
      <div class="header-inner">
        <div class="logo">
          <span class="logo-main">OBED</span>
          <span class="logo-sub">Worship</span>
        </div>

        <nav class="nav">
          <RouterLink to="/" class="nav-link">홈</RouterLink>
          <RouterLink to="/vision" class="nav-link">비전</RouterLink>
          <RouterLink to="/worship-log" class="nav-link">집회안내</RouterLink>
          <RouterLink to="/scores" class="nav-link">악보</RouterLink>
          <RouterLink to="/tickets" class="nav-link">집회티켓</RouterLink>
          <RouterLink to="/qna" class="nav-link">Q&amp;A</RouterLink>
        </nav>

        <div class="auth-area">
          <button v-if="!isLoggedIn" class="btn primary" type="button">
            로그인
          </button>

          <div v-else class="user-chip">
            <span class="user-name">
              {{ isAdmin ? '관리자' : '사용자' }}
            </span>
          </div>
        </div>
      </div>
    </header>

    <main class="app-main">
      <slot />
    </main>

    <footer class="app-footer">
      © {{ new Date().getFullYear() }} OBED Worship. All rights reserved.
    </footer>
  </div>
</template>

<script setup lang="ts">
import { useAuth } from '@/composables/useAuth'

const { isLoggedIn, isAdmin } = useAuth()
</script>
