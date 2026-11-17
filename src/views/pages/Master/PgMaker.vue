<template>
  <div class="maker-page">
    <div class="maker-toolbar">
      <div class="maker-toolbar__title">※ {{ $t('menu.maker') }}</div>
      <div class="maker-toolbar__actions">
        <a-button size="small" @click="onSearch">
          <template #icon><SearchOutlined /></template>
          {{ $t('common.search') }}
        </a-button>
        <a-button size="small" @click="onCreate">
          <template #icon><FileAddOutlined /></template>
          {{ $t('common.create') }}
        </a-button>
        <a-button size="small" @click="onModify">
          <template #icon><FormOutlined /></template>
          {{ $t('common.modify') }}
        </a-button>
      </div>
      <div class="maker-toolbar__utils">
        <a-tooltip :title="$t('common.excelDownload')">
          <button type="button" class="maker-icon-btn maker-icon-btn--excel" @click="onExcel">
            <FileExcelOutlined />
          </button>
        </a-tooltip>
        <a-tooltip :title="$t('common.reset')">
          <button type="button" class="maker-icon-btn" @click="onReset">
            <UndoOutlined />
          </button>
        </a-tooltip>
        <a-tooltip :title="$t('common.openNewWindow')">
          <button type="button" class="maker-icon-btn" @click="onOpenWindow">
            <DesktopOutlined />
          </button>
        </a-tooltip>
        <a-tooltip :title="$t('common.printPreview')">
          <button type="button" class="maker-icon-btn" @click="onPrint">
            <PrinterOutlined />
          </button>
        </a-tooltip>
        <a-tooltip :title="$t('common.help')">
          <button type="button" class="maker-icon-btn" @click="onHelp">
            <QuestionCircleOutlined />
          </button>
        </a-tooltip>
      </div>
    </div>

    <div class="maker-search">
      <div class="maker-search__row">
        <a-select v-model:value="search.field" :options="searchFieldOptions" size="small" style="width: 130px" />
        <a-input v-model:value="search.keyword" size="small" class="flex-1" allow-clear @press-enter="onSearch" />
        <span class="wms-search__label">{{ $t('field.businessType') }}</span>
        <a-select v-model:value="search.businessType" :options="businessTypeOptions" size="small" style="width: 130px" />
        <span class="wms-search__label">{{ $t('field.useYn') }}</span>
        <a-select v-model:value="search.useYn" :options="useYnOptions" size="small" style="width: 110px" />
      </div>
      <div class="maker-search__row">
        <span class="wms-search__label">{{ $t('field.lastUpdDt') }}</span>
        <a-date-picker v-model:value="search.updDt" size="small" format="YYYYMMDD" allow-clear style="width: 140px" />
        <a-checkbox v-model:checked="search.hasProduct">{{ $t('field.productCount') }}</a-checkbox>
        <a-button size="small" @click="onProductCount">{{ $t('field.productCountByMaker') }}</a-button>
      </div>
      <div class="maker-search__row">
        <a-select
          v-model:value="search.pageSize"
          :options="pageSizeOptions"
          size="small"
          style="width: 110px"
          @change="onPageSizeChange"
        />
        <div class="flex-1" />
        <span class="wms-search__label">{{ $t('field.sort') }}</span>
        <a-select v-model:value="search.sort1" :options="sortOptions" size="small" style="width: 150px" @change="onSortChange" />
        <a-select v-model:value="search.sort2" :options="sortOptions" size="small" style="width: 150px" @change="onSortChange" />
      </div>
    </div>

    <div ref="gridWrapRef" class="maker-grid ht-theme-main">
      <div ref="hotHostRef" class="maker-grid__host" v-once />
    </div>

    <div class="maker-pager">
      <div class="maker-pager__nav">
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
      <span class="maker-pager__total">{{ $t('common.totalItems', { n: $cf.fncComma(page.total) }) }}</span>
    </div>

    <a-modal
      v-model:open="countOpen"
      :title="$t('field.productCountByMaker')"
      :footer="null"
      width="560"
    >
      <a-table
        size="small"
        row-key="id"
        :pagination="false"
        :scroll="{ y: 360 }"
        :data-source="countRows"
        :columns="countColumns"
      />
    </a-modal>
  </div>
</template>

