<script setup lang="ts">
import { computed, ref, onMounted } from "vue";
import { memberApi, type Member as ApiMember } from "@/api/members";
import { assetApi } from "@/api/assets";
import MemberEditModal from "@/components/MemberEditModal.vue";
import "../styles/Vision.css";
import instagramIcon from "@/assets/icons/Instargram.png";
import youtubeIcon from "@/assets/icons/Youtube.png";

type Member = {
  id: number;
  name: string;
  affiliation: string;
  photo_url: string;
  instagram_url: string | null;
  youtube_url: string | null;
  roles: string[];
  worship_positions: string[];
  step_positions: string[];
  description: string;
  display_order?: number;
};

//Administrator mode
const isAdmin = ref(false);

// Modal state
const isModalOpen = ref(false);
const selectedMember = ref<ApiMember | null>(null);

// Loading state
const loading = ref(true);

const filter = ref<"all" | "leader" | "worship" | "step">("all");
const worshipFilter = ref<string>("");
const stepFilter = ref<string>("");

// Members data - loaded from API
const members = ref<Member[]>([]);

// Logo - loaded from DB
const logo = ref<string>("");

// Convert enum underscores back to spaces for display
const convertFromEnum = (value: string) => value.replace(/_/g, " ");

// Load members from API
const loadMembers = async () => {
  try {
    loading.value = true;
    const response = await memberApi.getAll();

    // Transform API response to match component's expected structure
    members.value = response.data.map((apiMember) => ({
      id: apiMember.id,
      name: apiMember.name,
      affiliation: apiMember.affiliation,
      photo_url: apiMember.photo_url || logo.value, // Use logo as fallback
      instagram_url: apiMember.instagram_url || null,
      youtube_url: apiMember.youtube_url || null,
      roles:
        apiMember.member_roles?.map((r) => convertFromEnum(r.role_type)) || [],
      worship_positions:
        apiMember.member_worship_positions?.map((p) =>
          convertFromEnum(p.position_type),
        ) || [],
      step_positions:
        apiMember.member_step_positions?.map((p) =>
          convertFromEnum(p.position_type),
        ) || [],
      description: apiMember.description || "",
      display_order: apiMember.display_order ?? 0,
    }));
  } catch (error) {
    console.error("Failed to load members:", error);
    alert("멤버 정보를 불러오는데 실패했습니다.");
  } finally {
    loading.value = false;
  }
};

const filteredMembers = computed(() => {
  let filtered = members.value;

  if (filter.value === "leader") {
    filtered = filtered.filter((m) => m.roles.length > 0);
  } else if (filter.value === "worship") {
    filtered = filtered.filter((m) => m.worship_positions.length > 0);
  } else if (filter.value === "step") {
    filtered = filtered.filter((m) => m.step_positions.length > 0);
  }

  if (filter.value === "worship" && worshipFilter.value) {
    if (worshipFilter.value === "Piano") {
      filtered = filtered.filter((m) =>
        m.worship_positions.some((p) => ["Piano", "Synthesizer"].includes(p)),
      );
    } else if (worshipFilter.value === "Guitar") {
      filtered = filtered.filter((m) =>
        m.worship_positions.some((p) =>
          [
            "Acoustic Guitar",
            "Lead Guitar",
            "Backing Guitar",
            "Bass Guitar",
          ].includes(p),
        ),
      );
    } else {
      filtered = filtered.filter((m) =>
        m.worship_positions.includes(worshipFilter.value),
      );
    }
  }

  if (filter.value === "step" && stepFilter.value) {
    if (stepFilter.value === "Accounting Team") {
      filtered = filtered.filter(
        (m) =>
          m.step_positions.includes("Accounting Team") ||
          m.roles.includes("Accounting Leader"),
      );
    } else if (stepFilter.value === "Planning Team") {
      filtered = filtered.filter(
        (m) =>
          m.step_positions.includes("Planning Team") ||
          m.step_positions.includes("Instagram Manager") ||
          m.step_positions.includes("Poster Designer") ||
          m.step_positions.includes("Guidebook Designer") ||
          m.roles.includes("Planning Leader"),
      );
    } else if (stepFilter.value === "Media Team") {
      filtered = filtered.filter(
        (m) =>
          m.step_positions.includes("Media Team") ||
          m.step_positions.includes("Camera Operator") ||
          m.step_positions.includes("Video Editor") ||
          m.step_positions.includes("YouTube Manager") ||
          m.step_positions.includes("Mix Engineer") ||
          m.step_positions.includes("Master Engineer") ||
          m.step_positions.includes("Music Producer") ||
          m.roles.includes("Media Leader"),
      );
    } else if (stepFilter.value === "Stage Team") {
      filtered = filtered.filter(
        (m) =>
          m.step_positions.includes("Stage Team") ||
          m.step_positions.includes("Live Engineer") ||
          m.step_positions.includes("Stage Designer") ||
          m.step_positions.includes("Lighting Operator") ||
          m.step_positions.includes("Audio Setup") ||
          m.step_positions.includes("Preproduction") ||
          m.roles.includes("Stage Leader"),
      );
    } else if (stepFilter.value === "Prayer Team") {
      filtered = filtered.filter(
        (m) =>
          m.step_positions.includes("Prayer Team") ||
          m.roles.includes("Prayer Leader"),
      );
    }
  }

  // Sort by role priority
  const roleOrder: { [key: string]: number } = {
    Pastor: 1,
    Elder: 2,
    "Worship Team Leader": 3,
    "Accounting Leader": 4,
    "Lead Singer": 5,
    "Singer Leader": 6,
    "Session Leader": 7,
    "Planning Leader": 8,
    "Media Leader": 9,
    "Stage Leader": 10,
    "Prayer Leader": 11,
  };

  filtered.sort((a, b) => {
    const getMinOrder = (roles: string[]) => {
      if (roles.length === 0) return 99;
      const orders = roles.map((r) => roleOrder[r] || 99);
      return Math.min(...orders);
    };

    const orderA = getMinOrder(a.roles);
    const orderB = getMinOrder(b.roles);

    if (orderA !== orderB) {
      return orderA - orderB;
    }

    // If the role is the same, sort by display_order
    const displayOrderA = a.display_order ?? 0;
    const displayOrderB = b.display_order ?? 0;

    if (displayOrderA !== displayOrderB) {
      return displayOrderA - displayOrderB;
    }

    return a.name.localeCompare(b.name, "ko-KR");
  });

  return filtered;
});

