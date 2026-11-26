<template>
  <div class="order-raw-page">
    <div class="order-raw-toolbar">
      <div class="order-raw-toolbar__title">※ {{ $t('menu.orderRaw') }}</div>
      <div class="order-raw-toolbar__actions">
        <a-button size="small" @click="onSearch">
          <template #icon><SearchOutlined /></template>
          {{ $t('common.search') }}
        </a-button>
        <a-button size="small" :loading="moving" @click="onDataMove">
          <template #icon><SwapOutlined /></template>
          {{ $t('common.dataMove') }}<template v-if="checkedCount"> ({{ checkedCount }})</template>
        </a-button>
        <a-button size="small" @click="onSelectAll">{{ $t('common.selectAll') }}</a-button>
        <a-button size="small" @click="onDeleteSelected">{{ $t('common.deleteSelected') }}</a-button>
        <a-button size="small" type="primary" :disabled="!excelUpload" :loading="uploading" @click="onSaveExcel">
          <template #icon><SaveOutlined /></template>
          {{ $t('common.save') }}
        </a-button>
        <input ref="excelInputRef" type="file" accept=".xls,.xlsx" style="display: none" @change="onExcelFile" />
        <a-button size="small" @click="toggleSearchPanel">
          <template #icon>
            <UpOutlined v-if="searchPanelOpen" />
            <DownOutlined v-else />
          </template>
          {{ searchPanelOpen ? $t('common.collapseSearch') : $t('common.expandSearch') }}
        </a-button>
      </div>
      <div class="order-raw-toolbar__utils">
        <a-tooltip :title="$t('common.excelDownload')">
          <button type="button" class="order-raw-icon-btn order-raw-icon-btn--excel" @click="onExcel">
            <FileExcelOutlined />
          </button>
        </a-tooltip>
        <a-tooltip :title="$t('common.reset')">
          <button type="button" class="order-raw-icon-btn" @click="onReset">
            <UndoOutlined />
          </button>
        </a-tooltip>
        <a-tooltip :title="$t('common.openNewWindow')">
          <button type="button" class="order-raw-icon-btn" @click="onOpenWindow">
            <DesktopOutlined />
          </button>
        </a-tooltip>
        <a-tooltip :title="$t('common.printPreview')">
          <button type="button" class="order-raw-icon-btn" @click="onPrint">
            <PrinterOutlined />
          </button>
        </a-tooltip>
      </div>
    </div>

    <!-- 엑셀 미리보기 중: 그리드의 행은 아직 DB 에 없다 -->
    <div v-if="excelUpload" class="order-raw-upload-bar">
      <span>{{ $t('message.excelPreview', { file: excelUpload.fileName, type: excelUpload.type, n: $cf.fncComma(filtered.length) }) }}</span>
      <a-button size="small" @click="cancelExcel">{{ $t('common.cancel') }}</a-button>
    </div>

    <!-- API 수집 기간 선택 -->
    <a-modal
        v-model:open="collect.open"
        :title="collect.kind === 'GODOMALL' ? $t('common.godomallApi') : $t('common.shoplinkerApi')"
        :confirm-loading="collect.loading"
        :ok-text="$t('common.confirm')"
        :cancel-text="$t('common.cancel')"
        :mask-closable="false"
        @ok="onCollect"
    >
      <div class="order-raw-collect">
        <span class="order-raw-collect__label">{{ $t('common.collectPeriod') }}</span>
        <a-range-picker v-model:value="collect.range" format="YYYY-MM-DD" />
        <template v-if="collect.kind === 'SHOPLINKER'">
          <span class="order-raw-collect__label">{{ $t('common.orderFlag') }}</span>
          <a-select v-model:value="collect.orderFlag" :options="ORDER_FLAG_OPTIONS" style="width: 240px" />
          <a-alert v-if="collect.orderFlag === '000'" class="order-raw-collect__warn" type="warning" show-icon :message="$t('message.orderFlag000Warn')" />
        </template>
      </div>
    </a-modal>

    <div v-show="searchPanelOpen" class="order-raw-search">
      <!-- 주문구분: 전체 / 샵링커(입력소스 XLS_SHOPLINKER·API_SHOPLINKER) / 자사몰(그 외). 바꾸면 바로 다시 조회 -->
      <div class="order-raw-search__row">
        <span class="order-raw-search__label">{{ $t('field.orderSource') }}</span>
        <a-radio-group
            v-model:value="search.orderSource"
            :options="orderSourceOptions"
            option-type="button"
            button-style="solid"
            size="small"
            @change="onSearch"
        />
        <!-- 전송여부: Y(이관됨) / N(이관 전). 값은 cond.transferYn (기본 N). 바꾸면 바로 다시 조회 -->
        <span class="order-raw-search__label" style="margin-left: 24px">{{ $t('field.transferYn') }}</span>
        <a-select
            v-model:value="cond.transferYn"
            :options="selectOptions.transferYn"
            size="small"
            style="width: 80px"
            @change="onSearch"
        />
        <!-- 주문 가져오기 (주문구분 줄): 엑셀 3종 + API 2종 -->
        <div class="order-raw-search__import">
          <!-- 엑셀: 브라우저에서 읽어 그리드에 표시 → [저장] 으로 DB 저장 (파일은 서버로 올리지 않음) -->
          <a-button size="small" @click="pickExcel('SHOPLINKER')">
            <template #icon><FileExcelOutlined /></template>
            {{ $t('common.shoplinkerExcel') }}
          </a-button>
          <a-button size="small" @click="pickExcel('NAVER')">
            <template #icon><FileExcelOutlined /></template>
            {{ $t('common.naverExcel') }}
          </a-button>
          <a-button size="small" @click="pickExcel('MALL')">
            <template #icon><FileExcelOutlined /></template>
            {{ $t('common.mallExcel') }}
          </a-button>
          <!-- API: 기간을 골라 수집 → 바로 TB_ORDER_RAW 저장 -->
          <a-button size="small" @click="openCollect('GODOMALL')">
            <template #icon><CloudDownloadOutlined /></template>
            {{ $t('common.godomallApi') }}
          </a-button>
          <a-button size="small" @click="openCollect('SHOPLINKER')">
            <template #icon><CloudDownloadOutlined /></template>
            {{ $t('common.shoplinkerApi') }}
          </a-button>
        </div>
      </div>
      <!-- 엔티티 필드마다 검색 조건 1개, 한 행에 4개씩. 문자열=부분일치 / 날짜=기간 / 숫자=최소~최대 / 공통코드=선택 -->
      <div class="order-raw-search__grid">
        <div v-for="f in GRID_SEARCH_FIELDS" :key="f.data" class="order-raw-search__item">
          <span class="order-raw-search__label" :title="$t(`field.${f.data}`)">{{ $t(`field.${f.data}`) }}</span>
          <a-range-picker
              v-if="f.type === 'date'"
              v-model:value="cond[f.data]"
              size="small"
              format="YYYY-MM-DD"
              class="flex-1"
          />
          <div v-else-if="f.type === 'number'" class="order-raw-search__range">
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
          <!-- 선택 목록 필드 (예: 주문채널 = 판매채널 목록 중 사용 'Y'). 첫 항목 '전체' 는 값 없음 -->
          <a-select
              v-else-if="f.type === 'select'"
              v-model:value="cond[f.data]"
              :options="selectOptions[f.data] || []"
              size="small"
              class="flex-1"
          />
          <a-input v-else v-model:value="cond[f.data]" size="small" class="flex-1" allow-clear @press-enter="onSearch" />
        </div>
      </div>
      <div class="order-raw-search__row">
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

    <div ref="gridWrapRef" class="order-raw-grid ht-theme-main">
      <div ref="hotHostRef" class="order-raw-grid__host" v-once />
    </div>

    <div class="order-raw-pager">
      <div class="order-raw-pager__nav">
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
      <span class="order-raw-pager__total">{{ $t('common.totalItems', { n: $cf.fncComma(page.total) }) }}</span>
    </div>
  </div>
