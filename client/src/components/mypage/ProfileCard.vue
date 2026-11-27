<script setup lang="ts">
import { computed } from "vue";
import type { UserProfile } from "@/api/mypage";
import { currentUser } from "@/composables/session";

const props = defineProps<{ profile: UserProfile | null; roleLabel: string }>();
const emit = defineEmits<{ edit: []; password: [] }>();
const name = computed(() => props.profile?.name || currentUser.value?.name || "");
const details = computed(() => [
  { label: "이메일", value: props.profile?.email || currentUser.value?.email },
  { label: "연락처", value: props.profile?.phone || "미등록" },
  { label: "소속", value: props.profile?.members?.[0]?.affiliation || "미등록" },
  { label: "가입일", value: props.profile?.created_at && new Date(props.profile.created_at).toLocaleDateString("ko-KR") },
]);
</script>

<template>
  <div class="profile-card">
    <div class="profile-header">
      <div class="profile-avatar">{{ name.charAt(0) || "?" }}</div>
      <div class="profile-info">
        <h2 class="profile-name">{{ name }}</h2>
        <p class="profile-role">{{ roleLabel }}</p>
      </div>
    </div>
    <div class="profile-details">
      <div v-for="item in details" :key="item.label" class="detail-item">
        <span class="detail-label">{{ item.label }}</span>
        <span class="detail-value">{{ item.value }}</span>
      </div>
    </div>
    <div class="profile-actions">
      <button class="btn small" @click="emit('edit')">✏️ 정보 수정</button>
      <button class="btn small" @click="emit('password')">🔒 비밀번호 변경</button>
    </div>
  </div>
</template>
