// src/router/index.ts
import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'

import HomeView from '@/views/HomeView.vue'
import VisionView from '@/views/VisionView.vue'
import WorshipLogView from '@/views/WorshipLogView.vue'
import ScoresView from '@/views/ScoresView.vue'
import TicketsView from '@/views/TicketsView.vue'
import QnaView from '@/views/QnaView.vue'

const routes: RouteRecordRaw[] = [
  { path: '/', name: 'home', component: HomeView },
  { path: '/vision', name: 'vision', component: VisionView },
  { path: '/worship-log', name: 'worship-log', component: WorshipLogView },
  { path: '/scores', name: 'scores', component: ScoresView },
  { path: '/tickets', name: 'tickets', component: TicketsView },
  { path: '/qna', name: 'qna', component: QnaView },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior() {
    return { top: 0 }
  },
})

export default router
