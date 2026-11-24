<template>
  <div class="common-code-page">
    <div class="common-code-toolbar">
      <div class="common-code-toolbar__title">※ {{ $t('menu.commonCode') }}</div>
      <div class="common-code-toolbar__actions">
        <a-button size="small" @click="onSearch">
          <template #icon><SearchOutlined /></template>
          {{ $t('common.search') }}
        </a-button>
      </div>
      <div class="common-code-toolbar__utils">
        <a-tooltip :title="$t('common.excelDownload')">
          <button type="button" class="common-code-icon-btn common-code-icon-btn--excel" @click="onExcel">
            <FileExcelOutlined />
          </button>
        </a-tooltip>
        <a-tooltip :title="$t('common.reset')">
          <button type="button" class="common-code-icon-btn" @click="onReset">
            <UndoOutlined />
          </button>
        </a-tooltip>
        <a-tooltip :title="$t('common.openNewWindow')">
          <button type="button" class="common-code-icon-btn" @click="onOpenWindow">
            <DesktopOutlined />
          </button>
        </a-tooltip>
        <a-tooltip :title="$t('common.printPreview')">
          <button type="button" class="common-code-icon-btn" @click="onPrint">
            <PrinterOutlined />
          </button>
        </a-tooltip>
      </div>
    </div>

    <div class="common-code-search">
      <!-- 엔티티 필드마다 검색 조건 1개, 한 행에 4개씩. 문자열=부분일치 / 날짜=기간 / 숫자=최소~최대 -->
      <div class="common-code-search__grid">
        <div v-for="f in FIELDS" :key="f.data" class="common-code-search__item">
          <span class="common-code-search__label" :title="$t(`field.${f.data}`)">{{ $t(`field.${f.data}`) }}</span>
          <a-range-picker
            v-if="f.type === 'date'"
            v-model:value="cond[f.data]"
            size="small"
            format="YYYY-MM-DD"
            class="flex-1"
          />
          <div v-else-if="f.type === 'number'" class="common-code-search__range">
            <a-input-number v-model:value="cond[f.data].min" size="small" :controls="false" @press-enter="onSearch" />
            <span>~</span>
            <a-input-number v-model:value="cond[f.data].max" size="small" :controls="false" @press-enter="onSearch" />
          </div>
          <a-input v-else v-model:value="cond[f.data]" size="small" class="flex-1" allow-clear @press-enter="onSearch" />
        </div>
      </div>
      <div class="common-code-search__row">
        <a-select
          v-model:value="search.pageSize"
          :options="pageSizeOptions"
          size="small"
          style="width: 110px"
          @change="onPageSizeChange"
        />
        <a-button size="small" @click="expandAll">{{ $t('common.expandAll') }}</a-button>
        <a-button size="small" @click="collapseAll">{{ $t('common.collapseAll') }}</a-button>
        <div class="flex-1" />
        <span class="wms-search__label">{{ $t('field.sort') }}</span>
        <a-select v-model:value="search.sort1" :options="sortOptions" size="small" style="width: 150px" @change="onSortChange" />
        <a-select v-model:value="search.sort2" :options="sortOptions" size="small" style="width: 150px" @change="onSortChange" />
      </div>
    </div>

    <div class="common-code-tree">
      <div class="common-code-tree__scroll">
        <div class="common-code-tree__table" :style="{ '--tree-columns': treeColumnTemplate }">
          <div class="common-code-tree__head-row is-group">
            <span class="common-code-tree__cell common-code-tree__cell--name">
              {{ $t('field.groupName') }}
              <i class="common-code-tree__resizer" @pointerdown.prevent="startTreeColumnResize(0, $event)" />
            </span>
            <span class="common-code-tree__cell common-code-tree__cell--left">
              {{ $t('field.groupCd') }}
              <i class="common-code-tree__resizer" @pointerdown.prevent="startTreeColumnResize(1, $event)" />
            </span>
            <span v-for="n in 8" :key="`group-head-${n}`" class="common-code-tree__cell" />
            <span class="common-code-tree__cell">{{ $t('field.codeCount') }}</span>
          </div>
          <div class="common-code-tree__head-row is-code">
            <span
              v-for="(header, index) in treeHeaders"
              :key="header.key"
              class="common-code-tree__cell"
              :class="{ 'common-code-tree__cell--name': index === 0, 'common-code-tree__cell--remark': header.key === 'remark' }"
            >
              {{ header.label }}
              <i
                v-if="index < treeHeaders.length - 1"
                class="common-code-tree__resizer"
                @pointerdown.prevent="startTreeColumnResize(index, $event)"
              />
            </span>
          </div>

          <template v-if="pagedGroups.length">
            <div v-for="group in pagedGroups" :key="group.groupCd" class="common-code-tree__group">
              <div
                role="button"
                tabindex="0"
                class="common-code-tree__row is-group"
                @click="toggleGroup(group.groupCd)"
                @keydown.enter.prevent="toggleGroup(group.groupCd)"
              >
                <span class="common-code-tree__cell common-code-tree__cell--name">
                  <span class="common-code-tree__toggle">
                    <CaretDownOutlined v-if="isExpanded(group.groupCd)" />
                    <CaretRightOutlined v-else />
                  </span>
                  <FolderOpenOutlined v-if="isExpanded(group.groupCd)" class="common-code-tree__icon is-folder" />
                  <FolderOutlined v-else class="common-code-tree__icon is-folder" />
                  <span class="ellipsis" :title="group.groupNm">{{ group.groupNm }}</span>
                </span>
                <span class="common-code-tree__cell common-code-tree__cell--left" :title="group.groupCd">{{ group.groupCd }}</span>
                <span v-for="n in 8" :key="`group-cell-${n}`" class="common-code-tree__cell" />
                <span class="common-code-tree__cell">{{ group.items.length }}</span>
              </div>

              <template v-if="isExpanded(group.groupCd)">
                <div
                  v-for="item in group.items"
                  :key="`${group.groupCd}::${item.code}`"
                  class="common-code-tree__row is-item"
                >
                  <span class="common-code-tree__cell common-code-tree__cell--name">
                    <TagsOutlined class="common-code-tree__icon is-item" />
                    <a
                      href="#"
                      class="common-code-tree__name-link ellipsis"
                      :title="codeNameOf(item)"
                      @click.prevent="openForm(group)"
                    >
                      {{ codeNameOf(item) }}
                    </a>
                  </span>
                  <span class="common-code-tree__cell" />
                  <span class="common-code-tree__cell" :title="item.code">{{ item.code }}</span>
                  <span class="common-code-tree__cell">{{ item.sort }}</span>
                  <span class="common-code-tree__cell" :title="item.data1">{{ item.data1 }}</span>
                  <span class="common-code-tree__cell" :title="item.data2">{{ item.data2 }}</span>
                  <span class="common-code-tree__cell" :title="item.data3">{{ item.data3 }}</span>
                  <span class="common-code-tree__cell" :title="String(item.data4 ?? '')">{{ item.data4 }}</span>
                  <span class="common-code-tree__cell" :title="String(item.data5 ?? '')">{{ item.data5 }}</span>
                  <span class="common-code-tree__cell common-code-tree__cell--remark" :title="item.remark">{{ item.remark }}</span>
                  <span class="common-code-tree__cell" />
                </div>
                <div v-if="!group.items.length" class="common-code-tree__empty">{{ $t('common.noData') }}</div>
              </template>
            </div>
          </template>
          <a-empty
            v-else
            class="common-code-tree__empty-state"
            :image="Empty.PRESENTED_IMAGE_SIMPLE"
            :description="$t('common.noData')"
          />
        </div>
      </div>
    </div>

    <div class="common-code-pager">
      <div class="common-code-pager__nav">
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
      <span class="common-code-pager__total">{{ $t('common.totalItems', { n: $cf.fncComma(page.total) }) }}</span>
    </div>
  </div>
