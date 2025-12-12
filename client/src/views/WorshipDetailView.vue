<template>
  <div class="page">
    <section class="section">
      <div class="detail-header">
        <button class="btn ghost back-btn" @click="goBack">
          ← 목록으로
        </button>
        
        <!-- 관리자 전용 편집 모드 토글 -->
        <button v-if="isAdmin" class="btn primary edit-mode-btn" @click="toggleEditMode">
          {{ editMode ? '💾 저장하기' : '✏️ 편집 모드' }}
        </button>
      </div>

      <div v-if="worship" class="detail-container">
        <!-- 히어로 섹션 -->
        <div class="detail-hero">
          <p class="detail-date">{{ worship.date }}</p>
          <h1 class="detail-title">{{ worship.title }}</h1>
          
          <!-- 집회 정보 -->
          <div class="hero-info">
            <div class="hero-info-item">
              <span class="hero-info-label">설교자</span>
              <span class="hero-info-value">{{ worship.preacher }}</span>
            </div>
            <div class="hero-info-item">
              <span class="hero-info-label">찬양팀</span>
              <span class="hero-info-value">{{ worship.worship }}</span>
            </div>
            <div v-if="worship.guest" class="hero-info-item">
              <span class="hero-info-label">초청 간사</span>
              <span class="hero-info-value">{{ worship.guest }}</span>
            </div>
          </div>

          <!-- 집회 소개 -->
          <p class="hero-description">{{ worship.description }}</p>
        </div>

        <!-- 탭 네비게이션 -->
        <div class="tabs-container">
          <div class="tabs-nav">
            <button
              class="tab-button"
              :class="{ active: activeTab === 'info' }"
              @click="activeTab = 'info'"
            >
              안내
            </button>
            <button
              class="tab-button"
              :class="{ active: activeTab === 'gallery' }"
              @click="activeTab = 'gallery'"
            >
              영상/사진
            </button>
          </div>

          <!-- 안내 탭 내용 -->
          <div v-show="activeTab === 'info'" class="tab-content">
            <div class="detail-content">
              <!-- 시간 안내 -->
              <div v-if="worship.entryTime || worship.startTime" class="time-section">
                <h2 class="section-subtitle">⏰ 시간 안내</h2>
                <div class="time-info">
                  <div v-if="worship.entryTime" class="time-item">
                    <span class="time-label">예배당 입장 시간</span>
                    <span class="time-value">{{ worship.entryTime }}</span>
                  </div>
                  <div v-if="worship.startTime" class="time-item">
                    <span class="time-label">예배 시작</span>
                    <span class="time-value">{{ worship.startTime }}</span>
                  </div>
                </div>
              </div>

              <!-- 홍보 영상 -->
              <div v-if="worship.promoVideo" class="video-section">
                <h2 class="section-subtitle">🎶 홍보영상</h2>
                <div class="video-embed">
                  <iframe
                    :src="getYouTubeEmbedUrl(worship.promoVideo)"
                    frameborder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowfullscreen
                  ></iframe>
                </div>
              </div>

              <!-- 장소 안내 -->
              <div v-if="worship.location" class="location-section">
                <h2 class="section-subtitle">⛪ 장소 안내</h2>
                <div class="location-info">
                  <p class="location-text">{{ worship.location }}</p>
                  <div v-if="worship.locationLink" class="map-embed">
                    <iframe
                      src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d1580.1564111497155!2d126.8361455337295!3d37.61832881652992!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x357c9a4552397f0b%3A0xc99a963ed07b51d8!2z7JiI7IiY7J246rWQ7ZqM!5e0!3m2!1sko!2sus!4v1746049290723!5m2!1sko!2sus"
                      frameborder="0"
                      allowfullscreen
                      loading="lazy"
                      referrerpolicy="no-referrer-when-downgrade"
                    ></iframe>
                  </div>
                  <a v-if="worship.locationLink" :href="worship.locationLink" target="_blank" rel="noopener noreferrer" class="btn primary map-link-btn">
                    🗺️ 길찾기
                  </a>
                </div>
              </div>

              <!-- 주차 안내 -->
              <div v-if="worship.parking" class="parking-section">
                <h2 class="section-subtitle">🚙 주차 안내</h2>
                <p class="parking-text">{{ worship.parking }}</p>
              </div>

              <!-- 자리 안내 -->
              <div v-if="worship.seating" class="seating-section">
                <h2 class="section-subtitle">🪑 자리 안내</h2>
                <p class="seating-text">{{ worship.seating }}</p>
              </div>

              <!-- 미리듣기 -->
              <div v-if="worship.openingSongs || worship.celebrationSongs || worship.prelistenVideo" class="songs-section">
                <h2 class="section-subtitle">🎵 미리듣기</h2>
                <p class="songs-intro">
                  함께 부르게 될 곡들의 배우기 음원 링크를 아래에 보내드립니다.<br>
                  예배 전 충분히 듣고 익혀 오신다면, 당일 예배가 더욱 깊고 풍성하게 채워질 것입니다.
                </p>

                <div v-if="worship.openingSongs" class="song-category">
                  <h3 class="song-category-title">Opening Song</h3>
                  <ol class="song-list">
                    <li v-for="(song, index) in worship.openingSongs" :key="index">{{ song }}</li>
                  </ol>
                </div>

                <div v-if="worship.celebrationSongs" class="song-category">
                  <h3 class="song-category-title">Celebration Song</h3>
                  <ol class="song-list">
                    <li v-for="(song, index) in worship.celebrationSongs" :key="index">{{ song }}</li>
                  </ol>
                </div>

                <div v-if="worship.prelistenVideo" class="video-embed">
                  <iframe
                    :src="getYouTubeEmbedUrl(worship.prelistenVideo)"
                    frameborder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowfullscreen
                  ></iframe>
                </div>
              </div>
            </div>
          </div>

          <!-- 영상/사진 탭 내용 -->
          <div v-show="activeTab === 'gallery'" class="tab-content">
            <div class="detail-content">
              <!-- 집회 영상들 -->
              <div class="worship-video-section">
                <div class="section-header-with-action">
                  <h2 class="section-subtitle">🎬 집회 영상</h2>
                  <button v-if="isAdmin && editMode" @click="openAddVideoModal" class="btn small primary">
                    + 영상 추가
                  </button>
                </div>
                
                <div v-if="worship.worshipVideos && worship.worshipVideos.length > 0">
                  <div
                    v-for="(video, index) in worship.worshipVideos"
                    :key="index"
                    class="video-wrapper-with-delete"
                    :style="{ marginBottom: index < worship.worshipVideos.length - 1 ? '2rem' : '0' }"
                  >
                    <!-- 관리자 전용 삭제 버튼 -->
                    <button 
                      v-if="isAdmin && editMode" 
                      @click="deleteVideo(index)" 
                      class="btn-delete-video"
                      title="영상 삭제"
                    >
                      🗑️
                    </button>
                    
                    <div class="video-embed">
                      <iframe
                        :src="getYouTubeEmbedUrl(video)"
                        frameborder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowfullscreen
                      ></iframe>
                    </div>
                  </div>
                </div>
                <p v-else class="empty-message">아직 업로드된 영상이 없습니다.</p>
              </div>

              <!-- 현장 사진 -->
              <div class="photos-section">
                <div class="section-header-with-action">
                  <h2 class="section-subtitle">📷 현장 사진</h2>
                  <button v-if="isAdmin && editMode" @click="openPhotoUpload" class="btn small primary">
                    + 사진 추가
                  </button>
                </div>
                
                <div v-if="worship.photos && worship.photos.length > 0" class="photo-grid">
                  <div
                    v-for="(photo, index) in worship.photos"
                    :key="index"
                    class="photo-item"
                    @click="!editMode && openLightbox(index)"
                  >
                    <!-- 관리자 전용 삭제 버튼 -->
                    <button 
                      v-if="isAdmin && editMode" 
                      @click.stop="deletePhoto(index)" 
                      class="btn-delete-photo"
                      title="사진 삭제"
                    >
                      ✕
                    </button>
                    <img :src="photo" :alt="`집회 사진 ${index + 1}`" />
                  </div>
                </div>
                <p v-else class="empty-message">아직 업로드된 사진이 없습니다.</p>
              </div>

              <!-- 영상/사진이 없을 때 -->
              <div v-if="(!worship.worshipVideos || worship.worshipVideos.length === 0) && (!worship.photos || worship.photos.length === 0)" class="empty-gallery">
                <p>집회 영상과 사진은 집회 후 업데이트 예정입니다.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="empty-container">
        <p class="empty-text">집회 정보를 찾을 수 없습니다.</p>
        <button class="btn primary" @click="goBack">
          목록으로 돌아가기
        </button>
      </div>

      <!-- 라이트박스 -->
      <div v-if="lightboxOpen" class="lightbox" @click="closeLightbox">
        <button class="lightbox-close" @click="closeLightbox">×</button>
        <button class="lightbox-prev" @click.stop="prevPhoto">‹</button>
        <button class="lightbox-next" @click.stop="nextPhoto">›</button>
        <img :src="currentPhoto" alt="집회 사진" @click.stop />
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import '../styles/WorshipDetail.css'

