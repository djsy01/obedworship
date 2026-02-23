<script setup lang="ts">
import { computed, ref, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useAuth } from "@/composables/useAuth";
import { worshipApi, type Worship } from "@/api/worship";
import { worshipScoreApi, type WorshipScore } from "@/api/worship-scores";
import { worshipVideoApi, type WorshipVideo } from "@/api/worship-videos";
import { worshipPhotoApi, type WorshipPhoto } from "@/api/worship-photos";
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
const loading = ref(false);
const uploading = ref(false);

// sheet music upload modal
const scoreUploadModalOpen = ref(false);
const selectedScoreFile = ref<File | null>(null);
const scoreDescription = ref("");
const scoreFileInput = ref<HTMLInputElement | null>(null);

// Poster/thumbnail upload modal
const thumbnailUploadModalOpen = ref(false);
const selectedThumbnailFile = ref<File | null>(null);
const thumbnailPreviewUrl = ref("");
const thumbnailFileInput = ref<HTMLInputElement | null>(null);

// rally poster upload modal
const posterUploadModalOpen = ref(false);
const selectedPosterFile = ref<File | null>(null);
const posterPreviewUrl = ref("");
const posterFileInput = ref<HTMLInputElement | null>(null);

// full screen poster
const posterFullscreenOpen = ref(false);
const scorePosterFullscreenOpen = ref(false);
const scorePosterUrl = ref("");

// API data
const worship = ref<Worship | null>(null);
const scores = ref<WorshipScore[]>([]);
const videos = ref<WorshipVideo[]>([]);
const photos = ref<WorshipPhoto[]>([]);

//Edit form data
const editForm = ref({
  title: "",
  preacher: "",
  worship_team: "",
  guest: "",
  description: "",
  poster_url: "",
  comments: "",
  entry_time: "",
  start_time: "",
  location: "",
  location_link: "",
  parking: "",
  seating: "",
  promo_video: "",
  prelisten_video: "",
  opening_songs_text: "",
  celebration_songs_text: "",
  excluded_songs_text: "",
});

// For file upload
const scoreFile = ref<File | null>(null);
const videoUrl = ref("");
const photoFile = ref<File | null>(null);

const worshipId = computed(() => Number(route.params.id));

// Assembly query
const fetchWorship = async () => {
  loading.value = true;
  try {
    const response = await worshipApi.getOne(worshipId.value);
    worship.value = response.data;

    // Fill data into edit form
    editForm.value = {
      title: response.data.title || "",
      preacher: response.data.preacher || "",
      worship_team: response.data.worship_team || "",
      guest: response.data.guest || "",
      description: response.data.description || "",
      poster_url: response.data.poster_url || "",
      comments: response.data.comments || "",
      entry_time: response.data.entry_time || "",
      start_time: response.data.start_time || "",
      location: response.data.location || "",
      location_link: response.data.location_link || "",
      parking: response.data.parking || "",
      seating: response.data.seating || "",
      promo_video: response.data.promo_video || "",
      prelisten_video: response.data.prelisten_video || "",
      opening_songs_text: response.data.opening_songs?.join("\n") || "",
      celebration_songs_text: response.data.celebration_songs?.join("\n") || "",
      excluded_songs_text: response.data.excluded_songs?.join("\n") || "",
    };

    // Search sheet music, video, and photos
    const scoresResponse = await worshipScoreApi.getByWorshipId(
      worshipId.value,
    );
    scores.value = scoresResponse.data;

    const videosResponse = await worshipVideoApi.getByWorshipId(
      worshipId.value,
    );
    videos.value = videosResponse.data;

    const photosResponse = await worshipPhotoApi.getByWorshipId(
      worshipId.value,
    );
    photos.value = photosResponse.data;
  } catch (error) {
    console.error("집회 조회 실패:", error);
  } finally {
    loading.value = false;
  }
};

const toggleEditMode = async () => {
  if (editMode.value) {
    // Save mode: Exit edit mode after saving
    await saveWorship();
  } else {
    // Enter edit mode
    editMode.value = true;
  }
};

const saveWorship = async () => {
  loading.value = true;
  try {
    // Convert text to array
    const opening_songs = editForm.value.opening_songs_text
      .split("\n")
      .map((s) => s.trim())
      .filter((s) => s);
    const celebration_songs = editForm.value.celebration_songs_text
      .split("\n")
      .map((s) => s.trim())
      .filter((s) => s);
    const excluded_songs = editForm.value.excluded_songs_text
      .split("\n")
      .map((s) => s.trim())
      .filter((s) => s);

    await worshipApi.update(worshipId.value, {
      title: editForm.value.title,
      preacher: editForm.value.preacher,
      worship_team: editForm.value.worship_team,
      guest: editForm.value.guest,
      description: editForm.value.description,
      poster_url: editForm.value.poster_url,
      comments: editForm.value.comments,
      entry_time: editForm.value.entry_time,
      start_time: editForm.value.start_time,
      location: editForm.value.location,
      location_link: editForm.value.location_link,
      parking: editForm.value.parking,
      seating: editForm.value.seating,
      promo_video: editForm.value.promo_video,
      prelisten_video: editForm.value.prelisten_video,
      opening_songs,
      celebration_songs,
      excluded_songs,
    });
    alert("집회 정보가 저장되었습니다!");
    editMode.value = false;
    await fetchWorship();
  } catch (error) {
    console.error("저장 실패:", error);
    alert("저장에 실패했습니다");
  } finally {
    loading.value = false;
  }
};

