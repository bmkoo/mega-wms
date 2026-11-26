<template>
  <div class="split-page">
    <div class="split-toolbar">
      <div class="split-toolbar__title">※ {{ $t('orderBoxSplit.title') }}</div>
      <div class="split-toolbar__actions">
        <a-button size="small" :loading="loading" @click="onSearch">
          <template #icon><SearchOutlined /></template>
          {{ $t('common.search') }}
        </a-button>
        <a-button size="small" type="primary" :loading="saving" @click="onSave">
          <template #icon><SaveOutlined /></template>
          {{ $t('common.save') }}
        </a-button>
        <a-button size="small" @click="toggleSearchPanel">
          <template #icon>
            <UpOutlined v-if="searchPanelOpen" />
            <DownOutlined v-else />
          </template>
          {{ searchPanelOpen ? $t('common.collapseSearch') : $t('common.expandSearch') }}
        </a-button>
        <a-button size="small" @click="onClose">
          <template #icon><CloseOutlined /></template>
          {{ $t('common.close') }}
        </a-button>
      </div>
      <div class="split-toolbar__utils">
        <a-tooltip :title="$t('common.excelDownload')">
          <button type="button" class="split-icon split-icon--excel" @click="onExcel"><FileExcelOutlined /></button>
        </a-tooltip>
        <a-tooltip :title="$t('common.printPreview')">
          <button type="button" class="split-icon" @click="onPrint"><PrinterOutlined /></button>
        </a-tooltip>
        <a-tooltip :title="$t('common.help')">
          <button type="button" class="split-icon" @click="onHelp"><QuestionCircleOutlined /></button>
        </a-tooltip>
      </div>
    </div>

    <div v-show="searchPanelOpen" class="split-row">
      <a-select v-model:value="search.limit" :options="limitOptions" size="small" style="width: 110px" @change="onSearch" />
      <div class="flex-1" />
      <span class="wms-search__label">{{ $t('field.sort') }}</span>
      <a-select v-model:value="search.sort1" :options="sortOptions" size="small" style="width: 130px" @change="onSearch" />
      <a-select v-model:value="search.sort2" :options="sortOptions" size="small" style="width: 130px" @change="onSearch" />
    </div>

    <div ref="gridWrapRef" class="split-body ht-theme-main">
      <div ref="hotHostRef" class="split-body__host" v-once />
    </div>

    <div class="split-footer">
      <span>{{ $t('field.orderCount') }} {{ $cf.fncComma(summary.orderCount) }}</span>
      <span>{{ $t('common.totalItems', { n: $cf.fncComma(summary.rowCount) }) }}</span>
    </div>
  </div>
</template>

