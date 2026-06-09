<script setup lang="ts">
import { computed, ref, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useAuth } from "@/composables/useAuth";
import { worshipApi, type Worship } from "@/api/worship";
import { worshipScoreApi, type WorshipScore } from "@/api/worship-scores";
import { worshipPhotoApi, type WorshipPhoto } from "@/api/worship-photos";
import InfoTab from "@/components/worship-detail/InfoTab.vue";
import ImageUploadModal from "@/components/worship-detail/ImageUploadModal.vue";
import ScoreUploadModal from "@/components/worship-detail/ScoreUploadModal.vue";
import FullscreenModal from "@/components/worship-detail/FullscreenModal.vue";
import PdfPreviewModal from "@/components/worship-detail/PdfPreviewModal.vue";
import "../styles/WorshipDetail.css";

const router = useRouter();
const route = useRoute();
const { isAdmin, isLoggedIn } = useAuth();

const activeTab = ref("info");
const editMode = ref(false);
const loading = ref(false);
const uploading = ref(false);
const worship = ref<Worship | null>(null);
const scores = ref<WorshipScore[]>([]);
const photos = ref<WorshipPhoto[]>([]);
const worshipId = computed(() => Number(route.params.id));

const editForm = ref<Record<string, string>>({
  title: "", preacher: "", worship_team: "", guest: "", description: "",
  poster_url: "", comments: "", entry_time: "", start_time: "",
  location: "", location_link: "", parking: "", seating: "",
  promo_video: "", prelisten_video: "",
  opening_songs_text: "", celebration_songs_text: "", excluded_songs_text: "",
});

const posterUploadOpen = ref(false);
const thumbnailUploadOpen = ref(false);
const scoreUploadOpen = ref(false);
const posterFullscreenOpen = ref(false);
const scorePosterFullscreenOpen = ref(false);
const scorePosterUrl = ref("");
const pdfPreviewOpen = ref(false);
const currentPdfUrl = ref("");
const lightboxOpen = ref(false);
const currentPhotoIndex = ref(0);

const currentPhoto = computed(() => photos.value[currentPhotoIndex.value]?.photo_url || "");

const fetchWorship = async () => {
  loading.value = true;
  try {
    const r = await worshipApi.getOne(worshipId.value);
    worship.value = r.data;
    Object.assign(editForm.value, {
      title: r.data.title || "", preacher: r.data.preacher || "", worship_team: r.data.worship_team || "",
      guest: r.data.guest || "", description: r.data.description || "", poster_url: r.data.poster_url || "",
      comments: r.data.comments || "", entry_time: r.data.entry_time || "", start_time: r.data.start_time || "",
      location: r.data.location || "", location_link: r.data.location_link || "",
      parking: r.data.parking || "", seating: r.data.seating || "",
      promo_video: r.data.promo_video || "", prelisten_video: r.data.prelisten_video || "",
      opening_songs_text: r.data.opening_songs?.join("\n") || "",
      celebration_songs_text: r.data.celebration_songs?.join("\n") || "",
      excluded_songs_text: r.data.excluded_songs?.join("\n") || "",
    });
    scores.value = (await worshipScoreApi.getByWorshipId(worshipId.value)).data;
    photos.value = (await worshipPhotoApi.getByWorshipId(worshipId.value)).data;
  } catch (e) { console.error("집회 조회 실패:", e); }
  finally { loading.value = false; }
};

const saveWorship = async () => {
  loading.value = true;
  try {
    const toArr = (text: string) => text.split("\n").map((s) => s.trim()).filter(Boolean);
    await worshipApi.update(worshipId.value, {
      ...editForm.value,
      opening_songs: toArr(editForm.value.opening_songs_text),
      celebration_songs: toArr(editForm.value.celebration_songs_text),
      excluded_songs: toArr(editForm.value.excluded_songs_text),
    });
    alert("집회 정보가 저장되었습니다!"); editMode.value = false; await fetchWorship();
  } catch { alert("저장에 실패했습니다"); }
  finally { loading.value = false; }
};

const toggleEditMode = async () => { editMode.value ? await saveWorship() : (editMode.value = true); };

const removePoster = async () => {
  if (!confirm("포스터를 삭제하시겠습니까?")) return;
  loading.value = true;
  try { await worshipApi.update(worshipId.value, { poster_url: "" }); alert("포스터가 삭제되었습니다!"); await fetchWorship(); }
  catch { alert("포스터 삭제에 실패했습니다"); }
  finally { loading.value = false; }
};

const handlePosterUpload = async (file: File) => {
  uploading.value = true;
  try {
    const { url } = (await worshipPhotoApi.uploadFile(file)).data;
    await worshipApi.update(worshipId.value, { poster_url: url });
    alert("포스터가 업로드되었습니다!"); posterUploadOpen.value = false; await fetchWorship();
  } catch { alert("포스터 업로드에 실패했습니다."); }
  finally { uploading.value = false; }
};

const handleThumbnailUpload = async (file: File) => {
  if (!scores.value.length) { alert("악보가 없습니다. 먼저 악보를 업로드해주세요."); return; }
  uploading.value = true;
  try {
    const { url } = (await worshipPhotoApi.uploadFile(file)).data;
    await worshipScoreApi.update(scores.value[0].id, { thumbnail_url: url });
    alert("포스터가 업로드되었습니다!"); thumbnailUploadOpen.value = false; await fetchWorship();
  } catch { alert("포스터 업로드에 실패했습니다."); }
  finally { uploading.value = false; }
};

