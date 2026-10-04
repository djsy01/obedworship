<script setup lang="ts">
import type { Worship } from "@/api/worship";
defineProps<{ worship: Worship; editMode: boolean; editForm: Record<string, string> }>();
</script>

<template>
  <div v-if="worship.location || editMode" class="location-section">
    <h2 class="section-subtitle">⛪ 장소 안내</h2>
    <div class="location-info">
      <input v-if="editMode" v-model="editForm.location" type="text" class="edit-input" placeholder="장소를 입력하세요" />
      <p v-else class="location-text">{{ worship.location }}</p>
      <div v-if="editMode" class="edit-field" style="margin-top: 0.5rem">
        <input v-model="editForm.location_link" type="text" class="edit-input" placeholder="지도 링크 (Google Maps embed URL)" />
      </div>
      <div v-if="worship.location_link && !editMode" class="map-embed">
        <iframe :src="worship.location_link" frameborder="0" allowfullscreen loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
      </div>
    </div>
  </div>
</template>