</template>

<script setup>
// 이 파일은 scripts/genPage.mjs 가 CommonCode.java 에서 생성했다. (템플릿: scripts/templates/PgEntity.vue.tpl)
import { computed, getCurrentInstance, onBeforeUnmount, onMounted, reactive, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { Empty, message } from 'ant-design-vue';
import dayjs from 'dayjs';
import commonFunction from '@/common/utils/commonFunction';
import { FORM_CHANNEL, formUrl, openFormWindow, stashFormPayload } from './commonCodePopup';

const { proxy } = getCurrentInstance();
const { t } = useI18n();

defineOptions({ name: 'PgCommonCode' });

/** 조회 API: apiFunctions.onApiQueryCommonCode() → GET v1/commonCodes */
const queryApi = (params) => proxy.$api.onApiQueryCommonCode(params);

/** 상세 팝업에 넘길 id 를 만드는 @Id 필드. 여러 개면 "값1,값2" 로 이어 붙여 한 구간으로 보낸다 (GET v1/commonCode/{id}) */
const ID_FIELDS = ['groupCd', 'code'];

/** 엔티티 필드 → 그리드 컬럼 (헤더는 i18n field.<data>) */
const FIELDS = [
  { data: 'groupCd', type: 'text', className: '', width: 220 },
  { data: 'groupNm', type: 'text', className: '', width: 220 },
  { data: 'code', type: 'text', className: '', width: 220 },
  { data: 'name', type: 'text', className: '', width: 120 },
  { data: 'sort', type: 'number', className: 'htRight', width: 90 },
  { data: 'data1', type: 'text', className: '', width: 220 },
  { data: 'data2', type: 'text', className: '', width: 220 },
  { data: 'data3', type: 'text', className: '', width: 220 },
  { data: 'data4', type: 'number', className: 'htRight', width: 90 },
  { data: 'data5', type: 'number', className: 'htRight', width: 90 },
  { data: 'remark', type: 'text', className: '', width: 220 },
];

const filtered = ref([]);
const expandedIds = ref([]);
const treeColumnWidths = ref([250, 250, 160, 90, 140, 140, 140, 90, 90, 180, 70]);
const treeColumnTemplate = computed(() => treeColumnWidths.value.map((width) => `${width}px`).join(' '));
let treeResizeCleanup = null;

const treeHeaders = computed(() => [
  { key: 'name', label: t('field.name') },
  { key: 'groupCd', label: '' },
  { key: 'code', label: t('field.code') },
  { key: 'sort', label: t('field.sort') },
  { key: 'data1', label: t('field.data1') },
  { key: 'data2', label: t('field.data2') },
  { key: 'data3', label: t('field.data3') },
  { key: 'data4', label: t('field.data4') },
  { key: 'data5', label: t('field.data5') },
  { key: 'remark', label: t('field.remark') },
  { key: 'count', label: '' },
]);

const startTreeColumnResize = (index, event) => {
  treeResizeCleanup?.();
  const startX = event.clientX;
  const startWidth = treeColumnWidths.value[index];

  const onMove = (moveEvent) => {
    treeColumnWidths.value[index] = Math.max(60, startWidth + moveEvent.clientX - startX);
  };
  const onUp = () => treeResizeCleanup?.();

  treeResizeCleanup = () => {
    document.removeEventListener('pointermove', onMove);
    document.removeEventListener('pointerup', onUp);
    document.removeEventListener('pointercancel', onUp);
    window.removeEventListener('blur', onUp);
    document.body.style.removeProperty('cursor');
    document.body.style.removeProperty('user-select');
    treeResizeCleanup = null;
  };
  document.body.style.cursor = 'col-resize';
  document.body.style.userSelect = 'none';
  document.addEventListener('pointermove', onMove);
  document.addEventListener('pointerup', onUp);
  document.addEventListener('pointercancel', onUp);
  window.addEventListener('blur', onUp);
};

/** 정렬 값은 "<필드>:asc" / "<필드>:desc" */
const DEFAULT_SEARCH = {
  pageSize: 20,
  sort1: 'groupCd:asc',
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

const codeNameOf = (row) => row?.name || row?.nameKo || row?.nameEn || '';

const groupedRows = computed(() => {
  const groups = new Map();
  filtered.value.forEach((row) => {
    const groupCd = String(row.groupCd || '');
    if (!groups.has(groupCd)) {
      groups.set(groupCd, {
        groupCd,
        groupNm: row.groupNm || groupCd,
        items: [],
      });
    }
    groups.get(groupCd).items.push(row);
  });
  return [...groups.values()];
});

const pagedGroups = computed(() => {
  const start = (page.current - 1) * search.pageSize;
  return groupedRows.value.slice(start, start + search.pageSize);
});

const isExpanded = (groupCd) => expandedIds.value.includes(groupCd);

const toggleGroup = (groupCd) => {
  expandedIds.value = isExpanded(groupCd)
    ? expandedIds.value.filter((id) => id !== groupCd)
    : [...expandedIds.value, groupCd];
};

const expandAll = () => {
  expandedIds.value = groupedRows.value.map((group) => group.groupCd);
};

const collapseAll = () => {
  expandedIds.value = [];
};

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
    return view;
  });

