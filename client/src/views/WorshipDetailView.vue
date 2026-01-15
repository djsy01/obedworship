<template>
  <div class="page">
    <section class="section">
      <div class="detail-header">
        <button class="btn ghost back-btn" @click="goBack">← 목록으로</button>

        <!-- Toggle admin-only editing mode -->
        <button
          v-if="isAdmin"
          class="btn primary edit-mode-btn"
          @click="toggleEditMode"
        >
          {{ editMode ? "💾 저장하기" : "✏️ 편집 모드" }}
        </button>
      </div>

      <div v-if="worship" class="detail-container">
        <!-- Hero Section -->
        <div class="detail-hero">
          <p class="detail-date">{{ worship.date }}</p>
          <h1 class="detail-title">{{ worship.title }}</h1>

          <!-- Rally Information -->
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

          <!-- Introduction to the meeting -->
          <p class="hero-description">{{ worship.description }}</p>
        </div>

        <!-- Tab navigation -->
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
            <!-- Show sheet music tab only after rally date -->
            <button
              v-if="isWorshipDatePassed"
              class="tab-button"
              :class="{ active: activeTab === 'scores' }"
              @click="activeTab = 'scores'"
            >
              악보
            </button>
          </div>

          <!-- Guide tab contents -->
          <div v-show="activeTab === 'info'" class="tab-content">
            <div class="detail-content">
              <!-- Worship Information -->
              <div v-if="worship.coments" class="info-section">
                <h2 class="section-subtitle">🙏 예배 안내</h2>
                <p class="worship-info-text">{{ worship.coments }}</p>
              </div>
              <!-- Time information -->
              <div
                v-if="worship.entryTime || worship.startTime"
                class="time-section"
              >
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

              <!-- Promotional video -->
              <div v-if="worship.promoVideo" class="video-section">
                <h2 class="section-subtitle">🎶 홍보영상</h2>
                <div class="video-embed">
                  <iframe
                    :src="getYouTubeEmbedUrl(worship.promoVideo)"
                    frameborder="0"
                    allow="
                      accelerometer;
                      autoplay;
                      clipboard-write;
                      encrypted-media;
                      gyroscope;
                      picture-in-picture;
                    "
                    allowfullscreen
                  ></iframe>
                </div>
              </div>

              <!-- Location information -->
              <div v-if="worship.location" class="location-section">
                <h2 class="section-subtitle">⛪ 장소 안내</h2>
                <div class="location-info">
                  <p class="location-text">{{ worship.location }}</p>
                  <div v-if="worship.locationLink" class="map-embed">
                    <iframe
                      src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d1580.1564111497155!2d126.8361455337295!3d37.61832881652992!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x357c9a4552397f0b%3A0xc99a963ed07b51d8!2z7JeI7IiY7J246rWQ7ZqM!5e0!3m2!1sko!2sus!4v1746049290723!5m2!1sko!2sus"
                      frameborder="0"
                      allowfullscreen
                      loading="lazy"
                      referrerpolicy="no-referrer-when-downgrade"
                    ></iframe>
                  </div>
                </div>
              </div>

              <!-- Parking information -->
              <div v-if="worship.parking" class="parking-section">
                <h2 class="section-subtitle">🚙 주차 안내</h2>
                <p class="parking-text">{{ worship.parking }}</p>
              </div>

              <!-- Seating information -->
              <div v-if="worship.seating" class="seating-section">
                <h2 class="section-subtitle">🪑 자리 안내</h2>
                <p class="seating-text">{{ worship.seating }}</p>
              </div>

              <!-- Preview -->
              <div
                v-if="
                  worship.openingSongs ||
                  worship.celebrationSongs ||
                  worship.prelistenVideo
                "
                class="songs-section"
              >
                <h2 class="section-subtitle">🎵 미리듣기</h2>
                <p class="songs-intro">
                  함께 부르게 될 곡들의 배우기 음원 링크를 아래에
                  보내드립니다.<br />
                  예배 전 충분히 듣고 익혀 오신다면, 당일 예배가 더욱 깊고
                  풍성하게 채워질 것입니다.
                </p>

                <div v-if="worship.openingSongs" class="song-category">
                  <h3 class="song-category-title">Opening Song</h3>
                  <ol class="song-list">
                    <li
                      v-for="(song, index) in worship.openingSongs"
                      :key="index"
                    >
                      {{ song }}
                    </li>
                  </ol>
                </div>

                <div v-if="worship.celebrationSongs" class="song-category">
                  <h3 class="song-category-title">Celebration Song</h3>
                  <ol class="song-list">
                    <li
                      v-for="(song, index) in worship.celebrationSongs"
                      :key="index"
                    >
                      {{ song }}
                    </li>
                  </ol>
                </div>

                <div v-if="worship.prelistenVideo" class="video-embed">
                  <iframe
                    :src="getYouTubeEmbedUrl(worship.prelistenVideo)"
                    frameborder="0"
                    allow="
                      accelerometer;
                      autoplay;
                      clipboard-write;
                      encrypted-media;
                      gyroscope;
                      picture-in-picture;
                    "
                    allowfullscreen
                  ></iframe>
                </div>
              </div>
            </div>
          </div>

          <!-- Video/Photo tab contents -->
          <div v-show="activeTab === 'gallery'" class="tab-content">
            <div class="detail-content">
              <!-- Rally videos -->
              <div class="worship-video-section">
                <div class="section-header-with-action">
                  <h2 class="section-subtitle">🎬 집회 영상</h2>
                  <button
                    v-if="isAdmin && editMode"
                    @click="openAddVideoModal"
                    class="btn small primary"
                  >
                    + 영상 추가
                  </button>
                </div>

                <div
                  v-if="
                    worship.worshipVideos && worship.worshipVideos.length > 0
                  "
                >
                  <div
                    v-for="(video, index) in worship.worshipVideos"
                    :key="index"
                    class="video-wrapper-with-delete"
                    :style="{
                      marginBottom:
                        index < worship.worshipVideos.length - 1 ? '2rem' : '0',
                    }"
                  >
                    <!-- Administrator only delete button -->
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
                        allow="
                          accelerometer;
                          autoplay;
                          clipboard-write;
                          encrypted-media;
                          gyroscope;
                          picture-in-picture;
                        "
                        allowfullscreen
                      ></iframe>
                    </div>
                  </div>
                </div>
                <p v-else class="empty-message">
                  아직 업로드된 영상이 없습니다.
                </p>
              </div>

              <!-- On-site photos -->
              <div class="photos-section">
                <div class="section-header-with-action">
                  <h2 class="section-subtitle">📷 현장 사진</h2>
                  <button
                    v-if="isAdmin && editMode"
                    @click="openPhotoUpload"
                    class="btn small primary"
                  >
                    + 사진 추가
                  </button>
                </div>

                <div
                  v-if="worship.photos && worship.photos.length > 0"
                  class="photo-grid"
                >
                  <div
                    v-for="(photo, index) in worship.photos"
                    :key="index"
                    class="photo-item"
                    @click="!editMode && openLightbox(index)"
                  >
                    <!-- Administrator only delete button -->
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
                <p v-else class="empty-message">
                  아직 업로드된 사진이 없습니다.
                </p>
              </div>

              <!-- When there is no video/picture -->
              <div
                v-if="
                  (!worship.worshipVideos ||
                    worship.worshipVideos.length === 0) &&
                  (!worship.photos || worship.photos.length === 0)
                "
                class="empty-gallery"
              >
                <p>집회 영상과 사진은 집회 후 업데이트 예정입니다.</p>
              </div>
            </div>
          </div>

          <!-- Sheet music tab content (only visible after the meeting date) -->
          <div v-show="activeTab === 'scores'" class="tab-content">
            <div class="detail-content">
              <div class="scores-section">
                <div class="section-header-with-action">
                  <h2 class="section-subtitle">🎼 집회 악보</h2>
                  <button
                    v-if="isAdmin && editMode"
                    @click="openScoreUpload"
                    class="btn small primary"
                  >
                    악보 업로드
                  </button>
                </div>

                <p class="scores-intro">
                  이 집회의 <strong>송폼(세트리스트)</strong>과
                  <strong>전체 악보</strong>가 포함된 PDF 파일입니다.<br />
                  로그인 후 다운로드하여 사용하실 수 있습니다.
                </p>

                <span class="warning-song">
                  ⚠ 저작권 문제로 인해, 다음 곡들은 악보에 포함되어 있지
                  않습니다:
                  {{
                    worship.warning ? worship.warning.join(", ") : "해당 없음"
                  }}
                </span>

                <div v-if="worship.worshipScore" class="score-single-container">
                  <div class="score-single-card">
                    <!-- Administrator only delete button -->
                    <button
                      v-if="isAdmin && editMode"
                      @click="deleteWorshipScore"
                      class="btn-delete-score"
                      title="악보 삭제"
                    >
                      🗑️
                    </button>

                    <!-- PDF preview -->
                    <div
                      class="score-preview-large"
                      @click="previewScore(worship.worshipScore)"
                    >
                      <div
                        v-if="worship.worshipScore.thumbnailUrl"
                        class="score-thumbnail"
                      >
                        <img
                          :src="worship.worshipScore.thumbnailUrl"
                          :alt="worship.worshipScore.filename"
                        />
                      </div>
                      <div v-else class="score-placeholder-large">
                        <div class="pdf-icon-large">📋</div>
                        <p class="placeholder-title">송폼 + 악보</p>
                        <p class="placeholder-subtitle">PDF 미리보기</p>
                      </div>
                      <div class="preview-overlay">
                        <div class="preview-icon">🔍</div>
                        <p>클릭하여 크게 보기</p>
                      </div>
                    </div>

                    <!-- Score information -->
                    <div class="score-info-large">
                      <h3 class="score-title-main">
                        {{ worship.title }} 집회 악보
                      </h3>
                      <p class="score-description">
                        {{ worship.worshipScore.description }}
                      </p>
                      <div class="score-details">
                        <div class="score-detail-item">
                          <span class="detail-label">파일명:</span>
                          <span class="detail-value">{{
                            worship.worshipScore.filename
                          }}</span>
                        </div>
                        <div class="score-detail-item">
                          <span class="detail-label">업로드:</span>
                          <span class="detail-value">{{
                            formatDate(worship.worshipScore.uploadDate)
                          }}</span>
                        </div>
                      </div>
                    </div>

                    <!-- Download button -->
                    <div class="score-download-section">
                      <button
                        class="btn primary download-btn-large"
                        type="button"
                        @click="downloadWorshipScore"
                        :disabled="!isLoggedIn"
                      >
                        <span class="download-icon">📥</span>
                        {{
                          isLoggedIn
                            ? "송폼 + 악보 다운로드"
                            : "🔒 로그인이 필요합니다"
                        }}
                      </button>
                      <p class="download-note">
                        {{
                          isLoggedIn
                            ? "PDF 파일에 송폼과 모든 악보가 포함되어 있습니다."
                            : "로그인 후 다운로드할 수 있습니다."
                        }}
                      </p>
                    </div>
                  </div>
                </div>

                <div v-else class="score-empty-state">
                  <div class="empty-icon">📋</div>
                  <h3>아직 업로드된 악보가 없습니다</h3>
                  <p>집회 후 송폼과 악보가 업데이트 예정입니다.</p>
                  <button
                    v-if="isAdmin && editMode"
                    @click="openScoreUpload"
                    class="btn primary"
                  >
                    + 악보 업로드
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="empty-container">
        <p class="empty-text">집회 정보를 찾을 수 없습니다.</p>
        <button class="btn primary" @click="goBack">목록으로 돌아가기</button>
      </div>

      <!-- Lightbox -->
      <div v-if="lightboxOpen" class="lightbox" @click="closeLightbox">
        <button class="lightbox-close" @click="closeLightbox">×</button>
        <button class="lightbox-prev" @click.stop="prevPhoto">‹</button>
        <button class="lightbox-next" @click.stop="nextPhoto">›</button>
        <img :src="currentPhoto" alt="집회 사진" @click.stop />
      </div>

      <!-- PDF preview modal -->
      <div
        v-if="pdfPreviewOpen"
        class="pdf-preview-modal"
        @click="closePdfPreview"
      >
        <div class="pdf-preview-content" @click.stop>
          <button class="pdf-preview-close" @click="closePdfPreview">×</button>
          <iframe :src="currentPdfUrl" class="pdf-preview-iframe"></iframe>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useAuth } from "@/composables/useAuth";
