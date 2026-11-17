<template>
  <div class="reason-form">
    <div class="reason-form__toolbar">
      <div class="reason-form__title">※ {{ pageTitle }}</div>
      <div class="reason-form__actions">
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

    <div class="reason-form__body">
      <a-form :label-col="{ span: 4 }" :wrapper-col="{ span: 18 }">
        <a-form-item :label="$t('field.groupName')" required>
          <a-input v-model:value="form.groupName" allow-clear @press-enter="onSave" />
        </a-form-item>
      </a-form>

      <div class="reason-form__items-head">
        <span>{{ $t('field.reasonName') }}</span>
        <a-button size="small" @click="addItem">
          <template #icon><PlusOutlined /></template>
          {{ $t('common.addReturnReason') }}
        </a-button>
      </div>

      <div class="reason-form__table">
        <div class="reason-form__tr is-head">
          <span>{{ $t('field.seq') }}</span>
          <span>{{ $t('field.defectCode') }}</span>
          <span>{{ $t('field.reasonName') }}</span>
          <span>{{ $t('field.displayOrder') }}</span>
          <span>{{ $t('field.useYn') }}</span>
          <span />
        </div>
        <div v-for="(row, index) in form.items" :key="row.uid" class="reason-form__tr">
          <span>{{ index + 1 }}</span>
          <a-input v-model:value="row.defectCode" allow-clear class="reason-form__code" />
          <a-input v-model:value="row.reasonName" allow-clear />
          <a-input-number v-model:value="row.displayOrder" :min="0" :controls="false" class="reason-form__no" />
          <a-select v-model:value="row.useYn" :options="useYnOptions" />
          <a-button type="text" danger size="small" @click="removeItem(index)">
            <DeleteOutlined />
          </a-button>
        </div>
        <div v-if="!form.items.length" class="reason-form__empty">{{ $t('common.noData') }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, getCurrentInstance, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { message } from 'ant-design-vue';
import { findMockReturnReasonGroup, saveMockReturnReasonGroup } from './returnReasonMock';
import { RETURN_REASON_FORM_CHANNEL, takeReturnReasonFormPayload } from './returnReasonPopup';

const { proxy } = getCurrentInstance();
const { t } = useI18n();
const route = useRoute();
const router = useRouter();

defineOptions({ name: 'PgReturnReasonForm' });

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';
const saving = ref(false);
let channel = null;
let uidSeq = 1;

const form = reactive({
  id: null,
  groupName: '',
  items: [],
});

const isModify = computed(() => route.query.mode === 'modify' || !!form.id);
const pageTitle = computed(
  () => `${t('menu.returnReason')} ${isModify.value ? t('common.modify') : t('common.create')}`
);

const useYnOptions = computed(() => [
  { value: 'Y', label: t('common.use') },
  { value: 'N', label: t('common.unused') },
]);

const emptyItem = (row = {}) => ({
  uid: uidSeq++,
  id: row.id ?? null,
  defectCode: row.defectCode || '',
  reasonName: row.reasonName || '',
  displayOrder: row.displayOrder ?? null,
  useYn: row.useYn === 'N' ? 'N' : 'Y',
  updDt: row.updDt || '',
  updUser: row.updUser || '',
  updIp: row.updIp || '',
});

const addItem = () => {
  form.items.push(emptyItem());
};

const removeItem = (index) => {
  form.items.splice(index, 1);
};

const fillForm = (group) => {
  form.id = group?.id ?? null;
  form.groupName = group?.groupName || '';
  form.items = (group?.items || []).map((row) => emptyItem(row));
  if (!form.items.length) addItem();
};

const loadForm = async () => {
  const payload = takeReturnReasonFormPayload(route.query.token);
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
    const found = findMockReturnReasonGroup(id);
    if (found) fillForm(found);
    else message.warning(t('message.selectRequired'));
    return;
  }

  const result = await proxy.$api.onApiGetReturnReason(id);
  if (result) fillForm(result);
  else fillForm(null);
};

const notifySaved = (row) => {
  const payload = { type: 'return-reason-saved', row };
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

  const body = {
    id: form.id,
    groupName,
    items: form.items
      .map((row) => ({
        id: row.id,
        defectCode: String(row.defectCode || '').trim(),
        reasonName: String(row.reasonName || '').trim(),
        displayOrder: row.displayOrder,
        useYn: row.useYn,
        updDt: row.updDt,
        updUser: row.updUser,
        updIp: row.updIp,
      }))
      .filter((row) => row.reasonName || row.defectCode),
  };

  saving.value = true;
  try {
    if (!USE_MOCK) {
      const result = form.id
        ? await proxy.$api.onApiUpdateReturnReason(form.id, body)
        : await proxy.$api.onApiAddReturnReason(body);
      if (!result) return;
      Object.assign(body, result);
    } else {
      Object.assign(body, saveMockReturnReasonGroup(body));
    }

    notifySaved(body);
    window.setTimeout(onClose, 120);
  } finally {
    saving.value = false;
  }
};

const onClose = () => {
  window.close();
  if (!window.closed && !window.opener) router.push({ name: 'returnReason' });
};

onMounted(() => {
  if ('BroadcastChannel' in window) channel = new BroadcastChannel(RETURN_REASON_FORM_CHANNEL);
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
.reason-form {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #fff;
}

.reason-form__toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 36px;
  padding: 4px 10px;
  border-bottom: 1px solid var(--wms-border);
  background: #f7f8fa;
}

.reason-form__title {
  font-size: 13px;
  font-weight: 700;
  color: #1e4e79;
  white-space: nowrap;
}

.reason-form__actions {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-left: auto;
}

.reason-form__body {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  padding: 16px 12px 12px;
}

.reason-form__items-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 4px 12px 8px;
  font-weight: 700;
  color: #1e4e79;
}

.reason-form__table {
  flex: 1;
  min-height: 0;
  overflow: auto;
  margin: 0 12px;
  border: 1px solid #c5d8ea;
}

.reason-form__tr {
  display: grid;
  grid-template-columns: 48px 110px minmax(0, 1fr) 80px 90px 40px;
  align-items: center;
  gap: 8px;
  padding: 4px 8px;
  border-bottom: 1px solid #e4eef6;
}

.reason-form__tr.is-head {
  background: #d6e7f5;
  color: #1e4e79;
  font-weight: 700;
}

.reason-form__no,
.reason-form__code {
  width: 100%;
}

.reason-form__empty {
  padding: 16px 8px;
  color: var(--wms-text-sub);
  text-align: center;
}
</style>
