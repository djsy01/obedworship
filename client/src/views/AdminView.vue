<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { RouterLink } from "vue-router";
import { useAuth } from "@/composables/useAuth";
import { worshipApi, type Worship } from "@/api/worship";
import { assetApi, type Asset } from "@/api/assets";
import "../styles/Admin.css";

const { isAdmin } = useAuth();
const worships = ref<Worship[]>([]);
const loading = ref(false);

const isExpanded = ref(false);
const currentTeamPhoto = ref<string>("");
const currentLogo = ref<string>("");
const songs = ref<Asset[]>([]);
const teamPhotoStatus = ref<string>("");
const logoStatus = ref<string>("");
const songStatus = ref<string>("");
const teamPhotoInput = ref<HTMLInputElement | null>(null);
const logoInput = ref<HTMLInputElement | null>(null);
const songInput = ref<HTMLInputElement | null>(null);

// Drag & drop state
const dragIndex = ref<number | null>(null);
const dragOverIndex = ref<number | null>(null);

const onSongDragStart = (index: number) => {
  dragIndex.value = index;
};

const onSongDragOver = (e: DragEvent, index: number) => {
  e.preventDefault();
  dragOverIndex.value = index;
};

const onSongDrop = async (index: number) => {
  if (dragIndex.value === null || dragIndex.value === index) {
    dragIndex.value = null;
    dragOverIndex.value = null;
    return;
  }

  const list = [...songs.value];
  const [moved] = list.splice(dragIndex.value, 1);
  list.splice(index, 0, moved);
  songs.value = list;

  dragIndex.value = null;
  dragOverIndex.value = null;

  // Save order to backend
  try {
    songStatus.value = "순서 저장 중...";
    for (let i = 0; i < list.length; i++) {
      await assetApi.update(list[i].id, { display_order: i });
    }
    songStatus.value = "순서 저장 완료!";
    setTimeout(() => {
      songStatus.value = "";
    }, 2000);
  } catch (error) {
    console.error("순서 저장 실패:", error);
    songStatus.value = "순서 저장 실패";
    await loadSongs();
  }
};

const onSongDragEnd = () => {
  dragIndex.value = null;
  dragOverIndex.value = null;
};

// Assembly query
const fetchWorships = async () => {
  loading.value = true;
  try {
    const response = await worshipApi.getAll();
    worships.value = response.data;
  } catch (error) {
    console.error("집회 조회 실패:", error);
  } finally {
    loading.value = false;
  }
};

// date formatting
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString("ko-KR");
};

// Statistical calculations
const totalWorships = computed(() => worships.value.length);

const upcomingWorships = computed(() => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return worships.value.filter((w) => new Date(w.date) >= today).length;
});

const recentWorships = computed(() =>
  worships.value
    .slice(0, 10)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
);

const openTeamPhotoPicker = () => {
  teamPhotoInput.value?.click();
};

const openLogoPicker = () => {
  logoInput.value?.click();
};

const openSongPicker = () => {
  songInput.value?.click();
};

const loadSongs = async () => {
  try {
    const response = await assetApi.getByCategory("songs");
    songs.value = Array.isArray(response.data)
      ? response.data
          .slice()
          .sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0))
      : [];
  } catch (error) {
    console.log("Songs not found in assets");
    songs.value = [];
  }
};

const handleTeamPhotoChange = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];

  if (!file) return;

  if (!file.type.startsWith("image/")) {
    teamPhotoStatus.value = "이미지 파일만 업로드 가능합니다.";
    return;
  }

  try {
    teamPhotoStatus.value = "업로드 중...";

    const response = await assetApi.uploadFile(
      file,
      "home_team_photo",
      "home",
      "OBED Worship 단체 사진",
      "메인 페이지 단체 사진",
    );

    currentTeamPhoto.value = response.data.file_url;
    teamPhotoStatus.value = "업로드 완료! 페이지를 새로고침하세요.";

    setTimeout(() => {
      teamPhotoStatus.value = "";
    }, 3000);
  } catch (error: any) {
    console.error("Upload failed:", error);
    teamPhotoStatus.value = `업로드 실패: ${
      error.response?.data?.message || error.message
    }`;
  }
};

