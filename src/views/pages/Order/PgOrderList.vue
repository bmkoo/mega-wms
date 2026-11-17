<template>
  <div class="memo-page">
    <div class="memo-toolbar">
      <div class="memo-toolbar__title">※ {{ $t('menu.orderList') }}</div>
      <div class="memo-toolbar__actions">
        <a-button size="small" @click="onSearch">
          <template #icon><SearchOutlined /></template>
          {{ $t('common.search') }}
        </a-button>
        <a-button size="small" @click="onModify">
          <template #icon><FormOutlined /></template>
          {{ $t('common.modify') }}
        </a-button>
        <a-button size="small" @click="onCreate">
          <template #icon><FileAddOutlined /></template>
          {{ $t('common.createNoOrderMemo') }}
        </a-button>
      </div>
      <div class="memo-toolbar__utils">
        <a-tooltip :title="$t('common.excelDownload')">
          <button type="button" class="memo-icon-btn memo-icon-btn--excel" @click="onExcel">
            <FileExcelOutlined />
          </button>
        </a-tooltip>
        <a-tooltip :title="$t('common.reset')">
          <button type="button" class="memo-icon-btn" @click="onReset">
            <UndoOutlined />
          </button>
        </a-tooltip>
        <a-tooltip :title="$t('common.openNewWindow')">
          <button type="button" class="memo-icon-btn" @click="onOpenWindow">
            <DesktopOutlined />
          </button>
        </a-tooltip>
        <a-tooltip :title="$t('common.printPreview')">
          <button type="button" class="memo-icon-btn" @click="onPrint">
            <PrinterOutlined />
          </button>
        </a-tooltip>
        <a-tooltip :title="$t('common.help')">
          <button type="button" class="memo-icon-btn" @click="onHelp">
            <QuestionCircleOutlined />
          </button>
        </a-tooltip>
      </div>
    </div>

    <div class="memo-search">
      <div class="memo-search__item">
        <a-select
          v-model:value="search.dateField"
          :options="dateFieldOptions"
          size="small"
          class="memo-search__label-select"
        />
        <div class="memo-search__value">
          <a-date-picker v-model:value="search.inputFrom" size="small" format="YYYYMMDD" :allow-clear="false" class="memo-search__control" />
          <span>-</span>
          <a-date-picker v-model:value="search.inputTo" size="small" format="YYYYMMDD" :allow-clear="false" class="memo-search__control" />
        </div>
      </div>
      <div class="memo-search__item">
        <span class="memo-search__label">{{ $t('field.channel') }}</span>
        <div class="memo-search__value">
          <a-select v-model:value="search.channel" :options="channelOptions" size="small" allow-clear show-search class="memo-search__control" />
        </div>
      </div>
      <div class="memo-search__item">
        <span class="memo-search__label">{{ $t('field.channelGroup') }}</span>
        <div class="memo-search__value">
          <a-select v-model:value="search.channelGroup" :options="channelGroupOptions" size="small" allow-clear show-search class="memo-search__control" />
          <a-checkbox v-model:checked="search.includeChannelGroup">{{ $t('field.includeGroup') }}</a-checkbox>
        </div>
      </div>

      <div class="memo-search__item">
        <span class="memo-search__label">{{ $t('field.brandName') }}</span>
        <div class="memo-search__value">
          <a-select v-model:value="search.brand" :options="brandOptions" size="small" allow-clear show-search class="memo-search__control" />
        </div>
      </div>
      <div class="memo-search__item">
        <span class="memo-search__label">{{ $t('field.inquiryType') }}</span>
        <div class="memo-search__value">
          <a-select v-model:value="search.inquiryType" :options="inquiryTypeOptions" size="small" allow-clear class="memo-search__control" />
        </div>
      </div>
      <div class="memo-search__item">
        <span class="memo-search__label">{{ $t('field.processStatus') }}</span>
        <div class="memo-search__value">
          <a-select v-model:value="search.processStatus" :options="statusOptions" size="small" allow-clear class="memo-search__control" />
        </div>
      </div>

      <div class="memo-search__item">
        <span class="memo-search__label">{{ $t('field.inputUser') }}</span>
        <div class="memo-search__value">
          <a-select v-model:value="search.processStatus" :options="statusOptions" size="small" allow-clear class="memo-search__control" />
        </div>
      </div>
      <div class="memo-search__item">
        <span class="memo-search__label">{{ $t('field.orderer') }}</span>
        <div class="memo-search__value">
          <a-input v-model:value="search.orderer" size="small" allow-clear class="memo-search__control" @press-enter="onSearch" />
          {{ $t('field.startsWith') }}
        </div>
      </div>
      <div class="memo-search__item">
        <span class="memo-search__label">{{ $t('field.receiver') }}</span>
        <div class="memo-search__value">
          <a-input v-model:value="search.receiver" size="small" allow-clear class="memo-search__control" @press-enter="onSearch" />
          {{ $t('field.startsWith') }}
        </div>
      </div>

      <div class="memo-search__item">
        <span class="memo-search__label">{{ $t('field.inputUser') }}</span>
        <div class="memo-search__value">
          <a-checkbox v-model:checked="search.mineOnly">{{ $t('field.mineOnly') }}</a-checkbox>
        </div>
      </div>
      <div class="memo-search__item">
        <span class="memo-search__label">{{ $t('field.memoContent') }}</span>
        <div class="memo-search__value">
          <a-input v-model:value="search.content" size="small" allow-clear class="memo-search__control" @press-enter="onSearch" />
          {{ $t('field.include') }}
        </div>
      </div>
      <div class="memo-search__item">
        <span class="memo-search__label">{{ $t('field.productGroup') }}</span>
        <div class="memo-search__value">
          <a-select v-model:value="search.productGroup" :options="productGroupOptions" size="small" allow-clear class="memo-search__control" />
          {{ $t('field.include') }}
        </div>
      </div>
      <div class="memo-search__item" />

      <div class="memo-search__item memo-search__item--span3">
        <span class="memo-search__label">{{ $t('field.bulkRegister') }}</span>
        <div class="memo-search__value">
          <a-button size="small" class="memo-search__bulk" @click="onBulk">{{ $t('common.bulkByOclick') }}</a-button>
          <a-button size="small" class="memo-search__bulk" @click="onBulk">{{ $t('common.bulkByChannelOrder') }}</a-button>
        </div>
      </div>

      <div class="memo-search__tools">
        <a-select v-model:value="search.pageSize" :options="pageSizeOptions" size="small" style="width: 110px" @change="onPageSizeChange" />
        <div class="flex-1" />
        <span class="memo-search__label">{{ $t('field.sort') }}</span>
        <a-select v-model:value="search.sort1" :options="sortOptions" size="small" style="width: 150px" @change="onSortChange" />
        <a-select v-model:value="search.sort2" :options="sortOptions" size="small" style="width: 150px" @change="onSortChange" />
      </div>
    </div>

    <div ref="gridWrapRef" class="memo-grid ht-theme-main">
      <div ref="hotHostRef" class="memo-grid__host" v-once />
    </div>

    <div class="memo-pager">
      <div class="memo-pager__nav">
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
      <span class="memo-pager__total">{{ $t('common.totalItems', { n: $cf.fncComma(page.total) }) }}</span>
    </div>

    <div class="memo-notes">
      <p>{{ $t('message.orderMemoHintLogin') }}</p>
      <p>{{ $t('message.orderMemoHintDelete') }}</p>
    </div>
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
import { useAppStore } from '@/store/appStore';
import commonFunction from '@/common/utils/commonFunction';
import {
  MEMO_BRANDS,
  MEMO_CHANNEL_GROUPS,
  MEMO_CHANNELS,
  MEMO_PRODUCT_GROUPS,
  MEMO_TYPES,
  createMockMemos,
} from './memoMock';
import { MEMO_FORM_CHANNEL, memoFormUrl, openMemoFormWindow, stashMemoFormPayload } from './memoPopup';
import { orderDetailUrl, openOrderDetailWindow, stashOrderDetailPayload } from './orderDetailPopup';

