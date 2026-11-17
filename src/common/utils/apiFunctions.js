import axios from 'axios';
import { notification } from 'ant-design-vue';
import { useAppStore } from '@/store/appStore';
import commonFunction from '@/common/utils/commonFunction';

/**
 * WMS REST API 레이어.
 * main.js 에서 `$api` 로 전역 등록되며, 화면에서는 `onApi*` 도메인 메서드를 호출한다.
 */
class apiFunctions {
    #instance(extraHeaders = {}) {
        const appStore = useAppStore();
        return axios.create({
            baseURL: appStore.config.apiUrl,
            timeout: 30000,
            headers: {
                Authorization: `Bearer ${appStore.AppActiveUser.token ?? ''}`,
                ...extraHeaders,
            },
        });
    }

    #notifyError(error) {
        if (error.response) {
            const data = error.response.data;
            const detail = data?.errors?.[0]?.message;
            notification.error({
                duration: 5,
                message: data?.errorCode
                    ? `${data.errorCode}: ${detail || '알 수 없는 오류'}`
                    : data?.message || '서버 응답 오류가 발생했습니다',
                placement: 'bottomLeft',
            });
        } else if (error.request) {
            notification.error({
                duration: 5,
                message: '서버에 연결할 수 없습니다.',
                placement: 'bottomLeft',
            });
        } else {
            console.error('[api]', error.message);
        }
        return null;
    }

    // ─────────────────────────────────────────────
    // 공통 HTTP 래퍼
    // ─────────────────────────────────────────────
    async fncGetApi(url, params) {
        try {
            const r = await this.#instance().get(`${url}${commonFunction.fncQueryString(params)}`);
            return r.data;
        } catch (error) {
            return this.#notifyError(error);
        }
    }

    async fncPostApi(url, data) {
        try {
            const r = await this.#instance().post(url, data);
            return r.data;
        } catch (error) {
            return this.#notifyError(error);
        }
    }

    async fncPutApi(url, data) {
        try {
            const r = await this.#instance().put(url, data);
            return r.data;
        } catch (error) {
            return this.#notifyError(error);
        }
    }

    async fncPatchApi(url, data) {
        try {
            const r = await this.#instance().patch(url, data);
            return r.data;
        } catch (error) {
            return this.#notifyError(error);
        }
    }

    async fncDeleteApi(url) {
        try {
            const r = await this.#instance().delete(url);
            return r.data;
        } catch (error) {
            return this.#notifyError(error);
        }
    }

    async fncPostMultipartApi(url, formData) {
        try {
            const r = await this.#instance({ 'Content-Type': 'multipart/form-data' }).post(url, formData);
            return r.data;
        } catch (error) {
            return this.#notifyError(error);
        }
    }

    /** 엑셀 등 파일 다운로드 */
    async fncDownloadApi(url, params, fileName) {
        try {
            const r = await this.#instance().get(`${url}${commonFunction.fncQueryString(params)}`, {
                responseType: 'blob',
            });
            commonFunction.fncDownload(r.data, fileName);
            return true;
        } catch (error) {
            this.#notifyError(error);
            return false;
        }
    }

    // ─────────────────────────────────────────────
    // 인증
    // ─────────────────────────────────────────────
    onApiLogin(payload) {
       // return this.fncPostApi('v1/auth/login', payload);

        return this.fncPostApi('v1/auth/login', payload);

    }

    onApiMe() {
        return this.fncGetApi('v1/auth/me');
    }

    // ─────────────────────────────────────────────
    // 기준정보
    // ─────────────────────────────────────────────
    onApiQueryWarehouse(params) {
        return this.fncGetApi('v1/warehouse', params);
    }

    onApiQueryLocation(params) {
        return this.fncGetApi('v1/location', params);
    }

    onApiQueryProduct(params) {
        return this.fncGetApi('v1/productList', params);
    }

    onApiQueryPartner(params) {
        return this.fncGetApi('v1/partner', params);
    }

    onApiQueryBrand(params) {
        return this.fncGetApi('v1/brand', params);
    }

    onApiGetBrand(id) {
        return this.fncGetApi(`v1/brand/${id}`);
    }

    onApiAddBrand(data) {
        return this.fncPostApi('v1/brand', data);
    }

    onApiUpdateBrand(id, data) {
        return this.fncPutApi(`v1/brand/${id}`, data);
    }

    onApiQueryBrandGroup(params) {
        return this.fncGetApi('v1/brand-group', params);
    }

    onApiGetBrandGroup(id) {
        return this.fncGetApi(`v1/brand-group/${id}`);
    }

    onApiAddBrandGroup(data) {
        return this.fncPostApi('v1/brand-group', data);
    }

    onApiUpdateBrandGroup(id, data) {
        return this.fncPutApi(`v1/brand-group/${id}`, data);
    }

    onApiQueryMaker(params) {
        return this.fncGetApi('/v1/partner', params);
    }

    onApiGetMaker(id) {
        return this.fncGetApi(`v1/maker/${id}`);
    }

    onApiAddMaker(data) {
        return this.fncPostApi('v1/maker', data);
    }

    onApiUpdateMaker(id, data) {
        return this.fncPutApi(`v1/maker/${id}`, data);
    }

    onApiQueryClothingType(params) {
        return this.fncGetApi('v1/clothing-type', params);
    }

    onApiGetClothingType(id) {
        return this.fncGetApi(`v1/clothing-type/${id}`);
    }

    onApiAddClothingType(data) {
        return this.fncPostApi('v1/clothing-type', data);
    }

    onApiUpdateClothingType(id, data) {
        return this.fncPutApi(`v1/clothing-type/${id}`, data);
    }

    onApiQueryReturnReason(params) {
        return this.fncGetApi('v1/return-reason', params);
    }

    onApiGetReturnReason(id) {
        return this.fncGetApi(`v1/return-reason/${id}`);
    }

    onApiAddReturnReason(data) {
        return this.fncPostApi('v1/return-reason', data);
    }

    onApiUpdateReturnReason(id, data) {
        return this.fncPutApi(`v1/return-reason/${id}`, data);
    }

    onApiQueryOrderMemo(params) {
        return this.fncGetApi('v1/order-memo', params);
    }

    onApiGetOrderMemo(id) {
        return this.fncGetApi(`v1/order-memo/${id}`);
    }

    onApiAddOrderMemo(data) {
        return this.fncPostApi('v1/order-memo', data);
    }

    onApiUpdateOrderMemo(id, data) {
        return this.fncPutApi(`v1/order-memo/${id}`, data);
    }

    onApiRemoveOrderMemo(id) {
        return this.fncDeleteApi(`v1/order-memo/${id}`);
    }

    onApiGetOrderDetail(orderNo) {
        return this.fncGetApi(`v1/order/${orderNo}`);
    }

    // ─────────────────────────────────────────────
    // 입고
    // ─────────────────────────────────────────────
    onApiQueryInboundPlan(params) {
        return this.fncGetApi('v1/inbound/plan', params);
    }

    onApiAddInboundPlan(data) {
        return this.fncPostApi('v1/inbound/plan', data);
    }

    onApiUpdateInboundPlan(id, data) {
        return this.fncPutApi(`v1/inbound/plan/${id}`, data);
    }

    onApiRemoveInboundPlan(id) {
        return this.fncDeleteApi(`v1/inbound/plan/${id}`);
    }

    // ─────────────────────────────────────────────
    // 재고
    // ─────────────────────────────────────────────
    onApiQueryStock(params) {
        return this.fncGetApi('v1/stock', params);
    }

    onApiMoveStock(data) {
        return this.fncPostApi('v1/stock/move', data);
    }

    onApiAdjustStock(data) {
        return this.fncPostApi('v1/stock/adjust', data);
    }

    // ─────────────────────────────────────────────
    // 출고
    // ─────────────────────────────────────────────
    onApiQueryOrder(params) {
        return this.fncGetApi('v1/outbound/order', params);
    }

    onApiInstructOutbound(data) {
        return this.fncPostApi('v1/outbound/instruct', data);
    }

    // ─────────────────────────────────────────────
    // 대시보드
    // ─────────────────────────────────────────────
    onApiQueryDashboardSummary(params) {
        return this.fncGetApi('v1/dashboard/summary', params);
    }

    // ─────────────────────────────────────────────
    // 자동 생성 조회 API (scripts/genPage.mjs)
    // ─────────────────────────────────────────────
    onApiQueryOrderRaw(params) {
        return this.fncGetApi('v1/orderRawList', params);
    }

    onApiGetProductList(params) {
        return this.fncGetApi('v1/productList', params);
    }

    onApiGetProduct(id) {
        return this.fncGetApi(`v1/product/${id}`);
    }

    onApiSaveProduct(data) {
        return this.fncPostApi('v1/product/save', data);
    }
}

export default new apiFunctions();