// initial load
onMounted(() => {
  fetchWorship();
});

// Utility functions
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

// Lightbox related
const currentPhoto = computed(() => {
  if (photos.value && photos.value.length > 0) {
    return photos.value[currentPhotoIndex.value]?.photo_url || "";
  }
  return "";
});

const openLightbox = (index: number) => {
  currentPhotoIndex.value = index;
  lightboxOpen.value = true;
};

const closeLightbox = () => {
  lightboxOpen.value = false;
};

const nextPhoto = () => {
  if (photos.value) {
    currentPhotoIndex.value =
      (currentPhotoIndex.value + 1) % photos.value.length;
  }
};

const prevPhoto = () => {
  if (photos.value) {
    currentPhotoIndex.value =
      (currentPhotoIndex.value - 1 + photos.value.length) % photos.value.length;
  }
};

// PDF preview related
const previewScore = (score: WorshipScore) => {
  currentPdfUrl.value = score.file_url;
  pdfPreviewOpen.value = true;
};

const closePdfPreview = () => {
  pdfPreviewOpen.value = false;
  currentPdfUrl.value = "";
};

// ==================== Sheet music management ====================
// add sheet music
const handleAddScore = async () => {
  if (!scoreFile.value) {
    alert("파일을 선택해주세요");
    return;
  }

  loading.value = true;
  try {
    // Actually, you need to receive the URL after uploading the file.
    // Temporary file name is used here
    await worshipScoreApi.create({
      worship_id: worshipId.value,
      filename: scoreFile.value.name,
      file_url: `/uploads/scores/${scoreFile.value.name}`,
      description: "",
    });
    alert("악보가 추가되었습니다!");
    scoreFile.value = null;
    await fetchWorship();
  } catch (error) {
    console.error("악보 추가 실패:", error);
    alert("악보 추가에 실패했습니다");
  } finally {
    loading.value = false;
  }
};

// Delete sheet music
const deleteScore = async (scoreId: number) => {
  if (!confirm("이 악보를 삭제하시겠습니까?")) return;

  loading.value = true;
  try {
    await worshipScoreApi.delete(scoreId);
    alert("악보가 삭제되었습니다!");
    await fetchWorship();
  } catch (error) {
    console.error("악보 삭제 실패:", error);
    alert("악보 삭제에 실패했습니다");
  } finally {
    loading.value = false;
  }
};

// ==================== Video Management ====================
// add video
const handleAddVideo = async () => {
  if (!videoUrl.value) {
    alert("영상 URL을 입력해주세요");
    return;
  }

  loading.value = true;
  try {
    await worshipVideoApi.create({
      worship_id: worshipId.value,
      video_url: videoUrl.value,
      video_order: videos.value.length + 1,
    });
    alert("영상이 추가되었습니다!");
    videoUrl.value = "";
    await fetchWorship();
  } catch (error) {
    console.error("영상 추가 실패:", error);
    alert("영상 추가에 실패했습니다");
  } finally {
    loading.value = false;
  }
};

