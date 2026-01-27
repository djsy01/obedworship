<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useAuth } from "@/composables/useAuth";
import { ticketApi, ticketApplicationApi, worshipApi } from "@/api/axios";
import type { Ticket, TicketStatus } from "@/api/tickets";
import type { Worship } from "@/api/worship";
import "../styles/Tickets.css";

const router = useRouter();
const { isLoggedIn, isAdmin } = useAuth();

//state management
const tickets = ref<Ticket[]>([]);
const worships = ref<Worship[]>([]); // Meeting information list (for linking)
const loading = ref(true);
const error = ref(false);
const submitting = ref(false);
const selectedWorshipId = ref<number | null>(null); // selected assembly ID

const showAddModal = ref(false);
const showApplicationModal = ref(false);
const showEditModal = ref(false);
const selectedTicket = ref<Ticket | null>(null);
const editingTicket = ref<Ticket | null>(null);

// new ticket data
const newTicket = ref({
  title: "",
  date: "",
  year: new Date().getFullYear(),
  place: "",
  preacher: "",
  description: "",
  poster_url: "",
  price_infant: 0,
  price_teen: 5000,
  price_military: 5000,
  price_adult: 10000,
  status: "OPEN" as TicketStatus,
});

//User information (taken from localStorage)
const userName = ref("");
const userEmail = ref("");
const userPhone = ref("");
const userId = ref<number | null>(null);

// ticket quantity
const ticketCounts = ref({
  infant_child: 0,
  teen: 0,
  military: 0,
  adult: 0,
});

const specialNote = ref("");
const privacyAgreed = ref(false);

// Check ticket list
const fetchTickets = async () => {
  loading.value = true;
  error.value = false;
  try {
    const response = await ticketApi.getAll();
    tickets.value = response.data;
  } catch (err) {
    console.error("티켓 조회 실패:", err);
    error.value = true;
  } finally {
    loading.value = false;
  }
};

// View rally information list (for ticket linking)
const fetchWorships = async () => {
  try {
    const response = await worshipApi.getAll();
    worships.value = response.data;
  } catch (err) {
    console.error("집회 목록 조회 실패:", err);
  }
};

// Auto-fill form when meeting is selected
const onWorshipSelect = () => {
  if (!selectedWorshipId.value) {
    // Initialize form when selection is cleared
    newTicket.value = {
      title: "",
      date: "",
      year: new Date().getFullYear(),
      place: "",
      preacher: "",
      description: "",
      poster_url: "",
      price_infant: 0,
      price_teen: 5000,
      price_military: 5000,
      price_adult: 10000,
      status: "OPEN",
    };
    return;
  }

  const worship = worships.value.find((w) => w.id === selectedWorshipId.value);
  if (worship) {
    newTicket.value = {
      title: worship.title,
      date: worship.date,
      year: worship.year,
      place: worship.location || "",
      preacher: worship.preacher,
      description: worship.description,
      poster_url: worship.poster_url || "",
      price_infant: 0,
      price_teen: 5000,
      price_military: 5000,
      price_adult: 10000,
      status: "OPEN",
    };
  }
};

// load user information
const loadUserInfo = () => {
  const userStr = localStorage.getItem("user");
  if (userStr) {
    const user = JSON.parse(userStr);
    userId.value = user.userId ? parseInt(user.userId) : null;
    userName.value = user.name || localStorage.getItem("userName") || "";
    userEmail.value = user.email || "";
    userPhone.value = user.phone || "";
  }
};

// sorted ticket list
const sortedTickets = computed(() => {
  return [...tickets.value].sort((a, b) => b.id - a.id);
});

// total number of tickets
const totalTickets = computed(() => {
  return Object.values(ticketCounts.value).reduce(
    (sum, count) => sum + count,
    0,
  );
});

// calculate total amount
const totalAmount = computed(() => {
  const ticket = selectedTicket.value;
  if (!ticket) return 0;

  return (
    ticketCounts.value.infant_child * (ticket.price_infant ?? 0) +
    ticketCounts.value.teen * (ticket.price_teen ?? 0) +
    ticketCounts.value.military * (ticket.price_military ?? 0) +
    ticketCounts.value.adult * (ticket.price_adult ?? 0)
  );
});