const { proxy } = getCurrentInstance();
const { t } = useI18n();
const appStore = useAppStore();

defineOptions({ name: 'PgOrderList' });

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

const gridWrapRef = ref(null);
const hotHostRef = ref(null);
const filtered = ref([]);

let hot = null;
let selectedRow = null;
const activeRange = { start: -1, end: -1 };
let openingForm = false;
let openingDetail = false;
let memoChannel = null;

const search = reactive({
  dateField: 'inputDate',
  inputFrom: dayjs(),
  inputTo: dayjs(),
  channel: '',
  channelGroup: '',
  includeChannelGroup: false,
  brand: '',
  inquiryType: '',
  processStatus: '',
  mineOnly: false,
  orderer: '',
  startsWithOrderer: false,
  receiver: '',
  startsWithReceiver: false,
  content: '',
  includeContent: false,
  productGroup: '',
  includeProductGroup: false,
  pageSize: 20,
  sort1: 'inputDtDesc',
  sort2: 'inputDtDesc',
});

const page = reactive({
  current: 1,
  total: 0,
  totalPages: 1,
});

const dateFieldOptions = computed(() => [
  { value: 'inputDate', label: t('field.inputDate') },
  { value: 'alarmDate', label: t('field.alarmDate') },
  { value: 'processDate', label: t('field.processDate') },
]);
const channelOptions = computed(() => MEMO_CHANNELS.map((value) => ({ value, label: value })));
const channelGroupOptions = computed(() => MEMO_CHANNEL_GROUPS.map((value) => ({ value, label: value })));
const brandOptions = computed(() => MEMO_BRANDS.map((value) => ({ value, label: value })));
const productGroupOptions = computed(() => MEMO_PRODUCT_GROUPS.map((value) => ({ value, label: value })));
const inquiryTypeOptions = computed(() => MEMO_TYPES.map((value) => ({ value, label: t(`memoType.${value}`) })));
const statusOptions = computed(() => [
  { value: 'wait', label: t('memoStatus.wait') },
  { value: 'done', label: t('memoStatus.done') },
]);
const sortOptions = computed(() => [
  { value: 'inputDtDesc', label: t('field.inputDtDesc') },
  { value: 'inputDt', label: t('field.inputDt') },
  { value: 'channel', label: t('field.channel') },
  { value: 'orderNo', label: t('field.orderNo') },
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

const matchText = (value, keyword, starts) => {
  if (!keyword) return true;
  const hay = String(value || '').toLowerCase();
  const needle = keyword.trim().toLowerCase();
  if (!needle) return true;
  return starts ? hay.startsWith(needle) : hay.includes(needle);
};

const sortValue = (row, key) => {
  if (key === 'inputDtDesc' || key === 'inputDt') return row.inputDate || '';
  if (key === 'orderNo') return row.orderNo || '';
  return String(row.channel || '').toLowerCase();
};

const compareBy = (key, direction = 1) => (a, b) => {
  const av = sortValue(a, key);
  const bv = sortValue(b, key);
  if (av < bv) return -1 * direction;
  if (av > bv) return 1 * direction;
  return 0;
};

const applySort = (rows) => {
  const dir1 = search.sort1 === 'inputDtDesc' ? -1 : 1;
  const dir2 = search.sort2 === 'inputDtDesc' ? -1 : 1;
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
      memoTypeLabel: t(`memoType.${row.memoType}`),
      statusLabel: t(`memoStatus.${row.status}`),
      orderNoLabel: row.orderNo ? `${row.orderNo} (${row.memoCount || 1})` : '',
    })
  );

