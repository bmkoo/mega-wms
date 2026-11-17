<template>
  <div class="clothing-page">
    <div class="clothing-toolbar">
      <div class="clothing-toolbar__title">※ {{ $t('menu.clothingType') }}</div>
      <div class="clothing-toolbar__actions">
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
      <div class="clothing-toolbar__utils">
        <a-tooltip :title="$t('common.excelDownload')">
          <button type="button" class="clothing-icon-btn clothing-icon-btn--excel" @click="onExcel">
            <FileExcelOutlined />
          </button>
        </a-tooltip>
        <a-tooltip :title="$t('common.reset')">
          <button type="button" class="clothing-icon-btn" @click="onReset">
            <UndoOutlined />
          </button>
        </a-tooltip>
        <a-tooltip :title="$t('common.openNewWindow')">
          <button type="button" class="clothing-icon-btn" @click="onOpenWindow">
            <DesktopOutlined />
          </button>
        </a-tooltip>
        <a-tooltip :title="$t('common.printPreview')">
          <button type="button" class="clothing-icon-btn" @click="onPrint">
            <PrinterOutlined />
          </button>
        </a-tooltip>
        <a-tooltip :title="$t('common.help')">
          <button type="button" class="clothing-icon-btn" @click="onHelp">
            <QuestionCircleOutlined />
          </button>
        </a-tooltip>
      </div>
    </div>

    <div class="clothing-search">
      <div class="clothing-search__row">
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
      <div class="clothing-search__row">
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

    <div class="clothing-tree">
      <div class="clothing-tree__head">
        <span class="clothing-tree__cell clothing-tree__cell--name">{{ $t('field.groupOrClothing') }}</span>
        <span class="clothing-tree__cell clothing-tree__cell--id">{{ $t('field.clothingNo') }}</span>
        <span class="clothing-tree__cell clothing-tree__cell--use">{{ $t('field.useYn') }}</span>
        <span class="clothing-tree__cell clothing-tree__cell--count">{{ $t('field.clothingCount') }}</span>
      </div>

      <div class="clothing-tree__body">
        <template v-if="pagedGroups.length">
          <div v-for="group in pagedGroups" :key="group.id" class="clothing-tree__group">
            <button
              type="button"
              class="clothing-tree__row is-group"
              :class="{ 'is-selected': isSelected('group', group.id) }"
              @click="onSelectGroup(group)"
              @dblclick="onModify"
            >
              <span class="clothing-tree__cell clothing-tree__cell--name">
                <span class="clothing-tree__toggle" @click.stop="toggleGroup(group.id)">
                  <CaretDownOutlined v-if="isExpanded(group.id)" />
                  <CaretRightOutlined v-else />
                </span>
                <FolderOpenOutlined v-if="isExpanded(group.id)" class="clothing-tree__icon is-folder" />
                <FolderOutlined v-else class="clothing-tree__icon is-folder" />
                <span class="ellipsis">{{ group.groupName }}</span>
              </span>
              <span class="clothing-tree__cell clothing-tree__cell--id" />
              <span class="clothing-tree__cell clothing-tree__cell--use" />
              <span class="clothing-tree__cell clothing-tree__cell--count">{{ group.items.length }}</span>
            </button>

            <template v-if="isExpanded(group.id)">
              <button
                v-for="item in group.items"
                :key="item.id"
                type="button"
                class="clothing-tree__row is-item"
                :class="{ 'is-selected': isSelected('item', item.id) }"
                @click="onSelectItem(group, item)"
                @dblclick="onModify"
              >
                <span class="clothing-tree__cell clothing-tree__cell--name">
                  <TagsOutlined class="clothing-tree__icon is-item" />
                  <span class="ellipsis">{{ item.clothingName }}</span>
                </span>
                <span class="clothing-tree__cell clothing-tree__cell--id">{{ item.clothingNo }}</span>
                <span class="clothing-tree__cell clothing-tree__cell--use">{{ useYnLabel(item.useYn) }}</span>
                <span class="clothing-tree__cell clothing-tree__cell--count" />
              </button>
              <div v-if="!group.items.length" class="clothing-tree__empty">{{ $t('common.noData') }}</div>
            </template>
          </div>
        </template>
        <a-empty v-else :image="Empty.PRESENTED_IMAGE_SIMPLE" :description="$t('common.noData')" />
      </div>
    </div>

    <div class="clothing-pager">
      <div class="clothing-pager__nav">
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
      <span class="clothing-pager__total">
        {{ $t('common.totalGroupClothing', { g: $cf.fncComma(page.total), b: $cf.fncComma(itemTotal) }) }}
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
import { getMockClothingGroups } from './clothingTypeMock';
import {
  CLOTHING_FORM_CHANNEL,
  clothingFormUrl,
  openClothingFormWindow,
  stashClothingFormPayload,
} from './clothingTypePopup';

