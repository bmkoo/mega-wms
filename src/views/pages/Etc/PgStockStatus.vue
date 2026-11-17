<template>
  <div class="wms-page">
    <!-- 조회 조건 -->
    <div class="wms-search">
      <span class="wms-search__label">{{ $t('field.warehouse') }}</span>
      <a-select
        :value="appStore.currentWarehouse?.code"
        :options="appStore.warehouseOptions"
        size="small"
        style="width: 170px"
        @change="appStore.setWarehouse"
      />

      <span class="wms-search__label">{{ $t('field.zone') }}</span>
      <a-select v-model:value="search.zone" :options="zoneOptions" size="small" style="width: 120px" />

      <span class="wms-search__label">{{ $t('field.status') }}</span>
      <a-select
        v-model:value="search.stockType"
        :options="stockTypeOptions"
        size="small"
        style="width: 130px"
      />

      <span class="wms-search__label">{{ $t('common.keyword') }}</span>
      <a-input
        v-model:value="search.keyword"
        size="small"
        style="width: 200px"
        allow-clear
        :placeholder="`${$t('field.sku')} / ${$t('field.productName')} / ${$t('field.lot')}`"
        @press-enter="onSearch"
      />

      <a-checkbox v-model:checked="search.hideZero">{{ $t('field.hideZero') }}</a-checkbox>

      <div class="flex-1" />

      <a-button type="primary" size="small" @click="onSearch">
        <template #icon><SearchOutlined /></template>
        {{ $t('common.search') }}
      </a-button>
    </div>

    <!-- 목록 -->
    <div class="wms-panel">
      <div class="wms-panel__head">
        <span>
          {{ $t('common.total') }}
          <b class="c-primary">{{ $cf.fncComma(rows.length) }}</b>
          / {{ $t('common.total') }} QTY
          <b class="c-primary">{{ $cf.fncComma(totalQty) }}</b>
        </span>
        <div class="d-flex gap-4">
          <a-button size="small" @click="onSearch">
            <template #icon><ReloadOutlined /></template>
            {{ $t('common.refresh') }}
          </a-button>
          <a-button size="small" @click="onExcel">
            <template #icon><FileExcelOutlined /></template>
            {{ $t('common.excel') }}
          </a-button>
        </div>
      </div>

      <a-table
        :columns="columns"
        :data-source="rows"
        :loading="loading"
        :pagination="{ pageSize: 50, size: 'small', showSizeChanger: true }"
        :scroll="{ x: 1080, y: 'calc(100vh - 420px)' }"
        size="small"
        row-key="key"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.dataIndex === 'stockType'">
            <a-tag :color="STATUS_COLOR[record.stockType]">{{ record.stockType }}</a-tag>
          </template>
          <template v-else-if="['qty', 'allocQty', 'availQty'].includes(column.dataIndex)">
            {{ $cf.fncComma(record[column.dataIndex]) }}
          </template>
          <template v-else-if="column.dataIndex === 'expireDate'">
            <span :class="{ 'c-danger': isNearExpire(record.expireDate) }">
              {{ record.expireDate }}
            </span>
          </template>
        </template>
      </a-table>
    </div>
  </div>
</template>

<script setup>
import { computed, getCurrentInstance, onMounted, reactive, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { message } from 'ant-design-vue';
import dayjs from 'dayjs';
import { useAppStore } from '@/store/appStore';
import { STATUS_COLOR, STOCK_TYPE } from '@/views/components/fnc';
import commonFunction from '@/common/utils/commonFunction';

const { proxy } = getCurrentInstance();
const { t } = useI18n();
const appStore = useAppStore();

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

const loading = ref(false);
const rows = ref([]);

const search = reactive({
  zone: '',
  stockType: '',
  keyword: '',
  hideZero: true,
});

const zoneOptions = computed(() => [
  { value: '', label: t('common.all') },
  ...['A', 'B', 'C', 'D'].map((zone) => ({ value: zone, label: `${zone} ZONE` })),
]);

const stockTypeOptions = computed(() => [
  { value: '', label: t('common.all') },
  ...Object.values(STOCK_TYPE).map((value) => ({ value, label: value })),
]);

const columns = computed(() => [
  { title: t('field.sku'), dataIndex: 'sku', width: 120, fixed: 'left' },
  { title: t('field.productName'), dataIndex: 'productName', ellipsis: true },
  { title: t('field.location'), dataIndex: 'location', width: 130 },
  { title: t('field.lot'), dataIndex: 'lot', width: 120 },
  { title: t('field.expireDate'), dataIndex: 'expireDate', width: 110, align: 'center' },
  { title: t('field.status'), dataIndex: 'stockType', width: 100, align: 'center' },
  { title: t('field.stockQty'), dataIndex: 'qty', width: 90, align: 'right' },
  { title: t('field.allocQty'), dataIndex: 'allocQty', width: 90, align: 'right' },
  { title: t('field.availQty'), dataIndex: 'availQty', width: 90, align: 'right' },
]);

const totalQty = computed(() => rows.value.reduce((sum, row) => sum + (row.qty || 0), 0));

const isNearExpire = (date) => !!date && dayjs(date).diff(dayjs(), 'day') <= 30;

/** 서버가 없을 때 화면 확인용 데이터 */
const mockRows = () => {
  const types = Object.values(STOCK_TYPE);
  const zones = ['A', 'B', 'C', 'D'];
  return Array.from({ length: 120 }, (_, i) => {
    const qty = ((i * 173) % 900) + (search.hideZero ? 1 : 0);
    const alloc = Math.floor(qty * 0.2);
    return {
      key: `stock-${i}`,
      sku: `SKU-${1000 + i}`,
      productName: `샘플 상품 ${i + 1}`,
      location: `${zones[i % 4]}-${String((i % 12) + 1).padStart(2, '0')}-${String((i % 5) + 1).padStart(2, '0')}`,
      lot: `LOT${dayjs().format('YYMM')}${String(i % 30).padStart(2, '0')}`,
      expireDate: dayjs().add((i % 12) * 10, 'day').format('YYYY-MM-DD'),
      stockType: types[i % types.length],
      qty,
      allocQty: alloc,
      availQty: qty - alloc,
    };
  });
};

const onSearch = async () => {
  loading.value = true;

  if (USE_MOCK) {
    rows.value = mockRows().filter((row) => {
      if (search.zone && !row.location.startsWith(search.zone)) return false;
      if (search.stockType && row.stockType !== search.stockType) return false;
      if (search.hideZero && row.qty <= 0) return false;
      if (search.keyword) {
        const word = search.keyword.toLowerCase();
        return `${row.sku}${row.productName}${row.lot}`.toLowerCase().includes(word);
      }
      return true;
    });
  } else {
    const result = await proxy.$api.onApiQueryStock({
      warehouseCode: appStore.currentWarehouse?.code,
      zone: search.zone,
      stockType: search.stockType,
      keyword: search.keyword,
      hideZero: search.hideZero,
    });
    rows.value = (result?.content || result || []).map((row, index) => ({
      key: row.id ?? index,
      ...row,
    }));
  }

  loading.value = false;
};

const onExcel = () => {
  if (!rows.value.length) {
    message.warning(t('common.noData'));
    return;
  }
  commonFunction.fncExportExcel(
    rows.value,
    columns.value,
    `${t('menu.stockStatus')}_${dayjs().format('YYYYMMDD')}.xlsx`
  );
};

onMounted(onSearch);
</script>
