import { computed, onMounted, ref } from "vue";
import { worshipApi, type Worship } from "@/api/worship";
import { isAdmin } from "@/composables/session";
import { useWorshipMedia } from "./useWorshipMedia";
import { useWorshipEditor } from "./useWorshipEditor";
import { useGalleryActions } from "./useGalleryActions";
import { useWorshipScoreActions } from "./useWorshipScoreActions";
import { useWorshipScorePdf } from "./useWorshipScorePdf";

export function useWorshipDetail(id: number) {
  const worship = ref<Worship | null>(null);
  const media = useWorshipMedia(id);
  const editor = useWorshipEditor(id, reload);
  const gallery = useGalleryActions(id, media, reload);
  const score = useWorshipScoreActions(id, media.scores, reload);
  const pdf = useWorshipScorePdf();
  const passed = computed(() => {
    const date = worship.value?.date;
    return Boolean(date && new Date(date).getTime() < Date.now());
  });
  const showEmptyTabs = computed(() => isAdmin.value && editor.editing.value);
  const canViewMedia = computed(() => isAdmin.value || passed.value);
  const showGallery = computed(() => showEmptyTabs.value ||
    (canViewMedia.value && Boolean(media.videos.value.length || media.photos.value.length)));
  const showScores = computed(() => showEmptyTabs.value ||
    (canViewMedia.value && Boolean(media.scores.value.length)));

  async function reload() {
    try {
      const { data } = await worshipApi.getOne(id);
      editor.resetForm(data);
      worship.value = data;
      await media.load();
    } catch (error) {
      console.error("집회 조회 실패:", error);
    }
  }
  onMounted(reload);
  return { worship, media, editor, gallery, score, pdf, showGallery, showScores };
}