const { proxy } = getCurrentInstance();
const { t } = useI18n();

defineOptions({ name: 'PgClothingType' });

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

const groups = ref([]);
const expandedIds = ref([]);
const selected = reactive({ type: '', groupId: null, itemId: null });
let clothingChannel = null;

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
  { value: 'clothingName', label: t('field.clothingName') },
  { value: 'clothingNo', label: t('field.clothingNo') },
]);

const useYnOptions = computed(() => [
  { value: '', label: t('common.all') },
  { value: 'Y', label: t('common.use') },
  { value: 'N', label: t('common.unused') },
]);

const sortOptions = computed(() => [
  { value: 'groupName', label: t('field.groupName') },
  { value: 'clothingCount', label: t('field.clothingCount') },
]);

const pageSizeOptions = computed(() =>
  [20, 50, 100, 500, 1000].map((n) => ({ value: n, label: t('common.perPage', { n }) }))
);

const useYnLabel = (useYn) => (useYn === 'N' ? t('common.unused') : t('common.use'));

const matchText = (value, keyword) => String(value || '').toLowerCase().includes(keyword);

const sortGroups = (rows) => {
  const list = [...rows];
  list.sort((a, b) => {
    if (search.sort === 'clothingCount') return (b.items?.length || 0) - (a.items?.length || 0);
    return (Number(a.id) || 0) - (Number(b.id) || 0);
  });
  return list;
};

const filteredGroups = computed(() => {
  const keyword = search.keyword.trim().toLowerCase();
  return sortGroups(
    groups.value
      .map((group) => {
        const groupHit = !keyword || matchText(group.groupName, keyword);
        const byUseYn = (group.items || []).filter((item) => !search.useYn || item.useYn === search.useYn);
        const itemHits = byUseYn.filter(
          (item) =>
            !keyword ||
            matchText(item.clothingName, keyword) ||
            matchText(item.fullName, keyword) ||
            matchText(item.clothingNo, keyword)
        );

        if (search.field === 'groupName') {
          if (keyword && !groupHit) return null;
          return { ...group, items: byUseYn };
        }
        if (search.field === 'clothingName' || search.field === 'clothingNo') {
          if (keyword && !itemHits.length) return null;
          return { ...group, items: keyword ? itemHits : byUseYn };
        }
        if (keyword && groupHit) return { ...group, items: byUseYn };
        if (keyword && itemHits.length) return { ...group, items: itemHits };
        if (keyword) return null;
        return { ...group, items: byUseYn };
      })
      .filter(Boolean)
  );
});

const itemTotal = computed(() => filteredGroups.value.reduce((sum, group) => sum + (group.items?.length || 0), 0));

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
const isSelected = (type, id) => selected.type === type && String(selected[type === 'group' ? 'groupId' : 'itemId']) === String(id);

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
  selected.itemId = null;
};

const onSelectGroup = (group) => {
  selected.type = 'group';
  selected.groupId = group.id;
  selected.itemId = null;
};

const onSelectItem = (group, item) => {
  selected.type = 'item';
  selected.groupId = group.id;
  selected.itemId = item.id;
};

const selectedGroup = () => groups.value.find((group) => String(group.id) === String(selected.groupId)) || null;

