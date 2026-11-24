<template>
  <div class="common-code-form">
    <div class="common-code-form__toolbar">
      <div class="common-code-form__title">※ {{ $t('menu.commonCode') }} {{ $t('common.modify') }}</div>
      <div class="common-code-form__actions">
        <a-button type="primary" size="small" :loading="saving" :disabled="loading" @click="onSave">
          <template #icon><SaveOutlined /></template>
          {{ $t('common.save') }}
        </a-button>
        <a-button size="small" @click="onClose">
          <template #icon><CloseOutlined /></template>
          {{ $t('common.close') }}
        </a-button>
      </div>
    </div>

    <div class="common-code-form__body">
      <a-spin :spinning="loading">
        <a-form :label-col="{ style: { width: '90px' } }">
          <div class="common-code-form__group">
            <a-form-item :label="$t('field.groupCd')" required>
              <a-input v-model:value="form.groupCd" disabled />
            </a-form-item>
            <a-form-item :label="$t('field.groupName')" required>
              <a-input v-model:value="form.groupNm" :maxlength="100" allow-clear />
            </a-form-item>
          </div>
        </a-form>

        <div class="common-code-form__items-head">
          <span>{{ $t('field.code') }}</span>
          <a-button size="small" @click="addItem">
            <template #icon><PlusOutlined /></template>
            {{ $t('common.add') }}
          </a-button>
        </div>

        <div class="common-code-form__table" :style="{ '--form-columns': columnTemplate }">
          <div class="common-code-form__tr is-head">
            <span v-for="(header, index) in tableHeaders" :key="header.key" class="common-code-form__th">
              {{ header.label }}
              <i
                v-if="index < tableHeaders.length - 1"
                class="common-code-form__resizer"
                @pointerdown.prevent="startColumnResize(index, $event)"
              />
            </span>
          </div>
          <div v-for="(row, index) in form.items" :key="row.uid" class="common-code-form__tr">
            <span>{{ index + 1 }}</span>
            <a-input v-model:value="row.code" :disabled="row.persisted" :maxlength="100" allow-clear />
            <a-input v-model:value="row.name" :maxlength="50" allow-clear />
            <a-input-number v-model:value="row.sort" :precision="0" :controls="false" />
            <a-select v-model:value="row.useYn" :options="useYnOptions" size="small" />
            <a-input v-model:value="row.remark" :maxlength="200" allow-clear />
            <a-input v-model:value="row.data1" :maxlength="100" allow-clear />
            <a-input v-model:value="row.data2" :maxlength="100" allow-clear />
            <a-input v-model:value="row.data3" :maxlength="100" allow-clear />
            <a-input-number v-model:value="row.data4" :precision="0" :controls="false" />
            <a-input-number v-model:value="row.data5" :precision="0" :controls="false" />
            <a-button type="text" danger size="small" @click="removeItem(index)">
              <DeleteOutlined />
            </a-button>
          </div>
          <div v-if="!form.items.length" class="common-code-form__empty">{{ $t('common.noData') }}</div>
        </div>
      </a-spin>
    </div>
  </div>
</template>

