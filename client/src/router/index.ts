import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import HomeView from '@/views/HomeView.vue';
import VisionView from '@/views/VisionView.vue';
import WorshipLogView from '@/views/WorshipLogView.vue';
import WorshipDetailView from '@/views/WorshipDetailView.vue';
import ScoresView from '@/views/ScoresView.vue';
import TicketsView from '@/views/TicketsView.vue';
import QnaView from '@/views/QnaView.vue';
import MapView from '@/views/MapView.vue';
import MyPageView from '@/views/MyPageView.vue';
import AdminView from '@/views/AdminView.vue';
import login from '@/components/Login.vue';
import register from '@/components/Register.vue';
import FindId from '@/components/Find-ID.vue';
import ResetPassword from '@/components/Reset-Password.vue';
import { watch } from 'vue';
import { checkSession } from '@/composables/auth-session';
import { isAdmin, sessionExpired, sessionToken } from '@/composables/session';

const routes: RouteRecordRaw[] = [
    { path: '/', name: 'home', component: HomeView },
    { path: '/vision', name: 'vision', component: VisionView },
    { path: '/worship-log', name: 'worship-log', component: WorshipLogView },
    { path: '/worship-log/:id', name: 'worship-detail', component: WorshipDetailView },
    { path: '/scores', name: 'scores', component: ScoresView },
    { path: '/tickets', name: 'tickets', component: TicketsView },
    { path: '/qna', name: 'qna', component: QnaView },
    { path: '/map', name: 'map', component: MapView },
    { path: '/mypage', name: 'mypage', component: MyPageView, meta: { requiresAuth: true } },
    { path: '/admin', name: 'admin', component: AdminView, meta: { requiresAdmin: true } },
    { path: '/login', name: 'login', component: login },
    { path: '/register', name: 'register', component: register },
    { path: '/find-id', name: 'find-id', component: FindId },
    { path: '/reset-password', name: 'reset-password', component: ResetPassword },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
    scrollBehavior: () => ({ top: 0 }),
});

router.beforeEach(async (to, from) => {
    const protectedRoute = to.meta.requiresAdmin || to.meta.requiresAuth;
    if (!protectedRoute && from.name) return true;

    const hadToken = Boolean(sessionToken());
    const authenticated = hadToken && await checkSession();
    if (protectedRoute && !authenticated) {
        return { name: 'login', query: hadToken && !sessionToken() ? { expired: '1' } : {} };
    }
    if (to.meta.requiresAdmin && !isAdmin.value) return { name: 'home' };
    return true;
});

watch(sessionExpired, expired => {
    if (expired) router.replace({ name: 'login', query: { expired: '1' } });
});

export default router;
