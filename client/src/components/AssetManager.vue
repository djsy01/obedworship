<template>
  <div class="asset-manager">
    <h2 class="manager-title">자산 관리</h2>
    <p class="manager-subtitle">홈 사진과 곡을 관리합니다.</p>

    <!-- Home Photos Section -->
    <div class="asset-section">
      <h3 class="section-title">📷 홈 사진</h3>

      <!-- Team Photo -->
      <div class="asset-item">
        <div class="asset-info">
          <label class="asset-label">단체 사진 (Team Photo)</label>
          <img
            v-if="currentTeamPhoto"
            :src="currentTeamPhoto"
            alt="Team Photo"
            class="asset-preview"
          />
          <div v-else class="asset-placeholder">사진 없음</div>
        </div>
        <div class="asset-actions">
          <label class="btn-upload">
            <input
              type="file"
              accept="image/*"
              @change="handleTeamPhotoChange"
              style="display: none"
            />
            사진 변경
          </label>
          <p v-if="teamPhotoStatus" class="status-message">
            {{ teamPhotoStatus }}
          </p>
        </div>
      </div>

      <!-- Logo -->
      <div class="asset-item">
        <div class="asset-info">
          <label class="asset-label">로고 (LOGO)</label>
          <img
            v-if="currentLogo"
            :src="currentLogo"
            alt="Logo"
            class="asset-preview"
          />
          <div v-else class="asset-placeholder">사진 없음</div>
        </div>
        <div class="asset-actions">
          <label class="btn-upload">
            <input
              type="file"
              accept="image/*"
              @change="handleLogoChange"
              style="display: none"
            />
            사진 변경
          </label>
          <p v-if="logoStatus" class="status-message">{{ logoStatus }}</p>
        </div>
      </div>
    </div>

    <!-- Songs Section -->
    <div class="asset-section">
      <h3 class="section-title">🎵 곡 관리</h3>

      <!-- Song List -->
      <div v-if="songs.length > 0" class="song-list">
        <div v-for="song in songs" :key="song.id" class="song-item">
          <div class="song-info">
            <div class="song-title">{{ song.title || song.file_name }}</div>
            <div class="song-meta">
              {{ formatFileSize(song.file_size) }} • {{ song.mime_type }}
            </div>
          </div>
          <div class="song-actions">
            <button @click="deleteSong(song.id)" class="btn-delete">
              삭제
            </button>
          </div>
        </div>
      </div>
      <div v-else class="empty-message">등록된 곡이 없습니다.</div>

      <!-- Upload Song -->
      <div class="upload-section">
        <label class="btn-upload">
          <input
            type="file"
            accept="audio/*"
            @change="handleSongUpload"
            style="display: none"
          />
          ➕ 새 곡 추가
        </label>
        <p v-if="songUploadStatus" class="status-message">
          {{ songUploadStatus }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { assetApi, type Asset } from "@/api/assets";

// Team Photo
const currentTeamPhoto = ref<string>("");
const teamPhotoStatus = ref<string>("");

// Logo
const currentLogo = ref<string>("");
const logoStatus = ref<string>("");

// Songs
const songs = ref<Asset[]>([]);
const songUploadStatus = ref<string>("");

// Load current assets
const loadAssets = async () => {
  try {
    // Load team photo
    try {
      const teamPhotoRes = await assetApi.getByKey("home_team_photo");
      currentTeamPhoto.value = teamPhotoRes.data.file_url || "";
    } catch (error) {
      console.log("Team photo not found");
    }

    // Load logo
    try {
      const logoRes = await assetApi.getByKey("home_logo");
      currentLogo.value = logoRes.data.file_url || "";
    } catch (error) {
      console.log("Logo not found");
    }

    // Load songs
    const songsRes = await assetApi.getByCategory("songs");
    songs.value = songsRes.data;
  } catch (error: any) {
    console.error("Failed to load assets:", error);
  }
};

// Handle team photo change
const handleTeamPhotoChange = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];

  if (!file || !file.type.startsWith("image/")) {
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
      "메인 페이지 단체 사진"
    );

    currentTeamPhoto.value = response.data.file_url || "";
    teamPhotoStatus.value = "업로드 완료!";
    setTimeout(() => (teamPhotoStatus.value = ""), 3000);
  } catch (error: any) {
    teamPhotoStatus.value = `업로드 실패: ${
      error.response?.data?.message || error.message
    }`;
  }
};

