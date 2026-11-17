import dayjs from 'dayjs';
import * as XLSX from 'xlsx';

/**
 * 화면 전반에서 재사용하는 순수 함수 모음.
 * main.js 에서 `$cf` 로 전역 등록된다.
 */
class commonFunction {
    /** 1234567 → "1,234,567" */
    fncComma(value) {
        if (value === null || value === undefined || value === '') return '';
        const num = Number(value);
        return Number.isNaN(num) ? String(value) : num.toLocaleString('ko-KR');
    }

    /** 콤마/공백이 섞인 문자열을 숫자로 */
    fncNumber(value) {
        if (value === null || value === undefined) return 0;
        const num = Number(String(value).replace(/[^0-9.-]/g, ''));
        return Number.isNaN(num) ? 0 : num;
    }

    fncDate(value, pattern = 'YYYY-MM-DD') {
        if (!value) return '';
        const d = dayjs(value);
        return d.isValid() ? d.format(pattern) : '';
    }

    fncDateTime(value) {
        return this.fncDate(value, 'YYYY-MM-DD HH:mm:ss');
    }

    /** 오늘 기준 최근 n일 구간 [시작, 종료] */
    fncRecentRange(days = 7) {
        return [dayjs().subtract(days - 1, 'day'), dayjs()];
    }

    /** 빈 문자열/null/undefined 를 제거한 쿼리 오브젝트 */
    fncCleanParams(params = {}) {
        return Object.entries(params).reduce((acc, [key, value]) => {
            if (value !== null && value !== undefined && value !== '') acc[key] = value;
            return acc;
        }, {});
    }

    /** 오브젝트를 쿼리스트링으로 (앞에 ? 포함, 값이 없으면 빈 문자열) */
    fncQueryString(params = {}) {
        const clean = this.fncCleanParams(params);
        const query = new URLSearchParams(clean).toString();
        return query ? `?${query}` : '';
    }

    /** 재고 코드 등 표시용 문자열 마스킹 */
    fncMaskTail(value, visible = 4) {
        if (!value) return '';
        const str = String(value);
        if (str.length <= visible) return str;
        return `${str.slice(0, visible)}${'*'.repeat(str.length - visible)}`;
    }

    /** 배열을 특정 키로 그룹핑 */
    fncGroupBy(list = [], key) {
        return list.reduce((acc, item) => {
            const group = item?.[key] ?? 'ETC';
            (acc[group] = acc[group] || []).push(item);
            return acc;
        }, {});
    }

    /** 깊은 복사 (구조 단순한 업무 데이터 기준) */
    fncClone(value) {
        return value === undefined ? value : JSON.parse(JSON.stringify(value));
    }

    /**
     * 화면에 보이는 목록을 엑셀로 내려받는다.
     * columns 는 a-table 의 컬럼 정의({ title, dataIndex })를 그대로 넘기면 된다.
     */
    fncExportExcel(rows = [], columns = [], fileName = 'export.xlsx') {
        const targets = columns.filter((column) => column.dataIndex && column.title);
        const data = rows.map((row) =>
            targets.reduce((acc, column) => {
                acc[column.title] = row[column.dataIndex];
                return acc;
            }, {})
        );

        const sheet = XLSX.utils.json_to_sheet(data);
        const book = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(book, sheet, 'Sheet1');
        XLSX.writeFile(book, fileName);
    }

    /** 파일 다운로드 (Blob 응답용) */
    fncDownload(blob, fileName) {
        const url = window.URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = fileName;
        document.body.appendChild(anchor);
        anchor.click();
        document.body.removeChild(anchor);
        window.URL.revokeObjectURL(url);
    }
}

export default new commonFunction();