const normalizeGroups = (raw) => {
  const list = Array.isArray(raw) ? raw : raw?.content || [];
  if (!list.length) return [];
  if (list[0]?.items || list[0]?.children) {
    return list.map((group) => ({
      id: group.id,
      groupName: group.groupName || group.name || '',
      items: (group.items || group.children || []).map((item) => ({
        ...item,
        groupId: group.id,
      })),
    }));
  }

  const map = new Map();
  list.forEach((row) => {
    const groupId = row.groupId ?? row.group?.id ?? 0;
    const groupName = row.groupName ?? row.group?.groupName ?? t('field.groupName');
    if (!map.has(groupId)) {
      map.set(groupId, { id: groupId, groupName, items: [] });
    }
    map.get(groupId).items.push({ ...row, groupId });
  });
  return [...map.values()];
};

const onSearch = async () => {
  page.current = 1;
  clearSelection();

  if (USE_MOCK) {
    groups.value = getMockClothingGroups();
    await nextTick();
    expandAll();
    syncPage();
    return;
  }

  const result = await proxy.$api.onApiQueryClothingType({
    searchField: search.field,
    keyword: search.keyword,
    useYn: search.useYn,
    sort: search.sort,
  });
  groups.value = normalizeGroups(result);
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
  else groups.value = [...groups.value, next];
  if (!expandedIds.value.includes(next.id)) expandedIds.value = [...expandedIds.value, next.id];
  selected.type = 'group';
  selected.groupId = next.id;
  selected.itemId = null;
  syncPage();
  message.success(t('message.saved'));
};

const onClothingFormMessage = (event) => {
  if (event.origin && event.origin !== window.location.origin) return;
  if (event.data?.type !== 'clothing-type-saved') return;
  applySavedGroup(event.data.row);
};

const openClothingForm = (mode, group = null) => {
  const token = stashClothingFormPayload({ mode, group });
  const popup = openClothingFormWindow(clothingFormUrl({ mode, id: group?.id, token }));
  if (!popup) message.warning(t('message.popupBlocked'));
};

const onCreate = () => openClothingForm('create', null);

const onModify = () => {
  const group = selectedGroup();
  if (!group) {
    message.warning(t('message.selectRequired'));
    return;
  }
  openClothingForm('modify', group);
};

