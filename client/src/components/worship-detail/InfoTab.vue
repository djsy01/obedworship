<script setup lang="ts">
import type { Worship } from "@/api/worship";
import PosterSection from "./sections/PosterSection.vue";
import TimeSection from "./sections/TimeSection.vue";
import VideoSection from "./sections/VideoSection.vue";
import LocationSection from "./sections/LocationSection.vue";
import SongsSection from "./sections/SongsSection.vue";

defineProps<{ worship: Worship; editMode: boolean; editForm: Record<string, string> }>();
const emit = defineEmits<{
  'upload-poster': []; 'remove-poster': []; 'open-poster-fullscreen': [];
}>();
</script>

<template>
  <div class="detail-content">
    <PosterSection
      :worship="worship" :edit-mode="editMode"
      @upload-poster="emit('upload-poster')"
      @remove-poster="emit('remove-poster')"
      @open-fullscreen="emit('open-poster-fullscreen')"
    />

    <div v-if="worship.comments || editMode" class="info-section">
      <h2 class="section-subtitle">🙏 예배 안내</h2>
      <textarea v-if="editMode" v-model="editForm.comments" class="edit-textarea" rows="3" placeholder="예배 안내 내용을 입력하세요"></textarea>
      <p v-else class="worship-info-text">{{ worship.comments }}</p>
    </div>

    <TimeSection :worship="worship" :edit-mode="editMode" :edit-form="editForm" />

    <VideoSection :worship="worship" :edit-mode="editMode" :edit-form="editForm" field-key="promo_video" label="🎶 홍보영상" />

    <LocationSection :worship="worship" :edit-mode="editMode" :edit-form="editForm" />

    <div v-if="worship.parking || editMode" class="parking-section">
      <h2 class="section-subtitle">🚙 주차 안내</h2>
      <textarea v-if="editMode" v-model="editForm.parking" class="edit-textarea" rows="2" placeholder="주차 안내 내용을 입력하세요"></textarea>
      <p v-else class="parking-text">{{ worship.parking }}</p>
    </div>

    <div v-if="worship.seating || editMode" class="seating-section">
      <h2 class="section-subtitle">🪑 자리 안내</h2>
      <textarea v-if="editMode" v-model="editForm.seating" class="edit-textarea" rows="2" placeholder="자리 안내 내용을 입력하세요"></textarea>
      <p v-else class="seating-text">{{ worship.seating }}</p>
    </div>

    <SongsSection :worship="worship" :edit-mode="editMode" :edit-form="editForm" />
  </div>
</template>
