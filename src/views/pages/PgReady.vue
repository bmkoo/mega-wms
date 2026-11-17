<template>
  <div class="ready">
    <a-result status="info" :title="title" :sub-title="t('common.ready')">
      <template #extra>
        <a-button type="primary" @click="router.push({ name: 'dashboard' })">
          {{ t('menu.dashboard') }}
        </a-button>
      </template>
    </a-result>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { findLeafMenu } from '@/config/menuConfig';

const { t } = useI18n();
const route = useRoute();
const router = useRouter();

const title = computed(() => {
  const leaf = findLeafMenu(route.name);
  return leaf ? t(leaf.nameKey) : '';
});
</script>

<style scoped>
.ready {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}
</style>
