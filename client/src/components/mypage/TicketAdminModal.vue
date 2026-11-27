<template>
  <!--
    <div v-if="showAdminApplications && isAdmin" class="modal-overlay" @click="closeAdminApplications" >
      <div class="modal-content admin-applications-modal" @click.stop>
        <div class="modal-header">
          <h2 class="modal-title">전체 신청 현황</h2>
          <button class="modal-close" @click="closeAdminApplications">✕</button>
        </div>
        <div class="modal-body">
          <div class="admin-applications-list">
            <div v-for="app in allApplications" :key="app.id" class="admin-application-item" >
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
                <button v-if="app.status === 'PENDING'" class="btn small primary" @click="approveApplication(app.id)" >
                  ✅ 승인
                </button>
                <button class="btn small danger" @click="cancelApplicationAdmin(app.id)" >
                  ❌ 취소
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  -->
</template>
