<template>
  <div class="userbar">
    <!-- 사용자 정보 -->
    <div class="userbar__user">
      <a-avatar :size="20" class="userbar__avatar">
        <template #icon><UserOutlined /></template>
      </a-avatar>
      <span class="userbar__welcome">{{ t('welcome', { name: user.name }) }}</span>
      <a-tag v-if="user.company" color="red" class="userbar__company">{{ user.company }}</a-tag>
      <a-tag v-for="role in user.roles" :key="role" class="userbar__role">{{ role }}</a-tag>
    </div>

    <!-- 작업 창고 / 현재 시각 -->
    <div class="userbar__right">
      <span class="userbar__clock">{{ now }}</span>
      <span class="userbar__label">{{ t('common.warehouse') }}</span>
      <a-select
        :value="appStore.currentWarehouse?.code"
        :options="appStore.warehouseOptions"
        size="small"
        style="width: 170px"
        @change="onChangeWarehouse"
      />
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import dayjs from 'dayjs';
import { useAppStore } from '@/store/appStore';

const { t } = useI18n();
const appStore = useAppStore();

const user = computed(() => appStore.AppActiveUser);
const now = ref('');

let timer = null;

const onChangeWarehouse = (code) => appStore.setWarehouse(code);

onMounted(() => {
  const tick = () => (now.value = dayjs().format('YYYY-MM-DD (ddd) HH:mm:ss'));
  tick();
  timer = setInterval(tick, 1000);
});

onUnmounted(() => clearInterval(timer));
</script>

<style scoped>
.userbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  height: var(--wms-userbar-height);
  padding: 0 12px;
  background-color: var(--wms-userbar-bg);
  border-bottom: 1px solid var(--wms-border);
}

.userbar__user {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
}

.userbar__avatar {
  background-color: var(--wms-primary);
}

.userbar__welcome {
  font-size: 12px;
  color: var(--wms-text);
  white-space: nowrap;
}

.userbar__company,
.userbar__role {
  margin-inline-end: 0;
  font-size: 11px;
}

.userbar__right {
  display: flex;
  align-items: center;
  gap: 8px;
  white-space: nowrap;
}

.userbar__clock {
  font-size: 12px;
  color: var(--wms-text-sub);
}

.userbar__label {
  font-size: 12px;
  font-weight: 600;
  color: var(--wms-text-sub);
}
</style>
