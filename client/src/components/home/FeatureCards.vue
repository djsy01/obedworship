<template>
  <section class="section features-section">
    <h2 class="section-title">무엇을 할 수 있나요?</h2>
    <div class="card-grid">
      <!--
      <article class="card feature-card">
        <div class="card-icon">📅</div>
        <h3 class="card-title">집회 일정 안내</h3>
        <p class="card-text">다가오는 집회와 지난 집회 정보를 한눈에 확인하고, 집회신청 페이지로 바로 이동할 수 있습니다.</p>
        <RouterLink to="/tickets" class="card-link">집회신청 페이지로 이동 →</RouterLink>
      </article>
      -->
      <article class="card feature-card">
        <div class="card-icon">🎼</div>
        <h3 class="card-title">악보 다운로드</h3>
        <p class="card-text">OBED Worship에서 자작곡 및 편곡한 악보들을 무료로 다운로드할 수 있습니다.</p>
        <RouterLink to="/scores" class="card-link">악보 페이지로 이동 →</RouterLink>
      </article>
      <article class="card feature-card">
        <div class="card-icon">💬</div>
        <h3 class="card-title">Q&amp;A</h3>
        <p class="card-text">OBED와 집회, 악보, 참여에 대한 질문을 남기면, 관리자가 답변을 남겨드립니다. 질문자는 화면에 표시되지 않습니다.</p>
        <RouterLink to="/qna" class="card-link">Q&amp;A 보러가기 →</RouterLink>
      </article>
    </div>
  </section>
</template>
