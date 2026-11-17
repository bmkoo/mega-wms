<template>
  <a-drawer
    :open="open"
    :title="t('common.setting')"
    placement="right"
    :width="340"
    @close="onClose"
  >
    <a-form layout="vertical">
      <a-form-item :label="t('common.language')">
        <a-select v-model:value="form.locale" :options="localeOptions" />
      </a-form-item>

      <a-divider />

      <a-form-item :label="`${t('common.server')} IP`">
        <a-input v-model:value="form.ip" placeholder="127.0.0.1" />
      </a-form-item>

      <a-form-item label="API URL">
        <a-input v-model:value="form.apiUrl" placeholder="http://127.0.0.1:8082/" />
      </a-form-item>
    </a-form>

    <template #footer>
      <div class="setting__footer">
        <a-button @click="onClose">{{ t('common.cancel') }}</a-button>
        <a-button type="primary" @click="onSave">{{ t('common.save') }}</a-button>
      </div>
    </template>
  </a-drawer>
</template>

<script setup>
import { reactive, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { message } from 'ant-design-vue';
import dayjs from 'dayjs';
import { useAppStore } from '@/store/appStore';

const props = defineProps({
  open: { type: Boolean, default: false },
});
const emit = defineEmits(['update:open']);

const { t, locale } = useI18n();
const appStore = useAppStore();

const localeOptions = [
  { value: 'ko', label: '한국어' },
  { value: 'en', label: 'English' },
];

const form = reactive({
  locale: appStore.locale,
  ip: '',
  apiUrl: '',
});

// 열릴 때마다 현재 설정값을 다시 채운다.
watch(
  () => props.open,
  (isOpen) => {
    if (!isOpen) return;
    form.locale = appStore.locale;
    form.ip = appStore.config.ip;
    form.apiUrl = appStore.config.apiUrl;
  }
);

const onClose = () => emit('update:open', false);

const onSave = () => {
  appStore.setLocale(form.locale);
  locale.value = form.locale;
  dayjs.locale(form.locale === 'en' ? 'en' : 'ko');

  appStore.setConfig({ ip: form.ip, apiUrl: form.apiUrl });

  message.success(t('message.saved'));
  onClose();
};
</script>

<style scoped>
.setting__footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
</style>
