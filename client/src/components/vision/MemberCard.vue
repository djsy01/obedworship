<script setup lang="ts">
type Member = {
  id: number; name: string; affiliation: string; photo_url: string;
  instagram_url: string | null; youtube_url: string | null;
  roles: string[]; worship_positions: string[]; step_positions: string[];
  description: string;
};

defineProps<{ member: Member; isAdmin: boolean; adminModeEnabled: boolean }>();
const emit = defineEmits<{
  edit: [member: Member]; delete: [member: Member];
  'show-tooltip': [event: MouseEvent, badges: string[], type: string];
  'hide-tooltip': [];
}>();
</script>

<template>
  <div class="member-card">
    <img :src="member.photo_url" :alt="member.name" class="member-photo" />
    <div class="member-info">
      <div class="member-name-row">
        <h3 class="member-name">{{ member.name }}</h3>
        <div class="member-social-text" v-if="member.instagram_url || member.youtube_url">
          <a v-if="member.instagram_url" :href="member.instagram_url" target="_blank" rel="noopener noreferrer" class="social-text-link instagram">Instagram</a>
          <a v-if="member.youtube_url" :href="member.youtube_url" target="_blank" rel="noopener noreferrer" class="social-text-link youtube">YouTube</a>
        </div>
      </div>
      <span class="affiliation-badge">{{ member.affiliation }}</span>
      <div v-if="member.roles.length > 0" class="member-roles">
        <span v-for="role in member.roles" :key="role" class="role-badge">{{ role }}</span>
      </div>
      <div v-if="member.worship_positions.length > 0" class="member-positions-group">
        <div class="position-badges">
          <template v-if="member.worship_positions.length >= 3">
            <span v-for="pos in member.worship_positions.slice(0, 2)" :key="pos" class="position-badge worship">{{ pos }}</span>
            <span class="position-badge-more" @mouseenter="emit('show-tooltip', $event, member.worship_positions.slice(2), 'worship')" @mouseleave="emit('hide-tooltip')">+{{ member.worship_positions.length - 2 }}</span>
          </template>
          <template v-else>
            <span v-for="pos in member.worship_positions" :key="pos" class="position-badge worship">{{ pos }}</span>
          </template>
        </div>
      </div>
      <div v-if="member.step_positions.length > 0" class="member-positions-group">
        <div class="position-badges">
          <template v-if="member.step_positions.length >= 3">
            <span v-for="pos in member.step_positions.slice(0, 2)" :key="pos" class="position-badge step">{{ pos }}</span>
            <span class="position-badge-more" @mouseenter="emit('show-tooltip', $event, member.step_positions.slice(2), 'step')" @mouseleave="emit('hide-tooltip')">+{{ member.step_positions.length - 2 }}</span>
          </template>
          <template v-else>
            <span v-for="pos in member.step_positions" :key="pos" class="position-badge step">{{ pos }}</span>
          </template>
        </div>
      </div>
      <div v-if="isAdmin && adminModeEnabled" style="margin-top: 1rem; display: flex; gap: 0.5rem">
        <button @click="emit('edit', member)" style="flex:1;padding:0.5rem;background:#4a7c59;color:white;border:none;border-radius:4px;cursor:pointer;font-size:0.85rem">✏️ 수정</button>
        <button @click="emit('delete', member)" style="flex:1;padding:0.5rem;background:#c0392b;color:white;border:none;border-radius:4px;cursor:pointer;font-size:0.85rem">🗑️ 삭제</button>
      </div>
    </div>
  </div>
</template>
