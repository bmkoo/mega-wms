<template>
  <header class="gnb">
    <!-- 로고 -->
    <div class="gnb__brand clickable" @click="onClickBrand">
      <img class="gnb__logo" :src="iconUrl" alt="i-WMS" />
      <span class="gnb__brand-name">{{ t('appName') }}</span>
    </div>

    <!-- 대메뉴 -->
    <nav class="gnb__menu">
      <button
        v-for="gnb in menuTree"
        :key="gnb.key"
        type="button"
        class="gnb__item"
        :class="{ 'gnb__item--active': gnb.key === menuStore.activeGnbKey }"
        @click="onSelectGnb(gnb)"
      >
        <component :is="gnb.icon" class="gnb__item-icon" />
        <span>{{ t(gnb.nameKey) }}</span>
      </button>
    </nav>

    <!-- 우측 유틸 -->
    <div class="gnb__util">
      <button type="button" class="gnb__util-item" @click="emit('onClickSetting')">
        <SettingOutlined />
        <span>{{ t('common.setting') }}</span>
      </button>

      <button type="button" class="gnb__util-item" @click="onLogout">
        <PoweroffOutlined />
        <span>{{ t('logout') }}</span>
      </button>
    </div>
  </header>
</template>

<script setup>
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { Modal } from 'ant-design-vue';
import { useAppStore } from '@/store/appStore';
import { useMenuStore } from '@/store/menuStore';
import { FAVORITE_GROUP, filterMenusByRoles } from '@/config/menuConfig';

const emit = defineEmits(['onClickSetting']);

const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const appStore = useAppStore();
const menuStore = useMenuStore();

const iconUrl = `${import.meta.env.BASE_URL}icon-64.png`;
const menuTree = computed(() => filterMenusByRoles(appStore.userRoles));

const onMoveMenu = (name) => {
  if (name && name !== route.name) router.push({ name }).catch(() => {});
};

const onClickBrand = () => onMoveMenu('dashboard');

const onSelectGnb = (gnb) => {
  menuStore.setActiveGnb(gnb.key);
  const firstGroup = gnb.children?.[0];
  if (!firstGroup) return;

  const openKeys = [firstGroup.key];
  // MyMenu 는 즐겨찾기 그룹이 LNB 최상단에 붙으므로 함께 펼쳐 준다.
  if (gnb.key === FAVORITE_GROUP.gnbKey && menuStore.favorites.length) {
    openKeys.unshift(FAVORITE_GROUP.key);
  }
  menuStore.setOpenKeys(openKeys);

  onMoveMenu(firstGroup.children?.[0]?.path);
};

const onLogout = () => {
  Modal.confirm({
    title: t('logout'),
    content: t('logout') + '하시겠습니까?',
    okText: t('common.confirm'),
    cancelText: t('common.cancel'),
    onOk: () => appStore.logout(),
  });
};
</script>

<style scoped>
.gnb {
  display: flex;
  align-items: stretch;
  height: var(--wms-gnb-height);
  padding-left: 14px;
  background: linear-gradient(180deg, var(--wms-gnb-bg) 0%, var(--wms-gnb-bg-dark) 100%);
  color: #fff;
}

/* ── 로고 ── */
.gnb__brand {
  display: flex;
  align-items: center;
  gap: 8px;
  padding-right: 18px;
}

.gnb__logo {
  width: 26px;
  height: 26px;
  border-radius: 6px;
}

.gnb__brand-name {
  font-size: 15px;
  font-weight: 700;
  letter-spacing: -0.2px;
  color: #fff;
}

/* ── 대메뉴 ── */
.gnb__menu {
  display: flex;
  align-items: stretch;
  flex: 1;
  min-width: 0;
  overflow-x: auto;
}

.gnb__menu::-webkit-scrollbar {
  height: 0;
}

.gnb__item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 0 16px;
  border: 0;
  border-bottom: 3px solid transparent;
  background: transparent;
  color: var(--wms-gnb-text);
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;
  cursor: pointer;
  transition: color 0.15s, background-color 0.15s;
}

.gnb__item:hover {
  background-color: rgba(255, 255, 255, 0.08);
  color: #fff;
}

.gnb__item--active {
  border-bottom-color: var(--wms-accent);
  background-color: rgba(255, 255, 255, 0.12);
  color: #fff;
}

.gnb__item-icon {
  font-size: 13px;
}

/* ── 우측 유틸 ── */
.gnb__util {
  display: flex;
  align-items: stretch;
}

.gnb__util-item {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 0 12px;
  border: 0;
  border-left: 1px solid rgba(255, 255, 255, 0.14);
  background: transparent;
  color: var(--wms-gnb-text);
  font-size: 12px;
  white-space: nowrap;
  cursor: pointer;
}

.gnb__util-item:hover {
  background-color: rgba(255, 255, 255, 0.1);
  color: #fff;
}
</style>
