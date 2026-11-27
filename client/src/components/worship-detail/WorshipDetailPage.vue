<script setup lang="ts">
import { isAdmin } from "@/composables/session";
import { useWorshipDetail } from "./useWorshipDetail";
import WorshipHero from "./WorshipHero.vue";
import WorshipDetailTabs from "./WorshipDetailTabs.vue";
import WorshipDetailModals from "./WorshipDetailModals.vue";

const props = defineProps<{ id: number }>();
const detail = useWorshipDetail(props.id);
const { worship, editor } = detail;
const { form, editing } = editor;
</script>

<template>
  <div class="page">
    <section class="section">
      <div class="detail-header">
        <RouterLink class="btn ghost back-btn" :to="{ name: 'worship-log' }">← 목록으로</RouterLink>
        <button v-if="isAdmin && worship" class="btn primary edit-mode-btn" @click="editor.toggleEditing">
          {{ editing ? "💾 저장하기" : "✏️ 편집 모드" }}
        </button>
      </div>
      <div v-if="worship" class="detail-container">
        <WorshipHero :worship="worship" :edit-mode="isAdmin && editing" :edit-form="form" />
        <WorshipDetailTabs :worship="worship" :detail="detail" />
        <WorshipDetailModals :worship="worship" :detail="detail" />
      </div>
      <div v-else class="empty-container">
        <p class="empty-text">집회 정보를 찾을 수 없습니다.</p>
        <RouterLink class="btn primary" :to="{ name: 'worship-log' }">목록으로 돌아가기</RouterLink>
      </div>
    </section>
  </div>
</template>
