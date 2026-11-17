<template>
  <div class="brand-form">
    <div class="brand-form__toolbar">
      <div class="brand-form__title">※ {{ pageTitle }}</div>
      <div class="brand-form__actions">
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

    <div class="brand-form__body">
      <a-form :label-col="{ span: 4 }" :wrapper-col="{ span: 18 }">
        <a-form-item :label="$t('field.groupName')" required>
          <a-input v-model:value="form.groupName" allow-clear @press-enter="onSave" />
        </a-form-item>
      </a-form>

      <div class="brand-form__brands-head">
        <span>{{ $t('field.brandName') }}</span>
        <a-button size="small" @click="addBrand">
          <template #icon><PlusOutlined /></template>
          {{ $t('common.addBrand') }}
        </a-button>
      </div>

      <div class="brand-form__table">
        <div class="brand-form__tr is-head">
          <span>{{ $t('field.seq') }}</span>
          <span>{{ $t('field.brandNoFull') }}</span>
          <span>{{ $t('field.brandName') }}</span>
          <span>{{ $t('field.useYn') }}</span>
          <span />
        </div>
        <div v-for="(row, index) in form.brands" :key="row.uid" class="brand-form__tr">
          <span>{{ index + 1 }}</span>
          <a-input-number v-model:value="row.brandNo" :min="0" :controls="false" class="brand-form__no" />
          <a-input v-model:value="row.brandName" allow-clear />
          <a-select v-model:value="row.useYn" :options="useYnOptions" />
          <a-button type="text" danger size="small" @click="removeBrand(index)">
            <DeleteOutlined />
          </a-button>
        </div>
        <div v-if="!form.brands.length" class="brand-form__empty">{{ $t('common.noData') }}</div>
      </div>
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
import { findMockBrandGroup, saveMockBrandGroup } from './brandMock';
import { BRAND_FORM_CHANNEL, takeBrandFormPayload } from './brandPopup';

const { proxy } = getCurrentInstance();
const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const appStore = useAppStore();

defineOptions({ name: 'PgBrandForm' });

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';
const saving = ref(false);
let channel = null;
let uidSeq = 1;

const form = reactive({
  id: null,
  groupName: '',
  inputUser: '',
  inputDate: '',
  brands: [],
});

const isModify = computed(() => route.query.mode === 'modify' || !!form.id);
const pageTitle = computed(() => `${t('menu.brand')} ${isModify.value ? t('common.modify') : t('common.create')}`);

const useYnOptions = computed(() => [
  { value: 'Y', label: t('common.use') },
  { value: 'N', label: t('common.unused') },
]);

const emptyBrand = (row = {}) => ({
  uid: uidSeq++,
  id: row.id ?? null,
  brandNo: row.brandNo ?? null,
  brandName: row.brandName || '',
  useYn: row.useYn === 'N' ? 'N' : 'Y',
  updDt: row.updDt || '',
  updUser: row.updUser || '',
  updIp: row.updIp || '',
});

const addBrand = () => {
  form.brands.push(emptyBrand());
};

const removeBrand = (index) => {
  form.brands.splice(index, 1);
};

const fillForm = (group) => {
  form.id = group?.id ?? null;
  form.groupName = group?.groupName || '';
  form.inputUser = group?.inputUser || '';
  form.inputDate = group?.inputDate || '';
  form.brands = (group?.brands || []).map((row) => emptyBrand(row));
  if (!form.brands.length) addBrand();
};

const loadForm = async () => {
  const payload = takeBrandFormPayload(route.query.token);
  if (payload?.group) {
    fillForm(payload.group);
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
    const found = findMockBrandGroup(id);
    if (found) fillForm(found);
    else message.warning(t('message.selectRequired'));
    return;
  }

  const result = await proxy.$api.onApiGetBrandGroup(id);
  if (result) fillForm(result);
  else fillForm(null);
};

const notifySaved = (row) => {
  const payload = { type: 'brand-group-saved', row };
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
  const groupName = form.groupName.trim();
  if (!groupName) {
    message.warning(t('message.requiredFields'));
    return;
  }

  const today = dayjs().format('YYYYMMDD');
  const userName = appStore.AppActiveUser.name || '';
  const body = {
    id: form.id,
    groupName,
    inputUser: form.inputUser || userName,
    inputDate: form.inputDate || today,
    updUser: userName,
    updDt: today,
    brands: form.brands
      .map((row) => ({
        id: row.id,
        brandNo: row.brandNo,
        brandName: row.brandName.trim(),
        useYn: row.useYn,
        updDt: today,
        updUser: userName,
        updIp: row.updIp || '',
      }))
      .filter((row) => row.brandName),
  };

  saving.value = true;
  try {
    if (!USE_MOCK) {
      const result = form.id
        ? await proxy.$api.onApiUpdateBrandGroup(form.id, body)
        : await proxy.$api.onApiAddBrandGroup(body);
      if (!result) return;
      Object.assign(body, result);
    } else {
      Object.assign(body, saveMockBrandGroup(body));
    }

    notifySaved(body);
    window.setTimeout(onClose, 120);
  } finally {
    saving.value = false;
  }
};

const onClose = () => {
  window.close();
  if (!window.closed && !window.opener) router.push({ name: 'brand' });
};

onMounted(() => {
  if ('BroadcastChannel' in window) channel = new BroadcastChannel(BRAND_FORM_CHANNEL);
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
.brand-form {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #fff;
}

.brand-form__toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 36px;
  padding: 4px 10px;
  border-bottom: 1px solid var(--wms-border);
  background: #f7f8fa;
}

.brand-form__title {
  font-size: 13px;
  font-weight: 700;
  color: #1e4e79;
  white-space: nowrap;
}

.brand-form__actions {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-left: auto;
}

.brand-form__body {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  padding: 16px 12px 12px;
}

.brand-form__brands-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 4px 12px 8px;
  font-weight: 700;
  color: #1e4e79;
}

.brand-form__table {
  flex: 1;
  min-height: 0;
  overflow: auto;
  margin: 0 12px;
  border: 1px solid #c5d8ea;
}

.brand-form__tr {
  display: grid;
  grid-template-columns: 48px 110px minmax(0, 1fr) 90px 40px;
  align-items: center;
  gap: 8px;
  padding: 4px 8px;
  border-bottom: 1px solid #e4eef6;
}

.brand-form__tr.is-head {
  background: #d6e7f5;
  color: #1e4e79;
  font-weight: 700;
}

.brand-form__no {
  width: 100%;
}

.brand-form__empty {
  padding: 16px 8px;
  color: var(--wms-text-sub);
  text-align: center;
}
</style>
