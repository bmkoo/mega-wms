<template>
  <div class="wms-page">
    <!-- 조회 조건 -->
    <div class="wms-search">
      <span class="wms-search__label">{{ $t('common.period') }}</span>
      <a-range-picker v-model:value="search.range" size="small" style="width: 230px" />

      <span class="wms-search__label">{{ $t('field.status') }}</span>
      <a-select
        v-model:value="search.status"
        :options="statusOptions"
        size="small"
        style="width: 130px"
      />

      <span class="wms-search__label">{{ $t('field.partner') }}</span>
      <a-input v-model:value="search.partner" size="small" style="width: 150px" allow-clear />

      <span class="wms-search__label">{{ $t('common.keyword') }}</span>
      <a-input
        v-model:value="search.keyword"
        size="small"
        style="width: 180px"
        allow-clear
        :placeholder="`${$t('field.sku')} / ${$t('field.productName')}`"
        @press-enter="onSearch"
      />

      <div class="flex-1" />

      <a-button type="primary" size="small" @click="onSearch">
        <template #icon><SearchOutlined /></template>
        {{ $t('common.search') }}
      </a-button>
      <a-button size="small" @click="onReset">{{ $t('common.reset') }}</a-button>
    </div>

    <!-- 목록 -->
    <div class="wms-panel">
      <div class="wms-panel__head">
        <span>
          {{ $t('common.total') }}
          <b class="c-primary">{{ $cf.fncComma(pagination.total) }}</b>
        </span>
        <div class="d-flex gap-4">
          <a-button type="primary" size="small" @click="onOpenForm(null)">
            <template #icon><PlusOutlined /></template>
            {{ $t('common.add') }}
          </a-button>
          <a-button size="small" :disabled="!selectedKeys.length" danger @click="onRemove">
            <template #icon><DeleteOutlined /></template>
            {{ $t('common.remove') }}
          </a-button>
          <a-button size="small" @click="onExcel">
            <template #icon><FileExcelOutlined /></template>
            {{ $t('common.excel') }}
          </a-button>
        </div>
      </div>

      <a-table
        :columns="columns"
        :data-source="rows"
        :loading="loading"
        :pagination="pagination"
        :row-selection="{ selectedRowKeys: selectedKeys, onChange: onSelectChange }"
        :scroll="{ x: 1100 }"
        size="small"
        row-key="id"
        @change="onTableChange"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.dataIndex === 'status'">
            <a-tag :color="STATUS_COLOR[record.status]">{{ record.status }}</a-tag>
          </template>
          <template v-else-if="column.dataIndex === 'planQty'">
            {{ $cf.fncComma(record.planQty) }}
          </template>
          <template v-else-if="column.dataIndex === 'action'">
            <a-button type="link" size="small" @click="onOpenForm(record)">
              {{ $t('common.edit') }}
            </a-button>
          </template>
        </template>
      </a-table>
    </div>

    <!-- 등록/수정 -->
    <a-modal
      v-model:open="formOpen"
      :title="`${$t('menu.inboundPlan')} ${form.id ? $t('common.edit') : $t('common.add')}`"
      :width="520"
      :ok-text="$t('common.save')"
      :cancel-text="$t('common.cancel')"
      @ok="onSave"
    >
      <a-form :label-col="{ span: 6 }" :wrapper-col="{ span: 17 }">
        <a-form-item :label="$t('field.partner')" required>
          <a-input v-model:value="form.partner" />
        </a-form-item>
        <a-form-item :label="$t('field.sku')" required>
          <a-input v-model:value="form.sku" />
        </a-form-item>
        <a-form-item :label="$t('field.productName')">
          <a-input v-model:value="form.productName" />
        </a-form-item>
        <a-form-item :label="$t('field.planDate')" required>
          <a-date-picker v-model:value="form.planDate" style="width: 100%" />
        </a-form-item>
        <a-form-item :label="$t('field.qty')" required>
          <a-input-number v-model:value="form.planQty" :min="1" style="width: 100%" />
        </a-form-item>
        <a-form-item :label="$t('field.status')">
          <a-select v-model:value="form.status" :options="statusOptions.slice(1)" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