const getHot = () => (hot && !hot.isDestroyed ? hot : null);

const replaceGridData = (rows) => {
  const instance = getHot();
  if (!instance) return;
  instance.loadData(rows);
};

const seqRenderer = function (instance, td, row, col, prop, value, cellProperties) {
  Handsontable.renderers.TextRenderer.apply(this, [instance, td, row, col, prop, value, cellProperties]);
  const item = instance.getSourceDataAtRow(row);
  if (item && !item.orderNo) td.classList.add('memo-seq-delete');
  else td.classList.remove('memo-seq-delete');
};

const orderNoRenderer = function (instance, td, row, col, prop, value, cellProperties) {
  Handsontable.renderers.TextRenderer.apply(this, [instance, td, row, col, prop, value, cellProperties]);
  if (value) {
    td.classList.add('memo-order-link');
    td.style.cursor = 'pointer';
  } else {
    td.classList.remove('memo-order-link');
    td.style.cursor = '';
  }
};

const openOrderDetailFromGrid = (row) => {
  if (openingDetail || !row?.orderNo) return;
  openingDetail = true;
  const memos = filtered.value.filter((item) => item.orderNo === row.orderNo);
  const token = stashOrderDetailPayload({ row, memos });
  const popup = openOrderDetailWindow(orderDetailUrl({ orderNo: row.orderNo, token }));
  if (!popup) message.warning(t('message.popupBlocked'));
  window.setTimeout(() => {
    openingDetail = false;
  }, 400);
};

