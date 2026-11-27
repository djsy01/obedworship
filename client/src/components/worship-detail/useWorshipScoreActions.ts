import { ref, type Ref } from "vue";
import { worshipPhotoApi } from "@/api/worship-photos";
import { worshipScoreApi, type WorshipScore } from "@/api/worship-scores";

export function useWorshipScoreActions(id: number, scores: Ref<WorshipScore[]>, refresh: () => Promise<void>) {
  const scoreUploadOpen = ref(false);
  const thumbnailUploadOpen = ref(false);
  const uploadingScore = ref(false);
  const scorePosterUrl = ref("");

  async function uploadScore(file: File, description: string) {
    uploadingScore.value = true;
    try {
      const { data } = await worshipScoreApi.uploadFile(file);
      await worshipScoreApi.create({ worship_id: id, filename: data.filename, file_url: data.url,
        description: description || undefined });
      alert("악보가 업로드되었습니다!");
      scoreUploadOpen.value = false;
      await refresh();
    } catch { alert("악보 업로드에 실패했습니다."); }
    finally { uploadingScore.value = false; }
  }
  async function uploadThumbnail(file: File) {
    const score = scores.value[0];
    if (!score) { alert("악보가 없습니다. 먼저 악보를 업로드해주세요."); return; }
    uploadingScore.value = true;
    try {
      const { data } = await worshipPhotoApi.uploadFile(file);
      await worshipScoreApi.update(score.id, { thumbnail_url: data.url });
      alert("포스터가 업로드되었습니다!");
      thumbnailUploadOpen.value = false;
      await refresh();
    } catch { alert("포스터 업로드에 실패했습니다."); }
    finally { uploadingScore.value = false; }
  }
  async function deleteScore() {
    const score = scores.value[0];
    if (!score || !confirm("이 악보를 삭제하시겠습니까?")) return;
    try { await worshipScoreApi.delete(score.id); alert("악보가 삭제되었습니다!"); await refresh(); }
    catch { alert("악보 삭제에 실패했습니다"); }
  }
  return { scoreUploadOpen, thumbnailUploadOpen, uploadingScore, scorePosterUrl, uploadScore, uploadThumbnail, deleteScore };
}
