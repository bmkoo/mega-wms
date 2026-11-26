<template>
  <div class="order-item-form">
    <div class="order-item-form__toolbar">
      <div class="order-item-form__title">※ {{ $t('menu.orderItem') }}</div>
      <div class="order-item-form__actions">
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

    <div class="order-item-form__body">
      <a-spin :spinning="loading">
        <a-form :label-col="{ span: 8 }" :wrapper-col="{ span: 15 }">
          <a-form-item v-for="f in FIELDS" :key="f.data" :label="$t(`field.${f.data}`)">
            <!-- @Id 필드는 수정할 수 없다 -->
            <a-date-picker
              v-if="f.type === 'date'"
              v-model:value="form[f.data]"
              :show-time="f.format.includes('HH')"
              :format="f.format.includes('HH') ? 'YYYY-MM-DD HH:mm:ss' : 'YYYY-MM-DD'"
              :disabled="isId(f)"
              style="width: 100%"
            />
            <a-input-number
              v-else-if="f.type === 'number'"
              v-model:value="form[f.data]"
              :disabled="isId(f)"
              :controls="false"
              :formatter="isId(f) ? undefined : withComma"
              :parser="isId(f) ? undefined : withoutComma"
              style="width: 100%"
            />
            <!-- 공통코드 필드: 코드명으로 고르고 코드값으로 저장한다 -->
            <a-select
              v-else-if="f.type === 'code'"
              v-model:value="form[f.data]"
              :options="codeStore.options(f.codeGroup)"
              :disabled="isId(f)"
              allow-clear
              style="width: 100%"
            />
            <a-input v-else v-model:value="form[f.data]" :disabled="isId(f)" allow-clear />
          </a-form-item>
        </a-form>
      </a-spin>
    </div>
  </div>
</template>