const handleLogoChange = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];

  if (!file) return;

  if (!file.type.startsWith("image/")) {
    logoStatus.value = "이미지 파일만 업로드 가능합니다.";
    return;
  }

  try {
    logoStatus.value = "업로드 중...";

    const response = await assetApi.uploadFile(
      file,
      "home_logo",
      "home",
      "OBED Worship 로고",
      "메인 로고",
    );

    currentLogo.value = response.data.file_url;
    logoStatus.value = "업로드 완료! 페이지를 새로고침하세요.";

    setTimeout(() => {
      logoStatus.value = "";
    }, 3000);
  } catch (error: any) {
    console.error("Upload failed:", error);
    logoStatus.value = `업로드 실패: ${
      error.response?.data?.message || error.message
    }`;
  }
};

const handleSongChange = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];

  if (!file) return;

  if (!file.type.startsWith("audio/")) {
    songStatus.value = "오디오 파일만 업로드 가능합니다.";
    return;
  }

  try {
    songStatus.value = "업로드 중...";
    const assetKey = `home_song_${Date.now()}`;

    await assetApi.uploadFile(file, assetKey, "songs", file.name, "홈 음원");

    songStatus.value = "업로드 완료!";
    await loadSongs();

    setTimeout(() => {
      songStatus.value = "";
    }, 3000);
  } catch (error: any) {
    console.error("Upload failed:", error);
    songStatus.value = `업로드 실패: ${
      error.response?.data?.message || error.message
    }`;
  } finally {
    if (songInput.value) songInput.value.value = "";
  }
};

const deleteSong = async (id: number) => {
  if (!confirm("이 음원을 삭제할까요?")) return;

  try {
    await assetApi.delete(id);
    await loadSongs();
  } catch (error) {
    console.error("Delete failed:", error);
    songStatus.value = "삭제 실패";
  }
};

// initial load
onMounted(() => {
  if (!isAdmin.value) {
    alert("관리자만 접근 가능합니다");
    window.history.back();
  }
  fetchWorships();
});

onMounted(async () => {
  try {
    const teamPhotoAsset = await assetApi.getByKey("home_team_photo");
    currentTeamPhoto.value = teamPhotoAsset.data.file_url;
  } catch (error) {
    console.log("Team photo not found in assets");
  }

  try {
    const logoAsset = await assetApi.getByKey("home_logo");
    currentLogo.value = logoAsset.data.file_url;
  } catch (error) {
    console.log("Logo not found in assets");
  }

  await loadSongs();
});
</script>

