<script setup lang="ts">
import type { Worship } from "@/api/worship";
defineProps<{ worship: Worship; editMode: boolean; editForm: Record<string, string>; fieldKey: string; label: string }>();

const getYouTubeEmbedUrl = (url: string) => {
  let id = "";
  if (url.includes("youtu.be/")) id = url.split("youtu.be/")[1].split("?")[0];
  else if (url.includes("watch?v=")) id = url.split("watch?v=")[1].split("&")[0];
  return `https://www.youtube.com/embed/${id}`;
};
</script>

<template>
  <div v-if="(worship as any)[fieldKey] || editMode" class="video-section">
    <h2 class="section-subtitle">{{ label }}</h2>
    <div v-if="editMode" class="edit-field">
      <input v-model="editForm[fieldKey]" type="text" class="edit-input" placeholder="YouTube 영상 URL을 입력하세요" />
    </div>
    <div v-if="(worship as any)[fieldKey]" class="video-embed">
      <iframe :src="getYouTubeEmbedUrl((worship as any)[fieldKey])" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
    </div>
  </div>
</template>