<script setup>
import { computed, getCurrentInstance, onBeforeUnmount, onMounted, reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { message } from 'ant-design-vue';
import { FORM_CHANNEL, takeFormPayload } from './commonCodePopup';

const { proxy } = getCurrentInstance();
const { t } = useI18n();
const route = useRoute();
const router = useRouter();

defineOptions({ name: 'PgCommonCodeForm' });

const form = reactive({ groupCd: '', groupNm: '', items: [] });
const loading = ref(false);
const saving = ref(false);
const removed = ref([]);
let channel = null;
let uidSeq = 1;

const useYnOptions = computed(() => [
  { value: 'Y', label: t('common.use') },
  { value: 'N', label: t('common.unused') },
]);

const tableHeaders = computed(() => [
  { key: 'seq', label: t('field.seq') },
  { key: 'code', label: t('field.code') },
  { key: 'name', label: t('field.name') },
  { key: 'sort', label: t('field.sort') },
  { key: 'useYn', label: t('field.useYn') },
  { key: 'remark', label: t('field.remark') },
  { key: 'data1', label: t('field.data1') },
  { key: 'data2', label: t('field.data2') },
  { key: 'data3', label: t('field.data3') },
  { key: 'data4', label: t('field.data4') },
  { key: 'data5', label: t('field.data5') },
  { key: 'actions', label: '' },
]);

const columnWidths = ref([42, 120, 180, 72, 90, 160, 90, 90, 90, 72, 72, 36]);
const columnTemplate = computed(() => columnWidths.value.map((width) => `${width}px`).join(' '));
let resizeCleanup = null;

const startColumnResize = (index, event) => {
  resizeCleanup?.();
  const startX = event.clientX;
  const startWidth = columnWidths.value[index];
  const minWidth = index === 0 ? 36 : 60;

  const onMove = (moveEvent) => {
    const next = Math.max(minWidth, startWidth + moveEvent.clientX - startX);
    columnWidths.value[index] = next;
  };
  const onUp = () => resizeCleanup?.();

  resizeCleanup = () => {
    document.removeEventListener('pointermove', onMove);
    document.removeEventListener('pointerup', onUp);
    document.removeEventListener('pointercancel', onUp);
    window.removeEventListener('blur', onUp);
    document.body.style.removeProperty('cursor');
    document.body.style.removeProperty('user-select');
    resizeCleanup = null;
  };
  document.body.style.cursor = 'col-resize';
  document.body.style.userSelect = 'none';
  document.addEventListener('pointermove', onMove);
  document.addEventListener('pointerup', onUp);
  document.addEventListener('pointercancel', onUp);
  window.addEventListener('blur', onUp);
};

const textOf = (value) => String(value ?? '').trim();

const emptyItem = (row = {}, persisted = false) => ({
  ...row,
  uid: uidSeq++,
  persisted,
  code: row.code || '',
  name: row.name || row.nameKo || row.nameEn || '',
  sort: row.sort ?? null,
  useYn: row.useYn === 'N' ? 'N' : 'Y',
  remark: row.remark || '',
  data1: row.data1 || '',
  data2: row.data2 || '',
  data3: row.data3 || '',
  data4: row.data4 ?? null,
  data5: row.data5 ?? null,
});

const fillForm = (group) => {
  form.groupCd = group?.groupCd || '';
  form.groupNm = group?.groupNm || '';
  const rows = group?.items || (group?.code ? [group] : []);
  form.items = rows.map((row) => emptyItem(row, true));
  if (!form.items.length) addItem();
};

const addItem = () => {
  form.items.push(emptyItem());
};

const removeItem = (index) => {
  const [row] = form.items.splice(index, 1);
  if (row?.persisted) removed.value.push(row);
};

const load = async () => {
  const payload = takeFormPayload(route.query.token);
  if (payload?.row) {
    fillForm(payload.row);
    return;
  }
  if (!route.query.id) {
    fillForm(null);
    return;
  }
  loading.value = true;
  try {
    const result = await proxy.$api.onApiGetCommonCode(route.query.id);
    fillForm(result);
  } finally {
    loading.value = false;
  }
};

const toBody = (row, useYn = row.useYn) => ({
  ...row,
  uid: undefined,
  persisted: undefined,
  groupCd: textOf(form.groupCd),
  groupNm: textOf(form.groupNm),
  code: textOf(row.code),
  name: textOf(row.name),
  sort: row.sort === '' || row.sort == null ? null : Number(row.sort),
  useYn: useYn === 'N' ? 'N' : 'Y',
  remark: textOf(row.remark) || null,
  data1: textOf(row.data1) || null,
  data2: textOf(row.data2) || null,
  data3: textOf(row.data3) || null,
  data4: row.data4 === '' || row.data4 == null ? null : Number(row.data4),
  data5: row.data5 === '' || row.data5 == null ? null : Number(row.data5),
});

const notifySaved = () => {
  const payload = { type: 'commonCode-saved' };
  if (channel) channel.postMessage(payload);
  else window.opener?.postMessage(payload, window.location.origin);
};

const onSave = async () => {
  const active = form.items.filter((row) => textOf(row.code) || textOf(row.name));
  if (!textOf(form.groupCd) || !textOf(form.groupNm) || !active.length) {
    message.warning(t('message.requiredFields'));
    return;
  }
  if (active.some((row) => !textOf(row.code) || !textOf(row.name))) {
    message.warning(t('message.requiredFields'));
    return;
  }
  const codes = active.map((row) => textOf(row.code));
  if (new Set(codes).size !== codes.length) {
    message.warning(t('message.duplicateCode'));
    return;
  }
  const numbers = active.flatMap((row) => [row.sort, row.data4, row.data5]);
  if (numbers.some((value) => value !== '' && value != null && !Number.isInteger(Number(value)))) {
    message.warning(t('message.invalidNumber'));
    return;
  }

  saving.value = true;
  try {
    for (const row of active) {
      const result = await proxy.$api.onApiSaveCommonCode(toBody(row));
      if (!result) return;
    }
    for (const row of removed.value) {
      const result = await proxy.$api.onApiSaveCommonCode(toBody(row, 'N'));
      if (!result) return;
    }
    notifySaved();
    window.setTimeout(onClose, 120);
  } finally {
    saving.value = false;
  }
};

const onClose = () => {
  window.close();
  if (!window.closed && !window.opener) router.push({ name: 'commonCode' });
};

onMounted(() => {
  document.title = t('menu.commonCode');
  if ('BroadcastChannel' in window) channel = new BroadcastChannel(FORM_CHANNEL);
  load();
});

onBeforeUnmount(() => {
  resizeCleanup?.();
  channel?.close();
});
</script>

<style scoped>
.common-code-form {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #fff;
}

.common-code-form__toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 36px;
  padding: 4px 10px;
  border-bottom: 1px solid var(--wms-border);
  background: #f7f8fa;
}

