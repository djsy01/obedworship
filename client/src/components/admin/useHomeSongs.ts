import { onMounted, ref } from "vue";
import { isAxiosError } from "axios";
import { assetApi, type Asset } from "@/api/assets";

export function useHomeSongs() {
  const songs = ref<Asset[]>([]);
  const status = ref("");

  async function reload() {
    try {
      const { data } = await assetApi.getByCategory("songs");
      songs.value = Array.isArray(data)
        ? data.slice().sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0))
        : [];
    } catch {
      songs.value = [];
    }
  }
  async function upload(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("audio/")) {
      status.value = "오디오 파일만 업로드 가능합니다.";
      input.value = "";
      return;
    }
    status.value = "업로드 중...";
    try {
      await assetApi.uploadFile(file, `home_song_${Date.now()}`, "songs", file.name, "홈 음원");
      status.value = "업로드 완료!";
      await reload();
      setTimeout(() => { status.value = ""; }, 3000);
    } catch (error) {
      const message = isAxiosError(error) && error.response?.data?.message;
      status.value = `업로드 실패: ${message || "다시 시도해주세요."}`;
    } finally {
      input.value = "";
    }
  }
  async function deleteSong(id: number) {
    if (!confirm("이 음원을 삭제할까요?")) return;
    try {
      await assetApi.delete(id);
      await reload();
    } catch {
      status.value = "삭제 실패";
    }
  }
  onMounted(reload);
  return { songs, status, reload, upload, deleteSong };
}