<script setup>
import { computed, getCurrentInstance, markRaw, onActivated, onBeforeUnmount, onMounted, reactive, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { Modal, message } from 'ant-design-vue';
import dayjs from 'dayjs';
import Handsontable from 'handsontable';
import 'handsontable/styles/handsontable.css';
import 'handsontable/styles/ht-theme-main.css';
import commonFunction from '@/common/utils/commonFunction';
import { getMockMakers } from './makerMock';
import { MAKER_FORM_CHANNEL, makerFormUrl, openMakerFormWindow, stashMakerFormPayload } from './makerPopup';

const { proxy } = getCurrentInstance();
const { t } = useI18n();

defineOptions({ name: 'PgMaker' });

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

const gridWrapRef = ref(null);
const hotHostRef = ref(null);
const filtered = ref([]);
const countOpen = ref(false);

let hot = null;
let selectedRow = null;
const activeRange = { start: -1, end: -1 };
let openingForm = false;
let makerChannel = null;

const search = reactive({
  field: 'makerName',
  keyword: '',
  businessType: '',
  useYn: '',
  updDt: null,
  hasProduct: false,
  pageSize: 20,
  sort1: 'updDtDesc',
  sort2: 'makerId',
});

const page = reactive({
  current: 1,
  total: 0,
  totalPages: 1,
});

const searchFieldOptions = computed(() => [
  { value: 'makerId', label: t('field.makerId') },
  { value: 'makerName', label: t('field.makerName') },
  { value: 'managerName', label: t('field.managerName') },
  { value: 'address', label: t('field.address') },
  { value: 'memo', label: t('field.memo') },
]);

const businessTypeOptions = computed(() => [
  { value: '', label: t('common.all') },
  { value: 'company', label: t('field.businessCompany') },
]);

const useYnOptions = computed(() => [
  { value: '', label: t('common.all') },
  { value: 'Y', label: t('common.use') },
  { value: 'N', label: t('common.unused') },
]);

const sortOptions = computed(() => [
  { value: 'updDtDesc', label: t('field.updDtDesc') },
  { value: 'makerId', label: t('field.makerId') },
  { value: 'makerName', label: t('field.makerName') },
  { value: 'updDt', label: t('field.lastUpdDt') },
]);

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

const countColumns = computed(() => [
  { title: t('field.makerId'), dataIndex: 'makerId', width: 150 },
  { title: t('field.makerName'), dataIndex: 'makerName' },
  { title: t('field.productCount'), dataIndex: 'productCount', width: 110, align: 'right' },
]);

const countRows = computed(() =>
  filtered.value.map((row) => ({ id: row.id, makerId: row.makerId, makerName: row.makerName, productCount: row.productCount || 0 }))
);

const useYnLabel = (useYn) => (useYn === 'N' ? t('common.unused') : t('common.use'));
const businessLabel = (type) => (type === 'company' ? t('field.businessCompany') : '');

const sortValue = (row, key) => {
  if (key === 'updDtDesc' || key === 'updDt') return row.updDt || '';
  if (key === 'makerId') return String(row.makerId || '');
  return String(row.makerName || '').toLowerCase();
};

const compareBy = (key, direction = 1) => (a, b) => {
  const av = sortValue(a, key);
  const bv = sortValue(b, key);
  if (av < bv) return -1 * direction;
  if (av > bv) return 1 * direction;
  return 0;
};

const applySort = (rows) => {
  const dir1 = search.sort1 === 'updDtDesc' ? -1 : 1;
  const dir2 = search.sort2 === 'updDtDesc' ? -1 : 1;
  return [...rows].sort((a, b) => {
    const first = compareBy(search.sort1, dir1)(a, b);
    if (first !== 0 || !search.sort2 || search.sort2 === search.sort1) return first;
    return compareBy(search.sort2, dir2)(a, b);
  });
};

const decorate = (rows, startNo) =>
  rows.map((row, index) =>
    markRaw({
      ...row,
      no: startNo + index,
      useYnLabel: useYnLabel(row.useYn),
      businessTypeLabel: businessLabel(row.businessType),
    })
  );

const getHot = () => (hot && !hot.isDestroyed ? hot : null);

const replaceGridData = (rows) => {
  getHot()?.loadData(rows);
};

const seqRenderer = function (instance, td, row, col, prop, value, cellProperties) {
  Handsontable.renderers.TextRenderer.apply(this, [instance, td, row, col, prop, value, cellProperties]);
  td.classList.add('maker-seq-link');
  td.style.cursor = 'pointer';
};

const onAfterSelection = function (row, _col, row2) {
  selectedRow = row < 0 ? null : this.getSourceDataAtRow(row) || null;
  activeRange.start = row < 0 ? -1 : Math.min(row, row2);
  activeRange.end = row < 0 ? -1 : Math.max(row, row2);
};

/** Handsontable 선택 시작보다 먼저 가로채서 드래그 선택이 생기지 않게 한다 */
const onGridMouseDownCapture = (event) => {
  if (event.button !== 0) return;
  const td = event.target?.closest?.('td');
  if (!td || !gridWrapRef.value?.contains(td)) return;
  if (!td.classList.contains('maker-seq-link')) return;

  event.preventDefault();
  event.stopPropagation();
  event.isImmediatePropagationEnabled = false;

  const instance = getHot();
  if (!instance) return;
  const coords = instance.getCoords(td);
  if (!coords || coords.row < 0) return;
  selectedRow = instance.getSourceDataAtRow(coords.row);
  onModify();
};

const createGrid = () => {
  const host = hotHostRef.value;
  if (!host || getHot()) return;

  hot = markRaw(
    new Handsontable(host, {
      themeName: 'ht-theme-main',
      data: [],
      colHeaders: [
        t('field.seq'),
        t('field.makerId'),
        t('field.makerName'),
        t('field.managerName'),
        t('field.managerMobile'),
        t('field.managerTel'),
        t('field.businessType'),
        t('field.address'),
        t('field.useYn'),
        t('field.lastUpdDt'),
        t('field.updUser'),
        t('field.memo'),
      ],
      columns: [
        { data: 'no', className: 'htCenter', readOnly: true, editor: false, renderer: seqRenderer },
        { data: 'partnerId', readOnly: true, editor: false },
        { data: 'partnerNm', readOnly: true, editor: false },
        { data: 'contact1Nm', readOnly: true, editor: false },
        { data: 'contact1HpNo', className: 'htCenter', readOnly: true, editor: false },
        { data: 'contact1Tel', className: 'htCenter', readOnly: true, editor: false },
        { data: 'businessTypeLabel', className: 'htCenter', readOnly: true, editor: false },
        { data: 'address', readOnly: true, editor: false },
        { data: 'useYnLabel', className: 'htCenter', readOnly: true, editor: false },
        { data: 'updDt', className: 'htCenter', readOnly: true, editor: false },
        { data: 'updUser', className: 'htCenter', readOnly: true, editor: false },
        { data: 'memo', readOnly: true, editor: false },
      ],
      colWidths: [50, 130, 200, 90, 120, 120, 80, 160, 50, 140, 80, 220],
      height: Math.max(120, gridWrapRef.value?.clientHeight || 400),
      width: '100%',
      stretchH: 'all',
      rowHeaders: false,
      manualColumnResize: true,
      fillHandle: false,
      imeFastEdit: false,
      autoRowSize: false,
      autoColumnSize: false,
      readOnly: true,
      licenseKey: 'non-commercial-and-evaluation',
      beforeRenderer(td, row) {
        if (activeRange.start >= 0 && row >= activeRange.start && row <= activeRange.end) {
          td.classList.add('active-row-cell');
        } else {
          td.classList.remove('active-row-cell');
        }
      },
      beforeBeginEditing() {
        return false;
      },
      afterSelection: onAfterSelection,
    })
  );

  gridWrapRef.value?.addEventListener('mousedown', onGridMouseDownCapture, true);
};

const destroyGrid = () => {
  gridWrapRef.value?.removeEventListener('mousedown', onGridMouseDownCapture, true);
  if (hot && !hot.isDestroyed) hot.destroy();
  hot = null;
};

const renderPage = () => {
  const size = search.pageSize;
  const totalPages = Math.max(1, Math.ceil(filtered.value.length / size));
  if (page.current > totalPages) page.current = totalPages;
  page.total = filtered.value.length;
  page.totalPages = totalPages;
  const start = (page.current - 1) * size;
  replaceGridData(decorate(filtered.value.slice(start, start + size), start + 1));
  selectedRow = null;
  activeRange.start = -1;
  activeRange.end = -1;
};

const filterRows = (rows) => {
  const keyword = search.keyword.trim().toLowerCase();
  const upd = search.updDt?.format('YYYYMMDD');
  return rows.filter((row) => {
    if (search.useYn && row.useYn !== search.useYn) return false;
    if (search.businessType === 'company' && row.businessType !== 'company') return false;
    if (search.hasProduct && !(Number(row.productCount) > 0)) return false;
    if (upd && String(row.updDt || '').replace(/\D/g, '').slice(0, 8) !== upd) return false;
    if (keyword) {
      const target = String(row[search.field] || '').toLowerCase();
      if (!target.includes(keyword)) return false;
    }
    return true;
  });
};

const onSearch = async () => {
  page.current = 1;
  if (USE_MOCK) {
    filtered.value = applySort(filterRows(getMockMakers()));
    renderPage();
    return;
  }
  const result = await proxy.$api.onApiQueryMaker({
    searchField: search.field,
    keyword: search.keyword,
    businessType: search.businessType,
    useYn: search.useYn,
    updDt: search.updDt?.format('YYYYMMDD'),
    hasProduct: search.hasProduct,
    sort1: search.sort1,
    sort2: search.sort2,
  });
  console.log( result, result );

  filtered.value = applySort(result?.list || result || []);
  renderPage();
};

const onReset = () => {
  search.field = 'makerName';
  search.keyword = '';
  search.businessType = '';
  search.useYn = '';
  search.updDt = null;
  search.hasProduct = false;
  search.pageSize = 20;
  search.sort1 = 'updDtDesc';
  search.sort2 = 'makerId';
  onSearch();
};

const onPageSizeChange = () => {
  page.current = 1;
  renderPage();
};

const onSortChange = () => {
  filtered.value = applySort(filtered.value);
  page.current = 1;
  renderPage();
};

const goPage = (n) => {
  const next = Math.min(Math.max(1, n), page.totalPages);
  if (next === page.current) return;
  page.current = next;
  renderPage();
};

const applySavedMaker = (row) => {
  if (!row) return;
  const index = filtered.value.findIndex((item) => String(item.id) === String(row.id));
  if (index >= 0) filtered.value.splice(index, 1, { ...filtered.value[index], ...row });
  else filtered.value = [{ ...row }, ...filtered.value];
  filtered.value = applySort(filtered.value);
  renderPage();
  message.success(t('message.saved'));
};

const onMakerFormMessage = (event) => {
  if (event.origin && event.origin !== window.location.origin) return;
  if (event.data?.type !== 'maker-saved') return;
  applySavedMaker(event.data.row);
};

const openMakerForm = (mode, row = null) => {
  if (openingForm) return;
  openingForm = true;
  const token = stashMakerFormPayload({ mode, row });
  const popup = openMakerFormWindow(makerFormUrl({ mode, id: row?.id, token }));
  if (!popup) message.warning(t('message.popupBlocked'));
  window.setTimeout(() => {
    openingForm = false;
  }, 400);
};

const onCreate = () => openMakerForm('create');

const onModify = () => {
  if (!selectedRow) {
    message.warning(t('message.selectRequired'));
    return;
  }
  openMakerForm('modify', selectedRow);
};

const onProductCount = () => {
  if (!filtered.value.length) {
    message.warning(t('common.noData'));
    return;
  }
  countOpen.value = true;
};

const onExcel = () => {
  if (!filtered.value.length) {
    message.warning(t('common.noData'));
    return;
  }
  const rows = decorate(filtered.value, 1);
  commonFunction.fncExportExcel(
    rows,
    [
      { title: t('field.seq'), dataIndex: 'no' },
      { title: t('field.makerId'), dataIndex: 'makerId' },
      { title: t('field.makerName'), dataIndex: 'makerName' },
      { title: t('field.managerName'), dataIndex: 'managerName' },
      { title: t('field.managerMobile'), dataIndex: 'managerMobile' },
      { title: t('field.managerTel'), dataIndex: 'managerTel' },
      { title: t('field.businessType'), dataIndex: 'businessTypeLabel' },
      { title: t('field.address'), dataIndex: 'address' },
      { title: t('field.useYn'), dataIndex: 'useYnLabel' },
      { title: t('field.lastUpdDt'), dataIndex: 'updDt' },
      { title: t('field.updUser'), dataIndex: 'updUser' },
      { title: t('field.memo'), dataIndex: 'memo' },
      { title: t('field.productCount'), dataIndex: 'productCount' },
    ],
    `${t('menu.maker')}_${dayjs().format('YYYYMMDD')}.xlsx`
  );
};

const onOpenWindow = () => {
  window.open(window.location.href, '_blank', 'noopener,noreferrer,width=1440,height=900');
};

const onPrint = () => window.print();

const onHelp = () => {
  Modal.info({
    title: t('common.help'),
    content: t('message.makerHelp'),
    okText: t('common.confirm'),
  });
};

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
  window.addEventListener('message', onMakerFormMessage);
  if ('BroadcastChannel' in window) {
    makerChannel = new BroadcastChannel(MAKER_FORM_CHANNEL);
    makerChannel.onmessage = (event) => onMakerFormMessage(event);
  }
});

