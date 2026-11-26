<template>
  <div class="order-transfer-page">
    <div class="order-transfer-toolbar">
      <div class="order-transfer-toolbar__title">※ {{ $t('menu.orderTransfer') }}</div>
      <div class="order-transfer-toolbar__actions">
        <a-button size="small" :loading="orderLoading" @click="onSearch">
          <template #icon><SearchOutlined /></template>
          {{ $t('common.search') }}
        </a-button>
        <a-button size="small" @click="toggleSearchPanel">
          <template #icon>
            <UpOutlined v-if="searchPanelOpen" />
            <DownOutlined v-else />
          </template>
          {{ searchPanelOpen ? $t('common.collapseSearch') : $t('common.expandSearch') }}
        </a-button>
      </div>
      <div class="order-transfer-toolbar__utils">
        <a-tooltip :title="$t('common.excelDownload')">
          <button type="button" class="order-transfer-icon-btn order-transfer-icon-btn--excel" @click="onExcel">
            <FileExcelOutlined />
          </button>
        </a-tooltip>
        <a-tooltip :title="$t('common.reset')">
          <button type="button" class="order-transfer-icon-btn" @click="onReset">
            <UndoOutlined />
          </button>
        </a-tooltip>
        <a-tooltip :title="$t('common.openNewWindow')">
          <button type="button" class="order-transfer-icon-btn" @click="onOpenWindow">
            <DesktopOutlined />
          </button>
        </a-tooltip>
        <a-tooltip :title="$t('common.printPreview')">
          <button type="button" class="order-transfer-icon-btn" @click="onPrint">
            <PrinterOutlined />
          </button>
        </a-tooltip>
      </div>
    </div>

    <!-- 조회 조건: 서버(GET /api/v1/orderList) 에서 처리한다 -->
    <div v-show="searchPanelOpen" class="order-transfer-search">
      <div class="order-transfer-search__grid">
        <div class="order-transfer-search__item">
          <span class="order-transfer-search__label">{{ $t('field.orderNo') }}</span>
          <a-input v-model:value="search.orderNo" size="small" allow-clear @press-enter="onSearch" />
        </div>
        <div class="order-transfer-search__item">
          <span class="order-transfer-search__label" :title="$t('field.channelId')">{{ $t('field.channelId') }}</span>
          <!-- 판매처는 서버에서 정확히 일치로 찾으므로, 실제 주문에 있는 판매처 목록에서 고른다 -->
          <a-select
            v-model:value="search.channelId"
            :options="channelOptions"
            size="small"
            show-search
            class="flex-1"
            @change="onSearch"
          />
        </div>
        <div class="order-transfer-search__item">
          <span class="order-transfer-search__label">{{ $t('field.ordererNm') }}</span>
          <a-input v-model:value="search.ordererNm" size="small" allow-clear @press-enter="onSearch" />
        </div>
        <div class="order-transfer-search__item">
          <span class="order-transfer-search__label">{{ $t('field.receiverNm') }}</span>
          <a-input v-model:value="search.receiverNm" size="small" allow-clear @press-enter="onSearch" />
        </div>
        <div class="order-transfer-search__item">
          <span class="order-transfer-search__label">{{ $t('field.orderDate') }}</span>
          <a-range-picker v-model:value="search.orderDate" size="small" format="YYYY-MM-DD" class="flex-1" />
        </div>
      </div>
      <div class="order-transfer-search__row">
        <a-select
          v-model:value="view.pageSize"
          :options="pageSizeOptions"
          size="small"
          style="width: 110px"
          @change="onPageSizeChange"
        />
        <div class="flex-1" />
        <span class="wms-search__label">{{ $t('field.sort') }}</span>
        <a-select v-model:value="view.sort1" :options="sortOptions" size="small" style="width: 150px" @change="onSortChange" />
        <a-select v-model:value="view.sort2" :options="sortOptions" size="small" style="width: 150px" @change="onSortChange" />
      </div>
    </div>

    <!-- 왼쪽: 주문(TB_ORDER) / 오른쪽: 선택한 주문의 상품 명세(TB_ORDER_ITEM)
         그리드 영역(.order-transfer-grid)이 화면 남은 높이를 채우고, 그 높이를 ResizeObserver 로 그리드에 넣는다 -->
    <div class="order-transfer-body">
      <div class="order-transfer-panel order-transfer-panel--orders">
        <div class="order-transfer-panel__title">
          {{ $t('menu.order') }}
          <span class="order-transfer-panel__count">{{ $t('common.totalItems', { n: $cf.fncComma(page.total) }) }}</span>
        </div>
        <div ref="orderWrapRef" class="order-transfer-grid ht-theme-main">
          <div ref="orderHostRef" v-once />
          <div v-if="orderLoading" class="order-transfer-loading"><a-spin /></div>
        </div>
      </div>

      <div class="order-transfer-panel order-transfer-panel--items">
        <div class="order-transfer-panel__title">
          {{ $t('menu.orderItem') }}
          <template v-if="selectedOrder">
            <span class="order-transfer-panel__order">{{ selectedOrder.orderNo }}</span>
            <span class="order-transfer-panel__count">{{ $t('common.totalItems', { n: $cf.fncComma(items.length) }) }}</span>
          </template>
          <span v-else class="order-transfer-panel__hint">{{ $t('message.selectOrder') }}</span>
        </div>
        <div ref="itemWrapRef" class="order-transfer-grid ht-theme-main">
          <div ref="itemHostRef" v-once />
          <div v-if="itemLoading" class="order-transfer-loading"><a-spin /></div>
        </div>
      </div>
    </div>

    <div class="order-transfer-pager">
      <div class="order-transfer-pager__nav">
        <button type="button" :disabled="page.current <= 1" @click="goPage(1)">«</button>
        <button type="button" :disabled="page.current <= 1" @click="goPage(page.current - 1)">‹</button>
        <button
          v-for="n in pageNumbers"
          :key="n"
          type="button"
          :class="{ 'is-active': n === page.current }"
          @click="goPage(n)"
        >
          {{ n }}
        </button>
        <button type="button" :disabled="page.current >= page.totalPages" @click="goPage(page.current + 1)">›</button>
        <button type="button" :disabled="page.current >= page.totalPages" @click="goPage(page.totalPages)">»</button>
      </div>
      <span class="order-transfer-pager__total">{{ $t('common.totalItems', { n: $cf.fncComma(page.total) }) }}</span>
    </div>
  </div>
