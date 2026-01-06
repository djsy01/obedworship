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
            @click="openAddWorshipModal"
          >
            + 집회 추가
          </button>
        </div>
      </div>

      <!-- 관리자 전용: 집회 추가 모달 -->
      <div v-if="showAddModal && isAdmin" class="panel">
        <h2 class="panel-title">새 집회 추가</h2>
        <form class="form-grid" @submit.prevent="handleAddWorship">
          <label class="field">
            <span class="field-label">집회명</span>
            <input v-model="newWorship.title" type="text" placeholder="집회명을 입력하세요" required />
          </label>

          <label class="field">
            <span class="field-label">날짜</span>
            <input v-model="newWorship.date" type="text" placeholder="예: 2025-03-15 (토) 19:00" required />
          </label>

          <label class="field">
            <span class="field-label">연도</span>
            <input v-model.number="newWorship.year" type="number" placeholder="예: 2025" required />
          </label>

          <label class="field">
            <span class="field-label">장소</span>
            <input v-model="newWorship.place" type="text" placeholder="예: 예수인교회 본관 지하 2층" required />
          </label>

          <label class="field">
            <span class="field-label">설교자</span>
            <input v-model="newWorship.preacher" type="text" placeholder="예: 박훈 목사" required />
          </label>

          <label class="field field--full">
            <span class="field-label">집회 설명</span>
            <textarea v-model="newWorship.description" rows="3" placeholder="집회에 대한 간단한 설명을 입력하세요" required></textarea>
          </label>

          <label class="field field--full">
            <span class="field-label">포스터 이미지</span>
            <input type="file" @change="handlePosterUpload" accept="image/*" />
            <p class="field-hint">※ 포스터 이미지를 업로드하세요 (선택사항)</p>
          </label>

          <label class="field">
            <span class="field-label">상태</span>
            <select v-model="newWorship.status" required>
              <option value="OPEN">예매 중</option>
              <option value="CLOSED">마감</option>
              <option value="CANCELED">취소</option>
            </select>
          </label>

          <div class="form-actions">
            <button class="btn" type="button" @click="closeAddModal">
              취소
            </button>
            <button class="btn primary" type="submit">
              추가
            </button>
          </div>
        </form>
      </div>

      <!-- 집회 목록 -->
      <div class="tickets-grid">
        <article
          v-for="worship in sortedWorships"
          :key="worship.id"
          class="ticket-card"
          :class="{ 'ticket-closed': worship.status !== 'OPEN' }"
        >
          <!-- 포스터 이미지 -->
          <div v-if="worship.poster_url" class="ticket-poster">
            <img :src="worship.poster_url" :alt="worship.title + ' 포스터'" />
          </div>

          <div class="ticket-content">
            <div class="ticket-header">
              <span class="ticket-status" :data-status="worship.status">
                {{ getStatusText(worship.status) }}
              </span>
              <p class="ticket-date">{{ worship.date }}</p>
            </div>

            <h2 class="ticket-title">{{ worship.title }}</h2>
            <p class="ticket-meta">
              <span class="meta-item">
                <span class="meta-icon">📍</span>
                {{ worship.place }}
              </span>
              <span class="meta-item">
                <span class="meta-icon">🎤</span>
                {{ worship.preacher }}
              </span>
            </p>
            <p class="ticket-description">{{ worship.description }}</p>

            <!-- 관리자 전용 액션 -->
            <div v-if="isAdmin" class="admin-actions">
              <button class="btn small" @click="editWorship(worship)">
                ✏️ 수정
              </button>
              <button class="btn small" @click="completeWorship(worship.id)">
                ✅ 완료
              </button>
              <button class="btn small danger" @click="deleteWorship(worship.id)">
                🗑️ 삭제
              </button>
            </div>

            <!-- 신청 버튼 -->
            <div class="ticket-actions">
              <button
                v-if="worship.status === 'OPEN'"
                class="btn primary apply-btn"
                @click="openApplicationModal(worship)"
              >
                신청하기
              </button>
              <button v-else class="btn disabled apply-btn" disabled>
                {{ worship.status === 'CLOSED' ? '마감됨' : '취소됨' }}
              </button>
            </div>
          </div>
        </article>

        <p v-if="sortedWorships.length === 0" class="empty-text">
          현재 진행 중인 집회가 없습니다.
        </p>
      </div>

      <!-- 신청 모달 -->
      <div v-if="showApplicationModal" class="modal-overlay" @click="closeApplicationModal">
        <div class="modal-content application-modal" @click.stop>
          <div class="modal-header">
            <h2 class="modal-title">집회 신청 - {{ selectedWorship?.title }}</h2>
            <button class="modal-close" @click="closeApplicationModal">✕</button>
          </div>

          <div class="modal-body">
            <!-- 사용자 정보 -->
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

            <!-- 티켓 선택 -->
            <div class="ticket-selection-section">
              <h3 class="section-subtitle-small">티켓 수량 선택</h3>
              
              <div class="ticket-type-list">
                <div class="ticket-type-item">
                  <div class="ticket-type-info">
                    <span class="type-name">영유아</span>
                    <span class="type-price free">무료</span>
                    <span class="type-desc">(영아부~초등부)</span>
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
                    <span class="type-price">5,000원</span>
                    <span class="type-desc">(중고등부)</span>
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
                    <span class="type-price">5,000원</span>
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
                    <span class="type-price">10,000원</span>
                    <span class="type-desc">(청년부, 장년부)</span>
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

            <!-- 총 금액 -->
            <div class="total-section">
              <div class="total-item">
                <span class="total-label">총 티켓 수량</span>
                <span class="total-value">{{ totalTickets }}장</span>
              </div>
              <div class="total-item total-amount-item">
                <span class="total-label">총 결제 금액</span>
                <span class="total-value amount">{{ totalAmount.toLocaleString() }}원</span>
              </div>
            </div>

            <!-- 특이사항 -->
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

            <!-- 개인정보 동의 -->
            <label class="privacy-checkbox">
              <input v-model="privacyAgreed" type="checkbox" required />
              <span>개인정보 수집 및 이용에 동의합니다</span>
            </label>

            <!-- 제출 버튼 -->
            <button 
              class="btn primary submit-application-btn" 
              @click="handleSubmitApplication"
              :disabled="!canSubmit"
            >
              {{ canSubmit ? '신청 완료' : '최소 1장 이상 선택하세요' }}
            </button>
          </div>
        </div>
      </div>

      <!-- 수정 모달 -->
      <div v-if="showEditModal && isAdmin" class="modal-overlay" @click="closeEditModal">
        <div class="modal-content edit-modal" @click.stop>
          <div class="modal-header">
            <h2 class="modal-title">집회 수정</h2>
            <button class="modal-close" @click="closeEditModal">✕</button>
          </div>

          <div class="modal-body">
            <form class="form-grid" @submit.prevent="handleUpdateWorship">
              <label class="field">
                <span class="field-label">집회명</span>
                <input v-model="editingWorship.title" type="text" required />
              </label>

              <label class="field">
                <span class="field-label">날짜</span>
                <input v-model="editingWorship.date" type="text" required />
              </label>

              <label class="field">
                <span class="field-label">장소</span>
                <input v-model="editingWorship.place" type="text" required />
              </label>

              <label class="field">
                <span class="field-label">설교자</span>
                <input v-model="editingWorship.preacher" type="text" required />
              </label>

              <label class="field field--full">
                <span class="field-label">집회 설명</span>
                <textarea v-model="editingWorship.description" rows="3" required></textarea>
              </label>

              <label class="field field--full">
                <span class="field-label">포스터 이미지 변경</span>
                <input type="file" @change="handleEditPosterUpload" accept="image/*" />
                <p class="field-hint">※ 새 포스터를 업로드하지 않으면 기존 포스터가 유지됩니다</p>
              </label>

              <label class="field">
                <span class="field-label">상태</span>
                <select v-model="editingWorship.status" required>
                  <option value="OPEN">예매 중</option>
                  <option value="CLOSED">마감</option>
                  <option value="CANCELED">취소</option>
                </select>
              </label>

              <div class="form-actions">
                <button class="btn" type="button" @click="closeEditModal">
                  취소
                </button>
                <button class="btn primary" type="submit">
                  수정 완료
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import '../styles/Tickets.css'

