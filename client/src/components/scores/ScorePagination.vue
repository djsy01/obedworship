<script setup lang="ts">
const { totalPages } = defineProps<{ totalPages: number }>();
const page = defineModel<number>({ required: true });
const visible = (n: number) =>
  Math.abs(n - Math.min(Math.max(page.value, 3), Math.max(3, totalPages - 2))) < 3;
</script>

<template>
  <div v-if="totalPages > 1" class="pagination">
    <button class="pagination-btn" :disabled="page === 1" @click="page = 1">⟪</button>
    <button class="pagination-btn" :disabled="page === 1" @click="page--">‹</button>
    <button v-for="number in totalPages" v-show="visible(number)" :key="number" class="pagination-btn"
      :class="{ active: page === number }" @click="page = number">{{ number }}</button>
    <button class="pagination-btn" :disabled="page === totalPages" @click="page++">›</button>
    <button class="pagination-btn" :disabled="page === totalPages" @click="page = totalPages">⟫</button>
  </div>
</template>
