<script setup lang="ts">
defineProps<{ show: boolean; src: string; alt?: string }>();
const emit = defineEmits<{ close: [] }>();
</script>

<template>
  <div v-if="show" class="fullscreen-modal" @click="emit('close')">
    <div class="fullscreen-content">
      <button class="fullscreen-close" @click="emit('close')">✕</button>
      <img :src="src" :alt="alt || ''" class="fullscreen-image" />
    </div>
  </div>
</template>
