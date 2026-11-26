/**
 * 주문 엑셀 3종 → TB_ORDER_RAW 행 (브라우저에서 읽기만 한다. 서버로 파일을 올리지 않는다).
 *
 * - 종류는 헤더로 판별: 샵링커주문번호 → XLS_SHOPLINKER, 외부채널주문번호 → XLS_SHOP_NAVER, 주문코드(순서) → XLS_SHOP
 *   (값은 OrderRaw.srcType 주석과 같다)
 * - 컬럼은 헤더 이름으로 찾는다 (자사몰 일반·네이버 엑셀은 컬럼 순서가 서로 다름)
 * - 매핑 대상은 OrderRaw.java (TB_ORDER_RAW) 항목뿐이다. 그 외 엑셀 컬럼(주문상태·송장번호 …)은 읽지 않는다
 * - 결제방법(payType): 자사몰 엑셀 = '결제방법' 컬럼, 오픈마켓(샵링커) 엑셀 = '현금' 고정 (2026-11-26)
 * - 숫자 셀(자체상품코드·수량·금액 …)은 "1000027144" 같은 정수 문자열/숫자로 읽는다
 * - 발주일(orderDate)은 엑셀에 없어 업로드한 날짜를 넣는다 (orderDateOf)
 *
 * 실측 헤더: ~/Downloads/주문건/{오픈마켓_통합, 자사몰_naver, 자사몰_일반}.xls (2026-11-24, 각 25개 컬럼)
 */
import * as XLSX from 'xlsx';

export const XLS_SHOPLINKER = 'XLS_SHOPLINKER';
export const XLS_SHOP_NAVER = 'XLS_SHOP_NAVER';
export const XLS_SHOP = 'XLS_SHOP'; // 자사몰(일반) — 2026-11-25 확정 입력소스 값

/** 화면 버튼 → 받을 수 있는 엑셀 종류 */
export const KIND_TYPES = {
  SHOPLINKER: [XLS_SHOPLINKER], //             [샵링커엑셀] 오픈마켓 통합발주 엑셀
  NAVER: [XLS_SHOP_NAVER], //                   [자사몰(NAVER)엑셀] 자사몰_naver.xls
  MALL: [XLS_SHOP], //                          [자사몰(일반)엑셀] 자사몰_일반.xls
};

/** 숫자로 저장할 필드 (나머지는 문자열) */
const NUMBER_FIELDS = new Set(['quantity', 'settlementAmount', 'paymentAmount']);

