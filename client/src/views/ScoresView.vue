<template>
  <div class="page">
    <section class="section">
      <div class="section-header">
        <div>
          <h1 class="section-title">악보</h1>
          <p class="section-subtitle">
            OBED Worship에서 자작곡 및 편곡한 곡들의 악보를 다운로드할 수
            있습니다.
          </p>
        </div>

        <div class="section-controls">
          <button
            v-if="isAdmin"
            class="btn primary"
            type="button"
            @click="showAddForm = !showAddForm"
          >
            {{ showAddForm ? "추가 취소" : "악보 추가" }}
          </button>
        </div>
      </div>

      <!-- Add sheet music form -->
      <div v-if="showAddForm && isAdmin" class="panel">
        <h2 class="panel-title">새 악보 추가</h2>
        <form class="form-grid" @submit.prevent="handleAddScore">
          <label class="field">
            <span class="field-label">곡 제목</span>
            <input
              v-model="newScore.title"
              type="text"
              placeholder="곡 제목을 입력하세요"
              required
            />
          </label>

          <label class="field">
            <span class="field-label">Key</span>
            <select v-model="newScore.key" required>
              <option value="">선택하세요</option>
              <option v-for="k in availableKeys" :key="k" :value="k">
                {{ k }}
              </option>
            </select>
          </label>

          <label class="field">
            <span class="field-label">BPM</span>
            <input
              v-model.number="newScore.bpm"
              type="number"
              placeholder="예: 72"
              required
            />
          </label>

          <label class="field">
            <span class="field-label">카테고리 / 집회</span>
            <input
              v-model="newScore.category"
              type="text"
              placeholder="보혈집회 2025-03 등"
              required
            />
          </label>

          <label class="field">
            <span class="field-label">악보 파일</span>
            <input type="file" @change="handleFileChange" accept=".pdf" />
          </label>

          <div class="form-actions">
            <button class="btn" type="button" @click="cancelAdd">취소</button>
            <button class="btn primary" type="submit">저장</button>
          </div>
        </form>
        <p class="panel-hint">
          ※ 현재는 Mock 데이터로 동작합니다. 실제 업로드/저장은 서버 API와
          연동이 필요합니다.
        </p>
      </div>

      <!-- edit form -->
      <div v-if="editingScore && isAdmin" class="panel panel-edit">
        <h2 class="panel-title">악보 수정</h2>
        <form class="form-grid" @submit.prevent="handleUpdateScore">
          <label class="field">
            <span class="field-label">곡 제목</span>
            <input v-model="editingScore.title" type="text" required />
          </label>

          <label class="field">
            <span class="field-label">Key</span>
            <select v-model="editingScore.key" required>
              <option v-for="k in availableKeys" :key="k" :value="k">
                {{ k }}
              </option>
            </select>
          </label>

          <label class="field">
            <span class="field-label">BPM</span>
            <input v-model.number="editingScore.bpm" type="number" required />
          </label>

          <label class="field">
            <span class="field-label">카테고리 / 집회</span>
            <input v-model="editingScore.category" type="text" required />
          </label>

          <div class="form-actions">
            <button class="btn" type="button" @click="cancelEdit">취소</button>
            <button class="btn primary" type="submit">수정 완료</button>
          </div>
        </form>
      </div>

      <!-- filter -->
      <div class="filters-container">
        <div class="filter-group">
          <label class="field field--inline">
            <span class="field-label">검색</span>
            <input
              v-model="keyword"
              type="text"
              placeholder="곡 제목으로 검색"
            />
          </label>

          <label class="field field--inline">
            <span class="field-label">Key</span>
            <select v-model="selectedKey">
              <option value="">전체</option>
              <option v-for="k in availableKeys" :key="k" :value="k">
                {{ k }}
              </option>
            </select>
          </label>

          <label class="field field--inline">
            <span class="field-label">정렬</span>
            <select v-model="sortBy">
              <option value="title">제목순</option>
              <option value="bpm">BPM순</option>
              <option value="recent">최신순</option>
            </select>
          </label>
        </div>

        <div class="results-info">총 {{ filteredScores.length }}개의 악보</div>
      </div>

      <!-- sheet music table -->
      <div class="table-wrapper">
        <table class="table">
          <thead>
            <tr>
              <th>곡 제목</th>
              <th>Key</th>
              <th>BPM</th>
              <th>카테고리</th>
              <th>다운로드</th>
              <th v-if="isAdmin" class="admin-column">관리</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="s in paginatedScores" :key="s.id">
              <td class="title-cell">{{ s.title }}</td>
              <td>{{ s.key }}</td>
              <td>{{ s.bpm }}</td>
              <td class="category-cell">{{ s.category }}</td>
              <td>
                <button
                  class="btn small"
                  type="button"
                  :disabled="!isLoggedIn"
                  @click="handleDownload(s)"
                >
                  {{ isLoggedIn ? "다운로드" : "로그인 필요" }}
                </button>
              </td>
              <td v-if="isAdmin" class="admin-column">
                <div class="admin-actions">
                  <button
                    class="btn-icon edit"
                    type="button"
                    @click="startEdit(s)"
                    title="편집"
                  >
                    ✏️
                  </button>
                  <button
                    class="btn-icon delete"
                    type="button"
                    @click="handleDelete(s.id)"
                    title="삭제"
                  >
                    🗑️
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="paginatedScores.length === 0">
              <td :colspan="isAdmin ? 6 : 5" class="empty-text">
                해당 조건에 맞는 악보가 없습니다.
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="pagination">
        <button
          class="pagination-btn"
          :disabled="currentPage === 1"
          @click="currentPage = 1"
        >
          ⟪
        </button>
        <button
          class="pagination-btn"
          :disabled="currentPage === 1"
          @click="currentPage--"
        >
          ‹
        </button>

        <button
          v-for="page in visiblePages"
          :key="page"
          class="pagination-btn"
          :class="{ active: currentPage === page }"
          @click="currentPage = page"
        >
          {{ page }}
        </button>

        <button
          class="pagination-btn"
          :disabled="currentPage === totalPages"
          @click="currentPage++"
        >
          ›
        </button>
        <button
          class="pagination-btn"
          :disabled="currentPage === totalPages"
          @click="currentPage = totalPages"
        >
          ⟫
        </button>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useAuth } from "@/composables/useAuth";