</template>

<script setup>
// 이 파일은 scripts/genPage.mjs 가 OrderRaw.java 에서 생성했다. (템플릿: scripts/templates/PgEntity.vue.tpl)
import { computed, getCurrentInstance, markRaw, nextTick, onActivated, onBeforeUnmount, onMounted, reactive, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { Modal, message } from 'ant-design-vue';
import dayjs from 'dayjs';
import Handsontable from 'handsontable';
import 'handsontable/styles/handsontable.css';
import 'handsontable/styles/ht-theme-main.css';
import commonFunction from '@/common/utils/commonFunction';
import { useCommonCodeStore } from '@/store/commonCodeStore';
import { FORM_CHANNEL, formUrl, openFormWindow, stashFormPayload } from './orderRawPopup';
import { KIND_TYPES, checkFileName, parseOrderExcel } from './orderRawExcel';

const { proxy } = getCurrentInstance();
const { t } = useI18n();
/** 공통코드 (type: 'code' 필드의 코드명/선택 목록). 로그인 후 router 에서 미리 불러둔다 */
const codeStore = useCommonCodeStore();

defineOptions({ name: 'PgOrderRaw' });

/** 조회 API: apiFunctions.onApiGetMegaOrderRaw() → GET v1/orderRaw */
const queryApi = (params) => proxy.$api.onApiGetMegaOrderRaw(params);

/** 판매채널 목록 (주문채널 검색 선택상자). 사용여부 'Y' 만, 정렬순서 → 판매처명 순 */
const channels = ref([]);

const loadChannels = async () => {
  const result = await proxy.$api.onApiGetChannel({ useYn: 'Y' });
  const list = result?.list || result?.content || result || [];
  channels.value = (Array.isArray(list) ? list : [])
      .filter((row) => row.useYn === 'Y') // 서버가 걸러 주지 않아도 'Y' 만 남긴다
      .sort((a, b) => (Number(a.sort) || 0) - (Number(b.sort) || 0) || String(a.channelNm).localeCompare(String(b.channelNm), 'ko'));
};

/** 입력소스 값 (OrderRaw.srcType 주석과 같다) */
const SRC_TYPES = ['XLS_SHOPLINKER', 'XLS_SHOP_NAVER', 'XLS_SHOP', 'API_SHOPLINKER', 'API_GODOMALL'];

/**
 * type: 'select' 필드의 선택 목록. 첫 항목은 값이 없는 '전체'.
 * 주문채널(orderChannel)에는 판매처명이 들어 있으므로 옵션 값도 판매처명(channelNm)이다.
 */
const selectOptions = computed(() => ({
  orderChannel: [
    { value: '', label: t('common.all') },
    ...[...new Set(channels.value.map((c) => c.channelNm).filter(Boolean))].map((name) => ({ value: name, label: name })),
  ],
  // 입력소스 (TB_ORDER_RAW.SRC_TYPE). 첫 항목 '전체'
  srcType: [
    { value: '', label: t('common.all') },
    ...SRC_TYPES.map((value) => ({ value, label: value })),
  ],
  // 전송여부: Y(이관됨) / N(이관 전). '전체' 없이 둘 중 하나, 기본값 N
  transferYn: [
    { value: 'Y', label: 'Y' },
    { value: 'N', label: 'N' },
  ],
}));

/** 데이터 이관: 체크한 주문번호로 apiFunctions.onApiOrderRawMove() → POST v1/orderRawMove, 끝나면 다시 조회 */
const moving = ref(false);

/**
 * 체크박스로 고른 주문번호. 이관은 주문번호 단위라 한 행을 체크하면 같은 주문번호의 행이 모두 체크된다.
 * 페이지를 넘겨도 유지되고, 다시 조회하면 비운다.
 */
const checkedOrderNos = new Set();
const checkedCount = ref(0);

/** 그리드에 넘긴 현재 페이지 행 (loadData 에 준 배열 그대로). getSourceData() 는 복사본이라 체크 표시를 바꿀 수 없다 */
let pageRows = [];

const orderNoOf = (row) => String(row?.orderNo ?? '').trim();

/**
 * 체크·이관할 수 없는 주문번호 = 품번이 상품마스터에 없는 행(isUnmatchedProduct)이 하나라도 있는 주문.
 * 이관은 주문번호 단위(그 주문의 미전송 행 전체)라 행 하나만 막으면 같은 주문의 다른 행으로 이관될 수 있어서 주문 단위로 막는다.
 * 조회 결과 전체(filtered) 기준으로 renderPage 때마다 다시 계산한다. 서버도 같은 이유로 이관 때 다시 걸러낸다.
 */
let blockedOrderNos = new Set();
const refreshBlocked = () => {
  blockedOrderNos = new Set(filtered.value.filter((row) => isUnmatchedProduct(row)).map(orderNoOf).filter(Boolean));
};
const isBlocked = (row) => blockedOrderNos.has(orderNoOf(row));

/** 현재 페이지 행의 체크 표시를 checkedOrderNos 에 맞추고 다시 그린다 */
const syncChecked = () => {
  checkedCount.value = checkedOrderNos.size;
  const instance = getHot();
  if (!instance) return;
  pageRows.forEach((row) => {
    row.checked = checkedOrderNos.has(orderNoOf(row));
  });
  instance.render();
  updateHeaderCheck();
};

const setChecked = (orderNo, checked) => {
  if (!orderNo) return;
  if (checked && blockedOrderNos.has(orderNo)) return; // 품번 미매칭 주문은 체크 불가
  if (checked) checkedOrderNos.add(orderNo);
  else checkedOrderNos.delete(orderNo);
};

const clearChecked = () => {
  checkedOrderNos.clear();
  checkedCount.value = 0;
};

/** 체크박스 셀을 클릭하면 그 주문번호를 체크/해제 */
const onAfterChange = (changes, source) => {
  if (!changes || source === 'loadData') return;
  const instance = getHot();
  changes.forEach(([row, prop, , value]) => {
    if (prop === 'checked') setChecked(orderNoOf(instance?.getSourceDataAtRow(row)), value === true);
  });
  syncChecked();
};

/** 현재 페이지의 체크 가능한 행이 모두 체크되어 있는지 (헤더 체크박스 표시용. 품번 미매칭 주문은 제외) */
const isPageAllChecked = () => {
  const rows = pageRows.filter((row) => !isBlocked(row));
  return rows.length > 0 && rows.every((row) => checkedOrderNos.has(orderNoOf(row)));
};

/** 헤더 체크박스(위쪽 고정 헤더 복제본 포함)의 체크 표시를 현재 페이지 상태에 맞춘다 */
const updateHeaderCheck = () => {
  const allChecked = isPageAllChecked();
  gridWrapRef.value?.querySelectorAll('.order-raw-check-all').forEach((el) => {
    el.checked = allChecked;
  });
};

/** 헤더 체크박스: 체크하면 현재 페이지의 모든 행 체크, 해제하면 모든 행 해제 */
const onHeaderCheckChange = (checked) => {
  pageRows.forEach((row) => setChecked(orderNoOf(row), checked));
  syncChecked();
};

/** [전체선택] 조회 결과 전체(모든 페이지)의 주문번호를 체크한다 (품번 미매칭 주문 제외). 이미 모두 체크되어 있으면 전체 해제 */
const onSelectAll = () => {
  const orderNos = [...new Set(filtered.value.filter((row) => !isBlocked(row)).map(orderNoOf).filter(Boolean))];
  if (!orderNos.length) return;
  const checked = orderNos.some((orderNo) => !checkedOrderNos.has(orderNo));
  orderNos.forEach((orderNo) => setChecked(orderNo, checked));
  syncChecked();
};

/** [선택삭제] 체크한 주문번호의 행을 목록에서 뺀다. 화면에서만 빼며 DB(TB_ORDER_RAW)는 지우지 않는다 — 다시 조회하면 나온다 */
const onDeleteSelected = () => {
  if (!checkedOrderNos.size) {
    message.warning(t('message.selectRequired'));
    return;
  }
  Modal.confirm({
    title: t('common.confirm'),
    content: t('message.removeConfirm'),
    okText: t('common.confirm'),
    cancelText: t('common.cancel'),
    onOk: () => {
      filtered.value = filtered.value.filter((row) => !checkedOrderNos.has(orderNoOf(row)));
      clearChecked();
      renderPage();
      message.success(t('message.removed'));
    },
  });
};

/** [검색 접기/펼치기] 검색 영역을 숨기거나 보이고, 남은 높이에 맞게 그리드 크기를 다시 잡는다 */
const searchPanelOpen = ref(true);

const toggleSearchPanel = () => {
  searchPanelOpen.value = !searchPanelOpen.value;
  nextTick(() => {
    measureGrid();
    getHot()?.refreshDimensions();
  });
};

/** 헤더 체크박스 클릭 (캡처 단계). 클릭 후 체크 상태(el.checked)대로 페이지 전체를 체크/해제한다 */
const onGridClickCapture = (event) => {
  const el = event.target;
  if (!el?.classList?.contains('order-raw-check-all')) return;
  event.stopPropagation();
  onHeaderCheckChange(el.checked);
};

// ─────────────────────────────────────────────
// 엑셀 불러오기 → 그리드 미리보기 → [저장]
//   파일은 서버로 올리지 않는다. 브라우저에서 읽어(orderRawExcel.js) 그리드에 보여 주고,
//   [저장] 때 그리드의 행만 POST v1/orderRawUpload 로 보낸다. [선택삭제] 로 뺀 행은 저장하지 않는다.
// ─────────────────────────────────────────────
const excelInputRef = ref(null);
/** 미리보기 상태 { type, fileName }. null 이면 DB 조회 결과를 보는 중 */
const excelUpload = ref(null);
const uploading = ref(false);
let excelKind = null;

/** [고도몰엑셀] / [샵링커엑셀]: 파일 선택창을 연다 */
const pickExcel = (kind) => {
  excelKind = kind;
  if (!excelInputRef.value) return;
  excelInputRef.value.value = ''; // 같은 파일을 다시 골라도 change 가 일어나게
  excelInputRef.value.click();
};

const onExcelFile = async (event) => {
  const file = event.target.files?.[0];
  if (!file) return;
  try {
    checkFileName(file.name); // 엑셀 확장자가 아니면 거부
    const { type, rows } = parseOrderExcel(await file.arrayBuffer()); // 양식이 다르면 Error → 아래 catch 에서 안내
    if (!KIND_TYPES[excelKind]?.includes(type)) {
      message.error(t('message.excelKindMismatch', { type }), 6);
      return;
    }
    excelUpload.value = { type, fileName: file.name };
    clearChecked();
    // DB 에 아직 없는 행: rawId 없음, 입력소스 = 엑셀 종류, 전송여부 N
    filtered.value = rows.map((row) => ({ ...row, srcType: type, transferYn: 'N' }));
    page.current = 1;
    renderPage();
    message.success(t('message.excelLoaded', { n: rows.length }), 6);
  } catch (error) {
    message.error(error?.message || String(error), 8);
  }
};

/** 미리보기 취소 → DB 조회로 돌아간다 */
const cancelExcel = () => {
  excelUpload.value = null;
  onSearch();
};

/** [저장]: 그리드에 남아 있는 엑셀 행을 DB 에 저장 */
const onSaveExcel = () => {
  const upload = excelUpload.value;
  if (!upload) return;
  const rows = filtered.value.map(({ no, checked, ...row }) => row); // 화면 전용 값 제외
  if (!rows.length) {
    message.warning(t('common.noData'));
    return;
  }
  Modal.confirm({
    title: t('common.save'),
    content: t('message.excelSaveConfirm', { n: commonFunction.fncComma(rows.length) }),
    okText: t('common.confirm'),
    cancelText: t('common.cancel'),
    onOk: async () => {
      uploading.value = true;
      try {
        const result = await proxy.$api.onApiOrderRawUpload({ type: upload.type, fileName: upload.fileName, rows });
        if (!result) return; // 오류 알림은 apiFunctions 가 띄운다
        message.success(t('message.excelSaved', { totalRows: 0, saved: 0, skipped: 0, ...(result.map || {}) }), 8);
        excelUpload.value = null;
        onSearch();
      } finally {
        uploading.value = false;
      }
    },
  });
};

// ─────────────────────────────────────────────
// [고도몰API] / [샵링커API]: 기간을 골라 수집 → TB_ORDER_RAW 저장
// ─────────────────────────────────────────────
/** 샵링커 orderFlag. 000 은 신규주문을 발주확인으로 바꾼다 (되돌릴 수 없음) → 기본값은 007 */
const ORDER_FLAG_OPTIONS = [
  { value: '007', label: '007 발주확인' },
  { value: '000', label: '000 일반(신규→발주확인 변경 ⚠)' },
  { value: '002', label: '002 정산확정' },
  { value: '003', label: '003 송장등록' },
  { value: '004', label: '004 송장전송완료' },
];

const collect = reactive({ open: false, kind: 'GODOMALL', range: null, orderFlag: '007', loading: false });

const openCollect = (kind) => {
  if (excelUpload.value) {
    message.warning(t('message.excelSaveFirst'));
    return;
  }
  collect.kind = kind;
  collect.range = [dayjs(), dayjs()];
  collect.orderFlag = '007';
  collect.open = true;
};

const runCollect = async () => {
  const [start, end] = collect.range || [];
  collect.loading = true;
  try {
    const godomall = collect.kind === 'GODOMALL';
    const result = godomall
        ? await proxy.$api.onApiCollectGodomall({ dateType: 'order', startDate: start.format('YYYY-MM-DD'), endDate: end.format('YYYY-MM-DD') })
        : await proxy.$api.onApiCollectShoplinker({ stDate: start.format('YYYYMMDD'), edDate: end.format('YYYYMMDD'), orderFlag: collect.orderFlag });
    if (!result) return; // 오류 알림은 apiFunctions 가 띄운다
    const counts = { totalOrders: 0, totalCount: 0, saved: 0, skipped: 0, excluded: 0, ...(result.map || {}) };
    message.success(t(godomall ? 'message.godomallCollected' : 'message.shoplinkerCollected', counts), 8);
    collect.open = false;
    onSearch();
  } finally {
    collect.loading = false;
  }
};

const onCollect = () => {
  const [start, end] = collect.range || [];
  if (!start || !end) {
    message.warning(t('message.collectPeriodRequired'));
    return;
  }
  if (collect.kind === 'SHOPLINKER' && collect.orderFlag === '000') {
    Modal.confirm({
      title: t('common.shoplinkerApi'),
      content: t('message.orderFlag000Confirm'),
      okText: t('common.confirm'),
      cancelText: t('common.cancel'),
      okType: 'danger',
      onOk: runCollect,
    });
    return;
  }
  runCollect();
};

const onDataMove = () => {
  if (excelUpload.value) {
    message.warning(t('message.excelSaveFirst'));
    return;
  }
  const orderNos = [...checkedOrderNos];
  if (!orderNos.length) {
    message.warning(t('message.dataMoveSelectRows'));
    return;
  }
  Modal.confirm({
    title: t('common.dataMove'),
    content: t('message.dataMoveConfirm', { n: orderNos.length }),
    okText: t('common.confirm'),
    cancelText: t('common.cancel'),
    onOk: async () => {
      moving.value = true;
      try {
        // 선택한 주문번호의 미전송 원본 행 전체를 이관한다 (OrderRawService.moveToOrder)
        const result = await proxy.$api.onApiOrderRawMove({ orderNos });
        if (!result) return; // 오류 알림은 apiFunctions 가 띄운다
        // 백엔드는 주문 100건씩 묶음마다 커밋한다. error 가 있으면 그 묶음만 롤백되고 앞 묶음은 이관된 상태다
        const counts = { orders: 0, items: 0, skipped: 0, transferred: 0, batches: 0, unmatched: 0, ...(result.map || {}) };
        if (counts.error) message.error(t('message.dataMoveFailed', counts), 10);
        else message.success(t('message.dataMoveDone', counts), 6);
        onSearch();
      } finally {
        moving.value = false;
      }
    },
  });
};

/** 상세 팝업에 넘길 id 를 만드는 @Id 필드. 여러 개면 "값1,값2" 로 이어 붙여 한 구간으로 보낸다 (GET v1/orderRaw/{id}) */
const ID_FIELDS = ['rawId'];

/** 엔티티 필드 → 그리드 컬럼 (헤더는 i18n field.<data>). 순서·항목은 OrderRaw.java (TB_ORDER_RAW) 와 같다 */
const FIELDS = [
  { data: 'rawId', type: 'number', className: 'htRight', width: 80, id: true },
  { data: 'srcType', type: 'select', className: 'htCenter', width: 130 }, // 검색: 입력소스 선택
  { data: 'orderDate', type: 'date', className: 'htCenter', width: 100, format: 'YYYY-MM-DD' },
  { data: 'orderChannel', type: 'select', className: '', width: 120 }, // 검색: 판매채널 목록(사용 Y) 선택
  { data: 'orderType', type: 'text', className: '', width: 120 },
  { data: 'orderNo', type: 'text', className: '', width: 150 },
  { data: 'ordererName', type: 'text', className: '', width: 100 },
  { data: 'ordererTel', type: 'text', className: '', width: 120 },
  { data: 'ordererMobile', type: 'text', className: '', width: 120 },
  { data: 'receiverName', type: 'text', className: '', width: 100 },
  { data: 'receiverTel', type: 'text', className: '', width: 120 },
  { data: 'receiverMobile', type: 'text', className: '', width: 120 },
  { data: 'receiverZipcode', type: 'text', className: '', width: 90 },
  { data: 'receiverAddress', type: 'text', className: '', width: 260 },
  { data: 'memo', type: 'text', className: '', width: 200 },
  { data: 'productCode', type: 'text', className: '', width: 110 },
  { data: 'quantity', type: 'number', className: 'htRight', width: 70 },
  { data: 'productName', type: 'text', className: '', width: 240 },
  { data: 'optionInfo', type: 'text', className: '', width: 200 },
  { data: 'settlementAmount', type: 'number', className: 'htRight', width: 90 },
  { data: 'paymentAmount', type: 'number', className: 'htRight', width: 90 },
  { data: 'payType', type: 'text', className: '', width: 100 }, // 결제방법 (자사몰: 엑셀 결제방법 / 오픈마켓: 현금)
  { data: 'brandName', type: 'text', className: '', width: 120 },
  { data: 'maker', type: 'text', className: '', width: 160 },
  // 전송여부: TB_ORDER / TB_ORDER_ITEM 으로 이관되면 'Y'. 검색 기본값 'N' (아직 이관 안 된 원본)
  { data: 'transferYn', type: 'select', className: 'htCenter', width: 70, default: 'N',  searchInline: true },
];
const GRID_SEARCH_FIELDS = FIELDS.filter((f) => !f.searchInline);

const gridWrapRef = ref(null);
const hotHostRef = ref(null);
const filtered = ref([]);

let hot = null;
const activeRange = { start: -1, end: -1 };

/** 정렬 값은 "<필드>:asc" / "<필드>:desc" */
const DEFAULT_SEARCH = {
  pageSize: 20,
  sort1: 'rawId:asc',
  sort2: '',
  orderSource: '', // '' 전체 / 입력소스(SRC_TYPE) 값 — XLS_SHOPLINKER / XLS_SHOP_NAVER / XLS_SHOP
};

/** 주문구분 선택지 = 입력소스(SRC_TYPE). 첫 항목 '전체' 는 값 없음 */
const orderSourceOptions = computed(() => [
  { value: '', label: t('common.all') },
  { value: 'XLS_SHOPLINKER', label: t('field.orderSourceXlsShoplinker') },
  { value: 'XLS_SHOP_NAVER', label: t('field.orderSourceXlsShopNaver') },
  { value: 'XLS_SHOP', label: t('field.orderSourceXlsShop') },
]);

/** 주문구분: 입력소스가 정확히 같은 행만 (서버도 같은 조건으로 거른다 — OrderRawService.buildPredicate) */
const matchOrderSource = (row) => !search.orderSource || String(row.srcType ?? '') === search.orderSource;

const search = reactive({ ...DEFAULT_SEARCH });

/** 필드별 검색 조건 초기값: 문자열·공통코드 '' / 날짜 null([시작, 끝]) / 숫자 { min, max } / default 가 있으면 그 값 (전송여부 'N') */
const emptyCond = () =>
    Object.fromEntries(
        FIELDS.map((f) => [f.data, f.type === 'number' ? { min: null, max: null } : f.type === 'date' ? null : f.default ?? ''])
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
  if (f.type === 'select') return !c || String(row[f.data] ?? '') === c; // 선택 목록도 정확히 일치
  const keyword = String(c || '').trim().toLowerCase();
  return !keyword || String(row[f.data] ?? '').toLowerCase().includes(keyword);
};

const filterRows = (rows) => rows.filter((row) => matchOrderSource(row) && FIELDS.every((f) => matchField(row, f)));

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
  // 주문구분: SHOPLINKER = 샵링커주문번호 있음, OWN_MALL = 없음 (데이터 이관 요청에도 같은 조건이 들어간다)
  if (search.orderSource) params.orderSource = search.orderSource;
  return params;
};

