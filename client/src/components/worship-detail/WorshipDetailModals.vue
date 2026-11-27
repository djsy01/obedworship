<script setup lang="ts">
import type { Worship } from "@/api/worship";
import { toAbsoluteFileUrl } from "@/config/env";
import type { useWorshipDetail } from "./useWorshipDetail";
import ImageUploadModal from "./ImageUploadModal.vue";
import ScoreUploadModal from "./ScoreUploadModal.vue";
import FullscreenModal from "./FullscreenModal.vue";
import PdfPreviewModal from "./PdfPreviewModal.vue";

const props = defineProps<{ worship: Worship; detail: ReturnType<typeof useWorshipDetail> }>();
const { media, editor, gallery, score, pdf } = props.detail;
const { photos } = media;
const { posterUploadOpen, uploadingPoster, posterFullscreenOpen } = editor;
const { lightboxOpen, currentPhoto, photoUploadOpen, uploadingPhoto } = gallery;
const { scoreUploadOpen, thumbnailUploadOpen, uploadingScore, scorePosterUrl } = score;
const { previewUrl } = pdf;
</script>

<template>
  <div v-if="lightboxOpen" class="lightbox" @click="lightboxOpen = false">
    <button class="lightbox-close" aria-label="사진 닫기" @click="lightboxOpen = false">×</button>
    <button v-if="photos.length > 1" class="lightbox-prev" aria-label="이전 사진" @click.stop="gallery.movePhoto(-1)">‹</button>
    <button v-if="photos.length > 1" class="lightbox-next" aria-label="다음 사진" @click.stop="gallery.movePhoto(1)">›</button>
    <img :src="currentPhoto" alt="집회 사진" @click.stop />
  </div>
  <PdfPreviewModal :show="Boolean(previewUrl)" :pdf-url="previewUrl" @close="pdf.closePreview" />
  <ScoreUploadModal
    :show="scoreUploadOpen" :uploading="uploadingScore"
    @close="scoreUploadOpen = false" @upload="score.uploadScore"
  />
  <ImageUploadModal
    :show="photoUploadOpen" :uploading="uploadingPhoto" title="집회 사진 업로드"
    @close="photoUploadOpen = false" @upload="gallery.uploadPhoto"
  />
  <ImageUploadModal
    :show="thumbnailUploadOpen" :uploading="uploadingScore" title="악보 포스터 업로드"
    @close="thumbnailUploadOpen = false" @upload="score.uploadThumbnail"
  />
  <ImageUploadModal
    :show="posterUploadOpen" :uploading="uploadingPoster" title="집회 포스터 업로드"
    @close="posterUploadOpen = false" @upload="editor.uploadPoster"
  />
  <FullscreenModal
    :show="posterFullscreenOpen" :src="toAbsoluteFileUrl(worship.poster_url)"
    :alt="`${worship.title} 포스터`" @close="posterFullscreenOpen = false"
  />
  <FullscreenModal :show="Boolean(scorePosterUrl)" :src="scorePosterUrl" alt="악보 포스터" @close="scorePosterUrl = ''" />
</template>
