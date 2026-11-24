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
            // data가 이미 배열인지 확인 후, 객체라면 [data] 형태로 감싸서 전송
            const payload = Array.isArray(data) ? data : [data];

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


    //generate by bmkoo e
    onApiQueryCommonCode(params) {
        return this.fncGetApi('v1/commonCodes', params);
    }

    onApiGetCommonCode(id) {
        return this.fncGetApi(`v1/commonCodes/${id}`);
    }

    onApiSaveCommonCode(data) {
        return this.fncPostApi('v1/commonCodes/save', data);
    }

    onApiQueryErrorLog(params) {
        return this.fncGetApi('v1/errorLog', params);
    }

    onApiGetErrorLog(id) {
        return this.fncGetApi(`v1/errorLog/${id}`);
    }

    onApiSaveErrorLog(data) {
        return this.fncPostApi('v1/errorLog/save', data);
    }

    onApiQueryUser(params) {
        return this.fncGetApi('v1/users', params);
    }

    onApiGetUser(id) {
        return this.fncGetApi(`v1/user`, { userCd: id});
    }

    onApiSaveUser(data) {
        return this.fncPostApi('v1/user/save', data);
    }

    onApiQueryLoginHistory(params) {
        return this.fncGetApi('v1/loginHistory', params);
    }

    onApiGetLoginHistory(id) {
        return this.fncGetApi(`v1/loginHistory/${id}`);
    }

    onApiSaveLoginHistory(data) {
        return this.fncPutApi('v1/loginHistory/save', data);
    }

    onApiGetMegaProduct(params) {
        return this.fncGetApi('v1/productList', params);
    }

    onApiGetProduct(id) {
        return this.fncGetApi(`v1/product/${id}`);
    }

    onApiSaveProduct(data) {
        return this.fncPutApi('v1/product/save', data);
    }

    /** 상품 세트 구성품 목록 (상품 상세 팝업). 백엔드 ProductController.componentList */
    onApiQueryProductComponent(params) {
        return this.fncGetApi('v1/productComponentList', params);
    }

    onApiGetMegaOrderRaw(params) {
        return this.fncGetApi('v1/orderRawList', params);
    }

    onApiGetOrderRaw(id) {
        return this.fncGetApi(`v1/orderRawList/${id}`);
    }

    onApiSaveOrderRaw(data) {
        return this.fncPostApi('v1/orderRaw/save', data);
    }

    /** 주문 원본(OrderRaw) 데이터 이관. body = 주문원본 화면의 현재 조회 조건 */
    onApiOrderRawMove(data) {
        return this.fncPostApi('v1/orderRawMove', data);
    }

    onApiGetChannel(params) {
        return this.fncGetApi('v1/channelList', params);
    }

    onApiGetChannelList(id) {
        return this.fncGetApi(`v1/channel/${id}`);
    }

    onApiSaveChannel(data) {
        return this.fncPostApi('v1/channel/save', data);
    }

    onApiGetOrder(params) {
        return this.fncGetApi('v1/orderList', params);
    }

    onApiGetOrderList(id) {
        return this.fncGetApi(`v1/order/${id}`);
    }

    onApiSaveOrder(data) {
        return this.fncPostApi('v1/order/save', data);
    }

    onApiGetOrderItem(params) {
        return this.fncGetApi('v1/orderItemList', params);
    }

    onApiGetOrderItemList(id) {
        return this.fncGetApi(`v1/orderItem/${id}`);
    }

    onApiSaveOrderItem(data) {
        return this.fncPostApi('v1/orderItem/save', data);
    }

    /** 재고할당: 주문 + 주문품목 + 상품마스터 (품목 1개 = 1행). params = 화면 검색 조건 */
    onApiQueryStockAssign(params) {
        return this.fncGetApi('v1/stockAssignList', params);
    }
}

export default new apiFunctions();