const formatPrice = (price?: number) => {
  const value = price ?? 0;
  return value > 0 ? `${value.toLocaleString()}원` : "무료";
};

// Availability for submission
const canSubmit = computed(() => {
  return totalTickets.value > 0 && privacyAgreed.value && !submitting.value;
});

// status text
const getStatusText = (status: TicketStatus) => {
  switch (status) {
    case "OPEN":
      return "신청 중";
    case "CLOSED":
      return "마감";
    case "CANCELED":
      return "취소";
  }
};

// initial load
onMounted(() => {
  fetchTickets();
  fetchWorships(); // Load rally list for administrator
  loadUserInfo();
});

// Add ticket modal
const openAddTicketModal = () => {
  showAddModal.value = true;
  selectedWorshipId.value = null;
  newTicket.value = {
    title: "",
    date: "",
    year: new Date().getFullYear(),
    place: "",
    preacher: "",
    description: "",
    poster_url: "",
    price_infant: 0,
    price_teen: 5000,
    price_military: 5000,
    price_adult: 10000,
    status: "OPEN",
  };
};

const closeAddModal = () => {
  showAddModal.value = false;
};

const handlePosterUpload = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (file) {
    console.log("포스터 업로드:", file.name);
    newTicket.value.poster_url = URL.createObjectURL(file);
  }
};

const handleAddTicket = async () => {
  try {
    await ticketApi.create({
      worship_id: selectedWorshipId.value || undefined,
      title: newTicket.value.title,
      date: newTicket.value.date,
      year: newTicket.value.year,
      preacher: newTicket.value.preacher,
      description: newTicket.value.description,
      place: newTicket.value.place,
      poster_url: newTicket.value.poster_url || undefined,
      price_infant: newTicket.value.price_infant,
      price_teen: newTicket.value.price_teen,
      price_military: newTicket.value.price_military,
      price_adult: newTicket.value.price_adult,
      status: newTicket.value.status,
    });
    alert("티켓이 추가되었습니다!");
    closeAddModal();
    await fetchTickets();
  } catch (err) {
    console.error("티켓 추가 실패:", err);
    alert("티켓 추가에 실패했습니다.");
  }
};

// application modal
const openApplicationModal = (ticket: Ticket) => {
  if (!isLoggedIn.value) {
    alert("로그인이 필요한 서비스입니다.");
    router.push("/login");
    return;
  }

  selectedTicket.value = ticket;
  showApplicationModal.value = true;

  // reset
  ticketCounts.value = {
    infant_child: 0,
    teen: 0,
    military: 0,
    adult: 0,
  };
  specialNote.value = "";
  privacyAgreed.value = false;
};

const closeApplicationModal = () => {
  showApplicationModal.value = false;
  selectedTicket.value = null;
};

const handleSubmitApplication = async () => {
  if (!canSubmit.value) {
    alert("최소 1장 이상의 티켓을 선택하고 개인정보 수집에 동의해주세요.");
    return;
  }

  if (!userId.value || !selectedTicket.value) {
    alert("사용자 정보를 확인할 수 없습니다. 다시 로그인해주세요.");
    return;
  }

  submitting.value = true;
  try {
    await ticketApplicationApi.create({
      ticket_id: selectedTicket.value.id,
      user_id: userId.value,
      applicant_name: userName.value,
      applicant_phone: userPhone.value || "미등록",
      applicant_email: userEmail.value,
      party_size: totalTickets.value,
      memo: specialNote.value || undefined,
    });

    alert(`집회 신청이 완료되었습니다!\n\n총 ${totalTickets.value}명`);
    closeApplicationModal();
  } catch (err: any) {
    console.error("신청 실패:", err);
    const message =
      err.response?.data?.message || "신청 처리 중 오류가 발생했습니다.";
    alert(message);
  } finally {
    submitting.value = false;
  }
};

