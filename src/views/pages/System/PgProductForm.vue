<template>
  <div class="product-form">
    <div class="product-form__toolbar">
      <div class="product-form__title">※ {{ $t('menu.product') }}</div>
      <div class="product-form__actions">
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

    <div class="product-form__body">
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

      <!-- 상품 세트 구성품 (ProductComponent) 목록 : GET v1/productComponentList (ProductController) -->
      <div class="product-form__section">
        <div class="product-form__section-title">
          {{ $t('menu.productComponent') }}
          <span class="product-form__section-count">{{ $cf.fncComma(componentRows.length) }}</span>
        </div>
        <a-spin :spinning="componentLoading">
          <div class="product-form__grid ht-theme-main">
            <div ref="componentHostRef" v-once />
          </div>
        </a-spin>
      </div>
    </div>
  </div>
</template>

<script setup>
// 이 파일은 scripts/genPage.mjs 가 Product.java 에서 생성했다. (템플릿: scripts/templates/PgEntityForm.vue.tpl)
import { getCurrentInstance, markRaw, onBeforeUnmount, onMounted, reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import dayjs from 'dayjs';
import Handsontable from 'handsontable';
import 'handsontable/styles/handsontable.css';
import 'handsontable/styles/ht-theme-main.css';
import commonFunction from '@/common/utils/commonFunction';
import { useCommonCodeStore } from '@/store/commonCodeStore';
import { FORM_CHANNEL, takeFormPayload } from './productPopup';

const { proxy } = getCurrentInstance();
const { t } = useI18n();
/** 공통코드 (type: 'code' 필드의 선택 목록). 로그인 후 router 에서 미리 불러둔다 */
const codeStore = useCommonCodeStore();
const route = useRoute();
const router = useRouter();

defineOptions({ name: 'PgProductForm' });

/** 단건 조회 API: apiFunctions.onApiGetProduct(id) → GET v1/product/{id} */
const getApi = (id) => proxy.$api.onApiGetProduct(id);
/** 저장 API: apiFunctions.onApiSaveProduct(data) → POST v1/product/save */
const saveApi = (data) => proxy.$api.onApiSaveProduct(data);

/** 날짜 필드의 format 은 서버(Jackson ISO_LOCAL_DATE_TIME / ISO_LOCAL_DATE)로 보낼 형식이다 */
const FIELDS = [
  { data: 'productCd', type: 'text', className: '', width: 120 },
  { data: 'productNm', type: 'text', className: '', width: 220 },
  { data: 'barcode', type: 'text', className: '', width: 220 },
  { data: 'barcodeBox', type: 'text', className: '', width: 220 },
  { data: 'qtyBox', type: 'number', className: 'htRight', width: 90 },
  { data: 'brandCd', type: 'text', className: '', width: 120 },
  { data: 'category1Cd', type: 'text', className: '', width: 120 },
  { data: 'category2Cd', type: 'text', className: '', width: 120 },
  { data: 'costPrice', type: 'number', className: 'htRight', width: 90 },
  { data: 'salePrice', type: 'number', className: 'htRight', width: 90 },
  { data: 'supplierId', type: 'text', className: '', width: 120 },
  { data: 'memo', type: 'text', className: '', width: 220 },
  { data: 'memoUpdatedAt', type: 'date', className: 'htCenter', width: 140, format: 'YYYY-MM-DDTHH:mm:ss' },
  { data: 'saleTypeCode', type: 'code', className: 'htCenter', width: 100, codeGroup: 'SALE_TYPE_CODE' },
  { data: 'deliveryStatusCode', type: 'code', className: 'htCenter', width: 100, codeGroup: 'DELIVERY_STATUS_CODE' },
  { data: 'productStatusCode', type: 'code', className: 'htCenter', width: 100, codeGroup: 'PRODUCT_STATUS_CODE' },
  { data: 'stockStatusCode', type: 'code', className: 'htCenter', width: 100, codeGroup: 'STOCK_STATUS_CODE' },
  { data: 'setYn', type: 'text', className: '', width: 90 },
  { data: 'locationWh', type: 'text', className: '', width: 120 },
  { data: 'location1', type: 'text', className: '', width: 120 },
  { data: 'location2', type: 'text', className: '', width: 120 },
  { data: 'location3', type: 'text', className: '', width: 120 },
  { data: 'location4', type: 'text', className: '', width: 120 },
  { data: 'imageUrl', type: 'text', className: '', width: 220 },
  { data: 'productDesc', type: 'text', className: '', width: 220 },
];

const ID_FIELDS = ['productCd'];

const form = reactive({});
const loading = ref(false);
const saving = ref(false);
/** 서버에서 받은 원본 행. 저장할 때 폼에 없는 값(id 등)도 그대로 돌려보낸다 */
let original = {};
let channel = null;

const isId = (f) => ID_FIELDS.includes(f.data);

// ─────────────────────────────────────────────
// 상품 세트 구성품 (ProductComponent.java) 목록
// ─────────────────────────────────────────────
/** 구성품 목록 API: apiFunctions.onApiQueryProductComponent(params) → GET v1/productComponentList (ProductController) */
const componentApi = (params) => proxy.$api.onApiQueryProductComponent(params);

/** ProductComponent 필드 → 그리드 컬럼 (헤더는 i18n field.<data>) */
const COMPONENT_FIELDS = [
  { data: 'productCdOrigin', className: '', width: 130 },
  { data: 'productCd', className: '', width: 130 },
  { data: 'qty', className: 'htRight', width: 80, comma: true },
  { data: 'sort', className: 'htRight', width: 80 },
];
const COMPONENT_GRID_HEIGHT = 220;

const componentHostRef = ref(null);
const componentRows = ref([]);
const componentLoading = ref(false);
let componentHot = null;

/** 수량은 1000 단위 콤마로 보여준다 (데이터는 숫자 그대로) */
const commaRenderer = function (instance, td, row, col, prop, value, cellProperties) {
  Handsontable.renderers.TextRenderer.apply(this, [instance, td, row, col, prop, commonFunction.fncComma(value), cellProperties]);
};

const createComponentGrid = () => {
  if (!componentHostRef.value || componentHot) return;
  componentHot = markRaw(
    new Handsontable(componentHostRef.value, {
      themeName: 'ht-theme-main',
      data: [],
      colHeaders: [t('field.seq'), ...COMPONENT_FIELDS.map((f) => t(`field.${f.data}`))],
      columns: [
        { data: 'no', className: 'htCenter', readOnly: true },
        ...COMPONENT_FIELDS.map((f) => ({
          data: f.data,
          className: f.className,
          readOnly: true,
          ...(f.comma ? { renderer: commaRenderer } : {}),
        })),
      ],
      colWidths: [50, ...COMPONENT_FIELDS.map((f) => f.width)],
      height: COMPONENT_GRID_HEIGHT,
      width: '100%',
      stretchH: 'all',
      rowHeaders: false,
      readOnly: true,
      fillHandle: false,
      autoRowSize: false,
      autoColumnSize: false,
      licenseKey: 'non-commercial-and-evaluation',
    })
  );
};

const destroyComponentGrid = () => {
  if (componentHot && !componentHot.isDestroyed) componentHot.destroy();
  componentHot = null;
};

/**
 * 이 상품(세트)의 구성품을 조회한다.
 * 지금 백엔드는 productCdOrigin 파라미터를 무시하고 전체 목록을 주므로, 화면에서 한 번 더 거른다.
 * (백엔드가 걸러 주게 되어도 결과는 같다)
 */
const loadComponents = async (productCd) => {
  componentRows.value = [];
  componentHot?.loadData([]);
  if (!productCd) return;

  componentLoading.value = true;
  try {
    const result = await componentApi({ productCdOrigin: productCd });
    const list = result?.list || result?.content || result || [];
    const rows = (Array.isArray(list) ? list : [])
      .filter((row) => String(row.productCdOrigin) === String(productCd))
      .sort((a, b) => (Number(a.sort) || 0) - (Number(b.sort) || 0))
      .map((row, index) => ({ ...row, no: index + 1 }));
    componentRows.value = rows;
    componentHot?.loadData(rows);
  } finally {
    componentLoading.value = false;
  }
};

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
  if (!id) {
    loadComponents(form.productCd);
    return;
  }
  loading.value = true;
  try {
    const result = await getApi(id);
    if (result && typeof result === 'object') fillForm(result);
  } finally {
    loading.value = false;
  }
  // 상품을 다 읽은 뒤 그 품번으로 구성품을 조회한다
  loadComponents(form.productCd || id);
};