const handleScoreUpload = async (file: File, description: string) => {
  uploading.value = true;
  try {
    const { url, filename } = (await worshipScoreApi.uploadFile(file)).data;
    await worshipScoreApi.create({ worship_id: worshipId.value, filename, file_url: url, description: description || undefined });
    alert("악보가 업로드되었습니다!"); scoreUploadOpen.value = false; await fetchWorship();
  } catch { alert("악보 업로드에 실패했습니다."); }
  finally { uploading.value = false; }
};

const deleteWorshipScore = async () => {
  if (!scores.value.length || !confirm("이 악보를 삭제하시겠습니까?")) return;
  loading.value = true;
  try { await worshipScoreApi.delete(scores.value[0].id); alert("악보가 삭제되었습니다!"); await fetchWorship(); }
  catch { alert("악보 삭제에 실패했습니다"); }
  finally { loading.value = false; }
};

const downloadWorshipScore = () => {
  if (!isLoggedIn.value) { alert("로그인이 필요합니다."); return; }
  if (!scores.value.length) { alert("다운로드할 악보가 없습니다."); return; }
  const link = document.createElement("a");
  link.href = scores.value[0].file_url; link.download = scores.value[0].filename;
  document.body.appendChild(link); link.click(); document.body.removeChild(link);
};

const formatDateWithDay = (dateString: string) => {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const date = new Date(dateString + "T00:00:00");
  return `${date.toLocaleDateString("ko-KR")} (${days[date.getDay()]})`;
};

onMounted(fetchWorship);
</script>

<template>
  <div class="page">
    <section class="section">
      <div class="detail-header">
        <button class="btn ghost back-btn" @click="router.push({ name: 'worship-log' })">← 목록으로</button>
        <button v-if="isAdmin" class="btn primary edit-mode-btn" @click="toggleEditMode">
          {{ editMode ? "💾 저장하기" : "✏️ 편집 모드" }}
        </button>
      </div>

      <div v-if="worship" class="detail-container">
        <div class="detail-hero">
          <p class="detail-date">{{ formatDateWithDay(worship.date) }}</p>
          <h1 class="detail-title">
            <input v-if="editMode" v-model="editForm.title" type="text" />
            <span v-else>{{ worship.title }}</span>
          </h1>
          <div class="hero-info">
            <div class="hero-info-item">
              <span class="hero-info-label">설교자</span>
              <span v-if="editMode" class="hero-info-value"><input v-model="editForm.preacher" type="text" /></span>
              <span v-else class="hero-info-value">{{ worship.preacher }}</span>
            </div>
            <div class="hero-info-item">
              <span class="hero-info-label">찬양팀</span>
              <span v-if="editMode" class="hero-info-value"><input v-model="editForm.worship_team" type="text" /></span>
              <span v-else class="hero-info-value">{{ worship.worship_team }}</span>
            </div>
            <div v-if="worship.guest || editMode" class="hero-info-item">
              <span class="hero-info-label">초청 간사</span>
              <span v-if="editMode" class="hero-info-value"><input v-model="editForm.guest" type="text" /></span>
              <span v-else class="hero-info-value">{{ worship.guest }}</span>
            </div>
          </div>
          <p v-if="editMode" class="hero-description"><textarea v-model="editForm.description" rows="3"></textarea></p>
          <p v-else class="hero-description">{{ worship.description }}</p>
        </div>

        <div class="tabs-container">
          <div class="tabs-nav">
            <button class="tab-button" :class="{ active: activeTab === 'info' }" @click="activeTab = 'info'">안내</button>
            <!-- Video/Photo, Score tabs are commented out until activation -->
          </div>
          <div v-show="activeTab === 'info'" class="tab-content">
            <InfoTab
              :worship="worship" :edit-mode="editMode" :edit-form="editForm"
              @upload-poster="posterUploadOpen = true"
              @remove-poster="removePoster"
              @open-poster-fullscreen="posterFullscreenOpen = true"
            />
          </div>
        </div>
      </div>

      <div v-else class="empty-container">
        <p class="empty-text">집회 정보를 찾을 수 없습니다.</p>
        <button class="btn primary" @click="router.push({ name: 'worship-log' })">목록으로 돌아가기</button>
      </div>

      <!-- Lightbox -->
      <div v-if="lightboxOpen" class="lightbox" @click="lightboxOpen = false">
        <button class="lightbox-close" @click="lightboxOpen = false">×</button>
        <button class="lightbox-prev" @click.stop="currentPhotoIndex = (currentPhotoIndex - 1 + photos.length) % photos.length">‹</button>
        <button class="lightbox-next" @click.stop="currentPhotoIndex = (currentPhotoIndex + 1) % photos.length">›</button>
        <img :src="currentPhoto" alt="집회 사진" @click.stop />
      </div>

      <PdfPreviewModal :show="pdfPreviewOpen" :pdf-url="currentPdfUrl" @close="pdfPreviewOpen = false" />
      <ScoreUploadModal :show="scoreUploadOpen" :uploading="uploading" @close="scoreUploadOpen = false" @upload="handleScoreUpload" />
      <ImageUploadModal :show="thumbnailUploadOpen" title="악보 포스터 업로드" :uploading="uploading" @close="thumbnailUploadOpen = false" @upload="handleThumbnailUpload" />
      <ImageUploadModal :show="posterUploadOpen" title="집회 포스터 업로드" :uploading="uploading" @close="posterUploadOpen = false" @upload="handlePosterUpload" />
      <FullscreenModal v-if="worship" :show="posterFullscreenOpen" :src="worship.poster_url || ''" :alt="`${worship.title} 포스터`" @close="posterFullscreenOpen = false" />
      <FullscreenModal :show="scorePosterFullscreenOpen" :src="scorePosterUrl" alt="악보 포스터" @close="scorePosterFullscreenOpen = false" />
    </section>
  </div>
</template>
