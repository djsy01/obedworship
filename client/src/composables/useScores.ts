import { computed, onMounted, onUnmounted, ref, watch } from "vue";
import { scoreApi, type Score } from "@/api/scores";

export const scoreKeys = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"];

export function useScores() {
  const scores = ref<Score[]>([]);
  const loading = ref(false);
  const keyword = ref("");
  const selectedKey = ref("");
  const sortBy = ref("recent");
  const page = ref(1);
  const pageSize = 10;
  let debounce: ReturnType<typeof setTimeout>;
  let request = 0;

  async function reload() {
    const current = ++request;
    loading.value = true;
    try {
      const response = keyword.value.trim()
        ? await scoreApi.search(keyword.value.trim())
        : await scoreApi.getAll();
      if (current === request) scores.value = response.data;
    } catch {
      if (current === request) alert("악보를 불러오지 못했습니다.");
    } finally {
      if (current === request) loading.value = false;
    }
  }
  const filtered = computed(() => {
    const result = scores.value.filter(score => !selectedKey.value || score.song_key === selectedKey.value);
    if (sortBy.value === "title") return result.sort((a, b) => a.title.localeCompare(b.title, "ko"));
    if (sortBy.value === "bpm") return result.sort((a, b) => a.bpm - b.bpm);
    return result.sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at));
  });
  const total = computed(() => filtered.value.length);
  const totalPages = computed(() => Math.ceil(total.value / pageSize));
  const paginated = computed(() => filtered.value.slice((page.value - 1) * pageSize, page.value * pageSize));
  watch([keyword, selectedKey, sortBy], () => { page.value = 1; });
  watch(totalPages, value => { page.value = Math.min(page.value, Math.max(1, value)); });
  watch(keyword, () => {
    clearTimeout(debounce);
    debounce = setTimeout(reload, 500);
  });
  onMounted(reload);
  onUnmounted(() => { clearTimeout(debounce); request++; });
  return { keyword, selectedKey, sortBy, loading, paginated, total, page, totalPages, reload };
}
