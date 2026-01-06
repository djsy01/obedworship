import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'

import HomeView from '@/views/HomeView.vue'
import VisionView from '@/views/VisionView.vue'
import WorshipLogView from '@/views/WorshipLogView.vue'
import WorshipDetailView from '@/views/WorshipDetailView.vue'
import ScoresView from '@/views/ScoresView.vue'
import TicketsView from '@/views/TicketsView.vue'
import QnaView from '@/views/QnaView.vue'
import MapView from '@/views/MapView.vue'
import MyPageView from '@/views/MyPageView.vue'
import login from '@/components/Login.vue'
import register from '@/components/Register.vue'
import FindId from '@/components/FindId.vue'
import ResetPassword from '@/components/ResetPassword.vue'

const routes: RouteRecordRaw[] = [
  { path: '/', name: 'home', component: HomeView },
  { path: '/vision', name: 'vision', component: VisionView },
  { path: '/worship-log', name: 'worship-log', component: WorshipLogView },
  { path: '/worship-log/:id', name: 'worship-detail', component: WorshipDetailView },
  { path: '/scores', name: 'scores', component: ScoresView },
  { path: '/tickets', name: 'tickets', component: TicketsView },
  { path: '/qna', name: 'qna', component: QnaView },
  { path: '/map', name: 'map', component: MapView },
  { path: '/mypage', name: 'mypage', component: MyPageView },
  { path: '/login', name: 'login', component: login },
  { path: '/register', name: 'register', component: register },
  { path: '/find-id', name: 'find-id', component: FindId },
  { path: '/reset-password', name: 'reset-password', component: ResetPassword },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior() {
    return { top: 0 }
  },
})

export default router