/** 날짜 컬럼은 보기 좋은 문자열로 바꿔서 그리드/엑셀에 넣는다 */
const decorate = (rows, startNo) =>
    rows.map((row, index) => {
      const view = { ...row, no: startNo + index, checked: checkedOrderNos.has(orderNoOf(row)) };
      FIELDS.forEach((f) => {
        if (f.type === 'date') view[f.data] = toDate(row[f.data])?.format(f.format || 'YYYY-MM-DD HH:mm:ss') ?? '';
      });
      return markRaw(view);
    });

const getHot = () => (hot && !hot.isDestroyed ? hot : null);

/**
 * 품번이 상품마스터에 없는 행인지 (OrderRaw.PRODUCT_CODE ≠ TB_PRODUCT.PRODUCT_CD) → 빨간 계열로 표시.
 * 서버는 상품마스터에 있는 품번 행에만 product 를 함께 보낸다 (OrderRaw.product, @NotFound IGNORE).
 * 엑셀 미리보기 행(rawId 없음)은 아직 상품마스터와 맞춰 보지 않았으므로 표시하지 않는다.
 */
const isUnmatchedProduct = (row) => !!row && !!row.rawId && !row.product;

const onAfterSelection = function (row, _col, row2) {
  activeRange.start = row < 0 ? -1 : Math.min(row, row2);
  activeRange.end = row < 0 ? -1 : Math.max(row, row2);
};

