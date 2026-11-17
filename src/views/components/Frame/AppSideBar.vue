<template>
  <aside class="lnb" :class="{ 'lnb--slim': menuStore.collapsed }">
    <!-- 현재 대메뉴 + 접기 -->
    <div class="lnb__head">
      <span v-if="!menuStore.collapsed" class="lnb__title ellipsis">{{ activeGnbName }}</span>
      <a-tooltip :title="menuStore.collapsed ? '메뉴 펼치기' : '메뉴 접기'" placement="right">
        <button type="button" class="lnb__toggle" @click="menuStore.toggleCollapsed()">
          <MenuUnfoldOutlined v-if="menuStore.collapsed" />
          <MenuFoldOutlined v-else />
        </button>
      </a-tooltip>
    </div>

    <!-- 메뉴 검색 -->
    <div v-if="!menuStore.collapsed" class="lnb__search">
      <a-input
        v-model:value="keyword"
        size="small"
        allow-clear
        :placeholder="t('common.keyword')"
      >
        <template #prefix><SearchOutlined /></template>
      </a-input>
    </div>

    <!-- 중메뉴 / 소메뉴 -->
    <div class="lnb__body">
      <a-menu
        mode="inline"
        theme="light"
        :inline-collapsed="menuStore.collapsed"
        :selected-keys="menuStore.selectedKeys"
        :open-keys="openKeys"
        @update:openKeys="menuStore.setOpenKeys"
      >
        <a-sub-menu v-for="group in visibleGroups" :key="group.key">
          <template #icon><component :is="group.icon" /></template>
          <template #title>{{ t(group.nameKey) }}</template>

          <a-menu-item v-for="leaf in group.children" :key="leaf.path" @click="onSelectMenu(leaf)">
            <span class="lnb__item">
              <!-- 이름이 길어 잘리는 항목만 툴팁으로 전체 이름을 보여준다 -->
              <a-tooltip placement="right" :title="longLabel(leaf)">
                <span class="lnb__item-label ellipsis">{{ t(leaf.nameKey) }}</span>
              </a-tooltip>
              <a-tooltip
                placement="right"
                :title="menuStore.isFavorite(leaf.path) ? t('common.removeFavorite') : t('common.addFavorite')"
              >
                <StarFilled
                  v-if="menuStore.isFavorite(leaf.path)"
                  class="lnb__star lnb__star--on"
                  @click.stop="onToggleFavorite(leaf)"
                />
                <StarOutlined v-else class="lnb__star" @click.stop="onToggleFavorite(leaf)" />
              </a-tooltip>
            </span>
          </a-menu-item>

          <a-menu-item
            v-if="group.key === FAVORITE_GROUP.key && !group.children.length"
            key="favorite-empty"
            disabled
          >
            {{ t('message.noFavorite') }}
          </a-menu-item>
        </a-sub-menu>
      </a-menu>

      <a-empty
        v-if="!visibleGroups.length"
        :image="Empty.PRESENTED_IMAGE_SIMPLE"
        :description="t('common.noData')"
        class="lnb__empty"
      />
    </div>
  </aside>
</template>

