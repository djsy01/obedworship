<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { qnaApi, type Qna, type CreateQnaDto } from "@/api/axios";
import "../styles/qna.css";

// State Management
const qnaList = ref<Qna[]>([]);
const loading = ref(false);
const selectedCategory = ref<"all" | "집회" | "악보" | "기타">("all");

// Check login status
const currentUser = ref<{ userId: string; name: string; role: string } | null>(
  null,
);

// Login or not
const isLoggedIn = computed(() => currentUser.value !== null);

// 관리자 여부 확인
const isAdmin = computed(() => currentUser.value?.role === "admin");

// Login check
const checkAuth = () => {
  const userStr = localStorage.getItem("user");
  if (userStr) {
    currentUser.value = JSON.parse(userStr);
  }
};

// New QnA form
const showAskPanel = ref(false);
const newQna = ref<CreateQnaDto>({
  user_id: currentUser.value?.userId || "",
  category: "집회",
  title: "",
  content: "",
});

// Edit answer
const editingAnswerId = ref<number | null>(null);
const answerText = ref("");

// statistics
const stats = ref({
  total: 0,
  waiting: 0,
  answered: 0,
});

// View all
const fetchQnaList = async () => {
  loading.value = true;
  try {
    const response = await qnaApi.getAll();
    qnaList.value = response.data;
    updateStats();
  } catch (error) {
    console.error("❌ QnA 조회 실패:", error);
  } finally {
    loading.value = false;
  }
};

// Search by category
const fetchByCategory = async (category: "집회" | "악보" | "기타") => {
  loading.value = true;
  try {
    const response = await qnaApi.getByCategory(category);
    qnaList.value = response.data;
    updateStats();
  } catch (error) {
    console.error("❌ 카테고리별 조회 실패:", error);
  } finally {
    loading.value = false;
  }
};

// Category Filter
const handleCategoryFilter = (category: typeof selectedCategory.value) => {
  selectedCategory.value = category;
  if (category === "all") {
    fetchQnaList();
  } else {
    fetchByCategory(category);
  }
};

// Create Q&A
const createQna = async () => {
  // Check login
  if (!isLoggedIn.value) {
    alert("로그인이 필요합니다");
    return;
  }

  if (!newQna.value.title.trim() || !newQna.value.content.trim()) {
    alert("제목과 내용을 입력해주세요");
    return;
  }

  // Set the currently logged in user ID
  newQna.value.user_id = currentUser.value!.userId;

  try {
    await qnaApi.create(newQna.value);
    alert("질문이 등록되었습니다!");

    // Form initialization
    newQna.value.title = "";
    newQna.value.content = "";
    showAskPanel.value = false;

    await fetchQnaList();
  } catch (error) {
    console.error("❌ QnA 생성 실패:", error);
    alert("질문 등록에 실패했습니다");
  }
};

// Start editing your answer (administrator only)
const startAnswerEdit = (id: number, currentAnswer: string | null) => {
  if (!isAdmin.value) {
    alert("관리자만 답변을 작성할 수 있습니다");
    return;
  }
  editingAnswerId.value = id;
  answerText.value = currentAnswer || "";
};

// Save answer (administrator only)
const saveAnswer = async (id: number) => {
  if (!isAdmin.value) {
    alert("관리자만 답변을 작성할 수 있습니다");
    return;
  }

  if (!answerText.value.trim()) {
    alert("답변을 입력해주세요");
    return;
  }

  try {
    await qnaApi.answer(id, { answer: answerText.value });
    alert("답변이 등록되었습니다!");
    editingAnswerId.value = null;
    answerText.value = "";
    await fetchQnaList();
  } catch (error) {
    console.error("❌ 답변 등록 실패:", error);
    alert("답변 등록에 실패했습니다");
  }
};

// Cancel Edit Answer
const cancelAnswerEdit = () => {
  editingAnswerId.value = null;
  answerText.value = "";
};

// Delete Q&A (Author only)
const deleteQna = async (id: number, authorId: string) => {
  // Verify your identity
  if (currentUser.value?.userId !== authorId) {
    alert("본인이 작성한 글만 삭제할 수 있습니다");
    return;
  }

  if (!confirm("정말 삭제하시겠습니까?")) return;

  try {
    await qnaApi.delete(id);
    alert("삭제되었습니다!");
    await fetchQnaList();
  } catch (error) {
    console.error("❌ 삭제 실패:", error);
    alert("삭제에 실패했습니다");
  }
};

// Show author (Only you or your administrator will see your entire ID)
const displayUserId = (userId: string) => {
  // Display the entire ID only if the post was written by you (if you are an administrator, display the entire ID)
  if (currentUser.value?.userId === userId || isAdmin.value) {
    return userId;
  }

  // mask everything else
  return userId.substring(0, 3) + "***";
};

// Whether to display the delete button (only you)
const canDelete = (authorId: string) => {
  return currentUser.value?.userId === authorId;
};

// Statistical updates
const updateStats = () => {
  stats.value.total = qnaList.value.length;
  stats.value.waiting = qnaList.value.filter(
    (q) => q.status === "WAITING",
  ).length;
  stats.value.answered = qnaList.value.filter(
    (q) => q.status === "ANSWERED",
  ).length;
};

// date format
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// initial load
onMounted(() => {
  checkAuth();
  fetchQnaList();
});
</script>

