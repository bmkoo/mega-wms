<template>
  <div class="inventory-page">
    <div class="inventory-toolbar">
      <div class="inventory-toolbar__title">※ {{ $t('menu.inventory') }}</div>
      <div class="inventory-toolbar__actions">
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
        <a-button size="small" @click="onOpenSave">
          <template #icon><SaveOutlined /></template>
          {{ $t('common.openSave') }}
        </a-button>
        <a-button size="small" @click="onSelectAll">{{ $t('common.selectAll') }}</a-button>
        <a-button size="small" @click="onDeleteSelected">{{ $t('common.deleteSelected') }}</a-button>
        <a-button size="small" @click="toggleSearchPanel">
          <template #icon>
            <UpOutlined v-if="searchPanelOpen" />
            <DownOutlined v-else />
          </template>
          {{ searchPanelOpen ? $t('common.collapseSearch') : $t('common.expandSearch') }}
        </a-button>
      </div>
      <div class="inventory-toolbar__utils">
        <a-tooltip :title="$t('common.excelDownload')">
          <button type="button" class="inventory-icon-btn inventory-icon-btn--excel" @click="onExcel">
            <FileExcelOutlined />
          </button>
        </a-tooltip>
        <a-tooltip :title="$t('common.reset')">
          <button type="button" class="inventory-icon-btn" @click="onReset">
            <UndoOutlined />
          </button>
        </a-tooltip>
        <a-tooltip :title="$t('common.openNewWindow')">
          <button type="button" class="inventory-icon-btn" @click="onOpenWindow">
            <DesktopOutlined />
          </button>
        </a-tooltip>
        <a-tooltip :title="$t('common.printPreview')">
          <button type="button" class="inventory-icon-btn" @click="onPrint">
            <PrinterOutlined />
          </button>
        </a-tooltip>
      </div>
    </div>

    <div v-show="searchPanelOpen" class="inventory-search">
      <!-- 엔티티 필드마다 검색 조건 1개, 한 행에 4개씩. 문자열=부분일치 / 날짜=기간 / 숫자=최소~최대 / 공통코드=선택 -->
      <div class="inventory-search__grid">
        <div v-for="f in FIELDS" :key="f.data" class="inventory-search__item">
          <span class="inventory-search__label" :title="$t(`field.${f.data}`)">{{ $t(`field.${f.data}`) }}</span>
          <a-range-picker
            v-if="f.type === 'date'"
            v-model:value="cond[f.data]"
            size="small"
            format="YYYY-MM-DD"
            class="flex-1"
          />
          <div v-else-if="f.type === 'number'" class="inventory-search__range">
            <a-input-number v-model:value="cond[f.data].min" size="small" :controls="false" @press-enter="onSearch" />
            <span>~</span>
            <a-input-number v-model:value="cond[f.data].max" size="small" :controls="false" @press-enter="onSearch" />
          </div>
          <a-select
            v-else-if="f.type === 'code'"
            v-model:value="cond[f.data]"
            :options="[{ value: '', label: $t('common.all') }, ...codeStore.options(f.codeGroup)]"
            size="small"
            class="flex-1"
          />
          <a-input v-else v-model:value="cond[f.data]" size="small" class="flex-1" allow-clear @press-enter="onSearch" />
        </div>
      </div>
      <div class="inventory-search__row">
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

    <div ref="gridWrapRef" class="inventory-grid ht-theme-main">
      <div ref="hotHostRef" class="inventory-grid__host" v-once />
    </div>

    <div class="inventory-pager">
      <div class="inventory-pager__nav">
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
      <span class="inventory-pager__total">{{ $t('common.totalItems', { n: $cf.fncComma(page.total) }) }}</span>
    </div>
  </div>
</template>