const router = useRouter()
const route = useRoute()
const { isAdmin } = useAuth()

const activeTab = ref('info')
const lightboxOpen = ref(false)
const currentPhotoIndex = ref(0)
const editMode = ref(false)

type WorshipLog = {
  id: number
  date: string
  year: number
  title: string
  preacher: string
  worship: string
  guest?: string
  description: string
  coments?: string
  entryTime?: string
  startTime?: string
  location?: string
  locationLink?: string
  parking?: string
  seating?: string
  promoVideo?: string
  prelistenVideo?: string
  openingSongs?: string[]
  celebrationSongs?: string[]
  worshipVideos?: string[]
  photos?: string[]
}

// 더미 데이터 (실제로는 API에서 가져옴)
const logs = ref<WorshipLog[]>([
  {
    id: 1,
    date: '2025-03-22',
    year: 2025,
    title: '하나됨',
    preacher: '민찬기 목사',
    worship: 'OBED Worship',
    description: '호흡있는 모든 자들은 찬양하라.',
    coments: '이번 집회에서는 성도들이 하나되어 주님을 찬양하는 시간을 가집니다.',
  },
  {
    id: 2,
    date: '2025-12-06 (금)',
    year: 2025,
    title: '샬롬',
    preacher: '박훈 목사',
    worship: 'OBED Worship',
    guest: '찬양사역자 오은',
    description: '너희는 마음에 근심하지도 말고 두려워하지도 말라',
    coments: '구입한 굿즈 티셔츠를 입고오세요. 끝까지 함께해주세요. 이벤트 추첨이 있습니다.',
    entryTime: '6시',
    startTime: '6시 30분',
    location: '예수인교회 본관(구건물) 지하 2층',
    locationLink: 'https://maps.app.goo.gl/tcfoy5SRcpqZ4gDx8',
    parking: '예수인교회 지하주차장 이용 가능합니다.',
    seating: '자리는 좌석입니다. 셀러브레이션 찬양 시간에는 앞에서 스탠딩으로 찬양하실 수 있습니다. 모든 자리는 선착순 입니다.',
    promoVideo: 'https://youtu.be/R1K8ufKaqqs?si=XYbutVsdZtyhNBtZ',
    prelistenVideo: 'https://youtu.be/rw5LASxwoj0?si=9LZv54Lgpxcb6u8k',
    openingSongs: [
      '영원히 너란다',
      '친구야',
      '주를 바라보며',
      '내 마음을 가득 채운',
      '나는 예배자입니다',
      '예배합니다'
    ],
    celebrationSongs: [
      '사랑한다 말하시네',
      '예수님 그의 희생 기억할 때',
      '주 안에서 기뻐해',
      '주 이름 찬양',
      '내 몸은 구주의 성전이니',
      '내 모든 삶의 행동 주 안에',
      '승리하였네'
    ],
    worshipVideos: [
      'https://youtu.be/802nlbwkFAc?si=0ok9Ysu8-GBa6j5j'
    ],
    // photos: ['photo1.jpg', 'photo2.jpg'], // 집회 후 추가
  },
])

