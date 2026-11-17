<template>
  <div class="dash-page">
    <div class="dash-toolbar">
      <div class="dash-toolbar__title">※ [{{ warehouseName }}] {{ $t('dash.outboundStatus') }}</div>
      <span class="wms-search__label">{{ $t('field.allocDate') }}</span>
      <a-date-picker
        v-model:value="search.startDate"
        size="small"
        format="YYYYMMDD"
        :allow-clear="false"
        style="width: 130px"
      />
      <span class="dash-toolbar__tilde">~</span>
      <a-date-picker
        v-model:value="search.endDate"
        size="small"
        format="YYYYMMDD"
        :allow-clear="false"
        style="width: 130px"
      />
      <div class="dash-toolbar__actions">
        <a-button size="small" @click="onSearch">
          <template #icon><SearchOutlined /></template>
          {{ $t('common.search') }}
        </a-button>
      </div>
      <div class="dash-toolbar__utils">
        <a-tooltip :title="$t('common.excelDownload')">
          <button type="button" class="dash-icon-btn dash-icon-btn--excel" @click="onExcel">
            <FileExcelOutlined />
          </button>
        </a-tooltip>
        <a-tooltip :title="$t('common.reset')">
          <button type="button" class="dash-icon-btn" @click="onReset">
            <UndoOutlined />
          </button>
        </a-tooltip>
        <a-tooltip :title="$t('common.openNewWindow')">
          <button type="button" class="dash-icon-btn" @click="onOpenWindow">
            <DesktopOutlined />
          </button>
        </a-tooltip>
        <a-tooltip :title="$t('common.printPreview')">
          <button type="button" class="dash-icon-btn" @click="onPrint">
            <PrinterOutlined />
          </button>
        </a-tooltip>
        <a-tooltip :title="$t('common.help')">
          <button type="button" class="dash-icon-btn" @click="onHelp">
            <QuestionCircleOutlined />
          </button>
        </a-tooltip>
      </div>
    </div>

    <div class="dash-status-wrap">
      <table class="dash-status">
        <thead>
          <tr>
            <th rowspan="2">{{ $t('field.allocDate') }}</th>
            <th rowspan="2">{{ $t('dash.packType') }}</th>
            <th colspan="6">{{ $t('dash.orderCount') }}</th>
            <th colspan="7">{{ $t('dash.itemCount') }}</th>
          </tr>
          <tr>
            <th>{{ $t('dash.demand') }}</th>
            <th>{{ $t('dash.printed') }}</th>
            <th>{{ $t('dash.unprinted') }}</th>
            <th>{{ $t('dash.confirmed') }}</th>
            <th>{{ $t('dash.unconfirmed') }}</th>
            <th>{{ $t('dash.unclosed') }}</th>
            <th>{{ $t('dash.demand') }}</th>
            <th>{{ $t('dash.printed') }}</th>
            <th>{{ $t('dash.unprinted') }}</th>
            <th>{{ $t('dash.scanned') }}</th>
            <th>{{ $t('dash.unscanned') }}</th>
            <th>{{ $t('dash.confirmed') }}</th>
            <th>{{ $t('dash.unconfirmed') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, index) in statusRows" :key="`${row.allocDate}-${row.packType}-${index}`">
            <td>{{ row.allocDate }}</td>
            <td>{{ packLabel(row.packType) }}</td>
            <td class="is-num">{{ $cf.fncComma(row.orderDemand) }}</td>
            <td class="is-num">{{ $cf.fncComma(row.orderPrinted) }}</td>
            <td class="is-num is-muted">{{ $cf.fncComma(row.orderUnprinted) }}</td>
            <td class="is-num">{{ $cf.fncComma(row.orderConfirmed) }}</td>
            <td class="is-num is-muted">{{ $cf.fncComma(row.orderUnconfirmed) }}</td>
            <td class="is-num">{{ $cf.fncComma(row.orderUnclosed) }}</td>
            <td class="is-num">{{ $cf.fncComma(row.itemDemand) }}</td>
            <td class="is-num">{{ $cf.fncComma(row.itemPrinted) }}</td>
            <td class="is-num is-alert">{{ $cf.fncComma(row.itemUnprinted) }}</td>
            <td class="is-num is-alert">{{ $cf.fncComma(row.itemScanned) }}</td>
            <td class="is-num">{{ $cf.fncComma(row.itemUnscanned) }}</td>
            <td class="is-num is-alert">{{ $cf.fncComma(row.itemConfirmed) }}</td>
            <td class="is-num is-muted">{{ $cf.fncComma(row.itemUnconfirmed) }}</td>
          </tr>
          <tr v-if="!statusRows.length">
            <td colspan="15" class="dash-status__empty">{{ $t('common.noData') }}</td>
          </tr>
        </tbody>
      </table>
      <p class="dash-hint">* {{ $t('dash.unconfirmedHint') }}</p>
    </div>

    <div class="dash-ranks">
      <div class="dash-rank">
        <table>
          <thead>
            <tr>
              <th colspan="4" class="dash-rank__title">{{ $t('dash.bestChannel') }}</th>
            </tr>
            <tr>
              <th>{{ $t('field.seq') }}</th>
              <th>{{ $t('field.channel') }}</th>
              <th>{{ $t('field.qty') }}</th>
              <th>{{ $t('field.amount') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in channels" :key="`ch-${row.seq}`">
              <td class="is-seq">{{ row.seq }}</td>
              <td class="is-name">{{ row.name }}</td>
              <td class="is-num">{{ $cf.fncComma(row.qty) }}</td>
              <td class="is-num">{{ $cf.fncComma(row.amount) }}</td>
            </tr>
            <tr v-if="!channels.length">
              <td colspan="4" class="dash-status__empty">{{ $t('common.noData') }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="dash-rank">
        <table>
          <thead>
            <tr>
              <th colspan="4" class="dash-rank__title">{{ $t('dash.bestBrand') }}</th>
            </tr>
            <tr>
              <th>{{ $t('field.seq') }}</th>
              <th>{{ $t('field.brandName') }}</th>
              <th>{{ $t('field.qty') }}</th>
              <th>{{ $t('field.amount') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in brands" :key="`br-${row.seq}`">
              <td class="is-seq">{{ row.seq }}</td>
              <td class="is-name">{{ row.name }}</td>
              <td class="is-num">{{ $cf.fncComma(row.qty) }}</td>
              <td class="is-num">{{ $cf.fncComma(row.amount) }}</td>
            </tr>
            <tr v-if="!brands.length">
              <td colspan="4" class="dash-status__empty">{{ $t('common.noData') }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, getCurrentInstance, onMounted, reactive, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { Modal, message } from 'ant-design-vue';
import dayjs from 'dayjs';
import commonFunction from '@/common/utils/commonFunction';
import { useAppStore } from '@/store/appStore';
import { getMockDashboard } from './dashboardMock';

const { proxy } = getCurrentInstance();
const { t } = useI18n();
const appStore = useAppStore();

defineOptions({ name: 'PgDashboard' });

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';
const statusRows = ref([]);
const channels = ref([]);
const brands = ref([]);

const search = reactive({
  startDate: dayjs(),
  endDate: dayjs(),
});

const warehouseName = computed(() => appStore.currentWarehouse?.name || t('common.warehouse'));

const packLabel = (packType) => {
  if (packType === 'together') return t('dash.packTogether');
  if (packType === 'single') return t('dash.packSingle');
  if (packType === 'total') return t('dash.packTotal');
  return packType;
};

const toYmd = (value) => value?.format?.('YYYYMMDD') || dayjs().format('YYYYMMDD');

const searchRange = () => {
  const start = toYmd(search.startDate);
  const end = toYmd(search.endDate);
  return start <= end ? { startDate: start, endDate: end } : { startDate: end, endDate: start };
};

const applyResult = (result) => {
  statusRows.value = result?.statusRows || [];
  channels.value = result?.channels || [];
  brands.value = result?.brands || [];
};

const onSearch = async () => {
  const range = searchRange();
  if (USE_MOCK) {
    applyResult(getMockDashboard(range));
    return;
  }

  const result = await proxy.$api.onApiQueryDashboardSummary({
    ...range,
    warehouseCode: appStore.currentWarehouse?.code,
  });
  applyResult(result || {});
};

const onReset = () => {
  search.startDate = dayjs();
  search.endDate = dayjs();
  onSearch();
};

const onExcel = () => {
  const rows = statusRows.value.map((row) => ({
    allocDate: row.allocDate,
    packType: packLabel(row.packType),
    orderDemand: row.orderDemand,
    orderPrinted: row.orderPrinted,
    orderUnprinted: row.orderUnprinted,
    orderConfirmed: row.orderConfirmed,
    orderUnconfirmed: row.orderUnconfirmed,
    orderUnclosed: row.orderUnclosed,
    itemDemand: row.itemDemand,
    itemPrinted: row.itemPrinted,
    itemUnprinted: row.itemUnprinted,
    itemScanned: row.itemScanned,
    itemUnscanned: row.itemUnscanned,
    itemConfirmed: row.itemConfirmed,
    itemUnconfirmed: row.itemUnconfirmed,
  }));
  if (!rows.length) {
    message.warning(t('common.noData'));
    return;
  }
  commonFunction.fncExportExcel(
    rows,
    [
      { title: t('field.allocDate'), dataIndex: 'allocDate' },
      { title: t('dash.packType'), dataIndex: 'packType' },
      { title: `${t('dash.orderCount')} ${t('dash.demand')}`, dataIndex: 'orderDemand' },
      { title: `${t('dash.orderCount')} ${t('dash.printed')}`, dataIndex: 'orderPrinted' },
      { title: `${t('dash.orderCount')} ${t('dash.unprinted')}`, dataIndex: 'orderUnprinted' },
      { title: `${t('dash.orderCount')} ${t('dash.confirmed')}`, dataIndex: 'orderConfirmed' },
      { title: `${t('dash.orderCount')} ${t('dash.unconfirmed')}`, dataIndex: 'orderUnconfirmed' },
      { title: `${t('dash.orderCount')} ${t('dash.unclosed')}`, dataIndex: 'orderUnclosed' },
      { title: `${t('dash.itemCount')} ${t('dash.demand')}`, dataIndex: 'itemDemand' },
      { title: `${t('dash.itemCount')} ${t('dash.printed')}`, dataIndex: 'itemPrinted' },
      { title: `${t('dash.itemCount')} ${t('dash.unprinted')}`, dataIndex: 'itemUnprinted' },
      { title: `${t('dash.itemCount')} ${t('dash.scanned')}`, dataIndex: 'itemScanned' },
      { title: `${t('dash.itemCount')} ${t('dash.unscanned')}`, dataIndex: 'itemUnscanned' },
      { title: `${t('dash.itemCount')} ${t('dash.confirmed')}`, dataIndex: 'itemConfirmed' },
      { title: `${t('dash.itemCount')} ${t('dash.unconfirmed')}`, dataIndex: 'itemUnconfirmed' },
    ],
    `${t('dash.outboundStatus')}_${searchRange().startDate}_${searchRange().endDate}.xlsx`
  );
};

const onOpenWindow = () => {
  window.open(window.location.href, '_blank', 'noopener,noreferrer,width=1280,height=800');
};

const onPrint = () => window.print();

const onHelp = () => {
  Modal.info({
    title: t('common.help'),
    content: t('message.dashboardHelp'),
    okText: t('common.confirm'),
  });
};

onMounted(() => {
  onSearch();
});
</script>

<style scoped>
.dash-page {
  display: flex;
  flex-direction: column;
  height: calc(
    100vh - var(--wms-gnb-height) - var(--wms-userbar-height) - var(--wms-tabbar-height) -
      var(--wms-footer-height) - 36px
  );
  background: #fff;
  overflow: hidden;
}

.dash-toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 36px;
  padding: 4px 10px;
  border-bottom: 1px solid var(--wms-border);
  background: #f7f8fa;
}

.dash-toolbar__title {
  font-size: 13px;
  font-weight: 700;
  color: #1e4e79;
  white-space: nowrap;
}

.dash-toolbar__tilde {
  color: #1e4e79;
  font-weight: 700;
}

.dash-toolbar__actions {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-left: auto;
}

.dash-toolbar__utils {
  display: flex;
  align-items: center;
  gap: 2px;
  margin-left: 8px;
  padding-left: 8px;
  border-left: 1px solid var(--wms-border);
}

.dash-icon-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 24px;
  padding: 0;
  border: 0;
  border-radius: 3px;
  background: transparent;
  color: #3d6d99;
  font-size: 15px;
  cursor: pointer;
}

.dash-icon-btn:hover {
  background: #e8f1f8;
}

.dash-icon-btn--excel {
  color: #217346;
}

.dash-status-wrap {
  padding: 8px 10px 0;
}

.dash-status {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
  font-size: 12px;
}

.dash-status th,
.dash-status td {
  border: 1px solid #c5d8ea;
  padding: 3px 6px;
  text-align: center;
  white-space: nowrap;
}

.dash-status th {
  background: #d6e7f5;
  color: #1e4e79;
  font-weight: 700;
}

.dash-status td.is-num {
  color: #1a5fb4;
  text-align: right;
}

.dash-status td.is-muted {
  color: #8a8a8a;
}

.dash-status td.is-alert {
  color: #c62828;
  font-weight: 700;
}

.dash-status__empty {
  padding: 16px 8px;
  color: var(--wms-text-sub);
}

.dash-hint {
  margin: 6px 0 8px;
  color: #1e4e79;
  font-size: 12px;
}

.dash-ranks {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  flex: 1;
  min-height: 0;
  padding: 0 10px 10px;
  overflow: auto;
  align-items: start;
}

.dash-rank table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
}

.dash-rank th,
.dash-rank td {
  border: 1px solid #c5d8ea;
  padding: 3px 8px;
  white-space: nowrap;
}

.dash-rank th {
  background: #d6e7f5;
  color: #1e4e79;
  font-weight: 700;
  text-align: center;
}

.dash-rank__title {
  background: #c5dcf0;
}

.dash-rank td.is-seq {
  width: 48px;
  color: #1a5fb4;
  text-align: center;
}

.dash-rank td.is-name {
  text-align: left;
}

.dash-rank td.is-num {
  width: 110px;
  color: #1a5fb4;
  text-align: right;
}

@media print {
  .dash-toolbar {
    display: none;
  }

  .dash-page {
    height: auto;
    overflow: visible;
  }

  .dash-ranks {
    overflow: visible;
  }
}
</style>
