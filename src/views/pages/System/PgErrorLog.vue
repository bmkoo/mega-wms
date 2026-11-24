<template>
  <div class="error-log-page">
    <div class="error-log-toolbar">
      <div class="error-log-toolbar__title">※ {{ $t('menu.errorLog') }}</div>
      <div class="error-log-toolbar__actions">
        <a-button size="small" @click="onSearch">
          <template #icon><SearchOutlined /></template>
          {{ $t('common.search') }}
        </a-button>
      </div>
      <div class="error-log-toolbar__utils">
        <a-tooltip :title="$t('common.excelDownload')">
          <button type="button" class="error-log-icon-btn error-log-icon-btn--excel" @click="onExcel">
            <FileExcelOutlined />
          </button>
        </a-tooltip>
        <a-tooltip :title="$t('common.reset')">
          <button type="button" class="error-log-icon-btn" @click="onReset">
            <UndoOutlined />
          </button>
        </a-tooltip>
        <a-tooltip :title="$t('common.openNewWindow')">
          <button type="button" class="error-log-icon-btn" @click="onOpenWindow">
            <DesktopOutlined />
          </button>
        </a-tooltip>
        <a-tooltip :title="$t('common.printPreview')">
          <button type="button" class="error-log-icon-btn" @click="onPrint">
            <PrinterOutlined />
          </button>
        </a-tooltip>
      </div>
    </div>

    <div class="error-log-search">
      <!-- 엔티티 필드마다 검색 조건 1개, 한 행에 4개씩. 문자열=부분일치 / 날짜=기간 / 숫자=최소~최대 -->
      <div class="error-log-search__grid">
        <div v-for="f in FIELDS" :key="f.data" class="error-log-search__item">
          <span class="error-log-search__label" :title="$t(`field.${f.data}`)">{{ $t(`field.${f.data}`) }}</span>
          <a-range-picker
            v-if="f.type === 'date'"
            v-model:value="cond[f.data]"
            size="small"
            format="YYYY-MM-DD"
            class="flex-1"
          />
          <div v-else-if="f.type === 'number'" class="error-log-search__range">
            <a-input-number v-model:value="cond[f.data].min" size="small" :controls="false" @press-enter="onSearch" />
            <span>~</span>
            <a-input-number v-model:value="cond[f.data].max" size="small" :controls="false" @press-enter="onSearch" />
          </div>
          <a-input v-else v-model:value="cond[f.data]" size="small" class="flex-1" allow-clear @press-enter="onSearch" />
        </div>
      </div>
      <div class="error-log-search__row">
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

    <div ref="gridWrapRef" class="error-log-grid ht-theme-main">
      <div ref="hotHostRef" class="error-log-grid__host" v-once />
    </div>

    <div class="error-log-pager">
      <div class="error-log-pager__nav">
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
      <span class="error-log-pager__total">{{ $t('common.totalItems', { n: $cf.fncComma(page.total) }) }}</span>
    </div>
  </div>
</template>