</template>

<script setup>
/**
 * 이관 주문 조회 — 데이터이관(주문원본 → TB_ORDER / TB_ORDER_ITEM) 결과를 본다.
 * 왼쪽 주문을 클릭하면 오른쪽에 그 주문의 상품 명세(주문 품목)가 나온다.
 *   주문:      apiFunctions.onApiGetOrder(params)          → GET v1/orderList     (조건은 서버에서 처리)
 *   주문 품목: apiFunctions.onApiGetOrderItem({ orderId })  → GET v1/orderItemList (orderId 로 서버에서 거름)
 */
import { computed, getCurrentInstance, markRaw, nextTick, onActivated, onBeforeUnmount, onMounted, reactive, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { message } from 'ant-design-vue';
import dayjs from 'dayjs';
import Handsontable from 'handsontable';
import 'handsontable/styles/handsontable.css';
import 'handsontable/styles/ht-theme-main.css';
import commonFunction from '@/common/utils/commonFunction';

const { proxy } = getCurrentInstance();
const { t } = useI18n();

defineOptions({ name: 'PgOrderTransfer' });

/** 주문 그리드 컬럼 (헤더는 i18n field.<data>) */
const ORDER_COLUMNS = [
  { data: 'orderId', type: 'id', className: 'htRight', width: 70 },
  { data: 'orderNo', width: 150 },
  { data: 'channelId', width: 90 },
  { data: 'orderDate', type: 'date', className: 'htCenter', width: 95 },
  { data: 'ordererNm', width: 80 },
  { data: 'receiverNm', width: 80 },
  { data: 'orderCount', type: 'number', className: 'htRight', width: 70 }, // 주문건수 = 품목 행 수
  { data: 'itemCount', type: 'number', className: 'htRight', width: 70 }, // 상품건수 = 품목 QTY 합계
  { data: 'paidAmount', type: 'number', className: 'htRight', width: 90 },
  { data: 'billAmount', type: 'number', className: 'htRight', width: 90 },
  { data: 'hpNo', className: 'htCenter', width: 110 },
  { data: 'address1', width: 220 },
  { data: 'memo', width: 160 },
];

/** 주문 품목(상품 명세) 그리드 컬럼 */
const ITEM_COLUMNS = [
  { data: 'lineNo', type: 'id', className: 'htCenter', width: 55 },
  { data: 'lineNoSub', type: 'id', className: 'htCenter', width: 70 }, // 포장단위순서 (TB_ORDER_ITEM.LINE_NO_SUB)
  { data: 'productCd', width: 110 },
  { data: 'productNm', width: 240 },
  { data: 'qty', type: 'number', className: 'htRight', width: 60 },
  { data: 'recipientNm', width: 80 },
  { data: 'isAssign', className: 'htCenter', width: 70 },
  { data: 'deliveryStatus', className: 'htCenter', width: 80 },
  { data: 'shippingNo', width: 110 },
];

const DEFAULT_SEARCH = { orderNo: '', channelId: '', ordererNm: '', receiverNm: '', orderDate: null };
const search = reactive({ ...DEFAULT_SEARCH });
const DEFAULT_VIEW = { pageSize: 20, sort1: 'orderId:desc', sort2: '' };
const view = reactive({ ...DEFAULT_VIEW });
const page = reactive({ current: 1, total: 0, totalPages: 1 });
const searchPanelOpen = ref(true);

const orderWrapRef = ref(null);
const itemWrapRef = ref(null);
const orderHostRef = ref(null);
const itemHostRef = ref(null);
const orders = ref([]);
/** 판매처 선택 목록: 조건 없이 조회했을 때 주문에 나온 판매처들 (첫 항목 '전체' = 값 없음) */
const channels = ref([]);
const channelOptions = computed(() => [
  { value: '', label: t('common.all') },
  ...channels.value.map((name) => ({ value: name, label: name })),
]);
const sortOptions = computed(() => [
  { value: '', label: '-' },
  ...ORDER_COLUMNS.flatMap((column) => [
    { value: `${column.data}:asc`, label: `${t(`field.${column.data}`)} ↑` },
    { value: `${column.data}:desc`, label: `${t(`field.${column.data}`)} ↓` },
  ]),
]);
const pageSizeOptions = computed(() =>
  [20, 50, 100, 500, 1000].map((n) => ({ value: n, label: t('common.perPage', { n }) }))
);
const pageNumbers = computed(() => {
  const start = Math.floor((page.current - 1) / 10) * 10 + 1;
  const end = Math.min(start + 9, page.totalPages);
  return Array.from({ length: end - start + 1 }, (_, index) => start + index);
});
const items = ref([]);
const selectedOrder = ref(null);
const orderLoading = ref(false);
const itemLoading = ref(false);

let orderHot = null;
let itemHot = null;
/** 품목 조회 순번. 빠르게 여러 주문을 클릭했을 때 마지막 클릭의 결과만 그린다 */
let itemRequestSeq = 0;

// ─────────────────────────────────────────────
// 셀 표시
// ─────────────────────────────────────────────
const textRenderer = (format) =>
  function (instance, td, row, col, prop, value, cellProperties) {
    Handsontable.renderers.TextRenderer.apply(this, [instance, td, row, col, prop, format(value), cellProperties]);
  };

/** 숫자는 1000 단위 콤마, 날짜는 YYYY-MM-DD (서버 값은 ISO 문자열 또는 배열) */
const rendererOf = (c) => {
  if (c.type === 'number') return textRenderer((v) => commonFunction.fncComma(v));
  if (c.type === 'date') {
    return textRenderer((v) => {
      if (v === null || v === undefined || v === '') return '';
      const d = Array.isArray(v) ? dayjs(new Date(v[0], (v[1] || 1) - 1, v[2] || 1)) : dayjs(v);
      return d.isValid() ? d.format('YYYY-MM-DD') : String(v);
    });
  }
  return undefined;
};

const gridSettings = (columns) => ({
  themeName: 'ht-theme-main',
  data: [],
  colHeaders: columns.map((c) => t(`field.${c.data}`)),
  columns: columns.map((c) => ({ data: c.data, className: c.className || '', readOnly: true, renderer: rendererOf(c) })),
  colWidths: columns.map((c) => c.width),
  width: '100%',
  height: 300,
  rowHeaders: false,
  fixedColumnsStart: 3,
  readOnly: true,
  fillHandle: false,
  manualColumnResize: true,
  autoRowSize: false,
  autoColumnSize: false,
  currentRowClassName: 'is-current-row',
  licenseKey: 'non-commercial-and-evaluation',
});

const getHot = (hot) => (hot && !hot.isDestroyed ? hot : null);

// ─────────────────────────────────────────────
// 조회
// ─────────────────────────────────────────────
/** 화면 조건 → 서버 파라미터 (OrderService.buildPredicate 의 키). 날짜는 YYYY-MM-DD */
const toParams = () => {
  const params = {};
  ['orderNo', 'channelId', 'ordererNm', 'receiverNm'].forEach((key) => {
    const value = String(search[key] || '').trim();
    if (value) params[key] = value;
  });
  if (search.orderDate?.[0]) params.orderDateFrom = search.orderDate[0].format('YYYY-MM-DD');
  if (search.orderDate?.[1]) params.orderDateTo = search.orderDate[1].format('YYYY-MM-DD');
  return params;
};

const clearItems = () => {
  itemRequestSeq += 1;
  selectedOrder.value = null;
  items.value = [];
  getHot(itemHot)?.loadData([]);
};

/** 서버 날짜 값(ISO 문자열 / 배열) → 'YYYY-MM-DD' (비교용). 없으면 '' */
const toDay = (value) => {
  if (value === null || value === undefined || value === '') return '';
  const d = Array.isArray(value) ? dayjs(new Date(value[0], (value[1] || 1) - 1, value[2] || 1)) : dayjs(value);
  return d.isValid() ? d.format('YYYY-MM-DD') : '';
};

const contains = (value, keyword) => String(value ?? '').toLowerCase().includes(keyword.toLowerCase());

/**
 * 받은 주문을 화면 조건으로 한 번 더 거른다. 서버(OrderService.buildPredicate)와 같은 규칙이라
 * 서버가 조건을 처리하면 결과가 그대로이고, 처리하지 않을 때(재시작 전 등)도 검색이 동작한다.
 *   주문번호·주문자·수령자 = 부분 일치, 판매처 = 정확히 일치, 주문일 = 기간(시작일 ~ 종료일 포함)
 */
const filterOrders = (rows, params) =>
  rows.filter((row) => {
    if (params.orderNo && !contains(row.orderNo, params.orderNo)) return false;
    if (params.channelId && String(row.channelId ?? '') !== params.channelId) return false;
    if (params.ordererNm && !contains(row.ordererNm, params.ordererNm)) return false;
    if (params.receiverNm && !contains(row.receiverNm, params.receiverNm)) return false;
    if (params.orderDateFrom || params.orderDateTo) {
      const day = toDay(row.orderDate);
      if (!day) return false;
      if (params.orderDateFrom && day < params.orderDateFrom) return false;
      if (params.orderDateTo && day > params.orderDateTo) return false;
    }
    return true;
  });

const columnByKey = Object.fromEntries(ORDER_COLUMNS.map((column) => [column.data, column]));

/** 빈 값은 항상 뒤로 보내고, 컬럼 타입에 맞춰 두 단계로 정렬한다. */
const compareBy = (sortValue) => {
  const [key, direction] = sortValue.split(':');
  const type = columnByKey[key]?.type;
  const sign = direction === 'desc' ? -1 : 1;
  const valueOf = (row) => {
    const value = row[key];
    if (value === null || value === undefined || value === '') return null;
    if (type === 'number' || type === 'id') return Number(value);
    if (type === 'date') return dayjs(Array.isArray(value) ? new Date(value[0], (value[1] || 1) - 1, value[2] || 1) : value).valueOf();
    return String(value);
  };
  return (a, b) => {
    const av = valueOf(a);
    const bv = valueOf(b);
    if (av === null || bv === null) return av === bv ? 0 : av === null ? 1 : -1;
    const diff = typeof av === 'string' ? av.localeCompare(bv, 'ko') : av - bv;
    return diff * sign;
  };
};

const applySort = (rows) =>
  [...rows].sort((a, b) => {
    const first = view.sort1 ? compareBy(view.sort1)(a, b) : 0;
    if (first !== 0 || !view.sort2 || view.sort2 === view.sort1) return first;
    return compareBy(view.sort2)(a, b);
  });

const renderOrders = () => {
  const totalPages = Math.max(1, Math.ceil(orders.value.length / view.pageSize));
  if (page.current > totalPages) page.current = totalPages;
  page.total = orders.value.length;
  page.totalPages = totalPages;
  const start = (page.current - 1) * view.pageSize;
  getHot(orderHot)?.loadData(orders.value.slice(start, start + view.pageSize));
  clearItems();
  if (orders.value.length > start) getHot(orderHot)?.selectCell(0, 0);
};

const onSearch = async () => {
  orderLoading.value = true;
  try {
    const params = toParams();
    const result = await proxy.$api.onApiGetOrder(params);
    const list = result?.list || result?.content || result || [];
    // 최근 주문(ORDER_ID 큰 것)부터 — 서버 정렬과 같게
    // 판매처 목록은 조건 없이 받은 결과로 만든다 (조건으로 좁힌 결과로 만들면 목록이 같이 줄어든다)
    if (!Object.keys(params).length && Array.isArray(list)) {
      channels.value = [...new Set(list.map((row) => row.channelId).filter(Boolean))].sort((a, b) =>
        String(a).localeCompare(String(b), 'ko')
      );
    }
    orders.value = applySort(filterOrders(Array.isArray(list) ? list : [], params));
    page.current = 1;
    renderOrders();
  } finally {
    orderLoading.value = false;
  }
};

/** 선택한 주문의 상품 명세 */
const loadItems = async (order) => {
  if (!order || selectedOrder.value?.orderId === order.orderId) return;
  selectedOrder.value = order;
  const seq = ++itemRequestSeq;
  itemLoading.value = true;
  try {
    const result = await proxy.$api.onApiGetOrderItem({ orderId: order.orderId });
    if (seq !== itemRequestSeq) return; // 그 사이 다른 주문을 클릭했다
    const list = result?.list || result?.content || result || [];
    // 서버가 orderId 로 걸러 주지만, 혹시 전체가 와도 이 주문 것만 남긴다
    items.value = (Array.isArray(list) ? list : [])
      .filter((row) => String(row.orderId) === String(order.orderId))
      .sort((a, b) => (Number(a.lineNo) || 0) - (Number(b.lineNo) || 0));
    getHot(itemHot)?.loadData(items.value);
  } finally {
    if (seq === itemRequestSeq) itemLoading.value = false;
  }
};

const onReset = () => {
  Object.assign(search, DEFAULT_SEARCH);
  Object.assign(view, DEFAULT_VIEW);
  onSearch();
};

const onPageSizeChange = () => {
  page.current = 1;
  renderOrders();
};

const onSortChange = () => {
  orders.value = applySort(orders.value);
  page.current = 1;
  renderOrders();
};

const goPage = (number) => {
  const next = Math.min(Math.max(1, number), page.totalPages);
  if (next === page.current) return;
  page.current = next;
  renderOrders();
};

const toggleSearchPanel = () => {
  searchPanelOpen.value = !searchPanelOpen.value;
  nextTick(fitGrids);
};

const onExcel = () => {
  if (!orders.value.length) {
    message.warning(t('common.noData'));
    return;
  }
  const rows = orders.value.map((row) => ({
    ...row,
    orderDate: toDay(row.orderDate),
  }));
  commonFunction.fncExportExcel(
    rows,
    ORDER_COLUMNS.map((column) => ({ title: t(`field.${column.data}`), dataIndex: column.data })),
    `${t('menu.orderTransfer')}_${dayjs().format('YYYYMMDD')}.xlsx`
  );
};

const onOpenWindow = () => window.open(window.location.href, '_blank', 'noopener,noreferrer,width=1440,height=900');
const onPrint = () => window.print();

// ─────────────────────────────────────────────
// 그리드
// ─────────────────────────────────────────────
const createGrids = () => {
  orderHot = markRaw(
    new Handsontable(orderHostRef.value, {
      ...gridSettings(ORDER_COLUMNS),
      // 주문 행을 클릭(키보드 이동 포함)하면 오른쪽에 상품 명세
      afterSelectionEnd(row) {
        if (row < 0) return;
        loadItems(this.getSourceDataAtRow(this.toPhysicalRow(row)));
      },
    })
  );
  itemHot = markRaw(new Handsontable(itemHostRef.value, gridSettings(ITEM_COLUMNS)));
};

const destroyGrids = () => {
  [orderHot, itemHot].forEach((hot) => getHot(hot)?.destroy());
  orderHot = null;
  itemHot = null;
};

/**
 * 그리드 높이 = 그리드 영역(.order-transfer-grid, 화면 남은 높이를 flex 로 채움)의 실제 높이.
 * ResizeObserver 로 창 크기 변경·탭 전환·검색 영역 줄바꿈 등 모든 크기 변화를 따라간다.
 */
const fitGrid = (hot, wrap) => {
  const instance = getHot(hot);
  if (!instance || !wrap) return;
  const height = wrap.clientHeight;
  if (height <= 0) return; // 숨겨진 탭(keep-alive)일 때는 0 → 다시 보일 때 맞춘다
  if (instance.getSettings().height !== height) instance.updateSettings({ height });
};

const fitGrids = () => {
  fitGrid(orderHot, orderWrapRef.value);
  fitGrid(itemHot, itemWrapRef.value);
};

let resizeObserver = null;

onMounted(() => {
  createGrids();
  fitGrids();
  onSearch();
  resizeObserver = new ResizeObserver(fitGrids);
  [orderWrapRef.value, itemWrapRef.value].forEach((el) => el && resizeObserver.observe(el));
});

onActivated(() => {
  fitGrids();
  getHot(orderHot)?.refreshDimensions();
  getHot(itemHot)?.refreshDimensions();
});

onBeforeUnmount(() => {
  resizeObserver?.disconnect();
  resizeObserver = null;
  destroyGrids();
});
</script>

<style scoped>
/* 화면 본문 영역(레이아웃의 .frame__scroll)을 꽉 채운다 */
.order-transfer-page {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 360px;
  background: #fff;
  overflow: hidden;
}

.order-transfer-toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 36px;
  padding: 4px 10px;
  border-bottom: 1px solid var(--wms-border);
  background: #f7f8fa;
}

