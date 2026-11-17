import { createRouter, createWebHistory } from 'vue-router';
import { LEAF_MENUS, ROLE } from '@/config/menuConfig';
import { useAppStore } from '@/store/appStore';
import { logScreenView } from '@/firebase';

const HOME_ROUTE = 'dashboard';

// 소메뉴에 지정한 `component` 문자열을 실제 컴포넌트로 연결한다.
// 아직 화면이 없는 메뉴는 준비중(PgReady) 페이지로 대체된다.
const pageModules = import.meta.glob('../views/pages/**/*.vue');

function resolvePage(componentPath) {
    if (!componentPath) return () => import('@/views/pages/PgReady.vue');

    const key = `../views/pages/${componentPath}.vue`;
    if (!pageModules[key]) {
        console.warn(`[router] 페이지를 찾을 수 없습니다: ${key}`);
        return () => import('@/views/pages/PgReady.vue');
    }
    return pageModules[key];
}

/** camelCase 라우트 name → kebab-case URL */
function toUrlPath(name) {
    return name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
}

const menuRoutes = LEAF_MENUS.map((leaf) => ({
    path: toUrlPath(leaf.path),
    name: leaf.path,
    component: resolvePage(leaf.component),
    meta: {
        requiresAuth: true,
        role: leaf.roles,
        key: leaf.path,
        nameKey: leaf.nameKey,
        gnbKey: leaf.gnbKey,
        groupKey: leaf.groupKey,
    },
}));

const routes = [
    {
        path: '/',
        component: () => import('@/layouts/full-page/FullPageWithOutFrame.vue'),
        children: [
            {
                path: '',
                name: 'login',
                component: () => import('@/views/pages/PgLogin.vue'),
                meta: { requiresAuth: false },
            },
        ],
    },
    {
        path: '/',
        component: () => import('@/layouts/full-page/FullPageWithFrame.vue'),
        children: [
            ...menuRoutes,
            {
                path: 'not-authorized',
                name: 'notAuthorized',
                component: () => import('@/views/pages/PgNotAuthorized.vue'),
                meta: { requiresAuth: true, nameKey: 'menu.notAuthorized' },
            },
        ],
    },
    {
        path: '/popup',
        component: () => import('@/layouts/full-page/FullPagePopup.vue'),
        children: [
            {
                path: 'brand',
                name: 'brandForm',
                component: () => import('@/views/pages/Master/PgBrandForm.vue'),
                meta: {
                    requiresAuth: true,
                    role: [ROLE.ADMIN, ROLE.MANAGER],
                    nameKey: 'menu.brand',
                    popup: true,
                },
            },
            {
                path: 'maker',
                name: 'makerForm',
                component: () => import('@/views/pages/Master/PgMakerForm.vue'),
                meta: {
                    requiresAuth: true,
                    role: [ROLE.ADMIN, ROLE.MANAGER],
                    nameKey: 'menu.maker',
                    popup: true,
                },
            },
            {
                path: 'clothing-type',
                name: 'clothingTypeForm',
                component: () => import('@/views/pages/Master/PgClothingTypeForm.vue'),
                meta: {
                    requiresAuth: true,
                    role: [ROLE.ADMIN, ROLE.MANAGER],
                    nameKey: 'menu.clothingType',
                    popup: true,
                },
            },
            {
                path: 'return-reason',
                name: 'returnReasonForm',
                component: () => import('@/views/pages/Master/PgReturnReasonForm.vue'),
                meta: {
                    requiresAuth: true,
                    role: [ROLE.ADMIN, ROLE.MANAGER],
                    nameKey: 'menu.returnReason',
                    popup: true,
                },
            },
            {
                path: 'order-memo',
                name: 'orderMemoForm',
                component: () => import('@/views/pages/Order/PgOrderMemoForm.vue'),
                meta: {
                    requiresAuth: true,
                    role: [ROLE.ADMIN, ROLE.MANAGER, ROLE.USER],
                    nameKey: 'menu.orderMemo',
                    popup: true,
                },
            },
            {
                path: 'order-detail',
                name: 'orderDetail',
                component: () => import('@/views/pages/Order/PgOrderDetail.vue'),
                meta: {
                    requiresAuth: true,
                    role: [ROLE.ADMIN, ROLE.MANAGER, ROLE.USER],
                    nameKey: 'orderDetail.title',
                    popup: true,
                },
            },
            {
                path: 'product',
                name: 'productForm',
                component: () => import('@/views/pages/Bmkoo/PgProductForm.vue'),
                meta: {
                    requiresAuth: true,
                    role: [ROLE.ADMIN, ROLE.MANAGER],
                    nameKey: 'menu.product',
                    popup: true,
                },
            },
        ],
    },
    {
        path: '/:pathMatch(.*)*',
        redirect: '/',
    },
];

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes,
});

router.beforeEach((to, from, next) => {
    const appStore = useAppStore();

    if (!appStore.AppActiveUser.token) appStore.loadActiveUser();
    if (!appStore.config.apiUrl) appStore.loadConfig();
    if (!appStore.currentWarehouse) appStore.loadWarehouse();

    if (to.meta.requiresAuth) {
        if (!appStore.isLoggedIn) return next({ name: 'login' });

        if (to.meta.role?.length > 0) {
            const allowed = appStore.userRoles.some((role) => to.meta.role.includes(role));
            if (!allowed) return next({ name: 'notAuthorized' });
        }
        return next();
    }

    // 로그인 상태에서 로그인 화면으로 진입하면 마지막으로 보던 메뉴(없으면 홈)로 보낸다.
    if (appStore.isLoggedIn && to.name === 'login') {
        const lastMenu = localStorage.getItem('lastMenu');
        const target = lastMenu && router.hasRoute(lastMenu) ? lastMenu : HOME_ROUTE;
        return next({ name: target });
    }

    return next();
});

// SPA 는 화면 전환이 자동 수집되지 않으므로 직접 기록한다. (Analytics 가 꺼져 있으면 무시된다)
router.afterEach((to) => {
    logScreenView(to.name, to.fullPath);
});

export default router;
