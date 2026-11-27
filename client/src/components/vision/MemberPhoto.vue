<script setup lang="ts">
import { ref, watch } from "vue";
import api from "@/api/axios";
import { BASE_URL } from "@/config/env";

const props = defineProps<{ url: string; name: string; canPreview: boolean }>();
const source = ref("");
watch(() => [props.url, props.canPreview] as const, ([url, preview], _, cleanup) => {
  source.value = url;
  let objectUrl: string | undefined;
  let canceled = false;
  cleanup(() => {
    canceled = true;
    if (objectUrl) URL.revokeObjectURL(objectUrl);
  });
  if (!preview || !url.startsWith(BASE_URL.replace(/\/$/, "") + "/files/")) return;
  const path = url.match(/\/files\/[1-9]\d*$/)?.[0];
  if (!path) return;
  api.get<Blob>(path, { responseType: "blob" }).then(({ data }) => {
    if (canceled || !data.type.startsWith("image/")) return;
    objectUrl = URL.createObjectURL(data);
    source.value = objectUrl;
  }).catch(() => { if (!canceled) source.value = url; });
}, { immediate: true });
</script>

<template>
  <img :src="source" :alt="name" class="member-photo" />
</template>
