<!-- src/views/TicketsView.vue -->
<template>
  <div class="page">
    <section class="section">
      <div class="section-header">
        <div>
          <h1 class="section-title">집회 티켓</h1>
          <p class="section-subtitle">
            다가오는 집회의 정보를 확인하고, 티켓을 신청할 수 있습니다.
          </p>
        </div>

        <div class="section-controls">
          <button
            v-if="isAdmin"
            class="btn primary"
            type="button"
            @click="showAddForm = !showAddForm"
          >
            {{ showAddForm ? '추가 취소' : '집회티켓 추가' }}
          </button>
        </div>
      </div>

      <div
        v-if="showAddForm && isAdmin"
        class="panel"
      >
        <h2 class="panel-title">새 집회티켓 추가</h2>
        <form class="form-grid" @submit.prevent>
          <label class="field">
            <span class="field-label">집회명</span>
            <input type="text" placeholder="집회명을 입력하세요" />
          </label>

          <label class="field">
            <span class="field-label">날짜 / 시간</span>
            <input type="text" placeholder="예: 2025-03-15 19:00" />
          </label>

          <label class="field">
            <span class="field-label">장소</span>
            <input type="text" placeholder="예: 본관 지하 2층" />
          </label>

          <label class="field">
            <span class="field-label">상태</span>
            <select>
              <option value="OPEN">예매 중</option>
              <option value="CLOSED">마감</option>
              <option value="CANCELED">취소</option>
            </select>
          </label>

          <label class="field">
            <span class="field-label">티켓 링크</span>
            <input
              type="text"
              placeholder="예: https://obed-ticket.vercel.app/event/123"
            />
          </label>

          <div class="form-actions">
            <button class="btn primary" type="submit">
              (Mock) 저장
            </button>
          </div>
        </form>
        <p class="panel-hint">
          ※ 현재는 UI만 구현된 상태입니다. 실제 저장은 티켓팅 서버 API와
          연동해서 처리해주세요.
        </p>
      </div>

      <div class="card-grid">
        <article
          v-for="t in tickets"
          :key="t.id"
          class="card"
        >
          <p class="card-label">{{ t.dateTime }}</p>
          <h2 class="card-title">{{ t.title }}</h2>
          <p class="card-meta">장소: {{ t.place }}</p>
          <p class="card-text">
            {{ t.description }}
          </p>
          <p class="card-status" :data-status="t.status">
            {{ statusText(t.status) }}
          </p>

          <div class="card-actions">
            <a
              :href="t.link"
              target="_blank"
              rel="noreferrer"
              class="btn small primary"
              :class="{ disabled: t.status !== 'OPEN' }"
            >
              {{ t.status === 'OPEN' ? '티켓 신청하기' : '신청 불가' }}
            </a>
          </div>
        </article>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAuth } from '@/composables/useAuth'

type TicketStatus = 'OPEN' | 'CLOSED' | 'CANCELED'

type Ticket = {
  id: number
  title: string
  dateTime: string
  place: string
  status: TicketStatus
  description: string
  link: string
}

const { isAdmin } = useAuth()

const showAddForm = ref(false)

const tickets = ref<Ticket[]>([
  {
    id: 1,
    title: '보혈 찬양집회',
    dateTime: '2025-03-15 (토) 19:00',
    place: '본관 지하 2층',
    status: 'OPEN',
    description: '보혈과 십자가를 주제로 드려지는 찬양집회입니다.',
    link: 'https://obed-ticket.vercel.app',
  },
  {
    id: 2,
    title: '평안을 너희에게 - 연말 집회',
    dateTime: '2024-12-06 (금) 19:30',
    place: '신관 2층 다목적홀',
    status: 'CLOSED',
    description: '요한복음 14:27 말씀을 붙잡고 드려진 집회입니다.',
    link: 'https://obed-ticket.vercel.app',
  },
])

const statusText = (status: TicketStatus) => {
  switch (status) {
    case 'OPEN':
      return '예매 중'
    case 'CLOSED':
      return '마감'
    case 'CANCELED':
      return '취소'
  }
}
</script>
