<script setup lang="ts">
defineProps<{ visible: boolean; x: number; y: number; badges: string[]; type: string }>();
</script>

<template>
  <Teleport to="body">
    <div
      v-if="visible"
      class="position-badge-tooltip-fixed"
      :style="{ left: x + 'px', top: y + 'px' }"
    >
      <span v-for="pos in badges" :key="pos" :class="['position-badge', type]">{{ pos }}</span>
    </div>
  </Teleport>
</template>
