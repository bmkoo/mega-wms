<template>
  <div class="brand-page">
    <div class="brand-toolbar">
      <div class="brand-toolbar__title">※ {{ $t('menu.brand') }}</div>
      <div class="brand-toolbar__actions">
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
      <div class="brand-toolbar__utils">
        <a-tooltip :title="$t('common.excelDownload')">
          <button type="button" class="brand-icon-btn brand-icon-btn--excel" @click="onExcel">
            <FileExcelOutlined />
          </button>
        </a-tooltip>
        <a-tooltip :title="$t('common.reset')">
          <button type="button" class="brand-icon-btn" @click="onReset">
            <UndoOutlined />
          </button>
        </a-tooltip>
        <a-tooltip :title="$t('common.openNewWindow')">
          <button type="button" class="brand-icon-btn" @click="onOpenWindow">
            <DesktopOutlined />
          </button>
        </a-tooltip>
        <a-tooltip :title="$t('common.printPreview')">
          <button type="button" class="brand-icon-btn" @click="onPrint">
            <PrinterOutlined />
          </button>
        </a-tooltip>
        <a-tooltip :title="$t('common.help')">
          <button type="button" class="brand-icon-btn" @click="onHelp">
            <QuestionCircleOutlined />
          </button>
        </a-tooltip>
      </div>
    </div>

    <div class="brand-search">
      <div class="brand-search__row">
        <span class="wms-search__label">{{ $t('field.searchCondition') }}</span>
        <a-select v-model:value="search.field" :options="searchFieldOptions" size="small" style="width: 130px" />
        <a-input
          v-model:value="search.keyword"
          size="small"
          class="flex-1"
          allow-clear
          @press-enter="onSearch"
        />
        <span class="wms-search__label">{{ $t('field.useYn') }}</span>
        <a-select v-model:value="search.useYn" :options="useYnOptions" size="small" style="width: 110px" />
      </div>
      <div class="brand-search__row">
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
        <a-select v-model:value="search.sort" :options="sortOptions" size="small" style="width: 150px" @change="onSortChange" />
      </div>
    </div>

    <div class="brand-tree">
      <div class="brand-tree__head">
        <span class="brand-tree__cell brand-tree__cell--name">{{ $t('field.groupOrBrand') }}</span>
        <span class="brand-tree__cell brand-tree__cell--id">{{ $t('field.groupId') }} / {{ $t('field.brandNo') }}</span>
        <span class="brand-tree__cell brand-tree__cell--use">{{ $t('field.useYn') }}</span>
        <span class="brand-tree__cell brand-tree__cell--count">{{ $t('field.brandCount') }}</span>
        <span class="brand-tree__cell brand-tree__cell--user">{{ $t('field.inputUser') }}</span>
        <span class="brand-tree__cell brand-tree__cell--date">{{ $t('field.inputDate') }}</span>
        <span class="brand-tree__cell brand-tree__cell--user">{{ $t('field.updUser') }}</span>
        <span class="brand-tree__cell brand-tree__cell--date">{{ $t('field.updDt') }}</span>
      </div>

      <div class="brand-tree__body">
        <template v-if="pagedGroups.length">
          <div v-for="group in pagedGroups" :key="group.id" class="brand-tree__group">
            <button
              type="button"
              class="brand-tree__row is-group"
              :class="{ 'is-selected': isSelected('group', group.id) }"
              @click="onSelectGroup(group)"
              @dblclick="onModify"
            >
              <span class="brand-tree__cell brand-tree__cell--name">
                <span class="brand-tree__toggle" @click.stop="toggleGroup(group.id)">
                  <CaretDownOutlined v-if="isExpanded(group.id)" />
                  <CaretRightOutlined v-else />
                </span>
                <FolderOpenOutlined v-if="isExpanded(group.id)" class="brand-tree__icon is-folder" />
                <FolderOutlined v-else class="brand-tree__icon is-folder" />
                <span class="ellipsis">{{ group.groupName }}</span>
              </span>
              <span class="brand-tree__cell brand-tree__cell--id">{{ group.id }}</span>
              <span class="brand-tree__cell brand-tree__cell--use" />
              <span class="brand-tree__cell brand-tree__cell--count">{{ group.brands.length }}</span>
              <span class="brand-tree__cell brand-tree__cell--user">{{ group.inputUser }}</span>
              <span class="brand-tree__cell brand-tree__cell--date">{{ group.inputDate }}</span>
              <span class="brand-tree__cell brand-tree__cell--user">{{ group.updUser }}</span>
              <span class="brand-tree__cell brand-tree__cell--date">{{ group.updDt }}</span>
            </button>

            <template v-if="isExpanded(group.id)">
              <button
                v-for="brand in group.brands"
                :key="brand.id"
                type="button"
                class="brand-tree__row is-brand"
                :class="{ 'is-selected': isSelected('brand', brand.id) }"
                @click="onSelectBrand(group, brand)"
                @dblclick="onModify"
              >
                <span class="brand-tree__cell brand-tree__cell--name">
                  <TagsOutlined class="brand-tree__icon is-brand" />
                  <span class="ellipsis">{{ brand.brandName }}</span>
                </span>
                <span class="brand-tree__cell brand-tree__cell--id">{{ brand.brandNo }}</span>
                <span class="brand-tree__cell brand-tree__cell--use">{{ useYnLabel(brand.useYn) }}</span>
                <span class="brand-tree__cell brand-tree__cell--count" />
                <span class="brand-tree__cell brand-tree__cell--user" />
                <span class="brand-tree__cell brand-tree__cell--date" />
                <span class="brand-tree__cell brand-tree__cell--user">{{ brand.updUser }}</span>
                <span class="brand-tree__cell brand-tree__cell--date">{{ brand.updDt }}</span>
              </button>
              <div v-if="!group.brands.length" class="brand-tree__empty">{{ $t('common.noData') }}</div>
            </template>
          </div>
        </template>
        <a-empty v-else :image="Empty.PRESENTED_IMAGE_SIMPLE" :description="$t('common.noData')" />
      </div>
    </div>

    <div class="brand-pager">
      <div class="brand-pager__nav">
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
      <span class="brand-pager__total">
        {{ $t('common.totalGroupBrand', { g: $cf.fncComma(page.total), b: $cf.fncComma(brandTotal) }) }}
      </span>
    </div>
  </div>
