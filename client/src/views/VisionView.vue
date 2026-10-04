<script setup lang="ts">
import { computed, ref, onMounted } from "vue";
import { useAuth } from "@/composables/useAuth";
import { memberApi, type Member as ApiMember } from "@/api/members";
import { assetApi } from "@/api/assets";
import MemberEditModal from "@/components/MemberEditModal.vue";
import MemberFilters from "@/components/vision/MemberFilters.vue";
import MemberCard from "@/components/vision/MemberCard.vue";
import VisionHero from "@/components/vision/VisionHero.vue";
import PositionTooltip from "@/components/vision/PositionTooltip.vue";
import "../styles/Vision.css";

type Member = { id: number; name: string; affiliation: string; photo_url: string; instagram_url: string | null; youtube_url: string | null; roles: string[]; worship_positions: string[]; step_positions: string[]; description: string };

const { isAdmin } = useAuth();
const adminModeEnabled = ref(false);
const isModalOpen = ref(false);
const selectedMember = ref<ApiMember | null>(null);
const loading = ref(true);
const members = ref<Member[]>([]);
const logo = ref("");
const filter = ref<"all" | "leader" | "worship" | "step">("all");
const worshipFilter = ref("");
const stepFilter = ref("");
const tooltip = ref({ visible: false, x: 0, y: 0, badges: [] as string[], type: "" });

const toEnum = (v: string) => v.replace(/_/g, " ");

const loadMembers = async () => {
  try {
    loading.value = true;
    members.value = (await memberApi.getAll()).data
      .filter((m) => isAdmin.value || adminModeEnabled.value || m.is_active !== false)
      .map((m) => ({ id: m.id, name: m.name, affiliation: m.affiliation, photo_url: m.photo_url || logo.value, instagram_url: m.instagram_url || null, youtube_url: m.youtube_url || null, roles: m.member_roles?.map((r) => toEnum(r.role_type)) || [], worship_positions: m.member_worship_positions?.map((p) => toEnum(p.position_type)) || [], step_positions: m.member_step_positions?.map((p) => toEnum(p.position_type)) || [], description: m.description || "" }));
  } catch { alert("멤버 정보를 불러오는데 실패했습니다."); }
  finally { loading.value = false; }
};

const roleOrder: Record<string, number> = { Pastor: 1, Elder: 2, "Worship Team Leader": 3, "Accounting Leader": 4, "Lead Singer": 5, "Singer Leader": 6, "Session Leader": 7, "Planning Leader": 8, "Media Leader": 9, "Stage Leader": 10, "Prayer Leader": 11 };

const filteredMembers = computed(() => {
  let f = members.value;
  if (filter.value === "leader") f = f.filter((m) => m.roles.length > 0);
  else if (filter.value === "worship") f = f.filter((m) => m.worship_positions.length > 0);
  else if (filter.value === "step") f = f.filter((m) => m.step_positions.length > 0);

  if (filter.value === "worship" && worshipFilter.value) {
    const wf = worshipFilter.value;
    if (wf === "Piano") f = f.filter((m) => m.worship_positions.some((p) => ["Piano", "Synthesizer"].includes(p)));
    else if (wf === "Guitar") f = f.filter((m) => m.worship_positions.some((p) => ["Acoustic Guitar", "Lead Guitar", "Backing Guitar", "Bass Guitar"].includes(p)));
    else f = f.filter((m) => m.worship_positions.includes(wf));
  }
  if (filter.value === "step" && stepFilter.value) {
    const sf = stepFilter.value;
    if (sf === "Accounting Team") f = f.filter((m) => m.step_positions.includes("Accounting Team") || m.roles.includes("Accounting Leader"));
    else if (sf === "Planning Team") f = f.filter((m) => m.step_positions.some((p) => ["Planning Team", "Instagram Manager", "Poster Designer", "Guidebook Designer"].includes(p)) || m.roles.includes("Planning Leader"));
    else if (sf === "Media Team") f = f.filter((m) => m.step_positions.some((p) => ["Media Team", "Camera Operator", "Video Editor", "YouTube Manager", "Mix Engineer", "Master Engineer", "Music Producer"].includes(p)) || m.roles.includes("Media Leader"));
    else if (sf === "Stage Team") f = f.filter((m) => m.step_positions.some((p) => ["Stage Team", "Live Engineer", "Stage Designer", "Lighting Operator", "Audio Setup", "Preproduction"].includes(p)) || m.roles.includes("Stage Leader"));
    else if (sf === "Prayer Team") f = f.filter((m) => m.step_positions.includes("Prayer Team") || m.roles.includes("Prayer Leader"));
  }

  return [...f].sort((a, b) => {
    const min = (roles: string[]) => roles.length ? Math.min(...roles.map((r) => roleOrder[r] || 99)) : 99;
    return min(a.roles) - min(b.roles) || a.name.localeCompare(b.name, "ko-KR");
  });
});

