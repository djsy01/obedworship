import { computed, onMounted, ref } from "vue";
import { mypageApi, type UserProfile } from "@/api/mypage";
import { currentUser, mockToken, roleLabels, sessionToken } from "@/composables/session";

export function useMyProfile() {
  const profile = ref<UserProfile | null>(null);
  const loading = ref(true);
  const error = ref(false);
  const roleLabel = computed(() => roleLabels[currentUser.value?.role ?? profile.value?.role ?? "user"]);

  async function load() {
    const user = currentUser.value;
    if (!user) return;
    error.value = false;
    loading.value = true;
    try {
      if (import.meta.env.DEV && sessionToken() === mockToken) return;
      profile.value = (await mypageApi.getProfile(user.id)).data;
    } catch {
      error.value = true;
    } finally {
      loading.value = false;
    }
  }
  async function save(name: string, phone: string) {
    const user = currentUser.value;
    if (!user) return false;
    try {
      profile.value = (await mypageApi.updateProfile(user.id, { name, phone })).data;
      localStorage.setItem("userName", profile.value.name);
      alert("정보가 수정되었습니다!");
      return true;
    } catch {
      alert("정보 수정에 실패했습니다.");
      return false;
    }
  }
  onMounted(load);
  return { profile, loading, error, roleLabel, load, save };
}
