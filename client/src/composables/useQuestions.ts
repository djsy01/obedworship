import { computed, ref, watch } from "vue";
import { qnaApi, type Qna, type QnaCategory } from "@/api/qna";
import { useAuth } from "./useAuth";

export function useQuestions() {
  const { isLoggedIn, isAdmin, currentUser } = useAuth();
  const category = ref<QnaCategory | "전체">("전체");
  const questions = ref<Qna[]>([]);
  const asking = ref(false);
  const loading = ref(false);
  const failed = ref(false);
  const editing = ref<number>();
  const answered = computed(() => questions.value.filter(q => q.status === "ANSWERED").length);
  let lastRequest = 0;

  async function reload() {
    const request = ++lastRequest;
    failed.value = false;
    loading.value = true;
    try {
      const { data } = await (category.value === "전체" ? qnaApi.getAll() : qnaApi.getByCategory(category.value));
      if (request === lastRequest) questions.value = data;
    } catch {
      if (request === lastRequest) failed.value = true;
    } finally {
      if (request === lastRequest) loading.value = false;
    }
  }

  watch([category, () => currentUser.value?.id, isAdmin], () => {
    questions.value = [];
    editing.value = undefined;
    if (!isLoggedIn.value) asking.value = false;
    reload();
  }, { immediate: true });
  return { category, questions, asking, loading, failed, editing, answered, reload };
}