<script setup>
// 이 파일은 scripts/genPage.mjs 가 ErrorLog.java 에서 생성했다. (템플릿: scripts/templates/PgEntity.vue.tpl)
import { computed, getCurrentInstance, markRaw, onActivated, onBeforeUnmount, onMounted, reactive, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { message } from 'ant-design-vue';
import dayjs from 'dayjs';
import Handsontable from 'handsontable';
import 'handsontable/styles/handsontable.css';
import 'handsontable/styles/ht-theme-main.css';
import commonFunction from '@/common/utils/commonFunction';
import { FORM_CHANNEL, formUrl, openFormWindow, stashFormPayload } from './errorLogPopup';

const { proxy } = getCurrentInstance();
const { t } = useI18n();

defineOptions({ name: 'PgErrorLog' });

/** 조회 API: apiFunctions.onApiQueryErrorLog() → GET v1/errorLog */
const queryApi = (params) => proxy.$api.onApiQueryErrorLog(params);

/** 상세 팝업에 넘길 id 를 만드는 @Id 필드. 여러 개면 "값1,값2" 로 이어 붙여 한 구간으로 보낸다 (GET v1/errorLog/{id}) */
const ID_FIELDS = ['id'];

/** 엔티티 필드 → 그리드 컬럼 (헤더는 i18n field.<data>) */
const FIELDS = [
  { data: 'id', type: 'number', className: 'htRight', width: 90 },
  { data: 'phase', type: 'text', className: '', width: 90 },
  { data: 'system', type: 'text', className: '', width: 120 },
  { data: 'loggerName', type: 'text', className: '', width: 220 },
  { data: 'serverName', type: 'text', className: '', width: 120 },
  { data: 'hostName', type: 'text', className: '', width: 120 },
  { data: 'path', type: 'text', className: '', width: 220 },
  { data: 'message', type: 'text', className: '', width: 120 },
  { data: 'trace', type: 'text', className: '', width: 120 },
  { data: 'headerMap', type: 'text', className: '', width: 120 },
  { data: 'parameterMap', type: 'text', className: '', width: 120 },
  { data: 'userInfo', type: 'text', className: '', width: 120 },
];


const gridWrapRef = ref(null);
const hotHostRef = ref(null);
const filtered = ref([]);

let hot = null;
const activeRange = { start: -1, end: -1 };

/** 정렬 값은 "<필드>:asc" / "<필드>:desc" */
const DEFAULT_SEARCH = {
  pageSize: 20,
  sort1: 'id:asc',
  sort2: '',
};

const search = reactive({ ...DEFAULT_SEARCH });

/** 필드별 검색 조건 초기값: 문자열 '' / 날짜 null([시작, 끝]) / 숫자 { min, max } */
const emptyCond = () =>
  Object.fromEntries(
    FIELDS.map((f) => [f.data, f.type === 'number' ? { min: null, max: null } : f.type === 'date' ? null : ''])
  );

const cond = reactive(emptyCond());

const page = reactive({
  current: 1,
  total: 0,
  totalPages: 1,
});

const sortOptions = computed(() => [
  { value: '', label: '-' },
  ...FIELDS.flatMap((f) => [
    { value: `${f.data}:asc`, label: `${t(`field.${f.data}`)} ↑` },
    { value: `${f.data}:desc`, label: `${t(`field.${f.data}`)} ↓` },
  ]),
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

const FIELD_TYPE = Object.fromEntries(FIELDS.map((f) => [f.data, f.type]));

/** 서버 날짜 값(ISO 문자열 / "yyyy-MM-dd HH:mm:ss" / [y, M, d, h, m, s] 배열 / epoch) → dayjs. 없거나 잘못되면 null */
const toDate = (value) => {
  if (value === null || value === undefined || value === '') return null;
  const d = Array.isArray(value)
    ? dayjs(new Date(value[0], (value[1] || 1) - 1, value[2] || 1, value[3] || 0, value[4] || 0, value[5] || 0))
    : dayjs(value);
  return d.isValid() ? d : null;
};

const toNumber = (value) => (value === null || value === undefined || value === '' ? null : Number(value));

/** 정렬용 비교. 빈 값은 방향과 상관없이 항상 뒤로 보낸다 */
const compareBy = (sortValue) => {
  const [key, dir] = sortValue.split(':');
  const sign = dir === 'desc' ? -1 : 1;
  const type = FIELD_TYPE[key];
  const valueOf = (row) => {
    if (type === 'date') return toDate(row[key])?.valueOf() ?? null;
    if (type === 'number') return toNumber(row[key]);
    const text = row[key];
    return text === null || text === undefined || text === '' ? null : String(text);
  };
  return (a, b) => {
    const av = valueOf(a);
    const bv = valueOf(b);
    if (av === null || bv === null) return av === bv ? 0 : av === null ? 1 : -1;
    const diff = typeof av === 'string' ? av.localeCompare(bv, 'ko') : av - bv;
    return diff * sign;
  };
};

const applySort = (rows) => {
  return [...rows].sort((a, b) => {
    const first = search.sort1 ? compareBy(search.sort1)(a, b) : 0;
    if (first !== 0 || !search.sort2 || search.sort2 === search.sort1) return first;
    return compareBy(search.sort2)(a, b);
  });
};

/** 한 행이 필드 하나의 조건을 만족하는지. 조건이 비어 있으면 통과 */
const matchField = (row, f) => {
  const c = cond[f.data];
  if (f.type === 'date') {
    if (!c?.[0] && !c?.[1]) return true;
    const d = toDate(row[f.data]);
    if (!d) return false;
    if (c[0] && d.isBefore(c[0].startOf('day'))) return false;
    if (c[1] && d.isAfter(c[1].endOf('day'))) return false;
    return true;
  }
  if (f.type === 'number') {
    if (c.min === null && c.max === null) return true;
    const n = toNumber(row[f.data]);
    if (n === null || Number.isNaN(n)) return false;
    if (c.min !== null && n < c.min) return false;
    if (c.max !== null && n > c.max) return false;
    return true;
  }
  const keyword = String(c || '').trim().toLowerCase();
  return !keyword || String(row[f.data] ?? '').toLowerCase().includes(keyword);
};

const filterRows = (rows) => rows.filter((row) => FIELDS.every((f) => matchField(row, f)));

/** 서버로 보낼 조건 (비어 있지 않은 것만). 문자열=<필드>, 날짜=<필드>From/To(YYYYMMDD), 숫자=<필드>Min/Max */
const toParams = () => {
  const params = {};
  FIELDS.forEach((f) => {
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

/** 날짜 컬럼은 보기 좋은 문자열로 바꿔서 그리드/엑셀에 넣는다 */
const decorate = (rows, startNo) =>
  rows.map((row, index) => {
    const view = { ...row, no: startNo + index };
    FIELDS.forEach((f) => {
      if (f.type === 'date') view[f.data] = toDate(row[f.data])?.format('YYYY-MM-DD HH:mm:ss') ?? '';
    });
    return markRaw(view);
  });

const getHot = () => (hot && !hot.isDestroyed ? hot : null);

const onAfterSelection = function (row, _col, row2) {
  activeRange.start = row < 0 ? -1 : Math.min(row, row2);
  activeRange.end = row < 0 ? -1 : Math.max(row, row2);
};

/** 순번 셀은 상세 팝업 링크로 보이게 한다 */
const seqRenderer = function (instance, td, row, col, prop, value, cellProperties) {
  Handsontable.renderers.TextRenderer.apply(this, [instance, td, row, col, prop, value, cellProperties]);
  td.classList.add('error-log-seq-link');
};

const idOf = (row) => ID_FIELDS.map((key) => encodeURIComponent(String(row?.[key] ?? ''))).join(',');

let formChannel = null;

/** 상세 팝업에서 저장하면 목록을 다시 조회한다 */
const onFormMessage = (event) => {
  if (event.origin && event.origin !== window.location.origin) return;
  if (event.data?.type !== 'errorLog-saved') return;
  message.success(t('message.saved'));
  onSearch();
};

/** 한 행의 상세 폼 팝업을 연다 */
const openForm = (row) => {
  if (!row) return;
  const token = stashFormPayload({ row });
  const popup = openFormWindow(formUrl({ id: idOf(row), token }));
  if (!popup) message.warning(t('message.popupBlocked'));
};

/** Handsontable 선택 시작보다 먼저 가로채서, 순번 클릭 시 드래그 선택 없이 팝업만 연다 */
const onGridMouseDownCapture = (event) => {
  if (event.button !== 0) return;
  const td = event.target?.closest?.('td');
  if (!td || !td.classList.contains('error-log-seq-link') || !gridWrapRef.value?.contains(td)) return;

  event.preventDefault();
  event.stopPropagation();
  event.isImmediatePropagationEnabled = false;

  const instance = getHot();
  const coords = instance?.getCoords(td);
  if (!coords || coords.row < 0) return;
  openForm(instance.getSourceDataAtRow(coords.row));
};

const createGrid = () => {
  const host = hotHostRef.value;
  if (!host || getHot()) return;

  hot = markRaw(
    new Handsontable(host, {
      themeName: 'ht-theme-main',
      data: [],
      colHeaders: [t('field.seq'), ...FIELDS.map((f) => t(`field.${f.data}`))],
      columns: [
        { data: 'no', className: 'htCenter', readOnly: true, editor: false, renderer: seqRenderer },
        ...FIELDS.map((f) => ({ data: f.data, className: f.className, readOnly: true, editor: false })),
      ],
      colWidths: [50, ...FIELDS.map((f) => f.width)],
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
  getHot()?.loadData(decorate(filtered.value.slice(start, start + size), start + 1));
  activeRange.start = -1;
  activeRange.end = -1;
};

const onSearch = async () => {
  page.current = 1;
  // 서버가 조건을 처리하지 않더라도 아래에서 화면 쪽으로 한 번 더 거른다
  const result = await queryApi(toParams());
  // ax-boot 목록은 { list }, Spring Page 는 { content }, 그 외에는 배열 그대로 온다
  const list = result?.list || result?.content || result || [];
  filtered.value = applySort(filterRows(Array.isArray(list) ? list : []));
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

const onExcel = () => {
  if (!filtered.value.length) {
    message.warning(t('common.noData'));
    return;
  }
  commonFunction.fncExportExcel(
    decorate(filtered.value, 1),
    [
      { title: t('field.seq'), dataIndex: 'no' },
      ...FIELDS.map((f) => ({ title: t(`field.${f.data}`), dataIndex: f.data })),
    ],
    `${t('menu.errorLog')}_${dayjs().format('YYYYMMDD')}.xlsx`
  );
};

const onOpenWindow = () => {
  window.open(window.location.href, '_blank', 'noopener,noreferrer,width=1440,height=900');
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
  window.addEventListener('message', onFormMessage);
  if ('BroadcastChannel' in window) {
    formChannel = new BroadcastChannel(FORM_CHANNEL);
    formChannel.onmessage = (event) => onFormMessage(event);
  }
});

onActivated(() => {
  measureGrid();
  getHot()?.refreshDimensions();
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', measureGrid);
  window.removeEventListener('message', onFormMessage);
  formChannel?.close();
  formChannel = null;
  destroyGrid();
});
</script>

<style scoped>
.error-log-page {
  display: flex;
  flex-direction: column;
  height: calc(
    100vh - var(--wms-gnb-height) - var(--wms-userbar-height) - var(--wms-tabbar-height) -
      var(--wms-footer-height) - 36px
  );
  background: #fff;
  overflow: hidden;
}

.error-log-toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 36px;
  padding: 4px 10px;
  border-bottom: 1px solid var(--wms-border);
  background: #f7f8fa;
}

.error-log-toolbar__title {
  font-size: 13px;
  font-weight: 700;
  color: #1e4e79;
  white-space: nowrap;
}

.error-log-toolbar__actions {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-left: auto;
}

.error-log-toolbar__utils {
  display: flex;
  align-items: center;
  gap: 2px;
  margin-left: 8px;
  padding-left: 8px;
  border-left: 1px solid var(--wms-border);
}

.error-log-icon-btn {
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

.error-log-icon-btn:hover {
  background: #e8f1f8;
}

.error-log-icon-btn--excel {
  color: #217346;
}

.error-log-search {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 8px 10px;
  background: #f3f6f8;
  border-bottom: 1px solid var(--wms-border);
}

.error-log-search__row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.error-log-search__grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 6px 16px;
}

.error-log-search__item {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
}

.error-log-search__label {
  flex: 0 0 96px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 12px;
  color: var(--wms-text);
}

.error-log-search__range {
  display: flex;
  flex: 1;
  align-items: center;
  gap: 4px;
  min-width: 0;
}

.error-log-search__range :deep(.ant-input-number) {
  flex: 1;
  min-width: 0;
}

.error-log-grid {
  flex: 1;
  min-height: 0;
  position: relative;
  /*
   * 행 높이 = --ht-line-height + 2 × --ht-cell-vertical-padding + 테두리 1px
   * 기본 테마: 20 + 2×4 + 1 = 29px → 여기서는 18 + 2×2 + 1 = 23px
   * (Handsontable 이 그리드를 만들 때 이 값으로 행 높이를 계산한다)
   */
  --ht-line-height: 18px;
  --ht-cell-vertical-padding: 2px;
  --ht-header-background-color: #d6e7f5;
  --ht-header-foreground-color: #1e4e79;
  --ht-header-font-weight: 700;
  --ht-cell-horizontal-border-color: #c5d8ea;
  --ht-cell-vertical-border-color: #c5d8ea;
}

.error-log-grid__host {
  height: 100%;
}

.error-log-grid :deep(.active-row-cell) {
  background: #d9edf7 !important;
}

.error-log-grid :deep(.ht_clone_top th) {
  background: #d6e7f5;
  color: #1e4e79;
  font-weight: 700;
}

.error-log-grid :deep(.wtBorder) {
  pointer-events: none;
}

.error-log-grid :deep(td.error-log-seq-link) {
  color: #1e5aa8;
  text-decoration: underline;
  cursor: pointer;
}

.error-log-grid :deep(td.error-log-seq-link:hover) {
  color: #c41d3a !important;
}

.error-log-pager {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 34px;
  padding: 4px 10px;
  border-top: 1px solid var(--wms-border);
  background: #f7f8fa;
}

.error-log-pager__nav {
  display: flex;
  align-items: center;
  gap: 2px;
}

.error-log-pager__nav button {
  min-width: 24px;
  height: 24px;
  padding: 0 6px;
  border: 1px solid transparent;
  background: transparent;
  color: #1e4e79;
  font-size: 12px;
  cursor: pointer;
}

.error-log-pager__nav button:hover:not(:disabled) {
  border-color: #9bb8d3;
  background: #e8f1f8;
}

.error-log-pager__nav button.is-active {
  border-color: #3d6d99;
  background: #d6e7f5;
  font-weight: 700;
}

.error-log-pager__nav button:disabled {
  color: #aaa;
  cursor: default;
}

.error-log-pager__total {
  font-weight: 600;
  color: var(--wms-text);
}

@media print {
  .error-log-toolbar,
  .error-log-search,
  .error-log-pager {
    display: none !important;
  }

  .error-log-page {
    height: auto;
  }

  .error-log-grid {
    overflow: visible;
  }
}
</style>
