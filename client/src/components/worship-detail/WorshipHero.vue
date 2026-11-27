<script setup lang="ts">
import type { Worship } from "@/api/worship";

defineProps<{ worship: Worship; editMode: boolean; editForm: Record<string, string> }>();
function formatDateWithDay(value: string) {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const date = new Date(value.slice(0, 10) + "T00:00:00");
  return `${date.toLocaleDateString("ko-KR")} (${days[date.getDay()]})`;
}
</script>

<template>
    <div class="detail-hero">
      <p class="detail-date">{{ formatDateWithDay(worship.date) }}</p>
      <h1 class="detail-title">
        <input v-if="editMode" v-model="editForm.title" type="text" />
        <span v-else>{{ worship.title }}</span>
      </h1>
      <div class="hero-info">
        <div class="hero-info-item">
          <span class="hero-info-label">설교자</span>
          <span v-if="editMode" class="hero-info-value"><input v-model="editForm.preacher" type="text" /></span>
          <span v-else class="hero-info-value">{{ worship.preacher }}</span>
        </div>
        <div class="hero-info-item">
          <span class="hero-info-label">찬양팀</span>
          <span v-if="editMode" class="hero-info-value"><input v-model="editForm.worship_team" type="text" /></span>
          <span v-else class="hero-info-value">{{ worship.worship_team }}</span>
        </div>
        <div v-if="worship.guest || editMode" class="hero-info-item">
          <span class="hero-info-label">초청 간사</span>
          <span v-if="editMode" class="hero-info-value"><input v-model="editForm.guest" type="text" /></span>
          <span v-else class="hero-info-value">{{ worship.guest }}</span>
        </div>
      </div>
      <p v-if="editMode" class="hero-description"><textarea v-model="editForm.description" rows="3"></textarea></p>
      <p v-else class="hero-description">{{ worship.description }}</p>
    </div>
</template>