/** 종류별 헤더 → OrderRaw 필드 */
export const COLUMNS = {
  // 오픈마켓_통합.xls (2026-11-25 확정 매핑). 주문채널은 '오픈마켓' 고정(FIXED), 발주일은 업로드한 날짜(orderDateOf)
  [XLS_SHOPLINKER]: {
    쇼핑몰명: 'orderType',
    쇼핑몰주문번호: 'orderNo',
    주문자명: 'ordererName',
    주문자연락처1: 'ordererTel',
    주문자연락처2: 'ordererMobile',
    수취인명: 'receiverName',
    수취인연락처1: 'receiverTel',
    수취인연락처2: 'receiverMobile',
    수취인우편번호: 'receiverZipcode',
    '수취인 주소': 'receiverAddress',
    메세지: 'memo',
    '고객사 상품코드': 'productCode', // 이관 때 상품 마스터와 맞추는 코드 (기존 이관 규칙과 같다)
    수량: 'quantity',
    주문상품명: 'productName',
    '옵션(수량없음)': 'optionInfo',
    주문금액: 'settlementAmount', // 확정 매핑 그대로 (SETTLEMENT_AMOUNT ← 주문금액)
    정산예정액: 'paymentAmount', //  확정 매핑 그대로 (PAYMENT_AMOUNT ← 정산예정액, 이미 합계)
  },
  // 자사몰_naver.xls (2026-11-25 확정 매핑, 헤더 이름 그대로). 주문채널은 고정(FIXED), 발주일은 업로드한 날짜(orderDateOf),
  // 브랜드명·제조사는 넣지 않는다. 주문 채널·외부채널품목번호·상점구분·주문상태·송장 번호·HS코드는 읽지 않는다
  [XLS_SHOP_NAVER]: {
    '주문 유형': 'orderType',
    외부채널주문번호: 'orderNo',
    '주문자 이름': 'ordererName',
    '주문자 전화번호': 'ordererTel',
    '주문자 핸드폰 번호': 'ordererMobile',
    '수취인 이름': 'receiverName',
    '수취인 전화번호': 'receiverTel',
    '수취인 핸드폰 번호': 'receiverMobile',
    '수취인 우편번호': 'receiverZipcode',
    '수취인 전체주소': 'receiverAddress',
    '주문시 남기는 글': 'memo',
    자체상품코드: 'productCode',
    상품수량: 'quantity',
    상품명: 'productName',
    옵션정보: 'optionInfo',
    '모바일앱 할인금액': ['settlementAmount', 'paymentAmount'], // 정산금액·결제금액 둘 다
    결제방법: 'payType',
  },
  // 자사몰_일반.xls (2026-11-25 확정 매핑, 헤더 이름 그대로). 주문채널은 고정(FIXED), 발주일은 업로드한 날짜(orderDateOf).
  // 주문코드(순서)·상품주문번호·송장 번호·주문상태·상점구분·주문 채널은 읽지 않는다
  [XLS_SHOP]: {
    '주문 유형': 'orderType',
    '주문 번호': 'orderNo',
    '주문자 이름': 'ordererName',
    '주문자 전화번호': 'ordererTel',
    '주문자 핸드폰 번호': 'ordererMobile',
    '수취인 이름': 'receiverName',
    '수취인 전화번호': 'receiverTel',
    '수취인 핸드폰 번호': 'receiverMobile',
    '수취인 우편번호': 'receiverZipcode',
    '수취인 전체주소': 'receiverAddress',
    '주문시 남기는 글': 'memo',
    자체상품코드: 'productCode',
    상품수량: 'quantity',
    상품명: 'productName',
    옵션정보: 'optionInfo',
    '모바일앱 할인금액': ['settlementAmount', 'paymentAmount'], // 정산금액·결제금액 둘 다
    브랜드명: 'brandName',
    제조사: 'maker',
    결제방법: 'payType',
  },
};

/** 종류별 고정값 (엑셀 헤더와 상관없이 넣는 값) */
export const FIXED = {
  // ORDER_CHANNEL (2026-11-25 확정): 엑셀 종류별 고정 이름
  [XLS_SHOPLINKER]: { orderChannel: '오픈마켓', payType: '현금' }, // 결제방법: 오픈마켓은 '현금' 고정 (2026-11-26)
  [XLS_SHOP_NAVER]: { orderChannel: '자사몰(NAVER)' },
  [XLS_SHOP]: { orderChannel: '자사몰(일반)' },
};

/**
 * 종류별 엑셀 헤더 전체 (실측 3개 파일, 각 25개). 헤더가 이것과 하나라도 다르면(빠짐·추가·이름 변경) 읽지 않는다.
 * 컬럼 순서는 보지 않는다 (헤더 이름으로 찾는다). 쇼핑몰이 엑셀 양식을 바꾸면 여기를 고친다.
 */
