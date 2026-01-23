<template>
  <div v-if="isOpen" class="modal-overlay" @click.self="closeModal">
    <div class="modal-content">
      <div class="modal-header">
        <h2>{{ member ? '멤버 수정' : '새 멤버 추가' }}</h2>
        <button class="close-btn" @click="closeModal">×</button>
      </div>

      <form @submit.prevent="handleSubmit" class="modal-form">
        <!-- 기본 정보 -->
        <div class="form-section">
          <h3>기본 정보</h3>

          <div class="form-group">
            <label for="name">이름 <span class="required">*</span></label>
            <input
              id="name"
              v-model="formData.name"
              type="text"
              required
              placeholder="홍길동"
            />
          </div>

          <div class="form-group">
            <label for="affiliation">소속 <span class="required">*</span></label>
            <select id="affiliation" v-model="formData.affiliation" required>
              <option value="">선택하세요</option>
              <option value="목사">목사</option>
              <option value="장로">장로</option>
              <option value="집사">집사</option>
              <option value="장년부">장년부</option>
              <option value="청년부">청년부</option>
              <option value="고등부">고등부</option>
              <option value="중등부">중등부</option>
            </select>
          </div>

          <div class="form-group">
            <label for="description">소개/설명</label>
            <textarea
              id="description"
              v-model="formData.description"
              rows="3"
              placeholder="멤버에 대한 간단한 소개를 입력하세요"
            ></textarea>
          </div>
        </div>

        <!-- 사진 업로드 -->
        <div class="form-section">
          <h3>사진</h3>

          <div class="photo-upload">
            <div class="photo-preview">
              <img
                v-if="photoPreview || formData.photo_url"
                :src="photoPreview || formData.photo_url"
                alt="미리보기"
              />
              <div v-else class="no-photo">사진 없음</div>
            </div>

            <div class="photo-controls">
              <input
                type="file"
                ref="fileInput"
                @change="handleFileChange"
                accept="image/*"
                style="display: none"
              />
              <button type="button" class="btn-upload" @click="$refs.fileInput.click()">
                {{ photoFile ? '사진 변경' : '사진 선택' }}
              </button>
              <button
                v-if="photoFile || formData.photo_url"
                type="button"
                class="btn-remove"
                @click="removePhoto"
              >
                사진 제거
              </button>
              <p class="upload-info">{{ uploadMessage }}</p>
            </div>
          </div>
        </div>

        <!-- SNS 링크 -->
        <div class="form-section">
          <h3>SNS 링크</h3>

          <div class="form-group">
            <label for="instagram">Instagram URL</label>
            <input
              id="instagram"
              v-model="formData.instagram_url"
              type="url"
              placeholder="https://instagram.com/username"
            />
          </div>

          <div class="form-group">
            <label for="youtube">YouTube URL</label>
            <input
              id="youtube"
              v-model="formData.youtube_url"
              type="url"
              placeholder="https://youtube.com/@username"
            />
          </div>
        </div>

        <!-- 역할 (Roles) -->
        <div class="form-section">
          <h3>역할 (Roles)</h3>
          <div class="checkbox-grid">
            <label
              v-for="role in roleOptions"
              :key="role"
              class="checkbox-label"
            >
              <input
                type="checkbox"
                :value="role"
                v-model="selectedRoles"
              />
              <span>{{ role }}</span>
            </label>
          </div>
        </div>

        <!-- Worship 포지션 -->
        <div class="form-section">
          <h3>Worship 포지션</h3>
          <div class="checkbox-grid">
            <label
              v-for="position in worshipPositionOptions"
              :key="position"
              class="checkbox-label"
            >
              <input
                type="checkbox"
                :value="position"
                v-model="selectedWorshipPositions"
              />
              <span>{{ position }}</span>
            </label>
          </div>
        </div>

        <!-- Step 포지션 -->
        <div class="form-section">
          <h3>Step 포지션</h3>
          <div class="checkbox-grid">
            <label
              v-for="position in stepPositionOptions"
              :key="position"
              class="checkbox-label"
            >
              <input
                type="checkbox"
                :value="position"
                v-model="selectedStepPositions"
              />
              <span>{{ position }}</span>
            </label>
          </div>
        </div>

        <!-- 추가 설정 -->
        <div class="form-section">
          <h3>추가 설정</h3>

          <div class="form-group">
            <label class="checkbox-label">
              <input type="checkbox" v-model="formData.is_active" />
              <span>활성 상태</span>
            </label>
          </div>
        </div>

        <!-- 버튼 -->
        <div class="modal-actions">
          <button type="button" class="btn-cancel" @click="closeModal">
            취소
          </button>
          <button type="submit" class="btn-submit" :disabled="isSubmitting">
            {{ isSubmitting ? '저장 중...' : (member ? '수정하기' : '추가하기') }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { memberApi, type Member } from '@/api/members';

interface Props {
  isOpen: boolean;
  member?: Member | null;
}

interface Emits {
  (e: 'close'): void;
  (e: 'success'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

// Role options from enum
const roleOptions = [
  'Pastor',
  'Elder',
  'Worship Team Leader',
  'Accounting Leader',
  'Lead Singer',
  'Singer Leader',
  'Session Leader',
  'Planning Leader',
  'Media Leader',
  'Stage Leader',
  'Prayer Leader',
];

const worshipPositionOptions = [
  'Vocal',
  'Piano',
  'Synthesizer',
  'Acoustic Guitar',
  'Lead Guitar',
  'Backing Guitar',
  'Bass Guitar',
  'Drum',
];

const stepPositionOptions = [
  'Accounting Team',
  'Planning Team',
  'Instagram Manager',
  'Poster Designer',
  'Guidebook Designer',
  'Media Team',
  'Camera Operator',
  'Video Editor',
  'YouTube Manager',
  'Mix Engineer',
  'Master Engineer',
  'Music Producer',
  'Stage Team',
  'Stage Designer',
  'Live Engineer',
  'Lighting Operator',
  'Audio Setup',
  'Preproduction',
  'Prayer Team',
];

// Form data
const formData = ref({
  name: '',
  affiliation: '',
  description: '',
  photo_url: '',
  instagram_url: '',
  youtube_url: '',
  is_active: true,
  display_order: 0,
});

const selectedRoles = ref<string[]>([]);
const selectedWorshipPositions = ref<string[]>([]);
const selectedStepPositions = ref<string[]>([]);

const photoFile = ref<File | null>(null);
const photoPreview = ref<string>('');
const uploadMessage = ref<string>('');
const isSubmitting = ref(false);
const fileInput = ref<HTMLInputElement | null>(null);

// Convert enum underscores back to spaces for display
const convertFromEnum = (value: string) => value.replace(/_/g, ' ');

// Initialize form data when member changes
watch(() => props.member, (newMember) => {
  if (newMember) {
    formData.value = {
      name: newMember.name,
      affiliation: newMember.affiliation,
      description: newMember.description || '',
      photo_url: newMember.photo_url || '',
      instagram_url: newMember.instagram_url || '',
      youtube_url: newMember.youtube_url || '',
      is_active: newMember.is_active ?? true,
      display_order: newMember.display_order ?? 0,
    };

    // Set selected roles (convert underscores to spaces for UI)
    selectedRoles.value = newMember.member_roles?.map(r => convertFromEnum(r.role_type)) || [];
    selectedWorshipPositions.value = newMember.member_worship_positions?.map(p => convertFromEnum(p.position_type)) || [];
    selectedStepPositions.value = newMember.member_step_positions?.map(p => convertFromEnum(p.position_type)) || [];
  } else {
    // Reset form for new member
    formData.value = {
      name: '',
      affiliation: '',
      description: '',
      photo_url: '',
      instagram_url: '',
      youtube_url: '',
      is_active: true,
      display_order: 0,
    };
    selectedRoles.value = [];
    selectedWorshipPositions.value = [];
    selectedStepPositions.value = [];
  }

  photoFile.value = null;
  photoPreview.value = '';
  uploadMessage.value = '';
}, { immediate: true });

const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];

  if (file) {
    if (!file.type.startsWith('image/')) {
      uploadMessage.value = '이미지 파일만 업로드 가능합니다.';
      return;
    }

    photoFile.value = file;
    uploadMessage.value = `선택된 파일: ${file.name}`;

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      photoPreview.value = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }
};

const removePhoto = () => {
  photoFile.value = null;
  photoPreview.value = '';
  formData.value.photo_url = '';
  uploadMessage.value = '';
  if (fileInput.value) {
    fileInput.value.value = '';
  }
};

const closeModal = () => {
  emit('close');
};

const handleSubmit = async () => {
  isSubmitting.value = true;
  uploadMessage.value = '';

  try {
    let photoUrl = formData.value.photo_url;

    // 1. Upload photo if new photo is selected
    if (photoFile.value) {
      uploadMessage.value = '사진 업로드 중...';

      const uploadResponse = await memberApi.uploadPhoto(photoFile.value);
      photoUrl = uploadResponse.data.photo_url;

      uploadMessage.value = '사진 업로드 완료!';
    }

    // 2. Create or update member
    const memberData = {
      name: formData.value.name,
      affiliation: formData.value.affiliation,
      description: formData.value.description || undefined,
      photo_url: photoUrl || undefined,
      instagram_url: formData.value.instagram_url || undefined,
      youtube_url: formData.value.youtube_url || undefined,
      is_active: formData.value.is_active,
      display_order: formData.value.display_order,
    };

    let memberId: number;

    if (props.member) {
      // Update existing member
      uploadMessage.value = '멤버 정보 수정 중...';
      await memberApi.update(props.member.id, memberData);
      memberId = props.member.id;
    } else {
      // Create new member
      uploadMessage.value = '새 멤버 추가 중...';
      const response = await memberApi.create(memberData);
      memberId = response.data.id;
    }

    // 3. Update roles and positions (using member-roles API)
    uploadMessage.value = '역할 및 포지션 업데이트 중...';

    // Convert spaces to underscores for Prisma enum compatibility
    const convertToEnum = (value: string) => value.replace(/ /g, '_');

    // Update roles
    await memberApi.updateRoles(memberId, selectedRoles.value.map(convertToEnum));

    // Update worship positions
    await memberApi.updateWorshipPositions(memberId, selectedWorshipPositions.value.map(convertToEnum));

    // Update step positions
    await memberApi.updateStepPositions(memberId, selectedStepPositions.value.map(convertToEnum));

    uploadMessage.value = '완료!';

    setTimeout(() => {
      emit('success');
      closeModal();
    }, 500);
  } catch (error: any) {
    console.error('저장 실패:', error);
    uploadMessage.value = `오류: ${error.response?.data?.message || error.message}`;
    alert(`저장에 실패했습니다: ${error.response?.data?.message || error.message}`);
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  overflow-y: auto;
  padding: 2rem 1rem;
}

.modal-content {
  background: white;
  border-radius: 12px;
  max-width: 800px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem;
  border-bottom: 1px solid #e0e0e0;
  position: sticky;
  top: 0;
  background: white;
  z-index: 10;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.5rem;
  color: #333;
}

.close-btn {
  background: none;
  border: none;
  font-size: 2rem;
  cursor: pointer;
  color: #999;
  padding: 0;
  width: 32px;
  height: 32px;
  line-height: 1;
}

.close-btn:hover {
  color: #333;
}

.modal-form {
  padding: 2rem;
}

.form-section {
  margin-bottom: 2rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid #f0f0f0;
}

.form-section:last-of-type {
  border-bottom: none;
}

.form-section h3 {
  margin: 0 0 1rem 0;
  font-size: 1.1rem;
  color: #4a1f2f;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #333;
}

.required {
  color: #e74c3c;
}

.form-group input[type="text"],
.form-group input[type="url"],
.form-group input[type="number"],
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 1rem;
  font-family: inherit;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #4a7c59;
  box-shadow: 0 0 0 3px rgba(74, 124, 89, 0.1);
}

.photo-upload {
  display: flex;
  gap: 1.5rem;
  align-items: flex-start;
}

.photo-preview {
  width: 150px;
  height: 150px;
  border: 2px dashed #ddd;
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f9f9f9;
}

.photo-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.no-photo {
  color: #999;
  font-size: 0.9rem;
}

.photo-controls {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.btn-upload,
.btn-remove {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  font-size: 0.95rem;
  transition: all 0.2s;
}

.btn-upload {
  background: #4a7c59;
  color: white;
}

.btn-upload:hover {
  background: #3d6849;
}

.btn-remove {
  background: #e74c3c;
  color: white;
}

.btn-remove:hover {
  background: #c0392b;
}

.upload-info {
  margin: 0;
  font-size: 0.85rem;
  color: #666;
}

.checkbox-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 0.75rem;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 4px;
  transition: background 0.2s;
}

.checkbox-label:hover {
  background: #f5f5f5;
}

.checkbox-label input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.checkbox-label span {
  font-size: 0.95rem;
  color: #333;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e0e0e0;
}

.btn-cancel,
.btn-submit {
  padding: 0.75rem 2rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  font-size: 1rem;
  transition: all 0.2s;
}

.btn-cancel {
  background: #f0f0f0;
  color: #666;
}

.btn-cancel:hover {
  background: #e0e0e0;
}

.btn-submit {
  background: #4a7c59;
  color: white;
}

.btn-submit:hover:not(:disabled) {
  background: #3d6849;
}

.btn-submit:disabled {
  background: #ccc;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .modal-content {
    max-height: 95vh;
  }

  .modal-header {
    padding: 1rem 1.5rem;
  }

  .modal-form {
    padding: 1.5rem;
  }

  .photo-upload {
    flex-direction: column;
  }

  .checkbox-grid {
    grid-template-columns: 1fr;
  }

  .modal-actions {
    flex-direction: column-reverse;
  }

  .btn-cancel,
  .btn-submit {
    width: 100%;
  }
}
</style>
