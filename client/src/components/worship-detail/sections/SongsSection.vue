<script setup lang="ts">
import type { Worship } from "@/api/worship";

defineProps<{ worship: Worship; editMode: boolean; editForm: Record<string, string> }>();

const getYouTubeEmbedUrl = (url: string) => {
  let id = "";
  if (url.includes("youtu.be/")) id = url.split("youtu.be/")[1].split("?")[0];
  else if (url.includes("watch?v=")) id = url.split("watch?v=")[1].split("&")[0];
  return `https://www.youtube.com/embed/${id}`;
};
</script>

<template>
  <div v-if="worship.opening_songs?.length || worship.celebration_songs?.length || worship.prelisten_video || editMode" class="songs-section">
    <h2 class="section-subtitle">🎵 미리듣기</h2>
    <p class="songs-intro">예배 전 충분히 듣고 익혀 오신다면, 당일 예배가 더욱 깊고 풍성하게 채워질 것입니다.</p>

    <div v-if="worship.opening_songs?.length || editMode" class="song-category">
      <h3 class="song-category-title">Opening Song</h3>
      <div v-if="editMode" class="edit-field">
        <textarea v-model="editForm.opening_songs_text" class="edit-textarea" rows="4" placeholder="곡 목록을 한 줄에 하나씩 입력하세요"></textarea>
      </div>
      <ol v-else class="song-list">
        <li v-for="(song, i) in worship.opening_songs" :key="i">{{ song }}</li>
      </ol>
    </div>

    <div v-if="worship.celebration_songs?.length || editMode" class="song-category">
      <h3 class="song-category-title">Celebration Song</h3>
      <div v-if="editMode" class="edit-field">
        <textarea v-model="editForm.celebration_songs_text" class="edit-textarea" rows="6" placeholder="곡 목록을 한 줄에 하나씩 입력하세요"></textarea>
      </div>
      <ol v-else class="song-list">
        <li v-for="(song, i) in worship.celebration_songs" :key="i">{{ song }}</li>
      </ol>
    </div>

    <div v-if="worship.prelisten_video || editMode" class="prelisten-video-section">
      <h3 v-if="editMode" class="song-category-title">미리듣기 영상</h3>
      <div v-if="editMode" class="edit-field">
        <input v-model="editForm.prelisten_video" type="text" class="edit-input" placeholder="미리듣기 YouTube 영상 URL을 입력하세요" />
      </div>
      <div v-if="worship.prelisten_video" class="video-embed">
        <iframe :src="getYouTubeEmbedUrl(worship.prelisten_video)" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
      </div>
    </div>
  </div>
</template>
