<script setup lang="ts">
import type { WorshipPhoto } from "@/api/worship-photos";
import type { WorshipVideo } from "@/api/worship-videos";
import { toAbsoluteFileUrl } from "@/config/env";
import { getYouTubeEmbedUrl } from "./youtube";

defineProps<{ videos: WorshipVideo[]; photos: WorshipPhoto[]; isAdmin: boolean; editMode: boolean }>();
const emit = defineEmits<{
  'add-video': []; 'delete-video': [id: number];
  'upload-photo': []; 'delete-photo': [id: number]; 'open-lightbox': [index: number];
}>();
</script>

<template>
  <div class="detail-content">
    <div v-if="isAdmin || videos.length" class="worship-video-section">
      <div class="section-header-with-action">
        <h2 class="section-subtitle">🎬 집회 영상</h2>
        <button v-if="editMode" class="btn small primary" @click="emit('add-video')">+ 영상 추가</button>
      </div>
      <div v-for="video in videos" :key="video.id" class="video-wrapper-with-delete">
        <button v-if="editMode" class="btn-delete-video" title="영상 삭제" @click="emit('delete-video', video.id)">🗑️</button>
        <div v-if="getYouTubeEmbedUrl(video.video_url)" class="video-embed">
          <iframe
            :src="getYouTubeEmbedUrl(video.video_url)"
            title="집회 영상"
            loading="lazy"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowfullscreen
          ></iframe>
        </div>
        <p v-else class="empty-message">영상을 표시할 수 없습니다.</p>
      </div>
      <p v-if="!videos.length" class="empty-message">아직 업로드된 영상이 없습니다.</p>
    </div>

    <div v-if="isAdmin || photos.length" class="photos-section">
      <div class="section-header-with-action">
        <h2 class="section-subtitle">📷 현장 사진</h2>
        <button v-if="editMode" class="btn small primary" @click="emit('upload-photo')">+ 사진 추가</button>
      </div>
      <div v-if="photos.length" class="photo-grid">
        <div v-for="(photo, index) in photos" :key="photo.id" class="photo-item">
          <button v-if="editMode" class="btn-delete-photo" title="사진 삭제" @click="emit('delete-photo', photo.id)">✕</button>
          <button class="photo-open" :disabled="editMode" @click="emit('open-lightbox', index)">
            <img :src="toAbsoluteFileUrl(photo.thumbnail_url || photo.photo_url)" :alt="`집회 사진 ${index + 1}`" loading="lazy" />
          </button>
        </div>
      </div>
      <p v-else class="empty-message">아직 업로드된 사진이 없습니다.</p>
    </div>

    <div v-if="isAdmin && !videos.length && !photos.length" class="empty-gallery">
      <p>집회 영상과 사진은 집회 후 업데이트 예정입니다.</p>
    </div>
  </div>
</template>
