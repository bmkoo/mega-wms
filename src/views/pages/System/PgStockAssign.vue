<template>
  <div class="sa-page">
    <div class="sa-toolbar">
      <div class="sa-toolbar__title">※ {{ $t('menu.stockAssign') }}</div>
      <div class="sa-toolbar__actions">
        <a-button size="small" @click="onSearch">
          <template #icon><SearchOutlined /></template>
          {{ $t('common.search') }}
        </a-button>
      </div>
      <div class="sa-toolbar__utils">
        <a-tooltip :title="$t('common.excelDownload')">
          <button type="button" class="sa-icon-btn sa-icon-btn--excel" @click="onExcel">
            <FileExcelOutlined />
          </button>
        </a-tooltip>
        <a-tooltip :title="$t('common.reset')">
          <button type="button" class="sa-icon-btn" @click="onReset">
            <UndoOutlined />
          </button>
        </a-tooltip>
        <a-tooltip :title="$t('common.printPreview')">
          <button type="button" class="sa-icon-btn" @click="onPrint">
            <PrinterOutlined />
          </button>
        </a-tooltip>
      </div>
    </div>

    <div class="sa-search">
      <!-- 검색 조건: TB_ORDER 항목 + 품목 할당여부·배송상태. 조건은 서버(네이티브 쿼리)에서 처리한다 -->
      <div class="sa-search__grid">
        <div v-for="f in SEARCH_FIELDS" :key="f.data" class="sa-search__item">
          <span class="sa-search__label" :title="labelOf(f)">{{ labelOf(f) }}</span>
          <a-range-picker
            v-if="f.type === 'date'"
            v-model:value="cond[f.data]"
            size="small"
            format="YYYY-MM-DD"
            class="flex-1"
          />
          <div v-else-if="f.type === 'number'" class="sa-search__range">
            <a-input-number v-model:value="cond[f.data].min" size="small" :controls="false" @press-enter="onSearch" />
            <span>~</span>
            <a-input-number v-model:value="cond[f.data].max" size="small" :controls="false" @press-enter="onSearch" />
          </div>
          <a-input v-else v-model:value="cond[f.data]" size="small" class="flex-1" allow-clear @press-enter="onSearch" />
        </div>
      </div>
      <div class="sa-search__row">
        <a-select
          v-model:value="search.pageSize"
          :options="pageSizeOptions"
          size="small"
          style="width: 110px"
          @change="onPageSizeChange"
        />
      </div>
    </div>

    <div ref="gridWrapRef" class="sa-grid ht-theme-main">
      <div ref="hotHostRef" class="sa-grid__host" v-once />
    </div>

    <div class="sa-pager">
      <div class="sa-pager__nav">
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
      <span class="sa-pager__total">{{ $t('common.totalItems', { n: $cf.fncComma(page.total) }) }}</span>
    </div>
  </div>
</template>

