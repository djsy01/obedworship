<template>
  <!--
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
                <span class="detail-value">{{ selectedApplication.worship_title }}</span>
              </div>
              <div class="detail-item-full">
                <span class="detail-label">날짜</span>
                <span class="detail-value">{{ selectedApplication.worship_date }}</span>
              </div>
              <div class="detail-item-full">
                <span class="detail-label">장소</span>
                <span class="detail-value">{{ selectedApplication.worship_place }}</span>
              </div>
            </div>
          </div>
          <div class="detail-section">
            <h3 class="detail-section-title">신청 정보</h3>
            <div class="detail-grid">
              <div class="detail-item-full">
                <span class="detail-label">신청 인원</span>
                <span class="detail-value" >{{ selectedApplication.party_size }}명</span >
              </div>
              <div class="detail-item-full">
                <span class="detail-label">신청일</span>
                <span class="detail-value">{{ formatDate(selectedApplication.created_at) }}</span>
              </div>
              <div class="detail-item-full">
                <span class="detail-label">상태</span>
                <span class="application-status" :data-status="selectedApplication.status" >
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
  -->
</template>
