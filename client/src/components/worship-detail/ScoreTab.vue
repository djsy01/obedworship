<script setup lang="ts">
import type { Worship } from "@/api/worship";
import type { WorshipScore } from "@/api/worship-scores";
import ScoreCard from "./ScoreCard.vue";

defineProps<{
  worship: Worship; score?: WorshipScore; excludedSongsText: string;
  isAdmin: boolean; editMode: boolean; isLoggedIn: boolean;
}>();
const emit = defineEmits<{
  'update:excluded-songs-text': [text: string];
  'upload-score': []; 'upload-thumbnail': []; 'delete-score': [];
  'open-poster': [url: string]; 'preview-score': [score: WorshipScore]; 'download-score': [];
}>();
</script>

<template>
  <div class="detail-content">
    <div class="scores-section">
      <div class="section-header-with-action">
        <h2 class="section-subtitle">🎼 집회 악보</h2>
        <div v-if="editMode" class="score-actions">
          <button class="btn small primary" @click="emit('upload-score')">악보 업로드</button>
          <button v-if="score" class="btn small" @click="emit('upload-thumbnail')">악보 포스터 업로드</button>
        </div>
      </div>
      <p class="scores-intro">
        이 집회의 <strong>송폼(세트리스트)</strong>과 <strong>전체 악보</strong>가 포함된 PDF 파일입니다.<br />
        로그인 후 다운로드하여 사용하실 수 있습니다.
      </p>
      <label v-if="editMode" class="excluded-songs-edit">
        저작권 제외 곡 (한 줄에 하나씩)
        <textarea
          :value="excludedSongsText" class="edit-textarea" rows="3"
          placeholder="저작권 문제로 악보에 포함되지 않는 곡들을 한 줄에 하나씩 입력하세요"
          @input="emit('update:excluded-songs-text', ($event.target as HTMLTextAreaElement).value)"
        ></textarea>
      </label>
      <span v-else class="warning-song">
        저작권 문제로 인해, 다음 곡들은 악보에 포함되어 있지 않습니다:
        {{ worship.excluded_songs?.join(", ") || "해당 없음" }}
      </span>
      <ScoreCard
        v-if="score" :worship="worship" :score="score" :edit-mode="editMode" :is-logged-in="isLoggedIn"
        @delete-score="emit('delete-score')" @open-poster="emit('open-poster', $event)"
        @preview-score="emit('preview-score', $event)" @download-score="emit('download-score')"
      />
      <div v-else-if="isAdmin" class="score-empty-state">
        <div class="empty-icon">📋</div>
        <h3>아직 업로드된 악보가 없습니다</h3>
        <p>집회 후 송폼과 악보가 업데이트 예정입니다.</p>
        <button v-if="editMode" class="btn primary" @click="emit('upload-score')">+ 악보 업로드</button>
      </div>
    </div>
  </div>
</template>
