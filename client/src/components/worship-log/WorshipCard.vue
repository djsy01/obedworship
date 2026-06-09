<script setup lang="ts">
import type { Worship } from "@/api/worship";

defineProps<{ worship: Worship; isAdmin: boolean }>();
const emit = defineEmits<{ click: [id: number]; edit: [id: number]; delete: [id: number] }>();

const formatDateWithDay = (dateString: string): string => {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const date = new Date(dateString + "T00:00:00");
  return `${date.toLocaleDateString("ko-KR")} (${days[date.getDay()]})`;
};
</script>

<template>
  <article class="log-card" @click="emit('click', worship.id)">
    <p class="log-date">{{ formatDateWithDay(worship.date) }}</p>
    <h2 class="log-title">{{ worship.title }}</h2>
    <p class="log-meta">
      설교: {{ worship.preacher }} · 찬양: {{ worship.worship_team }}
      <template v-if="worship.guest && worship.guest.trim() !== ''">
        · 초청 간사: {{ worship.guest }}
      </template>
    </p>
    <p class="log-desc">{{ worship.description }}</p>
    <div v-if="isAdmin" class="admin-card-actions" @click.stop>
      <button class="btn-icon edit" @click="emit('edit', worship.id)" title="편집">✏️</button>
      <button class="btn-icon delete" @click="emit('delete', worship.id)" title="삭제">🗑️</button>
    </div>
    <div class="log-arrow"><span>자세히 보기 →</span></div>
  </article>
</template>
