<script setup lang="ts">
import { ref, watch } from "vue";
import type { Worship } from "@/api/worship";
import { isAdmin, isLoggedIn } from "@/composables/session";
import type { useWorshipDetail } from "./useWorshipDetail";
import InfoTab from "./InfoTab.vue";
import GalleryTab from "./GalleryTab.vue";
import ScoreTab from "./ScoreTab.vue";

const props = defineProps<{ worship: Worship; detail: ReturnType<typeof useWorshipDetail> }>();
const { media, editor, gallery, score, pdf, showGallery, showScores } = props.detail;
const { photos, videos, scores } = media;
const { editing, form, posterUploadOpen, posterFullscreenOpen } = editor;
const { photoUploadOpen } = gallery;
const { scoreUploadOpen, thumbnailUploadOpen, scorePosterUrl } = score;
const tab = ref<"info" | "gallery" | "scores">("info");
watch([showGallery, showScores], ([galleryVisible, scoresVisible]) => {
  if ((!galleryVisible && tab.value === "gallery") || (!scoresVisible && tab.value === "scores")) tab.value = "info";
});
</script>

<template>
  <div class="tabs-container">
    <div class="tabs-nav">
      <button class="tab-button" :class="{ active: tab === 'info' }" @click="tab = 'info'">안내</button>
      <button v-if="showGallery" class="tab-button" :class="{ active: tab === 'gallery' }" @click="tab = 'gallery'">
        영상/사진
      </button>
      <button v-if="showScores" class="tab-button" :class="{ active: tab === 'scores' }" @click="tab = 'scores'">
        악보
      </button>
    </div>
    <div v-show="tab === 'info'" class="tab-content">
      <InfoTab
        :worship="worship" :edit-mode="isAdmin && editing" :edit-form="form"
        @upload-poster="posterUploadOpen = true" @remove-poster="editor.removePoster"
        @open-poster-fullscreen="posterFullscreenOpen = true"
      />
    </div>
    <div v-if="showGallery" v-show="tab === 'gallery'" class="tab-content">
      <GalleryTab
        :videos="videos" :photos="photos" :is-admin="isAdmin" :edit-mode="isAdmin && editing"
        @add-video="gallery.addVideo" @delete-video="gallery.deleteVideo" @delete-photo="gallery.deletePhoto"
        @upload-photo="photoUploadOpen = true" @open-lightbox="gallery.openLightbox"
      />
    </div>
    <div v-if="showScores" v-show="tab === 'scores'" class="tab-content">
      <ScoreTab
        v-model:excluded-songs-text="form.excluded_songs_text"
        :worship="worship" :score="scores[0]" :is-admin="isAdmin"
        :edit-mode="isAdmin && editing" :is-logged-in="isLoggedIn"
        @upload-score="scoreUploadOpen = true" @upload-thumbnail="thumbnailUploadOpen = true"
        @delete-score="score.deleteScore" @open-poster="scorePosterUrl = $event"
        @preview-score="pdf.previewScore" @download-score="pdf.downloadScore(scores[0])"
      />
    </div>
  </div>
</template>