<script setup>
// 이 파일은 scripts/genPage.mjs 가 Inventory.java 에서 생성했다. (템플릿: scripts/templates/PgEntity.vue.tpl)
import { computed, getCurrentInstance, markRaw, nextTick, onActivated, onBeforeUnmount, onMounted, reactive, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { Modal, message } from 'ant-design-vue';
import dayjs from 'dayjs';
import Handsontable from 'handsontable';
import 'handsontable/styles/handsontable.css';
import 'handsontable/styles/ht-theme-main.css';
import commonFunction from '@/common/utils/commonFunction';
import { useCommonCodeStore } from '@/store/commonCodeStore';
import { FORM_CHANNEL, formUrl, openFormWindow, stashFormPayload } from './inventoryPopup';

const { proxy } = getCurrentInstance();
const { t } = useI18n();
/** 공통코드 (type: 'code' 필드의 코드명/선택 목록). 로그인 후 router 에서 미리 불러둔다 */
const codeStore = useCommonCodeStore();

defineOptions({ name: 'PgInventory' });

/** 조회 API: apiFunctions.onApiInventory() → GET v1/inventory */
const queryApi = (params) => proxy.$api.onApiInventory(params);

/**
 * 행을 구분하는 @Id 필드. 여러 개면 "값1,값2" 로 이어 붙인다.
 * 쓰는 곳: 수정 셀 표시·선택삭제의 행 구분, 그리드 편집 잠금(읽기 전용), 상세 팝업 id (GET v1/inventory/{id})
 */
const ID_FIELDS = ['productCd'];

/** 엔티티 필드 → 그리드 컬럼 (헤더는 i18n field.<data>) */
const FIELDS = [
  { data: 'productCd', type: 'text', className: '', width: 120 },
  // 상품명: 상품마스터(TB_PRODUCT.PRODUCT_NM) — Inventory.product 에서 꺼낸 값. 화면 표시·검색용이라 편집 불가
  { data: 'productNm', type: 'text', className: '', width: 260, readOnly: true },
  { data: 'currentQty', type: 'number', className: 'htRight', width: 90 },
  { data: 'allocatedQty', type: 'number', className: 'htRight', width: 90 },
  { data: 'availableQty', type: 'number', className: 'htRight', width: 90 },
  { data: 'prevMonthQty', type: 'number', className: 'htRight', width: 90 },
  { data: 'safetyQty', type: 'number', className: 'htRight', width: 90 },
];

/** 가로 스크롤해도 고정할 왼쪽 컬럼 수: 선택 체크박스 + 순번 + @Id 필드 */
const FIXED_COLUMNS = 2 + ID_FIELDS.length;

const gridWrapRef = ref(null);
const hotHostRef = ref(null);
const filtered = ref([]);
/** 검색 영역 펼침/접힘 (툴바 버튼) */
const searchPanelOpen = ref(true);

let hot = null;
/** 마지막으로 선택한 행 (수정 버튼 대상) */
let selectedRow = null;
const activeRange = { start: -1, end: -1 };
/** 그리드에서 값을 바꾼 셀 ("<id>::<필드>") 과 바꾸기 전 원래 값. 원래 값으로 되돌리면 표시가 사라진다 */
const changedCellKeys = new Set();
const originalCellValues = new Map();

/** 정렬 값은 "<필드>:asc" / "<필드>:desc" */
const DEFAULT_SEARCH = {
  pageSize: 20,
  sort1: 'productCd:asc',
  sort2: '',
};

const search = reactive({ ...DEFAULT_SEARCH });

/** 필드별 검색 조건 초기값: 문자열·공통코드 '' / 날짜 null([시작, 끝]) / 숫자 { min, max } */
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
const FIELD_BY_KEY = Object.fromEntries(FIELDS.map((f) => [f.data, f]));

/** 공통코드 필드 값 → 코드명 (그룹·코드가 없으면 코드값 그대로) */
const codeName = (f, value) => codeStore.name(f.codeGroup, value);

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
    // 공통코드는 화면에 보이는 코드명 기준으로 정렬한다
    const text = type === 'code' ? codeName(FIELD_BY_KEY[key], row[key]) : row[key];
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
  if (f.type === 'code') return !c || String(row[f.data] ?? '') === c; // 공통코드는 정확히 일치
  const keyword = String(c || '').trim().toLowerCase();
  return !keyword || String(row[f.data] ?? '').toLowerCase().includes(keyword);
};

const filterRows = (rows) => rows.filter((row) => FIELDS.every((f) => matchField(row, f)));

/** 서버로 보낼 조건 (비어 있지 않은 것만). 문자열·공통코드=<필드>, 날짜=<필드>From/To(YYYYMMDD), 숫자=<필드>Min/Max */
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
  selectedRow = row < 0 ? null : this.getSourceDataAtRow(row) || null;
};

const idOf = (row) => ID_FIELDS.map((key) => encodeURIComponent(String(row?.[key] ?? ''))).join(',');

/** 잘린 셀의 전체 내용을 마우스 오버 시 기본 툴팁으로 보여준다 */
const setCellTooltip = (td) => {
  const text = String(td.textContent || '').trim();
  if (text) td.title = text;
  else td.removeAttribute('title');
};