const worshipId = computed(() => Number(route.params.id))
const worship = computed(() => logs.value.find(w => w.id === worshipId.value))

const currentPhoto = computed(() => {
  if (worship.value?.photos && worship.value.photos.length > 0) {
    return worship.value.photos[currentPhotoIndex.value]
  }
  return ''
})

const goBack = () => {
  router.push({ name: 'worship-log' })
}

const getYouTubeEmbedUrl = (url: string) => {
  let videoId = ''
  
  if (url.includes('youtu.be/')) {
    videoId = url.split('youtu.be/')[1].split('?')[0]
  } else if (url.includes('watch?v=')) {
    videoId = url.split('watch?v=')[1].split('&')[0]
  }
  
  return `https://www.youtube.com/embed/${videoId}`
}

const openLightbox = (index: number) => {
  currentPhotoIndex.value = index
  lightboxOpen.value = true
}

const closeLightbox = () => {
  lightboxOpen.value = false
}

const nextPhoto = () => {
  if (worship.value?.photos) {
    currentPhotoIndex.value = (currentPhotoIndex.value + 1) % worship.value.photos.length
  }
}

const prevPhoto = () => {
  if (worship.value?.photos) {
    currentPhotoIndex.value = (currentPhotoIndex.value - 1 + worship.value.photos.length) % worship.value.photos.length
  }
}

// 관리자 함수들
const toggleEditMode = () => {
  if (editMode.value) {
    // 저장 로직
    if (confirm('변경사항을 저장하시겠습니까?')) {
      // TODO: API 호출하여 저장
      console.log('저장:', worship.value)
      alert('저장 기능 구현 예정')
      editMode.value = false
    }
  } else {
    editMode.value = true
  }
}

const openAddVideoModal = () => {
  const videoUrl = prompt('YouTube 영상 URL을 입력하세요:')
  if (videoUrl) {
    // TODO: API 호출하여 영상 추가
    console.log('영상 추가:', videoUrl)
    alert(`영상 추가 기능 구현 예정\nURL: ${videoUrl}`)
  }
}

const deleteVideo = (index: number) => {
  if (confirm('이 영상을 삭제하시겠습니까?')) {
    // TODO: API 호출하여 영상 삭제
    console.log('영상 삭제:', index)
    alert(`영상 삭제 기능 구현 예정`)
  }
}

const openPhotoUpload = () => {
  // TODO: 파일 업로드 모달 열기
  console.log('사진 업로드 모달 열기')
  alert('사진 업로드 기능 구현 예정\n(파일 선택 모달이 열립니다)')
}

const deletePhoto = (index: number) => {
  if (confirm('이 사진을 삭제하시겠습니까?')) {
    // TODO: API 호출하여 사진 삭제
    console.log('사진 삭제:', index)
    alert(`사진 삭제 기능 구현 예정`)
  }
}
</script>