.common-code-form__title {
  font-size: 13px;
  font-weight: 700;
  color: #1e4e79;
  white-space: nowrap;
}

.common-code-form__actions {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-left: auto;
}

.common-code-form__body {
  flex: 1;
  min-height: 0;
  padding: 16px 12px 12px;
  overflow: hidden;
}

.common-code-form__body :deep(.ant-spin-nested-loading),
.common-code-form__body :deep(.ant-spin-container) {
  height: 100%;
}

.common-code-form__body :deep(.ant-spin-container) {
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.common-code-form__group {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  max-width: 860px;
}

.common-code-form__group :deep(.ant-form-item) {
  margin-bottom: 8px;
}

.common-code-form__items-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 4px 12px 8px;
  color: #1e4e79;
  font-weight: 700;
}

.common-code-form__table {
  flex: 1;
  min-height: 0;
  overflow: auto;
  margin: 0 12px;
  border: 1px solid #c5d8ea;
}

.common-code-form__tr {
  display: grid;
  grid-template-columns: var(--form-columns);
  align-items: center;
  gap: 6px;
  min-width: 1100px;
  padding: 4px 8px;
  border-bottom: 1px solid #e4eef6;
}

.common-code-form__tr.is-head {
  position: sticky;
  top: 0;
  z-index: 1;
  background: #d6e7f5;
  color: #1e4e79;
  font-weight: 700;
}

.common-code-form__th {
  position: relative;
  min-width: 0;
  overflow: hidden;
  padding-right: 6px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.common-code-form__resizer {
  position: absolute;
  top: -4px;
  right: 0;
  bottom: -4px;
  z-index: 2;
  width: 8px;
  border-right: 2px solid #8aafcc;
  cursor: col-resize;
  touch-action: none;
}

.common-code-form__resizer:hover {
  border-right-color: #174f82;
}

.common-code-form__tr :deep(.ant-input),
.common-code-form__tr :deep(.ant-input-number),
.common-code-form__tr :deep(.ant-select) {
  width: 100%;
}

.common-code-form__empty {
  padding: 16px 8px;
  color: var(--wms-text-sub);
  text-align: center;
}
</style>
