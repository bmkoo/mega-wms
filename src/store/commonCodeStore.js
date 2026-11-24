import { defineStore } from 'pinia';
import api from '@/common/utils/apiFunctions';

/** 진행 중인 로드. 여러 화면이 동시에 load() 해도 서버 호출은 한 번만 한다 */
let loading = null;

/**
 * 공통코드 (GET /api/v1/commonCodes?useYn=Y) 를 groupCd 별로 들고 있는다.
 * 로그인 후 router 에서 미리 load() 하고, 화면에서는 options() / name() 으로 꺼내 쓴다.
 */
export const useCommonCodeStore = defineStore('commonCode', {
    state: () => ({
        /** { [groupCd]: [{ value: code, label: name, sort }] }  (sort 순) */
        groups: {},
        loaded: false,
    }),

    actions: {
        /** 한 번만 불러온다. force 면 다시 불러온다 (공통코드를 수정한 뒤 등) */
        load(force = false) {
            if (loading && !force) return loading;
            loading = (async () => {
                const result = await api.onApiQueryCommonCode({ useYn: 'Y' });
                const list = result?.list || result;
                if (!Array.isArray(list)) {
                    loading = null; // 실패하면 다음 호출 때 다시 시도한다 (오류 알림은 apiFunctions 가 띄운다)
                    return;
                }
                const groups = {};
                list.forEach((row) => {
                    (groups[row.groupCd] ||= []).push({ value: row.code, label: row.name, sort: Number(row.sort) || 0 });
                });
                Object.values(groups).forEach((codes) => codes.sort((a, b) => a.sort - b.sort));
                this.groups = groups;
                this.loaded = true;
            })();
            return loading;
        },


        /** 선택 상자용 [{ value, label }] */
        options(groupCd) {
            return this.groups[groupCd] || [];
        },

        /** 코드 → 코드명. 그룹이나 코드가 없으면 코드값을 그대로 돌려준다 */
        name(groupCd, code) {
            if (code === null || code === undefined || code === '') return '';
            return this.groups[groupCd]?.find((c) => c.value === code)?.label ?? String(code);
        },
    },
});