<script setup>
import { computed, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { Empty, message } from 'ant-design-vue';
import { useAppStore } from '@/store/appStore';
import { useMenuStore } from '@/store/menuStore';
import { FAVORITE_GROUP, filterMenusByRoles, isMenuAllowed } from '@/config/menuConfig';

const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const appStore = useAppStore();
const menuStore = useMenuStore();

const keyword = ref('');

const activeGnb = computed(() =>
  filterMenusByRoles(appStore.userRoles).find((gnb) => gnb.key === menuStore.activeGnbKey)
);

const activeGnbName = computed(() => (activeGnb.value ? t(activeGnb.value.nameKey) : ''));

/** 권한이 유지되는 즐겨찾기만 노출한다. */
const favoriteMenus = computed(() =>
  menuStore.favoriteMenus.filter((leaf) => isMenuAllowed(leaf, appStore.userRoles))
);

/** MyMenu 에서는 즐겨찾기 그룹을 최상단에 붙인다. */
const groups = computed(() => {
  const base = activeGnb.value?.children || [];
  if (menuStore.activeGnbKey !== FAVORITE_GROUP.gnbKey) return base;
  return [{ ...FAVORITE_GROUP, children: favoriteMenus.value }, ...base];
});

/** 검색어가 있으면 소메뉴 이름으로 필터링하고, 결과가 없는 그룹은 숨긴다. */
const visibleGroups = computed(() => {
  const word = keyword.value.trim().toLowerCase();
  if (!word) return groups.value;

  return groups.value
    .map((group) => ({
      ...group,
      children: group.children.filter((leaf) => t(leaf.nameKey).toLowerCase().includes(word)),
    }))
    .filter((group) => group.children.length > 0);
});

// 검색 중에는 결과를 바로 볼 수 있도록 모든 그룹을 펼친다.
const openKeys = computed(() =>
  keyword.value.trim() ? visibleGroups.value.map((group) => group.key) : menuStore.openKeys
);

const onSelectMenu = (leaf) => {
  if (route.name === leaf.path) return;
  router.push({ name: leaf.path }).catch(() => {});
};

/** LNB 폭에서 잘릴 만큼 긴 이름이면 그대로, 아니면 빈 문자열(툴팁 미표시) */
const longLabel = (leaf) => {
  const label = t(leaf.nameKey);
  return label.length > 12 ? label : '';
};

const onToggleFavorite = (leaf) => {
  const added = menuStore.toggleFavorite(leaf.path);
  message.success(t(added ? 'message.favoriteAdded' : 'message.favoriteRemoved'));
};
</script>

<style scoped>
.lnb {
  display: flex;
  flex-direction: column;
  width: var(--wms-lnb-width);
  min-width: var(--wms-lnb-width);
  background-color: var(--wms-panel);
  border-right: 1px solid var(--wms-border);
  transition: width 0.18s, min-width 0.18s;
}

.lnb--slim {
  width: var(--wms-lnb-width-slim);
  min-width: var(--wms-lnb-width-slim);
}

/* ── 헤더 ── */
.lnb__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 4px;
  height: 32px;
  padding: 0 6px 0 12px;
  background-color: var(--wms-lnb-head-bg);
  border-bottom: 1px solid var(--wms-border);
}

.lnb__title {
  font-size: 12px;
  font-weight: 700;
  color: var(--wms-primary);
  letter-spacing: 0.2px;
}

.lnb__toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border: 0;
  border-radius: 3px;
  background: transparent;
  color: var(--wms-text-sub);
  cursor: pointer;
}

.lnb__toggle:hover {
  background-color: var(--wms-primary-soft);
  color: var(--wms-primary);
}

/* ── 검색 ── */
.lnb__search {
  padding: 6px 8px;
  border-bottom: 1px solid var(--wms-border);
}

/* ── 메뉴 목록 ── */
.lnb__body {
  flex: 1;
  overflow-y: auto;
  padding-bottom: 8px;
}

.lnb__empty {
  margin-top: 24px;
}

/* ── 소메뉴 항목 + 즐겨찾기 별 ── */
.lnb__item {
  display: flex;
  align-items: center;
  gap: 6px;
}

.lnb__item-label {
  flex: 1;
  min-width: 0;
}

.lnb__star {
  flex-shrink: 0;
  font-size: 12px;
  color: var(--wms-border-strong);
  opacity: 0;
  transition: opacity 0.15s, color 0.15s;
}

.lnb__star:hover {
  color: var(--wms-accent);
}

.lnb__star--on {
  color: var(--wms-accent);
  opacity: 1;
}

.lnb .ant-menu-item:hover .lnb__star {
  opacity: 1;
}

/* 소메뉴 들여쓰기를 줄여 긴 메뉴명이 더 많이 보이게 한다 */
.lnb :deep(.ant-menu-sub.ant-menu-inline > .ant-menu-item) {
  padding-left: 32px !important;
}
</style>

<!-- LNB 내부 ant-menu 밀도 조정 -->
<style>
.lnb .ant-menu {
  border-inline-end: 0 !important;
  font-size: 12px;
}

.lnb .ant-menu-submenu-title {
  height: 34px !important;
  line-height: 34px !important;
  font-weight: 600;
}

.lnb .ant-menu-item {
  height: 30px !important;
  line-height: 30px !important;
  margin: 0 !important;
  width: 100% !important;
  border-radius: 0 !important;
}

.lnb .ant-menu-sub.ant-menu-inline {
  background-color: var(--wms-lnb-sub-bg) !important;
}

.lnb .ant-menu-item-selected {
  background-color: var(--wms-primary-soft) !important;
  color: var(--wms-primary) !important;
  border-right: 3px solid var(--wms-primary);
  font-weight: 700;
}

.lnb .ant-menu-item .anticon,
.lnb .ant-menu-submenu-title .anticon {
  font-size: 14px;
}

/* 접힌 상태: ant 기본 폭(80px)을 LNB 폭에 맞춘다 */
.lnb .ant-menu-inline-collapsed {
  width: var(--wms-lnb-width-slim) !important;
}

.lnb .ant-menu-inline-collapsed > .ant-menu-submenu > .ant-menu-submenu-title {
  padding: 0 !important;
  text-align: center;
}
</style>