type WorshipStatus = 'OPEN' | 'CLOSED' | 'CANCELED'

type Worship = {
  id: number
  title: string
  date: string
  year: number
  place: string
  preacher: string
  description: string
  poster_url?: string
  status: WorshipStatus
}

const router = useRouter()
const { isLoggedIn, isAdmin } = useAuth()

// 상태 관리
const worships = ref<Worship[]>([
  {
    id: 1,
    title: '하나됨',
    date: '2025-03-22 (토) 19:00',
    year: 2025,
    place: '예수인교회 본관 지하 2층',
    preacher: '민찬기 목사',
    description: '호흡있는 모든 자들은 찬양하라',
    status: 'CLOSED',
  },
  {
    id: 2,
    title: '샬롬',
    date: '2025-12-06 (금) 18:30',
    year: 2025,
    place: '예수인교회 본관 지하 2층',
    preacher: '박훈 목사',
    description: '너희는 마음에 근심하지도 말고 두려워하지도 말라',
    status: 'OPEN',
  },
])

const showAddModal = ref(false)
const showApplicationModal = ref(false)
const showEditModal = ref(false)
const selectedWorship = ref<Worship | null>(null)
const editingWorship = ref<Worship | null>(null)

// 새 집회 데이터
const newWorship = ref({
  title: '',
  date: '',
  year: new Date().getFullYear(),
  place: '',
  preacher: '',
  description: '',
  poster_url: '',
  status: 'OPEN' as WorshipStatus,
})

// 사용자 정보 (Mock - 실제로는 Redis에서 가져옴)
const userName = ref('홍길동')
const userEmail = ref('user@example.com')

// 티켓 수량
const ticketCounts = ref({
  infant_child: 0,
  teen: 0,
  military: 0,
  adult: 0,
})

