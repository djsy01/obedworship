<script setup lang="ts">
import { scoreApi, type Score } from "@/api/scores";
import { saveBlob } from "@/utils/download";

defineProps<{ scores: Score[]; isAdmin: boolean; signedIn: boolean }>();
const emit = defineEmits<{ edit: [score: Score]; deleted: [] }>();

async function remove(score: Score) {
  if (!confirm("정말 이 악보를 삭제하시겠습니까?")) return;
  try {
    await scoreApi.delete(score.id);
    emit("deleted");
  } catch {
    alert("악보 삭제에 실패했습니다.");
  }
}
async function download(score: Score) {
  try {
    const { data } = await scoreApi.downloadFile(score.id);
    saveBlob(data, score.filename || "score.pdf");
  } catch {
    alert("다운로드에 실패했습니다.");
  }
}
</script>

<template>
  <div class="table-wrapper">
    <table class="table">
      <thead>
        <tr>
          <th>곡 제목</th><th>Key</th><th>BPM</th><th>카테고리</th><th>다운로드</th>
          <th v-if="isAdmin" class="admin-column">관리</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="score in scores" :key="score.id">
          <td class="title-cell">{{ score.title }}</td>
          <td>{{ score.song_key }}</td>
          <td>{{ score.bpm }}</td>
          <td class="category-cell">{{ score.category }}</td>
          <td>
            <button class="btn small" type="button" :disabled="!signedIn" @click="download(score)">
              {{ signedIn ? "다운로드" : "로그인 필요" }}
            </button>
          </td>
          <td v-if="isAdmin" class="admin-column">
            <div class="admin-actions">
              <button class="btn-icon edit" type="button" title="편집" @click="emit('edit', score)">✏️</button>
              <button class="btn-icon delete" type="button" title="삭제" @click="remove(score)">🗑️</button>
            </div>
          </td>
        </tr>
        <tr v-if="!scores.length">
          <td :colspan="isAdmin ? 6 : 5" class="empty-text">해당 조건에 맞는 악보가 없습니다.</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