.order-transfer-toolbar__title {
  font-size: 13px;
  font-weight: 700;
  color: #1e4e79;
  white-space: nowrap;
}

.order-transfer-toolbar__actions {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-left: auto;
}

.order-transfer-toolbar__utils {
  display: flex;
  align-items: center;
  gap: 2px;
  margin-left: 8px;
  padding-left: 8px;
  border-left: 1px solid var(--wms-border);
}

.order-transfer-icon-btn {
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

.order-transfer-icon-btn:hover {
  background: #e8f1f8;
}

.order-transfer-icon-btn--excel {
  color: #217346;
}

.order-transfer-search {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 8px 10px;
  background: #f3f6f8;
  border-bottom: 1px solid var(--wms-border);
}

.order-transfer-search__grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 6px 16px;
}

.order-transfer-search__row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.order-transfer-search__item {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
}

.order-transfer-search__label {
  flex: 0 0 72px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 12px;
  color: var(--wms-text);
}

.order-transfer-body {
  flex: 1;
  min-height: 0;
  display: flex;
  gap: 8px;
  padding: 8px 10px;
}

.order-transfer-panel {
  display: flex;
  flex-direction: column;
  min-width: 0;
  min-height: 0;
}

.order-transfer-panel--orders {
  flex: 3 1 0;
}

