<template>
  <div class="notauth">
    <a-result status="403" :title="403" :sub-title="t('message.notAuthorized')">
      <template #extra>
        <a-button type="primary" @click="router.push({ name: 'dashboard' })">
          {{ t('menu.dashboard') }}
        </a-button>
      </template>
    </a-result>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const router = useRouter();
</script>

<style scoped>
.notauth {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}
</style>