/** 숫자 컬럼은 1000 단위 콤마로 보여준다. 데이터는 숫자 그대로라 정렬·검색·엑셀에는 영향이 없다 */
const commaRenderer = function (instance, td, row, col, prop, value, cellProperties) {
  Handsontable.renderers.TextRenderer.apply(this, [instance, td, row, col, prop, commonFunction.fncComma(value), cellProperties]);
};

/** 콤마를 붙일 숫자 컬럼인지 (@Id 숫자 필드는 제외) */
const isCommaField = (f) => f.type === 'number' && !f.id;

/** 공통코드 컬럼은 코드 대신 코드명을 보여준다. 데이터는 코드 그대로 (검색·팝업·저장은 코드 기준) */
const codeRendererOf = (f) =>
    function (instance, td, row, col, prop, value, cellProperties) {
      Handsontable.renderers.TextRenderer.apply(this, [instance, td, row, col, prop, codeName(f, value), cellProperties]);
    };

/** 순번 셀은 상세 팝업 링크로 보이게 한다 */
const seqRenderer = function (instance, td, row, col, prop, value, cellProperties) {
  Handsontable.renderers.TextRenderer.apply(this, [instance, td, row, col, prop, value, cellProperties]);
  td.classList.add('order-raw-seq-link');
};