// Delete video
const deleteVideo = async (videoId: number) => {
  if (!confirm("이 영상을 삭제하시겠습니까?")) return;

  loading.value = true;
  try {
    await worshipVideoApi.delete(videoId);
    alert("영상이 삭제되었습니다!");
    await fetchWorship();
  } catch (error) {
    console.error("영상 삭제 실패:", error);
    alert("영상 삭제에 실패했습니다");
  } finally {
    loading.value = false;
  }
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

// ==================== Photo Management ====================
// add photo
const handleAddPhoto = async () => {
  if (!photoFile.value) {
    alert("파일을 선택해주세요");
    return;
  }

  loading.value = true;
  try {
    // Actually, you need to receive the URL after uploading the file.
    await worshipPhotoApi.create({
      worship_id: worshipId.value,
      photo_url: `/uploads/photos/${photoFile.value.name}`,
      file_name: photoFile.value.name,
      photo_order: photos.value.length + 1,
    });
    alert("사진이 추가되었습니다!");
    photoFile.value = null;
    await fetchWorship();
  } catch (error) {
    console.error("사진 추가 실패:", error);
    alert("사진 추가에 실패했습니다");
  } finally {
    loading.value = false;
  }
};

// delete photo
const deletePhoto = async (photoId: number) => {
  if (!confirm("이 사진을 삭제하시겠습니까?")) return;

  loading.value = true;
  try {
    await worshipPhotoApi.delete(photoId);
    alert("사진이 삭제되었습니다!");
    await fetchWorship();
  } catch (error) {
    console.error("사진 삭제 실패:", error);
    alert("사진 삭제에 실패했습니다");
  } finally {
    loading.value = false;
  }
};

// Open photo upload modal
const openPhotoUpload = () => {
  // TODO: Open file upload modal
  console.log("사진 업로드 모달 열기");
  alert("사진 업로드 기능 구현 예정\n(파일 선택 모달이 열립니다)");
};

// Check if the meeting date has passed
const isWorshipDatePassed = computed(() => {
  if (!worship.value?.date) return false;
  const worshipDate = new Date(worship.value.date);
  const today = new Date();
  return worshipDate < today;
});

// Check if there is video/photo content
const hasGalleryContent = computed(() => {
  return (
    (videos.value && videos.value.length > 0) ||
    (photos.value && photos.value.length > 0)
  );
});

// Check if there is sheet music content
const hasScoreContent = computed(() => {
  return scores.value && scores.value.length > 0;
});

// Open add video modal
const openAddVideoModal = () => {
  const url = prompt("YouTube 영상 URL을 입력해주세요:");
  if (url) {
    videoUrl.value = url;
    handleAddVideo();
  }
};

//Open sheet music upload modal
const openScoreUpload = () => {
  scoreUploadModalOpen.value = true;
  selectedScoreFile.value = null;
  scoreDescription.value = "";
};

// Close sheet music upload modal
const closeScoreUploadModal = () => {
  scoreUploadModalOpen.value = false;
  selectedScoreFile.value = null;
  scoreDescription.value = "";
  if (scoreFileInput.value) {
    scoreFileInput.value.value = "";
  }
};

// Sheet music file selection handler
const handleScoreFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];

  if (!file) return;

  // Check PDF file
  if (file.type !== "application/pdf") {
    alert("PDF 파일만 업로드할 수 있습니다.");
    target.value = "";
    return;
  }

  // Check file size (10MB)
  if (file.size > 10 * 1024 * 1024) {
    alert("파일 크기는 10MB를 초과할 수 없습니다.");
    target.value = "";
    return;
  }

  selectedScoreFile.value = file;
};

// file size format
const formatFileSize = (bytes: number) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

// Upload sheet music
const uploadScore = async () => {
  if (!selectedScoreFile.value) {
    alert("파일을 선택해주세요.");
    return;
  }

  uploading.value = true;
  try {
    // 1. Upload file
    const uploadResponse = await worshipScoreApi.uploadFile(
      selectedScoreFile.value,
    );
    const { url, filename } = uploadResponse.data;

    // 2. Create worship_score record
    await worshipScoreApi.create({
      worship_id: worshipId.value,
      filename: filename,
      file_url: url,
      description: scoreDescription.value || undefined,
    });

    alert("악보가 업로드되었습니다!");
    closeScoreUploadModal();
    await fetchWorship();
  } catch (error) {
    console.error("악보 업로드 실패:", error);
    alert("악보 업로드에 실패했습니다.");
  } finally {
    uploading.value = false;
  }
};

// Delete rally sheet music
const deleteWorshipScore = async () => {
  if (!scores.value || scores.value.length === 0) return;
  if (!confirm("이 악보를 삭제하시겠습니까?")) return;

  loading.value = true;
  try {
    await worshipScoreApi.delete(scores.value[0].id);
    alert("악보가 삭제되었습니다!");
    await fetchWorship();
  } catch (error) {
    console.error("악보 삭제 실패:", error);
    alert("악보 삭제에 실패했습니다");
  } finally {
    loading.value = false;
  }
};

// Download sheet music
const downloadWorshipScore = () => {
  if (!isLoggedIn.value) {
    alert("로그인이 필요합니다.");
    return;
  }

  if (!scores.value || scores.value.length === 0) {
    alert("다운로드할 악보가 없습니다.");
    return;
  }

  const score = scores.value[0];
  // Download actual file
  const link = document.createElement("a");
  link.href = score.file_url;
  link.download = score.filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const goBack = () => {
  router.push({ name: "worship-log" });
};

// ==================== Poster Management ====================
// Open poster upload modal
const openPosterUpload = () => {
  posterUploadModalOpen.value = true;
  selectedPosterFile.value = null;
  posterPreviewUrl.value = "";
};

// Close poster upload modal
const closePosterUploadModal = () => {
  posterUploadModalOpen.value = false;
  selectedPosterFile.value = null;
  posterPreviewUrl.value = "";
  if (posterFileInput.value) {
    posterFileInput.value.value = "";
  }
};

// Poster file selection handler
const handlePosterFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];

  if (!file) return;

  // Check image file
  if (!file.type.startsWith("image/")) {
    alert("이미지 파일만 업로드할 수 있습니다.");
    target.value = "";
    return;
  }

  // Check file size (5MB)
  if (file.size > 5 * 1024 * 1024) {
    alert("파일 크기는 5MB를 초과할 수 없습니다.");
    target.value = "";
    return;
  }

  selectedPosterFile.value = file;

  // create preview
  const reader = new FileReader();
  reader.onload = (e) => {
    posterPreviewUrl.value = e.target?.result as string;
  };
  reader.readAsDataURL(file);
};

