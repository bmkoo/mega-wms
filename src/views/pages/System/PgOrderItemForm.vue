<template>
  <div class="oi">
    <a-spin :spinning="loading" class="oi__spin">
      <main class="oi__main">
        <table class="oi-kv">
          <tbody>
            <tr>
              <th>{{ $t('field.orderNo') }}</th>
              <td>
                <span class="oi-key">{{ order.orderNo }}</span>
                <span class="oi-id">#{{ order.orderId || orderId }}</span>
              </td>
              <th>{{ $t('field.channelId') }}</th>
              <td>{{ order.channelId }}</td>
              <th>{{ $t('field.orderDate') }}</th>
              <td>{{ formatDate(order.orderDate) }}</td>
            </tr>
            <tr>
              <th>{{ $t('field.ordererNm') }}</th>
              <td>{{ order.ordererNm }}</td>
              <th>{{ $t('field.tel') }}</th>
              <td>{{ order.tel }}</td>
              <th>{{ $t('field.hpNo') }}</th>
              <td>{{ order.hpNo }}</td>
            </tr>
            <tr>
              <th>{{ $t('field.receiverNm') }}</th>
              <td>{{ order.receiverNm }}</td>
              <th>{{ $t('field.orderCount') }}</th>
              <td>{{ $cf.fncComma(order.orderCount) }}</td>
              <th>{{ $t('field.itemCount') }}</th>
              <td>{{ $cf.fncComma(order.itemCount) }}</td>
            </tr>
            <tr>
              <th>{{ $t('field.address1') }}</th>
              <td colspan="5">
                <span v-if="order.zipCode">[{{ order.zipCode }}] </span>{{ order.address1 }}
                <div v-if="order.address2">{{ order.address2 }}</div>
              </td>
            </tr>
            <tr>
              <th>{{ $t('field.memo') }}</th>
              <td colspan="5">{{ order.memo }}</td>
            </tr>
          </tbody>
        </table>

        <section class="oi-sec">
          <div class="oi-sec__head">
            <strong>※ {{ $t('menu.orderItem') }}</strong>
          </div>
          <table class="oi-grid">
            <colgroup>
              <col class="oi-col-line" />
              <col class="oi-col-product" />
              <col class="oi-col-name" />
              <col class="oi-col-qty" />
              <col class="oi-col-status" />
              <col class="oi-col-shipping" />
              <col class="oi-col-assign" />
            </colgroup>
            <thead>
              <tr>
                <th>{{ $t('field.lineNo') }}</th>
                <th>{{ $t('field.productCd') }}</th>
                <th>{{ $t('field.productNm') }}</th>
                <th>{{ $t('field.qty') }}</th>
                <th>{{ $t('field.deliveryStatus') }}</th>
                <th>{{ $t('field.shippingNo') }}</th>
                <th>{{ $t('field.isAssign') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in items" :key="`${item.orderId}-${item.lineNo}`">
                <td><span class="oi-key">{{ item.lineNo }}</span></td>
                <td><a-input v-model:value="item.productCd" size="small" allow-clear /></td>
                <td><a-input v-model:value="item.productNm" size="small" allow-clear /></td>
                <td>
                  <a-input-number
                    v-model:value="item.qty"
                    size="small"
                    :controls="false"
                    :formatter="withComma"
                    :parser="withoutComma"
                    style="width: 100%"
                  />
                </td>
                <td><a-input v-model:value="item.deliveryStatus" size="small" allow-clear /></td>
                <td><a-input v-model:value="item.shippingNo" size="small" allow-clear /></td>
                <td><a-input v-model:value="item.isAssign" size="small" allow-clear /></td>
              </tr>
              <tr v-if="!items.length">
                <td colspan="8" class="oi-empty">{{ $t('common.noData') }}</td>
              </tr>
            </tbody>
          </table>
        </section>
      </main>
    </a-spin>

    <aside class="oi__side">
      <button type="button" class="oi-side-btn oi-side-btn--primary" :disabled="saving || loading" @click="onSave">
        <span>{{ $t('common.save') }}</span>
        <SaveOutlined />
      </button>
      <button v-for="key in sideActions" :key="key" type="button" class="oi-side-btn">
        <span>{{ $t(`orderDetail.action.${key}`) }}</span>
        <QuestionCircleOutlined />
      </button>
      <button type="button" class="oi-side-btn" @click="onClose">
        <span>{{ $t('common.close') }}</span>
        <CloseOutlined />
      </button>
    </aside>
  </div>
</template>

<script setup>
// 한 주문의 OrderItem 목록을 주문상세 화면 형식으로 조회·수정하는 팝업이다.
import { getCurrentInstance, onBeforeUnmount, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import dayjs from 'dayjs';
import { FORM_CHANNEL, takeFormPayload } from './orderItemPopup';

const { proxy } = getCurrentInstance();
const { t } = useI18n();
const route = useRoute();
const router = useRouter();

defineOptions({ name: 'PgOrderItemForm' });

/** 주문 품목 목록: apiFunctions.onApiGetOrderItem({ orderId }) → GET v1/orderItemList?orderId=... */
const getApi = (params) => proxy.$api.onApiGetOrderItem(params);
/** 주문 기본정보: apiFunctions.onApiGetOrderList(orderId) → GET v1/order/{orderId} */
const getOrderApi = (id) => proxy.$api.onApiGetOrderList(id);
/** 저장 API: apiFunctions.onApiSaveOrderItem(items) → PUT v1/orderItem */
const saveApi = (data) => proxy.$api.onApiSaveOrderItem(data);

/** OrderItem 필드. 복합키(orderId, lineNo)는 화면에서 수정하지 않는다. */
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

const orderId = ref('');
const order = ref({});
const items = ref([]);
const loading = ref(false);
const saving = ref(false);
let channel = null;

/** 주문상세 화면과 같은 작업 버튼. 기능 연결 전이므로 클릭 이벤트는 두지 않는다. */
const sideActions = [
'refresh',
  'baseChange',
  'splitOrder',
  'newMemo',
  'splitQty',
  'changeQty',
  'changeProduct',
  'changeWarehouse',
  'cancelOrder',
  'restoreCancel',
  'changeReqDate',
  'reserveInvoice',
  'returnManage',
  'exchangeManage',
  'lostReship',
  'addProduct',
  'excludeAlloc',
  'runAlloc',
  'printSpec',
];

/** 숫자 입력칸 표시용 1000 단위 콤마 (소수부는 그대로). 저장 값은 parser 로 콤마를 뺀 숫자다 */
const withComma = (value) => {
  const [int, dec] = String(value ?? '').split('.');
  const text = int.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return dec === undefined ? text : `${text}.${dec}`;
};
const withoutComma = (text) => String(text ?? '').replace(/,/g, '');

/** 서버 날짜 값(ISO 문자열 또는 [y, M, d, h, m, s])을 화면 표시 문자열로 바꾼다. */
const formatDate = (value) => {
  if (value === null || value === undefined || value === '') return '';
  const date = Array.isArray(value)
    ? dayjs(new Date(value[0], (value[1] || 1) - 1, value[2] || 1, value[3] || 0, value[4] || 0, value[5] || 0))
    : dayjs(value);
  return date.isValid() ? date.format('YYYY-MM-DD HH:mm:ss') : String(value);
};

const normalizeRow = (row = {}) => {
  const normalized = { ...row };
  FIELDS.forEach((f) => {
    const value = row[f.data];
    if (f.type === 'number') normalized[f.data] = value === null || value === undefined || value === '' ? null : Number(value);
    else normalized[f.data] = value ?? '';
  });
  return normalized;
};

/** 화면 목록 → 백엔드가 받는 List<OrderItem> */
const toBody = () =>
  items.value.map((item) => {
    const body = { ...item };
    FIELDS.forEach((f) => {
      const value = item[f.data];
      if (f.type === 'number') body[f.data] = value ?? null;
      else body[f.data] = String(value ?? '').trim();
    });
    return body;
  });

/** 목록에서 넘긴 행으로 먼저 그리고, orderId의 전체 품목을 API로 다시 조회한다. */
const load = async () => {
  const payload = takeFormPayload(route.query.token);
  if (payload?.row) items.value = [normalizeRow(payload.row)];
  orderId.value = String(route.query.id || payload?.row?.orderId || '').split(',')[0];
  if (!orderId.value) return;
  loading.value = true;
  try {
    const [orderResult, itemResult] = await Promise.all([
      getOrderApi(orderId.value),
      getApi({ orderId: orderId.value }),
    ]);
    order.value = orderResult && typeof orderResult === 'object' ? orderResult : { orderId: orderId.value };
    const list = itemResult?.list || itemResult?.content || itemResult || [];
    // 서버가 조회 조건을 무시해 전체 목록을 반환해도 현재 주문만 표시한다.
    items.value = (Array.isArray(list) ? list : [])
      .filter((row) => String(row.orderId) === orderId.value)
      .sort((a, b) => (Number(a.lineNo) || 0) - (Number(b.lineNo) || 0))
      .map(normalizeRow);
  } finally {
    loading.value = false;
  }
};

/** 목록 창에 저장을 알린다 (목록은 다시 조회한다) */
const notifySaved = (rows) => {
  const payload = { type: 'orderItem-saved', rows };
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
  if (!body.length) return;
  saving.value = true;
  try {
    const result = await saveApi(body);
    if (!result) return; // 오류 알림은 apiFunctions 가 띄운다
    notifySaved(body);
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
.oi {
  display: flex;
  height: 100%;
  background: #fff;
  color: #222;
  font-size: 12px;
}

.oi__spin {
  flex: 1;
  min-width: 0;
  overflow: hidden;
}

.oi__spin :deep(.ant-spin-container) {
  height: 100%;
}

.oi__main {
  height: 100%;
  overflow: auto;
  padding: 8px 10px 16px;
}

.oi__side {
  width: 168px;
  flex-shrink: 0;
  border-left: 1px solid #c5d4de;
  padding: 6px 6px 12px;
  overflow: auto;
  background: #f7fafc;
}

.oi-kv {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 8px;
}

.oi-kv th {
  width: 88px;
  padding: 4px 6px;
  border: 1px solid #fff;
  background: #7eacd0;
  color: #fff;
  font-weight: 700;
  text-align: left;
  white-space: nowrap;
}

.oi-kv td {
  width: calc((100% - 264px) / 3);
  min-width: 120px;
  padding: 3px 6px;
  border-bottom: 1px solid #e5eef4;
  vertical-align: middle;
}

.oi-key {
  color: #1e5aa8;
  font-weight: 700;
}

.oi-id {
  margin-left: 6px;
  color: #888;
  font-size: 11px;
}

.oi-sec {
  margin-top: 10px;
}

.oi-sec__head {
  display: flex;
  align-items: center;
  min-height: 26px;
  padding: 2px 6px;
  background: #8eb9d6;
  color: #fff;
  font-weight: 700;
}

.oi-grid {
  width: 100%;
  min-width: 980px;
  table-layout: fixed;
  border-collapse: collapse;
}

.oi-col-line {
  width: 60px;
}

.oi-col-recipient {
  width: 110px;
}

.oi-col-product {
  width: 130px;
}

.oi-col-name {
  width: 220px;
}

.oi-col-qty {
  width: 80px;
}

.oi-col-status,
.oi-col-assign {
  width: 100px;
}

.oi-col-shipping {
  width: 130px;
}

.oi-grid th,
.oi-grid td {
  padding: 3px 4px;
  border: 1px solid #c5d8ea;
  text-align: center;
}

.oi-grid th {
  background: #d6e7f5;
  color: #1e4e79;
  font-weight: 700;
}

.oi-empty {
  height: 80px;
  color: #888;
}

.oi-side-btn {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  margin-bottom: 3px;
  padding: 4px 7px;
  border: 1px solid #9bb8d3;
  background: #fff;
  color: #1e4e79;
  font-size: 11px;
  text-align: left;
  cursor: pointer;
}

.oi-side-btn:hover:not(:disabled) {
  background: #e8f1f8;
}

.oi-side-btn--primary {
  border-color: #3d6d99;
  background: #3d6d99;
  color: #fff;
}

.oi-side-btn--primary:hover:not(:disabled) {
  background: #2f5e89;
}

.oi-side-btn:disabled {
  cursor: default;
  opacity: 0.55;
}
</style>