const idOf = (row) => ID_FIELDS.map((key) => encodeURIComponent(String(row?.[key] ?? ''))).join(',');

let formChannel = null;

/** 상세 팝업에서 저장하면 목록을 다시 조회한다 */
const onFormMessage = (event) => {
  if (event.origin && event.origin !== window.location.origin) return;
  if (event.data?.type !== 'orderRaw-saved') return;
  message.success(t('message.saved'));
  onSearch();
};

/** 한 행의 상세 폼 팝업을 연다 */
const openForm = (row) => {
  if (!row || !row.rawId) return; // 엑셀 미리보기 행은 아직 DB 에 없어 상세가 없다
  const token = stashFormPayload({ row });
  const popup = openFormWindow(formUrl({ id: idOf(row), token }));
  if (!popup) message.warning(t('message.popupBlocked'));
};

/** Handsontable 선택 시작보다 먼저 가로채서, 순번 클릭 시 드래그 선택 없이 팝업만 연다 */
const onGridMouseDownCapture = (event) => {
  if (event.button !== 0) return;
  // 헤더 체크박스: Handsontable 이 열 전체를 선택하지 않게 막는다 (체크 처리는 click 에서)
  if (event.target?.classList?.contains('order-raw-check-all')) {
    event.stopPropagation();
    return;
  }
  const td = event.target?.closest?.('td');
  if (!td || !td.classList.contains('order-raw-seq-link') || !gridWrapRef.value?.contains(td)) return;

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
        colHeaders: ['', t('field.seq'), ...FIELDS.map((f) => t(`field.${f.data}`))],
        columns: [
          // 이관 대상 체크박스 (이 컬럼만 편집 가능 — 클릭으로 체크/해제)
          { data: 'checked', type: 'checkbox', className: 'htCenter', readOnly: false },
          { data: 'no', className: 'htCenter', readOnly: true, editor: false, renderer: seqRenderer },
          ...FIELDS.map((f) => ({
            data: f.data,
            className: f.className,
            readOnly: true,
            editor: false,
            ...(isCommaField(f) ? { renderer: commaRenderer } : {}),
            ...(f.type === 'code' ? { renderer: codeRendererOf(f) } : {}),
          })),
        ],
        colWidths: [36, 50, ...FIELDS.map((f) => f.width)],
        height: Math.max(120, gridWrapRef.value?.clientHeight || 400),
        width: '100%',
        stretchH: 'all',
        rowHeaders: false,
        manualColumnResize: true,
        fillHandle: false,
        wordWrap: false, // 긴 값(주소·상품명·옵션)도 한 줄로 → 행 높이 고정 (PgProduct 와 같다)
        imeFastEdit: false,
        autoRowSize: false,
        autoColumnSize: false,
        readOnly: true,
        outsideClickDeselects: false,
        licenseKey: 'non-commercial-and-evaluation',
        // 헤더 첫 칸 = 현재 페이지 전체 체크/해제
        afterGetColHeader(col, th) {
          if (col !== 0) return;
          th.querySelector('.colHeader').innerHTML = `<input type="checkbox" class="order-raw-check-all"${isPageAllChecked() ? ' checked' : ''}>`;
        },
        afterChange: onAfterChange,
        // 품번 미매칭 행이 있는 주문은 체크박스를 누를 수 없다 (이관 대상에서 제외)
        cells(row, col, prop) {
          return prop === 'checked' ? { readOnly: isBlocked(pageRows[row]) } : {};
        },
        beforeRenderer(td, row) {
          if (activeRange.start >= 0 && row >= activeRange.start && row <= activeRange.end) {
            td.classList.add('active-row-cell');
          } else {
            td.classList.remove('active-row-cell');
          }
        },
        // 품번 미매칭 행은 모든 칸(체크박스·순번·숫자·코드 칸 포함)을 빨간 계열로.
        // 렌더러가 td 클래스를 다시 쓰므로 렌더가 끝난 뒤(afterRenderer) 붙인다
        afterRenderer(td, row) {
          td.classList.toggle('unmatched-row-cell', isUnmatchedProduct(pageRows[row]));
        },
        beforeBeginEditing() {
          return false;
        },
        afterSelection: onAfterSelection,
      })
  );

  gridWrapRef.value?.addEventListener('mousedown', onGridMouseDownCapture, true);
  gridWrapRef.value?.addEventListener('click', onGridClickCapture, true);
};

