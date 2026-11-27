<script setup lang="ts">
import { ticketApi, type Ticket } from "@/api/tickets";
import { toAbsoluteFileUrl } from "@/config/env";

const { ticket } = defineProps<{ ticket: Ticket; isAdmin: boolean }>();
const emit = defineEmits<{ edit: []; apply: []; changed: [] }>();
const labels = { OPEN: "신청 중", CLOSED: "마감", CANCELED: "취소" };
async function change(action: "close" | "delete") {
  const label = action === "close" ? "마감" : "삭제";
  if (!confirm("이 집회를 " + label + "하시겠습니까?")) return;
  try {
    await ticketApi[action](ticket.id);
    emit("changed");
  } catch {
    alert("집회 " + label + "에 실패했습니다.");
  }
}
</script>

<template>
  <article class="ticket-card" :class="{ 'ticket-closed': ticket.status !== 'OPEN' }">
    <div v-if="ticket.poster_url" class="ticket-poster">
      <img :src="toAbsoluteFileUrl(ticket.poster_url)" :alt="ticket.title + ' 포스터'" />
    </div>
    <div class="ticket-content">
      <div class="ticket-header">
        <span class="ticket-status" :data-status="ticket.status">{{ labels[ticket.status] }}</span>
        <p class="ticket-date">{{ ticket.date }}</p>
      </div>
      <h2 class="ticket-title">{{ ticket.title }}</h2>
      <p class="ticket-meta">
        <span class="meta-item"><span class="meta-icon">📍</span>{{ ticket.place }}</span>
        <span class="meta-item"><span class="meta-icon">🎤</span>{{ ticket.preacher }}</span>
      </p>
      <p class="ticket-description">{{ ticket.description }}</p>
      <div v-if="isAdmin" class="admin-actions">
        <button class="btn small" @click="emit('edit')">✏️ 수정</button>
        <button class="btn small" @click="change('close')">✅ 마감</button>
        <button class="btn small danger" @click="change('delete')">🗑️ 삭제</button>
      </div>
      <div class="ticket-actions">
        <button v-if="ticket.status === 'OPEN'" class="btn primary apply-btn" @click="emit('apply')">신청하기</button>
        <button v-else disabled class="btn disabled apply-btn">{{ labels[ticket.status] }}</button>
      </div>
    </div>
  </article>
</template>
