<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useTicketForm, ticketPrices } from "@/composables/useTicketForm";
import type { Ticket } from "@/api/tickets";

const { ticket } = defineProps<{ ticket?: Ticket }>();
const emit = defineEmits<{ saved: []; cancel: [] }>();
const { fields, worships, worshipId, loadWorships, selectWorship, poster, saving, save } = useTicketForm(ticket);
const file = ref<File>();
onMounted(() => { if (!ticket) loadWorships(); });
async function submit() {
  if (await save(file.value)) emit("saved");
}
</script>

<template>
  <div class="panel">
    <h2 class="panel-title">{{ ticket ? "집회 수정" : "새 집회 추가" }}</h2>
    <form class="form-grid" @submit.prevent="submit">
      <label v-if="!ticket" class="field field--full">집회 안내에서 불러오기 (선택)
        <select v-model="worshipId" @change="selectWorship">
          <option :value="undefined">직접 입력</option>
          <option v-for="worship in worships" :key="worship.id" :value="worship.id">
            {{ worship.title }} ({{ worship.date }})
          </option>
        </select>
      </label>
      <label class="field">집회명 <input v-model="fields.title" required /></label>
      <label class="field">날짜 <input v-model="fields.date" required /></label>
      <label class="field">연도 <input v-model.number="fields.year" type="number" required /></label>
      <label class="field">장소 <input v-model="fields.place" required /></label>
      <label class="field">설교자 <input v-model="fields.preacher" required /></label>
      <label class="field field--full">집회 설명 <textarea v-model="fields.description" rows="3" required /></label>
      <label v-for="price in ticketPrices" :key="price.key" class="field">{{ price.label }} 가격
        <input v-model.number="fields[price.key]" type="number" min="0" required />
      </label>
      <label class="field field--full">포스터 이미지
        <div v-if="poster" class="poster-preview"><img :src="poster" alt="기존 포스터" /></div>
        <input type="file" accept="image/*" @change="file = ($event.target as HTMLInputElement).files?.[0]" />
      </label>
      <label class="field">상태
        <select v-model="fields.status" required>
          <option value="OPEN">예매 중</option>
          <option value="CLOSED">마감</option>
          <option value="CANCELED">취소</option>
        </select>
      </label>
      <div class="form-actions">
        <button class="btn" type="button" @click="emit('cancel')">취소</button>
        <button class="btn primary" type="submit" :disabled="saving">저장</button>
      </div>
    </form>
  </div>
</template>