const destroyGrid = () => {
  gridWrapRef.value?.removeEventListener('mousedown', onGridMouseDownCapture, true);
  gridWrapRef.value?.removeEventListener('click', onGridClickCapture, true);
  if (hot && !hot.isDestroyed) hot.destroy();
  hot = null;
};

const renderPage = () => {
  refreshBlocked();
  const size = search.pageSize;
  const totalPages = Math.max(1, Math.ceil(filtered.value.length / size));
  if (page.current > totalPages) page.current = totalPages;
  page.total = filtered.value.length;
  page.totalPages = totalPages;
  const start = (page.current - 1) * size;
  pageRows = decorate(filtered.value.slice(start, start + size), start + 1);
  getHot()?.loadData(pageRows);
  activeRange.start = -1;
  activeRange.end = -1;
};

const onSearch = async () => {
  excelUpload.value = null; // 조회하면 엑셀 미리보기는 끝난다 (저장하지 않은 행은 버림)
  page.current = 1;
  clearChecked(); // 조회 결과가 바뀌면 이전 체크는 버린다 (보이지 않는 주문이 이관되지 않게)
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
      `${t('menu.orderRaw')}_${dayjs().format('YYYYMMDD')}.xlsx`
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
  // 화면을 열 때는 조회하지 않는다 (목록이 커서 느림). [조회] 버튼으로 검색한다
  loadChannels();
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
.order-raw-page {
  display: flex;
  flex-direction: column;
  height: calc(
      100vh - var(--wms-gnb-height) - var(--wms-userbar-height) - var(--wms-tabbar-height) -
      var(--wms-footer-height) - 36px
  );
  background: #fff;
  overflow: hidden;
}

.order-raw-toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 36px;
  padding: 4px 10px;
  border-bottom: 1px solid var(--wms-border);
  background: #f7f8fa;
}

