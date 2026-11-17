import { defineStore } from 'pinia';
import { useNotification } from '@kyvg/vue3-notification';
import { useLoading } from '@/views/components/fnc';
import { ROLE } from '@/config/menuConfig';
import { logAppEvent, setAnalyticsUser } from '@/firebase';

const { show, hide } = useLoading();

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

const EMPTY_USER = {
    token: null,
    id: null,
    loginId: '',
    name: '',
    email: '',
    company: '',
    roles: [],
    warehouses: [],
};

/** 서버 없이 화면을 확인할 때 사용하는 임시 계정 */
const MOCK_USER = {
    token: 'mock-token',
    id: 1,
    loginId: 'admin',
    name: '홍길동',
    email: 'admin@i-wms.local',
    company: '메가커피',
    roles: [ROLE.ADMIN, ROLE.MANAGER, ROLE.USER],
    warehouses: [
        { code: 'WH001', name: '본사 자재창고' },
        { code: 'WH002', name: '용인 물류센터' },
        { code: 'WH003', name: '부산 냉장창고' },
    ],
};

export const useAppStore = defineStore('app', {
    state: () => ({
        AppActiveUser: { ...EMPTY_USER },
        config: {
            ip: '',
            apiUrl: '',
        },
        /** 헤더에서 선택한 작업 창고 (모든 조회의 기본 조건) */
        currentWarehouse: null,
        locale: localStorage.getItem('locale') || 'ko',
    }),

    getters: {
        isLoggedIn: (state) => !!state.AppActiveUser.token,
        isAdmin: (state) => state.AppActiveUser.roles?.includes(ROLE.ADMIN),
        userRoles: (state) => state.AppActiveUser.roles || [],
        warehouseOptions: (state) =>
            (state.AppActiveUser.warehouses || []).map((w) => ({ value: w.code, label: w.name })),
    },

    actions: {
        async login({ loginId, password, isReloadRequired = false }) {
            const { notify } = useNotification();
            try {
                show();

                // apiFunctions 가 이 스토어를 참조하므로 순환 import 를 피해 호출 시점에 로드한다.
                const { default: api } = await import('@/common/utils/apiFunctions');

                const data = USE_MOCK
                    ? { ...MOCK_USER, loginId }
                    : await api.onApiLogin({ username: loginId, password });

                if (!data?.token) {
                    notify({ title: '알림', text: '아이디 또는 비밀번호를 확인하세요.', type: 'error' });
                    return false;
                }

                this.updateUserInfo(data);
                this.loadWarehouse();
                setAnalyticsUser(data.loginId || loginId);
                logAppEvent('login', { method: 'password' });

                if (isReloadRequired) window.location.reload();
                return true;
            } catch (error) {
                notify({ title: '알림', text: error?.message || '로그인에 실패했습니다.', type: 'error' });
                return false;
            } finally {
                hide();
            }
        },

        logout() {
            const { notify } = useNotification();
            setAnalyticsUser(null);
            this.clearActiveUser();
            localStorage.removeItem('lastMenu');
            localStorage.removeItem('warehouse');
            notify({ title: '로그아웃', text: '정상적으로 로그아웃되었습니다.', type: 'success' });
            window.location.reload();
        },

        updateUserInfo(payload) {
            const userInfo = { ...EMPTY_USER, ...this.AppActiveUser };

            Object.keys(payload).forEach((property) => {
                if (payload[property] !== null && payload[property] !== undefined) {
                    userInfo[property] = payload[property];
                }
            });

            this.AppActiveUser = userInfo;
            localStorage.setItem('userInfo', JSON.stringify(userInfo));
        },

        loadActiveUser() {
            const saved = JSON.parse(localStorage.getItem('userInfo') || 'null');
            this.AppActiveUser = saved ? { ...EMPTY_USER, ...saved } : { ...EMPTY_USER };
        },

        clearActiveUser() {
            this.AppActiveUser = { ...EMPTY_USER };
            localStorage.removeItem('userInfo');
        },

        setConfig(config) {
            this.config = { ...this.config, ...config };
            localStorage.setItem('ip', this.config.ip);
            localStorage.setItem('axios', this.config.apiUrl);
        },

        loadConfig() {
            const ip = localStorage.getItem('ip') || import.meta.env.VITE_API_URL;
            const apiUrl = localStorage.getItem('axios') || `http://${ip}:8802/`;
            this.config = { ip, apiUrl };
        },

        setWarehouse(code) {
            const found = (this.AppActiveUser.warehouses || []).find((w) => w.code === code);
            this.currentWarehouse = found || null;
            if (found) localStorage.setItem('warehouse', found.code);
        },

        /** 저장된 창고가 없으면 첫 번째 창고를 기본 선택한다. */
        loadWarehouse() {
            const list = this.AppActiveUser.warehouses || [];
            if (!list.length) {
                this.currentWarehouse = null;
                return;
            }
            const saved = localStorage.getItem('warehouse');
            this.currentWarehouse = list.find((w) => w.code === saved) || list[0];
            localStorage.setItem('warehouse', this.currentWarehouse.code);
        },

        setLocale(locale) {
            this.locale = locale;
            localStorage.setItem('locale', locale);
        },
    },
});