<script setup>
// 이 파일은 scripts/genPage.mjs 가 OrderItem.java 에서 생성했다. (템플릿: scripts/templates/PgEntityForm.vue.tpl)
import { getCurrentInstance, onBeforeUnmount, onMounted, reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import dayjs from 'dayjs';
import { useCommonCodeStore } from '@/store/commonCodeStore';
import { FORM_CHANNEL, takeFormPayload } from './orderItemPopup';

const { proxy } = getCurrentInstance();
const { t } = useI18n();
/** 공통코드 (type: 'code' 필드의 선택 목록). 로그인 후 router 에서 미리 불러둔다 */
const codeStore = useCommonCodeStore();
const route = useRoute();
const router = useRouter();

defineOptions({ name: 'PgOrderItemForm' });

/** 단건 조회 API: apiFunctions.onApiGetOrderItemList(id) → GET v1/orderItem/{id} */
const getApi = (id) => proxy.$api.onApiGetOrderItemList(id);
/** 저장 API: apiFunctions.onApiSaveOrderItem(data) → POST v1/orderItem/save */
const saveApi = (data) => proxy.$api.onApiSaveOrderItem(data);

/** 날짜 필드의 format 은 서버(Jackson ISO_LOCAL_DATE_TIME / ISO_LOCAL_DATE)로 보낼 형식이다 */
const FIELDS = [
  { data: 'orderId', type: 'number', className: 'htRight', width: 90, id: true },
  { data: 'lineNo', type: 'number', className: 'htRight', width: 90, id: true },
  { data: 'recipientNm', type: 'text', className: '', width: 120 },
  { data: 'productCd', type: 'text', className: '', width: 120 },
  { data: 'productNm', type: 'text', className: '', width: 220 },
  { data: 'qty', type: 'number', className: 'htRight', width: 90 },
  { data: 'deliveryStatus', type: 'text', className: '', width: 90 },
  { data: 'shippingNo', type: 'text', className: '', width: 120 },
  { data: 'isAssign', type: 'text', className: '', width: 90 },
  { data: 'lineNoSub', type: 'number', className: 'htRight', width: 90 },
];

const ID_FIELDS = ['orderId', 'lineNo'];

const form = reactive({});
const loading = ref(false);
const saving = ref(false);
/** 서버에서 받은 원본 행. 저장할 때 폼에 없는 값(id 등)도 그대로 돌려보낸다 */
let original = {};
let channel = null;

const isId = (f) => ID_FIELDS.includes(f.data);

/** 숫자 입력칸 표시용 1000 단위 콤마 (소수부는 그대로). 저장 값은 parser 로 콤마를 뺀 숫자다 */
const withComma = (value) => {
  const [int, dec] = String(value ?? '').split('.');
  const text = int.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return dec === undefined ? text : `${text}.${dec}`;
};
const withoutComma = (text) => String(text ?? '').replace(/,/g, '');

/** 서버 날짜 값(ISO 문자열 / "yyyy-MM-dd HH:mm:ss" / [y, M, d, h, m, s] 배열 / epoch) → dayjs. 없거나 잘못되면 null */
const toDate = (value) => {
  if (value === null || value === undefined || value === '') return null;
  const d = Array.isArray(value)
    ? dayjs(new Date(value[0], (value[1] || 1) - 1, value[2] || 1, value[3] || 0, value[4] || 0, value[5] || 0))
    : dayjs(value);
  return d.isValid() ? d : null;
};

const fillForm = (row) => {
  original = row || {};
  FIELDS.forEach((f) => {
    const value = original[f.data];
    if (f.type === 'date') form[f.data] = toDate(value);
    else if (f.type === 'number') form[f.data] = value === null || value === undefined || value === '' ? null : Number(value);
    else form[f.data] = value ?? '';
  });
};

/** 폼 값 → 저장 요청 body */
const toBody = () => {
  const body = { ...original };
  FIELDS.forEach((f) => {
    const value = form[f.data];
    if (f.type === 'date') body[f.data] = value ? value.format(f.format) : null;
    else if (f.type === 'number') body[f.data] = value ?? null;
    else body[f.data] = String(value ?? '').trim();
  });
  return body;
};

/** 목록에서 넘긴 행으로 먼저 그리고, id 가 있으면 API 로 최신 값을 다시 조회한다 */
const load = async () => {
  const payload = takeFormPayload(route.query.token);
  fillForm(payload?.row);

  const id = route.query.id;
  if (!id) return;
  loading.value = true;
  try {
    const result = await getApi(id);
    if (result && typeof result === 'object') fillForm(result);
  } finally {
    loading.value = false;
  }
};

/** 목록 창에 저장을 알린다 (목록은 다시 조회한다) */
const notifySaved = (row) => {
  const payload = { type: 'orderItem-saved', row };
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
  const body = toBody();
  saving.value = true;
  try {
    const result = await saveApi(body);
    if (!result) return; // 오류 알림은 apiFunctions 가 띄운다
    notifySaved(typeof result === 'object' ? { ...body, ...result } : body);
    window.setTimeout(onClose, 120);
  } finally {
    saving.value = false;
  }
};

const onClose = () => {
  window.close();
  if (!window.closed && !window.opener) router.push({ name: 'orderItem' });
};

onMounted(() => {
  document.title = t('menu.orderItem');
  if ('BroadcastChannel' in window) channel = new BroadcastChannel(FORM_CHANNEL);
  load();
});

onBeforeUnmount(() => {
  channel?.close();
});
</script>

<style scoped>
.order-item-form {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #fff;
}

.order-item-form__toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 36px;
  padding: 4px 10px;
  border-bottom: 1px solid var(--wms-border);
  background: #f7f8fa;
}

.order-item-form__title {
  font-size: 13px;
  font-weight: 700;
  color: #1e4e79;
  white-space: nowrap;
}

.order-item-form__actions {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-left: auto;
}

.order-item-form__body {
  padding: 16px 8px 8px;
  overflow: auto;
}

.order-item-form__body :deep(.ant-form-item) {
  margin-bottom: 8px;
}
</style>
