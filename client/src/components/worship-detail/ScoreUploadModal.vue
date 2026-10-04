<script setup lang="ts">
import { ref } from "vue";

defineProps<{ show: boolean; uploading: boolean }>();
const emit = defineEmits<{ close: []; upload: [file: File, description: string] }>();

const selectedFile = ref<File | null>(null);
const description = ref("");
const fileInput = ref<HTMLInputElement | null>(null);

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024, sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

const handleFileSelect = (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (!file) return;
  if (file.type !== "application/pdf") { alert("PDF 파일만 업로드할 수 있습니다."); (event.target as HTMLInputElement).value = ""; return; }
  if (file.size > 10 * 1024 * 1024) { alert("파일 크기는 10MB를 초과할 수 없습니다."); (event.target as HTMLInputElement).value = ""; return; }
  selectedFile.value = file;
};

const handleClose = () => { selectedFile.value = null; description.value = ""; if (fileInput.value) fileInput.value.value = ""; emit("close"); };
const handleUpload = () => { if (selectedFile.value) emit("upload", selectedFile.value, description.value); };
</script>

<template>
  <div v-if="show" class="modal-overlay" @click="handleClose">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h2>악보 업로드</h2>
        <button class="modal-close" @click="handleClose">×</button>
      </div>
      <div class="modal-body">
        <div class="upload-form">
          <div class="form-group">
            <label>PDF 파일 선택</label>
            <input ref="fileInput" type="file" accept="application/pdf" @change="handleFileSelect" />
            <p class="form-hint">PDF 파일만 업로드 가능합니다. (최대 10MB)</p>
          </div>
          <div v-if="selectedFile" class="selected-file-info">
            <p><strong>선택된 파일:</strong> {{ selectedFile.name }}</p>
            <p><strong>파일 크기:</strong> {{ formatFileSize(selectedFile.size) }}</p>
          </div>
          <div class="form-group">
            <label>설명 (선택사항)</label>
            <textarea v-model="description" rows="3" placeholder="악보에 대한 설명을 입력하세요"></textarea>
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn ghost" @click="handleClose">취소</button>
        <button class="btn primary" @click="handleUpload" :disabled="!selectedFile || uploading">
          {{ uploading ? "업로드 중..." : "업로드" }}
        </button>
      </div>
    </div>
  </div>
</template>
