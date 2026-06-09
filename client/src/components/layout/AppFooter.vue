<script setup lang="ts">
import soundcloudIcon from '@/assets/icons/Soundcloud.png';
import instagramIcon from '@/assets/icons/Instagram.png';
import youtubeIcon from '@/assets/icons/youtube.png';
</script>

<template>
  <footer class="app-footer">
    <div class="footer-content">
      <p class="footer-text">© {{ new Date().getFullYear() }} OBED Worship. All rights reserved.</p>
      <div class="footer-social">
        <a href="https://soundcloud.com/obed-497061928" target="_blank" rel="noopener noreferrer" class="social-link" title="OBED Worship Soundcloud">
          <img :src="soundcloudIcon" alt="Soundcloud" class="social-icon-footer" />
        </a>
        <a href="https://www.instagram.com/obed_worship" target="_blank" rel="noopener noreferrer" class="social-link" title="OBED Worship Instagram">
          <img :src="instagramIcon" alt="Instagram" class="social-icon-footer" />
        </a>
        <a href="https://www.youtube.com/@obed_worship" target="_blank" rel="noopener noreferrer" class="social-link" title="OBED Worship YouTube">
          <img :src="youtubeIcon" alt="YouTube" class="social-icon-footer" />
        </a>
      </div>
    </div>
  </footer>
</template>
