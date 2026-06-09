<script setup lang="ts">
import { ref, onMounted } from "vue";
import { assetApi } from "@/api/assets";
import HeroSection from "@/components/home/HeroSection.vue";
import FeatureCards from "@/components/home/FeatureCards.vue";
import "../styles/Home.css";

const teamPhoto = ref("");

onMounted(async () => {
  try {
    const response = await assetApi.getByKey("home_team_photo");
    if (response.data.file_url) teamPhoto.value = response.data.file_url;
  } catch {}
});
</script>

<template>
  <div class="page">
    <HeroSection :team-photo="teamPhoto" />
    <FeatureCards />
  </div>
</template>
