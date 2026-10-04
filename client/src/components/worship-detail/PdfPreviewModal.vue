<script setup lang="ts">
defineProps<{ show: boolean; pdfUrl: string }>();
const emit = defineEmits<{ close: [] }>();
</script>

<template>
  <div v-if="show" class="pdf-preview-modal" @click="emit('close')">
    <div class="pdf-preview-content" @click.stop>
      <button class="pdf-preview-close" @click="emit('close')">×</button>
      <iframe :src="pdfUrl" class="pdf-preview-iframe"></iframe>
    </div>
  </div>
</template>