import { computed, getCurrentInstance, onMounted, reactive, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { Modal, message } from 'ant-design-vue';
import dayjs from 'dayjs';
import { useAppStore } from '@/store/appStore';
import { INBOUND_STATUS, PAGE_SIZE_OPTIONS, STATUS_COLOR } from '@/views/components/fnc';
import commonFunction from '@/common/utils/commonFunction';

const { proxy } = getCurrentInstance();
const { t } = useI18n();
const appStore = useAppStore();

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

const loading = ref(false);
const rows = ref([]);
const selectedKeys = ref([]);
const formOpen = ref(false);

const search = reactive({
  range: commonFunction.fncRecentRange(7),
  status: '',
  partner: '',
  keyword: '',
});

const pagination = reactive({
  current: 1,
  pageSize: 20,
  total: 0,
  showSizeChanger: true,
  pageSizeOptions: PAGE_SIZE_OPTIONS,
  size: 'small',
  showTotal: (total) => `${commonFunction.fncComma(total)} 건`,
});

const emptyForm = () => ({
  id: null,
  partner: '',
  sku: '',
  productName: '',
  planDate: dayjs(),
  planQty: 1,
  status: INBOUND_STATUS.PLANNED,
});

const form = reactive(emptyForm());

const statusOptions = computed(() => [
  { value: '', label: t('common.all') },
  ...Object.values(INBOUND_STATUS).map((value) => ({ value, label: value })),
]);

const columns = computed(() => [
  { title: t('field.no'), dataIndex: 'no', width: 60, align: 'center' },
  { title: t('field.planNo'), dataIndex: 'planNo', width: 150 },
  { title: t('field.partner'), dataIndex: 'partner', width: 140 },
  { title: t('field.sku'), dataIndex: 'sku', width: 120 },
  { title: t('field.productName'), dataIndex: 'productName', ellipsis: true },
  { title: t('field.warehouse'), dataIndex: 'warehouse', width: 130 },
  { title: t('field.qty'), dataIndex: 'planQty', width: 90, align: 'right' },
  { title: t('field.planDate'), dataIndex: 'planDate', width: 110, align: 'center' },
  { title: t('field.status'), dataIndex: 'status', width: 110, align: 'center' },
  { title: '', dataIndex: 'action', width: 70, align: 'center', fixed: 'right' },
]);

const buildParams = () => ({
  startDate: commonFunction.fncDate(search.range?.[0]),
  endDate: commonFunction.fncDate(search.range?.[1]),
  status: search.status,
  partner: search.partner,
  keyword: search.keyword,
  warehouseCode: appStore.currentWarehouse?.code,
  page: pagination.current - 1,
  size: pagination.pageSize,
});

/** 서버가 없을 때 화면 확인용 데이터 */
const mockRows = () => {
  const statuses = Object.values(INBOUND_STATUS);
  return Array.from({ length: pagination.pageSize }, (_, i) => {
    const seq = (pagination.current - 1) * pagination.pageSize + i + 1;
    return {
      id: seq,
      no: seq,
      planNo: `IB${dayjs().format('YYYYMM')}-${String(seq).padStart(4, '0')}`,
      partner: `거래처 ${(seq % 7) + 1}`,
      sku: `SKU-${1000 + seq}`,
      productName: `샘플 상품 ${seq}`,
      warehouse: appStore.currentWarehouse?.name || '-',
      planQty: ((seq * 37) % 500) + 10,
      planDate: dayjs().subtract(seq % 7, 'day').format('YYYY-MM-DD'),
      status: statuses[seq % statuses.length],
    };
  });
};

const onSearch = async () => {
  loading.value = true;
  selectedKeys.value = [];

  if (USE_MOCK) {
    rows.value = mockRows();
    pagination.total = 137;
  } else {
    const result = await proxy.$api.onApiQueryInboundPlan(buildParams());
    rows.value = (result?.content || []).map((row, index) => ({
      ...row,
      no: (pagination.current - 1) * pagination.pageSize + index + 1,
    }));
    pagination.total = result?.totalElements || 0;
  }

  loading.value = false;
};

const onReset = () => {
  search.range = commonFunction.fncRecentRange(7);
  search.status = '';
  search.partner = '';
  search.keyword = '';
  pagination.current = 1;
  onSearch();
};

const onTableChange = (page) => {
  pagination.current = page.current;
  pagination.pageSize = page.pageSize;
  onSearch();
};

const onSelectChange = (keys) => (selectedKeys.value = keys);

const onOpenForm = (record) => {
  Object.assign(form, emptyForm());
  if (record) {
    Object.assign(form, record, { planDate: dayjs(record.planDate) });
  }
  formOpen.value = true;
};

const onSave = async () => {
  if (!form.partner || !form.sku || !form.planQty) {
    message.warning(t('message.requiredFields'));
    return;
  }

  const payload = { ...form, planDate: commonFunction.fncDate(form.planDate) };

  if (!USE_MOCK) {
    const result = form.id
      ? await proxy.$api.onApiUpdateInboundPlan(form.id, payload)
      : await proxy.$api.onApiAddInboundPlan(payload);
    if (!result) return;
  }

  message.success(t('message.saved'));
  formOpen.value = false;
  onSearch();
};

const onRemove = () => {
  Modal.confirm({
    title: t('common.remove'),
    content: t('message.removeConfirm'),
    okText: t('common.confirm'),
    cancelText: t('common.cancel'),
    okButtonProps: { danger: true },
    onOk: async () => {
      if (!USE_MOCK) {
        for (const id of selectedKeys.value) {
          await proxy.$api.onApiRemoveInboundPlan(id);
        }
      }
      message.success(t('message.removed'));
      onSearch();
    },
  });
};

const onExcel = () => {
  if (!rows.value.length) {
    message.warning(t('common.noData'));
    return;
  }
  commonFunction.fncExportExcel(
    rows.value,
    columns.value,
    `${t('menu.inboundPlan')}_${dayjs().format('YYYYMMDD')}.xlsx`
  );
};

onMounted(onSearch);
</script>