export const HEADERS = {
  [XLS_SHOPLINKER]: [
    '쇼핑몰주문번호', '샵링커주문번호', '쇼핑몰명', '고객사', '상품코드', '쇼핑몰 상품코드', '고객사 상품코드',
    '배송결제(신용,착불)', '주문상품명', '옵션(수량없음)', '수량', '쇼핑몰 판매가', '정산예정액', '주문금액',
    '주문자명', '주문자연락처1', '주문자연락처2', '수취인명', '수취인연락처1', '수취인연락처2',
    '수취인우편번호', '수취인 주소', '메세지', '합포장번호', '쇼핑몰아이디',
  ],
  [XLS_SHOP_NAVER]: [
    '주문 채널', '주문 유형', '외부채널품목번호', '외부채널주문번호', '주문자 이름', '주문자 전화번호', '주문자 핸드폰 번호',
    '수취인 이름', '수취인 전화번호', '수취인 핸드폰 번호', '수취인 전체주소', '상품명', '옵션정보', '상점구분',
    '모바일앱 할인금액', '상품수량', '주문시 남기는 글', '수취인 우편번호', '주문상태', '자체상품코드', '제조사',
    '브랜드명', '결제방법', '송장 번호', 'HS코드',
  ],
  [XLS_SHOP]: [
    '주문코드(순서)', '주문 유형', '상품주문번호', '주문 번호', '주문자 이름', '주문자 전화번호', '주문자 핸드폰 번호',
    '수취인 이름', '수취인 전화번호', '수취인 핸드폰 번호', '수취인 전체주소', '상품명', '옵션정보', '상품수량',
    '모바일앱 할인금액', '송장 번호', '주문시 남기는 글', '수취인 우편번호', '주문상태', '자체상품코드', '제조사',
    '브랜드명', '결제방법', '상점구분', '주문 채널',
  ],
};

/** 행마다 값이 반드시 있어야 하는 필드 (주문번호·품번·수량). 하나라도 비면 파일 전체를 읽지 않는다 */
const ROW_REQUIRED = ['orderNo', 'productCode', 'quantity'];

/** 받을 수 있는 파일 확장자 */
const EXTENSIONS = ['.xls', '.xlsx'];

/** 오류 메시지에 보여 줄 목록 (길면 앞 몇 개만) */
const brief = (list, max = 10) => list.slice(0, max).join(', ') + (list.length > max ? ` 외 ${list.length - max}개` : '');

/** 헤더가 그 종류의 양식과 같은지 확인. 다르면 Error */
const checkHeaders = (type, headers) => {
  const expected = HEADERS[type];
  const actual = headers.filter(Boolean);
  const missing = expected.filter((h) => !actual.includes(h));
  const extra = actual.filter((h) => !expected.includes(h));
  const duplicated = actual.filter((h, i) => actual.indexOf(h) !== i);
  const problems = [
    missing.length && `없는 컬럼: ${brief(missing)}`,
    extra.length && `양식에 없는 컬럼: ${brief(extra)}`,
    duplicated.length && `중복 컬럼: ${brief([...new Set(duplicated)])}`,
  ].filter(Boolean);
  if (problems.length) throw new Error(`${type} 엑셀 양식이 다릅니다. ${problems.join(' / ')}`);
};

/** 필수 값이 빈 행이 있으면 Error (엑셀 행 번호 = 헤더 1행 다음부터) */
const checkRows = (type, rows) => {
  const bad = rows.filter((r) => ROW_REQUIRED.some((f) => r[f] === null || r[f] === undefined));
  if (bad.length) {
    throw new Error(`${type} 엑셀에 주문번호·상품코드·수량이 비어 있는 행이 있습니다: ${brief(bad.map((r) => `${r.excelRow}행`))}`);
  }
};

/** 확장자 확인. 다르면 Error */
export const checkFileName = (fileName) => {
  const lower = String(fileName || '').toLowerCase();
  if (!EXTENSIONS.some((ext) => lower.endsWith(ext))) {
    throw new Error(`엑셀 파일(${EXTENSIONS.join(', ')})만 불러올 수 있습니다: ${fileName}`);
  }
};

/** 헤더로 엑셀 종류 판별. 모르는 형식이면 null */
export const detectType = (headers) => {
  const set = new Set(headers);
  if (set.has('샵링커주문번호')) return XLS_SHOPLINKER;
  if (set.has('외부채널주문번호')) return XLS_SHOP_NAVER;
  if (set.has('주문코드(순서)')) return XLS_SHOP;
  return null;
};

