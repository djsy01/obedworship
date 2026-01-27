<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useAuth } from "@/composables/useAuth";
import { mypageApi, ticketApplicationApi, worshipApi } from "@/api/axios";
import type { UserProfile, UserQna, ScoreDownload } from "@/api/mypage";
import "../styles/MyPage.css";

type ApplicationStatus = "PENDING" | "CONFIRMED" | "CANCELLED";

type DisplayApplication = {
  id: number;
  worship_id: number;
  worship_title: string;
  worship_date: string;
  worship_place: string;
  user_name: string;
  user_email: string;
  party_size: number;
  status: ApplicationStatus;
  memo?: string;
  applied_at: string;
  created_at: string;
};

const router = useRouter();
const { isLoggedIn, isAdmin } = useAuth();

//state management
const loading = ref(true);
const error = ref(false);

// user information
const profile = ref<UserProfile | null>(null);
const userId = ref<number | null>(null);

// Application details
const myApplications = ref<DisplayApplication[]>([]);
const allApplications = ref<DisplayApplication[]>([]);

// Q&A and download
const myQnas = ref<UserQna[]>([]);
const myDownloads = ref<ScoreDownload[]>([]);

//statistics
const stats = ref({
  totalApplications: 0,
  confirmedApplications: 0,
  totalQnas: 0,
  answeredQnas: 0,
  totalDownloads: 0,
});

const userName = computed(() => profile.value?.name || "");
const userEmail = computed(() => profile.value?.email || "");
const userPhone = computed(() => profile.value?.phone || "");
const userAffiliation = computed(
  () => profile.value?.members?.[0]?.affiliation || "",
);
const userJoinDate = computed(() => {
  if (!profile.value?.created_at) return "";
  return new Date(profile.value.created_at).toLocaleDateString("ko-KR");
});
const userInitial = computed(() => userName.value.charAt(0) || "?");

// modal state
const showEditProfile = ref(false);
const showChangePassword = ref(false);
const showAdminApplications = ref(false);
const showDetailModal = ref(false);

// filter
const applicationFilter = ref<"all" | ApplicationStatus>("all");

// form data
const editForm = ref({
  name: "",
  phone: "",
  affiliation: "",
});

const passwordForm = ref({
  current: "",
  new: "",
  confirm: "",
});

const selectedApplication = ref<DisplayApplication | null>(null);

// load user id
const loadUserId = () => {
  const userStr = localStorage.getItem("user");
  if (userStr) {
    const user = JSON.parse(userStr);
    userId.value = user.userId ? parseInt(user.userId) : null;
  }
};

// load data
const fetchDashboard = async () => {
  if (!userId.value) {
    error.value = true;
    loading.value = false;
    return;
  }

  loading.value = true;
  error.value = false;

  try {
    const response = await mypageApi.getDashboard(userId.value);
    const data = response.data;

    profile.value = data.profile;
    stats.value = data.stats;
    myQnas.value = data.qnas;
    myDownloads.value = data.downloads;

    // Convert application details
    myApplications.value = data.applications.map((app) => ({
      id: app.id,
      worship_id: app.ticket_id,
      worship_title: app.tickets?.title || "집회",
      worship_date: app.tickets?.date || "",
      worship_place: app.tickets?.place || "예수인교회 본관 지하 2층",
      user_name: app.applicant_name,
      user_email: app.applicant_email || "",
      party_size: app.party_size,
      status: app.status,
      memo: app.memo,
      applied_at: app.created_at,
      created_at: app.created_at,
    }));

    // Form initialization
    editForm.value = {
      name: profile.value?.name || "",
      phone: profile.value?.phone || "",
      affiliation: profile.value?.members?.[0]?.affiliation || "",
    };
  } catch (err) {
    console.error("대시보드 로드 실패:", err);
    error.value = true;
  } finally {
    loading.value = false;
  }
};