const textRenderer = function (instance, td, row, col, prop, value, cellProperties) {
  Handsontable.renderers.TextRenderer.apply(this, [instance, td, row, col, prop, value, cellProperties]);
  setCellTooltip(td);
};

/** 숫자 컬럼은 1000 단위 콤마로 보여준다. 데이터는 숫자 그대로라 정렬·검색·엑셀에는 영향이 없다 */
const commaRenderer = function (instance, td, row, col, prop, value, cellProperties) {
  Handsontable.renderers.TextRenderer.apply(this, [instance, td, row, col, prop, commonFunction.fncComma(value), cellProperties]);
  setCellTooltip(td);
};

/** 콤마를 붙일 숫자 컬럼인지 (@Id 숫자 필드는 제외) */
const isCommaField = (f) => f.type === 'number' && !f.id;

/** 공통코드 컬럼은 코드 대신 코드명을 보여준다. 데이터는 코드 그대로 (검색·팝업·저장은 코드 기준) */
const codeRendererOf = (f) =>
  function (instance, td, row, col, prop, value, cellProperties) {
    Handsontable.renderers.TextRenderer.apply(this, [instance, td, row, col, prop, codeName(f, value), cellProperties]);
    setCellTooltip(td);
  };

/** 첫 @Id 셀은 상세 팝업 링크로 보이게 한다 */
const detailLinkRenderer = function (instance, td, row, col, prop, value, cellProperties) {
  Handsontable.renderers.TextRenderer.apply(this, [instance, td, row, col, prop, value, cellProperties]);
  td.classList.add('inventory-detail-link');
  setCellTooltip(td);
};

let formChannel = null;

/** 상세 팝업에서 저장하면 목록을 다시 조회한다 */
const onFormMessage = (event) => {
  if (event.origin && event.origin !== window.location.origin) return;
  if (event.data?.type !== 'inventory-saved') return;
  message.success(t('message.saved'));
  onSearch();
};

/** 상세 폼 팝업을 연다. 행이 없거나 @Id 가 비어 있으면 신규 입력 폼 */
const openForm = (row = {}) => {
  const token = stashFormPayload({ row });
  const hasId = ID_FIELDS.some((key) => row[key] !== null && row[key] !== undefined && row[key] !== '');
  const popup = openFormWindow(formUrl({ id: hasId ? idOf(row) : '', token }));
  if (!popup) message.warning(t('message.popupBlocked'));
};

