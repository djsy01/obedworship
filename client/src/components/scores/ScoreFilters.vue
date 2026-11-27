<script setup lang="ts">
import { scoreKeys } from "@/composables/useScores";

defineProps<{ total: number }>();
const keyword = defineModel<string>("keyword", { required: true });
const selectedKey = defineModel<string>("selectedKey", { required: true });
const sortBy = defineModel<string>("sortBy", { required: true });
</script>

<template>
  <div class="filters-container">
    <div class="filter-group">
      <label class="field field--inline">검색
        <input v-model="keyword" type="text" placeholder="곡 제목 검색" />
      </label>
      <label class="field field--inline">Key
        <select v-model="selectedKey">
          <option value="">전체</option>
          <option v-for="key in scoreKeys" :key="key">{{ key }}</option>
        </select>
      </label>
      <label class="field field--inline">정렬
        <select v-model="sortBy">
          <option value="title">제목순</option>
          <option value="bpm">BPM순</option>
          <option value="recent">최신순</option>
        </select>
      </label>
    </div>
    <div class="results-info">총 {{ total }}개의 악보</div>
  </div>
</template>
