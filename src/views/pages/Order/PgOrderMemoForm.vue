<template>
  <div class="memo-form">
    <div class="memo-form__toolbar">
      <div class="memo-form__title">※ {{ pageTitle }}</div>
      <div class="memo-form__actions">
        <a-button type="primary" size="small" :loading="saving" @click="onSave">
          <template #icon><SaveOutlined /></template>
          {{ $t('common.save') }}
        </a-button>
        <a-button size="small" @click="onClose">
          <template #icon><CloseOutlined /></template>
          {{ $t('common.close') }}
        </a-button>
      </div>
    </div>

    <div class="memo-form__body">
      <a-form :label-col="{ span: 6 }" :wrapper-col="{ span: 16 }">
        <a-form-item :label="$t('field.channel')">
          <a-select v-model:value="form.channel" :options="channelOptions" show-search allow-clear />
        </a-form-item>
        <a-form-item v-if="isModify" :label="$t('field.orderNo')">
          <a-input :value="form.orderNo" disabled />
        </a-form-item>
        <a-form-item :label="$t('field.orderer')">
          <a-input v-model:value="form.orderer" allow-clear />
        </a-form-item>
        <a-form-item :label="$t('field.receiver')">
          <a-input v-model:value="form.receiver" allow-clear />
        </a-form-item>
        <a-form-item :label="$t('field.memoContent')" required>
          <a-textarea v-model:value="form.content" :rows="4" allow-clear />
        </a-form-item>
        <a-form-item :label="$t('field.memoType')">
          <a-select v-model:value="form.memoType" :options="typeOptions" />
        </a-form-item>
        <a-form-item :label="$t('field.status')">
          <a-select v-model:value="form.status" :options="statusOptions" />
        </a-form-item>
        <a-form-item :label="$t('field.alarmDate')">
          <a-date-picker v-model:value="form.alarmDate" format="YYYYMMDD" style="width: 100%" />
        </a-form-item>
      </a-form>
    </div>
  </div>
</template>

<script setup>
import { computed, getCurrentInstance, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { message } from 'ant-design-vue';
import dayjs from 'dayjs';
import { useAppStore } from '@/store/appStore';
import { MEMO_CHANNELS, MEMO_TYPES, findMockMemo } from './memoMock';
import { MEMO_FORM_CHANNEL, takeMemoFormPayload } from './memoPopup';

const { proxy } = getCurrentInstance();
const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const appStore = useAppStore();

defineOptions({ name: 'PgOrderMemoForm' });

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';
const saving = ref(false);
let channel = null;

const form = reactive({
  id: null,
  channel: '메가커피',
  orderNo: '',
  memoCount: 1,
  orderer: '',
  receiver: '',
  content: '',
  memoType: 'etc',
  status: 'wait',
  alarmDate: null,
  inputDate: '',
  inputUser: '',
  processDate: '',
  processor: '',
  channelGroup: '',
  brandName: '',
  productGroup: '',
});

const isModify = computed(() => route.query.mode === 'modify' || !!form.id);
const pageTitle = computed(() => `${t('menu.orderMemo')} ${isModify.value ? t('common.modify') : t('common.create')}`);

const channelOptions = computed(() => MEMO_CHANNELS.map((value) => ({ value, label: value })));
const typeOptions = computed(() => MEMO_TYPES.map((value) => ({ value, label: t(`memoType.${value}`) })));
const statusOptions = computed(() => [
  { value: 'wait', label: t('memoStatus.wait') },
  { value: 'done', label: t('memoStatus.done') },
]);

const fillForm = (row) => {
  form.id = row?.id ?? null;
  form.channel = row?.channel || '메가커피';
  form.orderNo = row?.orderNo || '';
  form.memoCount = row?.memoCount || 1;
  form.orderer = row?.orderer || '';
  form.receiver = row?.receiver || '';
  form.content = row?.content || '';
  form.memoType = row?.memoType || 'etc';
  form.status = row?.status || 'wait';
  form.alarmDate = row?.alarmDate ? dayjs(row.alarmDate, 'YYYYMMDD') : null;
  form.inputDate = row?.inputDate || '';
  form.inputUser = row?.inputUser || '';
  form.processDate = row?.processDate || '';
  form.processor = row?.processor || '';
  form.channelGroup = row?.channelGroup || '';
  form.brandName = row?.brandName || '';
  form.productGroup = row?.productGroup || '';
};

const loadForm = async () => {
  const payload = takeMemoFormPayload(route.query.token);
  if (payload?.row) {
    fillForm(payload.row);
    return;
  }

  const id = route.query.id;
  if (route.query.mode !== 'modify' && !id) return;

  if (USE_MOCK) {
    const found = findMockMemo(id);
    if (found) fillForm(found);
    else message.warning(t('message.selectRequired'));
    return;
  }

  const result = await proxy.$api.onApiGetOrderMemo(id);
  if (result) fillForm(result);
};

const notifySaved = (row) => {
  const payload = { type: 'order-memo-saved', row };
  if (channel) {
    channel.postMessage(payload);
    return;
  }
  try {
    window.opener?.postMessage(payload, window.location.origin);
  } catch {
    /* opener 가 없거나 다른 origin 이면 무시 */
  }
};

const onSave = async () => {
  const content = form.content.trim();
  if (!content) {
    message.warning(t('message.requiredFields'));
    return;
  }

  const today = dayjs().format('YYYYMMDD');
  const userName = appStore.AppActiveUser.name || '';
  const body = {
    id: form.id,
    channel: form.channel,
    channelGroup: form.channelGroup,
    brandName: form.brandName,
    productGroup: form.productGroup,
    orderNo: form.orderNo,
    memoCount: form.memoCount || 1,
    orderer: form.orderer.trim(),
    receiver: form.receiver.trim(),
    content,
    memoType: form.memoType,
    status: form.status,
    inputDate: form.inputDate || today,
    alarmDate: form.alarmDate ? form.alarmDate.format('YYYYMMDD') : '',
    inputUser: form.inputUser || userName,
    processDate: form.status === 'done' ? form.processDate || today : '',
    processor: form.status === 'done' ? form.processor || userName : '',
  };

  saving.value = true;
  try {
    if (!USE_MOCK) {
      const result = form.id
        ? await proxy.$api.onApiUpdateOrderMemo(form.id, body)
        : await proxy.$api.onApiAddOrderMemo(body);
      if (!result) return;
      Object.assign(body, result);
    } else if (!body.id) {
      body.id = Date.now();
    }

    notifySaved(body);
    window.setTimeout(onClose, 120);
  } finally {
    saving.value = false;
  }
};

const onClose = () => {
  window.close();
  if (!window.closed && !window.opener) router.push({ name: 'orderList' });
};

onMounted(() => {
  if ('BroadcastChannel' in window) channel = new BroadcastChannel(MEMO_FORM_CHANNEL);
  loadForm();
});

watch(pageTitle, (title) => {
  document.title = title;
}, { immediate: true });

onBeforeUnmount(() => {
  channel?.close();
});
</script>

<style scoped>
.memo-form {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #fff;
}

.memo-form__toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 36px;
  padding: 4px 10px;
  border-bottom: 1px solid var(--wms-border);
  background: #f7f8fa;
}

.memo-form__title {
  font-size: 13px;
  font-weight: 700;
  color: #1e4e79;
  white-space: nowrap;
}

.memo-form__actions {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-left: auto;
}

.memo-form__body {
  padding: 16px 12px 8px;
  overflow: auto;
}
</style>
