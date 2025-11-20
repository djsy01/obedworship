<template>
  <div class="map-section">
    <!-- 제목 -->
    <h2>찾아오시는 길</h2>

    <!-- 구글 지도 임베드 -->
    <div class="map-container">
      <iframe
        src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d1580.1564111497155!2d126.8361455337295!3d37.61832881652992!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x357c9a4552397f0b%3A0xc99a963ed07b51d8!2z7JiI7IiY7J246rWQ7ZqM!5e0!3m2!1sko!2sus!4v1746049290723!5m2!1sko!2sus"
        width="100%"
        height="450"
        style="border:0;"
        allowfullscreen
        loading="lazy"
        referrerpolicy="no-referrer-when-downgrade"
        title="예수인교회 위치 지도"
      ></iframe>
    </div>

    <!-- 설명 -->
    <p>
      <div class="map-address-label">
        경기도 고양시 덕양구 용현로 64 (예수인교회)
      </div>
      <div class="map-mapping">
        본관 지하 2층
      </div>
    </p>

    <!-- 길찾기 링크 -->
    <div class="map-links">
      <a
        href="https://www.google.com/maps/dir/?api=1&destination=예수인교회+고양시+덕양구+용현로+64"
        target="_blank"
        rel="noopener noreferrer"
      >
        구글지도 길찾기
      </a>
      <a
        href="https://map.kakao.com/link/to/예수인교회,37.61804199760987,126.83622561389963"
        target="_blank"
        rel="noopener noreferrer"
      >
        카카오맵 길찾기
      </a>
    </div>
  </div>
</template>

<script setup>
import '../styles/Map.css'
</script>
