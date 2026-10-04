<script setup lang="ts">
import { computed, ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useAuth } from "@/composables/useAuth";
import { worshipApi, type Worship } from "@/api/worship";
import WorshipCard from "@/components/worship-log/WorshipCard.vue";
import AddWorshipModal from "@/components/worship-log/AddWorshipModal.vue";
import "../styles/WorshipLog.css";

const router = useRouter();
const { isAdmin } = useAuth();

const logs = ref<Worship[]>([]);
const selectedYear = ref("");
const showAddModal = ref(false);
const loading = ref(true);
const error = ref(false);

const fetchWorships = async () => {
  loading.value = true; error.value = false;
  try { logs.value = (await worshipApi.getAll()).data; }
  catch { error.value = true; }
  finally { loading.value = false; }
};

const getYear = (dateStr: string) => new Date(dateStr + "T00:00:00").getFullYear();
const years = computed(() => Array.from(new Set(logs.value.map((l) => getYear(l.date)))).sort((a, b) => b - a));
const filteredLogs = computed(() => {
  const filtered = selectedYear.value ? logs.value.filter((l) => getYear(l.date) === Number(selectedYear.value)) : [...logs.value];
  return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
});

const goToDetail = (id: number) => router.push({ name: "worship-detail", params: { id: id.toString() } });

const deleteWorship = async (id: number) => {
  if (!confirm("정말 이 집회를 삭제하시겠습니까?")) return;
  loading.value = true;
  try { await worshipApi.delete(id); alert("집회가 삭제되었습니다!"); await fetchWorships(); }
  catch { alert("집회 삭제에 실패했습니다"); }
  finally { loading.value = false; }
};

const handleAddSubmit = async (data: Record<string, unknown>) => {
  loading.value = true;
  try {
    const response = await worshipApi.create(data as any);
    alert("집회가 추가되었습니다!"); showAddModal.value = false; await fetchWorships();
    router.push({ name: "worship-detail", params: { id: response.data.id.toString() } });
  } catch { alert("집회 추가에 실패했습니다"); }
  finally { loading.value = false; }
};

onMounted(fetchWorships);
</script>

<template>
  <div class="page">
    <section class="section">
      <div class="section-header">
        <div>
          <h1 class="section-title">집회안내</h1>
          <p class="section-subtitle">OBED Worship의 지난 집회 기록을 확인하세요. 각 집회에 대한 상세 정보와 설교 영상, 찬양 영상도 함께 제공합니다.</p>
        </div>
        <div class="section-controls">
          <label class="field">
            <span class="field-label">연도</span>
            <select v-model="selectedYear">
              <option value="">전체</option>
              <option v-for="year in years" :key="year" :value="year">{{ year }}</option>
            </select>
          </label>
          <button v-if="isAdmin" class="btn primary" @click="showAddModal = true">+ 집회 추가</button>
        </div>
      </div>

      <AddWorshipModal v-if="isAdmin" :show="showAddModal" :loading="loading" @close="showAddModal = false" @submit="handleAddSubmit" />

      <div v-if="loading" class="loading">로딩 중...</div>
      <div v-else-if="error" class="error-message">
        <p>정보를 가져오지 못했습니다.</p>
        <button class="btn primary" @click="fetchWorships">다시 시도</button>
      </div>
      <div v-else class="log-grid">
        <WorshipCard
          v-for="w in filteredLogs" :key="w.id" :worship="w" :is-admin="isAdmin"
          @click="goToDetail" @edit="goToDetail" @delete="deleteWorship"
        />
        <p v-if="filteredLogs.length === 0" class="empty-text">해당 조건에 맞는 집회 기록이 없습니다.</p>
      </div>
    </section>
  </div>
</template>