const openModifyFromGrid = (row = null) => {
  if (openingForm) return;
  const instance = getHot();
  const selected = instance?.getSelectedLast?.();
  const current =
    row ||
    selectedRow ||
    (selected && selected[0] >= 0 ? instance.getSourceDataAtRow(selected[0]) : null);
  if (!current) {
    message.warning(t('message.selectRequired'));
    return;
  }
  selectedRow = current;
  openingForm = true;
  openMemoForm('modify', current);
  window.setTimeout(() => {
    openingForm = false;
  }, 400);
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

  const isOrderNo = td.classList.contains('memo-order-link');
  const isSeqDelete = td.classList.contains('memo-seq-delete');
  if (!isOrderNo && !isSeqDelete) return;

  event.preventDefault();
  event.stopPropagation();
  event.isImmediatePropagationEnabled = false;

  const instance = getHot();
  if (!instance) return;
  const coords = instance.getCoords(td);
  if (!coords || coords.row < 0) return;
  const row = instance.getSourceDataAtRow(coords.row);
  if (isSeqDelete) onDeleteNoOrderMemo(row);
  else openOrderDetailFromGrid(row);
};

const createGrid = () => {
  const host = hotHostRef.value;
  if (!host || getHot()) return;

  const wrapHeight = Math.max(120, gridWrapRef.value?.clientHeight || 400);

  hot = markRaw(
    new Handsontable(host, {
      themeName: 'ht-theme-main',
      data: [],
      colHeaders: [
        t('field.seq'),
        t('field.channel'),
        t('field.orderNoMemoCount'),
        t('field.orderer'),
        t('field.receiver'),
        t('field.memoContent'),
        t('field.memoType'),
        t('field.status'),
        t('field.inputDate'),
        t('field.alarmDate'),
        t('field.inputUser'),
        t('field.processDate'),
        t('field.processor'),
      ],
      columns: [
        { data: 'no', className: 'htCenter', readOnly: true, editor: false, renderer: seqRenderer },
        { data: 'channel', readOnly: true, editor: false },
        { data: 'orderNoLabel', readOnly: true, editor: false, renderer: orderNoRenderer },
        { data: 'orderer', readOnly: true, editor: false },
        { data: 'receiver', readOnly: true, editor: false },
        { data: 'content', readOnly: true, editor: false },
        { data: 'memoTypeLabel', className: 'htCenter', readOnly: true, editor: false },
        { data: 'statusLabel', className: 'htCenter', readOnly: true, editor: false },
        { data: 'inputDate', className: 'htCenter', readOnly: true, editor: false },
        { data: 'alarmDate', className: 'htCenter', readOnly: true, editor: false },
        { data: 'inputUser', className: 'htCenter', readOnly: true, editor: false },
        { data: 'processDate', className: 'htCenter', readOnly: true, editor: false },
        { data: 'processor', className: 'htCenter', readOnly: true, editor: false },
      ],
      colWidths: [50, 110, 190, 80, 90, 280, 80, 50, 90, 90, 80, 90, 80],
      height: wrapHeight,
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

const filterMockRows = (rows) => {
  const from = search.inputFrom?.format('YYYYMMDD');
  const to = search.inputTo?.format('YYYYMMDD');
  const myName = appStore.AppActiveUser.name || '';

  return rows.filter((row) => {
    const dateValue = String(row[search.dateField] || '');
    if (from && dateValue && dateValue < from) return false;
    if (to && dateValue && dateValue > to) return false;
    if ((from || to) && !dateValue) return false;
    if (search.channel && row.channel !== search.channel) return false;
    if (search.channelGroup && row.channelGroup !== search.channelGroup) return false;
    if (search.brand && row.brandName !== search.brand) return false;
    if (search.inquiryType && row.memoType !== search.inquiryType) return false;
    if (search.processStatus && row.status !== search.processStatus) return false;
    if (search.mineOnly && row.inputUser !== myName) return false;
    if (!matchText(row.orderer, search.orderer, search.startsWithOrderer)) return false;
    if (!matchText(row.receiver, search.receiver, search.startsWithReceiver)) return false;
    if (search.content && !String(row.content || '').includes(search.content)) return false;
    if (search.productGroup && row.productGroup !== search.productGroup) return false;
    return true;
  });
};

const onSearch = async () => {
  page.current = 1;

  if (USE_MOCK) {
    filtered.value = applySort(filterMockRows(createMockMemos(dayjs().format('YYYYMMDD'))));
    renderPage();
    return;
  }

  const result = await proxy.$api.onApiQueryOrderMemo({
    dateField: search.dateField,
    startDate: search.inputFrom?.format('YYYYMMDD'),
    endDate: search.inputTo?.format('YYYYMMDD'),
    channel: search.channel,
    channelGroup: search.channelGroup,
    includeChannelGroup: search.includeChannelGroup,
    brand: search.brand,
    inquiryType: search.inquiryType,
    processStatus: search.processStatus,
    mineOnly: search.mineOnly,
    orderer: search.orderer,
    startsWithOrderer: search.startsWithOrderer,
    receiver: search.receiver,
    startsWithReceiver: search.startsWithReceiver,
    content: search.content,
    includeContent: search.includeContent,
    productGroup: search.productGroup,
    includeProductGroup: search.includeProductGroup,
    sort1: search.sort1,
    sort2: search.sort2,
    page: 0,
    size: search.pageSize,
  });
  const content = result?.content || result || [];
  filtered.value = applySort(content);
  renderPage();
};

const onReset = () => {
  search.dateField = 'inputDate';
  search.inputFrom = dayjs();
  search.inputTo = dayjs();
  search.channel = '';
  search.channelGroup = '';
  search.includeChannelGroup = false;
  search.brand = '';
  search.inquiryType = '';
  search.processStatus = '';
  search.mineOnly = false;
  search.orderer = '';
  search.startsWithOrderer = false;
  search.receiver = '';
  search.startsWithReceiver = false;
  search.content = '';
  search.includeContent = false;
  search.productGroup = '';
  search.includeProductGroup = false;
  search.pageSize = 20;
  search.sort1 = 'inputDtDesc';
  search.sort2 = 'inputDtDesc';
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

const applySavedMemo = (row) => {
  if (!row) return;
  const index = filtered.value.findIndex((item) => String(item.id) === String(row.id));
  if (index >= 0) filtered.value.splice(index, 1, { ...filtered.value[index], ...row });
  else filtered.value = [{ ...row }, ...filtered.value];
  filtered.value = applySort(filtered.value);
  renderPage();
  message.success(t('message.saved'));
};

const onMemoFormMessage = (event) => {
  if (event.origin && event.origin !== window.location.origin) return;
  if (event.data?.type !== 'order-memo-saved') return;
  applySavedMemo(event.data.row);
};

const openMemoForm = (mode, row = null) => {
  const token = stashMemoFormPayload({ mode, row });
  const href = memoFormUrl({ mode, id: row?.id, token });
  const popup = openMemoFormWindow(href);
  if (!popup) message.warning(t('message.popupBlocked'));
};

const onCreate = () => {
  openMemoForm('create');
};

const onModify = () => {
  openModifyFromGrid();
};

const onDeleteNoOrderMemo = (row) => {
  Modal.confirm({
    title: t('message.name'),
    content: t('message.orderMemoDeleteConfirm'),
    okText: t('common.remove'),
    cancelText: t('common.cancel'),
    okButtonProps: { danger: true },
    async onOk() {
      if (!USE_MOCK) {
        const result = await proxy.$api.onApiRemoveOrderMemo(row.id);
        if (result === null) return;
      }
      filtered.value = filtered.value.filter((item) => String(item.id) !== String(row.id));
      renderPage();
      message.success(t('message.removed'));
    },
  });
};

const onBulk = () => {
  message.info(t('common.ready'));
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
      { title: t('field.channel'), dataIndex: 'channel' },
      { title: t('field.orderNoMemoCount'), dataIndex: 'orderNoLabel' },
      { title: t('field.orderer'), dataIndex: 'orderer' },
      { title: t('field.receiver'), dataIndex: 'receiver' },
      { title: t('field.memoContent'), dataIndex: 'content' },
      { title: t('field.memoType'), dataIndex: 'memoTypeLabel' },
      { title: t('field.status'), dataIndex: 'statusLabel' },
      { title: t('field.inputDate'), dataIndex: 'inputDate' },
      { title: t('field.alarmDate'), dataIndex: 'alarmDate' },
      { title: t('field.inputUser'), dataIndex: 'inputUser' },
      { title: t('field.processDate'), dataIndex: 'processDate' },
      { title: t('field.processor'), dataIndex: 'processor' },
    ],
    `${t('menu.orderList')}_${dayjs().format('YYYYMMDD')}.xlsx`
  );
};

const onOpenWindow = () => {
  window.open(window.location.href, '_blank', 'noopener,noreferrer,width=1440,height=900');
};

const onPrint = () => {
  window.print();
};

const onHelp = () => {
  Modal.info({
    title: t('common.help'),
    content: t('message.orderMemoHelp'),
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
  window.addEventListener('message', onMemoFormMessage);
  if ('BroadcastChannel' in window) {
    memoChannel = new BroadcastChannel(MEMO_FORM_CHANNEL);
    memoChannel.onmessage = (event) => onMemoFormMessage(event);
  }
});

onActivated(() => {
  measureGrid();
  getHot()?.refreshDimensions();
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', measureGrid);
  window.removeEventListener('message', onMemoFormMessage);
  memoChannel?.close();
  memoChannel = null;
  destroyGrid();
});
</script>

<style scoped>
.memo-page {
  display: flex;
  flex-direction: column;
  height: calc(
    100vh - var(--wms-gnb-height) - var(--wms-userbar-height) - var(--wms-tabbar-height) -
      var(--wms-footer-height) - 36px
  );
  background: #fff;
  overflow: hidden;
}

.memo-toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 36px;
  padding: 4px 10px;
  border-bottom: 1px solid var(--wms-border);
  background: #f7f8fa;
}

.memo-toolbar__title {
  font-size: 13px;
  font-weight: 700;
  color: #1e4e79;
  white-space: nowrap;
}

.memo-toolbar__actions {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-left: auto;
}

.memo-toolbar__utils {
  display: flex;
  align-items: center;
  gap: 2px;
  margin-left: 8px;
  padding-left: 8px;
  border-left: 1px solid var(--wms-border);
}

.memo-icon-btn {
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

.memo-icon-btn:hover {
  background: #e8f1f8;
}

.memo-icon-btn--excel {
  color: #217346;
}

.memo-search {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 6px 16px;
  padding: 8px 10px;
  background: #f3f6f8;
  border-bottom: 1px solid var(--wms-border);
}

.memo-search__item {
  display: grid;
  grid-template-columns: 88px minmax(0, 1fr);
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.memo-search__item--span3 {
  grid-column: 1 / -1;
}

.memo-search__label,
.memo-search__label-select {
  color: var(--wms-text-sub);
  font-weight: 600;
  white-space: nowrap;
}

.memo-search__label-select {
  width: 88px;
}

.memo-search__label-select :deep(.ant-select-selector) {
  font-weight: 600;
  color: var(--wms-text-sub);
}

.memo-search__value {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
}

.memo-search__control {
  flex: 1 1 0;
  min-width: 0;
  width: 100%;
}

.memo-search__value :deep(.ant-select),
.memo-search__value :deep(.ant-picker) {
  flex: 1 1 0;
  min-width: 0;
}

.memo-search__value :deep(.ant-checkbox-wrapper) {
  flex: 0 0 auto;
  white-space: nowrap;
}

.memo-search__bulk {
  flex: 1;
}

.memo-search__tools {
  grid-column: 1 / -1;
  display: flex;
  align-items: center;
  gap: 8px;
}

.memo-grid {
  flex: 1;
  min-height: 0;
  position: relative;
  --ht-header-background-color: #d6e7f5;
  --ht-header-foreground-color: #1e4e79;
  --ht-header-font-weight: 700;
  --ht-cell-horizontal-border-color: #c5d8ea;
  --ht-cell-vertical-border-color: #c5d8ea;
}

.memo-grid__host {
  height: 100%;
}

.memo-grid :deep(.active-row-cell) {
  background: #d9edf7 !important;
}

.memo-grid :deep(.ht_clone_top th) {
  background: #d6e7f5;
  color: #1e4e79;
  font-weight: 700;
}

.memo-grid :deep(.wtBorder) {
  pointer-events: none;
}

.memo-grid :deep(td.memo-order-link) {
  color: #1e5aa8;
  text-decoration: underline;
  cursor: pointer;
}

.memo-grid :deep(td.memo-order-link:hover) {
  color: #c41d3a !important;
}

.memo-grid :deep(.memo-seq-delete) {
  color: #1e5aa8;
  text-decoration: underline;
  cursor: pointer;
}

.memo-pager {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 34px;
  padding: 4px 10px;
  border-top: 1px solid var(--wms-border);
  background: #f7f8fa;
}

.memo-pager__nav {
  display: flex;
  align-items: center;
  gap: 2px;
}

.memo-pager__nav button {
  min-width: 24px;
  height: 24px;
  padding: 0 6px;
  border: 1px solid transparent;
  background: transparent;
  color: #1e4e79;
  font-size: 12px;
  cursor: pointer;
}

.memo-pager__nav button:hover:not(:disabled) {
  border-color: #9bb8d3;
  background: #e8f1f8;
}

.memo-pager__nav button.is-active {
  border-color: #3d6d99;
  background: #d6e7f5;
  font-weight: 700;
}

.memo-pager__nav button:disabled {
  color: #aaa;
  cursor: default;
}

.memo-pager__total {
  font-weight: 600;
  color: var(--wms-text);
}

.memo-notes {
  padding: 4px 10px 8px;
  color: #2f6fbf;
  font-size: 12px;
  line-height: 1.5;
}

.memo-notes p {
  margin: 0;
}

@media print {
  .memo-toolbar,
  .memo-search,
  .memo-pager,
  .memo-notes {
    display: none !important;
  }

  .memo-page {
    height: auto;
  }

  .memo-grid {
    overflow: visible;
  }
}
</style>