// edit modal
const editTicket = (ticket: Ticket) => {
  editingTicket.value = { ...ticket };
  showEditModal.value = true;
};

const closeEditModal = () => {
  showEditModal.value = false;
  editingTicket.value = null;
};

const handleEditPosterUpload = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (file && editingTicket.value) {
    console.log("포스터 수정 업로드:", file.name);
    editingTicket.value.poster_url = URL.createObjectURL(file);
  }
};

const handleUpdateTicket = async () => {
  if (!editingTicket.value) return;

  try {
    await ticketApi.update(editingTicket.value.id, {
      title: editingTicket.value.title,
      date: editingTicket.value.date,
      preacher: editingTicket.value.preacher,
      description: editingTicket.value.description,
      place: editingTicket.value.place,
      price_infant: editingTicket.value.price_infant,
      price_teen: editingTicket.value.price_teen,
      price_military: editingTicket.value.price_military,
      price_adult: editingTicket.value.price_adult,
    });
    alert("티켓 정보가 수정되었습니다!");
    closeEditModal();
    await fetchTickets();
  } catch (err) {
    console.error("티켓 수정 실패:", err);
    alert("티켓 수정에 실패했습니다.");
  }
};

// finishing
const closeTicket = async (id: number) => {
  if (!confirm("이 티켓을 마감 처리하시겠습니까?")) return;

  try {
    await ticketApi.close(id);
    alert("티켓이 마감 처리되었습니다!");
    await fetchTickets();
  } catch (err) {
    console.error("티켓 마감 실패:", err);
    alert("티켓 마감에 실패했습니다.");
  }
};

// delete
const deleteTicket = async (id: number) => {
  if (!confirm("정말 이 티켓을 삭제하시겠습니까?")) return;

  try {
    await ticketApi.delete(id);
    alert("티켓이 삭제되었습니다!");
    await fetchTickets();
  } catch (err) {
    console.error("티켓 삭제 실패:", err);
    alert("티켓 삭제에 실패했습니다.");
  }
};
</script>

