<template>
  <div class="page">
    <section class="section">
      <div class="section-header">
        <div>
          <h1 class="section-title">마이페이지</h1>
          <p class="section-subtitle">
            내 정보와 집회 신청 내역을 확인하고 관리할 수 있습니다.
          </p>
        </div>
      </div>

      <!-- Basic information section -->
      <div class="mypage-grid">
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
                <span class="stat-label">총 티켓</span>
                <span class="stat-value">{{ totalTickets }}</span>
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

      <!-- Meeting application details -->
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
              :class="{ active: applicationFilter === 'CANCELED' }"
              @click="applicationFilter = 'CANCELED'"
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

              <div class="ticket-summary">
                <h4 class="ticket-summary-title">티켓 내역</h4>
                <div class="ticket-items">
                  <div v-if="app.infant_child_count > 0" class="ticket-item">
                    <span class="ticket-type">영유아</span>
                    <span class="ticket-count"
                      >{{ app.infant_child_count }}장</span
                    >
                  </div>
                  <div v-if="app.teen_count > 0" class="ticket-item">
                    <span class="ticket-type">청소년</span>
                    <span class="ticket-count">{{ app.teen_count }}장</span>
                  </div>
                  <div v-if="app.military_count > 0" class="ticket-item">
                    <span class="ticket-type">군인</span>
                    <span class="ticket-count">{{ app.military_count }}장</span>
                  </div>
                  <div v-if="app.adult_count > 0" class="ticket-item">
                    <span class="ticket-type">어른</span>
                    <span class="ticket-count">{{ app.adult_count }}장</span>
                  </div>
                </div>
              </div>

              <div class="application-total">
                <span class="total-label">총 티켓</span>
                <span class="total-value">{{ app.total_ticket_count }}장</span>
                <span class="total-label">총 금액</span>
                <span class="total-value amount"
                  >{{ app.total_amount.toLocaleString() }}원</span
                >
              </div>

              <div v-if="app.special_note" class="special-note">
                <span class="note-label">특이사항:</span>
                <span class="note-value">{{ app.special_note }}</span>
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
                <option value="영아부">영아부</option>
                <option value="유치부">유치부</option>
                <option value="유년부">유년부</option>
                <option value="초등부">초등부</option>
                <option value="중등부">중등부</option>
                <option value="고등부">고등부</option>
                <option value="청년부">청년부</option>
                <option value="장년부">장년부</option>
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
                  총 {{ app.total_ticket_count }}장 /
                  {{ app.total_amount.toLocaleString() }}원
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
            <h3 class="detail-section-title">티켓 정보</h3>
            <div class="ticket-detail-list">
              <div
                v-if="selectedApplication.infant_child_count > 0"
                class="ticket-detail-item"
              >
                <span class="ticket-type">영유아</span>
                <span class="ticket-count"
                  >{{ selectedApplication.infant_child_count }}장</span
                >
                <span class="ticket-price">0원</span>
              </div>
              <div
                v-if="selectedApplication.teen_count > 0"
                class="ticket-detail-item"
              >
                <span class="ticket-type">청소년</span>
                <span class="ticket-count"
                  >{{ selectedApplication.teen_count }}장</span
                >
                <span class="ticket-price"
                  >{{
                    (selectedApplication.teen_count * 5000).toLocaleString()
                  }}원</span
                >
              </div>
              <div
                v-if="selectedApplication.military_count > 0"
                class="ticket-detail-item"
              >
                <span class="ticket-type">군인</span>
                <span class="ticket-count"
                  >{{ selectedApplication.military_count }}장</span
                >
                <span class="ticket-price"
                  >{{
                    (
                      selectedApplication.military_count * 5000
                    ).toLocaleString()
                  }}원</span
                >
              </div>
              <div
                v-if="selectedApplication.adult_count > 0"
                class="ticket-detail-item"
              >
                <span class="ticket-type">어른</span>
                <span class="ticket-count"
                  >{{ selectedApplication.adult_count }}장</span
                >
                <span class="ticket-price"
                  >{{
                    (selectedApplication.adult_count * 10000).toLocaleString()
                  }}원</span
                >
              </div>
            </div>
            <div class="ticket-total">
              <span>총 {{ selectedApplication.total_ticket_count }}장</span>
              <span class="total-amount"
                >{{ selectedApplication.total_amount.toLocaleString() }}원</span
              >
            </div>
          </div>

          <div v-if="selectedApplication.special_note" class="detail-section">
            <h3 class="detail-section-title">특이사항</h3>
            <p class="special-note-text">
              {{ selectedApplication.special_note }}
            </p>
          </div>

          <div class="detail-section">
            <h3 class="detail-section-title">신청 정보</h3>
            <div class="detail-grid">
              <div class="detail-item-full">
                <span class="detail-label">신청일</span>
                <span class="detail-value">{{
                  formatDate(selectedApplication.applied_at)
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
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useAuth } from "@/composables/useAuth";
import "../styles/MyPage.css";

type ApplicationStatus = "PENDING" | "CONFIRMED" | "CANCELED";

type Application = {
  id: number;
  worship_id: number;
  worship_title: string;
  worship_date: string;
  worship_place: string;
  user_name: string;
  user_email: string;
  infant_child_count: number;
  teen_count: number;
  military_count: number;
  adult_count: number;
  total_ticket_count: number;
  total_amount: number;
  status: ApplicationStatus;
  special_note?: string;
  applied_at: string;
};

const { isAdmin } = useAuth();

// User information (Mock - actually taken from Redis)
const userName = ref("홍길동");
const userEmail = ref("user@example.com");
const userPhone = ref("010-1234-5678");
const userAffiliation = ref("청년");
const userJoinDate = ref("2024-01-15");

const userInitial = computed(() => userName.value.charAt(0));

// modal state
const showEditProfile = ref(false);
const showChangePassword = ref(false);
const showAdminApplications = ref(false);
const showDetailModal = ref(false);

// filter
const applicationFilter = ref<"all" | ApplicationStatus>("all");

// form data
const editForm = ref({
  name: userName.value,
  phone: userPhone.value,
  affiliation: userAffiliation.value,
});

const passwordForm = ref({
  current: "",
  new: "",
  confirm: "",
});

// Mock application data
const myApplications = ref<Application[]>([
  {
    id: 1,
    worship_id: 2,
    worship_title: "샬롬",
    worship_date: "2025-12-06 (금) 18:30",
    worship_place: "예수인교회 본관 지하 2층",
    user_name: "홍길동",
    user_email: "user@example.com",
    infant_child_count: 2,
    teen_count: 1,
    military_count: 0,
    adult_count: 2,
    total_ticket_count: 5,
    total_amount: 25000,
    status: "CONFIRMED",
    special_note: "주차 공간 필요합니다",
    applied_at: "2025-11-20T14:30:00",
  },
  {
    id: 2,
    worship_id: 1,
    worship_title: "하나됨",
    worship_date: "2025-03-22 (토) 19:00",
    worship_place: "예수인교회 본관 지하 2층",
    user_name: "홍길동",
    user_email: "user@example.com",
    infant_child_count: 0,
    teen_count: 0,
    military_count: 0,
    adult_count: 1,
    total_ticket_count: 1,
    total_amount: 10000,
    status: "PENDING",
    applied_at: "2025-03-10T10:15:00",
  },
]);

// Full application data for administrator
const allApplications = ref<Application[]>([
  ...myApplications.value,
  {
    id: 3,
    worship_id: 2,
    worship_title: "샬롬",
    worship_date: "2025-12-06 (금) 18:30",
    worship_place: "예수인교회 본관 지하 2층",
    user_name: "김철수",
    user_email: "kim@example.com",
    infant_child_count: 1,
    teen_count: 2,
    military_count: 1,
    adult_count: 2,
    total_ticket_count: 6,
    total_amount: 35000,
    status: "PENDING",
    applied_at: "2025-11-25T09:20:00",
  },
]);

const selectedApplication = ref<Application | null>(null);

// Filtered application details
const filteredApplications = computed(() => {
  if (applicationFilter.value === "all") {
    return myApplications.value;
  }
  return myApplications.value.filter(
    (app) => app.status === applicationFilter.value
  );
});

// Admin Statistics
const totalWorships = computed(() => 2); // Mock
const totalApplications = computed(() => allApplications.value.length);
const totalTickets = computed(() =>
  allApplications.value.reduce((sum, app) => sum + app.total_ticket_count, 0)
);

// empty message
const emptyMessage = computed(() => {
  if (applicationFilter.value === "all") {
    return "아직 신청한 집회가 없습니다";
  }
  const statusText = {
    PENDING: "대기중인",
    CONFIRMED: "승인완료된",
    CANCELED: "취소된",
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
    case "CANCELED":
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

const handleUpdateProfile = () => {
  userName.value = editForm.value.name;
  userPhone.value = editForm.value.phone;
  userAffiliation.value = editForm.value.affiliation;

  // TODO: API call
  alert("정보가 수정되었습니다!");
  closeEditProfile();
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

  // TODO: API call
  alert("비밀번호가 변경되었습니다!");
  closeChangePassword();
};

// Cancel application
const cancelApplication = (id: number) => {
  if (!confirm("정말 이 신청을 취소하시겠습니까?")) return;

  const app = myApplications.value.find((a) => a.id === id);
  if (app) {
    app.status = "CANCELED";
    alert("신청이 취소되었습니다.");
  }
};

// Administrator: Approval of application
const approveApplication = (id: number) => {
  const app = allApplications.value.find((a) => a.id === id);
  if (app) {
    app.status = "CONFIRMED";
    alert("신청이 승인되었습니다.");
  }
};

// Administrator: Cancel application
const cancelApplicationAdmin = (id: number) => {
  if (!confirm("이 신청을 취소하시겠습니까?")) return;

  const app = allApplications.value.find((a) => a.id === id);
  if (app) {
    app.status = "CANCELED";
    alert("신청이 취소되었습니다.");
  }
};

// Administrator application status modal
const closeAdminApplications = () => {
  showAdminApplications.value = false;
};

// View details
const viewApplicationDetail = (app: Application) => {
  selectedApplication.value = app;
  showDetailModal.value = true;
};

const closeDetailModal = () => {
  showDetailModal.value = false;
  selectedApplication.value = null;
};
</script>