.order-transfer-panel--items {
  flex: 2 1 0;
}

.order-transfer-panel__title {
  display: flex;
  align-items: center;
  gap: 8px;
  height: 24px;
  margin-bottom: 6px;
  font-size: 13px;
  font-weight: 700;
  color: #1e4e79;
}

.order-transfer-panel__order {
  color: #c41d3a;
}

.order-transfer-panel__count,
.order-transfer-panel__hint {
  font-weight: 400;
  color: var(--wms-text);
}

/* 패널 제목 아래 남은 높이를 전부 그리드 영역으로 */
.order-transfer-grid {
  position: relative;
  flex: 1;
  min-height: 0;
  overflow: hidden;
  --ht-header-background-color: #d6e7f5;
  --ht-header-foreground-color: #1e4e79;
  --ht-header-font-weight: 700;
  --ht-cell-horizontal-border-color: #c5d8ea;
  --ht-cell-vertical-border-color: #c5d8ea;
}

/* 고정 컬럼 헤더만 조금 더 진한 파랑으로 구분 */
.order-transfer-grid :deep(.ht_clone_top_left_corner th) {
  background: #9fc0de !important;
  color: #0d3558 !important;
  font-weight: 700;
  white-space: nowrap;
  text-align: center;
  vertical-align: middle;
}