<template>
  <div class="page">
    <section class="section">
      <div class="section-header">
        <div>
          <h1 class="section-title">집회 신청</h1>
          <p class="section-subtitle">
            다가오는 집회의 정보를 확인하고, 신청할 수 있습니다.
          </p>
        </div>

        <div class="section-controls">
          <button
            v-if="isAdmin"
            class="btn primary"
            type="button"
            @click="openAddTicketModal"
          >
            + 집회 추가
          </button>
        </div>
      </div>

      <!-- Admin only: Add ticket modal -->
      <div v-if="showAddModal && isAdmin" class="panel">
        <h2 class="panel-title">새 집회 추가</h2>
        <form class="form-grid" @submit.prevent="handleAddTicket">
          <!-- Select rally information integration -->
          <label class="field field--full">
            <span class="field-label">집회 안내에서 불러오기 (선택)</span>
            <select v-model="selectedWorshipId" @change="onWorshipSelect">
              <option :value="null">직접 입력</option>
              <option
                v-for="worship in worships"
                :key="worship.id"
                :value="worship.id"
              >
                {{ worship.title }} ({{ worship.date }})
              </option>
            </select>
            <p class="field-hint">
              ※ 집회 안내 페이지의 정보를 불러와 자동으로 채웁니다
            </p>
          </label>

          <label class="field">
            <span class="field-label">집회명</span>
            <input
              v-model="newTicket.title"
              type="text"
              placeholder="집회명을 입력하세요"
              required
            />
          </label>

          <label class="field">
            <span class="field-label">날짜</span>
            <input
              v-model="newTicket.date"
              type="text"
              placeholder="예: 2025-03-15 (토) 19:00"
              required
            />
          </label>

          <label class="field">
            <span class="field-label">연도</span>
            <input
              v-model.number="newTicket.year"
              type="number"
              placeholder="예: 2025"
              required
            />
          </label>

          <label class="field">
            <span class="field-label">장소</span>
            <input
              v-model="newTicket.place"
              type="text"
              placeholder="예: 예수인교회 본관 지하 2층"
              required
            />
          </label>

          <label class="field">
            <span class="field-label">설교자</span>
            <input
              v-model="newTicket.preacher"
              type="text"
              placeholder="예: 박훈 목사"
              required
            />
          </label>

          <label class="field field--full">
            <span class="field-label">집회 설명</span>
            <textarea
              v-model="newTicket.description"
              rows="3"
              placeholder="집회에 대한 간단한 설명을 입력하세요"
              required
            ></textarea>
          </label>

          <label class="field">
            <span class="field-label">영유아 가격</span>
            <input
              v-model.number="newTicket.price_infant"
              type="number"
              min="0"
              placeholder="0"
              required
            />
          </label>

          <label class="field">
            <span class="field-label">청소년 가격</span>
            <input
              v-model.number="newTicket.price_teen"
              type="number"
              min="0"
              placeholder="5000"
              required
            />
          </label>

          <label class="field">
            <span class="field-label">군인 가격</span>
            <input
              v-model.number="newTicket.price_military"
              type="number"
              min="0"
              placeholder="5000"
              required
            />
          </label>

          <label class="field">
            <span class="field-label">어른 가격</span>
            <input
              v-model.number="newTicket.price_adult"
              type="number"
              min="0"
              placeholder="10000"
              required
            />
          </label>

          <div class="field field--full">
            <span class="field-label">포스터 이미지</span>
            <div v-if="newTicket.poster_url" class="poster-preview">
              <img :src="newTicket.poster_url" alt="포스터 미리보기" />
              <p class="field-hint">※ 집회 안내에서 불러온 포스터입니다</p>
            </div>
            <input type="file" @change="handlePosterUpload" accept="image/*" />
            <p class="field-hint">
              {{
                newTicket.poster_url
                  ? "※ 새 이미지를 업로드하면 교체됩니다"
                  : "※ 포스터 이미지를 업로드하세요 (선택사항)"
              }}
            </p>
          </div>

          <label class="field">
            <span class="field-label">상태</span>
            <select v-model="newTicket.status" required>
              <option value="OPEN">예매 중</option>
              <option value="CLOSED">마감</option>
              <option value="CANCELED">취소</option>
            </select>
          </label>

          <div class="form-actions">
            <button class="btn" type="button" @click="closeAddModal">
              취소
            </button>
            <button class="btn primary" type="submit">추가</button>
          </div>
        </form>
      </div>

      <!-- Loading status -->
      <div v-if="loading" class="loading">로딩 중...</div>

      <!-- Error status -->
      <div v-else-if="error" class="error-message">
        <p>정보를 가져오지 못했습니다.</p>
        <button class="btn primary" @click="fetchTickets">다시 시도</button>
      </div>

      <!-- List of tickets -->
      <div v-else class="tickets-grid">
        <article
          v-for="ticket in sortedTickets"
          :key="ticket.id"
          class="ticket-card"
          :class="{ 'ticket-closed': ticket.status !== 'OPEN' }"
        >
          <!-- Poster image -->
          <div v-if="ticket.poster_url" class="ticket-poster">
            <img :src="ticket.poster_url" :alt="ticket.title + ' 포스터'" />
          </div>

          <div class="ticket-content">
            <div class="ticket-header">
              <span class="ticket-status" :data-status="ticket.status">
                {{ getStatusText(ticket.status) }}
              </span>
              <p class="ticket-date">{{ ticket.date }}</p>
            </div>

            <h2 class="ticket-title">{{ ticket.title }}</h2>
            <p class="ticket-meta">
              <span class="meta-item">
                <span class="meta-icon">📍</span>
                {{ ticket.place }}
              </span>
              <span class="meta-item">
                <span class="meta-icon">🎤</span>
                {{ ticket.preacher }}
              </span>
            </p>
            <p class="ticket-description">{{ ticket.description }}</p>

            <!-- Administrator-only action -->
            <div v-if="isAdmin" class="admin-actions">
              <button class="btn small" @click="editTicket(ticket)">
                ✏️ 수정
              </button>
              <button class="btn small" @click="closeTicket(ticket.id)">
                ✅ 마감
              </button>
              <button class="btn small danger" @click="deleteTicket(ticket.id)">
                🗑️ 삭제
              </button>
            </div>

            <!-- Apply Button -->
            <div class="ticket-actions">
              <button
                v-if="ticket.status === 'OPEN'"
                class="btn primary apply-btn"
                @click="openApplicationModal(ticket)"
              >
                신청하기
              </button>
              <button v-else class="btn disabled apply-btn" disabled>
                {{ ticket.status === "CLOSED" ? "마감됨" : "취소됨" }}
              </button>
            </div>
          </div>
        </article>

        <p v-if="sortedTickets.length === 0" class="empty-text">
          현재 신청 가능한 집회가 없습니다.
        </p>
      </div>

      <!-- Application modal -->
      <div
        v-if="showApplicationModal"
        class="modal-overlay"
        @click="closeApplicationModal"
      >
        <div class="modal-content application-modal" @click.stop>
          <div class="modal-header">
            <h2 class="modal-title">집회 신청 - {{ selectedTicket?.title }}</h2>
            <button class="modal-close" @click="closeApplicationModal">
              ✕
            </button>
          </div>

          <div class="modal-body">
            <!-- User Information -->
            <div class="user-info-section">
              <h3 class="section-subtitle-small">신청자 정보</h3>
              <div class="info-display">
                <div class="info-item">
                  <span class="info-label">이름</span>
                  <span class="info-value">{{ userName }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">이메일</span>
                  <span class="info-value">{{ userEmail }}</span>
                </div>
              </div>
            </div>

            <!-- Select ticket -->
            <div class="ticket-selection-section">
              <h3 class="section-subtitle-small">티켓 수량 선택</h3>

              <div class="ticket-type-list">
                <div class="ticket-type-item">
                  <div class="ticket-type-info">
                    <span class="type-name">영유아</span>
                    <span
                      class="type-price"
                      :class="{
                        free: (selectedTicket?.price_infant ?? 0) === 0,
                      }"
                    >
                      {{ formatPrice(selectedTicket?.price_infant) }}
                    </span>
                    <span class="type-desc">영아, 유치원생, 초등학생</span>
                  </div>
                  <input
                    v-model.number="ticketCounts.infant_child"
                    type="number"
                    min="0"
                    max="20"
                    class="ticket-input"
                  />
                </div>

                <div class="ticket-type-item">
                  <div class="ticket-type-info">
                    <span class="type-name">청소년</span>
                    <span
                      class="type-price"
                      :class="{ free: (selectedTicket?.price_teen ?? 0) === 0 }"
                    >
                      {{ formatPrice(selectedTicket?.price_teen) }}
                    </span>
                    <span class="type-desc">중학생, 고등학생</span>
                  </div>
                  <input
                    v-model.number="ticketCounts.teen"
                    type="number"
                    min="0"
                    max="20"
                    class="ticket-input"
                  />
                </div>

                <div class="ticket-type-item">
                  <div class="ticket-type-info">
                    <span class="type-name">군인</span>
                    <span
                      class="type-price"
                      :class="{
                        free: (selectedTicket?.price_military ?? 0) === 0,
                      }"
                    >
                      {{ formatPrice(selectedTicket?.price_military) }}
                    </span>
                    <span class="type-desc">직업군인 제외</span>
                  </div>
                  <input
                    v-model.number="ticketCounts.military"
                    type="number"
                    min="0"
                    max="20"
                    class="ticket-input"
                  />
                </div>

                <div class="ticket-type-item">
                  <div class="ticket-type-info">
                    <span class="type-name">어른</span>
                    <span
                      class="type-price"
                      :class="{
                        free: (selectedTicket?.price_adult ?? 0) === 0,
                      }"
                    >
                      {{ formatPrice(selectedTicket?.price_adult) }}
                    </span>
                  </div>
                  <input
                    v-model.number="ticketCounts.adult"
                    type="number"
                    min="0"
                    max="20"
                    class="ticket-input"
                  />
                </div>
              </div>
            </div>

            <!-- Total amount -->
            <div class="total-section">
              <div class="total-item">
                <span class="total-label">총 수량</span>
                <span class="total-value">{{ totalTickets }}장</span>
              </div>
              <div class="total-item total-amount-item">
                <span class="total-label">총 결제 금액</span>
                <span class="total-value amount"
                  >{{ totalAmount.toLocaleString() }}원</span
                >
              </div>
            </div>

            <!-- Special Notes -->
            <div class="special-note-section">
              <label class="field field--full">
                <span class="field-label">특이사항 (선택)</span>
                <textarea
                  v-model="specialNote"
                  rows="3"
                  placeholder="특별히 전달하실 내용이 있다면 적어주세요"
                ></textarea>
              </label>
            </div>

            <!-- Personal information consent -->
            <label class="privacy-checkbox">
              <input v-model="privacyAgreed" type="checkbox" required />
              <span>개인정보 수집 및 이용에 동의합니다</span>
            </label>

            <!-- Submit button -->
            <button
              class="btn primary submit-application-btn"
              @click="handleSubmitApplication"
              :disabled="!canSubmit"
            >
              {{ canSubmit ? "신청 완료" : "최소 1장 이상 선택하세요" }}
            </button>
          </div>
        </div>
      </div>

      <!-- Edit Modal -->
      <div
        v-if="showEditModal && isAdmin"
        class="modal-overlay"
        @click="closeEditModal"
      >
        <div class="modal-content edit-modal" @click.stop>
          <div class="modal-header">
            <h2 class="modal-title">집회 수정</h2>
            <button class="modal-close" @click="closeEditModal">✕</button>
          </div>

          <div class="modal-body">
            <form class="form-grid" @submit.prevent="handleUpdateTicket">
              <label class="field">
                <span class="field-label">집회명</span>
                <input v-model="editingTicket.title" type="text" required />
              </label>

              <label class="field">
                <span class="field-label">날짜</span>
                <input v-model="editingTicket.date" type="text" required />
              </label>

              <label class="field">
                <span class="field-label">장소</span>
                <input v-model="editingTicket.place" type="text" required />
              </label>

              <label class="field">
                <span class="field-label">설교자</span>
                <input v-model="editingTicket.preacher" type="text" required />
              </label>

              <label class="field field--full">
                <span class="field-label">집회 설명</span>
                <textarea
                  v-model="editingTicket.description"
                  rows="3"
                  required
                ></textarea>
              </label>

              <label class="field">
                <span class="field-label">영유아 가격</span>
                <input
                  v-model.number="editingTicket.price_infant"
                  type="number"
                  min="0"
                  required
                />
              </label>

              <label class="field">
                <span class="field-label">청소년 가격</span>
                <input
                  v-model.number="editingTicket.price_teen"
                  type="number"
                  min="0"
                  required
                />
              </label>

              <label class="field">
                <span class="field-label">군인 가격</span>
                <input
                  v-model.number="editingTicket.price_military"
                  type="number"
                  min="0"
                  required
                />
              </label>

              <label class="field">
                <span class="field-label">어른 가격</span>
                <input
                  v-model.number="editingTicket.price_adult"
                  type="number"
                  min="0"
                  required
                />
              </label>

              <label class="field field--full">
                <span class="field-label">포스터 이미지 변경</span>
                <input
                  type="file"
                  @change="handleEditPosterUpload"
                  accept="image/*"
                />
                <p class="field-hint">
                  ※ 새 포스터를 업로드하지 않으면 기존 포스터가 유지됩니다
                </p>
              </label>

              <label class="field">
                <span class="field-label">상태</span>
                <select v-model="editingTicket.status" required>
                  <option value="OPEN">예매 중</option>
                  <option value="CLOSED">마감</option>
                  <option value="CANCELED">취소</option>
                </select>
              </label>

              <div class="form-actions">
                <button class="btn" type="button" @click="closeEditModal">
                  취소
                </button>
                <button class="btn primary" type="submit">수정 완료</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