.order-raw-toolbar__title {
  font-size: 13px;
  font-weight: 700;
  color: #1e4e79;
  white-space: nowrap;
}

.order-raw-toolbar__actions {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-left: auto;
}

.order-raw-toolbar__utils {
  display: flex;
  align-items: center;
  gap: 2px;
  margin-left: 8px;
  padding-left: 8px;
  border-left: 1px solid var(--wms-border);
}

.order-raw-icon-btn {
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

.order-raw-icon-btn:hover {
  background: #e8f1f8;
}

.order-raw-icon-btn--excel {
  color: #217346;
}

/* 엑셀 미리보기 안내 (아직 저장 안 됨) */
.order-raw-upload-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 10px;
  border-bottom: 1px solid #f0c36d;
  background: #fff8e6;
  color: #8a5a00;
  font-weight: 600;
}

.order-raw-collect {
  display: grid;
  grid-template-columns: 110px 1fr;
  align-items: center;
  gap: 10px;
  padding: 8px 0;
}

.order-raw-collect__label {
  font-size: 13px;
}

.order-raw-collect__warn {
  grid-column: 1 / -1;
}

/* 주문구분 줄 오른쪽: 엑셀·API 가져오기 버튼 */
.order-raw-search__import {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px;
  margin-left: auto;
}