/* 조회 중 표시: 그리드 위에 겹쳐서 (그리드 크기에 영향 없음) */
.order-transfer-loading {
  position: absolute;
  inset: 0;
  z-index: 200;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.6);
}

/* 선택한 주문 행 강조 */
.order-transfer-grid :deep(td.is-current-row) {
  background: #d9edf7 !important;
}

.order-transfer-pager {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 34px;
  padding: 4px 10px;
  border-top: 1px solid var(--wms-border);
  background: #f7f8fa;
}

.order-transfer-pager__nav {
  display: flex;
  align-items: center;
  gap: 2px;
}

.order-transfer-pager__nav button {
  min-width: 24px;
  height: 24px;
  padding: 0 6px;
  border: 1px solid transparent;
  background: transparent;
  color: #1e4e79;
  font-size: 12px;
  cursor: pointer;
}

.order-transfer-pager__nav button:hover:not(:disabled) {
  border-color: #9bb8d3;
  background: #e8f1f8;
}

.order-transfer-pager__nav button.is-active {
  border-color: #3d6d99;
  background: #d6e7f5;
  font-weight: 700;
}

.order-transfer-pager__nav button:disabled {
  color: #aaa;
  cursor: default;
}

.order-transfer-pager__total {
  font-weight: 600;
  color: var(--wms-text);
}

@media print {
  .order-transfer-toolbar,
  .order-transfer-search,
  .order-transfer-pager {
    display: none !important;
  }

  .order-transfer-page {
    height: auto;
    overflow: visible;
  }

  .order-transfer-body,
  .order-transfer-grid {
    overflow: visible;
  }
}
</style>
