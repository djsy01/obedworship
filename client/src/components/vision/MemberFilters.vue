<script setup lang="ts">
defineProps<{ filter: string; worshipFilter: string; stepFilter: string }>();
const emit = defineEmits<{
  'main-filter': ['all' | 'leader' | 'worship' | 'step'];
  'worship-filter': [string];
  'step-filter': [string];
}>();
</script>

<template>
  <div>
    <div class="position-filter">
      <button class="filter-btn" :class="{ active: filter === 'all' }" @click="emit('main-filter', 'all')">All</button>
      <button class="filter-btn" :class="{ active: filter === 'leader' }" @click="emit('main-filter', 'leader')">Leader</button>
      <button class="filter-btn" :class="{ active: filter === 'worship' }" @click="emit('main-filter', 'worship')">Worship</button>
      <button class="filter-btn" :class="{ active: filter === 'step' }" @click="emit('main-filter', 'step')">Step</button>
    </div>

    <div v-if="filter === 'worship'" class="worship-filters">
      <button class="filter-btn small" :class="{ active: worshipFilter === '' }" @click="emit('worship-filter', '')">Worship All</button>
      <button class="filter-btn small" :class="{ active: worshipFilter === 'Vocal' }" @click="emit('worship-filter', 'Vocal')">Vocal</button>
      <button class="filter-btn small" :class="{ active: worshipFilter === 'Piano' }" @click="emit('worship-filter', 'Piano')">Piano</button>
      <button class="filter-btn small" :class="{ active: worshipFilter === 'Guitar' }" @click="emit('worship-filter', 'Guitar')">Guitar</button>
      <button class="filter-btn small" :class="{ active: worshipFilter === 'Drum' }" @click="emit('worship-filter', 'Drum')">Drum</button>
    </div>

    <div v-if="filter === 'step'" class="step-filters">
      <button class="filter-btn small" :class="{ active: stepFilter === '' }" @click="emit('step-filter', '')">Step All</button>
      <button class="filter-btn small" :class="{ active: stepFilter === 'Accounting Team' }" @click="emit('step-filter', 'Accounting Team')">Accounting Team</button>
      <button class="filter-btn small" :class="{ active: stepFilter === 'Planning Team' }" @click="emit('step-filter', 'Planning Team')">Planning Team</button>
      <button class="filter-btn small" :class="{ active: stepFilter === 'Media Team' }" @click="emit('step-filter', 'Media Team')">Media Team</button>
      <button class="filter-btn small" :class="{ active: stepFilter === 'Stage Team' }" @click="emit('step-filter', 'Stage Team')">Stage Team</button>
      <button class="filter-btn small" :class="{ active: stepFilter === 'Prayer Team' }" @click="emit('step-filter', 'Prayer Team')">Prayer Team</button>
    </div>
  </div>
</template>
