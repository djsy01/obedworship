<!-- src/views/HomeView.vue -->
<template>
  <div class="page">
    <section class="hero">
      <div class="hero-text">
        <p class="hero-label">OBED Worship</p>
        <h1 class="hero-title">
          보혈을 노래하는 예배 공동체, OBED
        </h1>
        <p class="hero-subtitle">
          중학생, 고등학생, 청년, 장년이 연합하여 주님께서 함께하심을 믿고 예배하는 공동체의 모입입니다.
        </p>

        <div class="hero-actions">
          <RouterLink to="/tickets" class="btn primary">
            다음 집회 보기
          </RouterLink>
          <RouterLink to="/worship-log" class="btn ghost">
            지난 집회 기록
          </RouterLink>
        </div>
      </div>
    </section>

    <section class="section">
      <h2 class="section-title">무엇을 할 수 있나요?</h2>
      <div class="card-grid">
        <article class="card">
          <h3 class="card-title">집회 일정 안내</h3>
          <p class="card-text">
            다가오는 집회와 지난 집회 정보를 한눈에 확인하고, 집회신청 페이지로
            바로 이동할 수 있습니다.
          </p>
          <RouterLink to="/tickets" class="card-link">
            집회신청 페이지로 이동
          </RouterLink>
        </article>

        <article class="card">
          <h3 class="card-title">악보 다운로드</h3>
          <p class="card-text">
            로그인한 팀원과 참여자는 예배에서 사용한 곡들의 악보를 내려받을 수
            있습니다.
          </p>
          <RouterLink to="/scores" class="card-link">
            악보 페이지로 이동
          </RouterLink>
        </article>

        <article class="card">
          <h3 class="card-title">Q&amp;A</h3>
          <p class="card-text">
            OBED와 집회, 악보, 참여에 대한 질문을 남기면, 관리자가 답변을
            남겨드립니다. 질문자는 화면에 표시되지 않습니다.
          </p>
          <RouterLink to="/qna" class="card-link">
            Q&amp;A 보러가기
          </RouterLink>
        </article>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
</script>