</template>

<script setup>
import { computed, getCurrentInstance, nextTick, onBeforeUnmount, onMounted, reactive, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { Empty, Modal, message } from 'ant-design-vue';
import dayjs from 'dayjs';
import commonFunction from '@/common/utils/commonFunction';
import { getMockBrandGroups } from './brandMock';
import { BRAND_FORM_CHANNEL, brandFormUrl, openBrandFormWindow, stashBrandFormPayload } from './brandPopup';

const { proxy } = getCurrentInstance();
const { t } = useI18n();

defineOptions({ name: 'PgBrand' });

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

const groups = ref([]);
const expandedIds = ref([]);
const selected = reactive({ type: '', groupId: null, brandId: null });
let brandChannel = null;

const search = reactive({
  field: 'all',
  keyword: '',
  useYn: '',
  pageSize: 20,
  sort: 'groupName',
});

const page = reactive({
  current: 1,
  total: 0,
  totalPages: 1,
});

const searchFieldOptions = computed(() => [
  { value: 'all', label: t('common.all') },
  { value: 'groupName', label: t('field.groupName') },
  { value: 'brandName', label: t('field.brandName') },
]);

const useYnOptions = computed(() => [
  { value: '', label: t('common.all') },
  { value: 'Y', label: t('common.use') },
  { value: 'N', label: t('common.unused') },
]);

const sortOptions = computed(() => [
  { value: 'groupName', label: t('field.groupName') },
  { value: 'brandCount', label: t('field.brandCount') },
  { value: 'updDtDesc', label: t('field.updDtDesc') },
  { value: 'inputDate', label: t('field.inputDate') },
]);

const pageSizeOptions = computed(() =>
  [20, 50, 100, 500, 1000].map((n) => ({ value: n, label: t('common.perPage', { n }) }))
);

const useYnLabel = (useYn) => (useYn === 'N' ? t('common.unused') : t('common.use'));

const matchText = (value, keyword) => String(value || '').toLowerCase().includes(keyword);

const sortGroups = (rows) => {
  const list = [...rows];
  list.sort((a, b) => {
    if (search.sort === 'brandCount') return (b.brands?.length || 0) - (a.brands?.length || 0);
    if (search.sort === 'updDtDesc') return String(b.updDt || '').localeCompare(String(a.updDt || ''));
    if (search.sort === 'inputDate') return String(a.inputDate || '').localeCompare(String(b.inputDate || ''));
    return String(a.groupName || '').localeCompare(String(b.groupName || ''), 'ko');
  });
  return list;
};

const filteredGroups = computed(() => {
  const keyword = search.keyword.trim().toLowerCase();
  return sortGroups(
    groups.value
      .map((group) => {
        const groupHit = !keyword || matchText(group.groupName, keyword);
        const byUseYn = (group.brands || []).filter((brand) => !search.useYn || brand.useYn === search.useYn);
        const brandHits = byUseYn.filter(
          (brand) => !keyword || matchText(brand.brandName, keyword) || matchText(brand.brandNo, keyword)
        );

        if (search.field === 'groupName') {
          if (keyword && !groupHit) return null;
          return { ...group, brands: byUseYn };
        }
        if (search.field === 'brandName') {
          if (keyword && !brandHits.length) return null;
          return { ...group, brands: keyword ? brandHits : byUseYn };
        }
        if (keyword && groupHit) return { ...group, brands: byUseYn };
        if (keyword && brandHits.length) return { ...group, brands: brandHits };
        if (keyword) return null;
        return { ...group, brands: byUseYn };
      })
      .filter(Boolean)
  );
});

const brandTotal = computed(() => filteredGroups.value.reduce((sum, group) => sum + (group.brands?.length || 0), 0));

const pageNumbers = computed(() => {
  const totalPages = Math.max(1, page.totalPages);
  const windowSize = 10;
  const start = Math.floor((page.current - 1) / windowSize) * windowSize + 1;
  const end = Math.min(start + windowSize - 1, totalPages);
  const list = [];
  for (let i = start; i <= end; i += 1) list.push(i);
  return list;
});

const pagedGroups = computed(() => {
  const size = search.pageSize;
  const start = (page.current - 1) * size;
  return filteredGroups.value.slice(start, start + size);
});

const syncPage = () => {
  page.total = filteredGroups.value.length;
  page.totalPages = Math.max(1, Math.ceil(page.total / search.pageSize));
  if (page.current > page.totalPages) page.current = page.totalPages;
};

const isExpanded = (id) => expandedIds.value.includes(id);
const isSelected = (type, id) => selected.type === type && String(selected[type === 'group' ? 'groupId' : 'brandId']) === String(id);

const toggleGroup = (id) => {
  expandedIds.value = isExpanded(id) ? expandedIds.value.filter((item) => item !== id) : [...expandedIds.value, id];
};

const expandAll = () => {
  expandedIds.value = filteredGroups.value.map((group) => group.id);
};

const collapseAll = () => {
  expandedIds.value = [];
};

const clearSelection = () => {
  selected.type = '';
  selected.groupId = null;
  selected.brandId = null;
};

const onSelectGroup = (group) => {
  selected.type = 'group';
  selected.groupId = group.id;
  selected.brandId = null;
};

const onSelectBrand = (group, brand) => {
  selected.type = 'brand';
  selected.groupId = group.id;
  selected.brandId = brand.id;
};

const selectedGroup = () => groups.value.find((group) => String(group.id) === String(selected.groupId)) || null;

const normalizeGroups = (raw) => {
  const list = Array.isArray(raw) ? raw : raw?.content || [];
  if (!list.length) return [];
  if (list[0]?.brands || list[0]?.children) {
    return list.map((group) => ({
      id: group.id,
      groupName: group.groupName || group.name || '',
      inputUser: group.inputUser || '',
      inputDate: group.inputDate || '',
      updUser: group.updUser || '',
      updDt: group.updDt || '',
      brands: (group.brands || group.children || []).map((brand) => ({
        ...brand,
        groupId: group.id,
      })),
    }));
  }

  const map = new Map();
  list.forEach((row) => {
    const groupId = row.groupId ?? row.group?.id ?? 0;
    const groupName = row.groupName ?? row.group?.groupName ?? t('field.brandGroup');
    if (!map.has(groupId)) {
      map.set(groupId, {
        id: groupId,
        groupName,
        inputUser: row.groupInputUser || row.inputUser || '',
        inputDate: row.groupInputDate || row.inputDate || '',
        updUser: row.groupUpdUser || '',
        updDt: row.groupUpdDt || '',
        brands: [],
      });
    }
    map.get(groupId).brands.push({ ...row, groupId });
  });
  return [...map.values()];
};

const onSearch = async () => {
  page.current = 1;
  clearSelection();

  if (USE_MOCK) {
    groups.value = getMockBrandGroups();
    await nextTick();
    expandAll();
    syncPage();
    return;
  }

  const result = await proxy.$api.onApiQueryBrand({ //onApiQueryBrandGroup({
    searchField: search.field,
    keyword: search.keyword,
    useYn: search.useYn,
    sort: search.sort,
  });
  groups.value = normalizeGroups(result.list);
  await nextTick();
  expandAll();
  syncPage();
};

const onReset = () => {
  search.field = 'all';
  search.keyword = '';
  search.useYn = '';
  search.pageSize = 20;
  search.sort = 'groupName';
  onSearch();
};

const onPageSizeChange = () => {
  page.current = 1;
  syncPage();
};

const onSortChange = () => {
  page.current = 1;
  syncPage();
};

const goPage = (n) => {
  const next = Math.min(Math.max(1, n), page.totalPages);
  if (next === page.current) return;
  page.current = next;
  clearSelection();
};

const applySavedGroup = (row) => {
  if (!row) return;
  const next = normalizeGroups([row])[0] || row;
  const index = groups.value.findIndex((item) => String(item.id) === String(next.id));
  if (index >= 0) groups.value.splice(index, 1, next);
  else groups.value = [next, ...groups.value];
  if (!expandedIds.value.includes(next.id)) expandedIds.value = [...expandedIds.value, next.id];
  selected.type = 'group';
  selected.groupId = next.id;
  selected.brandId = null;
  syncPage();
  message.success(t('message.saved'));
};

const onBrandFormMessage = (event) => {
  if (event.origin && event.origin !== window.location.origin) return;
  if (event.data?.type !== 'brand-group-saved') return;
  applySavedGroup(event.data.row);
};

const openBrandForm = (mode, group = null) => {
  const token = stashBrandFormPayload({ mode, group });
  const href = brandFormUrl({ mode, id: group?.id, token });
  const popup = openBrandFormWindow(href);
  if (!popup) message.warning(t('message.popupBlocked'));
};

const onCreate = () => {
  openBrandForm('create', null);
};

const onModify = () => {
  const group = selectedGroup();
  if (!group) {
    message.warning(t('message.selectRequired'));
    return;
  }
  openBrandForm('modify', group);
};

const onExcel = () => {
  const rows = [];
  filteredGroups.value.forEach((group) => {
    if (!group.brands.length) {
      rows.push({
        groupId: group.id,
        groupName: group.groupName,
        brandNo: '',
        brandName: '',
        useYnLabel: '',
        brandCount: 0,
        inputUser: group.inputUser,
        inputDate: group.inputDate,
        updUser: group.updUser,
        updDt: group.updDt,
      });
      return;
    }
    group.brands.forEach((brand) => {
      rows.push({
        groupId: group.id,
        groupName: group.groupName,
        brandNo: brand.brandNo,
        brandName: brand.brandName,
        useYnLabel: useYnLabel(brand.useYn),
        brandCount: group.brands.length,
        inputUser: group.inputUser,
        inputDate: group.inputDate,
        updUser: brand.updUser,
        updDt: brand.updDt,
      });
    });
  });
  if (!rows.length) {
    message.warning(t('common.noData'));
    return;
  }
  commonFunction.fncExportExcel(
    rows,
    [
      { title: t('field.groupId'), dataIndex: 'groupId' },
      { title: t('field.groupName'), dataIndex: 'groupName' },
      { title: t('field.brandNo'), dataIndex: 'brandNo' },
      { title: t('field.brandName'), dataIndex: 'brandName' },
      { title: t('field.useYn'), dataIndex: 'useYnLabel' },
      { title: t('field.brandCount'), dataIndex: 'brandCount' },
      { title: t('field.inputUser'), dataIndex: 'inputUser' },
      { title: t('field.inputDate'), dataIndex: 'inputDate' },
      { title: t('field.updUser'), dataIndex: 'updUser' },
      { title: t('field.updDt'), dataIndex: 'updDt' },
    ],
    `${t('menu.brand')}_${dayjs().format('YYYYMMDD')}.xlsx`
  );
};

const onOpenWindow = () => {
  window.open(window.location.href, '_blank', 'noopener,noreferrer,width=1280,height=800');
};

const onPrint = () => {
  window.print();
};

const onHelp = () => {
  Modal.info({
    title: t('common.help'),
    content: t('message.brandHelp'),
    okText: t('common.confirm'),
  });
};

onMounted(() => {
  onSearch();
  window.addEventListener('message', onBrandFormMessage);
  if ('BroadcastChannel' in window) {
    brandChannel = new BroadcastChannel(BRAND_FORM_CHANNEL);
    brandChannel.onmessage = (event) => onBrandFormMessage(event);
  }
});

onBeforeUnmount(() => {
  window.removeEventListener('message', onBrandFormMessage);
  brandChannel?.close();
  brandChannel = null;
});
</script>

<style scoped>
.brand-page {
  display: flex;
  flex-direction: column;
  height: calc(
    100vh - var(--wms-gnb-height) - var(--wms-userbar-height) - var(--wms-tabbar-height) -
      var(--wms-footer-height) - 36px
  );
  background: #fff;
  overflow: hidden;
}

.brand-toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 36px;
  padding: 4px 10px;
  border-bottom: 1px solid var(--wms-border);
  background: #f7f8fa;
}