import "../styles/WorshipDetail.css";

const router = useRouter();
const route = useRoute();
const { isAdmin, isLoggedIn } = useAuth();

const activeTab = ref("info");
const lightboxOpen = ref(false);
const currentPhotoIndex = ref(0);
const editMode = ref(false);
const pdfPreviewOpen = ref(false);
const currentPdfUrl = ref("");

type WorshipScore = {
  id: number;
  filename: string;
  fileUrl: string;
  uploadDate: string;
  thumbnailUrl?: string;
  description?: string;
};

type WorshipLog = {
  id: number;
  date: string;
  year: number;
  title: string;
  preacher: string;
  worship: string;
  guest?: string;
  description: string;
  coments?: string;
  entryTime?: string;
  startTime?: string;
  location?: string;
  locationLink?: string;
  parking?: string;
  seating?: string;
  promoVideo?: string;
  prelistenVideo?: string;
  openingSongs?: string[];
  celebrationSongs?: string[];
  worshipVideos?: string[];
  photos?: string[];
  warning?: string[];
  worshipScore?: WorshipScore;
};

// Dummy data (actually taken from API)
const logs = ref<WorshipLog[]>([
  {
    id: 1,
    date: "2025-03-22 (Sat)",
    year: 2025,
    title: "하나됨",
    preacher: "민찬기 목사",
    worship: "OBED Worship",
    description: "호흡있는 모든 자들은 찬양하라.",
    coments:
      "하나님께서 함께 하시고 주관하시는 집회입니다. 온 마음과 정성을 다해 예배에 임해주시기 바랍니다.",
    entryTime: "18시 30분",
    startTime: "19시 00분",
    location: "예수인교회 본관(구건물) 지하 2층",
    locationLink: "https://maps.app.goo.gl/tcfoy5SRcpqZ4gDx8",
    parking: "예수인교회 지하주차장 이용 가능합니다.",
    seating:
      "자리는 좌석입니다. 셀러브레이션 찬양 시간에는 앞에서 스탠딩으로 찬양하실 수 있습니다. 모든 자리는 선착순 입니다.",
    openingSongs: [
      "축복송",
      "Build up",
      "나로부터 시작되리",
      "부르신 곳에서",
      "기대",
      "그의 안에서",
    ],
    celebrationSongs: [
      "우린 물러서지 않으리",
      "우리의 눈을 열어",
      "Turn it up",
      "내 안에 부어주소서",
      "I will run to you",
      "주님의 임재 앞에서",
      "생명 주께 있네",
      "오직 예수",
      "Praise",
    ],
    warning: ["오직 예수 - 어노인팅 예배캠프2024"],
    worshipScore: {
      id: 1,
      filename: "하나됨_집회_송폼_악보.pdf",
      fileUrl: "/pdf/oneness.pdf",
      uploadDate: "2025-01-11T10:00:00Z",
      thumbnailUrl: "/thumbnails/worship-1-thumb.jpg",
      description: "송폼 + 오프닝 & 셀러브레이션 전체 악보 포함",
    },
  },
  {
    id: 2,
    date: "2025-12-06 (Sat)",
    year: 2025,
    title: "샬롬",
    preacher: "박훈 목사",
    worship: "OBED Worship",
    guest: "찬양사역자 오은",
    description: "너희는 마음에 근심하지도 말고 두려워하지도 말라",
    coments:
      "구입한 굿즈 티셔츠를 입고오세요. 끝까지 함께해주세요. 이벤트 추첨이 있습니다.",
    entryTime: "18시 00분",
    startTime: "18시 30분",
    location: "예수인교회 본관(구건물) 지하 2층",
    locationLink: "https://maps.app.goo.gl/tcfoy5SRcpqZ4gDx8",
    parking: "예수인교회 지하주차장 이용 가능합니다.",
    seating:
      "자리는 좌석입니다. 셀러브레이션 찬양 시간에는 앞에서 스탠딩으로 찬양하실 수 있습니다. 모든 자리는 선착순 입니다.",
    promoVideo: "https://youtu.be/R1K8ufKaqqs?si=XYbutVsdZtyhNBtZ",
    prelistenVideo: "https://youtu.be/rw5LASxwoj0?si=9LZv54Lgpxcb6u8k",
    openingSongs: [
      "영원히 너란다",
      "친구야",
      "주를 바라보며",
      "내 마음을 가득 채운",
      "나는 예배자입니다",
      "예배합니다",
    ],
    celebrationSongs: [
      "사랑한다 말하시네",
      "예수님 그의 희생 기억할 때",
      "주 안에서 기뻐해",
      "주 이름 찬양",
      "내 몸은 구주의 성전이니",
      "내 모든 삶의 행동 주 안에",
      "승리하였네",
    ],
    worshipVideos: ["https://youtu.be/802nlbwkFAc?si=0ok9Ysu8-GBa6j5j"],
    warning: ["주 이름 찬양 - 어노인팅 예배캠프2024"],
  },
]);

