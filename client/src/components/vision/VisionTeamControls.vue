<script setup lang="ts">
import { isAdmin, staffRoleLabel } from "@/composables/session";

const enabled = defineModel<boolean>("enabled", { required: true });
const emit = defineEmits<{ add: [] }>();
</script>

<template>
  <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem">
    <h2 class="section-title-sub">팀원 소개</h2>
    <button v-if="isAdmin" class="btn small admin-toggle" @click="enabled = !enabled">
      {{ enabled ? "👤" : "🔒" }} {{ staffRoleLabel }} 모드 {{ enabled ? "OFF" : "ON" }}
    </button>
  </div>
  <div v-if="isAdmin && enabled" style="margin-bottom:1rem">
    <button
      style="padding:0.75rem 1.5rem;background:#4caf50;color:white;border:none;border-radius:4px;cursor:pointer;font-weight:bold;font-size:1rem"
      @click="emit('add')"
    >➕ 새 멤버 추가</button>
  </div>
</template>
