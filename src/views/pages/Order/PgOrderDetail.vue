<template>
  <div class="od">
    <div class="od__main">
      <table class="od-kv">
        <tbody>
          <tr>
            <th>{{ $t('orderDetail.orderNo') }}</th>
            <td>
              <span class="od-link">{{ order.orderNo }}</span>
              <a class="od-link" @click.prevent="onReady">[{{ $t('orderDetail.originDetail') }}]</a>
            </td>
            <th>{{ $t('orderDetail.channel') }}</th>
            <td>{{ order.channel }}</td>
            <th>{{ $t('orderDetail.inputInfo') }}</th>
            <td>{{ order.inputInfo }}</td>
          </tr>
          <tr>
            <th>{{ $t('orderDetail.ordererName') }}</th>
            <td>{{ order.orderer }}</td>
            <th>{{ $t('orderDetail.tel') }}</th>
            <td>{{ order.ordererTel }}</td>
            <th>{{ $t('orderDetail.mobile') }}</th>
            <td>
              {{ order.ordererPhone }}
              <a class="od-link" @click.prevent="onReady">[{{ $t('orderDetail.smsSend') }}]</a>
            </td>
          </tr>
          <tr>
            <th>Email</th>
            <td>{{ order.email }}</td>
            <td colspan="4" class="od-muted">[ {{ order.smsRemain }} ]{{ $t('orderDetail.smsRemain') }}</td>
          </tr>
          <tr>
            <th>{{ $t('orderDetail.receiver') }}</th>
            <td>{{ order.receiver }}</td>
            <th>{{ $t('orderDetail.tel') }}</th>
            <td>
              {{ order.receiverTel }}
              <a class="od-link" @click.prevent="onReady">[{{ $t('orderDetail.smsSend') }}]</a>
            </td>
            <th>{{ $t('orderDetail.mobile') }}</th>
            <td>
              {{ order.receiverPhone }}
              <a class="od-link" @click.prevent="onReady">[{{ $t('orderDetail.smsSend') }}]</a>
            </td>
          </tr>
          <tr>
            <th>{{ $t('orderDetail.address') }}</th>
            <td colspan="3">
              [{{ order.zip }}] {{ order.address }}
              <div>{{ order.addressDetail }}</div>
            </td>
            <td colspan="2" class="od-muted">[ {{ order.smsRemain }} ]{{ $t('orderDetail.smsRemain') }}</td>
          </tr>
          <tr>
            <th>{{ $t('orderDetail.deliveryMemo') }}</th>
            <td colspan="5">{{ order.deliveryMemo }}</td>
          </tr>
        </tbody>
      </table>

      <section class="od-sec">
        <div class="od-sec__head">
          <strong>※ {{ $t('orderDetail.orderInfo') }}</strong>
          <a-checkbox v-model:checked="hideCancel">{{ $t('orderDetail.hideCancel') }}</a-checkbox>
        </div>
        <table class="od-grid od-grid--order">
          <colgroup>
            <col class="od-col-no" />
            <col class="od-col-kind" />
            <col class="od-col-photo" />
            <col class="od-col-ex" />
            <col class="od-col-sku" />
            <col class="od-col-color" />
            <col class="od-col-size" />
            <col class="od-col-date" />
            <col class="od-col-req" />
            <col class="od-col-wms" />
            <col class="od-col-ship" />
            <col class="od-col-chno" />
          </colgroup>
          <thead>
            <tr>
              <th rowspan="2">#</th>
              <th rowspan="2">{{ $t('orderDetail.kind') }}</th>
              <th rowspan="2">{{ $t('orderDetail.photo') }}</th>
              <th rowspan="2">{{ $t('orderDetail.exchange') }}</th>
              <th>{{ $t('orderDetail.sku') }}</th>
              <th>{{ $t('orderDetail.color') }}</th>
              <th>{{ $t('orderDetail.size') }}</th>
              <th>{{ $t('orderDetail.inputDate') }}</th>
              <th>{{ $t('orderDetail.reqDate') }}</th>
              <th>{{ $t('orderDetail.wmsDate') }}</th>
              <th>{{ $t('orderDetail.shipDate') }}</th>
              <th>{{ $t('orderDetail.channelOrderNo') }}</th>
            </tr>
            <tr>
              <th colspan="2"></th>
              <th>{{ $t('orderDetail.availStock') }}</th>
              <th>{{ $t('orderDetail.qty') }}</th>
              <th>{{ $t('orderDetail.price') }}</th>
              <th>{{ $t('orderDetail.cost') }}</th>
              <th>{{ $t('orderDetail.settle') }}</th>
              <th>{{ $t('orderDetail.warehouse') }}</th>
            </tr>
          </thead>
          <tbody>
            <template v-for="item in visibleItems" :key="`${item.kind}-${item.no}`">
              <tr :class="{ 'is-cancel': item.cancelled }">
                <td class="od-nowrap" rowspan="2">{{ item.no }}</td>
                <td class="od-nowrap" rowspan="2">{{ item.kind }}</td>
                <td rowspan="2"><span class="od-photo"></span></td>
                <td class="od-nowrap" rowspan="2">{{ item.exchange || '' }}</td>
                <td class="od-nowrap">{{ item.sku }}</td>
                <td class="od-nowrap">{{ item.color }}</td>
                <td class="od-nowrap">{{ item.size }}</td>
                <td class="c-danger od-nowrap">{{ item.inputDate }}</td>
                <td class="od-nowrap"></td>
                <td class="od-nowrap"></td>
                <td class="od-nowrap"></td>
                <td class="od-nowrap">{{ item.channelOrderNo }}</td>
              </tr>
              <tr :class="{ 'is-cancel': item.cancelled }">
                <td class="od-left" colspan="2">
                  {{ item.name }}
                </td>
                <td class="ht-right od-nowrap">{{ $cf.fncComma(item.stock) }}</td>
                <td class="ht-right od-nowrap">{{ item.qty }}</td>
                <td class="ht-right od-nowrap">{{ $cf.fncComma(item.price) }}</td>
                <td class="ht-right od-nowrap">{{ $cf.fncComma(item.cost) }}</td>
                <td class="ht-right od-nowrap">{{ $cf.fncComma(item.settle) }}</td>
                <td class="od-left">
                  {{ item.warehouse }}
                  <div v-if="item.option">{{ item.option }}</div>
                </td>
              </tr>
              <tr :class="{ 'is-cancel': item.cancelled }">
                <td colspan="12">
                  <div v-if="item.memo" class="od-item-memo">{{ item.memo }}</div>
                </td>
              </tr>
            </template>
            <tr class="od-total">
              <td colspan="7"></td>
              <td class="ht-right">{{ itemSum('qty') }}</td>
              <td class="ht-right">{{ $cf.fncComma(itemSum('price')) }}</td>
              <td class="ht-right">{{ $cf.fncComma(itemSum('cost')) }}</td>
              <td class="ht-right">{{ $cf.fncComma(itemSum('settle')) }}</td>
              <td></td>
            </tr>
          </tbody>
        </table>
        <a-button size="small" class="od-sec__btn" @click="onReady">{{ $t('orderDetail.matchInfo') }}</a-button>
      </section>

      <section class="od-sec">
        <div class="od-sec__head">
          <strong>※ {{ $t('orderDetail.exchangeInfo') }}</strong>
          <a-checkbox v-model:checked="hideDone">{{ $t('orderDetail.hideDone') }}</a-checkbox>
        </div>
        <table class="od-grid">
          <thead>
            <tr>
              <th>#</th>
              <th>{{ $t('orderDetail.kind') }}</th>
              <th>{{ $t('orderDetail.photo') }}</th>
              <th>{{ $t('orderDetail.exchange') }}</th>
              <th>{{ $t('orderDetail.sku') }}</th>
              <th>{{ $t('orderDetail.color') }}</th>
              <th>{{ $t('orderDetail.size') }}</th>
              <th>{{ $t('orderDetail.inputDate') }}</th>
              <th>{{ $t('orderDetail.reqDate') }}</th>
              <th>{{ $t('orderDetail.wmsDate') }}</th>
              <th>{{ $t('orderDetail.channelChange') }}</th>
            </tr>
          </thead>
        </table>
      </section>

      <section class="od-sec">
        <div class="od-sec__head"><strong>※ {{ $t('orderDetail.returnInfo') }}</strong></div>
        <table class="od-grid">
          <thead>
            <tr>
              <th>{{ $t('orderDetail.kind') }}</th>
              <th>#</th>
              <th>{{ $t('orderDetail.inputDate') }}</th>
              <th>{{ $t('orderDetail.collectReqDate') }}</th>
              <th>{{ $t('orderDetail.collectQty') }}</th>
              <th>{{ $t('orderDetail.collectConfirm') }}</th>
              <th>{{ $t('orderDetail.receiveShip') }}</th>
              <th>{{ $t('orderDetail.receiveFee') }}</th>
              <th>{{ $t('orderDetail.sendShip') }}</th>
              <th>{{ $t('orderDetail.sendFee') }}</th>
            </tr>
          </thead>
        </table>
      </section>

      <section class="od-sec">
        <div class="od-sec__head"><strong>※ {{ $t('orderDetail.unpaid') }}</strong></div>
        <table class="od-grid">
          <thead>
            <tr>
              <th>#</th>
              <th>{{ $t('orderDetail.inputDate') }}</th>
              <th>{{ $t('orderDetail.inputUser') }}</th>
              <th>{{ $t('orderDetail.amount') }}</th>
              <th>{{ $t('orderDetail.depositConfirm') }}</th>
              <th>{{ $t('orderDetail.depositUser') }}</th>
            </tr>
          </thead>
        </table>
      </section>

      <section class="od-sec">
        <div class="od-sec__head"><strong>※ {{ $t('orderDetail.returnInbound') }}</strong></div>
        <table class="od-grid">
          <thead>
            <tr>
              <th>#</th>
              <th>{{ $t('orderDetail.processDate') }}</th>
              <th>{{ $t('orderDetail.inputDate') }}</th>
              <th>{{ $t('orderDetail.inputUser') }}</th>
              <th>{{ $t('orderDetail.sku') }}</th>
              <th>{{ $t('orderDetail.productOption') }}</th>
              <th>{{ $t('orderDetail.qty') }}</th>
              <th>{{ $t('orderDetail.productStatus') }}</th>
              <th>{{ $t('orderDetail.reason') }}</th>
            </tr>
          </thead>
        </table>
      </section>

      <section class="od-sec">
        <div class="od-sec__head"><strong>※ {{ $t('orderDetail.refundInfo') }}</strong></div>
        <table class="od-grid">
          <thead>
            <tr>
              <th>#</th>
              <th>{{ $t('orderDetail.bank') }}</th>
              <th>{{ $t('orderDetail.account') }}</th>
              <th>{{ $t('orderDetail.depositor') }}</th>
              <th>{{ $t('orderDetail.amount') }}</th>
              <th>{{ $t('orderDetail.inputDate') }}</th>
              <th>{{ $t('orderDetail.processDate') }}</th>
              <th>{{ $t('orderDetail.memo') }}</th>
            </tr>
          </thead>
        </table>
      </section>

      <section class="od-sec">
        <div class="od-sec__head">
          <strong>※ {{ $t('orderDetail.wmsMessage') }}</strong>
          <a class="od-link" @click.prevent="onReady">{{ $t('orderDetail.deleteAllMessage') }}</a>
        </div>
        <table class="od-grid">
          <thead>
            <tr>
              <th>#</th>
              <th>{{ $t('orderDetail.inputAt') }}</th>
              <th>{{ $t('orderDetail.inputUser') }}</th>
              <th>{{ $t('orderDetail.wmsMessage') }}</th>
              <th>{{ $t('orderDetail.confirmAt') }}</th>
            </tr>
          </thead>
        </table>
      </section>

      <section class="od-sec">
        <div class="od-sec__head">
          <strong>※ {{ $t('orderDetail.memoInfo') }}</strong>
          <span class="od-flags">
            <a-checkbox>{{ $t('orderDetail.noMemoLog') }}</a-checkbox>
            <a-checkbox>{{ $t('orderDetail.hideMemo') }}</a-checkbox>
          </span>
        </div>
        <table class="od-grid">
          <thead>
            <tr>
              <th>#</th>
              <th>{{ $t('orderDetail.inputAt') }}</th>
              <th>{{ $t('orderDetail.alarmAt') }}</th>
              <th>{{ $t('orderDetail.inputUser') }}</th>
              <th>{{ $t('orderDetail.kind') }}</th>
              <th>{{ $t('field.memoContent') }}</th>
              <th>{{ $t('field.status') }}</th>
              <th>{{ $t('orderDetail.doneAt') }}</th>
              <th>{{ $t('orderDetail.hide') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="memo in order.memos" :key="memo.id">
              <td>{{ memo.no }}</td>
              <td>{{ memo.inputAt }}</td>
              <td>{{ memo.alarmAt }}</td>
              <td>{{ memo.inputUser }}</td>
              <td>{{ $t(`memoType.${memo.memoType}`) }}</td>
              <td class="od-left">{{ memo.content }}</td>
              <td>{{ $t(`memoStatus.${memo.status}`) }}</td>
              <td>{{ memo.doneAt }}</td>
              <td>✉</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section class="od-sec">
        <div class="od-sec__head"><strong>※ {{ $t('orderDetail.photoInfo') }}</strong></div>
        <div class="od-upload">
          <span>{{ $t('orderDetail.fileSelect') }}</span>
          <a-input size="small" disabled :value="$t('orderDetail.noFile')" style="width: 180px" />
          <span>{{ $t('orderDetail.fileDesc') }}</span>
          <a-input size="small" style="width: 280px" />
          <a-button size="small" @click="onReady">{{ $t('common.add') }}</a-button>
        </div>
        <p class="od-hint">{{ $t('orderDetail.photoHint') }}</p>
      </section>
    </div>

    <aside class="od__side">
      <button v-for="key in sideActions" :key="key" type="button" class="od-side-btn" @click="onSideAction(key)">
        <span>{{ $t(`orderDetail.action.${key}`) }}</span>
        <QuestionCircleOutlined />
      </button>
    </aside>
  </div>
</template>

<script setup>
import { computed, getCurrentInstance, onMounted, reactive, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { message } from 'ant-design-vue';
import { createMockOrderDetail } from './orderDetailMock';
import { takeOrderDetailPayload } from './orderDetailPopup';

const { proxy } = getCurrentInstance();
const { t } = useI18n();
const route = useRoute();

defineOptions({ name: 'PgOrderDetail' });

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';
const hideCancel = ref(false);
const hideDone = ref(false);
const order = reactive(createMockOrderDetail());

const sideActions = [
  'refresh',
  'baseChange',
  'splitOrder',
  'newMemo',
  'resetRefund',
  'changeFee',
  'splitQty',
  'changeQty',
  'changeProduct',
  'changeWarehouse',
  'cancelOrder',
  'restoreCancel',
  'changeReqDate',
  'cancelAlloc',
  'reserveInvoice',
  'returnRecv',
  'returnConfirm',
  'returnRecvCancel',
  'exchangeIn',
  'exchangeCollect',
  'exchangeInCancel',
  'exchangeCollectCancel',
  'channelReflect',
  'lostReship',
  'lostToWindow',
  'searchInfo',
  'addProduct',
  'markRed',
  'excludeAlloc',
  'runAlloc',
  'wmsMessage',
  'printSpec',
];

const visibleItems = computed(() =>
  hideCancel.value ? order.items.filter((item) => !item.cancelled) : order.items
);

const itemSum = (key) => visibleItems.value.reduce((sum, item) => sum + (Number(item[key]) || 0), 0);

const pageTitle = computed(() => {
  const name = order.receiver || order.orderer || '';
  return `[${name} ${order.orderNo}]${t('orderDetail.title')}`;
});

const applyOrder = (data) => {
  Object.keys(order).forEach((key) => {
    delete order[key];
  });
  Object.assign(order, data);
};

const loadOrder = async () => {
  const payload = takeOrderDetailPayload(route.query.token);
  const orderNo = route.query.orderNo || payload?.row?.orderNo;

  if (USE_MOCK) {
    applyOrder(createMockOrderDetail(payload?.row || { orderNo }, payload?.memos || []));
    return;
  }

  const result = await proxy.$api.onApiGetOrderDetail(orderNo);
  if (result) applyOrder(result);
};

const onReady = () => {
  message.info(t('common.ready'));
};

const onSideAction = (key) => {
  if (key === 'refresh') {
    loadOrder();
    return;
  }
  onReady();
};

watch(pageTitle, (title) => {
  document.title = title;
}, { immediate: true });

onMounted(() => {
  loadOrder();
});
</script>

<style scoped>
.od {
  display: flex;
  height: 100%;
  background: #fff;
  color: #222;
  font-size: 12px;
}

.od__main {
  flex: 1;
  min-width: 0;
  overflow: auto;
  padding: 8px 10px 16px;
}

.od__side {
  width: 168px;
  flex-shrink: 0;
  border-left: 1px solid #c5d4de;
  padding: 6px 6px 12px;
  overflow: auto;
  background: #f7fafc;
}

.od-kv {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 8px;
}

.od-kv th {
  width: 78px;
  padding: 4px 6px;
  background: #7eacd0;
  color: #fff;
  font-weight: 700;
  text-align: left;
  white-space: nowrap;
  border: 1px solid #fff;
}

.od-kv td {
  padding: 4px 8px;
  border-bottom: 1px solid #e5eef4;
  vertical-align: top;
}

.od-link {
  color: #1e5aa8;
  cursor: pointer;
  margin-left: 4px;
}

.od-link:hover {
  color: #c41d3a;
}

.od-muted {
  color: #888;
}

.od-sec {
  margin-top: 10px;
}

.od-sec__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 26px;
  padding: 2px 6px;
  background: #8eb9d6;
  color: #fff;
  font-weight: 700;
}

.od-sec__head :deep(.ant-checkbox-wrapper) {
  color: #fff;
  font-weight: 500;
}

.od-flags {
  display: flex;
  gap: 10px;
}

.od-sec__btn {
  margin: 6px 0 0;
}

.od-grid {
  width: 100%;
  border-collapse: collapse;
}

.od-grid--order {
  table-layout: fixed;
}

.od-col-no {
  width: 28px;
}

.od-col-kind {
  width: 44px;
}

.od-col-photo,
.od-col-ex {
  width: 40px;
}

.od-col-sku {
  width: 168px;
}

.od-col-color {
  width: 52px;
}

.od-col-size {
  width: 64px;
}

.od-col-date {
  width: 80px;
}

.od-col-req {
  width: 72px;
}

.od-col-wms {
  width: 84px;
}

.od-col-ship {
  width: 58px;
}

.od-col-chno {
  width: 196px;
}

.od-grid th,
.od-grid td {
  border: 1px solid #c5d8ea;
  padding: 3px 4px;
  text-align: center;
}

.od-grid--order th,
.od-grid--order td {
  overflow: hidden;
}

.od-nowrap {
  white-space: nowrap;
}

.od-grid th {
  background: #d6e7f5;
  color: #1e4e79;
  font-weight: 700;
}

.od-left {
  text-align: left;
}

.ht-right {
  text-align: right;
}

.c-danger {
  color: #c41d3a;
  font-weight: 700;
}

.is-cancel td {
  color: #d46b08;
}

.od-total td {
  background: #f3f6f8;
  font-weight: 700;
}

.od-photo {
  display: inline-block;
  width: 28px;
  height: 28px;
  background: #e8e8e8;
  border: 1px solid #ccc;
}

.od-item-memo {
  color: #7b00ff;
  font-size: 11px;
  text-align: right;
}

.od-upload {
  display: flex;
 mar-items: center;
  gap: 8px;
  padding: 8px 4px;
}

.od-hint {
  margin: 0;
  color: #c41d3a;
  font-size: 11px;
}

.od-side-btn {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  margin-bottom: 3px;
  padding: 3px 6px;
  border: 1px solid #9bb8d3;
  background: #fff;
  color: #1e4e79;
  font-size: 11px;
  text-align: left;
  cursor: pointer;
}

.od-side-btn:hover {
  background: #e8f1f8;
}
</style>