const handleMainFilter = (v: "all" | "leader" | "worship" | "step") => { filter.value = v; worshipFilter.value = ""; stepFilter.value = ""; };

const openEditModal = async (member: Member) => {
  try { selectedMember.value = (await memberApi.getOne(member.id)).data; isModalOpen.value = true; }
  catch { alert("멤버 정보를 불러오는데 실패했습니다."); }
};
const openAddModal = () => { selectedMember.value = null; isModalOpen.value = true; };
const closeModal = () => { isModalOpen.value = false; selectedMember.value = null; };

const handleMemberSaved = async () => {
  if (!selectedMember.value) { loadMembers(); return; }
  try {
    const updated = (await memberApi.getOne(selectedMember.value.id)).data;
    const i = members.value.findIndex((m) => m.id === updated.id);
    if (i !== -1) members.value[i] = { id: updated.id, name: updated.name, affiliation: updated.affiliation, photo_url: updated.photo_url || logo.value, instagram_url: updated.instagram_url || null, youtube_url: updated.youtube_url || null, roles: updated.member_roles?.map((r) => toEnum(r.role_type)) || [], worship_positions: updated.member_worship_positions?.map((p) => toEnum(p.position_type)) || [], step_positions: updated.member_step_positions?.map((p) => toEnum(p.position_type)) || [], description: updated.description || "" };
  } catch { loadMembers(); }
};
const deleteMemberConfirm = (member: Member) => {
  if (!confirm(`정말로 "${member.name}" 멤버를 삭제하시겠습니까?`)) return;
  memberApi.delete(member.id).then(() => { alert("멤버가 삭제되었습니다!"); loadMembers(); }).catch(() => alert("삭제에 실패했습니다."));
};

const showTooltip = (event: MouseEvent, badges: string[], type: string) => {
  const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
  tooltip.value = { visible: true, x: rect.left + rect.width / 2, y: rect.top - 8, badges, type };
};

onMounted(async () => {
  try { const r = await assetApi.getByKey("home_logo"); if (r.data.file_url) logo.value = r.data.file_url; } catch {}
  await loadMembers();
});
</script>

<template>
  <div class="page">
    <section class="section">
      <div class="section-header">
        <div>
          <h1 class="section-title">비전</h1>
          <p class="section-subtitle">순종과 경외로 주님과 소통하는 예배 공동체의 비전과 팀원들을 소개합니다.</p>
        </div>
      </div>

      <VisionHero />

      <div class="team-member-section">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem">
          <h2 class="section-title-sub">팀원 소개</h2>
          <button v-if="isAdmin" @click="adminModeEnabled = !adminModeEnabled" class="btn small admin-toggle">
            {{ adminModeEnabled ? "👤 관리자 모드 OFF" : "🔒 관리자 모드 ON" }}
          </button>
        </div>

        <div v-if="isAdmin && adminModeEnabled" style="margin-bottom:1rem">
          <button @click="openAddModal" style="padding:0.75rem 1.5rem;background:#4caf50;color:white;border:none;border-radius:4px;cursor:pointer;font-weight:bold;font-size:1rem">➕ 새 멤버 추가</button>
        </div>

        <MemberFilters
          :filter="filter" :worship-filter="worshipFilter" :step-filter="stepFilter"
          @main-filter="handleMainFilter" @worship-filter="worshipFilter = $event" @step-filter="stepFilter = $event"
        />

        <div v-if="loading" class="loading">로딩 중...</div>
        <div v-else class="member-grid">
          <MemberCard
            v-for="member in filteredMembers" :key="member.id"
            :member="member" :is-admin="isAdmin" :admin-mode-enabled="adminModeEnabled"
            @edit="openEditModal" @delete="deleteMemberConfirm"
            @show-tooltip="showTooltip" @hide-tooltip="tooltip.visible = false"
          />
          <p v-if="filteredMembers.length === 0" class="empty-text">조건에 맞는 팀원이 없습니다.</p>
        </div>
      </div>
    </section>

    <MemberEditModal :is-open="isModalOpen" :member="selectedMember" @close="closeModal" @success="handleMemberSaved" />
    <PositionTooltip v-bind="tooltip" />
  </div>
</template>