/** 오늘 날짜 YYYY-MM-DD (브라우저 시간 기준) */
const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

/**
 * 발주일(YYYY-MM-DD) = 업로드한 날짜 (샵링커·자사몰 네이버·자사몰 일반 모두 — 2026-11-25 결정).
 * 엑셀에 발주일 컬럼이 없다.
 */
export const orderDateOf = () => today();

/** 셀 값 → 문자열. 숫자는 정수면 "1000027144" (지수표기·".0" 없이). 빈 값은 null */
export const cellText = (value) => {
  if (value === null || value === undefined) return null;
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) return null;
    return Number.isInteger(value) ? value.toLocaleString('en-US', { useGrouping: false }) : String(value);
  }
  if (value instanceof Date) return null; // 매핑 대상 컬럼에는 날짜 셀이 없다
  const text = String(value).trim();
  return text === '' ? null : text;
};

const toNumber = (value) => {
  const text = cellText(value);
  if (text === null) return null;
  const n = Number(text.replace(/,/g, ''));
  return Number.isFinite(n) ? Math.trunc(n) : null;
};

/**
 * 엑셀(ArrayBuffer) → { type, headers, rows }. 첫 시트 1행이 헤더, 빈 행은 건너뛴다.
 * rows 의 각 행: OrderRaw 필드 (+ 고정값 FIXED, 발주일 = 업로드한 날짜).
 * 아래 경우 Error 로 거부한다 (message 는 화면에 그대로 보여 준다):
 *   읽을 수 없는 파일 / 종류 판별 불가 / 헤더가 양식(HEADERS)과 다름 / 데이터 행 없음 / 필수 값(ROW_REQUIRED)이 빈 행
 */
export const parseOrderExcel = (arrayBuffer) => {
  let workbook;
  try {
    workbook = XLSX.read(arrayBuffer, { type: 'array' });
  } catch (error) {
    throw new Error(`엑셀 파일을 읽을 수 없습니다. (${error?.message || error})`);
  }
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  if (!sheet) throw new Error('엑셀에 시트가 없습니다.');
  const table = XLSX.utils.sheet_to_json(sheet, { header: 1, raw: true, defval: null, blankrows: true }); // 빈 행도 받아 행 번호를 엑셀과 맞춘다 (아래에서 건너뜀)
  if (!table.length) throw new Error('엑셀에 헤더 행이 없습니다.');

  const headers = table[0].map((h) => (h === null || h === undefined ? '' : String(h).trim()));
  const type = detectType(headers);
  if (!type) throw new Error('알 수 없는 엑셀 형식입니다. (샵링커 통합발주 / 고도몰 자사몰 일반 / 고도몰 자사몰 네이버 주문엑셀만 가능)');

  checkHeaders(type, headers);

  const columns = Object.entries(COLUMNS[type])
    .flatMap(([header, fields]) => [].concat(fields).map((field) => ({ field, index: headers.indexOf(header) })))
    .filter((c) => c.index >= 0);

  const rows = [];
  table.slice(1).forEach((cells, i) => {
    if (!cells || cells.every((v) => cellText(v) === null)) return;
    const row = { excelRow: i + 2 }; // 오류 안내용 엑셀 행 번호 (검사 뒤 지운다)
    columns.forEach(({ field, index }) => {
      const value = cells[index];
      row[field] = NUMBER_FIELDS.has(field) ? toNumber(value) : cellText(value);
    });
    Object.assign(row, FIXED[type] || {});
    row.orderDate = orderDateOf();
    rows.push(row);
  });
  if (!rows.length) throw new Error(`${type} 엑셀에 데이터 행이 없습니다.`);
  checkRows(type, rows);
  rows.forEach((row) => delete row.excelRow);
  return { type, headers, rows };
};
