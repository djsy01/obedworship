<script setup lang="ts">
import { computed, ref, watch, onMounted } from "vue";
import { useAuth } from "@/composables/useAuth";
import { scoreApi, type Score } from "@/api/axios";
import "../styles/Scores.css";

const { isLoggedIn, isAdmin } = useAuth();

// List of available Keys
const availableKeys = [
  "C",
  "C#",
  "Db",
  "D",
  "D#",
  "Eb",
  "E",
  "F",
  "F#",
  "Gb",
  "G",
  "G#",
  "Ab",
  "A",
  "A#",
  "Bb",
  "B",
];

// API에서 가져온 데이터
const scores = ref<Score[]>([]);
const loading = ref(false);

// filter
const keyword = ref("");
const selectedKey = ref("");
const sortBy = ref("recent");

// form state
const showAddForm = ref(false);
const editingScore = ref<Score | null>(null);
const newScore = ref({
  title: "",
  song_key: "",
  bpm: 0,
  category: "",
  file_url: "",
  filename: "",
  is_original: true,
  description: "",
});

// pagination status
const currentPage = ref(1);
const itemsPerPage = 10;

// ========================================
// API 호출 함수들
// ========================================

// 전체 악보 조회
const fetchScores = async () => {
  loading.value = true;
  try {
    const response = await scoreApi.getAll();
    scores.value = response.data;
  } catch (error) {
    console.error("❌ 악보 조회 실패:", error);
    alert("악보를 불러오는데 실패했습니다");
  } finally {
    loading.value = false;
  }
};

// 검색
const handleSearch = async () => {
  if (!keyword.value.trim()) {
    await fetchScores();
    return;
  }

  loading.value = true;
  try {
    const response = await scoreApi.search(keyword.value);
    scores.value = response.data;
  } catch (error) {
    console.error("❌ 검색 실패:", error);
  } finally {
    loading.value = false;
  }
};

// 카테고리별 조회
const fetchByCategory = async (category: string) => {
  loading.value = true;
  try {
    const response = await scoreApi.getByCategory(category);
    scores.value = response.data;
  } catch (error) {
    console.error("❌ 카테고리별 조회 실패:", error);
  } finally {
    loading.value = false;
  }
};

// Key별 조회
const fetchByKey = async (key: string) => {
  if (!key) {
    await fetchScores();
    return;
  }

  loading.value = true;
  try {
    const response = await scoreApi.getByKey(key);
    scores.value = response.data;
  } catch (error) {
    console.error("❌ Key별 조회 실패:", error);
  } finally {
    loading.value = false;
  }
};

// Filtered sheet music list
const filteredScores = computed(() => {
  let result = [...scores.value];

  // Key filter (프론트엔드에서 추가 필터링)
  if (selectedKey.value) {
    result = result.filter((s) => s.song_key === selectedKey.value);
  }

  // sort
  if (sortBy.value === "title") {
    result.sort((a, b) => a.title.localeCompare(b.title, "ko"));
  } else if (sortBy.value === "bpm") {
    result.sort((a, b) => a.bpm - b.bpm);
  } else if (sortBy.value === "recent") {
    result.sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );
  }

  return result;
});

// Calculate pagination
const totalPages = computed(() =>
  Math.ceil(filteredScores.value.length / itemsPerPage),
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

// Key 변경 시 API 호출
watch(selectedKey, (newKey) => {
  if (newKey) {
    fetchByKey(newKey);
  } else {
    fetchScores();
  }
});

// 검색어 변경 시 디바운스
let searchTimeout: NodeJS.Timeout;
watch(keyword, (newKeyword) => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    if (newKeyword.trim()) {
      handleSearch();
    } else {
      fetchScores();
    }
  }, 500); // 500ms 디바운스
});

// add sheet music
const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (file) {
    console.log("선택된 파일:", file.name);
    newScore.value.filename = file.name;
  }
};

const handleAddScore = async () => {
  if (
    !newScore.value.title ||
    !newScore.value.song_key ||
    !newScore.value.bpm ||
    !newScore.value.category
  ) {
    alert("모든 필수 필드를 입력해주세요.");
    return;
  }

  loading.value = true;
  try {
    // 파일 업로드 (선택된 파일이 있을 경우)
    const fileInput = document.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;
    if (fileInput?.files?.[0]) {
      const uploadResponse = await scoreApi.upload(fileInput.files[0]);
      newScore.value.file_url = uploadResponse.data.url;
      newScore.value.filename = uploadResponse.data.savedFilename;
    } else {
      alert("PDF 파일을 선택해주세요.");
      loading.value = false;
      return;
    }

    // 악보 정보 저장
    await scoreApi.create(newScore.value);
    alert("악보가 추가되었습니다!");
    cancelAdd();
    await fetchScores(); // 목록 새로고침
  } catch (error) {
    console.error("❌ 악보 추가 실패:", error);
    alert("악보 추가에 실패했습니다");
  } finally {
    loading.value = false;
  }
};

