import { ref } from "vue";
import { worshipPhotoApi, type WorshipPhoto } from "@/api/worship-photos";
import { worshipScoreApi, type WorshipScore } from "@/api/worship-scores";
import { worshipVideoApi, type WorshipVideo } from "@/api/worship-videos";

export function useWorshipMedia(id: number) {
  const videos = ref<WorshipVideo[]>([]);
  const photos = ref<WorshipPhoto[]>([]);
  const scores = ref<WorshipScore[]>([]);

  async function load() {
    const results = await Promise.allSettled([
      worshipVideoApi.getByWorshipId(id).then(({ data }) => { videos.value = data; }),
      worshipPhotoApi.getByWorshipId(id).then(({ data }) => { photos.value = data; }),
      worshipScoreApi.getByWorshipId(id).then(({ data }) => { scores.value = data; }),
    ]);
    for (const result of results) {
      if (result.status === "rejected") console.error("집회 콘텐츠 조회 실패:", result.reason);
    }
  }
  return { videos, photos, scores, load };
}
