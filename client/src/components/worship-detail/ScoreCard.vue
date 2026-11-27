<script setup lang="ts">
import { computed } from "vue";
import type { Worship } from "@/api/worship";
import type { WorshipScore } from "@/api/worship-scores";
import { toAbsoluteFileUrl } from "@/config/env";

const props = defineProps<{ worship: Worship; score: WorshipScore; editMode: boolean; isLoggedIn: boolean }>();
const emit = defineEmits<{
  'delete-score': []; 'open-poster': [url: string]; 'preview-score': [score: WorshipScore]; 'download-score': [];
}>();
const posterUrl = computed(() => toAbsoluteFileUrl(props.score.thumbnail_url || props.worship.poster_url));
const uploadDate = computed(() => props.score.uploaded_at
  ? new Date(props.score.uploaded_at).toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" })
  : "—");
</script>

<template>
  <div class="score-single-container">
    <div class="score-single-card">
      <button v-if="editMode" class="btn-delete-score" title="악보 삭제" @click="emit('delete-score')">🗑️</button>
      <div class="score-preview-large">
        <button v-if="posterUrl" class="score-thumbnail" @click="emit('open-poster', posterUrl)">
          <img :src="posterUrl" :alt="worship.title + ' 포스터'" />
        </button>
        <div v-else class="score-placeholder-large">
          <div class="pdf-icon-large">📋</div>
          <p class="placeholder-title">악보 포스터</p>
          <p class="placeholder-subtitle">업로드된 포스터가 없습니다</p>
        </div>
      </div>
      <div class="score-info-large">
        <h3 class="score-title-main">{{ worship.title }} 집회 악보</h3>
        <p class="score-description">{{ score.description }}</p>
        <div class="score-details">
          <div class="score-detail-item">
            <span class="detail-label">파일명:</span>
            <span class="detail-value">{{ score.filename }}</span>
          </div>
          <div class="score-detail-item">
            <span class="detail-label">업로드:</span>
            <span class="detail-value">{{ uploadDate }}</span>
          </div>
        </div>
      </div>
      <div class="score-download-section">
        <button v-if="isLoggedIn" class="btn score-preview-button" type="button" @click="emit('preview-score', score)">
          악보 미리보기
        </button>
        <button class="btn primary download-btn-large" type="button" :disabled="!isLoggedIn" @click="emit('download-score')">
          <span class="download-icon">📥</span>
          {{ isLoggedIn ? "송폼 + 악보 다운로드" : "🔒 로그인이 필요합니다" }}
        </button>
        <p class="download-note">
          {{ isLoggedIn ? "PDF 파일에 송폼과 모든 악보가 포함되어 있습니다." : "로그인 후 다운로드할 수 있습니다." }}
        </p>
      </div>
    </div>
  </div>
</template>
