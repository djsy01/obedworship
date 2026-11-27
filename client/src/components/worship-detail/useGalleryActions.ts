import { computed, ref } from "vue";
import { worshipPhotoApi } from "@/api/worship-photos";
import { worshipVideoApi } from "@/api/worship-videos";
import { toAbsoluteFileUrl } from "@/config/env";
import type { useWorshipMedia } from "./useWorshipMedia";
import { getYouTubeEmbedUrl } from "./youtube";

export function useGalleryActions(id: number, media: ReturnType<typeof useWorshipMedia>, refresh: () => Promise<void>) {
  const photoUploadOpen = ref(false);
  const uploadingPhoto = ref(false);
  const lightboxOpen = ref(false);
  const photoIndex = ref(0);
  const currentPhoto = computed(() => toAbsoluteFileUrl(media.photos.value[photoIndex.value]?.photo_url));

  async function addVideo() {
    const url = prompt("YouTube 영상 URL을 입력해주세요:")?.trim();
    if (!url) return;
    if (!getYouTubeEmbedUrl(url)) { alert("올바른 YouTube 영상 URL을 입력해주세요."); return; }
    try {
      const order = Math.max(0, ...media.videos.value.map(video => video.video_order)) + 1;
      await worshipVideoApi.create({ worship_id: id, video_url: url, video_order: order });
      alert("영상이 추가되었습니다!");
      await refresh();
    } catch { alert("영상 추가에 실패했습니다"); }
  }
  async function deleteVideo(videoId: number) {
    if (!confirm("이 영상을 삭제하시겠습니까?")) return;
    try { await worshipVideoApi.delete(videoId); alert("영상이 삭제되었습니다!"); await refresh(); }
    catch { alert("영상 삭제에 실패했습니다"); }
  }
  async function uploadPhoto(file: File) {
    uploadingPhoto.value = true;
    try {
      const { data } = await worshipPhotoApi.uploadFile(file);
      const order = Math.max(0, ...media.photos.value.map(photo => photo.photo_order)) + 1;
      await worshipPhotoApi.create({ worship_id: id, photo_url: data.url, file_name: data.filename, photo_order: order });
      alert("사진이 추가되었습니다!");
      photoUploadOpen.value = false;
      await refresh();
    } catch { alert("사진 추가에 실패했습니다"); }
    finally { uploadingPhoto.value = false; }
  }
  async function deletePhoto(photoId: number) {
    if (!confirm("이 사진을 삭제하시겠습니까?")) return;
    try { await worshipPhotoApi.delete(photoId); alert("사진이 삭제되었습니다!"); await refresh(); }
    catch { alert("사진 삭제에 실패했습니다"); }
  }
  function openLightbox(index: number) {
    photoIndex.value = index;
    lightboxOpen.value = true;
  }
  function movePhoto(step: number) {
    const size = media.photos.value.length;
    if (size > 1) photoIndex.value = (photoIndex.value + step + size) % size;
  }
  return { photoUploadOpen, uploadingPhoto, lightboxOpen, currentPhoto,
    addVideo, deleteVideo, uploadPhoto, deletePhoto, openLightbox, movePhoto };
}