// Upload poster
const uploadPoster = async () => {
  if (!selectedPosterFile.value) {
    alert("파일을 선택해주세요.");
    return;
  }

  uploading.value = true;
  try {
    // 1. Upload file (using worshipPhotoApi)
    const uploadResponse = await worshipPhotoApi.uploadFile(
      selectedPosterFile.value,
    );
    const { url } = uploadResponse.data;

    // 2. Update worship record
    await worshipApi.update(worshipId.value, {
      poster_url: url,
    });

    alert("포스터가 업로드되었습니다!");
    closePosterUploadModal();
    await fetchWorship();
  } catch (error) {
    console.error("포스터 업로드 실패:", error);
    alert("포스터 업로드에 실패했습니다.");
  } finally {
    uploading.value = false;
  }
};

// delete poster
const removePoster = async () => {
  if (!confirm("포스터를 삭제하시겠습니까?")) return;

  loading.value = true;
  try {
    await worshipApi.update(worshipId.value, {
      poster_url: "",
    });
    alert("포스터가 삭제되었습니다!");
    await fetchWorship();
  } catch (error) {
    console.error("포스터 삭제 실패:", error);
    alert("포스터 삭제에 실패했습니다");
  } finally {
    loading.value = false;
  }
};

// Open poster full screen
const openPosterFullscreen = () => {
  posterFullscreenOpen.value = true;
};

// Close poster full screen
const closePosterFullscreen = () => {
  posterFullscreenOpen.value = false;
};

// Sheet music preview click handler (logged in users only)
const handleScorePreviewClick = (score: WorshipScore) => {
  console.log("handleScorePreviewClick called", score);
  if (!isLoggedIn.value) {
    alert("악보 미리보기는 로그인 후 이용 가능합니다.");
    return;
  }
  console.log("Opening PDF preview for:", score.file_url);
  previewScore(score);
};

// Open sheet music poster full screen
const openScorePosterFullscreen = (url: string) => {
  scorePosterUrl.value = url;
  scorePosterFullscreenOpen.value = true;
};

// Close sheet music poster full screen
const closeScorePosterFullscreen = () => {
  scorePosterFullscreenOpen.value = false;
  scorePosterUrl.value = "";
};

// ==================== Thumbnail Management ====================
//Open thumbnail upload modal
const openThumbnailUpload = () => {
  thumbnailUploadModalOpen.value = true;
  selectedThumbnailFile.value = null;
  thumbnailPreviewUrl.value = "";
};

// Close thumbnail upload modal
const closeThumbnailUploadModal = () => {
  thumbnailUploadModalOpen.value = false;
  selectedThumbnailFile.value = null;
  thumbnailPreviewUrl.value = "";
  if (thumbnailFileInput.value) {
    thumbnailFileInput.value.value = "";
  }
};

// Thumbnail file selection handler
const handleThumbnailFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];

  if (!file) return;

  // Check image file
  if (!file.type.startsWith("image/")) {
    alert("이미지 파일만 업로드할 수 있습니다.");
    target.value = "";
    return;
  }

  // Check file size (5MB)
  if (file.size > 5 * 1024 * 1024) {
    alert("파일 크기는 5MB를 초과할 수 없습니다.");
    target.value = "";
    return;
  }

  selectedThumbnailFile.value = file;

  // create preview
  const reader = new FileReader();
  reader.onload = (e) => {
    thumbnailPreviewUrl.value = e.target?.result as string;
  };
  reader.readAsDataURL(file);
};