const handleMainFilter = (value: "all" | "leader" | "worship" | "step") => {
  filter.value = value;
  worshipFilter.value = "";
  stepFilter.value = "";
};

// Modal handlers
const openEditModal = async (member: Member) => {
  try {
    // Fetch full member data including roles and positions
    const response = await memberApi.getOne(member.id);
    selectedMember.value = response.data;
    isModalOpen.value = true;
  } catch (error) {
    console.error("Failed to load member:", error);
    alert("멤버 정보를 불러오는데 실패했습니다.");
  }
};

const openAddModal = () => {
  selectedMember.value = null;
  isModalOpen.value = true;
};

const closeModal = () => {
  isModalOpen.value = false;
  selectedMember.value = null;
};

const handleMemberSaved = async () => {
  if (!selectedMember.value) {
    // New member was added, reload all
    loadMembers();
    return;
  }

  // Update only the edited member to avoid full reload
  try {
    const response = await memberApi.getOne(selectedMember.value.id);
    const updatedMember = response.data;

    // Find and update the member in the list
    const index = members.value.findIndex((m) => m.id === updatedMember.id);
    if (index !== -1) {
      members.value[index] = {
        id: updatedMember.id,
        name: updatedMember.name,
        affiliation: updatedMember.affiliation,
        photo_url: updatedMember.photo_url || logo.value,
        instagram_url: updatedMember.instagram_url || null,
        youtube_url: updatedMember.youtube_url || null,
        roles:
          updatedMember.member_roles?.map((r) =>
            convertFromEnum(r.role_type),
          ) || [],
        worship_positions:
          updatedMember.member_worship_positions?.map((p) =>
            convertFromEnum(p.position_type),
          ) || [],
        step_positions:
          updatedMember.member_step_positions?.map((p) =>
            convertFromEnum(p.position_type),
          ) || [],
        description: updatedMember.description || "",
        display_order: updatedMember.display_order ?? 0,
      };
    }
  } catch (error) {
    console.error("Failed to update member:", error);
    // Fallback to full reload if update fails
    loadMembers();
  }
};

// Administrator function: Delete member
const deleteMemberConfirm = (member: Member) => {
  if (!confirm(`정말로 "${member.name}" 멤버를 삭제하시겠습니까?`)) {
    return;
  }

  memberApi
    .delete(member.id)
    .then(() => {
      alert("멤버가 삭제되었습니다!");
      // Reload members from API
      loadMembers();
    })
    .catch((error) => {
      console.error("삭제 실패:", error);
      alert("삭제에 실패했습니다.");
    });
};