// Total application status (for administrator)
const fetchAllApplications = async () => {
  try {
    const response = await ticketApplicationApi.getAll();
    allApplications.value = response.data.map((app) => ({
      id: app.id,
      worship_id: app.ticket_id,
      worship_title: app.tickets?.title || "집회",
      worship_date: app.tickets?.date || "",
      worship_place: app.tickets?.place || "예수인교회 본관 지하 2층",
      user_name: app.applicant_name,
      user_email: app.applicant_email || "",
      party_size: app.party_size,
      status: app.status,
      memo: app.memo,
      applied_at: app.created_at,
      created_at: app.created_at,
    }));
  } catch (err) {
    console.error("전체 신청 현황 로드 실패:", err);
  }
};

// Filtered application details
const filteredApplications = computed(() => {
  if (applicationFilter.value === "all") {
    return myApplications.value;
  }
  return myApplications.value.filter(
    (app) => app.status === applicationFilter.value,
  );
});

// Admin Statistics
const totalWorships = ref(0);
const totalApplications = computed(() => allApplications.value.length);
const totalPartySize = computed(() =>
  allApplications.value.reduce((sum, app) => sum + app.party_size, 0),
);

// initial load
onMounted(async () => {
  if (!isLoggedIn.value) {
    router.push("/login");
    return;
  }

  loadUserId();
  await fetchDashboard();

  if (isAdmin.value) {
    await fetchAllApplications();
    // Fetch total worship count for admin dashboard
    try {
      const worshipRes = await worshipApi.getAll();
      totalWorships.value = worshipRes.data.length;
    } catch (err) {
      console.error("Failed to fetch worship count:", err);
    }
  }
});

// empty message
const emptyMessage = computed(() => {
  if (applicationFilter.value === "all") {
    return "아직 신청한 집회가 없습니다";
  }
  const statusText: Record<ApplicationStatus, string> = {
    PENDING: "대기중인",
    CONFIRMED: "승인완료된",
    CANCELLED: "취소된",
  };
  return `${statusText[applicationFilter.value]} 신청 내역이 없습니다`;
});

// status text
const getStatusText = (status: ApplicationStatus) => {
  switch (status) {
    case "PENDING":
      return "대기중";
    case "CONFIRMED":
      return "승인완료";
    case "CANCELLED":
      return "취소됨";
  }
};

// date format
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// edit information
const closeEditProfile = () => {
  showEditProfile.value = false;
};

const handleUpdateProfile = async () => {
  if (!userId.value) return;

  try {
    await mypageApi.updateProfile(userId.value, {
      name: editForm.value.name,
      phone: editForm.value.phone,
    });

    // update local state
    if (profile.value) {
      profile.value.name = editForm.value.name;
      profile.value.phone = editForm.value.phone;
    }

    // also update localStorage
    localStorage.setItem("userName", editForm.value.name);

    alert("정보가 수정되었습니다!");
    closeEditProfile();
  } catch (err) {
    console.error("프로필 수정 실패:", err);
    alert("정보 수정에 실패했습니다.");
  }
};

// change password
const closeChangePassword = () => {
  showChangePassword.value = false;
  passwordForm.value = { current: "", new: "", confirm: "" };
};

const handleChangePassword = () => {
  if (passwordForm.value.new !== passwordForm.value.confirm) {
    alert("새 비밀번호가 일치하지 않습니다.");
    return;
  }

  // TODO: Implementation after completion of authentication API
  alert("비밀번호 변경 기능은 준비 중입니다.");
  closeChangePassword();
};

// Cancel application
const cancelApplication = async (id: number) => {
  if (!confirm("정말 이 신청을 취소하시겠습니까?")) return;

  try {
    await ticketApplicationApi.cancel(id);
    const app = myApplications.value.find((a) => a.id === id);
    if (app) {
      app.status = "CANCELLED";
    }
    alert("신청이 취소되었습니다.");
  } catch (err) {
    console.error("신청 취소 실패:", err);
    alert("신청 취소에 실패했습니다.");
  }
};

// Administrator: Approval of application
const approveApplication = async (id: number) => {
  try {
    await ticketApplicationApi.updateStatus(id, "CONFIRMED");
    const app = allApplications.value.find((a) => a.id === id);
    if (app) {
      app.status = "CONFIRMED";
    }
    alert("신청이 승인되었습니다.");
  } catch (err) {
    console.error("신청 승인 실패:", err);
    alert("신청 승인에 실패했습니다.");
  }
};