<script setup>
import { computed, getCurrentInstance, markRaw, nextTick, onBeforeUnmount, onMounted, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { Modal, message } from 'ant-design-vue';
import dayjs from 'dayjs';
import Handsontable from 'handsontable';
import { registerAllModules } from 'handsontable/registry';
import 'handsontable/styles/handsontable.css';
import 'handsontable/styles/ht-theme-main.css';
import commonFunction from '@/common/utils/commonFunction';
registerAllModules();

defineOptions({ name: 'PgOrderBoxSplit' });

const { t } = useI18n();
const { proxy } = getCurrentInstance();
const router = useRouter();

const gridWrapRef = ref(null);
const hotHostRef = ref(null);
/** 서버에서 조회한 주문원본 행. 수령자명 변경은 여기에 반영되고 저장 시 그대로 보낸다 */
const sourceRows = ref([]);
/** 그리드에 표시 중인 행 (loadData 에 넘긴 배열) */
const rows = ref([]);
const loading = ref(false);
const saving = ref(false);
const searchPanelOpen = ref(true);
/** 수령자명을 합치거나 분리한 주문 orderId */
const mergedRawIds = new Set();
let hot = null;

const search = reactive({ limit: 20, sort1: 'recipientNm', sort2: 'orderNo' });

const limitOptions = computed(() => [20, 50, 100, 200].map((n) => ({ value: n, label: t('common.perPage', { n }) })));

const sortOptions = computed(() => [
  { value: 'recipientNm', label: t('field.recipientNm') },
  { value: 'orderNo', label: t('field.orderNo') },
  { value: 'productCd', label: t('field.productCd') },
]);

const summary = computed(() => ({
  orderCount: new Set(rows.value.map((row) => row.orderNo).filter(Boolean)).size,
  rowCount: rows.value.length,
}));

const getGridColumnDefs = () => [
  { data: 'no', width: 50, header: t('field.seq'), className: 'htCenter' },
  { data: 'orderNo', width: 140, header: t('field.orderNo') },
  { data: 'lineNo', width: 70, header: t('field.lineNo'), className: 'htCenter', type: 'numeric' },
  { data: 'lineNoSub', width: 90, header: t('field.lineNoSub'), className: 'htCenter', type: 'numeric' },
  { data: 'recipientNm', width: 120, header: t('field.recipientNm') },
  { data: 'productCd', width: 110, header: t('field.productCd') },
  { data: 'orderProductNm', width: 340, header: t('field.orderProductNm') },
  { data: 'qty', width: 60, header: t('field.qty'), className: 'htRight', type: 'numeric' },
  { data: 'paidAmount', width: 90, header: t('field.paidAmount'), className: 'htRight', type: 'numeric' },
  { data: 'billAmount', width: 90, header: t('field.billAmount'), className: 'htRight', type: 'numeric' },
  { data: 'qtyBox', width: 80, header: t('field.qtyBox'), className: 'htCenter', type: 'numeric' },
];

const colIndexByData = (data) => getGridColumnDefs().findIndex((col) => col.data === data);
const getHot = () => (hot && !hot.isDestroyed ? hot : null);
/** 화면에서 펼친 행을 구분하는 키 */
const keyOf = (row) => String(row?._uid ?? '');
const orderIdOf = (row) => String(row?.orderId ?? '');
const itemKeyOf = (row) => `${row?.orderId ?? ''}-${row?.lineNo ?? ''}-${row?.lineNoSub ?? 0}`;
const findSource = (row) => sourceRows.value.find((item) => keyOf(item) === keyOf(row));

const decorate = (list) =>
  list.map((row, index) =>
    markRaw({
      ...row,
      no: index + 1,
      qtyBox: row.qtyBox ?? null,
    })
  );

/** 수량이 N이면 qty=1 인 행을 N개로 펼친다. lineNoSub 는 수령자 기준으로 나중에 다시 매긴다 */
let uidSeq = 0;
const expandQtyToRows = (list) => {
  const expanded = [];
  list.forEach((row) => {
    const count = Math.max(1, Number(row.qty) || 1);
    for (let i = 0; i < count; i += 1) {
      uidSeq += 1;
      expanded.push({
        ...row,
        qty: 1,
        _uid: `${row.orderId ?? ''}-${row.lineNo ?? ''}-${uidSeq}`,
      });
    }
  });
  return expanded;
};

/**
 * 포장단위순서(lineNoSub): 같은 주문번호 안에서 수령자명이 같으면 같은 값,
 * 수령자명이 달라지면 처음 등장한 순서대로 0,1,2… 를 부여한다.
 */
const assignLineNoSubByRecipient = (list) => {
  const subByOrderName = new Map();
  const nextByOrder = new Map();
  list.forEach((row) => {
    const orderKey = String(row.orderNo ?? row.orderId ?? '');
    const name = String(row.recipientNm ?? '');
    if (!subByOrderName.has(orderKey)) subByOrderName.set(orderKey, new Map());
    const nameMap = subByOrderName.get(orderKey);
    if (!nameMap.has(name)) {
      const next = nextByOrder.get(orderKey) ?? 0;
      nameMap.set(name, next);
      nextByOrder.set(orderKey, next + 1);
    }
    row.lineNoSub = nameMap.get(name);
  });
  return list;
};

const renderGrid = () => {
  getHot()?.loadData(rows.value);
};

const suffixAfterLastUnderscore = (value) => {
  const text = String(value ?? '');
  const at = text.lastIndexOf('_');
  if (at < 0 || at === text.length - 1) return null;
  const n = Number(text.slice(at + 1));
  return Number.isFinite(n) ? n : null;
};

/** 수령자명 끝에 _숫자가 없으면 _1 을 붙인다 */
const ensureRecipientSuffix = (list) => {
  list.forEach((row) => {
    const name = String(row.recipientNm ?? '').trim();
    if (!name) return;
    if (suffixAfterLastUnderscore(name) == null) row.recipientNm = `${name}_1`;
  });
  return list;
};

const getSelectedRowIndexes = (instance) => {
  const rowIndexes = new Set();
  (instance.getSelected() || []).forEach(([r1, , r2]) => {
    for (let row = Math.min(r1, r2); row <= Math.max(r1, r2); row += 1) rowIndexes.add(row);
  });
  return [...rowIndexes].sort((a, b) => a - b);
};

// ─────────────────────────────────────────────
// 복사·붙여넣기·채우기는 복사한 행과 같은 주문번호의 행에만 허용한다
// ─────────────────────────────────────────────
let allowedPasteOrders = null;

const orderNoAt = (instance, row) => String(instance.getSourceDataAtRow(row)?.orderNo || '');

const rowIndexesFromCoords = (coords) => {
  const rowIndexes = [];
  (coords || []).forEach((item) => {
    const startRow = item.startRow ?? item.from?.row ?? item.row;
    const endRow = item.endRow ?? item.to?.row ?? item.row;
    if (startRow == null || endRow == null) return;
    for (let row = Math.min(startRow, endRow); row <= Math.max(startRow, endRow); row += 1) rowIndexes.push(row);
  });
  return rowIndexes;
};

const capturePasteOrders = (instance, rowIndexes) => {
  allowedPasteOrders = new Set(rowIndexes.map((row) => orderNoAt(instance, row)).filter(Boolean));
};

const restrictChangesToSameOrder = (changes, source) => {
  if (!changes?.length || !/CopyPaste\.paste|Autofill/i.test(String(source || ''))) return undefined;
  const instance = getHot();
  if (!instance) return undefined;
  const allowed = allowedPasteOrders?.size ? allowedPasteOrders : new Set([orderNoAt(instance, changes[0][0])]);
  for (let i = changes.length - 1; i >= 0; i -= 1) {
    if (!allowed.has(orderNoAt(instance, changes[i][0]))) changes.splice(i, 1);
  }
  if (!changes.length) {
    message.warning(t('orderBoxSplit.pasteSameOrderOnly'));
    return false;
  }
  return undefined;
};

// ─────────────────────────────────────────────
// 수령자명 합치기: 바뀐 행 + 같은 주문의 같은 수령자 행을 강조하고, 주문 안에서 수령자명 순으로 다시 정렬
// ─────────────────────────────────────────────
const sortDisplayedRowsByReceiver = () => {
  const orderRank = new Map();
  rows.value.forEach((row) => {
    const key = String(row.orderNo || '');
    if (!orderRank.has(key)) orderRank.set(key, orderRank.size);
  });
  const list = [...rows.value].sort((a, b) => {
    const rankDiff = (orderRank.get(String(a.orderNo || '')) ?? 0) - (orderRank.get(String(b.orderNo || '')) ?? 0);
    if (rankDiff) return rankDiff;
    const byReceiver = String(a.recipientNm || '').localeCompare(String(b.recipientNm || ''), 'ko', { numeric: true });
    if (byReceiver) return byReceiver;
    return Number(a.no || 0) - Number(b.no || 0);
  });
  // 합치기/분리 후 _숫자 공백 제거 → 포장단위순서 재부여
  compactRecipientSuffixes(list);
  assignLineNoSubByRecipient(list);
  list.forEach((row) => {
    const original = findSource(row);
    if (!original) return;
    original.recipientNm = row.recipientNm;
    original.lineNoSub = row.lineNoSub;
  });
  rows.value = decorate(list);
  renderGrid();
};

const markSameReceiverGroup = (targets) => {
  const namesByOrder = new Map();
  targets.forEach((row) => {
    const orderKey = String(row.orderNo || '');
    if (!namesByOrder.has(orderKey)) namesByOrder.set(orderKey, new Set());
    namesByOrder.get(orderKey).add(String(row.recipientNm || ''));
  });
  rows.value.forEach((row) => {
    const names = namesByOrder.get(String(row.orderNo || ''));
    if (names?.has(String(row.recipientNm || ''))) mergedRawIds.add(orderIdOf(row));
  });
};

let applyingReceiverEffect = false;

const applyReceiverMergeEffect = (targets) => {
  if (!targets.length || applyingReceiverEffect) return;
  applyingReceiverEffect = true;
  targets.forEach((row) => mergedRawIds.add(orderIdOf(row)));
  markSameReceiverGroup(targets);
  nextTick(() => {
    sortDisplayedRowsByReceiver();
    applyingReceiverEffect = false;
  });
};

const stripRecipientSuffix = (value) => {
  const text = String(value ?? '');
  if (suffixAfterLastUnderscore(text) == null) return text;
  return text.slice(0, text.lastIndexOf('_'));
};

/**
 * 같은 주문번호 안에서 수령자 _숫자를 1부터 빈 칸 없이 다시 매긴다.
 * 예: _1, _3 만 남으면 _1, _2 로 바꾼다.
 */
const compactRecipientSuffixes = (list) => {
  const byOrder = new Map();
  list.forEach((row) => {
    const orderKey = String(row.orderNo ?? '');
    if (!byOrder.has(orderKey)) byOrder.set(orderKey, []);
    byOrder.get(orderKey).push(row);
  });
  byOrder.forEach((orderRows) => {
    const uniqueNames = [...new Set(orderRows.map((row) => String(row.recipientNm ?? '')).filter(Boolean))];
    uniqueNames.sort((a, b) => {
      const na = suffixAfterLastUnderscore(a);
      const nb = suffixAfterLastUnderscore(b);
      if (na != null && nb != null && na !== nb) return na - nb;
      if (na != null && nb == null) return -1;
      if (na == null && nb != null) return 1;
      return a.localeCompare(b, 'ko', { numeric: true });
    });
    const renameMap = new Map();
    uniqueNames.forEach((name, index) => {
      const base = stripRecipientSuffix(name).trim() || name;
      renameMap.set(name, `${base}_${index + 1}`);
    });
    orderRows.forEach((row) => {
      const next = renameMap.get(String(row.recipientNm ?? ''));
      if (next) row.recipientNm = next;
    });
  });
  return list;
};

/** 같은 주문번호 안 수령자명 _숫자 중 최댓값 */
const maxRecipientSuffixInOrder = (orderNo) => {
  let max = 0;
  rows.value.forEach((row) => {
    if (String(row.orderNo || '') !== String(orderNo || '')) return;
    const n = suffixAfterLastUnderscore(row.recipientNm);
    if (n != null && n > max) max = n;
  });
  return max;
};

/** 선택한 행(같은 주문)의 수령자명을 _번호가 가장 작은 수령자명으로 통일한다 */
const mergeSelectedReceivers = (instance) => {
  const receiverCol = colIndexByData('recipientNm');
  const selected = getSelectedRowIndexes(instance);
  if (selected.length < 2) {
    message.warning(t('orderBoxSplit.mergeNeedSelection'));
    return;
  }
  const cells = selected.map((row) => {
    const value = String(instance.getDataAtCell(row, receiverCol) ?? '');
    return { row, orderNo: orderNoAt(instance, row), value, n: suffixAfterLastUnderscore(value) };
  });
  if (new Set(cells.map((cell) => cell.orderNo)).size > 1) {
    message.warning(t('orderBoxSplit.mergeSameOrderOnly'));
    return;
  }
  const numbered = cells.filter((cell) => cell.n != null);
  if (!numbered.length) {
    message.warning(t('orderBoxSplit.mergeNeedSuffix'));
    return;
  }
  const winner = numbered.reduce((min, cur) => (cur.n < min.n ? cur : min));
  const changed = cells.filter((cell) => cell.value !== winner.value);
  if (changed.length) {
    instance.setDataAtCell(changed.map((cell) => [cell.row, receiverCol, winner.value]));
    return;
  }
  sortDisplayedRowsByReceiver();
};

/**
 * 선택한 행을 새 박스로 분리한다.
 * 같은 주문번호의 수령자 _숫자 최댓값 + 1 을 붙인 이름으로 바꾼다.
 */
const splitSelectedReceivers = (instance) => {
  const receiverCol = colIndexByData('recipientNm');
  const selected = getSelectedRowIndexes(instance);
  if (!selected.length) {
    message.warning(t('orderBoxSplit.splitNeedSelection'));
    return;
  }
  const cells = selected.map((row) => {
    const value = String(instance.getDataAtCell(row, receiverCol) ?? '');
    return { row, orderNo: orderNoAt(instance, row), value };
  });
  if (new Set(cells.map((cell) => cell.orderNo)).size > 1) {
    message.warning(t('orderBoxSplit.splitSameOrderOnly'));
    return;
  }
  const next = maxRecipientSuffixInOrder(cells[0].orderNo) + 1;
  const changes = cells
    .map((cell) => {
      const base = stripRecipientSuffix(cell.value).trim();
      if (!base) return null;
      const nextName = `${base}_${next}`;
      if (nextName === cell.value) return null;
      return [cell.row, receiverCol, nextName];
    })
    .filter(Boolean);
  if (!changes.length) {
    sortDisplayedRowsByReceiver();
    return;
  }
  instance.setDataAtCell(changes);
};

const createGrid = () => {
  const host = hotHostRef.value;
  if (!host || getHot()) return;
  const defs = getGridColumnDefs();
  hot = markRaw(
    new Handsontable(host, {
      themeName: 'ht-theme-main',
      data: [],
      colHeaders: defs.map((col) => col.header),
      columns: defs.map((col) => ({
        data: col.data,
        className: col.className,
        type: col.type,
        readOnly: col.data !== 'recipientNm',
      })),
      colWidths: defs.map((col) => col.width),
      columnHeaderHeight: 32,
      height: Math.max(120, gridWrapRef.value?.clientHeight || 400),
      width: Math.max(320, gridWrapRef.value?.clientWidth || 800),
      stretchH: 'last',
      rowHeaders: false,
      manualColumnResize: true,
      copyPaste: true,
      wordWrap: false,
      contextMenu: {
        items: {
          mergeReceiver: {
            name: () => t('orderBoxSplit.merge'),
            disabled() {
              const selected = getSelectedRowIndexes(this);
              if (selected.length < 2) return true;
              return new Set(selected.map((row) => orderNoAt(this, row))).size > 1;
            },
            callback() {
              mergeSelectedReceivers(this);
            },
          },
          splitReceiver: {
            name: () => t('orderBoxSplit.split'),
            disabled() {
              const selected = getSelectedRowIndexes(this);
              if (!selected.length) return true;
              return new Set(selected.map((row) => orderNoAt(this, row))).size > 1;
            },
            callback() {
              splitSelectedReceivers(this);
            },
          },
        },
      },
      fillHandle: { autoInsertRow: false },
      autoRowSize: false,
      autoColumnSize: false,
      licenseKey: 'non-commercial-and-evaluation',
      beforeCopy(_data, coords) {
        capturePasteOrders(this, rowIndexesFromCoords(coords));
      },
      beforeCut(_data, coords) {
        capturePasteOrders(this, rowIndexesFromCoords(coords));
      },
      beforeAutofill(_fillData, sourceRange) {
        const rowStart = Math.min(sourceRange.from.row, sourceRange.to.row);
        const rowEnd = Math.max(sourceRange.from.row, sourceRange.to.row);
        const colStart = Math.min(sourceRange.from.col, sourceRange.to.col);
        const colEnd = Math.max(sourceRange.from.col, sourceRange.to.col);
        const rowIndexes = [];
        for (let r = rowStart; r <= rowEnd; r += 1) rowIndexes.push(r);
        capturePasteOrders(this, rowIndexes);
        return rowIndexes.map((r) => {
          const values = [];
          for (let c = colStart; c <= colEnd; c += 1) values.push(this.getDataAtCell(r, c));
          return values;
        });
      },
      beforeChange(changes, source) {
        return restrictChangesToSameOrder(changes, source);
      },
      afterChange(changes, source) {
        if (!changes || source === 'loadData') return;
        const edited = [];
        changes.forEach(([rowIndex, prop, prev, next]) => {
          if (prop !== 'recipientNm' || String(prev ?? '') === String(next ?? '')) return;
          const row = this.getSourceDataAtRow(rowIndex);
          if (!row) return;
          const displayed = rows.value.find((item) => keyOf(item) === keyOf(row));
          if (displayed) displayed.recipientNm = next;
          const original = findSource(row);
          if (original) original.recipientNm = next;
          edited.push(displayed || row);
        });
        if (edited.length) applyReceiverMergeEffect(edited);
      },
      afterRenderer(td, row, col, prop) {
        const physical = this.toPhysicalRow(row);
        const current = rows.value[physical];
        if (!current) return;
        const prev = rows.value[physical - 1];
        const next = rows.value[physical + 1];
        const orderTop = !prev || prev.orderNo !== current.orderNo;
        const orderBottom = !next || next.orderNo !== current.orderNo;
        td.classList.toggle('order-group-top', orderTop);
        td.classList.toggle('order-group-bottom', orderBottom);
        td.classList.toggle('order-group-left', col === 0);
        td.classList.toggle('order-group-right', col === getGridColumnDefs().length - 1);
        td.classList.toggle('recv-group-top', !orderTop && !!prev && prev.recipientNm !== current.recipientNm);
        td.classList.toggle('recv-merged', prop === 'recipientNm' && mergedRawIds.has(orderIdOf(current)));
        const text = String(td.textContent || '').trim();
        if (text) td.title = text;
        else td.removeAttribute('title');
      },
    })
  );
};

const destroyGrid = () => {
  if (hot && !hot.isDestroyed) hot.destroy();
  hot = null;
};

const measureGrid = () => {
  const el = gridWrapRef.value;
  const instance = getHot();
  if (!el || !instance) return;
  const height = Math.max(120, el.clientHeight);
  const width = Math.max(320, el.clientWidth);
  const settings = instance.getSettings();
  if (settings.height === height && settings.width === width) return;
  instance.updateSettings({ height, width });
};

const toggleSearchPanel = () => {
  searchPanelOpen.value = !searchPanelOpen.value;
  nextTick(() => {
    measureGrid();
    getHot()?.refreshDimensions();
  });
};

/** 주문 단위로 limit 건까지 */
const takeOrders = (list, limit) => {
  const max = Number(limit) || 20;
  const orderNos = [];
  for (const row of list) {
    const key = String(row.orderNo || '');
    if (!orderNos.includes(key)) orderNos.push(key);
    if (orderNos.length >= max) break;
  }
  const allowed = new Set(orderNos);
  return list.filter((row) => allowed.has(String(row.orderNo || '')));
};

const onSearch = async () => {
  loading.value = true;
  let list;
  try {
    const result = await proxy.$api.onApiQueryStockAssign({});
    list = result?.list || result?.content || result || [];
    list = Array.isArray(list) ? list : [];
  } finally {
    loading.value = false;
  }
  // 수량 N → qty=1 행 N개로 분리, 수령자 _숫자 보정 후, 정렬·lineNoSub 부여
  list = ensureRecipientSuffix(expandQtyToRows(list));
  list.sort((a, b) => {
    for (const key of [search.sort1, search.sort2]) {
      if (!key) continue;
      const diff = String(a[key] ?? '').localeCompare(String(b[key] ?? ''), 'ko', { numeric: true });
      if (diff) return diff;
    }
    return 0;
  });
  assignLineNoSubByRecipient(list);
  sourceRows.value = list;
  mergedRawIds.clear();
  rows.value = decorate(takeOrders(list, search.limit));
  renderGrid();
  nextTick(() => {
    measureGrid();
    getHot()?.refreshDimensions();
  });
};

/**
 * 변경된 orderId 의 펼친 행을 orderId+lineNo+lineNoSub 로 다시 합쳐
 * PUT /api/v1/orderItem 으로 저장한다. qty 는 합산한다.
 */
const onSave = async () => {
  const targets = sourceRows.value.filter((row) => mergedRawIds.has(orderIdOf(row)));
  if (!targets.length) {
    message.warning(t('message.selectRequired'));
    return;
  }
  const merged = new Map();
  targets.forEach((row) => {
    const key = itemKeyOf(row);
    if (!merged.has(key)) {
      merged.set(key, {
        orderId: row.orderId,
        lineNo: row.lineNo,
        lineNoSub: row.lineNoSub ?? 0,
        recipientNm: row.recipientNm,
        productCd: row.productCd,
        productNm: row.orderProductNm ?? row.productNm,
        qty: 0,
        deliveryStatus: row.deliveryStatus,
        shippingNo: row.shippingNo,
        isAssign: row.isAssign,
      });
    }
    merged.get(key).qty += Math.max(1, Number(row.qty) || 1);
  });
  const body = [...merged.values()];
  saving.value = true;
  try {
    const result = await proxy.$api.onApiSaveOrderItem(body);
    if (!result) return;
    message.success(t('message.saved'));
  } finally {
    saving.value = false;
  }
};

const onExcel = () => {
  if (!rows.value.length) {
    message.warning(t('common.noData'));
    return;
  }
  commonFunction.fncExportExcel(
    rows.value,
    getGridColumnDefs().map((col) => ({ title: col.header, dataIndex: col.data })),
    `${t('common.boxSplitQtyBox')}_${dayjs().format('YYYYMMDD')}.xlsx`
  );
};

const onPrint = () => window.print();

const onHelp = () => {
  Modal.info({ title: t('common.help'), content: t('orderBoxSplit.help'), okText: t('common.confirm') });
};

const onClose = () => {
  window.close();
  if (!window.closed && !window.opener) router.push({ name: 'stockAssign' });
};

onMounted(() => {
  document.title = t('common.boxSplitQtyBox');
  destroyGrid();
  createGrid();
  onSearch();
  window.addEventListener('resize', measureGrid);
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', measureGrid);
  destroyGrid();
});
</script>

<style scoped>
.split-page {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-width: 0;
  overflow: hidden;
  background: #fff;
}

.split-toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 34px;
  padding: 4px 10px;
  border-bottom: 1px solid var(--wms-border);
  background: #f7f8fa;
}

