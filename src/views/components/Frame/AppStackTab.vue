<template>
  <div class="stacktab">
    <a-tabs
      class="stacktab__tabs"
      type="editable-card"
      size="small"
      hide-add
      :active-key="menuStore.activeTabKey"
      @change="onMove"
      @edit="onEdit"
    >
      <a-tab-pane
        v-for="tab in menuStore.tabs"
        :key="tab.key"
        :tab="t(tab.nameKey)"
        :closable="tab.closable"
      />
    </a-tabs>

    <a-dropdown placement="bottomRight">
      <button type="button" class="stacktab__more">
        <EllipsisOutlined />
      </button>
      <template #overlay>
        <a-menu @click="onCommand">
          <a-menu-item key="others">{{ t('common.closeOtherTabs') }}</a-menu-item>
          <a-menu-item key="all">{{ t('common.closeAllTabs') }}</a-menu-item>
        </a-menu>
      </template>
    </a-dropdown>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useMenuStore } from '@/store/menuStore';

const { t } = useI18n();
const router = useRouter();
const menuStore = useMenuStore();

const onMove = (name) => {
  if (name && name !== menuStore.activeTabKey) router.push({ name }).catch(() => {});
};

const onEdit = (key, action) => {
  if (action !== 'remove') return;
  const next = menuStore.closeTab(key);
  if (next) onMove(next);
};

const onCommand = ({ key }) => {
  const next =
    key === 'others' ? menuStore.closeOtherTabs(menuStore.activeTabKey) : menuStore.closeAllTabs();
  onMove(next);
};
</script>

<style scoped>
.stacktab {
  display: flex;
  align-items: center;
  height: var(--wms-tabbar-height);
  padding: 0 6px 0 8px;
  background-color: var(--wms-tabbar-bg);
  border-bottom: 1px solid var(--wms-border);
}

.stacktab__tabs {
  flex: 1;
  min-width: 0;
}

.stacktab__more {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 24px;
  border: 1px solid var(--wms-border-strong);
  border-radius: 3px;
  background-color: #fff;
  color: var(--wms-text-sub);
  cursor: pointer;
}

.stacktab__more:hover {
  color: var(--wms-primary);
  border-color: var(--wms-primary);
}
</style>

<style>
.stacktab .ant-tabs-nav {
  margin: 0 !important;
}

.stacktab .ant-tabs-nav::before {
  border-bottom: 0 !important;
}

.stacktab .ant-tabs-tab {
  height: 26px !important;
  padding: 0 10px !important;
  background-color: var(--wms-lnb-sub-bg) !important;
  border: 1px solid var(--wms-border) !important;
  font-size: 12px;
}

.stacktab .ant-tabs-tab-active {
  background-color: #fff !important;
  border-bottom-color: #fff !important;
}

.stacktab .ant-tabs-tab-active .ant-tabs-tab-btn {
  color: var(--wms-primary) !important;
  font-weight: 700;
}
</style>