const worshipId = computed(() => Number(route.params.id));
const worship = computed(() =>
  logs.value.find((w) => w.id === worshipId.value)
);

// Check if the rally date has passed (improved version)
const isWorshipDatePassed = computed(() => {
  if (!worship.value) return false;

  // Extract only the date part from "2025-03-22 (Sat)" format
  const dateMatch = worship.value.date.match(/^\d{4}-\d{2}-\d{2}/);
  if (!dateMatch) {
    console.warn("날짜 형식이 올바르지 않습니다:", worship.value.date);
    return false;
  }

  const worshipDate = new Date(dateMatch[0]);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  worshipDate.setHours(0, 0, 0, 0);

  // Console log for debugging
  console.log("집회 날짜:", dateMatch[0]);
  console.log("오늘 날짜:", today.toISOString().split("T")[0]);
  console.log("악보 탭 표시 여부:", worshipDate <= today);

  return worshipDate <= today;
});

const currentPhoto = computed(() => {
  if (worship.value?.photos && worship.value.photos.length > 0) {
    return worship.value.photos[currentPhotoIndex.value];
  }
  return "";
});

const goBack = () => {
  router.push({ name: "worship-log" });
};

const getYouTubeEmbedUrl = (url: string) => {
  let videoId = "";

  if (url.includes("youtu.be/")) {
    videoId = url.split("youtu.be/")[1].split("?")[0];
  } else if (url.includes("watch?v=")) {
    videoId = url.split("watch?v=")[1].split("&")[0];
  }

  return `https://www.youtube.com/embed/${videoId}`;
};

