<script setup lang="ts">
import { reactive, ref } from "vue";
import { scoreApi, type Score } from "@/api/scores";
import { scoreKeys } from "@/composables/useScores";

const props = defineProps<{ score?: Score }>();
const emit = defineEmits<{ cancel: []; saved: [] }>();
const { title = "", song_key = "", bpm = 0, category = "" } = props.score ?? {};
const fields = reactive({ title, song_key, bpm, category });
const original = ref(true);
const file = ref<File>();
const saving = ref(false);
async function save() {
  saving.value = true;
  try {
    if (props.score) {
      await scoreApi.update(props.score.id, fields);
    } else if (file.value) {
      const { data } = await scoreApi.upload(file.value);
      await scoreApi.create({ ...fields, file_url: data.url, filename: data.savedFilename, is_original: original.value });
    } else {
      alert("PDF 파일을 선택해주세요.");
      return;
    }
    emit("saved");
  } catch {
    alert("악보를 저장하지 못했습니다.");
  } finally {
    saving.value = false;
  }
}
</script>

<template>
  <div class="panel" :class="{ 'panel-edit': score }">
    <h2 class="panel-title">{{ score ? "악보 수정" : "새 악보 추가" }}</h2>
    <form class="form-grid" @submit.prevent="save">
      <label class="field">곡 제목 <input v-model="fields.title" required /></label>
      <label class="field">Key
        <select v-model="fields.song_key" required>
          <option value="">선택하세요</option>
          <option v-for="key in scoreKeys" :key="key">{{ key }}</option>
        </select>
      </label>
      <label class="field">BPM <input v-model.number="fields.bpm" type="number" min="1" required /></label>
      <label class="field">카테고리 / 집회 <input v-model="fields.category" required /></label>
      <label v-if="!score" class="field field--full">악보 파일
        <input type="file" accept=".pdf" required @change="file = ($event.target as HTMLInputElement).files?.[0]" />
      </label>
      <label v-if="!score" class="field field-checkbox">
        <input v-model="original" type="checkbox" /> 자작곡
      </label>
      <div class="form-actions">
        <button class="btn" type="button" @click="emit('cancel')">취소</button>
        <button class="btn primary" type="submit" :disabled="saving">{{ saving ? "저장 중..." : "저장" }}</button>
      </div>
    </form>
  </div>
</template>
