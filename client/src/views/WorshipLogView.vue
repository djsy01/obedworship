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
            <input v-model="newWorship.date" type="date" required />
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
              v-model="newWorship.worship_team"
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

      <!-- 로딩 상태 -->
      <div v-if="loading" class="loading">
        로딩 중...
      </div>

      <!-- 에러 상태 -->
      <div v-else-if="error" class="error-message">
        <p>정보를 가져오지 못했습니다.</p>
        <button class="btn primary" @click="fetchWorships">다시 시도</button>
      </div>

      <!-- 집회 목록 -->
      <div v-else class="log-grid">
        <article
          v-for="w in filteredLogs"
          :key="w.id"
          class="log-card"
          @click="goToDetail(w.id)"
        >
          <p class="log-date">
            {{ new Date(w.date).toLocaleDateString("ko-KR") }}
          </p>
          <h2 class="log-title">{{ w.title }}</h2>
          <p class="log-meta">
            설교: {{ w.preacher }} · 찬양: {{ w.worship_team }}
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
import { computed, ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useAuth } from "@/composables/useAuth";
import { worshipApi, type Worship } from "@/api/worship";
import "../styles/WorshipLog.css";

const router = useRouter();
const { isAdmin } = useAuth();

const logs = ref<Worship[]>([]);
const selectedYear = ref<string>("");
const showAddModal = ref(false);
const loading = ref(true);
const error = ref(false);

// new rally data
const newWorship = ref({
  date: "",
  year: new Date().getFullYear(),
  title: "",
  preacher: "",
  worship_team: "OBED Worship",
  guest: "",
  description: "",
});

// 집회 조회
const fetchWorships = async () => {
  loading.value = true;
  error.value = false;
  try {
    const response = await worshipApi.getAll();
    logs.value = response.data;
  } catch (err) {
    console.error("집회 조회 실패:", err);
    error.value = true;
  } finally {
    loading.value = false;
  }
};

const years = computed(() =>
  Array.from(new Set(logs.value.map((l) => l.year))).sort((a, b) => b - a),
);

const filteredLogs = computed(() => {
  let filtered = logs.value;
  if (selectedYear.value) {
    const year = Number(selectedYear.value);
    filtered = logs.value.filter((l) => l.year === year);
  }

  return filtered.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );
});

const goToDetail = (id: number) => {
  router.push({ name: "worship-detail", params: { id: id.toString() } });
};

const editWorship = (id: number) => {
  router.push({ name: "worship-detail", params: { id: id.toString() } });
};

const deleteWorship = async (id: number) => {
  if (!confirm("정말 이 집회를 삭제하시겠습니까?")) return;

  loading.value = true;
  try {
    await worshipApi.delete(id);
    alert("집회가 삭제되었습니다!");
    await fetchWorships();
  } catch (error) {
    console.error("집회 삭제 실패:", error);
    alert("집회 삭제에 실패했습니다");
  } finally {
    loading.value = false;
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
    worship_team: "OBED Worship",
    guest: "",
    description: "",
  };
};

// Close rally add modal
const closeAddModal = () => {
  showAddModal.value = false;
};

// 집회 추가
const handleAddWorship = async () => {
  if (
    !newWorship.value.title ||
    !newWorship.value.date ||
    !newWorship.value.preacher ||
    !newWorship.value.description
  ) {
    alert("필수 항목을 입력해주세요");
    return;
  }

  loading.value = true;
  try {
    const response = await worshipApi.create(newWorship.value as any);
    alert("집회가 추가되었습니다!");
    closeAddModal();
    await fetchWorships();
    // 상세 페이지로 이동
    router.push({
      name: "worship-detail",
      params: { id: response.data.id.toString() },
    });
  } catch (error) {
    console.error("집회 추가 실패:", error);
    alert("집회 추가에 실패했습니다");
  } finally {
    loading.value = false;
  }
};

// 초기 로드
onMounted(() => {
  fetchWorships();
});
</script>