// Administrator: Cancel application
const cancelApplicationAdmin = async (id: number) => {
  if (!confirm("이 신청을 취소하시겠습니까?")) return;

  try {
    await ticketApplicationApi.updateStatus(id, "CANCELLED");
    const app = allApplications.value.find((a) => a.id === id);
    if (app) {
      app.status = "CANCELLED";
    }
    alert("신청이 취소되었습니다.");
  } catch (err) {
    console.error("신청 취소 실패:", err);
    alert("신청 취소에 실패했습니다.");
  }
};

// Administrator application status modal
const closeAdminApplications = () => {
  showAdminApplications.value = false;
};

// View details
const viewApplicationDetail = (app: DisplayApplication) => {
  selectedApplication.value = app;
  showDetailModal.value = true;
};

const closeDetailModal = () => {
  showDetailModal.value = false;
  selectedApplication.value = null;
};
</script>

<template>
  <div class="page">
    <section class="section">
      <div class="section-header">
        <div>
          <h1 class="section-title">마이페이지</h1>
          <p class="section-subtitle">
            내 정보를
            <!--와 집회 신청 내역을-->
            확인하고 관리할 수 있습니다.
          </p>
        </div>
      </div>

      <!-- Loading status -->
      <div v-if="loading" class="loading">로딩 중...</div>

      <!-- Error status -->
      <div v-else-if="error" class="error-message">
        <p>정보를 가져오지 못했습니다.</p>
        <button class="btn primary" @click="fetchDashboard">다시 시도</button>
      </div>

      <!-- Basic information section -->
      <div v-else class="mypage-grid">
        <!-- profile card -->
        <div class="profile-card">
          <div class="profile-header">
            <div class="profile-avatar">
              {{ userInitial }}
            </div>
            <div class="profile-info">
              <h2 class="profile-name">{{ userName }}</h2>
              <p class="profile-role">
                {{ isAdmin ? "관리자" : "일반 사용자" }}
              </p>
            </div>
          </div>

          <div class="profile-details">
            <div class="detail-item">
              <span class="detail-label">이메일</span>
              <span class="detail-value">{{ userEmail }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">연락처</span>
              <span class="detail-value">{{ userPhone || "미등록" }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">소속</span>
              <span class="detail-value">{{
                userAffiliation || "미등록"
              }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">가입일</span>
              <span class="detail-value">{{ userJoinDate }}</span>
            </div>
          </div>

          <div class="profile-actions">
            <button class="btn small" @click="showEditProfile = true">
              ✏️ 정보 수정
            </button>
            <button class="btn small" @click="showChangePassword = true">
              🔒 비밀번호 변경
            </button>
          </div>
        </div>

        <!-- Administrator-only dashboard -->
        <div v-if="isAdmin" class="admin-dashboard-card">
          <h3 class="card-title">관리자 대시보드</h3>

          <div class="dashboard-stats">
            <div class="stat-box">
              <div class="stat-icon">📅</div>
              <div class="stat-info">
                <span class="stat-label">전체 집회</span>
                <span class="stat-value">{{ totalWorships }}</span>
              </div>
            </div>

            <div class="stat-box">
              <div class="stat-icon">👥</div>
              <div class="stat-info">
                <span class="stat-label">총 신청자</span>
                <span class="stat-value">{{ totalApplications }}</span>
              </div>
            </div>

            <div class="stat-box">
              <div class="stat-icon">🎫</div>
              <div class="stat-info">
                <span class="stat-label">총 인원</span>
                <span class="stat-value">{{ totalPartySize }}</span>
              </div>
            </div>
          </div>

          <div class="dashboard-actions">
            <RouterLink to="/tickets" class="btn primary small">
              📋 집회 관리
            </RouterLink>
            <button class="btn small" @click="showAdminApplications = true">
              👥 신청 현황 보기
            </button>
          </div>
        </div>
      </div>

      <!-- Meeting application details - Added later 
      <div class="applications-section">
        <div class="section-header-inline">
          <h2 class="section-title-sub">내 신청 내역</h2>
          <div class="filter-tabs">
            <button
              class="filter-tab"
              :class="{ active: applicationFilter === 'all' }"
              @click="applicationFilter = 'all'"
            >
              전체
            </button>
            <button
              class="filter-tab"
              :class="{ active: applicationFilter === 'PENDING' }"
              @click="applicationFilter = 'PENDING'"
            >
              대기중
            </button>
            <button
              class="filter-tab"
              :class="{ active: applicationFilter === 'CONFIRMED' }"
              @click="applicationFilter = 'CONFIRMED'"
            >
              승인완료
            </button>
            <button
              class="filter-tab"
              :class="{ active: applicationFilter === 'CANCELLED' }"
              @click="applicationFilter = 'CANCELLED'"
            >
              취소됨
            </button>
          </div>
        </div>
        

        <div v-if="filteredApplications.length > 0" class="applications-list">
          <div
            v-for="app in filteredApplications"
            :key="app.id"
            class="application-card"
          >
            <div class="application-header">
              <div class="application-title-section">
                <h3 class="application-worship-title">
                  {{ app.worship_title }}
                </h3>
                <span class="application-status" :data-status="app.status">
                  {{ getStatusText(app.status) }}
                </span>
              </div>
              <p class="application-date-info">{{ app.worship_date }}</p>
            </div>

            <div class="application-body">
              <div class="application-details">
                <div class="detail-row">
                  <span class="detail-label">장소</span>
                  <span class="detail-value">{{ app.worship_place }}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">신청일</span>
                  <span class="detail-value">{{
                    formatDate(app.applied_at)
                  }}</span>
                </div>
              </div>

              <div class="application-total">
                <span class="total-label">신청 인원</span>
                <span class="total-value">{{ app.party_size }}명</span>
              </div>

              <div v-if="app.memo" class="special-note">
                <span class="note-label">메모:</span>
                <span class="note-value">{{ app.memo }}</span>
              </div>
            </div>

            <div class="application-actions">
              <button
                v-if="app.status === 'PENDING' || app.status === 'CONFIRMED'"
                class="btn small danger"
                @click="cancelApplication(app.id)"
              >
                🗑️ 신청 취소
              </button>
              <button class="btn small" @click="viewApplicationDetail(app)">
                📄 상세 보기
              </button>
            </div>
          </div>
        </div>

        <div v-else class="empty-applications">
          <div class="empty-icon">📋</div>
          <h3>{{ emptyMessage }}</h3>
          <p>집회 신청 페이지에서 다가오는 집회를 신청해보세요!</p>
          <RouterLink to="/tickets" class="btn primary">
            집회 신청하러 가기
          </RouterLink>
        </div>
      </div>
      -->
    </section>

    <!-- Edit Info Modal -->
    <div v-if="showEditProfile" class="modal-overlay" @click="closeEditProfile">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2 class="modal-title">내 정보 수정</h2>
          <button class="modal-close" @click="closeEditProfile">✕</button>
        </div>
        <div class="modal-body">
          <form class="form-grid" @submit.prevent="handleUpdateProfile">
            <label class="field field--full">
              <span class="field-label">이름</span>
              <input v-model="editForm.name" type="text" required />
            </label>

            <label class="field field--full">
              <span class="field-label">연락처</span>
              <input
                v-model="editForm.phone"
                type="tel"
                placeholder="010-0000-0000"
              />
            </label>

            <label class="field field--full">
              <span class="field-label">소속</span>
              <select v-model="editForm.affiliation">
                <option value="">선택하세요</option>
                <option value="영유아">영유아</option>
                <option value="청소년">청소년</option>
                <option value="청년">청년</option>
                <option value="장년">장년</option>
              </select>
            </label>

            <div class="form-actions">
              <button class="btn" type="button" @click="closeEditProfile">
                취소
              </button>
              <button class="btn primary" type="submit">저장</button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Change password modal -->
    <div
      v-if="showChangePassword"
      class="modal-overlay"
      @click="closeChangePassword"
    >
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2 class="modal-title">비밀번호 변경</h2>
          <button class="modal-close" @click="closeChangePassword">✕</button>
        </div>
        <div class="modal-body">
          <form class="form-grid" @submit.prevent="handleChangePassword">
            <label class="field field--full">
              <span class="field-label">현재 비밀번호</span>
              <input v-model="passwordForm.current" type="password" required />
            </label>

            <label class="field field--full">
              <span class="field-label">새 비밀번호</span>
              <input v-model="passwordForm.new" type="password" required />
            </label>

            <label class="field field--full">
              <span class="field-label">새 비밀번호 확인</span>
              <input v-model="passwordForm.confirm" type="password" required />
            </label>

            <div class="form-actions">
              <button class="btn" type="button" @click="closeChangePassword">
                취소
              </button>
              <button class="btn primary" type="submit">변경</button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Administrator: All application status modal -->
    <div
      v-if="showAdminApplications && isAdmin"
      class="modal-overlay"
      @click="closeAdminApplications"
    >
      <div class="modal-content admin-applications-modal" @click.stop>
        <div class="modal-header">
          <h2 class="modal-title">전체 신청 현황</h2>
          <button class="modal-close" @click="closeAdminApplications">✕</button>
        </div>
        <div class="modal-body">
          <div class="admin-applications-list">
            <div
              v-for="app in allApplications"
              :key="app.id"
              class="admin-application-item"
            >
              <div class="admin-app-header">
                <span class="admin-app-user">{{ app.user_name }}</span>
                <span class="application-status" :data-status="app.status">
                  {{ getStatusText(app.status) }}
                </span>
              </div>
              <div class="admin-app-body">
                <p class="admin-app-worship">
                  {{ app.worship_title }} ({{ app.worship_date }})
                </p>
                <p class="admin-app-tickets">
                  신청 인원: {{ app.party_size }}명
                </p>
              </div>
              <div class="admin-app-actions">
                <button
                  v-if="app.status === 'PENDING'"
                  class="btn small primary"
                  @click="approveApplication(app.id)"
                >
                  ✅ 승인
                </button>
                <button
                  class="btn small danger"
                  @click="cancelApplicationAdmin(app.id)"
                >
                  ❌ 취소
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Application details modal -->
    <div v-if="showDetailModal" class="modal-overlay" @click="closeDetailModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2 class="modal-title">신청 상세 정보</h2>
          <button class="modal-close" @click="closeDetailModal">✕</button>
        </div>
        <div class="modal-body" v-if="selectedApplication">
          <div class="detail-section">
            <h3 class="detail-section-title">집회 정보</h3>
            <div class="detail-grid">
              <div class="detail-item-full">
                <span class="detail-label">집회명</span>
                <span class="detail-value">{{
                  selectedApplication.worship_title
                }}</span>
              </div>
              <div class="detail-item-full">
                <span class="detail-label">날짜</span>
                <span class="detail-value">{{
                  selectedApplication.worship_date
                }}</span>
              </div>
              <div class="detail-item-full">
                <span class="detail-label">장소</span>
                <span class="detail-value">{{
                  selectedApplication.worship_place
                }}</span>
              </div>
            </div>
          </div>

          <div class="detail-section">
            <h3 class="detail-section-title">신청 정보</h3>
            <div class="detail-grid">
              <div class="detail-item-full">
                <span class="detail-label">신청 인원</span>
                <span class="detail-value"
                  >{{ selectedApplication.party_size }}명</span
                >
              </div>
              <div class="detail-item-full">
                <span class="detail-label">신청일</span>
                <span class="detail-value">{{
                  formatDate(selectedApplication.created_at)
                }}</span>
              </div>
              <div class="detail-item-full">
                <span class="detail-label">상태</span>
                <span
                  class="application-status"
                  :data-status="selectedApplication.status"
                >
                  {{ getStatusText(selectedApplication.status) }}
                </span>
              </div>
            </div>
          </div>

          <div v-if="selectedApplication.memo" class="detail-section">
            <h3 class="detail-section-title">메모</h3>
            <p class="special-note-text">
              {{ selectedApplication.memo }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