const cancelAdd = () => {
  showAddForm.value = false;
  newScore.value = {
    title: "",
    song_key: "",
    bpm: 0,
    category: "",
    file_url: "",
    filename: "",
    is_original: true,
    description: "",
  };
};

// Edit score
const startEdit = (score: Score) => {
  editingScore.value = { ...score };
  showAddForm.value = false;
};

const handleUpdateScore = async () => {
  if (!editingScore.value) return;

  loading.value = true;
  try {
    const { id, ...updateData } = editingScore.value;
    await scoreApi.update(id, updateData);
    alert("악보가 수정되었습니다!");
    cancelEdit();
    await fetchScores(); // 목록 새로고침
  } catch (error) {
    console.error("❌ 악보 수정 실패:", error);
    alert("악보 수정에 실패했습니다");
  } finally {
    loading.value = false;
  }
};

const cancelEdit = () => {
  editingScore.value = null;
};

// Delete sheet music
const handleDelete = async (id: number) => {
  if (!confirm("정말 이 악보를 삭제하시겠습니까?")) return;

  loading.value = true;
  try {
    await scoreApi.delete(id);
    alert("악보가 삭제되었습니다!");
    await fetchScores(); // 목록 새로고침
  } catch (error) {
    console.error("❌ 악보 삭제 실패:", error);
    alert("악보 삭제에 실패했습니다");
  } finally {
    loading.value = false;
  }
};

// Download sheet music
const handleDownload = async (score: Score) => {
  if (!isLoggedIn.value) {
    alert("로그인이 필요합니다");
    return;
  }

  try {
    // DB에서 파일을 다운로드 (다운로드 수도 자동 증가)
    const response = await scoreApi.downloadFile(score.id);

    // Blob 데이터를 다운로드
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", score.filename || `score.pdf`);
    document.body.appendChild(link);
    link.click();
    link.parentNode?.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error("❌ 다운로드 실패:", error);
    alert("다운로드에 실패했습니다");
  }
};

// 초기 로드
onMounted(() => {
  fetchScores();
});
</script>

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
            <span class="field-label">곡 제목 *</span>
            <input
              v-model="newScore.title"
              type="text"
              placeholder="곡 제목을 입력하세요"
              required
            />
          </label>

          <label class="field">
            <span class="field-label">Key *</span>
            <select v-model="newScore.song_key" required>
              <option value="">선택하세요</option>
              <option v-for="k in availableKeys" :key="k" :value="k">
                {{ k }}
              </option>
            </select>
          </label>

          <label class="field">
            <span class="field-label">BPM *</span>
            <input
              v-model.number="newScore.bpm"
              type="number"
              placeholder="예: 72"
              min="40"
              max="240"
              required
            />
          </label>

          <!-- 로딩 -->
          <div v-if="loading" class="loading">
            <div class="loading-spinner"></div>
            <p>불러오는 중...</p>
          </div>
          <label class="field">
            <span class="field-label">카테고리 / 집회 *</span>
            <input
              v-model="newScore.category"
              type="text"
              placeholder="보혈집회 2025-03 등"
              required
            />
          </label>

          <div class="form-row">
            <label class="field">
              <span class="field-label">설명</span>
              <textarea
                v-model="newScore.description"
                placeholder="악보에 대한 설명"
                rows="3"
              />
            </label>

            <label class="field">
              <span class="field-label">악보 파일 *</span>
              <input
                type="file"
                @change="handleFileChange"
                accept=".pdf"
                required
              />
            </label>

            <label class="field field-checkbox">
              <input type="checkbox" v-model="newScore.is_original" />
              <span>자작곡</span>
            </label>
          </div>

          <div class="form-actions">
            <button class="btn" type="button" @click="cancelAdd">취소</button>
            <button class="btn primary" type="submit" :disabled="loading">
              {{ loading ? "저장 중..." : "저장" }}
            </button>
          </div>
        </form>
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
            <select v-model="editingScore.song_key" required>
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
            <button class="btn primary" type="submit" :disabled="loading">
              {{ loading ? "수정 중..." : "수정 완료" }}
            </button>
          </div>
        </form>
      </div>

      <!-- filter -->
      <div class="filters-container">
        <div class="filter-group">
          <label class="field field--inline">
            <span class="field-label">검색</span>
            <input v-model="keyword" type="text" placeholder="곡 제목 검색" />
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

      <!-- 로딩 -->
      <div v-if="loading" class="loading">
        <div class="loading-spinner"></div>
        <p>불러오는 중...</p>
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
              <td>{{ s.song_key }}</td>
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
