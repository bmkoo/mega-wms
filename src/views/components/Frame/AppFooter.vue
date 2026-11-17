<template>
  <footer class="footer">
    <span class="footer__left">© {{ year }} MEGA · {{ t('appName') }} {{ version }}</span>
    <span class="footer__right">
      <span v-if="appStore.currentWarehouse">
        {{ t('common.warehouse') }}: {{ appStore.currentWarehouse.name }}
      </span>
      <a-divider type="vertical" />
      <span>{{ t('common.server') }}: {{ appStore.config.ip || '-' }}</span>
    </span>
  </footer>
</template>

<script setup>
import dayjs from 'dayjs';
import { useI18n } from 'vue-i18n';
import { useAppStore } from '@/store/appStore';

const { t } = useI18n();
const appStore = useAppStore();

const year = dayjs().year();
const version = import.meta.env.VITE_APP_TITLE?.split(' ').pop() || '';
</script>

<style scoped>
.footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: var(--wms-footer-height);
  padding: 0 12px;
  background-color: var(--wms-gnb-bg-dark);
  color: rgba(255, 255, 255, 0.7);
  font-size: 11px;
}

.footer__right {
  display: flex;
  align-items: center;
}
</style>
