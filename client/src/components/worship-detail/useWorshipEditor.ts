import { ref } from "vue";
import { worshipApi, type Worship } from "@/api/worship";
import { worshipPhotoApi } from "@/api/worship-photos";

export function useWorshipEditor(id: number, refresh: () => Promise<void>) {
  const form = ref<Record<string, string>>({});
  const editing = ref(false);
  const posterUploadOpen = ref(false);
  const posterFullscreenOpen = ref(false);
  const uploadingPoster = ref(false);

  function resetForm(worship: Worship) {
    Object.assign(form.value, {
      title: worship.title || "", preacher: worship.preacher || "", worship_team: worship.worship_team || "",
      guest: worship.guest || "", description: worship.description || "", poster_url: worship.poster_url || "",
      comments: worship.comments || "", entry_time: worship.entry_time || "", start_time: worship.start_time || "",
      location: worship.location || "", location_link: worship.location_link || "",
      parking: worship.parking || "", seating: worship.seating || "",
      promo_video: worship.promo_video || "", prelisten_video: worship.prelisten_video || "",
      opening_songs_text: worship.opening_songs?.join("\n") || "",
      celebration_songs_text: worship.celebration_songs?.join("\n") || "",
      excluded_songs_text: worship.excluded_songs?.join("\n") || "",
    });
  }
  async function toggleEditing() {
    if (!editing.value) { editing.value = true; return; }
    try {
      const toList = (text: string) => text.split("\n").map(line => line.trim()).filter(Boolean);
      const { opening_songs_text, celebration_songs_text, excluded_songs_text, ...rest } = form.value;
      await worshipApi.update(id, { ...rest, opening_songs: toList(opening_songs_text),
        celebration_songs: toList(celebration_songs_text), excluded_songs: toList(excluded_songs_text) });
      alert("집회 정보가 저장되었습니다!");
      editing.value = false;
      await refresh();
    } catch { alert("저장에 실패했습니다"); }
  }
  async function removePoster() {
    if (!confirm("포스터를 삭제하시겠습니까?")) return;
    try {
      await worshipApi.update(id, { poster_url: "" });
      alert("포스터가 삭제되었습니다!");
      await refresh();
    } catch { alert("포스터 삭제에 실패했습니다"); }
  }
  async function uploadPoster(file: File) {
    uploadingPoster.value = true;
    try {
      const { data } = await worshipPhotoApi.uploadFile(file);
      await worshipApi.update(id, { poster_url: data.url });
      alert("포스터가 업로드되었습니다!");
      posterUploadOpen.value = false;
      await refresh();
    } catch { alert("포스터 업로드에 실패했습니다."); }
    finally { uploadingPoster.value = false; }
  }
  return { form, editing, posterUploadOpen, posterFullscreenOpen, uploadingPoster,
    resetForm, toggleEditing, removePoster, uploadPoster };
}
