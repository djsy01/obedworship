<script setup lang="ts">
import { ref } from "vue";
import { useAuth } from "@/composables/useAuth";
import { useScores } from "@/composables/useScores";
import type { Score } from "@/api/scores";
import ScoreForm from "@/components/scores/ScoreForm.vue";
import ScoreList from "@/components/scores/ScoreList.vue";
import ScoreFilters from "@/components/scores/ScoreFilters.vue";
import ScorePagination from "@/components/scores/ScorePagination.vue";
import "../styles/Scores.css";

const { isAdmin, isLoggedIn } = useAuth();
const { keyword, selectedKey, sortBy, loading, paginated, total, page, totalPages, reload } = useScores();
const adding = ref(false);
const editing = ref<Score>();
function startEdit(score: Score) {
  adding.value = false;
  editing.value = score;
}
function closeForm() {
  editing.value = undefined;
  adding.value = false;
}
</script>

<template>
  <div class="page">
    <section class="section">
      <div class="section-header">
        <div>
          <h1 class="section-title">악보</h1>
          <p class="section-subtitle">OBED Worship에서 자작곡 및 편곡한 곡들의 악보를 다운로드할 수 있습니다.</p>
        </div>
        <button v-if="isAdmin" class="btn primary" type="button"
          @click="adding ? closeForm() : (editing = undefined, adding = true)">
          {{ adding ? "추가 취소" : "악보 추가" }}
        </button>
      </div>
      <ScoreForm v-if="isAdmin && (adding || editing)" :key="editing?.id ?? 'new'" :score="editing"
        @cancel="closeForm" @saved="closeForm(); reload()" />
      <ScoreFilters v-model:keyword="keyword" v-model:selected-key="selectedKey" v-model:sort-by="sortBy" :total="total" />
      <div v-if="loading" class="loading"><div class="loading-spinner"></div><p>불러오는 중...</p></div>
      <ScoreList :scores="paginated" :is-admin="isAdmin" :signed-in="isLoggedIn" @edit="startEdit" @deleted="reload" />
      <ScorePagination v-model="page" :total-pages="totalPages" />
    </section>
  </div>
</template>