/** Handsontable 선택 시작보다 먼저 가로채서, 첫 @Id 셀 클릭 시 드래그 선택 없이 팝업만 연다 */
const onGridMouseDownCapture = (event) => {
  if (event.button !== 0) return;
  const td = event.target?.closest?.('td');
  if (!td || !td.classList.contains('inventory-detail-link') || !gridWrapRef.value?.contains(td)) return;

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
      colHeaders: [t('common.select'), t('field.seq'), ...FIELDS.map((f) => t(`field.${f.data}`))],
      columns: [
        { data: 'checked', className: 'htCenter', type: 'checkbox', readOnly: false },
        { data: 'no', className: 'htCenter', readOnly: true, editor: false, renderer: textRenderer },
        // @Id 필드는 읽기 전용, 나머지는 셀에서 바로 고칠 수 있다 (바뀐 셀은 노란색으로 표시)
        ...FIELDS.map((f) => ({
          data: f.data,
          className: f.className,
          readOnly: ID_FIELDS.includes(f.data) || !!f.readOnly,
          editor: ID_FIELDS.includes(f.data) || f.readOnly ? false : undefined,
          renderer: textRenderer,
          ...(isCommaField(f) ? { renderer: commaRenderer } : {}),
          ...(f.type === 'code' ? { renderer: codeRendererOf(f) } : {}),
          ...(f.data === ID_FIELDS[0] ? { renderer: detailLinkRenderer } : {}),
        })),
      ],
      colWidths: [44, 50, ...FIELDS.map((f) => f.width)],
      height: Math.max(120, gridWrapRef.value?.clientHeight || 400),
      width: '100%',
      stretchH: 'all',
      fixedColumnsStart: FIXED_COLUMNS,
      rowHeaders: false,
      manualColumnResize: true,
      fillHandle: false,
      wordWrap: false,
      imeFastEdit: false,
      autoRowSize: false,
      autoColumnSize: false,
      licenseKey: 'non-commercial-and-evaluation',
      beforeRenderer(td, row, _col, prop) {
        if (activeRange.start >= 0 && row >= activeRange.start && row <= activeRange.end) {
          td.classList.add('active-row-cell');
        } else {
          td.classList.remove('active-row-cell');
        }
        const sourceRow = this.getSourceDataAtRow(row);
        const key = `${idOf(sourceRow)}::${String(prop)}`;
        td.classList.toggle('changed-cell', changedCellKeys.has(key));
      },
      /** 셀 편집·체크를 조회 결과(filtered)에도 반영해 페이지를 넘겨도 유지한다 */
      afterChange(changes, source) {
        if (!changes || source === 'loadData') return;
        changes.forEach(([rowIndex, prop, oldValue, value]) => {
          const changedRow = this.getSourceDataAtRow(rowIndex);
          const original = filtered.value.find((row) => idOf(row) === idOf(changedRow));
          if (!original) return;
          if (prop === 'checked') {
            original.checked = !!value;
            return;
          }
          const key = `${idOf(changedRow)}::${String(prop)}`;
          if (!originalCellValues.has(key)) originalCellValues.set(key, oldValue);
          if (Object.is(value, originalCellValues.get(key))) changedCellKeys.delete(key);
          else changedCellKeys.add(key);
          original[prop] = value;
        });
        this.render();
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
  selectedRow = null;
  activeRange.start = -1;
  activeRange.end = -1;
};

const onSearch = async () => {
  page.current = 1;
  changedCellKeys.clear();
  originalCellValues.clear();
  // 서버가 조건을 처리하지 않더라도 아래에서 화면 쪽으로 한 번 더 거른다
  const result = await queryApi(toParams());
  // ax-boot 목록은 { list }, Spring Page 는 { content }, 그 외에는 배열 그대로 온다
  const list = result?.list || result?.content || result || [];
  // 상품명은 연결된 상품마스터(product)에서 꺼내 행에 펼친다. 상품마스터에 없는 품번이면 product 가 null → 빈 값
  const rows = (Array.isArray(list) ? list : []).map((row) => ({ ...row, productNm: row.product?.productNm ?? '' }));
  filtered.value = applySort(filterRows(rows));
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

const onCreate = () => openForm();

const onModify = () => {
  if (!selectedRow) {
    message.warning(t('message.selectRequired'));
    return;
  }
  openForm(selectedRow);
};

/** 조회 결과 전체를 체크한다. 이미 모두 체크되어 있으면 전체 해제 */
const onSelectAll = () => {
  if (!filtered.value.length) return;
  const checked = filtered.value.some((row) => !row.checked);
  filtered.value.forEach((row) => {
    row.checked = checked;
  });
  renderPage();
};

/** 체크한 행을 목록에서 뺀다 (화면에서만. 서버 삭제 API 는 아직 연결하지 않았다) */
const onDeleteSelected = () => {
  const selected = filtered.value.filter((row) => row.checked);
  if (!selected.length) {
    message.warning(t('message.selectRequired'));
    return;
  }
  Modal.confirm({
    title: t('common.confirm'),
    content: t('message.removeConfirm'),
    okText: t('common.confirm'),
    cancelText: t('common.cancel'),
    onOk: () => {
      const ids = new Set(selected.map((row) => idOf(row)));
      filtered.value = filtered.value.filter((row) => !ids.has(idOf(row)));
      renderPage();
      message.success(t('message.removed'));
    },
  });
};

/** 저장 (아직 서버 저장 API 를 연결하지 않아 완료 메시지만 띄운다) */
const onOpenSave = () => message.success(t('message.saved'));

const toggleSearchPanel = () => {
  searchPanelOpen.value = !searchPanelOpen.value;
  nextTick(() => {
    measureGrid();
    getHot()?.refreshDimensions();
  });
};

const onExcel = () => {
  if (!filtered.value.length) {
    message.warning(t('common.noData'));
    return;
  }
  // 공통코드 컬럼은 엑셀에 코드명으로 넣는다
  const codeFields = FIELDS.filter((f) => f.type === 'code');
  const rows = decorate(filtered.value, 1).map((row) => {
    if (!codeFields.length) return row;
    const view = { ...row };
    codeFields.forEach((f) => {
      view[f.data] = codeName(f, row[f.data]);
    });
    return view;
  });
  commonFunction.fncExportExcel(
    rows,
    [
      { title: t('field.seq'), dataIndex: 'no' },
      ...FIELDS.map((f) => ({ title: t(`field.${f.data}`), dataIndex: f.data })),
    ],
    `${t('menu.inventory')}_${dayjs().format('YYYYMMDD')}.xlsx`
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
  // 공통코드가 그리드보다 늦게 도착하면 코드명으로 다시 그린다 (이미 불러왔으면 바로 끝남)
  codeStore.load().then(() => getHot()?.render());
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
.inventory-page {
  display: flex;
  flex-direction: column;
  height: calc(
    100vh - var(--wms-gnb-height) - var(--wms-userbar-height) - var(--wms-tabbar-height) -
      var(--wms-footer-height) - 36px
  );
  background: #fff;
  overflow: hidden;
}

.inventory-toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 36px;
  padding: 4px 10px;
  border-bottom: 1px solid var(--wms-border);
  background: #f7f8fa;
}

.inventory-toolbar__title {
  font-size: 13px;
  font-weight: 700;
  color: #1e4e79;
  white-space: nowrap;
}

.inventory-toolbar__actions {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-left: auto;
}

.inventory-toolbar__utils {
  display: flex;
  align-items: center;
  gap: 2px;
  margin-left: 8px;
  padding-left: 8px;
  border-left: 1px solid var(--wms-border);
}

.inventory-icon-btn {
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

.inventory-icon-btn:hover {
  background: #e8f1f8;
}

.inventory-icon-btn--excel {
  color: #217346;
}

.inventory-search {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 8px 10px;
  background: #f3f6f8;
  border-bottom: 1px solid var(--wms-border);
}

.inventory-search__row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.inventory-search__grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 6px 16px;
}

.inventory-search__item {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
}

.inventory-search__label {
  flex: 0 0 96px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 12px;
  color: var(--wms-text);
}

.inventory-search__range {
  display: flex;
  flex: 1;
  align-items: center;
  gap: 4px;
  min-width: 0;
}

.inventory-search__range :deep(.ant-input-number) {
  flex: 1;
  min-width: 0;
}

.inventory-grid {
  flex: 1;
  min-height: 0;
  position: relative;
  --ht-header-background-color: #d6e7f5;
  --ht-header-foreground-color: #1e4e79;
  --ht-header-font-weight: 700;
  --ht-cell-horizontal-border-color: #c5d8ea;
  --ht-cell-vertical-border-color: #c5d8ea;
}

.inventory-grid__host {
  height: 100%;
}

.inventory-grid :deep(.active-row-cell) {
  background: #d9edf7 !important;
}

.inventory-grid :deep(.changed-cell) {
  background: #fff1b8 !important;
}

.inventory-grid :deep(.handsontable td),
.inventory-grid :deep(.handsontable th) {
  font-size: 12px;
}

.inventory-grid :deep(.ht_clone_top th) {
  background: #d6e7f5;
  color: #1e4e79;
  font-weight: 700;
}

.inventory-grid :deep(.wtBorder) {
  pointer-events: none;
}

.inventory-grid :deep(td.inventory-detail-link) {
  color: #1e5aa8;
  text-decoration: underline;
  cursor: pointer;
}

.inventory-grid :deep(td.inventory-detail-link:hover) {
  color: #c41d3a !important;
}

.inventory-pager {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 34px;
  padding: 4px 10px;
  border-top: 1px solid var(--wms-border);
  background: #f7f8fa;
}

.inventory-pager__nav {
  display: flex;
  align-items: center;
  gap: 2px;
}

.inventory-pager__nav button {
  min-width: 24px;
  height: 24px;
  padding: 0 6px;
  border: 1px solid transparent;
  background: transparent;
  color: #1e4e79;
  font-size: 12px;
  cursor: pointer;
}

.inventory-pager__nav button:hover:not(:disabled) {
  border-color: #9bb8d3;
  background: #e8f1f8;
}

.inventory-pager__nav button.is-active {
  border-color: #3d6d99;
  background: #d6e7f5;
  font-weight: 700;
}

.inventory-pager__nav button:disabled {
  color: #aaa;
  cursor: default;
}

.inventory-pager__total {
  font-weight: 600;
  color: var(--wms-text);
}

@media print {
  .inventory-toolbar,
  .inventory-search,
  .inventory-pager {
    display: none !important;
  }

  .inventory-page {
    height: auto;
  }

  .inventory-grid {
    overflow: visible;
  }
}
</style>