.order-raw-search {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 8px 10px;
  background: #f3f6f8;
  border-bottom: 1px solid var(--wms-border);
}

.order-raw-search__row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.order-raw-search__grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 6px 16px;
}

.order-raw-search__item {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
}

.order-raw-search__label {
  flex: 0 0 96px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 12px;
  color: var(--wms-text);
}

.order-raw-search__range {
  display: flex;
  flex: 1;
  align-items: center;
  gap: 4px;
  min-width: 0;
}

.order-raw-search__range :deep(.ant-input-number) {
  flex: 1;
  min-width: 0;
}

.order-raw-grid {
  flex: 1;
  min-height: 0;
  position: relative;
  --ht-header-background-color: #d6e7f5;
  --ht-header-foreground-color: #1e4e79;
  --ht-header-font-weight: 700;
  --ht-cell-horizontal-border-color: #c5d8ea;
  --ht-cell-vertical-border-color: #c5d8ea;
}

.order-raw-grid__host {
  height: 100%;
}

/* 품번(PRODUCT_CODE)이 상품마스터(TB_PRODUCT.PRODUCT_CD)에 없는 행 */
.order-raw-grid :deep(.unmatched-row-cell) {
  /* 배경만 바꾼다(글자색은 그대로). 테마의 칸 배경보다 우선, 아래 선택 행(active-row-cell) 규칙이 뒤에 있어 선택하면 파란색이 이긴다 */
  background: #fff1f0 !important;
}

.order-raw-grid :deep(.active-row-cell) {
  background: #d9edf7 !important;
}

.order-raw-grid :deep(.ht_clone_top th) {
  background: #d6e7f5;
  color: #1e4e79;
  font-weight: 700;
}

.order-raw-grid :deep(.wtBorder) {
  pointer-events: none;
}

.order-raw-grid :deep(td.order-raw-seq-link) {
  color: #1e5aa8;
  text-decoration: underline;
  cursor: pointer;
}

.order-raw-grid :deep(td.order-raw-seq-link:hover) {
  color: #c41d3a !important;
}

.order-raw-pager {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 34px;
  padding: 4px 10px;
  border-top: 1px solid var(--wms-border);
  background: #f7f8fa;
}

.order-raw-pager__nav {
  display: flex;
  align-items: center;
  gap: 2px;
}

.order-raw-pager__nav button {
  min-width: 24px;
  height: 24px;
  padding: 0 6px;
  border: 1px solid transparent;
  background: transparent;
  color: #1e4e79;
  font-size: 12px;
  cursor: pointer;
}

.order-raw-pager__nav button:hover:not(:disabled) {
  border-color: #9bb8d3;
  background: #e8f1f8;
}

.order-raw-pager__nav button.is-active {
  border-color: #3d6d99;
  background: #d6e7f5;
  font-weight: 700;
}

.order-raw-pager__nav button:disabled {
  color: #aaa;
  cursor: default;
}

.order-raw-pager__total {
  font-weight: 600;
  color: var(--wms-text);
}

@media print {
  .order-raw-toolbar,
  .order-raw-search,
  .order-raw-pager {
    display: none !important;
  }

  .order-raw-page {
    height: auto;
  }

  .order-raw-grid {
    overflow: visible;
  }
}
</style>
