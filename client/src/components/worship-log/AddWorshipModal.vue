<script setup lang="ts">
import { ref, watch } from "vue";

defineProps<{ show: boolean; loading: boolean }>();
const emit = defineEmits<{ close: []; submit: [data: Record<string, unknown>] }>();

const form = ref({
  date: "", year: new Date().getFullYear(), title: "",
  preacher: "", worship_team: "OBED Worship", guest: "", description: "",
});

watch(() => form.value.date, (date) => {
  if (date) form.value.year = parseInt(date.split("-")[0]);
});

const reset = () => {
  form.value = { date: "", year: new Date().getFullYear(), title: "", preacher: "", worship_team: "OBED Worship", guest: "", description: "" };
};

const handleSubmit = () => {
  if (!form.value.title || !form.value.date || !form.value.preacher || !form.value.description) {
    alert("필수 항목을 입력해주세요"); return;
  }
  emit("submit", { ...form.value });
  reset();
};

const handleClose = () => { reset(); emit("close"); };
</script>

<template>
  <div v-if="show" class="panel">
    <h2 class="panel-title">새 집회 추가</h2>
    <form class="form-grid" @submit.prevent="handleSubmit">
      <label class="field">
        <span class="field-label">집회명</span>
        <input v-model="form.title" type="text" placeholder="예: 샬롬" required />
      </label>
      <label class="field">
        <span class="field-label">날짜</span>
        <input v-model="form.date" type="date" required />
      </label>
      <label class="field">
        <span class="field-label">설교자</span>
        <input v-model="form.preacher" type="text" placeholder="예: 박훈 목사" required />
      </label>
      <label class="field">
        <span class="field-label">찬양팀</span>
        <input v-model="form.worship_team" type="text" placeholder="예: OBED Worship" required />
      </label>
      <label class="field">
        <span class="field-label">초청 간사 (선택)</span>
        <input v-model="form.guest" type="text" placeholder="예: 찬양사역자 오은" />
      </label>
      <label class="field field--full">
        <span class="field-label">집회 설명</span>
        <textarea v-model="form.description" rows="3" placeholder="집회에 대한 간단한 설명을 입력하세요" required></textarea>
      </label>
      <div class="form-actions">
        <button class="btn" type="button" @click="handleClose">취소</button>
        <button class="btn primary" type="submit" :disabled="loading">추가</button>
      </div>
    </form>
    <p class="panel-hint">※ 집회 추가 후 상세 페이지에서 추가 정보를 입력할 수 있습니다.</p>
  </div>
</template>
