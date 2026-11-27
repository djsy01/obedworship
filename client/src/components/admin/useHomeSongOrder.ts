import { ref, type Ref } from "vue";
import { assetApi, type Asset } from "@/api/assets";

export function useHomeSongOrder(songs: Ref<Asset[]>, status: Ref<string>, reload: () => Promise<void>) {
  const dragIndex = ref<number | null>(null);
  const dragOverIndex = ref<number | null>(null);

  function endDrag() {
    dragIndex.value = null;
    dragOverIndex.value = null;
  }
  async function dropSong(index: number) {
    const from = dragIndex.value;
    endDrag();
    if (from === null || from === index) return;
    const list = [...songs.value];
    const [moved] = list.splice(from, 1);
    list.splice(index, 0, moved);
    songs.value = list;
    status.value = "순서 저장 중...";
    try {
      for (const [position, song] of list.entries()) {
        await assetApi.update(song.id, { display_order: position });
      }
      status.value = "순서 저장 완료!";
      setTimeout(() => { status.value = ""; }, 2000);
    } catch {
      status.value = "순서 저장 실패";
      await reload();
    }
  }
  return { dragIndex, dragOverIndex, endDrag, dropSong };
}