const idOf = (row) => ID_FIELDS.map((key) => encodeURIComponent(String(row?.[key] ?? ''))).join(',');

let formChannel = null;

/** 상세 팝업에서 저장하면 목록을 다시 조회한다 */
const onFormMessage = (event) => {
  if (event.origin && event.origin !== window.location.origin) return;
  if (event.data?.type !== 'commonCode-saved') return;
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

const renderPage = () => {
  const size = search.pageSize;
  const totalPages = Math.max(1, Math.ceil(groupedRows.value.length / size));
  if (page.current > totalPages) page.current = totalPages;
  page.total = groupedRows.value.length;
  page.totalPages = totalPages;
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
    `${t('menu.commonCode')}_${dayjs().format('YYYYMMDD')}.xlsx`
  );
};

const onOpenWindow = () => {
  window.open(window.location.href, '_blank', 'noopener,noreferrer,width=1440,height=900');
};

const onPrint = () => window.print();

onMounted(() => {
  onSearch();
  window.addEventListener('message', onFormMessage);
  if ('BroadcastChannel' in window) {
    formChannel = new BroadcastChannel(FORM_CHANNEL);
    formChannel.onmessage = (event) => onFormMessage(event);
  }
});

onBeforeUnmount(() => {
  treeResizeCleanup?.();
  window.removeEventListener('message', onFormMessage);
  formChannel?.close();
  formChannel = null;
});
</script>

