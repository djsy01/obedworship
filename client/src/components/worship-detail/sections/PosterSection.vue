<script setup lang="ts">
import type { Worship } from "@/api/worship";
defineProps<{ worship: Worship; editMode: boolean }>();
const emit = defineEmits<{ 'upload-poster': []; 'remove-poster': []; 'open-fullscreen': [] }>();
</script>

<template>
  <div v-if="worship.poster_url || editMode" class="poster-section">
    <h2 class="section-subtitle">🖼️ 집회 포스터</h2>
    <div v-if="editMode" class="poster-edit-actions">
      <button class="btn small primary" @click="emit('upload-poster')">
        {{ worship.poster_url ? "포스터 변경" : "포스터 업로드" }}
      </button>
      <button v-if="worship.poster_url" class="btn small ghost" @click="emit('remove-poster')">포스터 삭제</button>
    </div>
    <div v-if="worship.poster_url && !editMode" class="poster-image clickable-poster" @click="emit('open-fullscreen')">
      <img :src="worship.poster_url" :alt="`${worship.title} 포스터`" />
      <div class="poster-overlay">
        <div class="poster-overlay-icon">🔍</div>
        <p>클릭하여 크게 보기</p>
      </div>
    </div>
    <div v-else-if="worship.poster_url && editMode" class="poster-preview">
      <img :src="worship.poster_url" :alt="`${worship.title} 포스터`" />
    </div>
  </div>
</template>