.split-toolbar__title {
  color: #1e4e79;
  font-size: 13px;
  font-weight: 700;
  white-space: nowrap;
}

.split-toolbar__actions {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-left: auto;
}

.split-toolbar__utils {
  display: flex;
  gap: 2px;
  margin-left: 8px;
  padding-left: 8px;
  border-left: 1px solid var(--wms-border);
}

.split-icon {
  width: 26px;
  height: 24px;
  border: 0;
  border-radius: 3px;
  background: transparent;
  color: #3d6d99;
  font-size: 15px;
  cursor: pointer;
}

.split-icon:hover {
  background: #e8f1f8;
}

.split-icon--excel {
  color: #217346;
}

.split-row {
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 32px;
  padding: 4px 10px;
  background: #f3f6f8;
  border-bottom: 1px solid var(--wms-border);
}

.split-row__label {
  color: #1e4e79;
  font-weight: 700;
  white-space: nowrap;
}

.split-body {
  flex: 1;
  min-width: 0;
  min-height: 0;
  position: relative;
  overflow: hidden;
  --ht-header-background-color: #d6e7f5;
  --ht-header-foreground-color: #1e4e79;
  --ht-header-font-weight: 700;
  --ht-cell-horizontal-border-color: #c5d8ea;
  --ht-cell-vertical-border-color: #c5d8ea;
}

