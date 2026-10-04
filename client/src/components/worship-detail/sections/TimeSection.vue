<script setup lang="ts">
import type { Worship } from "@/api/worship";
defineProps<{ worship: Worship; editMode: boolean; editForm: Record<string, string> }>();
</script>

<template>
  <div v-if="worship.entry_time || worship.start_time || editMode" class="time-section">
    <h2 class="section-subtitle">⏰ 시간 안내</h2>
    <div class="time-info">
      <div class="time-item">
        <span class="time-label">예배당 입장 시간</span>
        <input v-if="editMode" v-model="editForm.entry_time" type="text" class="edit-input" placeholder="예: 18시 30분" />
        <span v-else class="time-value">{{ worship.entry_time }}</span>
      </div>
      <div class="time-item">
        <span class="time-label">예배 시작</span>
        <input v-if="editMode" v-model="editForm.start_time" type="text" class="edit-input" placeholder="예: 19시 00분" />
        <span v-else class="time-value">{{ worship.start_time }}</span>
      </div>
    </div>
  </div>
</template>