const onExcel = () => {
  const rows = [];
  filteredGroups.value.forEach((group) => {
    if (!group.items.length) {
      rows.push({
        groupName: group.groupName,
        clothingNo: '',
        clothingName: '',
        useYnLabel: '',
      });
      return;
    }
    group.items.forEach((item) => {
      rows.push({
        groupName: group.groupName,
        clothingNo: item.clothingNo,
        clothingName: item.fullName || `${group.groupName} - ${item.clothingName}`,
        useYnLabel: useYnLabel(item.useYn),
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
      { title: t('field.groupName'), dataIndex: 'groupName' },
      { title: t('field.clothingNo'), dataIndex: 'clothingNo' },
      { title: t('field.clothingName'), dataIndex: 'clothingName' },
      { title: t('field.useYn'), dataIndex: 'useYnLabel' },
    ],
    `${t('menu.clothingType')}_${dayjs().format('YYYYMMDD')}.xlsx`
  );
};

const onOpenWindow = () => {
  window.open(window.location.href, '_blank', 'noopener,noreferrer,width=1280,height=800');
};

const onPrint = () => window.print();

const onHelp = () => {
  Modal.info({
    title: t('common.help'),
    content: t('message.clothingTypeHelp'),
    okText: t('common.confirm'),
  });
};

onMounted(() => {
  onSearch();
  window.addEventListener('message', onClothingFormMessage);
  if ('BroadcastChannel' in window) {
    clothingChannel = new BroadcastChannel(CLOTHING_FORM_CHANNEL);
    clothingChannel.onmessage = (event) => onClothingFormMessage(event);
  }
});

onBeforeUnmount(() => {
  window.removeEventListener('message', onClothingFormMessage);
  clothingChannel?.close();
  clothingChannel = null;
});
</script>

<style scoped>
.clothing-page {
  display: flex;
  flex-direction: column;
  height: calc(
    100vh - var(--wms-gnb-height) - var(--wms-userbar-height) - var(--wms-tabbar-height) -
      var(--wms-footer-height) - 36px
  );
  background: #fff;
  overflow: hidden;
}

.clothing-toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 36px;
  padding: 4px 10px;
  border-bottom: 1px solid var(--wms-border);
  background: #f7f8fa;
}

.clothing-toolbar__title {
  font-size: 13px;
  font-weight: 700;
  color: #1e4e79;
  white-space: nowrap;
}

.clothing-toolbar__actions {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-left: auto;
}

.clothing-toolbar__utils {
  display: flex;
  align-items: center;
  gap: 2px;
  margin-left: 8px;
  padding-left: 8px;
  border-left: 1px solid var(--wms-border);
}

.clothing-icon-btn {
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

.clothing-icon-btn:hover {
  background: #e8f1f8;
}

.clothing-icon-btn--excel {
  color: #217346;
}

.clothing-search {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 8px 10px;
  background: #f3f6f8;
  border-bottom: 1px solid var(--wms-border);
}

.clothing-search__row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.clothing-tree {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
}

.clothing-tree__head,
.clothing-tree__row {
  display: grid;
  grid-template-columns: minmax(280px, 1.6fr) 110px 90px 80px;
  align-items: center;
  min-height: 28px;
  width: 100%;
}

.clothing-tree__head {
  padding: 0 8px;
  background: #d6e7f5;
  color: #1e4e79;
  font-weight: 700;
  border-bottom: 1px solid #c5d8ea;
}

.clothing-tree__body {
  flex: 1;
  overflow: auto;
}

.clothing-tree__row {
  padding: 0 8px;
  border: 0;
  border-bottom: 1px solid #e4eef6;
  background: #fff;
  color: var(--wms-text);
  text-align: left;
  cursor: pointer;
}

.clothing-tree__row.is-group {
  background: #f7fbfe;
  font-weight: 700;
}

.clothing-tree__row.is-item .clothing-tree__cell--name {
  padding-left: 28px;
}

.clothing-tree__row:hover {
  background: #e8f1f8;
}

.clothing-tree__row.is-selected {
  background: #d9edf7;
}

.clothing-tree__cell {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  padding: 0 6px;
}

.clothing-tree__cell--name {
  display: flex;
  align-items: center;
  gap: 6px;
}

.clothing-tree__cell--id,
.clothing-tree__cell--use,
.clothing-tree__cell--count {
  text-align: center;
}

.clothing-tree__toggle {
  display: inline-flex;
  width: 16px;
  color: #3d6d99;
}

.clothing-tree__icon {
  flex: 0 0 auto;
  font-size: 14px;
}

.clothing-tree__icon.is-folder {
  color: #c9a227;
}

.clothing-tree__icon.is-item {
  color: #3d6d99;
}

.clothing-tree__empty {
  padding: 6px 8px 6px 52px;
  color: var(--wms-text-sub);
  font-size: 12px;
}

.clothing-pager {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 34px;
  padding: 4px 10px;
  border-top: 1px solid var(--wms-border);
  background: #f7f8fa;
}

.clothing-pager__nav {
  display: flex;
  align-items: center;
  gap: 2px;
}

.clothing-pager__nav button {
  min-width: 24px;
  height: 24px;
  padding: 0 6px;
  border: 1px solid transparent;
  background: transparent;
  color: #1e4e79;
  font-size: 12px;
  cursor: pointer;
}

.clothing-pager__nav button:hover:not(:disabled) {
  border-color: #9bb8d3;
  background: #e8f1f8;
}

.clothing-pager__nav button.is-active {
  border-color: #3d6d99;
  background: #d6e7f5;
  font-weight: 700;
}

.clothing-pager__nav button:disabled {
  color: #aaa;
  cursor: default;
}

.clothing-pager__total {
  font-weight: 600;
  color: var(--wms-text);
}

@media print {
  .clothing-toolbar,
  .clothing-search,
  .clothing-pager {
    display: none !important;
  }

  .clothing-page,
  .clothing-tree__body {
    height: auto;
    overflow: visible;
  }
}
</style>