<script setup>
// 재고할당: 주문(TB_ORDER) + 주문품목(TB_ORDER_ITEM) + 상품마스터(TB_PRODUCT) 조인 결과 전체를 보여준다.
// 백엔드: GET /api/v1/stockAssignList (OrderService.stockAssignList, 네이티브 쿼리). 품목 1개 = 1행
import { computed, getCurrentInstance, markRaw, onActivated, onBeforeUnmount, onMounted, reactive, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { message } from 'ant-design-vue';
import dayjs from 'dayjs';
import Handsontable from 'handsontable';
import 'handsontable/styles/handsontable.css';
import 'handsontable/styles/ht-theme-main.css';
import commonFunction from '@/common/utils/commonFunction';

const { proxy } = getCurrentInstance();
const { t } = useI18n();

defineOptions({ name: 'PgStockAssign' });

const queryApi = (params) => proxy.$api.onApiQueryStockAssign(params);

/** 그리드 컬럼 = 쿼리 SELECT 순서. label 이 있으면 i18n field.<label>, 없으면 field.<data> */
const FIELDS = [
  // 주문 (TB_ORDER)
  { data: 'orderId', type: 'number', className: 'htRight', width: 80, id: true },
  { data: 'orderNo', type: 'text', className: '', width: 130 },
  { data: 'channelId', type: 'text', className: '', width: 90 },
  { data: 'orderDate', type: 'date', className: 'htCenter', width: 100 },
  { data: 'ordererNm', type: 'text', className: '', width: 90 },
  { data: 'receiverNm', type: 'text', className: '', width: 90 },
  { data: 'itemCount', type: 'number', className: 'htRight', width: 70 },
  { data: 'paidAmount', type: 'number', className: 'htRight', width: 90 },
  { data: 'billAmount', type: 'number', className: 'htRight', width: 90 },
  // 주문 품목 (TB_ORDER_ITEM)
  { data: 'lineNo', type: 'number', className: 'htRight', width: 60, id: true },
  { data: 'productCd', type: 'text', className: '', width: 110 },
  { data: 'orderProductNm', type: 'text', className: '', width: 220 },
  { data: 'qty', type: 'number', className: 'htRight', width: 60 },
  { data: 'recipientNm', type: 'text', className: '', width: 90 },
  { data: 'isAssign', type: 'text', className: 'htCenter', width: 80 },
  { data: 'deliveryStatus', type: 'text', className: 'htCenter', width: 80 },
  { data: 'shippingNo', type: 'text', className: '', width: 110 },
  // 상품 마스터 (TB_PRODUCT) — 매칭되지 않으면 빈 값
  { data: 'productNm', label: 'masterProductNm', type: 'text', className: '', width: 200 },
  { data: 'barcode', type: 'text', className: '', width: 120 },
  { data: 'brandCd', type: 'text', className: '', width: 80 },
  { data: 'salePrice', type: 'number', className: 'htRight', width: 80 },
  { data: 'costPrice', type: 'number', className: 'htRight', width: 80 },
  { data: 'setYn', type: 'text', className: 'htCenter', width: 60 },
  { data: 'productStatusCode', type: 'text', className: 'htCenter', width: 80 },
  { data: 'stockStatusCode', type: 'text', className: 'htCenter', width: 80 },
  { data: 'locationWh', type: 'text', className: 'htCenter', width: 70 },
  { data: 'location1', type: 'text', className: 'htCenter', width: 50 },
  { data: 'location2', type: 'text', className: 'htCenter', width: 50 },
  { data: 'location3', type: 'text', className: 'htCenter', width: 50 },
  { data: 'location4', type: 'text', className: 'htCenter', width: 50 },
  { data: 'productMatchedYn', type: 'text', className: 'htCenter', width: 70 },
];

/** 검색 조건: TB_ORDER 항목 + 품목 할당여부·배송상태. 서버 파라미터는 toParams() 참고 */
const SEARCH_FIELDS = [
  { data: 'orderNo', type: 'text' },
  { data: 'channelId', type: 'text' },
  { data: 'orderDate', type: 'date' },
  { data: 'ordererNm', type: 'text' },
  { data: 'receiverNm', type: 'text' },
  { data: 'itemCount', type: 'number' },
  { data: 'paidAmount', type: 'number' },
  { data: 'billAmount', type: 'number' },
  { data: 'isAssign', type: 'text' },
  { data: 'deliveryStatus', type: 'text' },
];

const labelOf = (f) => t(`field.${f.label || f.data}`);

const gridWrapRef = ref(null);
const hotHostRef = ref(null);
const rowsAll = ref([]);

let hot = null;
const activeRange = { start: -1, end: -1 };

const DEFAULT_SEARCH = { pageSize: 50 };
const search = reactive({ ...DEFAULT_SEARCH });

/** 검색 조건 초기값: 문자열 '' / 날짜 null([시작, 끝]) / 숫자 { min, max } */
const emptyCond = () =>
  Object.fromEntries(
    SEARCH_FIELDS.map((f) => [f.data, f.type === 'number' ? { min: null, max: null } : f.type === 'date' ? null : ''])
  );
const cond = reactive(emptyCond());

const page = reactive({ current: 1, total: 0, totalPages: 1 });

const pageSizeOptions = computed(() =>
  [20, 50, 100, 500, 1000].map((n) => ({ value: n, label: t('common.perPage', { n }) }))
);

const pageNumbers = computed(() => {
  const totalPages = Math.max(1, page.totalPages);
  const windowSize = 10;
  const start = Math.floor((page.current - 1) / windowSize) * windowSize + 1;
  const end = Math.min(start + windowSize - 1, totalPages);
  const list = [];
  for (let i = start; i <= end; i += 1) list.push(i);
  return list;
});

/** 서버 날짜 값(ISO 문자열 / [y, M, d, h, m, s] 배열 / epoch) → dayjs. 없거나 잘못되면 null */
const toDate = (value) => {
  if (value === null || value === undefined || value === '') return null;
  const d = Array.isArray(value)
    ? dayjs(new Date(value[0], (value[1] || 1) - 1, value[2] || 1, value[3] || 0, value[4] || 0, value[5] || 0))
    : dayjs(value);
  return d.isValid() ? d : null;
};

/** 서버로 보낼 조건 (비어 있지 않은 것만). 문자열=<필드>, 날짜=<필드>From/To(YYYYMMDD), 숫자=<필드>Min/Max */
const toParams = () => {
  const params = {};
  SEARCH_FIELDS.forEach((f) => {
    const c = cond[f.data];
    if (f.type === 'date') {
      if (c?.[0]) params[`${f.data}From`] = c[0].format('YYYYMMDD');
      if (c?.[1]) params[`${f.data}To`] = c[1].format('YYYYMMDD');
    } else if (f.type === 'number') {
      if (c.min !== null) params[`${f.data}Min`] = c.min;
      if (c.max !== null) params[`${f.data}Max`] = c.max;
    } else if (String(c || '').trim()) {
      params[f.data] = String(c).trim();
    }
  });
  return params;
};

/** 날짜 컬럼은 YYYY-MM-DD 문자열로 바꿔서 그리드/엑셀에 넣는다 */
const decorate = (rows, startNo) =>
  rows.map((row, index) => {
    const view = { ...row, no: startNo + index };
    FIELDS.forEach((f) => {
      if (f.type === 'date') view[f.data] = toDate(row[f.data])?.format('YYYY-MM-DD') ?? '';
    });
    return markRaw(view);
  });

const getHot = () => (hot && !hot.isDestroyed ? hot : null);

/** 숫자 컬럼은 1000 단위 콤마 (@Id 성격 컬럼 제외) */
const commaRenderer = function (instance, td, row, col, prop, value, cellProperties) {
  Handsontable.renderers.TextRenderer.apply(this, [instance, td, row, col, prop, commonFunction.fncComma(value), cellProperties]);
};

/** 상품마스터에 없는 품목 행은 표시해서 바로 보이게 한다 */
const isUnmatched = (row) => getHot()?.getSourceDataAtRow(row)?.productMatchedYn === 'N';

const createGrid = () => {
  const host = hotHostRef.value;
  if (!host || getHot()) return;

  hot = markRaw(
    new Handsontable(host, {
      themeName: 'ht-theme-main',
      data: [],
      colHeaders: [t('field.seq'), ...FIELDS.map(labelOf)],
      columns: [
        { data: 'no', className: 'htCenter' },
        ...FIELDS.map((f) => ({
          data: f.data,
          className: f.className,
          ...(f.type === 'number' && !f.id ? { renderer: commaRenderer } : {}),
        })),
      ],
      colWidths: [50, ...FIELDS.map((f) => f.width)],
      height: Math.max(120, gridWrapRef.value?.clientHeight || 400),
      width: '100%',
      rowHeaders: false,
      fixedColumnsStart: 3,
      manualColumnResize: true,
      fillHandle: false,
      autoRowSize: false,
      autoColumnSize: false,
      readOnly: true,
      licenseKey: 'non-commercial-and-evaluation',
      beforeRenderer(td, row) {
        td.classList.toggle('active-row-cell', activeRange.start >= 0 && row >= activeRange.start && row <= activeRange.end);
        td.classList.toggle('unmatched-row-cell', isUnmatched(row));
      },
      beforeBeginEditing() {
        return false;
      },
      afterSelection(row, _col, row2) {
        activeRange.start = row < 0 ? -1 : Math.min(row, row2);
        activeRange.end = row < 0 ? -1 : Math.max(row, row2);
      },
    })
  );
};

const destroyGrid = () => {
  if (hot && !hot.isDestroyed) hot.destroy();
  hot = null;
};

const renderPage = () => {
  const size = search.pageSize;
  const totalPages = Math.max(1, Math.ceil(rowsAll.value.length / size));
  if (page.current > totalPages) page.current = totalPages;
  page.total = rowsAll.value.length;
  page.totalPages = totalPages;
  const start = (page.current - 1) * size;
  activeRange.start = -1;
  activeRange.end = -1;
  getHot()?.loadData(decorate(rowsAll.value.slice(start, start + size), start + 1));
};

const onSearch = async () => {
  page.current = 1;
  const result = await queryApi(toParams());
  const list = result?.list || result?.content || result || [];
  // 서버에서 ORDER_ID 내림차순, LINE_NO 순으로 정렬해서 온다
  rowsAll.value = Array.isArray(list) ? list : [];
  renderPage();
};

const onReset = () => {
  Object.assign(search, DEFAULT_SEARCH);
  Object.assign(cond, emptyCond());
  onSearch();
};

const onPageSizeChange = () => {
  page.current = 1;
  renderPage();
};

const goPage = (n) => {
  const next = Math.min(Math.max(1, n), page.totalPages);
  if (next === page.current) return;
  page.current = next;
  renderPage();
};

const onExcel = () => {
  if (!rowsAll.value.length) {
    message.warning(t('common.noData'));
    return;
  }
  commonFunction.fncExportExcel(
    decorate(rowsAll.value, 1),
    [{ title: t('field.seq'), dataIndex: 'no' }, ...FIELDS.map((f) => ({ title: labelOf(f), dataIndex: f.data }))],
    `${t('menu.stockAssign')}_${dayjs().format('YYYYMMDD')}.xlsx`
  );
};

const onPrint = () => window.print();

const measureGrid = () => {
  const el = gridWrapRef.value;
  const instance = getHot();
  if (!el || !instance) return;
  const next = Math.max(120, el.clientHeight);
  if (instance.getSettings().height === next) return;
  instance.updateSettings({ height: next });
};

onMounted(() => {
  destroyGrid();
  createGrid();
  measureGrid();
  onSearch();
  window.addEventListener('resize', measureGrid);
});

onActivated(() => {
  measureGrid();
  getHot()?.refreshDimensions();
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', measureGrid);
  destroyGrid();
});
</script>

<style scoped>
.sa-page {
  display: flex;
  flex-direction: column;
  height: calc(
    100vh - var(--wms-gnb-height) - var(--wms-userbar-height) - var(--wms-tabbar-height) -
      var(--wms-footer-height) - 36px
  );
  background: #fff;
  overflow: hidden;
}

.sa-toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 36px;
  padding: 4px 10px;
  border-bottom: 1px solid var(--wms-border);
  background: #f7f8fa;
}

