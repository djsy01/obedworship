<template>
  <div class="page">
    <section class="section">
      <div class="section-header">
        <div>
          <h1 class="section-title">찾아오시는 길</h1>
          <p class="section-subtitle">
            예배가 진행되는 예수인교회 위치를 안내합니다.
          </p>
        </div>
      </div>
      <div class="map-content">
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

        <div class="map-address-info">
          <div class="map-address-label">
            경기도 고양시 덕양구 용현로 64 (예수인교회)
          </div>
          <div class="map-mapping">
            본관 지하 2층
          </div>
        </div>

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
    </section>
  </div>
</template>

<script setup>
import '../styles/Map.css'
</script>