.brand-toolbar__title {
  font-size: 13px;
  font-weight: 700;
  color: #1e4e79;
  white-space: nowrap;
}

.brand-toolbar__actions {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-left: auto;
}

.brand-toolbar__utils {
  display: flex;
  align-items: center;
  gap: 2px;
  margin-left: 8px;
  padding-left: 8px;
  border-left: 1px solid var(--wms-border);
}

.brand-icon-btn {
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

.brand-icon-btn:hover {
  background: #e8f1f8;
}

.brand-icon-btn--excel {
  color: #217346;
}

.brand-search {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 8px 10px;
  background: #f3f6f8;
  border-bottom: 1px solid var(--wms-border);
}

.brand-search__row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.brand-tree {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
}

.brand-tree__head,
.brand-tree__row {
  display: grid;
  grid-template-columns: minmax(220px, 1.4fr) 110px 80px 70px 90px 90px 90px 90px;
  align-items: center;
  min-height: 28px;
  width: 100%;
}

.brand-tree__head {
  padding: 0 8px;
  background: #d6e7f5;
  color: #1e4e79;
  font-weight: 700;
  border-bottom: 1px solid #c5d8ea;
}

.brand-tree__body {
  flex: 1;
  overflow: auto;
}

.brand-tree__row {
  padding: 0 8px;
  border: 0;
  border-bottom: 1px solid #e4eef6;
  background: #fff;
  color: var(--wms-text);
  text-align: left;
  cursor: pointer;
}

.brand-tree__row.is-group {
  background: #f7fbfe;
  font-weight: 700;
}

.brand-tree__row.is-brand .brand-tree__cell--name {
  padding-left: 28px;
}

.brand-tree__row:hover {
  background: #e8f1f8;
}

.brand-tree__row.is-selected {
  background: #d9edf7;
}

.brand-tree__cell {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  padding: 0 6px;
}

.brand-tree__cell--name {
  display: flex;
  align-items: center;
  gap: 6px;
}

.brand-tree__cell--id,
.brand-tree__cell--use,
.brand-tree__cell--count,
.brand-tree__cell--date {
  text-align: center;
}

.brand-tree__toggle {
  display: inline-flex;
  width: 16px;
  color: #3d6d99;
}

.brand-tree__icon {
  flex: 0 0 auto;
  font-size: 14px;
}

.brand-tree__icon.is-folder {
  color: #c9a227;
}

.brand-tree__icon.is-brand {
  color: #3d6d99;
}

.brand-tree__empty {
  padding: 6px 8px 6px 52px;
  color: var(--wms-text-sub);
  font-size: 12px;
}

.brand-pager {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 34px;
  padding: 4px 10px;
  border-top: 1px solid var(--wms-border);
  background: #f7f8fa;
}

.brand-pager__nav {
  display: flex;
  align-items: center;
  gap: 2px;
}

.brand-pager__nav button {
  min-width: 24px;
  height: 24px;
  padding: 0 6px;
  border: 1px solid transparent;
  background: transparent;
  color: #1e4e79;
  font-size: 12px;
  cursor: pointer;
}

.brand-pager__nav button:hover:not(:disabled) {
  border-color: #9bb8d3;
  background: #e8f1f8;
}

.brand-pager__nav button.is-active {
  border-color: #3d6d99;
  background: #d6e7f5;
  font-weight: 700;
}

.brand-pager__nav button:disabled {
  color: #aaa;
  cursor: default;
}

.brand-pager__total {
  font-weight: 600;
  color: var(--wms-text);
}

@media print {
  .brand-toolbar,
  .brand-search,
  .brand-pager {
    display: none !important;
  }

  .brand-page,
  .brand-tree__body {
    height: auto;
    overflow: visible;
  }
}
</style>