/** 목록 창에 저장을 알린다 (목록은 다시 조회한다) */
const notifySaved = (row) => {
  const payload = { type: 'product-saved', row };
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
  if (!window.closed && !window.opener) router.push({ name: 'product' });
};

onMounted(() => {
  document.title = t('menu.product');
  if ('BroadcastChannel' in window) channel = new BroadcastChannel(FORM_CHANNEL);
  createComponentGrid();
  load();
});

onBeforeUnmount(() => {
  channel?.close();
  destroyComponentGrid();
});
</script>

<style scoped>
.product-form {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #fff;
}

.product-form__toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 36px;
  padding: 4px 10px;
  border-bottom: 1px solid var(--wms-border);
  background: #f7f8fa;
}

.product-form__title {
  font-size: 13px;
  font-weight: 700;
  color: #1e4e79;
  white-space: nowrap;
}

.product-form__actions {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-left: auto;
}

.product-form__body {
  padding: 16px 8px 8px;
  overflow: auto;
}

.product-form__body :deep(.ant-form-item) {
  margin-bottom: 8px;
}

.product-form__section {
  margin: 16px 8px 0;
}

.product-form__section-title {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 6px;
  font-size: 13px;
  font-weight: 700;
  color: #1e4e79;
}

.product-form__section-count {
  font-weight: 400;
  color: var(--wms-text);
}

.product-form__grid {
  --ht-header-background-color: #d6e7f5;
  --ht-header-foreground-color: #1e4e79;
  --ht-header-font-weight: 700;
  --ht-cell-horizontal-border-color: #c5d8ea;
  --ht-cell-vertical-border-color: #c5d8ea;
}
</style>