.sa-toolbar__title {
  font-size: 13px;
  font-weight: 700;
  color: #1e4e79;
  white-space: nowrap;
}

.sa-toolbar__actions {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-left: auto;
}

.sa-toolbar__utils {
  display: flex;
  align-items: center;
  gap: 2px;
  margin-left: 8px;
  padding-left: 8px;
  border-left: 1px solid var(--wms-border);
}

.sa-icon-btn {
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

.sa-icon-btn:hover {
  background: #e8f1f8;
}

.sa-icon-btn--excel {
  color: #217346;
}

.sa-search {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 8px 10px;
  background: #f3f6f8;
  border-bottom: 1px solid var(--wms-border);
}

.sa-search__row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.sa-search__grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 6px 16px;
}

.sa-search__item {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
}

.sa-search__label {
  flex: 0 0 96px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 12px;
  color: var(--wms-text);
}

.sa-search__range {
  display: flex;
  flex: 1;
  align-items: center;
  gap: 4px;
  min-width: 0;
}

.sa-search__range :deep(.ant-input-number) {
  flex: 1;
  min-width: 0;
}

.sa-grid {
  flex: 1;
  min-height: 0;
  position: relative;
  --ht-header-background-color: #d6e7f5;
  --ht-header-foreground-color: #1e4e79;
  --ht-header-font-weight: 700;
  --ht-cell-horizontal-border-color: #c5d8ea;
  --ht-cell-vertical-border-color: #c5d8ea;
}