// utility functions
const getFilenameWithoutExtension = (filename: string) => {
  return filename.replace(/\.[^/.]+$/, "");
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

// Lightbox related
const openLightbox = (index: number) => {
  currentPhotoIndex.value = index;
  lightboxOpen.value = true;
};

const closeLightbox = () => {
  lightboxOpen.value = false;
};

const nextPhoto = () => {
  if (worship.value?.photos) {
    currentPhotoIndex.value =
      (currentPhotoIndex.value + 1) % worship.value.photos.length;
  }
};

const prevPhoto = () => {
  if (worship.value?.photos) {
    currentPhotoIndex.value =
      (currentPhotoIndex.value - 1 + worship.value.photos.length) %
      worship.value.photos.length;
  }
};

// PDF preview related
const previewScore = (score: WorshipScore) => {
  currentPdfUrl.value = score.fileUrl;
  pdfPreviewOpen.value = true;
};

const closePdfPreview = () => {
  pdfPreviewOpen.value = false;
  currentPdfUrl.value = "";
};

// manager functions
const toggleEditMode = () => {
  if (editMode.value) {
    // save logic
    if (confirm("변경사항을 저장하시겠습니까?")) {
      // TODO: Call API and save
      console.log("저장:", worship.value);
      alert("저장 기능 구현 예정");
      editMode.value = false;
    }
  } else {
    editMode.value = true;
  }
};

const openAddVideoModal = () => {
  const videoUrl = prompt("YouTube 영상 URL을 입력하세요:");
  if (videoUrl) {
    // TODO: Add video by calling API
    console.log("영상 추가:", videoUrl);
    alert(`영상 추가 기능 구현 예정\nURL: ${videoUrl}`);
  }
};

const deleteVideo = (index: number) => {
  if (confirm("이 영상을 삭제하시겠습니까?")) {
    // TODO: Call API to delete video
    console.log("영상 삭제:", index);
    alert(`영상 삭제 기능 구현 예정`);
  }
};

const openPhotoUpload = () => {
  // TODO: Open file upload modal
  console.log("사진 업로드 모달 열기");
  alert("사진 업로드 기능 구현 예정\n(파일 선택 모달이 열립니다)");
};

const deletePhoto = (index: number) => {
  if (confirm("이 사진을 삭제하시겠습니까?")) {
    // TODO: Call API to delete photo
    console.log("사진 삭제:", index);
    alert(`사진 삭제 기능 구현 예정`);
  }
};

// Sheet music related functions
const downloadWorshipScore = () => {
  if (!isLoggedIn.value) {
    alert("로그인이 필요합니다.");
    return;
  }

  if (!worship.value?.worshipScore) {
    alert("다운로드할 악보가 없습니다.");
    return;
  }

  // TODO: Implement actual file download
  console.log("악보 다운로드:", worship.value.worshipScore);
  alert(
    `악보 다운로드 기능 구현 예정\n파일: ${worship.value.worshipScore.filename}`
  );

  // In actual implementation:
  // const link = document.createElement('a')
  // link.href = worship.value.worshipScore.fileUrl
  // link.download = worship.value.worshipScore.filename
  // link.click()
};

const openScoreUpload = () => {
  // TODO: Open file upload modal
  console.log("악보 업로드 모달 열기");
  alert(
    "악보 업로드 기능 구현 예정\n송폼과 전체 악보가 포함된 PDF 파일을 선택해주세요."
  );
};

const deleteWorshipScore = () => {
  if (confirm("집회 악보를 삭제하시겠습니까?")) {
    // TODO: Call API to delete sheet music
    console.log("집회 악보 삭제");
    alert("집회 악보 삭제 기능 구현 예정");
  }
};
</script>