<style scoped>
.common-code-page {
  display: flex;
  flex-direction: column;
  height: calc(
    100vh - var(--wms-gnb-height) - var(--wms-userbar-height) - var(--wms-tabbar-height) -
      var(--wms-footer-height) - 36px
  );
  background: #fff;
  overflow: hidden;
}

.common-code-toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 36px;
  padding: 4px 10px;
  border-bottom: 1px solid var(--wms-border);
  background: #f7f8fa;
}

.common-code-toolbar__title {
  font-size: 13px;
  font-weight: 700;
  color: #1e4e79;
  white-space: nowrap;
}

.common-code-toolbar__actions {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-left: auto;
}

.common-code-toolbar__utils {
  display: flex;
  align-items: center;
  gap: 2px;
  margin-left: 8px;
  padding-left: 8px;
  border-left: 1px solid var(--wms-border);
}

.common-code-icon-btn {
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

.common-code-icon-btn:hover {
  background: #e8f1f8;
}

.common-code-icon-btn--excel {
  color: #217346;
}

.common-code-search {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 8px 10px;
  background: #f3f6f8;
  border-bottom: 1px solid var(--wms-border);
}

.common-code-search__row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.common-code-search__grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 6px 16px;
}

.common-code-search__item {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
}

.common-code-search__label {
  flex: 0 0 96px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 12px;
  color: var(--wms-text);
}

.common-code-search__range {
  display: flex;
  flex: 1;
  align-items: center;
  gap: 4px;
  min-width: 0;
}

.common-code-search__range :deep(.ant-input-number) {
  flex: 1;
  min-width: 0;
}

.common-code-tree {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
}

.common-code-tree__scroll {
  flex: 1;
  min-height: 0;
  overflow: auto;
  border: 1px solid #8aafcc;
  background: #fff;
}

.common-code-tree__table {
  display: grid;
  grid-template-columns: var(--tree-columns);
  align-content: start;
  min-width: 1450px;
}

.common-code-tree__group {
  display: contents;
}