.sa-grid__host {
  height: 100%;
}

.sa-grid :deep(.unmatched-row-cell) {
  background: #fff4e5;
}

.sa-grid :deep(.active-row-cell) {
  background: #d9edf7 !important;
}

.sa-grid :deep(.wtBorder) {
  pointer-events: none;
}

.sa-pager {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 34px;
  padding: 4px 10px;
  border-top: 1px solid var(--wms-border);
  background: #f7f8fa;
}

.sa-pager__nav {
  display: flex;
  align-items: center;
  gap: 2px;
}

.sa-pager__nav button {
  min-width: 24px;
  height: 24px;
  padding: 0 6px;
  border: 1px solid transparent;
  background: transparent;
  color: #1e4e79;
  font-size: 12px;
  cursor: pointer;
}

.sa-pager__nav button:hover:not(:disabled) {
  border-color: #9bb8d3;
  background: #e8f1f8;
}

.sa-pager__nav button.is-active {
  border-color: #3d6d99;
  background: #d6e7f5;
  font-weight: 700;
}

.sa-pager__nav button:disabled {
  color: #aaa;
  cursor: default;
}

.sa-pager__total {
  font-weight: 600;
  color: var(--wms-text);
}

@media print {
  .sa-toolbar,
  .sa-search,
  .sa-pager {
    display: none !important;
  }

  .sa-page {
    height: auto;
  }

  .sa-grid {
    overflow: visible;
  }
}
</style>
