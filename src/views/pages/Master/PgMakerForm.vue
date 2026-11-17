<template>
  <div class="maker-form">
    <div class="maker-form__toolbar">
      <div class="maker-form__title">※ {{ pageTitle }}</div>
      <div class="maker-form__actions">
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

    <div class="maker-form__body">
      <a-form :label-col="{ span: 6 }" :wrapper-col="{ span: 16 }">
        <a-form-item :label="$t('field.makerId')">
          <a-input v-model:value="form.makerId" :disabled="isModify" allow-clear />
        </a-form-item>
        <a-form-item :label="$t('field.makerName')" required>
          <a-input v-model:value="form.makerName" allow-clear @press-enter="onSave" />
        </a-form-item>
        <a-form-item :label="$t('field.managerName')">
          <a-input v-model:value="form.managerName" allow-clear />
        </a-form-item>
        <a-form-item :label="$t('field.managerMobile')">
          <a-input v-model:value="form.managerMobile" allow-clear />
        </a-form-item>
        <a-form-item :label="$t('field.managerTel')">
          <a-input v-model:value="form.managerTel" allow-clear />
        </a-form-item>
        <a-form-item :label="$t('field.businessType')">
          <a-select v-model:value="form.businessType" :options="businessTypeOptions" allow-clear />
        </a-form-item>
        <a-form-item :label="$t('field.address')">
          <a-input v-model:value="form.address" allow-clear />
        </a-form-item>
        <a-form-item :label="$t('field.useYn')">
          <a-select v-model:value="form.useYn" :options="useYnOptions" />
        </a-form-item>
        <a-form-item :label="$t('field.memo')">
          <a-textarea v-model:value="form.memo" :rows="3" allow-clear />
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
import { findMockMaker, saveMockMaker } from './makerMock';
import { MAKER_FORM_CHANNEL, takeMakerFormPayload } from './makerPopup';

const { proxy } = getCurrentInstance();
const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const appStore = useAppStore();

defineOptions({ name: 'PgMakerForm' });

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';
const saving = ref(false);
let channel = null;

const form = reactive({
  id: null,
  makerId: '',
  makerName: '',
  managerName: '',
  managerMobile: '',
  managerTel: '',
  businessType: '',
  address: '',
  useYn: 'Y',
  memo: '',
  productCount: 0,
});

const isModify = computed(() => route.query.mode === 'modify' || !!form.id);
const pageTitle = computed(() => `${t('menu.maker')} ${isModify.value ? t('common.modify') : t('common.create')}`);

const useYnOptions = computed(() => [
  { value: 'Y', label: t('common.use') },
  { value: 'N', label: t('common.unused') },
]);

const businessTypeOptions = computed(() => [{ value: 'company', label: t('field.businessCompany') }]);

const fillForm = (row) => {
  form.id = row?.id ?? null;
  form.makerId = row?.makerId || '';
  form.makerName = row?.makerName || '';
  form.managerName = row?.managerName || '';
  form.managerMobile = row?.managerMobile || '';
  form.managerTel = row?.managerTel || '';
  form.businessType = row?.businessType === 'company' ? 'company' : '';
  form.address = row?.address || '';
  form.useYn = row?.useYn === 'N' ? 'N' : 'Y';
  form.memo = row?.memo || '';
  form.productCount = Number(row?.productCount) || 0;
};

const loadForm = async () => {
  const payload = takeMakerFormPayload(route.query.token);
  if (payload?.row) {
    fillForm(payload.row);
    return;
  }
  if (payload?.mode === 'create' || route.query.mode === 'create') {
    fillForm(null);
    return;
  }

  const id = route.query.id;
  if (!id) {
    fillForm(null);
    return;
  }

  if (USE_MOCK) {
    const found = findMockMaker(id);
    if (found) fillForm(found);
    else message.warning(t('message.selectRequired'));
    return;
  }

  const result = await proxy.$api.onApiGetMaker(id);
  if (result) fillForm(result);
};

const notifySaved = (row) => {
  const payload = { type: 'maker-saved', row };
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
  const makerName = form.makerName.trim();
  if (!makerName) {
    message.warning(t('message.requiredFields'));
    return;
  }

  const body = {
    id: form.id,
    makerId: form.makerId.trim(),
    makerName,
    managerName: form.managerName.trim(),
    managerMobile: form.managerMobile.trim(),
    managerTel: form.managerTel.trim(),
    businessType: form.businessType,
    address: form.address.trim(),
    useYn: form.useYn,
    memo: form.memo.trim(),
    productCount: form.productCount,
    updDt: dayjs().format('YYYYMMDD HH:mm:ss'),
    updUser: appStore.AppActiveUser.name || '',
  };

  saving.value = true;
  try {
    if (!USE_MOCK) {
      const result = form.id
        ? await proxy.$api.onApiUpdateMaker(form.id, body)
        : await proxy.$api.onApiAddMaker(body);
      if (!result) return;
      Object.assign(body, result);
    } else {
      Object.assign(body, saveMockMaker(body));
    }

    notifySaved(body);
    window.setTimeout(onClose, 120);
  } finally {
    saving.value = false;
  }
};

const onClose = () => {
  window.close();
  if (!window.closed && !window.opener) router.push({ name: 'maker' });
};

onMounted(() => {
  if ('BroadcastChannel' in window) channel = new BroadcastChannel(MAKER_FORM_CHANNEL);
  loadForm();
});

watch(
  pageTitle,
  (title) => {
    document.title = title;
  },
  { immediate: true }
);

onBeforeUnmount(() => {
  channel?.close();
});
</script>

<style scoped>
.maker-form {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #fff;
}

.maker-form__toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 36px;
  padding: 4px 10px;
  border-bottom: 1px solid var(--wms-border);
  background: #f7f8fa;
}

.maker-form__title {
  font-size: 13px;
  font-weight: 700;
  color: #1e4e79;
  white-space: nowrap;
}

.maker-form__actions {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-left: auto;
}

.maker-form__body {
  padding: 16px 8px 8px;
  overflow: auto;
}
</style>
