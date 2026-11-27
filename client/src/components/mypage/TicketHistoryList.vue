<template>
  <!--
        <div v-if="filteredApplications.length > 0" class="applications-list">
          <div v-for="app in filteredApplications" :key="app.id" class="application-card" >
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
                  <span class="detail-value">{{ formatDate(app.applied_at) }}</span>
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
              <button v-if="app.status === 'PENDING' || app.status === 'CONFIRMED'" class="btn small danger" @click="cancelApplication(app.id)" >
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
</template>
