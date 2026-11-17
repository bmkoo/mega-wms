import { ref } from 'vue';
import i18n from '@/i18n/i18n';

// ─────────────────────────────────────────────
// 전역 로딩 오버레이
// ─────────────────────────────────────────────
const isLoading = ref(false);

export function useLoading() {
    const show = () => (isLoading.value = true);
    const hide = () => (isLoading.value = false);
    return { isLoading, show, hide };
}

// ─────────────────────────────────────────────
// 메시지 포맷
// ─────────────────────────────────────────────
export function format(code, params) {
    const result = params ? i18n.global.t(code, params) : i18n.global.t(code);
    if (result === code) {
        console.warn(`[i18n] Missing translation key: ${code}`);
        return '';
    }
    return result;
}

// ─────────────────────────────────────────────
// 업무 상수
// ─────────────────────────────────────────────
export const INBOUND_STATUS = Object.freeze({
    PLANNED: 'PLANNED',
    ARRIVED: 'ARRIVED',
    INSPECTING: 'INSPECTING',
    CONFIRMED: 'CONFIRMED',
    CANCELED: 'CANCELED',
});

export const OUTBOUND_STATUS = Object.freeze({
    RECEIVED: 'RECEIVED',
    INSTRUCTED: 'INSTRUCTED',
    PICKING: 'PICKING',
    PACKING: 'PACKING',
    SHIPPED: 'SHIPPED',
    CANCELED: 'CANCELED',
});

export const STOCK_TYPE = Object.freeze({
    NORMAL: 'NORMAL',
    HOLD: 'HOLD',
    DEFECT: 'DEFECT',
    EXPIRED: 'EXPIRED',
});

/** 상태 → ant-design-vue Tag 색상 */
export const STATUS_COLOR = Object.freeze({
    PLANNED: 'default',
    ARRIVED: 'blue',
    INSPECTING: 'orange',
    CONFIRMED: 'green',
    RECEIVED: 'default',
    INSTRUCTED: 'blue',
    PICKING: 'orange',
    PACKING: 'purple',
    SHIPPED: 'green',
    CANCELED: 'red',
    NORMAL: 'green',
    HOLD: 'orange',
    DEFECT: 'red',
    EXPIRED: 'red',
});

export const PAGE_SIZE_OPTIONS = Object.freeze(['20', '50', '100', '200']);
