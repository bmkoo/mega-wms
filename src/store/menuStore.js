import { defineStore } from 'pinia';
import { FAVORITE_GROUP, findLeafMenu } from '@/config/menuConfig';
import { useAppStore } from '@/store/appStore';

const HOME_MENU = 'dashboard';

/** 즐겨찾기는 사용자별로 보관한다. */
function favoriteStorageKey() {
    const appStore = useAppStore();
    const user = appStore.AppActiveUser;
    return `favorites:${user.loginId || user.id || 'guest'}`;
}

/**
 * 메뉴 내비게이션 UI 상태.
 * - activeGnbKey: 상단에서 선택한 대메뉴 (좌측 LNB 에 노출할 트리 결정)
 * - openKeys / selectedKeys: 좌측 중메뉴 펼침 / 소메뉴 선택
 * - tabs: 열려 있는 화면 목록 (컨텐츠 상단 탭)
 * - favorites: 즐겨찾기한 소메뉴의 라우트 name 목록 (MyMenu 최상단에 노출)
 */
export const useMenuStore = defineStore('menu', {
    state: () => ({
        activeGnbKey: 'MYMENU',
        openKeys: [],
        selectedKeys: [],
        collapsed: false,
        tabs: [],
        favorites: [],
    }),

    getters: {
        activeTabKey: (state) => state.selectedKeys[0] || '',
        isFavorite: (state) => (path) => state.favorites.includes(path),
        /** 즐겨찾기 목록을 소메뉴 정의로 변환 (등록 순서 유지) */
        favoriteMenus: (state) => state.favorites.map(findLeafMenu).filter(Boolean),
    },

    actions: {
        /** 현재 라우트에 맞춰 대메뉴/중메뉴/탭 상태를 동기화 */
        syncRoute(routeName) {
            const leaf = findLeafMenu(routeName);
            if (!leaf) return;

            this.activeGnbKey = leaf.gnbKey;
            this.selectedKeys = [leaf.path];
            if (!this.openKeys.includes(leaf.groupKey)) {
                this.openKeys = [...this.openKeys, leaf.groupKey];
            }
            this.openTab(leaf);
            localStorage.setItem('lastMenu', leaf.path);
        },

        setActiveGnb(gnbKey) {
            this.activeGnbKey = gnbKey;
        },

        setOpenKeys(keys) {
            this.openKeys = keys;
        },

        toggleCollapsed() {
            this.collapsed = !this.collapsed;
        },

        openTab(leaf) {
            if (this.tabs.some((tab) => tab.key === leaf.path)) return;
            this.tabs.push({
                key: leaf.path,
                nameKey: leaf.nameKey,
                gnbKey: leaf.gnbKey,
                groupKey: leaf.groupKey,
                closable: leaf.path !== HOME_MENU,
            });
        },

        /** 탭 제거 후 이동해야 할 라우트 name 을 반환 (없으면 null) */
        closeTab(key) {
            const index = this.tabs.findIndex((tab) => tab.key === key);
            if (index < 0) return null;

            this.tabs.splice(index, 1);

            if (this.activeTabKey !== key) return null;
            const next = this.tabs[index] || this.tabs[index - 1];
            return next ? next.key : HOME_MENU;
        },

        closeOtherTabs(key) {
            this.tabs = this.tabs.filter((tab) => tab.key === key || !tab.closable);
            return key;
        },

        closeAllTabs() {
            this.tabs = this.tabs.filter((tab) => !tab.closable);
            return this.tabs[0]?.key || HOME_MENU;
        },

        loadFavorites() {
            const saved = JSON.parse(localStorage.getItem(favoriteStorageKey()) || '[]');
            // 메뉴 구성이 바뀌어 사라진 항목은 걸러낸다.
            this.favorites = saved.filter((path) => findLeafMenu(path));

            if (this.favorites.length && !this.openKeys.includes(FAVORITE_GROUP.key)) {
                this.openKeys = [FAVORITE_GROUP.key, ...this.openKeys];
            }
        },

        /** 즐겨찾기 토글. 추가되면 true, 해제되면 false 를 반환한다. */
        toggleFavorite(path) {
            if (!findLeafMenu(path)) return false;

            const added = !this.favorites.includes(path);
            this.favorites = added
                ? [...this.favorites, path]
                : this.favorites.filter((item) => item !== path);

            localStorage.setItem(favoriteStorageKey(), JSON.stringify(this.favorites));

            if (added && !this.openKeys.includes(FAVORITE_GROUP.key)) {
                this.openKeys = [FAVORITE_GROUP.key, ...this.openKeys];
            }
            return added;
        },
    },
});
