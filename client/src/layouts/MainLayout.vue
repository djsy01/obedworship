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

        <nav class="nav desktop-nav">
          <RouterLink to="/" class="nav-link">홈</RouterLink>
          <RouterLink to="/vision" class="nav-link">비전</RouterLink>
          <RouterLink to="/worship-log" class="nav-link">집회안내</RouterLink>
          <RouterLink to="/scores" class="nav-link">악보</RouterLink>
          <!--<RouterLink to="/tickets" class="nav-link">집회신청</RouterLink>-->
          <RouterLink to="/map" class="nav-link">오시는길</RouterLink>
          <RouterLink to="/qna" class="nav-link">Q&amp;A</RouterLink>
        </nav>

        <div class="auth-area desktop-auth">
          <RouterLink
            v-if="!isLoggedIn"
            to="/login"
            class="btn primary"
            role="button"
          >
            로그인
          </RouterLink>

          <div v-else class="user-menu-wrapper">
            <div class="user-chip" @click="toggleDropdown">
              <span class="user-name">
                {{ userName }}
              </span>
              <span class="dropdown-arrow">▼</span>
            </div>

            <div v-if="showDropdown" class="dropdown-menu">
              <button @click="goToMyPage" class="dropdown-item">
                👤 마이페이지
              </button>
              <button
                v-if="isAdmin"
                @click="goToAdmin"
                class="dropdown-item admin"
              >
                ⚙️ 관리자
              </button>
              <button @click="handleLogout" class="dropdown-item logout">
                🚪 로그아웃
              </button>
            </div>
          </div>
        </div>

        <button
          class="mobile-menu-btn"
          @click="toggleMobileMenu"
          aria-label="메뉴"
        >
          <span class="hamburger-line"></span>
          <span class="hamburger-line"></span>
          <span class="hamburger-line"></span>
        </button>
      </div>
    </header>

    <transition name="mobile-menu">
      <div
        v-if="showMobileMenu"
        class="mobile-menu-overlay"
        @click="closeMobileMenu"
        @touchmove.prevent
      >
        <nav
          class="mobile-nav"
          @click.stop
          @touchstart="handleTouchStart"
          @touchmove="handleTouchMove"
        >
          <div class="mobile-nav-header">
            <span class="mobile-nav-title">메뉴</span>
            <button class="mobile-nav-close" @click="closeMobileMenu">✕</button>
          </div>
          <div class="mobile-nav-links">
            <RouterLink to="/" class="mobile-nav-link" @click="closeMobileMenu"
              >홈</RouterLink
            >
            <RouterLink
              to="/vision"
              class="mobile-nav-link"
              @click="closeMobileMenu"
              >비전</RouterLink
            >
            <RouterLink
              to="/worship-log"
              class="mobile-nav-link"
              @click="closeMobileMenu"
              >집회안내</RouterLink
            >
            <RouterLink
              to="/scores"
              class="mobile-nav-link"
              @click="closeMobileMenu"
              >악보</RouterLink
            >
            <RouterLink
              to="/tickets"
              class="mobile-nav-link"
              @click="closeMobileMenu"
              >집회신청</RouterLink
            >
            <RouterLink
              to="/map"
              class="mobile-nav-link"
              @click="closeMobileMenu"
              >오시는길</RouterLink
            >
            <RouterLink
              to="/qna"
              class="mobile-nav-link"
              @click="closeMobileMenu"
              >Q&amp;A</RouterLink
            >

            <div class="mobile-nav-divider"></div>

            <RouterLink
              v-if="!isLoggedIn"
              to="/login"
              class="mobile-nav-link login-link"
              @click="closeMobileMenu"
            >
              로그인
            </RouterLink>

            <template v-else>
              <div class="mobile-user-info">
                {{ userName }}
              </div>
              <button @click="goToMyPage" class="mobile-nav-link">
                👤 마이페이지
              </button>
              <button @click="handleLogout" class="mobile-nav-link logout-link">
                🚪 로그아웃
              </button>
            </template>
          </div>
        </nav>
      </div>
    </transition>

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
            href="https://soundcloud.com/obed-497061928"
            target="_blank"
            rel="noopener noreferrer"
            class="social-link"
            title="OBED Worship Soundcloud"
          >
            <img
              :src="soundcloudIcon"
              alt="Soundcloud"
              class="social-icon-footer"
            />
          </a>
          <a
            href="https://www.instagram.com/obed_worship"
            target="_blank"
            rel="noopener noreferrer"
            class="social-link"
            title="OBED Worship Instagram"
          >
            <img
              :src="instagramIcon"
              alt="Instagram"
              class="social-icon-footer"
            />
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
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import { useAuth } from "@/composables/useAuth";
import { assetApi } from "@/api/assets";
import soundcloudIcon from "@/assets/icons/Soundcloud.png";
import instagramIcon from "@/assets/icons/Instargram.png";
import youtubeIcon from "@/assets/icons/Youtube.png";

