<template>
  <div v-if="isAdmin" class="photo-manager">
    <div class="manager-header">
      <h3>홈 사진 관리</h3>
      <button class="btn-toggle" @click="isExpanded = !isExpanded">
        {{ isExpanded ? '접기 ▲' : '펼치기 ▼' }}
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
            <button class="btn-upload" @click="$refs.teamPhotoInput.click()">
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
            <button class="btn-upload" @click="$refs.logoInput.click()">
              로고 변경
            </button>
            <p class="status-message">{{ logoStatus }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { assetApi } from '@/api/assets';

interface Props {
  isAdmin: boolean;
}

const props = defineProps<Props>();

const isExpanded = ref(false);
const currentTeamPhoto = ref<string>('');
const currentLogo = ref<string>('');
const teamPhotoStatus = ref<string>('');
const logoStatus = ref<string>('');
const teamPhotoInput = ref<HTMLInputElement | null>(null);
const logoInput = ref<HTMLInputElement | null>(null);

onMounted(async () => {
  // Load current assets
  try {
    const teamPhotoAsset = await assetApi.getByKey('home_team_photo');
    currentTeamPhoto.value = teamPhotoAsset.data.file_url;
  } catch (error) {
    console.log('Team photo not found in assets');
  }

  try {
    const logoAsset = await assetApi.getByKey('home_logo');
    currentLogo.value = logoAsset.data.file_url;
  } catch (error) {
    console.log('Logo not found in assets');
  }
});

const handleTeamPhotoChange = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];

  if (!file) return;

  if (!file.type.startsWith('image/')) {
    teamPhotoStatus.value = '이미지 파일만 업로드 가능합니다.';
    return;
  }

  try {
    teamPhotoStatus.value = '업로드 중...';

    const response = await assetApi.uploadFile(
      file,
      'home_team_photo',
      'home',
      'OBED Worship 단체 사진',
      '메인 페이지 단체 사진'
    );

    currentTeamPhoto.value = response.data.file_url;
    teamPhotoStatus.value = '업로드 완료! 페이지를 새로고침하세요.';

    setTimeout(() => {
      teamPhotoStatus.value = '';
    }, 3000);
  } catch (error: any) {
    console.error('Upload failed:', error);
    teamPhotoStatus.value = `업로드 실패: ${error.response?.data?.message || error.message}`;
  }
};

const handleLogoChange = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];

  if (!file) return;

  if (!file.type.startsWith('image/')) {
    logoStatus.value = '이미지 파일만 업로드 가능합니다.';
    return;
  }

  try {
    logoStatus.value = '업로드 중...';

    const response = await assetApi.uploadFile(
      file,
      'home_logo',
      'home',
      'OBED Worship 로고',
      '메인 로고'
    );

    currentLogo.value = response.data.file_url;
    logoStatus.value = '업로드 완료! 페이지를 새로고침하세요.';

    setTimeout(() => {
      logoStatus.value = '';
    }, 3000);
  } catch (error: any) {
    console.error('Upload failed:', error);
    logoStatus.value = `업로드 실패: ${error.response?.data?.message || error.message}`;
  }
};
</script>

<style scoped>
.photo-manager {
  margin: 2rem 0;
  padding: 1.5rem;
  background: #f9f9f9;
  border-radius: 8px;
  border: 2px dashed #4a7c59;
}

.manager-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.manager-header h3 {
  margin: 0;
  color: #4a1f2f;
}

.btn-toggle {
  padding: 0.5rem 1rem;
  background: #4a7c59;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
}

.btn-toggle:hover {
  background: #3d6849;
}

.manager-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.upload-section {
  padding: 1rem;
  background: white;
  border-radius: 6px;
}

.upload-section h4 {
  margin: 0 0 1rem 0;
  color: #333;
}

.photo-controls {
  display: flex;
  gap: 1.5rem;
  align-items: flex-start;
}

.current-photo {
  width: 200px;
  height: 150px;
  border: 2px solid #ddd;
  border-radius: 6px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
}

.current-photo img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.no-photo {
  color: #999;
  font-size: 0.9rem;
}

.upload-actions {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.btn-upload {
  padding: 0.75rem 1.5rem;
  background: #4a7c59;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  font-size: 0.95rem;
}

.btn-upload:hover {
  background: #3d6849;
}

.status-message {
  margin: 0;
  font-size: 0.85rem;
  color: #666;
  min-height: 1.2rem;
}

@media (max-width: 768px) {
  .photo-controls {
    flex-direction: column;
  }

  .current-photo {
    width: 100%;
  }
}
</style>
