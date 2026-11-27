<script setup lang="ts">
import { ref } from "vue";
import type { UserProfile } from "@/api/mypage";
import { currentUser } from "@/composables/session";

const props = defineProps<{ profile: UserProfile | null }>();
const emit = defineEmits<{ close: []; save: [name: string, phone: string] }>();
const name = ref(props.profile?.name || currentUser.value?.name || "");
const phone = ref(props.profile?.phone || "");
const affiliation = ref(props.profile?.members?.[0]?.affiliation || "");
</script>

<template>
  <div class="modal-overlay" @click="emit('close')">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h2 class="modal-title">내 정보 수정</h2>
        <button class="modal-close" @click="emit('close')">✕</button>
      </div>
      <div class="modal-body">
        <form class="form-grid" @submit.prevent="emit('save', name, phone)">
          <label class="field field--full">
            <span class="field-label">이름</span>
            <input v-model="name" type="text" required />
          </label>
          <label class="field field--full">
            <span class="field-label">연락처</span>
            <input v-model="phone" type="tel" placeholder="010-0000-0000" />
          </label>
          <label class="field field--full">
            <span class="field-label">소속</span>
            <select v-model="affiliation">
              <option value="">선택하세요</option>
              <option v-for="group in ['중등부', '고등부', '청년부', '장년부']" :key="group">{{ group }}</option>
            </select>
          </label>
          <div class="form-actions">
            <button class="btn" type="button" @click="emit('close')">취소</button>
            <button class="btn primary" type="submit">저장</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
