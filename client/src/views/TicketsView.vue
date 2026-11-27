<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import type { Ticket } from "@/api/tickets";
import { useTickets } from "@/composables/useTickets";
import { useAuth } from "@/composables/useAuth";
import TicketForm from "@/components/tickets/TicketForm.vue";
import TicketCard from "@/components/tickets/TicketCard.vue";
import TicketApplicationForm from "@/components/tickets/TicketApplicationForm.vue";
import "../styles/Tickets.css";

const router = useRouter();
const { isAdmin, isLoggedIn } = useAuth();
const { tickets, error, loading, reload } = useTickets();
const target = ref<Ticket>();
const editing = ref<Ticket>();
const creating = ref(false);
function apply(ticket: Ticket) {
  if (!isLoggedIn.value) {
    alert("로그인이 필요한 서비스입니다.");
    router.push("/login");
    return;
  }
  target.value = ticket;
}
function closeForm() {
  creating.value = false;
  editing.value = undefined;
}
function edit(ticket: Ticket) {
  creating.value = false;
  editing.value = ticket;
}
</script>
<template>
  <div class="page">
    <section class="section">
      <div class="section-header">
        <div>
          <h1 class="section-title">집회 신청</h1>
          <p class="section-subtitle">다가오는 집회의 정보를 확인하고 신청하세요.</p>
        </div>
        <button v-if="isAdmin" class="btn primary" @click="editing = undefined; creating = true">+ 집회 추가</button>
      </div>
      <TicketForm v-if="isAdmin && (creating || editing)" :key="editing?.id ?? 'new'" :ticket="editing"
        @cancel="closeForm" @saved="closeForm(); reload()" />
      <div v-if="loading" class="loading">불러오는 중...</div>
      <div v-else-if="error" class="error">
        <p>집회 정보를 불러오지 못했습니다.</p>
        <button class="btn primary" @click="reload">다시 시도</button>
      </div>
      <div v-else class="tickets-grid">
        <TicketCard v-for="ticket in tickets" :key="ticket.id" :ticket="ticket" :is-admin="isAdmin"
          @edit="edit(ticket)" @apply="apply(ticket)" @changed="reload" />
        <p v-if="!tickets.length" class="empty-text">현재 신청 가능한 집회가 없습니다.</p>
      </div>
      <TicketApplicationForm v-if="target" :ticket="target" @close="target = undefined" />
    </section>
  </div>
</template>