.common-code-tree__head-row,
.common-code-tree__row {
  display: grid;
  grid-column: 1 / -1;
  grid-template-columns: subgrid;
  align-items: center;
  min-height: 28px;
  padding: 0 8px;
  box-sizing: border-box;
}

.common-code-tree__head-row {
  position: sticky;
  z-index: 2;
  color: #1e4e79;
  font-weight: 700;
}

.common-code-tree__head-row.is-group {
  top: 0;
  background: #c5ddf0;
  border-bottom: 1px solid #b7d0e6;
}

.common-code-tree__head-row.is-code {
  top: 28px;
  background: #d6e7f5;
  border-bottom: 1px solid #c5d8ea;
}

.common-code-tree__head-row .common-code-tree__cell--name {
  padding-left: 48px;
}

.common-code-tree__row {
  border-bottom: 1px solid #e4eef6;
  background: #fff;
  color: var(--wms-text);
  cursor: pointer;
}

.common-code-tree__row.is-group {
  background: #f7fbfe;
  font-weight: 700;
  border-top: 1px solid #5d87ab;
}

.common-code-tree__row.is-item {
  cursor: default;
}

.common-code-tree__row.is-item .common-code-tree__cell--name {
  padding-left: 28px;
}

.common-code-tree__row:hover {
  background: #e8f1f8;
}

.common-code-tree__cell {
  position: relative;
  min-width: 0;
  overflow: hidden;
  padding: 0 6px;
  border-right: 1px solid #d6e3ed;
  text-align: center;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.common-code-tree__resizer {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  z-index: 4;
  width: 8px;
  border-right: 2px solid #6f9abd;
  cursor: col-resize;
  touch-action: none;
}

.common-code-tree__resizer:hover {
  border-right-color: #174f82;
}

.common-code-tree__head-row .common-code-tree__cell:first-child,
.common-code-tree__row .common-code-tree__cell:first-child {
  border-left: 1px solid #d6e3ed;
}

.common-code-tree__cell--name,
.common-code-tree__cell--left,
.common-code-tree__cell--remark {
  text-align: left;
}

.common-code-tree__cell--name {
  display: flex;
  align-items: center;
  gap: 6px;
}

.common-code-tree__name-link {
  min-width: 0;
  color: #1a5fad;
  text-decoration: underline;
}

.common-code-tree__name-link:hover {
  color: #0d3f78;
}

.common-code-tree__toggle {
  display: inline-flex;
  width: 16px;
  color: #3d6d99;
}

.common-code-tree__icon {
  flex: 0 0 auto;
  font-size: 14px;
}

.common-code-tree__icon.is-folder {
  color: #c9a227;
}

.common-code-tree__icon.is-item {
  color: #3d6d99;
}

.common-code-tree__empty {
  grid-column: 1 / -1;
  padding: 6px 8px 6px 52px;
  color: var(--wms-text-sub);
  font-size: 12px;
}

.common-code-tree__empty-state {
  grid-column: 1 / -1;
}

.common-code-pager {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 34px;
  padding: 4px 10px;
  border-top: 1px solid var(--wms-border);
  background: #f7f8fa;
}

.common-code-pager__nav {
  display: flex;
  align-items: center;
  gap: 2px;
}

.common-code-pager__nav button {
  min-width: 24px;
  height: 24px;
  padding: 0 6px;
  border: 1px solid transparent;
  background: transparent;
  color: #1e4e79;
  font-size: 12px;
  cursor: pointer;
}

.common-code-pager__nav button:hover:not(:disabled) {
  border-color: #9bb8d3;
  background: #e8f1f8;
}

.common-code-pager__nav button.is-active {
  border-color: #3d6d99;
  background: #d6e7f5;
  font-weight: 700;
}

.common-code-pager__nav button:disabled {
  color: #aaa;
  cursor: default;
}

.common-code-pager__total {
  font-weight: 600;
  color: var(--wms-text);
}

@media print {
  .common-code-toolbar,
  .common-code-search,
  .common-code-pager {
    display: none !important;
  }

  .common-code-page,
  .common-code-tree__scroll {
    height: auto;
    overflow: visible;
  }
}
</style>
