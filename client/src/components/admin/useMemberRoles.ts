import { ref } from "vue";
import { isAxiosError } from "axios";
import { adminUsersApi, type AdminUser, type EditableRole } from "@/api/adminUsers";
import { roleLabels } from "@/composables/session";

const errorMessage = (error: unknown, fallback: string) =>
  (isAxiosError<{ message?: string }>(error) && error.response?.data?.message) || fallback;

export function useMemberRoles() {
  const email = ref("");
  const users = ref<AdminUser[]>([]);
  const status = ref("");
  const busy = ref(false);

  async function search() {
    if (busy.value) return;
    users.value = [];
    const query = email.value.trim();
    if (query.length < 2) {
      status.value = "이메일을 두 글자 이상 입력해주세요.";
      return;
    }
    busy.value = true;
    status.value = "검색 중...";
    try {
      const { data } = await adminUsersApi.searchByEmail(query);
      users.value = data.data;
      status.value = users.value.length ? "" : "검색 결과가 없습니다.";
    } catch (error) {
      status.value = errorMessage(error, "회원을 검색하지 못했습니다.");
    } finally {
      busy.value = false;
    }
  }

  async function changeRole(user: AdminUser) {
    if (busy.value) return;
    const role: EditableRole = user.role === "operator" ? "user" : "operator";
    if (!confirm(`${user.email}의 권한을 ${roleLabels[role]}(으)로 변경하시겠습니까?`)) return;
    busy.value = true;
    status.value = "권한 변경 중...";
    try {
      const { data } = await adminUsersApi.updateRole(user.id, role);
      Object.assign(user, data.data);
      status.value = "회원 권한을 변경했습니다.";
    } catch (error) {
      status.value = errorMessage(error, "회원 권한을 변경하지 못했습니다.");
    } finally {
      busy.value = false;
    }
  }

  return { email, users, status, busy, search, changeRole };
}
