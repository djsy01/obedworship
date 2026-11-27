<script setup lang="ts">
import { ref } from "vue";
import { toAbsoluteFileUrl } from "@/config/env";
import { useHomeSongs } from "./useHomeSongs";
import { useHomeSongOrder } from "./useHomeSongOrder";

const input = ref<HTMLInputElement | null>(null);
const { songs, status, reload, upload, deleteSong } = useHomeSongs();
const { dragIndex, dragOverIndex, endDrag, dropSong } = useHomeSongOrder(songs, status, reload);
</script>

<template>
  <div class="upload-section">
    <h4>홈 음원 관리</h4>
    <div class="audio-controls">
      <div class="current-audio-list">
        <div v-if="!songs.length" class="no-photo">등록된 음원이 없습니다.</div>
        <div v-else class="audio-list">
          <div
            v-for="(song, index) in songs" :key="song.id" class="audio-item"
            :class="{ dragging: dragIndex === index, 'drag-over': dragOverIndex === index && dragIndex !== index }"
            draggable="true" @dragstart="dragIndex = index" @dragover.prevent="dragOverIndex = index"
            @drop.prevent="dropSong(index)" @dragend="endDrag"
          >
            <span class="drag-handle">⠿</span>
            <div class="audio-info">
              <p class="audio-title">{{ song.title || song.file_name || "음원" }}</p>
              <audio v-if="song.file_url" :src="toAbsoluteFileUrl(song.file_url)" controls />
            </div>
            <button class="btn-delete" @click="deleteSong(song.id)">삭제</button>
          </div>
        </div>
      </div>
      <div class="upload-actions">
        <input ref="input" type="file" accept="audio/*" hidden @change="upload" />
        <button class="btn-upload" @click="input?.click()">음원 추가</button>
        <p class="status-message">{{ status }}</p>
      </div>
    </div>
  </div>
</template>
