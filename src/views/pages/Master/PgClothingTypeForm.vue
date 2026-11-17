<template>
  <div class="clothing-form">
    <div class="clothing-form__toolbar">
      <div class="clothing-form__title">※ {{ pageTitle }}</div>
      <div class="clothing-form__actions">
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

    <div class="clothing-form__body">
      <a-form :label-col="{ span: 4 }" :wrapper-col="{ span: 18 }">
        <a-form-item :label="$t('field.groupName')" required>
          <a-input v-model:value="form.groupName" allow-clear @press-enter="onSave" />
        </a-form-item>
      </a-form>

      <div class="clothing-form__items-head">
        <span>{{ $t('field.clothingName') }}</span>
        <a-button size="small" @click="addItem">
          <template #icon><PlusOutlined /></template>
          {{ $t('common.addClothing') }}
        </a-button>
      </div>

      <div class="clothing-form__table">
        <div class="clothing-form__tr is-head">
          <span>{{ $t('field.seq') }}</span>
          <span>{{ $t('field.clothingNo') }}</span>
          <span>{{ $t('field.clothingName') }}</span>
          <span>{{ $t('field.useYn') }}</span>
          <span />
        </div>
        <div v-for="(row, index) in form.items" :key="row.uid" class="clothing-form__tr">
          <span>{{ index + 1 }}</span>
          <a-input-number v-model:value="row.clothingNo" :min="0" :controls="false" class="clothing-form__no" />
          <a-input v-model:value="row.clothingName" allow-clear />
          <a-select v-model:value="row.useYn" :options="useYnOptions" />
          <a-button type="text" danger size="small" @click="removeItem(index)">
            <DeleteOutlined />
          </a-button>
        </div>
        <div v-if="!form.items.length" class="clothing-form__empty">{{ $t('common.noData') }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, getCurrentInstance, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { message } from 'ant-design-vue';
import { findMockClothingGroup, saveMockClothingGroup } from './clothingTypeMock';
import { CLOTHING_FORM_CHANNEL, takeClothingFormPayload } from './clothingTypePopup';

const { proxy } = getCurrentInstance();
const { t } = useI18n();
const route = useRoute();
const router = useRouter();

defineOptions({ name: 'PgClothingTypeForm' });

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
  () => `${t('menu.clothingType')} ${isModify.value ? t('common.modify') : t('common.create')}`
);

const useYnOptions = computed(() => [
  { value: 'Y', label: t('common.use') },
  { value: 'N', label: t('common.unused') },
]);

const emptyItem = (row = {}) => ({
  uid: uidSeq++,
  id: row.id ?? null,
  clothingNo: row.clothingNo ?? null,
  clothingName: row.clothingName || '',
  useYn: row.useYn === 'N' ? 'N' : 'Y',
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
  const payload = takeClothingFormPayload(route.query.token);
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
    const found = findMockClothingGroup(id);
    if (found) fillForm(found);
    else message.warning(t('message.selectRequired'));
    return;
  }

  const result = await proxy.$api.onApiGetClothingType(id);
  if (result) fillForm(result);
  else fillForm(null);
};

const notifySaved = (row) => {
  const payload = { type: 'clothing-type-saved', row };
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
        clothingNo: row.clothingNo,
        clothingName: row.clothingName.trim(),
        useYn: row.useYn,
      }))
      .filter((row) => row.clothingName),
  };

  saving.value = true;
  try {
    if (!USE_MOCK) {
      const result = form.id
        ? await proxy.$api.onApiUpdateClothingType(form.id, body)
        : await proxy.$api.onApiAddClothingType(body);
      if (!result) return;
      Object.assign(body, result);
    } else {
      Object.assign(body, saveMockClothingGroup(body));
    }

    notifySaved(body);
    window.setTimeout(onClose, 120);
  } finally {
    saving.value = false;
  }
};

const onClose = () => {
  window.close();
  if (!window.closed && !window.opener) router.push({ name: 'clothingType' });
};

onMounted(() => {
  if ('BroadcastChannel' in window) channel = new BroadcastChannel(CLOTHING_FORM_CHANNEL);
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
.clothing-form {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #fff;
}

.clothing-form__toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 36px;
  padding: 4px 10px;
  border-bottom: 1px solid var(--wms-border);
  background: #f7f8fa;
}

.clothing-form__title {
  font-size: 13px;
  font-weight: 700;
  color: #1e4e79;
  white-space: nowrap;
}

.clothing-form__actions {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-left: auto;
}

.clothing-form__body {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  padding: 16px 12px 12px;
}

.clothing-form__items-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 4px 12px 8px;
  font-weight: 700;
  color: #1e4e79;
}

.clothing-form__table {
  flex: 1;
  min-height: 0;
  overflow: auto;
  margin: 0 12px;
  border: 1px solid #c5d8ea;
}

.clothing-form__tr {
  display: grid;
  grid-template-columns: 48px 110px minmax(0, 1fr) 90px 40px;
  align-items: center;
  gap: 8px;
  padding: 4px 8px;
  border-bottom: 1px solid #e4eef6;
}

.clothing-form__tr.is-head {
  background: #d6e7f5;
  color: #1e4e79;
  font-weight: 700;
}

.clothing-form__no {
  width: 100%;
}

.clothing-form__empty {
  padding: 16px 8px;
  color: var(--wms-text-sub);
  text-align: center;
}
</style>