import "../styles/Scores.css";

type Score = {
  id: number;
  title: string;
  key: string;
  bpm: number;
  category: string;
  fileUrl?: string;
};

const { isLoggedIn, isAdmin } = useAuth();

// List of available Keys
const availableKeys = [
  "C",
  "Db",
  "D",
  "Eb",
  "E",
  "F",
  "Gb",
  "G",
  "Ab",
  "A",
  "Bb",
  "B",
];

// Mock data
const scores = ref<Score[]>([
  {
    id: 1,
    title: "Build Up",
    key: "D",
    bpm: 105,
    category: "하나됨집회 2025-03-22",
  },
  {
    id: 2,
    title: "영원히 너란다",
    key: "C",
    bpm: 60,
    category: "샬롬집회 2025-12-06",
  },
]);

// filter
const keyword = ref("");
const selectedKey = ref("");
const sortBy = ref("title");

// form state
const showAddForm = ref(false);
const editingScore = ref<Score | null>(null);
const newScore = ref({
  title: "",
  key: "",
  bpm: 0,
  category: "",
});

// pagination status
const currentPage = ref(1);
const itemsPerPage = 10;

// Filtered sheet music list
const filteredScores = computed(() => {
  let result = [...scores.value];

  // Search term filter
  if (keyword.value.trim()) {
    const k = keyword.value.toLowerCase();
    result = result.filter((s) => s.title.toLowerCase().includes(k));
  }

  //Key filter
  if (selectedKey.value) {
    result = result.filter((s) => s.key === selectedKey.value);
  }

  // sort
  if (sortBy.value === "title") {
    result.sort((a, b) => a.title.localeCompare(b.title, "ko"));
  } else if (sortBy.value === "bpm") {
    result.sort((a, b) => a.bpm - b.bpm);
  } else if (sortBy.value === "recent") {
    result.sort((a, b) => b.id - a.id);
  }

  return result;
});

// Calculate pagination
const totalPages = computed(() =>
  Math.ceil(filteredScores.value.length / itemsPerPage)
);

const paginatedScores = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return filteredScores.value.slice(start, end);
});

const visiblePages = computed(() => {
  const pages: number[] = [];
  const maxVisible = 5;
  let start = Math.max(1, currentPage.value - Math.floor(maxVisible / 2));
  let end = Math.min(totalPages.value, start + maxVisible - 1);

  if (end - start < maxVisible - 1) {
    start = Math.max(1, end - maxVisible + 1);
  }

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  return pages;
});

// When changing filter, go to first page
watch([keyword, selectedKey, sortBy], () => {
  currentPage.value = 1;
});

// add sheet music
const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (file) {
    console.log("선택된 파일:", file.name);
    // TODO: Handle actual file upload
  }
};

const handleAddScore = () => {
  if (
    !newScore.value.title ||
    !newScore.value.key ||
    !newScore.value.bpm ||
    !newScore.value.category
  ) {
    alert("모든 필드를 입력해주세요.");
    return;
  }

  const newId = Math.max(...scores.value.map((s) => s.id)) + 1;
  scores.value.push({
    id: newId,
    ...newScore.value,
  });

  alert("악보가 추가되었습니다!");
  cancelAdd();
};

const cancelAdd = () => {
  showAddForm.value = false;
  newScore.value = { title: "", key: "", bpm: 0, category: "" };
};

// Edit score
const startEdit = (score: Score) => {
  editingScore.value = { ...score };
  showAddForm.value = false;
};

const handleUpdateScore = () => {
  if (!editingScore.value) return;

  const index = scores.value.findIndex((s) => s.id === editingScore.value!.id);
  if (index !== -1) {
    scores.value[index] = { ...editingScore.value };
    alert("악보가 수정되었습니다!");
    cancelEdit();
  }
};

const cancelEdit = () => {
  editingScore.value = null;
};

// Delete sheet music
const handleDelete = (id: number) => {
  if (!confirm("정말 이 악보를 삭제하시겠습니까?")) return;

  const index = scores.value.findIndex((s) => s.id === id);
  if (index !== -1) {
    scores.value.splice(index, 1);
    alert("악보가 삭제되었습니다!");
  }
};

// Download sheet music
const handleDownload = (score: Score) => {
  console.log("다운로드:", score.title);
  alert(`"${score.title}" 악보 다운로드 기능 구현 예정`);
  // TODO: Handle actual file download
};
</script>
