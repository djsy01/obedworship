<script setup lang="ts">
import { ref } from "vue";
import { isAdmin } from "@/composables/session";
import MemberEditModal from "@/components/MemberEditModal.vue";
import MemberFilters from "@/components/vision/MemberFilters.vue";
import MemberCard from "@/components/vision/MemberCard.vue";
import VisionHero from "@/components/vision/VisionHero.vue";
import VisionTeamControls from "@/components/vision/VisionTeamControls.vue";
import PositionTooltip from "@/components/vision/PositionTooltip.vue";
import { useVisionMembers } from "@/components/vision/useVisionMembers";
import { useVisionFilters } from "@/components/vision/useVisionFilters";
import "../styles/Vision.css";

const adminModeEnabled = ref(false);
const { members, loading, isModalOpen, selectedMember, openAddModal, openEditModal,
  closeModal, handleMemberSaved, deleteMemberConfirm } = useVisionMembers(adminModeEnabled);
const { filter, worshipFilter, stepFilter, filteredMembers, handleMainFilter } = useVisionFilters(members);
const tooltip = ref({ visible: false, x: 0, y: 0, badges: [] as string[], type: "" });
function showTooltip(event: MouseEvent, badges: string[], type: string) {
  const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
  tooltip.value = { visible: true, x: rect.left + rect.width / 2, y: rect.top - 8, badges, type };
}
</script>
<template>
  <div class="page">
    <section class="section">
      <div class="section-header">
        <div>
          <h1 class="section-title">비전</h1>
          <p class="section-subtitle">순종과 경외로 주님과 소통하는 예배 공동체의 비전과 팀원들을 소개합니다.</p>
        </div>
      </div>

      <VisionHero />

      <div class="team-member-section">
        <VisionTeamControls v-model:enabled="adminModeEnabled" @add="openAddModal" />

        <MemberFilters
          :filter="filter" :worship-filter="worshipFilter" :step-filter="stepFilter"
          @main-filter="handleMainFilter" @worship-filter="worshipFilter = $event" @step-filter="stepFilter = $event"
        />

        <div v-if="loading" class="loading">로딩 중...</div>
        <div v-else class="member-grid">
          <MemberCard
            v-for="member in filteredMembers" :key="member.id"
            :member="member" :is-admin="isAdmin" :admin-mode-enabled="adminModeEnabled"
            @edit="openEditModal" @delete="deleteMemberConfirm"
            @show-tooltip="showTooltip" @hide-tooltip="tooltip.visible = false"
          />
          <p v-if="filteredMembers.length === 0" class="empty-text">조건에 맞는 팀원이 없습니다.</p>
        </div>
      </div>
    </section>

    <MemberEditModal :is-open="isModalOpen" :member="selectedMember" @close="closeModal" @success="handleMemberSaved" />
    <PositionTooltip v-bind="tooltip" />
  </div>
</template>
