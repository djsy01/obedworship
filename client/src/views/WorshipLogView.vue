<template>
  <div class="page">
    <section class="section">
      <div class="section-header">
        <div>
          <h1 class="section-title">집회안내</h1>
          <p class="section-subtitle">
            OBED Worship의 지난 집회 기록을 확인하세요. 각 집회에 대한 상세
            정보와 설교 영상, 찬양 영상도 함께 제공합니다.
          </p>
        </div>

        <div class="section-controls">
          <label class="field">
            <span class="field-label">연도</span>
            <select v-model="selectedYear">
              <option value="">전체</option>
              <option v-for="year in years" :key="year" :value="year">
                {{ year }}
              </option>
            </select>
          </label>

          <!-- Administrator-only rally add button -->
          <button
            v-if="isAdmin"
            class="btn primary"
            @click="openAddWorshipModal"
          >
            + 집회 추가
          </button>
        </div>
      </div>

      <!-- Additional modal for admin-only meetings -->
      <div v-if="showAddModal && isAdmin" class="panel">
        <h2 class="panel-title">새 집회 추가</h2>
        <form class="form-grid" @submit.prevent="handleAddWorship">
          <label class="field">
            <span class="field-label">집회명</span>
            <input
              v-model="newWorship.title"
              type="text"
              placeholder="예: 샬롬"
              required
            />
          </label>

          <label class="field">
            <span class="field-label">날짜</span>
            <input
              v-model="newWorship.date"
              type="text"
              placeholder="예: 2025-12-06 (Sat)"
              required
            />
          </label>

          <label class="field">
            <span class="field-label">연도</span>
            <input
              v-model.number="newWorship.year"
              type="number"
              placeholder="예: 2025"
              required
            />
          </label>

          <label class="field">
            <span class="field-label">설교자</span>
            <input
              v-model="newWorship.preacher"
              type="text"
              placeholder="예: 박훈 목사"
              required
            />
          </label>

          <label class="field">
            <span class="field-label">찬양팀</span>
            <input
              v-model="newWorship.worship"
              type="text"
              placeholder="예: OBED Worship"
              required
            />
          </label>

          <label class="field">
            <span class="field-label">초청 간사 (선택)</span>
            <input
              v-model="newWorship.guest"
              type="text"
              placeholder="예: 찬양사역자 오은"
            />
          </label>

          <label class="field field--full">
            <span class="field-label">집회 설명</span>
            <textarea
              v-model="newWorship.description"
              rows="3"
              placeholder="집회에 대한 간단한 설명을 입력하세요"
              required
            ></textarea>
          </label>

          <div class="form-actions">
            <button class="btn" type="button" @click="closeAddModal">
              취소
            </button>
            <button class="btn primary" type="submit">추가</button>
          </div>
        </form>
        <p class="panel-hint">
          ※ 집회 추가 후 상세 페이지에서 추가 정보를 입력할 수 있습니다.
        </p>
      </div>

      <div class="log-grid">
        <article
          v-for="w in filteredLogs"
          :key="w.id"
          class="log-card"
          @click="goToDetail(w.id)"
        >
          <p class="log-date">{{ w.date }}</p>
          <h2 class="log-title">{{ w.title }}</h2>
          <p class="log-meta">
            설교: {{ w.preacher }} · 찬양: {{ w.worship }}
            <template v-if="w.guest && w.guest.trim() !== ''">
              · 초청 간사: {{ w.guest }}
            </template>
          </p>
          <p class="log-desc">
            {{ w.description }}
          </p>

          <!-- Administrator-only action button -->
          <div v-if="isAdmin" class="admin-card-actions" @click.stop>
            <button
              class="btn-icon edit"
              @click="editWorship(w.id)"
              title="편집"
            >
              ✏️
            </button>
            <button
              class="btn-icon delete"
              @click="deleteWorship(w.id)"
              title="삭제"
            >
              🗑️
            </button>
          </div>

          <div class="log-arrow">
            <span>자세히 보기 →</span>
          </div>
        </article>

        <p v-if="filteredLogs.length === 0" class="empty-text">
          해당 조건에 맞는 집회 기록이 없습니다.
        </p>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useRouter } from "vue-router";
import { useAuth } from "@/composables/useAuth";
import "../styles/WorshipLog.css";

const router = useRouter();
const { isAdmin } = useAuth();

type WorshipLog = {
  id: number;
  date: string;
  year: number;
  title: string;
  preacher: string;
  worship: string;
  guest?: string;
  description: string;
};

// Dummy data (replaced with API data later)
const logs = ref<WorshipLog[]>([
  {
    id: 1,
    date: "2025-03-22 (Sat)",
    year: 2025,
    title: "하나됨",
    preacher: "민찬기 목사",
    worship: "OBED Worship",
    description: "호흡있는 모든 자들은 찬양하라",
  },
  {
    id: 2,
    date: "2025-12-06 (Sat)",
    year: 2025,
    title: "샬롬",
    preacher: "박훈 목사",
    worship: "OBED Worship",
    guest: "찬양사역자 오은",
    description: "너희는 마음에 근심하지도 말고 두려워하지도 말라",
  },
]);

const selectedYear = ref<string>("");
const showAddModal = ref(false);

// new rally data
const newWorship = ref<Omit<WorshipLog, "id">>({
  date: "",
  year: new Date().getFullYear(),
  title: "",
  preacher: "",
  worship: "OBED Worship",
  guest: "",
  description: "",
});

const years = computed(() =>
  Array.from(new Set(logs.value.map((l) => l.year))).sort((a, b) => b - a)
);

const filteredLogs = computed(() => {
  let filtered = logs.value;
  if (selectedYear.value) {
    const year = Number(selectedYear.value);
    filtered = logs.value.filter((l) => l.year === year);
  }

  return filtered.sort((a, b) => b.id - a.id);
});

const goToDetail = (id: number) => {
  router.push({ name: "worship-detail", params: { id: id.toString() } });
};

const editWorship = (id: number) => {
  // TODO: Go to edit modal or edit page
  console.log("편집:", id);
  alert(`집회 ${id} 편집 기능 구현 예정`);
};

const deleteWorship = (id: number) => {
  if (confirm("정말 이 집회를 삭제하시겠습니까?")) {
    // TODO: Call API to delete
    console.log("삭제:", id);
    alert(`집회 ${id} 삭제 기능 구현 예정`);
  }
};

// Open add rally modal
const openAddWorshipModal = () => {
  showAddModal.value = true;
  // Form initialization
  newWorship.value = {
    date: "",
    year: new Date().getFullYear(),
    title: "",
    preacher: "",
    worship: "OBED Worship",
    guest: "",
    description: "",
  };
};

// Close rally add modal
const closeAddModal = () => {
  showAddModal.value = false;
};

// Additional processing of meetings
const handleAddWorship = async () => {
  try {
    // Generate a new ID (actually generated on the server)
    const newId = Math.max(...logs.value.map((l) => l.id)) + 1;

    const worshipToAdd: WorshipLog = {
      id: newId,
      ...newWorship.value,
    };

    // TODO: Call API and save on server
    // await apiClient.post('/api/worship', worshipToAdd)

    // Mock: Add to local array
    logs.value.unshift(worshipToAdd);

    alert("집회가 추가되었습니다!");
    closeAddModal();

    // Go to detail page (optional)
    // router.push({ name: 'worship-detail', params: { id: newId.toString() } })
  } catch (error) {
    console.error("집회 추가 실패:", error);
    alert("집회 추가에 실패했습니다.");
  }
};
</script>