onActivated(() => {
  measureGrid();
  getHot()?.refreshDimensions();
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', measureGrid);
  window.removeEventListener('message', onMakerFormMessage);
  makerChannel?.close();
  makerChannel = null;
  destroyGrid();
});
</script>

<style scoped>
.maker-page {
  display: flex;
  flex-direction: column;
  height: calc(
    100vh - var(--wms-gnb-height) - var(--wms-userbar-height) - var(--wms-tabbar-height) -
      var(--wms-footer-height) - 36px
  );
  background: #fff;
  overflow: hidden;
}

.maker-toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 36px;
  padding: 4px 10px;
  border-bottom: 1px solid var(--wms-border);
  background: #f7f8fa;
}

.maker-toolbar__title {
  font-size: 13px;
  font-weight: 700;
  color: #1e4e79;
  white-space: nowrap;
}

.maker-toolbar__actions {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-left: auto;
}

.maker-toolbar__utils {
  display: flex;
  align-items: center;
  gap: 2px;
  margin-left: 8px;
  padding-left: 8px;
  border-left: 1px solid var(--wms-border);
}

.maker-icon-btn {
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

.maker-icon-btn:hover {
  background: #e8f1f8;
}

.maker-icon-btn--excel {
  color: #217346;
}

.maker-search {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 8px 10px;
  background: #f3f6f8;
  border-bottom: 1px solid var(--wms-border);
}

.maker-search__row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.maker-grid {
  flex: 1;
  min-height: 0;
  position: relative;
  --ht-header-background-color: #d6e7f5;
  --ht-header-foreground-color: #1e4e79;
  --ht-header-font-weight: 700;
  --ht-cell-horizontal-border-color: #c5d8ea;
  --ht-cell-vertical-border-color: #c5d8ea;
}

.maker-grid__host {
  height: 100%;
}

.maker-grid :deep(.active-row-cell) {
  background: #d9edf7 !important;
}

.maker-grid :deep(.ht_clone_top th) {
  background: #d6e7f5;
  color: #1e4e79;
  font-weight: 700;
}

.maker-grid :deep(.wtBorder) {
  pointer-events: none;
}

.maker-grid :deep(td.maker-seq-link) {
  color: #1e5aa8;
  text-decoration: underline;
  cursor: pointer;
}

.maker-grid :deep(td.maker-seq-link:hover) {
  color: #c41d3a !important;
}

.maker-pager {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 34px;
  padding: 4px 10px;
  border-top: 1px solid var(--wms-border);
  background: #f7f8fa;
}

.maker-pager__nav {
  display: flex;
  align-items: center;
  gap: 2px;
}

.maker-pager__nav button {
  min-width: 24px;
  height: 24px;
  padding: 0 6px;
  border: 1px solid transparent;
  background: transparent;
  color: #1e4e79;
  font-size: 12px;
  cursor: pointer;
}

.maker-pager__nav button:hover:not(:disabled) {
  border-color: #9bb8d3;
  background: #e8f1f8;
}

.maker-pager__nav button.is-active {
  border-color: #3d6d99;
  background: #d6e7f5;
  font-weight: 700;
}

.maker-pager__nav button:disabled {
  color: #aaa;
  cursor: default;
}

.maker-pager__total {
  font-weight: 600;
  color: var(--wms-text);
}

@media print {
  .maker-toolbar,
  .maker-search,
  .maker-pager {
    display: none !important;
  }

  .maker-page {
    height: auto;
  }

  .maker-grid {
    overflow: visible;
  }
}
</style>