const router = useRouter();
const { isLoggedIn, isAdmin, logout } = useAuth();

const logo = ref<string>("");
const playlist = ref<string[]>([]);
const currentTrackIndex = ref(0);
const audioPlayer = ref<HTMLAudioElement | null>(null);
const showDropdown = ref(false);
const showMobileMenu = ref(false);
const touchStartX = ref(0);

// Username (Mock - actually taken from localStorage or Redis)
const userName = computed(() => {
  if (!isLoggedIn.value) return "";

  const storedName = localStorage.getItem("userName");
  if (storedName) return storedName;

  return isAdmin.value ? "관리자" : "사용자";
});

const handleEnded = () => {
  currentTrackIndex.value =
    (currentTrackIndex.value + 1) % playlist.value.length;
  setTimeout(() => {
    if (audioPlayer.value) {
      audioPlayer.value.play();
    }
  }, 50);
};

const toggleDropdown = () => {
  showDropdown.value = !showDropdown.value;
};

const toggleMobileMenu = () => {
  showMobileMenu.value = !showMobileMenu.value;
  if (showMobileMenu.value) {
    document.body.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.width = "100%";
  } else {
    document.body.style.overflow = "";
    document.body.style.position = "";
    document.body.style.width = "";
  }
};

const closeMobileMenu = () => {
  showMobileMenu.value = false;
  document.body.style.overflow = "";
  document.body.style.position = "";
  document.body.style.width = "";
};

const goToMyPage = () => {
  showDropdown.value = false;
  showMobileMenu.value = false;
  document.body.style.overflow = "";
  document.body.style.position = "";
  document.body.style.width = "";
  router.push("/mypage");
};

const goToAdmin = () => {
  showDropdown.value = false;
  showMobileMenu.value = false;
  document.body.style.overflow = "";
  document.body.style.position = "";
  document.body.style.width = "";
  router.push("/admin");
};

const handleLogout = () => {
  if (confirm("로그아웃 하시겠습니까?")) {
    logout();
    showDropdown.value = false;
    showMobileMenu.value = false;
    document.body.style.overflow = "";
    document.body.style.position = "";
    document.body.style.width = "";
    router.push("/");
  }
};

const handleTouchStart = (e: TouchEvent) => {
  touchStartX.value = e.touches[0].clientX;
};

const handleTouchMove = (e: TouchEvent) => {
  const touchCurrentX = e.touches[0].clientX;
  const diff = touchCurrentX - touchStartX.value;

  if (Math.abs(diff) > 10) {
    e.preventDefault();
  }
};

const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as HTMLElement;
  if (!target.closest(".user-menu-wrapper")) {
    showDropdown.value = false;
  }
};

// 자산 로드
const loadAssets = async () => {
  try {
    // 로고 로드
    try {
      const logoRes = await assetApi.getByKey("home_logo");
      if (logoRes.data.file_url) {
        logo.value = logoRes.data.file_url;
      }
    } catch (error) {
      console.error("Logo not found in DB:", error);
    }

    // 음악 로드
    try {
      const songsRes = await assetApi.getByCategory("songs");
      if (
        songsRes.data &&
        Array.isArray(songsRes.data) &&
        songsRes.data.length > 0
      ) {
        playlist.value = songsRes.data
          .filter((song) => song.file_url)
          .map((song) => song.file_url as string);
      }
    } catch (error) {
      console.error("Songs not found in DB:", error);
    }
  } catch (error) {
    console.error("Failed to load assets:", error);
  }
};

onMounted(() => {
  document.addEventListener("click", handleClickOutside);
  loadAssets();
});

onUnmounted(() => {
  document.removeEventListener("click", handleClickOutside);
  document.body.style.overflow = "";
  document.body.style.position = "";
  document.body.style.width = "";
});
</script>