// Handle logo change
const handleLogoChange = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];

  if (!file || !file.type.startsWith("image/")) {
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
      "메인 페이지 로고"
    );

    currentLogo.value = response.data.file_url || "";
    logoStatus.value = "업로드 완료!";
    setTimeout(() => (logoStatus.value = ""), 3000);
  } catch (error: any) {
    logoStatus.value = `업로드 실패: ${
      error.response?.data?.message || error.message
    }`;
  }
};

// Handle song upload
const handleSongUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];

  if (!file || !file.type.startsWith("audio/")) {
    songUploadStatus.value = "오디오 파일만 업로드 가능합니다.";
    return;
  }

  try {
    songUploadStatus.value = "업로드 중...";

    // Generate unique key for this song
    const songKey = `song_${Date.now()}`;

    await assetApi.uploadFile(
      file,
      songKey,
      "songs",
      file.name.replace(/\.[^/.]+$/, ""), // Remove extension for title
      "OBED Worship 곡"
    );

    songUploadStatus.value = "업로드 완료!";
    await loadAssets(); // Reload songs list
    setTimeout(() => (songUploadStatus.value = ""), 3000);
  } catch (error: any) {
    songUploadStatus.value = `업로드 실패: ${
      error.response?.data?.message || error.message
    }`;
  }
};

// Delete song
const deleteSong = async (id: number) => {
  if (!confirm("이 곡을 삭제하시겠습니까?")) {
    return;
  }

  try {
    await assetApi.delete(id);
    await loadAssets(); // Reload songs list
  } catch (error: any) {
    alert(`삭제 실패: ${error.response?.data?.message || error.message}`);
  }
};

// Format file size
const formatFileSize = (bytes: number | null | undefined): string => {
  if (!bytes) return "알 수 없음";
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
};

onMounted(() => {
  loadAssets();
});
</script>

<style scoped>
.asset-manager {
  background: white;
  border-radius: 8px;
  padding: 2rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.manager-title {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
  color: #1a1a1a;
}

.manager-subtitle {
  color: #666;
  margin: 0 0 2rem 0;
}

.asset-section {
  margin-bottom: 2.5rem;
  padding-bottom: 2.5rem;
  border-bottom: 1px solid #e5e5e5;
}

.asset-section:last-child {
  margin-bottom: 0;
  padding-bottom: 0;
  border-bottom: none;
}

.section-title {
  font-size: 1.2rem;
  font-weight: 600;
  margin: 0 0 1.5rem 0;
  color: #333;
}

.asset-item {
  display: flex;
  gap: 2rem;
  align-items: flex-start;
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: #f9f9f9;
  border-radius: 6px;
}

.asset-info {
  flex: 1;
}

.asset-label {
  display: block;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #333;
}

.asset-preview {
  max-width: 300px;
  max-height: 200px;
  border-radius: 4px;
  border: 1px solid #ddd;
}

.asset-placeholder {
  padding: 2rem;
  background: #e9e9e9;
  border-radius: 4px;
  text-align: center;
  color: #999;
}

.asset-actions {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.btn-upload {
  padding: 0.5rem 1rem;
  background: #4a1f2f;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  text-align: center;
  transition: background 0.2s;
}

.btn-upload:hover {
  background: #6b2f47;
}

.status-message {
  font-size: 0.85rem;
  color: #666;
  margin: 0;
}

/* Songs */
.song-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.song-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: #f9f9f9;
  border-radius: 6px;
  border: 1px solid #e5e5e5;
}

.song-info {
  flex: 1;
}

.song-title {
  font-weight: 600;
  color: #333;
  margin-bottom: 0.25rem;
}

.song-meta {
  font-size: 0.85rem;
  color: #999;
}

.song-actions {
  display: flex;
  gap: 0.5rem;
}

.btn-delete {
  padding: 0.5rem 1rem;
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.85rem;
  transition: background 0.2s;
}

.btn-delete:hover {
  background: #c82333;
}

.empty-message {
  padding: 2rem;
  text-align: center;
  color: #999;
  background: #f9f9f9;
  border-radius: 6px;
  margin-bottom: 1.5rem;
}

.upload-section {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

@media (max-width: 768px) {
  .asset-item {
    flex-direction: column;
    gap: 1rem;
  }

  .asset-preview {
    max-width: 100%;
  }
}
</style>
