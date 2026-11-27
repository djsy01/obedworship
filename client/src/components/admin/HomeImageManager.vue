<script setup lang="ts">
import { onMounted, ref } from "vue";
import { isAxiosError } from "axios";
import { assetApi } from "@/api/assets";
import { toAbsoluteFileUrl } from "@/config/env";

const props = defineProps<{ title: string; assetKey: string; assetTitle: string; description: string; label: string; alt: string }>();
const input = ref<HTMLInputElement | null>(null);
const image = ref("");
const status = ref("");
onMounted(async () => {
  try { image.value = toAbsoluteFileUrl((await assetApi.getByKey(props.assetKey)).data.file_url); }
  catch { image.value = ""; }
});
async function upload(event: Event) {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;
  if (!file.type.startsWith("image/")) {
    status.value = "이미지 파일만 업로드 가능합니다.";
    target.value = "";
    return;
  }
  status.value = "업로드 중...";
  try {
    const { data } = await assetApi.uploadFile(file, props.assetKey, "home", props.assetTitle, props.description);
    image.value = toAbsoluteFileUrl(data.file_url);
    status.value = "업로드 완료! 페이지를 새로고침하세요.";
    setTimeout(() => { status.value = ""; }, 3000);
  } catch (error) {
    status.value = `업로드 실패: ${(isAxiosError(error) && error.response?.data?.message) || "다시 시도해주세요."}`;
  } finally {
    target.value = "";
  }
}
</script>

<template>
  <div class="upload-section">
    <h4>{{ title }}</h4>
    <div class="photo-controls">
      <div class="current-photo">
        <img v-if="image" :src="image" :alt="alt" />
        <div v-else class="no-photo">{{ label }} 없음</div>
      </div>
      <div class="upload-actions">
        <input ref="input" type="file" accept="image/*" hidden @change="upload" />
        <button class="btn-upload" @click="input?.click()">{{ label }} 변경</button>
        <p class="status-message">{{ status }}</p>
      </div>
    </div>
  </div>
</template>