// Load logo from DB
const loadLogo = async () => {
  try {
    const response = await assetApi.getByKey("home_logo");
    if (response.data.file_url) {
      logo.value = response.data.file_url;
    }
  } catch (error) {
    console.error("Logo not found in DB:", error);
  }
};

// Load members and logo on component mount
onMounted(async () => {
  // Load logo first, then members (so fallback uses the correct logo)
  await loadLogo();
  await loadMembers();
});
</script>

<template>
  <div class="page">
    <section class="section">
      <div class="section-header">
        <div>
          <h1 class="section-title">OBED Worship 비전</h1>
          <p class="section-subtitle">
            순종과 경외로 주님과 소통하는 예배 공동체의 비전과 팀원들을
            소개합니다.
          </p>
        </div>
      </div>

      <div class="bible-verse">
        <blockquote>
          <p>
            "너희는 너희 하나님 여호와를 순종하며, 그를 경외하며 그 명령을
            지키며<br />
            그 목소리를 청종하며, 그를 섬기며 그에게 부종하고"
          </p>
          <cite>- 신명기 13:4 -</cite>
        </blockquote>
      </div>

      <div class="team-description">
        <div class="highlight-box">
          빠르게 변화해가는 세상 속에서 주님을 향해 두려움을 내려놓고 목소리로
          주님과 소통하는 예배
        </div>
        <div class="highlight-box">
          청중들과 함께 소통하며 예배의 중심이 주님께 내려놓는 예배
        </div>
        <div class="highlight-box">
          집회를 준비하는 과정에서 역할에 따라 무엇이 중요한지 고민하며, 다음
          세대를 위로하고 함께 성장하기 위한는 예배
        </div>
        <div class="highlight-box">
          주님의 사랑을 잊고 살아가는 사람들에게 "너희는 잊어도 그리스도이신
          주님께서는 아직도 우릴 찾고 있다"는 것을 다시금 깨닫게 하기 위한 예배
        </div>
      </div>

      <div class="team-member-section">
        <div
          style="
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1rem;
          "
        >
          <h2 class="section-title-sub">팀원 소개</h2>

          <!-- Toggle administrator mode -->
          <button
            @click="isAdmin = !isAdmin"
            style="
              padding: 0.5rem 1rem;
              background: #4a1f2f;
              color: white;
              border: none;
              border-radius: 4px;
              cursor: pointer;
            "
          >
            {{ isAdmin ? "👤 관리자 모드 OFF" : "🔒 관리자 모드 ON" }}
          </button>
        </div>

        <!-- Administrator mode: Add new member button -->
        <div v-if="isAdmin" style="margin-bottom: 1rem">
          <button
            @click="openAddModal"
            style="
              padding: 0.75rem 1.5rem;
              background: #4caf50;
              color: white;
              border: none;
              border-radius: 4px;
              cursor: pointer;
              font-weight: bold;
              font-size: 1rem;
              transition: background 0.2s;
            "
            @mouseenter="
              ($event.target as HTMLElement).style.background = '#45a049'
            "
            @mouseleave="
              ($event.target as HTMLElement).style.background = '#4caf50'
            "
          >
            ➕ 새 멤버 추가
          </button>
        </div>

        <div class="position-filter">
          <button
            class="filter-btn"
            :class="{ active: filter === 'all' }"
            @click="handleMainFilter('all')"
          >
            All
          </button>
          <button
            class="filter-btn"
            :class="{ active: filter === 'leader' }"
            @click="handleMainFilter('leader')"
          >
            Leader
          </button>
          <button
            class="filter-btn"
            :class="{ active: filter === 'worship' }"
            @click="handleMainFilter('worship')"
          >
            Worship
          </button>
          <button
            class="filter-btn"
            :class="{ active: filter === 'step' }"
            @click="handleMainFilter('step')"
          >
            Step
          </button>
        </div>

        <div v-if="filter === 'worship'" class="worship-filters">
          <button
            class="filter-btn small"
            :class="{ active: worshipFilter === '' }"
            @click="worshipFilter = ''"
          >
            Worship All
          </button>
          <button
            class="filter-btn small"
            :class="{ active: worshipFilter === 'Vocal' }"
            @click="worshipFilter = 'Vocal'"
          >
            Vocal
          </button>
          <button
            class="filter-btn small"
            :class="{ active: worshipFilter === 'Piano' }"
            @click="worshipFilter = 'Piano'"
          >
            Piano
          </button>
          <button
            class="filter-btn small"
            :class="{ active: worshipFilter === 'Guitar' }"
            @click="worshipFilter = 'Guitar'"
          >
            Guitar
          </button>
          <button
            class="filter-btn small"
            :class="{ active: worshipFilter === 'Drum' }"
            @click="worshipFilter = 'Drum'"
          >
            Drum
          </button>
        </div>

        <div v-if="filter === 'step'" class="step-filters">
          <button
            class="filter-btn small"
            :class="{ active: stepFilter === '' }"
            @click="stepFilter = ''"
          >
            Step All
          </button>
          <button
            class="filter-btn small"
            :class="{ active: stepFilter === 'Accounting Team' }"
            @click="stepFilter = 'Accounting Team'"
          >
            Accounting Team
          </button>
          <button
            class="filter-btn small"
            :class="{ active: stepFilter === 'Planning Team' }"
            @click="stepFilter = 'Planning Team'"
          >
            Planning Team
          </button>
          <button
            class="filter-btn small"
            :class="{ active: stepFilter === 'Media Team' }"
            @click="stepFilter = 'Media Team'"
          >
            Media Team
          </button>
          <button
            class="filter-btn small"
            :class="{ active: stepFilter === 'Stage Team' }"
            @click="stepFilter = 'Stage Team'"
          >
            Stage Team
          </button>
          <button
            class="filter-btn small"
            :class="{ active: stepFilter === 'Prayer Team' }"
            @click="stepFilter = 'Prayer Team'"
          >
            Prayer Team
          </button>
        </div>

        <div v-if="loading" class="loading">로딩 중...</div>

        <div v-else class="member-grid">
          <div
            v-for="member in filteredMembers"
            :key="member.id"
            class="member-card"
          >
            <img
              :src="member.photo_url"
              :alt="member.name"
              class="member-photo"
            />
            <div class="member-info">
              <h3 class="member-name">{{ member.name }}</h3>

              <span class="affiliation-badge">{{ member.affiliation }}</span>

              <div v-if="member.roles.length > 0" class="member-roles">
                <span
                  v-for="role in member.roles"
                  :key="role"
                  class="role-badge"
                >
                  {{ role }}
                </span>
              </div>

              <div class="member-positions">
                <template v-if="filter === 'all'">
                  <span
                    v-for="pos in member.worship_positions"
                    :key="pos"
                    class="position-badge worship"
                  >
                    {{ pos }}
                  </span>
                  <span
                    v-for="pos in member.step_positions"
                    :key="pos"
                    class="position-badge step"
                  >
                    {{ pos }}
                  </span>
                </template>

                <template v-else-if="filter === 'worship'">
                  <span
                    v-for="pos in member.worship_positions"
                    :key="pos"
                    class="position-badge worship"
                  >
                    {{ pos }}
                  </span>
                </template>

                <template v-else-if="filter === 'step'">
                  <span
                    v-for="pos in member.step_positions"
                    :key="pos"
                    class="position-badge step"
                  >
                    {{ pos }}
                  </span>
                </template>
              </div>

              <div class="social-links">
                <a
                  v-if="member.instagram_url"
                  :href="member.instagram_url"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="icon-link"
                  title="Instagram"
                >
                  <img
                    :src="instagramIcon"
                    alt="Instagram"
                    class="social-icon"
                  />
                </a>
                <a
                  v-if="member.youtube_url"
                  :href="member.youtube_url"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="icon-link"
                  title="YouTube"
                >
                  <img :src="youtubeIcon" alt="YouTube" class="social-icon" />
                </a>
              </div>

              <!-- Administrator mode: Edit/Delete button -->
              <div
                v-if="isAdmin"
                style="margin-top: 1rem; display: flex; gap: 0.5rem"
              >
                <button
                  @click="openEditModal(member)"
                  style="
                    flex: 1;
                    padding: 0.5rem;
                    background: #4a7c59;
                    color: white;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 0.85rem;
                  "
                >
                  ✏️ 수정
                </button>
                <button
                  @click="deleteMemberConfirm(member)"
                  style="
                    flex: 1;
                    padding: 0.5rem;
                    background: #c0392b;
                    color: white;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 0.85rem;
                  "
                >
                  🗑️ 삭제
                </button>
              </div>
            </div>
          </div>

          <p v-if="filteredMembers.length === 0" class="empty-text">
            조건에 맞는 팀원이 없습니다.
          </p>
        </div>
      </div>
    </section>

    <!-- Member Edit Modal -->
    <MemberEditModal
      :is-open="isModalOpen"
      :member="selectedMember"
      @close="closeModal"
      @success="handleMemberSaved"
    />
  </div>
</template>
