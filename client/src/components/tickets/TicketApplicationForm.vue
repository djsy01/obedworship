<script setup lang="ts">
import type { Ticket } from "@/api/tickets";
import { useTicketApplication } from "@/composables/useTicketApplication";
import { ticketPrices } from "@/composables/useTicketForm";

const { ticket } = defineProps<{ ticket: Ticket }>();
const emit = defineEmits<{ close: [] }>();
const { profile, quantities, total, amount, note, agreed, saving, submit } =
  useTicketApplication(ticket, () => emit("close"));
</script>

<template>
  <div class="modal-overlay" @click.self="emit('close')">
    <div class="modal-content application-modal">
      <div class="modal-header">
        <h2 class="modal-title">집회 신청 - {{ ticket.title }}</h2>
        <button class="modal-close" @click="emit('close')">✕</button>
      </div>
      <form class="modal-body" @submit.prevent="submit">
        <div class="user-info-section">
          <h3 class="section-subtitle-small">신청자 정보</h3>
          <p>{{ profile?.name }} {{ profile?.email }}</p>
        </div>
        <div class="ticket-selection-section">
          <h3 class="section-subtitle-small">티켓 수량 선택</h3>
          <div v-for="price in ticketPrices" :key="price.key" class="ticket-type-item">
            <label class="ticket-type-info" :for="price.key">
              <span class="type-name">{{ price.label }}</span>
              <span class="type-price">{{ ticket[price.key] ? ticket[price.key]?.toLocaleString() + '원' : '무료' }}</span>
              <span class="type-desc">{{ price.description }}</span>
            </label>
            <input :id="price.key" v-model.number="quantities[price.key]" type="number"
              min="0" max="20" required class="ticket-input" />
          </div>
        </div>
        <div class="total-section">총 {{ total }}장 · {{ amount.toLocaleString() }}원</div>
        <label class="field">특이사항 (선택) <textarea v-model="note" rows="3" /></label>
        <label class="privacy-checkbox">
          <input v-model="agreed" type="checkbox" required /> 개인정보 수집 및 이용에 동의합니다
        </label>
        <button type="submit" class="btn primary submit-application-btn" :disabled="!profile || !agreed || !total || saving">
          {{ saving ? "신청 중" : "신청 완료" }}
        </button>
      </form>
    </div>
  </div>
</template>