.split-body__host {
  width: 100%;
  height: 100%;
}

.split-body :deep(.ht_clone_top th),
.split-body :deep(.ht_master thead th) {
  background: #d6e7f5;
  color: #1e4e79;
  font-weight: 700;
  white-space: nowrap;
  text-align: center;
  vertical-align: middle;
}

.split-body :deep(td.order-group-top) {
  border-top: 1.5px solid #e53935 !important;
}

.split-body :deep(td.order-group-bottom) {
  border-bottom: 1.5px solid #e53935 !important;
}

.split-body :deep(td.order-group-left) {
  border-left: 1.5px solid #e53935 !important;
}

.split-body :deep(td.order-group-right) {
  border-right: 1.5px solid #e53935 !important;
}

.split-body :deep(td.recv-group-top) {
  border-top: 1px solid #ffd54f !important;
}

.split-body :deep(td.recv-merged) {
  color: #1565c0 !important;
  font-weight: 700;
}

.split-footer {
  display: flex;
  align-items: center;
  gap: 32px;
  min-height: 28px;
  padding: 2px 10px;
  border-top: 1px solid var(--wms-border);
  background: #d6e7f5;
  color: #1e4e79;
  font-weight: 700;
  font-size: 12px;
}

@media print {
  .split-toolbar,
  .split-row,
  .split-footer {
    display: none !important;
  }

  .split-page {
    height: auto;
  }
}
</style>