const specialNote = ref('')
const privacyAgreed = ref(false)

// 정렬된 집회 목록
const sortedWorships = computed(() => {
  return [...worships.value].sort((a, b) => b.id - a.id)
})

// 총 티켓 수량
const totalTickets = computed(() => {
  return Object.values(ticketCounts.value).reduce((sum, count) => sum + count, 0)
})

// 총 금액 계산
const totalAmount = computed(() => {
  return (
    ticketCounts.value.teen * 5000 +
    ticketCounts.value.military * 5000 +
    ticketCounts.value.adult * 10000
  )
})

// 제출 가능 여부
const canSubmit = computed(() => {
  return totalTickets.value > 0 && privacyAgreed.value
})

// 상태 텍스트
const getStatusText = (status: WorshipStatus) => {
  switch (status) {
    case 'OPEN':
      return '예매 중'
    case 'CLOSED':
      return '마감'
    case 'CANCELED':
      return '취소'
  }
}

// 로그인 체크
onMounted(() => {
  // Mock: 실제로는 여기서 Redis 사용자 정보를 가져옴
  if (isLoggedIn.value) {
    // userName.value = fetchedName
    // userEmail.value = fetchedEmail
  }
})

// 집회 추가 모달
const openAddWorshipModal = () => {
  showAddModal.value = true
  newWorship.value = {
    title: '',
    date: '',
    year: new Date().getFullYear(),
    place: '',
    preacher: '',
    description: '',
    poster_url: '',
    status: 'OPEN',
  }
}

const closeAddModal = () => {
  showAddModal.value = false
}

const handlePosterUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    // TODO: 실제로는 파일 업로드 API 호출
    console.log('포스터 업로드:', file.name)
    // Mock URL
    newWorship.value.poster_url = URL.createObjectURL(file)
  }
}

const handleAddWorship = () => {
  const newId = Math.max(...worships.value.map(w => w.id), 0) + 1
  worships.value.push({
    id: newId,
    ...newWorship.value,
  })
  alert('집회가 추가되었습니다!')
  closeAddModal()
}

// 신청 모달
const openApplicationModal = (worship: Worship) => {
  if (!isLoggedIn.value) {
    alert('로그인이 필요한 서비스입니다.')
    router.push('/login')
    return
  }

  selectedWorship.value = worship
  showApplicationModal.value = true
  
  // 초기화
  ticketCounts.value = {
    infant_child: 0,
    teen: 0,
    military: 0,
    adult: 0,
  }
  specialNote.value = ''
  privacyAgreed.value = false
}

const closeApplicationModal = () => {
  showApplicationModal.value = false
  selectedWorship.value = null
}

const handleSubmitApplication = async () => {
  if (!canSubmit.value) {
    alert('최소 1장 이상의 티켓을 선택하고 개인정보 수집에 동의해주세요.')
    return
  }

  try {
    const applicationData = {
      worship_id: selectedWorship.value?.id,
      user_name: userName.value,
      user_email: userEmail.value,
      infant_child_count: ticketCounts.value.infant_child,
      teen_count: ticketCounts.value.teen,
      military_count: ticketCounts.value.military,
      adult_count: ticketCounts.value.adult,
      total_amount: totalAmount.value,
      special_note: specialNote.value || null,
      privacy_agreed: privacyAgreed.value,
    }

    // TODO: API 호출
    console.log('신청 데이터:', applicationData)
    
    alert(`집회 신청이 완료되었습니다!\n\n총 ${totalTickets.value}장 / ${totalAmount.value.toLocaleString()}원`)
    closeApplicationModal()
  } catch (error) {
    console.error('신청 실패:', error)
    alert('신청 처리 중 오류가 발생했습니다.')
  }
}

// 수정 모달
const editWorship = (worship: Worship) => {
  editingWorship.value = { ...worship }
  showEditModal.value = true
}

const closeEditModal = () => {
  showEditModal.value = false
  editingWorship.value = null
}

const handleEditPosterUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file && editingWorship.value) {
    console.log('포스터 수정 업로드:', file.name)
    editingWorship.value.poster_url = URL.createObjectURL(file)
  }
}

const handleUpdateWorship = () => {
  if (!editingWorship.value) return

  const index = worships.value.findIndex(w => w.id === editingWorship.value!.id)
  if (index !== -1) {
    worships.value[index] = { ...editingWorship.value }
    alert('집회 정보가 수정되었습니다!')
    closeEditModal()
  }
}

// 완료 처리
const completeWorship = (id: number) => {
  if (!confirm('이 집회를 완료 처리하시겠습니까?')) return

  const worship = worships.value.find(w => w.id === id)
  if (worship) {
    worship.status = 'CLOSED'
    alert('집회가 완료 처리되었습니다!')
  }
}

// 삭제
const deleteWorship = (id: number) => {
  if (!confirm('정말 이 집회를 삭제하시겠습니까?')) return

  const index = worships.value.findIndex(w => w.id === id)
  if (index !== -1) {
    worships.value.splice(index, 1)
    alert('집회가 삭제되었습니다!')
  }
}
</script>