<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router";
import WorshipDetailPage from "@/components/worship-detail/WorshipDetailPage.vue";
import "../styles/WorshipDetail.css";
import "../styles/WorshipTabs.css";

const route = useRoute();
const id = computed(() => Number(route.params.id));
</script>

<template>
  <WorshipDetailPage :key="id" :id="id" />
</template>
