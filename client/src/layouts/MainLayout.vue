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
          <!-- 로그인 전 -->
          <RouterLink v-if="!isLoggedIn" to="/login" class="btn primary" role="button">
            로그인
          </RouterLink>

          <!-- 로그인 후 -->
          <div v-else class="user-menu-wrapper">
            <div class="user-chip" @click="toggleDropdown">
              <span class="user-name">
                {{ isAdmin ? '관리자' : '사용자' }}
              </span>
              <span class="dropdown-arrow">▼</span>
            </div>

            <!-- 드롭다운 메뉴 -->
            <div v-if="showDropdown" class="dropdown-menu">
              <button @click="goToMyPage" class="dropdown-item">
                👤 마이페이지
              </button>
              <button @click="handleLogout" class="dropdown-item logout">
                🚪 로그아웃
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>

    <main class="app-main">
      <slot />
    </main>

    <footer class="app-footer">
      <div class="footer-content">
        <p class="footer-text">
          © {{ new Date().getFullYear() }} OBED Worship. All rights reserved.
        </p>
        <div class="footer-social">
          <a
            href="https://www.instagram.com/obed_worship"
            target="_blank"
            rel="noopener noreferrer"
            class="social-link"
            title="OBED Worship Instagram"
          >
            <img :src="instagramIcon" alt="Instagram" class="social-icon-footer" />
          </a>
          <a
            href="https://www.youtube.com/@obed_worship"
            target="_blank"
            rel="noopener noreferrer"
            class="social-link"
            title="OBED Worship YouTube"
          >
            <img :src="youtubeIcon" alt="YouTube" class="social-icon-footer" />
          </a>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import logo from '@/assets/image/logo.png'
import light from '@/assets/music/빛의사자들이여(inst).mp3'
import celevrate from '@/assets/music/CelebratetheLight(inst).mp3'
import instagramIcon from '@/assets/icons/Instargram.png'
import youtubeIcon from '@/assets/icons/youtube.png'

const router = useRouter()
const { isLoggedIn, isAdmin, logout } = useAuth()

const playlist = [celevrate, light]
const currentTrackIndex = ref(0)
const audioPlayer = ref<HTMLAudioElement | null>(null)
const showDropdown = ref(false)

const handleEnded = () => {
  currentTrackIndex.value = (currentTrackIndex.value + 1) % playlist.length
  
  setTimeout(() => {
    if (audioPlayer.value) {
      audioPlayer.value.play()
    }
  }, 50)
}

// 드롭다운 토글
const toggleDropdown = () => {
  showDropdown.value = !showDropdown.value
}

// 마이페이지 이동
const goToMyPage = () => {
  showDropdown.value = false
  router.push('/mypage')
  // TODO: 마이페이지 라우트 추가 필요
}

// 로그아웃
const handleLogout = () => {
  if (confirm('로그아웃 하시겠습니까?')) {
    logout()
    showDropdown.value = false
    router.push('/')
  }
}

// 외부 클릭 시 드롭다운 닫기
const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as HTMLElement
  if (!target.closest('.user-menu-wrapper')) {
    showDropdown.value = false
  }
}

// 마운트 시 이벤트 리스너 추가
onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>