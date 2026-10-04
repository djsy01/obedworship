<script setup lang="ts">
defineProps<{ teamPhoto: string }>();
</script>

<template>
  <section class="hero">
    <div class="hero-content">
      <div class="hero-text">
        <p class="hero-label">OBED Worship</p>
        <h1 class="hero-title">보혈을 노래하는<br />예배 공동체, OBED</h1>
        <p class="hero-subtitle">
          중학생, 고등학생, 청년, 장년이 연합하여<br />
          주님께서 함께하심을 믿고 예배하는 공동체의 모임입니다.
        </p>
        <div class="hero-actions">
          <RouterLink to="/vision" class="btn primary">비전</RouterLink>
          <RouterLink to="/worship-log" class="btn ghost">지난 집회 기록</RouterLink>
        </div>
      </div>
      <div class="hero-image">
        <img :src="teamPhoto" alt="OBED Worship 단체 사진" class="team-photo" />
      </div>
    </div>
  </section>
</template>
