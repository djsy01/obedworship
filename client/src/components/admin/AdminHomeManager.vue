<script setup lang="ts">
import { ref } from "vue";
import HomeImageManager from "./HomeImageManager.vue";
import HomeSongsManager from "./HomeSongsManager.vue";

const expanded = ref(false);
</script>

<template>
  <div class="photo-manager">
    <div class="manager-header">
      <h3>홈 관리</h3>
      <button class="btn-toggle" @click="expanded = !expanded">{{ expanded ? "접기 ▲" : "펼치기 ▼" }}</button>
    </div>
    <div v-show="expanded" class="manager-content">
      <HomeImageManager
        title="단체 사진 (Team Photo)" asset-key="home_team_photo" asset-title="OBED Worship 단체 사진"
        description="메인 페이지 단체 사진" label="사진" alt="현재 단체 사진"
      />
      <HomeImageManager
        title="로고 (Logo)" asset-key="home_logo" asset-title="OBED Worship 로고" description="메인 로고"
        label="로고" alt="현재 로고"
      />
      <HomeSongsManager />
    </div>
  </div>
</template>