<template>
  <div class="page">
    <section class="section">
      <div class="section-header">
        <div>
          <h1 class="section-title">관리 대시보드</h1>
          <p class="section-subtitle">
            Vision, 집회안내, 집회신청에서 관리자 기능으로 수정/삭제/추가를 할
            수 있습니다.
          </p>
        </div>
      </div>

      <!-- Admin Link -->
      <div class="admin-links">
        <RouterLink to="/vision" class="admin-card">
          <h3>👥 비전 관리</h3>
          <p>팀원 정보 수정 및 관리</p>
        </RouterLink>

        <RouterLink to="/worship-log" class="admin-card">
          <h3>📅 집회안내 관리</h3>
          <p>집회 정보 추가, 수정, 삭제</p>
        </RouterLink>

        <RouterLink to="/tickets" class="admin-card">
          <h3>🎫 집회신청 관리</h3>
          <p>집회 신청 현황 관리</p>
        </RouterLink>
      </div>

      <!-- Home Manager -->
      <div v-if="isAdmin" class="photo-manager">
        <div class="manager-header">
          <h3>홈 관리</h3>
          <button class="btn-toggle" @click="isExpanded = !isExpanded">
            {{ isExpanded ? "접기 ▲" : "펼치기 ▼" }}
          </button>
        </div>

        <div v-if="isExpanded" class="manager-content">
          <!-- Team Photo Upload -->
          <div class="upload-section">
            <h4>단체 사진 (Team Photo)</h4>
            <div class="photo-controls">
              <div class="current-photo">
                <img
                  v-if="currentTeamPhoto"
                  :src="currentTeamPhoto"
                  alt="현재 단체 사진"
                />
                <div v-else class="no-photo">사진 없음</div>
              </div>
              <div class="upload-actions">
                <input
                  type="file"
                  ref="teamPhotoInput"
                  @change="handleTeamPhotoChange"
                  accept="image/*"
                  style="display: none"
                />
                <button class="btn-upload" @click="openTeamPhotoPicker">
                  사진 변경
                </button>
                <p class="status-message">{{ teamPhotoStatus }}</p>
              </div>
            </div>
          </div>

          <!-- Logo Upload -->
          <div class="upload-section">
            <h4>로고 (Logo)</h4>
            <div class="photo-controls">
              <div class="current-photo">
                <img v-if="currentLogo" :src="currentLogo" alt="현재 로고" />
                <div v-else class="no-photo">로고 없음</div>
              </div>
              <div class="upload-actions">
                <input
                  type="file"
                  ref="logoInput"
                  @change="handleLogoChange"
                  accept="image/*"
                  style="display: none"
                />
                <button class="btn-upload" @click="openLogoPicker">
                  로고 변경
                </button>
                <p class="status-message">{{ logoStatus }}</p>
              </div>
            </div>
          </div>

          <!-- Home Songs -->
          <div class="upload-section">
            <h4>홈 음원 관리</h4>
            <div class="audio-controls">
              <div class="current-audio-list">
                <div v-if="songs.length === 0" class="no-photo">
                  등록된 음원이 없습니다.
                </div>
                <div v-else class="audio-list">
                  <div
                    v-for="(song, index) in songs"
                    :key="song.id"
                    class="audio-item"
                    :class="{
                      dragging: dragIndex === index,
                      'drag-over': dragOverIndex === index && dragIndex !== index,
                    }"
                    draggable="true"
                    @dragstart="onSongDragStart(index)"
                    @dragover="onSongDragOver($event, index)"
                    @drop.prevent="onSongDrop(index)"
                    @dragend="onSongDragEnd"
                  >
                    <span class="drag-handle">⠿</span>
                    <div class="audio-info">
                      <p class="audio-title">
                        {{ song.title || song.file_name || "음원" }}
                      </p>
                      <audio
                        v-if="song.file_url"
                        :src="song.file_url"
                        controls
                      />
                    </div>
                    <button class="btn-delete" @click="deleteSong(song.id)">
                      삭제
                    </button>
                  </div>
                </div>
              </div>
              <div class="upload-actions">
                <input
                  type="file"
                  ref="songInput"
                  @change="handleSongChange"
                  accept="audio/*"
                  style="display: none"
                />
                <button class="btn-upload" @click="openSongPicker">
                  음원 추가
                </button>
                <p class="status-message">{{ songStatus }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Rally Status -->
      <div class="dashboard-section">
        <h2 class="section-title-sub">집회 현황</h2>

        <div v-if="loading" class="loading">로딩 중...</div>
        <div v-else-if="worships.length === 0" class="empty">
          집회 정보가 없습니다.
        </div>
        <div v-else class="stats-grid">
          <div class="stat-card">
            <div class="stat-value">{{ totalWorships }}</div>
            <div class="stat-label">전체 집회</div>
          </div>

          <div class="stat-card">
            <div class="stat-value">{{ upcomingWorships }}</div>
            <div class="stat-label">예정 집회</div>
          </div>
        </div>

        <!-- List of recent rallies -->
        <div class="recent-worships">
          <h3 class="list-title">최근 집회</h3>
          <div class="table-wrapper">
            <table class="table">
              <thead>
                <tr>
                  <th>제목</th>
                  <th>날짜</th>
                  <th>설교자</th>
                  <th>예배팀</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="worship in recentWorships" :key="worship.id">
                  <td class="title-cell">{{ worship.title }}</td>
                  <td>{{ formatDate(worship.date) }}</td>
                  <td>{{ worship.preacher }}</td>
                  <td>{{ worship.worship_team }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
