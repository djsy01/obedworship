import { onMounted, ref, type Ref } from "vue";
import { assetApi } from "@/api/assets";
import { memberApi, type Member } from "@/api/members";
import { isAdmin } from "@/composables/session";
import { toAbsoluteFileUrl } from "@/config/env";
import { toVisionMember, type VisionMember } from "./visionMember";

export function useVisionMembers(adminModeEnabled: Ref<boolean>) {
  const loading = ref(true);
  const members = ref<VisionMember[]>([]);
  const logo = ref("");
  const isModalOpen = ref(false);
  const selectedMember = ref<Member | null>(null);

  async function loadMembers() {
    try {
      loading.value = true;
      members.value = (await memberApi.getAll()).data
        .filter(member => isAdmin.value || adminModeEnabled.value || Boolean(member.is_active))
        .map(member => toVisionMember(member, logo.value));
    } catch { alert("멤버 정보를 불러오는데 실패했습니다."); }
    finally { loading.value = false; }
  }
  async function openEditModal(member: VisionMember) {
    try {
      selectedMember.value = (await memberApi.getOne(member.id)).data;
      isModalOpen.value = true;
    } catch { alert("멤버 정보를 불러오는데 실패했습니다."); }
  }
  const openAddModal = () => { selectedMember.value = null; isModalOpen.value = true; };
  const closeModal = () => { isModalOpen.value = false; selectedMember.value = null; };

  async function handleMemberSaved() {
    if (!selectedMember.value) { await loadMembers(); return; }
    try {
      const { data } = await memberApi.getOne(selectedMember.value.id);
      const index = members.value.findIndex(member => member.id === data.id);
      if (index !== -1) members.value[index] = toVisionMember(data, logo.value);
    } catch { await loadMembers(); }
  }
  async function deleteMemberConfirm(member: VisionMember) {
    if (!confirm(`정말로 "${member.name}" 멤버를 삭제하시겠습니까?`)) return;
    try {
      await memberApi.delete(member.id);
      alert("멤버가 삭제되었습니다!");
      await loadMembers();
    } catch { alert("삭제에 실패했습니다."); }
  }
  onMounted(async () => {
    try { logo.value = toAbsoluteFileUrl((await assetApi.getByKey("home_logo")).data.file_url); }
    catch { logo.value = ""; }
    await loadMembers();
  });
  return { members, loading, isModalOpen, selectedMember, openAddModal, openEditModal,
    closeModal, handleMemberSaved, deleteMemberConfirm };
}