<template>
  <div class="page">
    <div class="section">
      <div class="page-container">
        <div class="page-header">
          <h1 class="page-title">Q&A</h1>
          <p class="page-description">궁금한 점을 질문해주세요</p>
        </div>

        <!-- Statistics -->
        <div class="qna-stats">
          <div class="stat-card">
            <div class="stat-label">전체 질문</div>
            <div class="stat-value">{{ stats.total }}</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">답변 대기</div>
            <div class="stat-value">{{ stats.waiting }}</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">답변 완료</div>
            <div class="stat-value">{{ stats.answered }}</div>
          </div>
        </div>

        <!-- Filter -->
        <div class="qna-filters">
          <button
            class="filter-btn"
            :class="{ active: selectedCategory === 'all' }"
            @click="handleCategoryFilter('all')"
          >
            <span>전체</span>
          </button>
          <button
            class="filter-btn"
            :class="{ active: selectedCategory === '집회' }"
            @click="handleCategoryFilter('집회')"
          >
            <span>집회</span>
          </button>
          <button
            class="filter-btn"
            :class="{ active: selectedCategory === '악보' }"
            @click="handleCategoryFilter('악보')"
          >
            <span>악보</span>
          </button>
          <button
            class="filter-btn"
            :class="{ active: selectedCategory === '기타' }"
            @click="handleCategoryFilter('기타')"
          >
            <span>기타</span>
          </button>

          <!-- Button branching depending on login status -->
          <button
            v-if="isLoggedIn"
            class="filter-btn"
            @click="showAskPanel = !showAskPanel"
          >
            <span>{{ showAskPanel ? "질문 취소" : "질문하기" }}</span>
          </button>
          <button
            v-else
            class="filter-btn"
            disabled
            style="opacity: 0.5; cursor: not-allowed"
          >
            <span>로그인 후 질문하기</span>
          </button>
        </div>

        <!-- Question creation panel (login only) -->
        <div v-if="showAskPanel && isLoggedIn" class="qna-ask-panel">
          <h2>새 질문 작성</h2>

          <div class="form-group">
            <label class="field-label">카테고리</label>
            <select v-model="newQna.category" class="form-input">
              <option value="집회">집회</option>
              <option value="악보">악보</option>
              <option value="기타">기타</option>
            </select>
          </div>

          <div class="form-group">
            <label class="field-label">제목</label>
            <input
              v-model="newQna.title"
              type="text"
              placeholder="제목을 입력하세요"
              class="form-input"
            />
          </div>

          <div class="form-group">
            <label class="field-label">내용</label>
            <textarea
              v-model="newQna.content"
              placeholder="내용을 입력하세요"
              class="form-textarea"
              rows="5"
            />
          </div>

          <div class="form-actions">
            <button class="btn btn--primary" @click="createQna">
              질문 등록
            </button>
            <button class="btn btn--secondary" @click="showAskPanel = false">
              취소
            </button>
          </div>
        </div>

        <!-- Loading -->
        <div v-if="loading" class="qna-loading">
          <div class="loading-spinner"></div>
          <p>불러오는 중...</p>
        </div>

        <!-- QnA list -->
        <div v-else-if="qnaList.length > 0" class="qna-list">
          <div v-for="qna in qnaList" :key="qna.id" class="qna-card">
            <!-- header -->
            <div class="qna-header">
              <span class="qna-category">{{ qna.category }}</span>
              <h3 class="qna-title">{{ qna.title }}</h3>
            </div>

            <!-- Meta information (ID masking applied) -->
            <div class="qna-meta">
              <span class="qna-meta-item">
                <span class="qna-meta-icon">👤</span>
                {{ displayUserId(qna.user_id) }}
              </span>
              <span class="qna-meta-item">
                <span class="qna-meta-icon">📅</span>
                {{ formatDate(qna.created_at) }}
              </span>
              <span class="qna-status" :data-status="qna.status">
                {{ qna.status === "ANSWERED" ? "답변완료" : "답변대기" }}
              </span>
            </div>

            <!-- Question content -->
            <div class="qna-question">
              {{ qna.content }}
            </div>

            <!-- Reply -->
            <div
              v-if="qna.answer && editingAnswerId !== qna.id"
              class="qna-answer"
            >
              <div class="qna-answer-label">관리자 답변</div>
              <div class="qna-answer-content">{{ qna.answer }}</div>
              <div class="qna-answer-meta">
                {{ qna.answer_date ? formatDate(qna.answer_date) : "" }}
              </div>
            </div>

            <!-- Answer Edit Panel (Administrators only) -->
            <div v-if="editingAnswerId === qna.id" class="panel--inline">
              <label class="field-label">답변 작성</label>
              <textarea v-model="answerText" class="form-textarea" rows="4" />
              <div class="form-actions">
                <button class="btn btn--primary" @click="saveAnswer(qna.id)">
                  저장
                </button>
                <button class="btn btn--secondary" @click="cancelAnswerEdit">
                  취소
                </button>
              </div>
            </div>

            <!-- Administrator Action -->
            <div class="qna-admin-actions">
              <!-- Reply button (administrators only) -->
              <button
                v-if="isAdmin && editingAnswerId !== qna.id"
                class="btn btn--primary btn--sm"
                @click="startAnswerEdit(qna.id, qna.answer)"
              >
                {{ qna.answer ? "답변 수정" : "답변하기" }}
              </button>

              <!-- Delete button (author only) -->
              <button
                v-if="canDelete(qna.user_id)"
                class="btn btn--danger btn--sm"
                @click="deleteQna(qna.id, qna.user_id)"
              >
                삭제
              </button>
            </div>
          </div>
        </div>

        <!-- empty state -->
        <div v-else class="qna-empty">
          <div class="qna-empty-icon">💬</div>
          <h3>등록된 질문이 없습니다</h3>
          <p>첫 번째 질문을 남겨보세요!</p>
        </div>
      </div>
    </div>
  </div>
</template>
