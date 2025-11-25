<template>
  <div class="app-root">
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
          <audio
            ref="audioPlayer"
            controls
            :src="playlist[currentTrackIndex]"
            @ended="handleEnded"
            class="mini-audio"
          ></audio>
        </div>

        <nav class="nav">
          <RouterLink to="/" class="nav-link">홈</RouterLink>
          <RouterLink to="/vision" class="nav-link">비전</RouterLink>
          <RouterLink to="/worship-log" class="nav-link">집회안내</RouterLink>
          <RouterLink to="/scores" class="nav-link">악보</RouterLink>
          <RouterLink to="/tickets" class="nav-link">집회신청</RouterLink>
          <RouterLink to="/map" class="nav-link">오시는길</RouterLink>
          <RouterLink to="/qna" class="nav-link">Q&amp;A</RouterLink>
        </nav>

        <div class="auth-area">
          <RouterLink v-if="!isLoggedIn" to="/login" class="btn primary" role="button">
            로그인
          </RouterLink>

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
import { ref } from 'vue'
import { useAuth } from '@/composables/useAuth'
import logo from '@/assets/image/logo.png'
import light from '@/assets/music/빛의사자들이여(inst).mp3'
import celevrate from '@/assets/music/CelebratetheLight(inst).mp3'

const { isLoggedIn, isAdmin } = useAuth()

const playlist = [celevrate, light]
const currentTrackIndex = ref(0)
const audioPlayer = ref<HTMLAudioElement | null>(null)

const handleEnded = () => {
  currentTrackIndex.value = (currentTrackIndex.value + 1) % playlist.length
  
  setTimeout(() => {
    if (audioPlayer.value) {
      audioPlayer.value.play()
    }
  }, 50)
}
</script>