// Upload thumbnail
const uploadThumbnail = async () => {
  if (!selectedThumbnailFile.value) {
    alert("파일을 선택해주세요.");
    return;
  }

  if (!scores.value || scores.value.length === 0) {
    alert("악보가 없습니다. 먼저 악보를 업로드해주세요.");
    return;
  }

  uploading.value = true;
  try {
    // 1. Upload file
    const uploadResponse = await worshipPhotoApi.uploadFile(
      selectedThumbnailFile.value,
    );
    const { url } = uploadResponse.data;

    // 2. Update worship_score record
    await worshipScoreApi.update(scores.value[0].id, {
      thumbnail_url: url,
    });

    alert("포스터가 업로드되었습니다!");
    closeThumbnailUploadModal();
    await fetchWorship();
  } catch (error) {
    console.error("포스터 업로드 실패:", error);
    alert("포스터 업로드에 실패했습니다.");
  } finally {
    uploading.value = false;
  }
};
</script>

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
          <p class="detail-date">
            {{ new Date(worship.date).toLocaleDateString("ko-KR") }}
          </p>
          <h1 class="detail-title">
            <span v-if="editMode">
              <input v-model="editForm.title" type="text" />
            </span>
            <span v-else>{{ worship.title }}</span>
          </h1>

          <!-- Rally Information -->
          <div class="hero-info">
            <div class="hero-info-item">
              <span class="hero-info-label">설교자</span>
              <span v-if="editMode" class="hero-info-value">
                <input v-model="editForm.preacher" type="text" />
              </span>
              <span v-else class="hero-info-value">{{ worship.preacher }}</span>
            </div>
            <div class="hero-info-item">
              <span class="hero-info-label">찬양팀</span>
              <span v-if="editMode" class="hero-info-value">
                <input v-model="editForm.worship_team" type="text" />
              </span>
              <span v-else class="hero-info-value">{{
                worship.worship_team
              }}</span>
            </div>
            <div v-if="worship.guest || editMode" class="hero-info-item">
              <span class="hero-info-label">초청 간사</span>
              <span v-if="editMode" class="hero-info-value">
                <input v-model="editForm.guest" type="text" />
              </span>
              <span v-else class="hero-info-value">{{ worship.guest }}</span>
            </div>
          </div>

          <!-- Introduction to the meeting -->
          <p v-if="editMode" class="hero-description">
            <textarea v-model="editForm.description" rows="3"></textarea>
          </p>
          <p v-else class="hero-description">{{ worship.description }}</p>
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
            <!-- Video/Photo tab: Always visible for administrators, only when content is out of date for regular users -->
            <button
              v-if="isAdmin || (isWorshipDatePassed && hasGalleryContent)"
              class="tab-button"
              :class="{ active: activeTab === 'gallery' }"
              @click="activeTab = 'gallery'"
            >
              영상/사진
            </button>
            <!-- Sheet music tab: Always visible for administrators, general users only when there is sheet music after the date -->
            <button
              v-if="isAdmin || (isWorshipDatePassed && hasScoreContent)"
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
              <!-- Poster Section -->
              <div v-if="worship.poster_url || editMode" class="poster-section">
                <h2 class="section-subtitle">🖼️ 집회 포스터</h2>
                <div v-if="editMode" class="poster-edit-actions">
                  <button class="btn small primary" @click="openPosterUpload">
                    {{ worship.poster_url ? "포스터 변경" : "포스터 업로드" }}
                  </button>
                  <button
                    v-if="worship.poster_url"
                    class="btn small ghost"
                    @click="removePoster"
                  >
                    포스터 삭제
                  </button>
                </div>
                <div
                  v-if="worship.poster_url && !editMode"
                  class="poster-image clickable-poster"
                  @click="openPosterFullscreen"
                >
                  <img
                    :src="worship.poster_url"
                    :alt="`${worship.title} 포스터`"
                  />
                  <div class="poster-overlay">
                    <div class="poster-overlay-icon">🔍</div>
                    <p>클릭하여 크게 보기</p>
                  </div>
                </div>
                <div
                  v-else-if="worship.poster_url && editMode"
                  class="poster-preview"
                >
                  <img
                    :src="worship.poster_url"
                    :alt="`${worship.title} 포스터`"
                  />
                </div>
              </div>

              <!-- Worship Information -->
              <div v-if="worship.comments || editMode" class="info-section">
                <h2 class="section-subtitle">🙏 예배 안내</h2>
                <textarea
                  v-if="editMode"
                  v-model="editForm.comments"
                  class="edit-textarea"
                  rows="3"
                  placeholder="예배 안내 내용을 입력하세요"
                ></textarea>
                <p v-else class="worship-info-text">{{ worship.comments }}</p>
              </div>

              <!-- Time information -->
              <div
                v-if="worship.entry_time || worship.start_time || editMode"
                class="time-section"
              >
                <h2 class="section-subtitle">⏰ 시간 안내</h2>
                <div class="time-info">
                  <div class="time-item">
                    <span class="time-label">예배당 입장 시간</span>
                    <input
                      v-if="editMode"
                      v-model="editForm.entry_time"
                      type="text"
                      class="edit-input"
                      placeholder="예: 18시 30분"
                    />
                    <span v-else class="time-value">{{
                      worship.entry_time
                    }}</span>
                  </div>
                  <div class="time-item">
                    <span class="time-label">예배 시작</span>
                    <input
                      v-if="editMode"
                      v-model="editForm.start_time"
                      type="text"
                      class="edit-input"
                      placeholder="예: 19시 00분"
                    />
                    <span v-else class="time-value">{{
                      worship.start_time
                    }}</span>
                  </div>
                </div>
              </div>

              <!-- Promotional video -->
              <div v-if="worship.promo_video || editMode" class="video-section">
                <h2 class="section-subtitle">🎶 홍보영상</h2>
                <div v-if="editMode" class="edit-field">
                  <input
                    v-model="editForm.promo_video"
                    type="text"
                    class="edit-input"
                    placeholder="YouTube 영상 URL을 입력하세요"
                  />
                </div>
                <div v-if="worship.promo_video" class="video-embed">
                  <iframe
                    :src="getYouTubeEmbedUrl(worship.promo_video)"
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
              <div v-if="worship.location || editMode" class="location-section">
                <h2 class="section-subtitle">⛪ 장소 안내</h2>
                <div class="location-info">
                  <input
                    v-if="editMode"
                    v-model="editForm.location"
                    type="text"
                    class="edit-input"
                    placeholder="장소를 입력하세요"
                  />
                  <p v-else class="location-text">{{ worship.location }}</p>
                  <div
                    v-if="editMode"
                    class="edit-field"
                    style="margin-top: 0.5rem"
                  >
                    <input
                      v-model="editForm.location_link"
                      type="text"
                      class="edit-input"
                      placeholder="지도 링크 (Google Maps embed URL)"
                    />
                  </div>
                  <div
                    v-if="worship.location_link && !editMode"
                    class="map-embed"
                  >
                    <iframe
                      :src="worship.location_link"
                      frameborder="0"
                      allowfullscreen
                      loading="lazy"
                      referrerpolicy="no-referrer-when-downgrade"
                    ></iframe>
                  </div>
                </div>
              </div>

              <!-- Parking information -->
              <div v-if="worship.parking || editMode" class="parking-section">
                <h2 class="section-subtitle">🚙 주차 안내</h2>
                <textarea
                  v-if="editMode"
                  v-model="editForm.parking"
                  class="edit-textarea"
                  rows="2"
                  placeholder="주차 안내 내용을 입력하세요"
                ></textarea>
                <p v-else class="parking-text">{{ worship.parking }}</p>
              </div>

              <!-- Seating information -->
              <div v-if="worship.seating || editMode" class="seating-section">
                <h2 class="section-subtitle">🪑 자리 안내</h2>
                <textarea
                  v-if="editMode"
                  v-model="editForm.seating"
                  class="edit-textarea"
                  rows="2"
                  placeholder="자리 안내 내용을 입력하세요"
                ></textarea>
                <p v-else class="seating-text">{{ worship.seating }}</p>
              </div>

              <!-- Preview -->
              <div
                v-if="
                  worship.opening_songs?.length ||
                  worship.celebration_songs?.length ||
                  worship.prelisten_video ||
                  editMode
                "
                class="songs-section"
              >
                <h2 class="section-subtitle">🎵 미리듣기</h2>
                <p class="songs-intro">
                  예배 전 충분히 듣고 익혀 오신다면, 당일 예배가 더욱 깊고
                  풍성하게 채워질 것입니다.
                </p>

                <!-- Opening Songs -->
                <div
                  v-if="worship.opening_songs?.length || editMode"
                  class="song-category"
                >
                  <h3 class="song-category-title">Opening Song</h3>
                  <div v-if="editMode" class="edit-field">
                    <textarea
                      v-model="editForm.opening_songs_text"
                      class="edit-textarea"
                      rows="4"
                      placeholder="곡 목록을 한 줄에 하나씩 입력하세요"
                    ></textarea>
                  </div>
                  <ol v-else class="song-list">
                    <li
                      v-for="(song, index) in worship.opening_songs"
                      :key="index"
                    >
                      {{ song }}
                    </li>
                  </ol>
                </div>

                <!-- Celebration Songs -->
                <div
                  v-if="worship.celebration_songs?.length || editMode"
                  class="song-category"
                >
                  <h3 class="song-category-title">Celebration Song</h3>
                  <div v-if="editMode" class="edit-field">
                    <textarea
                      v-model="editForm.celebration_songs_text"
                      class="edit-textarea"
                      rows="6"
                      placeholder="곡 목록을 한 줄에 하나씩 입력하세요"
                    ></textarea>
                  </div>
                  <ol v-else class="song-list">
                    <li
                      v-for="(song, index) in worship.celebration_songs"
                      :key="index"
                    >
                      {{ song }}
                    </li>
                  </ol>
                </div>

                <!-- Prelisten Video -->
                <div
                  v-if="worship.prelisten_video || editMode"
                  class="prelisten-video-section"
                >
                  <h3 v-if="editMode" class="song-category-title">
                    미리듣기 영상
                  </h3>
                  <div v-if="editMode" class="edit-field">
                    <input
                      v-model="editForm.prelisten_video"
                      type="text"
                      class="edit-input"
                      placeholder="미리듣기 YouTube 영상 URL을 입력하세요"
                    />
                  </div>
                  <div v-if="worship.prelisten_video" class="video-embed">
                    <iframe
                      :src="getYouTubeEmbedUrl(worship.prelisten_video)"
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
          </div>

          <!-- Video/Photo tab contents -->
          <div v-show="activeTab === 'gallery'" class="tab-content">
            <div class="detail-content">
              <!-- Rally videos: Show only if you are an administrator or have videos -->
              <div
                v-if="isAdmin || (videos && videos.length > 0)"
                class="worship-video-section"
              >
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

                <div v-if="videos && videos.length > 0">
                  <div
                    v-for="(video, index) in videos"
                    :key="video.id"
                    class="video-wrapper-with-delete"
                    :style="{
                      marginBottom: index < videos.length - 1 ? '2rem' : '0',
                    }"
                  >
                    <!-- Administrator only delete button -->
                    <button
                      v-if="isAdmin && editMode"
                      @click="deleteVideo(video.id)"
                      class="btn-delete-video"
                      title="영상 삭제"
                    >
                      🗑️
                    </button>

                    <div class="video-embed">
                      <iframe
                        :src="getYouTubeEmbedUrl(video.video_url)"
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
                <p v-else-if="isAdmin" class="empty-message">
                  아직 업로드된 영상이 없습니다.
                </p>
              </div>

              <!-- On-site photos: Only displayed if you are an administrator or have photos -->
              <div
                v-if="isAdmin || (photos && photos.length > 0)"
                class="photos-section"
              >
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

                <div v-if="photos && photos.length > 0" class="photo-grid">
                  <div
                    v-for="(photo, index) in photos"
                    :key="photo.id"
                    class="photo-item"
                    @click="!editMode && openLightbox(index)"
                  >
                    <!-- Administrator only delete button -->
                    <button
                      v-if="isAdmin && editMode"
                      @click.stop="deletePhoto(photo.id)"
                      class="btn-delete-photo"
                      title="사진 삭제"
                    >
                      ✕
                    </button>
                    <img
                      :src="photo.photo_url"
                      :alt="`집회 사진 ${index + 1}`"
                    />
                  </div>
                </div>
                <p v-else-if="isAdmin" class="empty-message">
                  아직 업로드된 사진이 없습니다.
                </p>
              </div>

              <!-- When there is no video/picture (only visible to administrators) -->
              <div v-if="isAdmin && !hasGalleryContent" class="empty-gallery">
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

                <div v-if="editMode" class="excluded-songs-edit">
                  <label class="edit-label"
                    >저작권 제외 곡 (한 줄에 하나씩)</label
                  >
                  <textarea
                    v-model="editForm.excluded_songs_text"
                    class="edit-textarea"
                    rows="3"
                    placeholder="저작권 문제로 악보에 포함되지 않는 곡들을 한 줄에 하나씩 입력하세요"
                  ></textarea>
                </div>
                <span v-else class="warning-song">
                  저작권 문제로 인해, 다음 곡들은 악보에 포함되어 있지 않습니다:
                  {{
                    worship.excluded_songs
                      ? worship.excluded_songs.join(", ")
                      : "해당 없음"
                  }}
                </span>

                <div
                  v-if="scores && scores.length > 0"
                  class="score-single-container"
                >
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

                    <!-- PDF preview / Thumbnail -->
                    <div class="score-preview-large">
                      <div v-if="worship.poster_url" class="score-thumbnail">
                        <img
                          :src="worship.poster_url"
                          :alt="worship.title + ' 포스터'"
                        />
                      </div>
                      <div v-else class="score-placeholder-large">
                        <div class="pdf-icon-large">📋</div>
                        <p class="placeholder-title">악보 포스터</p>
                        <p class="placeholder-subtitle">
                          업로드된 포스터가 없습니다
                        </p>
                      </div>
                    </div>

                    <!-- Score information -->
                    <div class="score-info-large">
                      <h3 class="score-title-main">
                        {{ worship.title }} 집회 악보
                      </h3>
                      <p class="score-description">
                        {{ scores[0].description }}
                      </p>
                      <div class="score-details">
                        <div class="score-detail-item">
                          <span class="detail-label">파일명:</span>
                          <span class="detail-value">{{
                            scores[0].filename
                          }}</span>
                        </div>
                        <div class="score-detail-item">
                          <span class="detail-label">업로드:</span>
                          <span class="detail-value">{{
                            formatDate(scores[0].created_at || "")
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

                <!-- Sheet music empty: visible only to administrators -->
                <div v-else-if="isAdmin" class="score-empty-state">
                  <div class="empty-icon">📋</div>
                  <h3>아직 업로드된 악보가 없습니다</h3>
                  <p>집회 후 송폼과 악보가 업데이트 예정입니다.</p>
                  <button
                    v-if="editMode"
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

      <!-- Sheet music upload modal -->
      <div
        v-if="scoreUploadModalOpen"
        class="modal-overlay"
        @click="closeScoreUploadModal"
      >
        <div class="modal-content" @click.stop>
          <div class="modal-header">
            <h2>악보 업로드</h2>
            <button class="modal-close" @click="closeScoreUploadModal">
              ×
            </button>
          </div>
          <div class="modal-body">
            <div class="upload-form">
              <div class="form-group">
                <label>PDF 파일 선택</label>
                <input
                  ref="scoreFileInput"
                  type="file"
                  accept="application/pdf"
                  @change="handleScoreFileSelect"
                />
                <p class="form-hint">
                  PDF 파일만 업로드 가능합니다. (최대 10MB)
                </p>
              </div>
              <div v-if="selectedScoreFile" class="selected-file-info">
                <p>
                  <strong>선택된 파일:</strong> {{ selectedScoreFile.name }}
                </p>
                <p>
                  <strong>파일 크기:</strong>
                  {{ formatFileSize(selectedScoreFile.size) }}
                </p>
              </div>
              <div class="form-group">
                <label>설명 (선택사항)</label>
                <textarea
                  v-model="scoreDescription"
                  rows="3"
                  placeholder="악보에 대한 설명을 입력하세요"
                ></textarea>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn ghost" @click="closeScoreUploadModal">
              취소
            </button>
            <button
              class="btn primary"
              @click="uploadScore"
              :disabled="!selectedScoreFile || uploading"
            >
              {{ uploading ? "업로드 중..." : "업로드" }}
            </button>
          </div>
        </div>
      </div>

      <!-- Poster/thumbnail upload modal -->
      <div
        v-if="thumbnailUploadModalOpen"
        class="modal-overlay"
        @click="closeThumbnailUploadModal"
      >
        <div class="modal-content" @click.stop>
          <div class="modal-header">
            <h2>악보 포스터 업로드</h2>
            <button class="modal-close" @click="closeThumbnailUploadModal">
              ×
            </button>
          </div>
          <div class="modal-body">
            <div class="upload-form">
              <div class="form-group">
                <label>이미지 파일 선택</label>
                <input
                  ref="thumbnailFileInput"
                  type="file"
                  accept="image/*"
                  @change="handleThumbnailFileSelect"
                />
                <p class="form-hint">JPG, PNG, GIF 등 이미지 파일 (최대 5MB)</p>
              </div>
              <div v-if="selectedThumbnailFile" class="selected-file-info">
                <p>
                  <strong>선택된 파일:</strong> {{ selectedThumbnailFile.name }}
                </p>
                <p>
                  <strong>파일 크기:</strong>
                  {{ formatFileSize(selectedThumbnailFile.size) }}
                </p>
              </div>
              <div v-if="thumbnailPreviewUrl" class="thumbnail-preview">
                <img :src="thumbnailPreviewUrl" alt="미리보기" />
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn ghost" @click="closeThumbnailUploadModal">
              취소
            </button>
            <button
              class="btn primary"
              @click="uploadThumbnail"
              :disabled="!selectedThumbnailFile || uploading"
            >
              {{ uploading ? "업로드 중..." : "업로드" }}
            </button>
          </div>
        </div>
      </div>

      <!-- Rally poster upload modal -->
      <div
        v-if="posterUploadModalOpen"
        class="modal-overlay"
        @click="closePosterUploadModal"
      >
        <div class="modal-content" @click.stop>
          <div class="modal-header">
            <h2>집회 포스터 업로드</h2>
            <button class="modal-close" @click="closePosterUploadModal">
              ×
            </button>
          </div>
          <div class="modal-body">
            <div class="upload-form">
              <div class="form-group">
                <label>이미지 파일 선택</label>
                <input
                  ref="posterFileInput"
                  type="file"
                  accept="image/*"
                  @change="handlePosterFileSelect"
                />
                <p class="form-hint">JPG, PNG, GIF 등 이미지 파일 (최대 5MB)</p>
              </div>
              <div v-if="selectedPosterFile" class="selected-file-info">
                <p>
                  <strong>선택된 파일:</strong> {{ selectedPosterFile.name }}
                </p>
                <p>
                  <strong>파일 크기:</strong>
                  {{ formatFileSize(selectedPosterFile.size) }}
                </p>
              </div>
              <div v-if="posterPreviewUrl" class="thumbnail-preview">
                <img :src="posterPreviewUrl" alt="포스터 미리보기" />
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn ghost" @click="closePosterUploadModal">
              취소
            </button>
            <button
              class="btn primary"
              @click="uploadPoster"
              :disabled="!selectedPosterFile || uploading"
            >
              {{ uploading ? "업로드 중..." : "업로드" }}
            </button>
          </div>
        </div>
      </div>

      <!-- Poster full screen modal -->
      <div
        v-if="posterFullscreenOpen"
        class="fullscreen-modal"
        @click="closePosterFullscreen"
      >
        <div class="fullscreen-content">
          <button class="fullscreen-close" @click="closePosterFullscreen">
            ✕
          </button>
          <img
            :src="worship.poster_url"
            :alt="`${worship.title} 포스터`"
            class="fullscreen-image"
          />
        </div>
      </div>

      <!-- Score poster full screen modal -->
      <div
        v-if="scorePosterFullscreenOpen"
        class="fullscreen-modal"
        @click="closeScorePosterFullscreen"
      >
        <div class="fullscreen-content">
          <button class="fullscreen-close" @click="closeScorePosterFullscreen">
            ✕
          </button>
          <img
            :src="scorePosterUrl"
            alt="악보 포스터"
            class="fullscreen-image"
          />
        </div>
      </div>
    </section>
  </div>
</template>
