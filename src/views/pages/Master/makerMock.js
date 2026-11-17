/** 제조사 관리 화면 확인용 임시 데이터 */

const SEED = [
  {
    makerId: 'M202609003040',
    makerName: '지에스이인터내셔날',
    managerName: '',
    managerMobile: '',
    managerTel: '',
    businessType: '',
    address: '',
    useYn: 'Y',
    updDt: '20260923 13:53:20',
    updUser: '이유리_사',
    memo: '서울시 마포구 동교로 85(창전동 2층)',
    productCount: 12,
  },
  {
    makerId: 'M202609003025',
    makerName: '성유인터프라머스',
    managerName: '홍영은 팀장',
    managerMobile: '010-4811-0226',
    managerTel: '',
    businessType: '',
    address: '',
    useYn: 'Y',
    updDt: '20260907 14:38:24',
    updUser: '정겨경_대',
    memo: '',
    productCount: 8,
  },
  {
    makerId: 'M202606003209',
    makerName: '어스에이치피시팩-업체발송',
    managerName: '',
    managerMobile: '',
    managerTel: '02-6341-2261',
    businessType: '',
    address: '경기 고양시 덕양',
    useYn: 'Y',
    updDt: '20260626 14:59:57',
    updUser: '김현숙_사',
    memo: '[범주] - 범주 담당자명 : - 연락처 (',
    productCount: 4,
  },
  {
    makerId: 'M201301002230',
    makerName: '에스앤에스',
    managerName: '',
    managerMobile: '',
    managerTel: '',
    businessType: 'company',
    address: '에스앤에스',
    useYn: 'Y',
    updDt: '20260607 09:36:09',
    updUser: '이영아_사',
    memo: '[20년4월사업자변경] 구)에스에이치에스',
    productCount: 21,
  },
  {
    makerId: 'M201305000123',
    makerName: '삼경엘엔이(스카파) 업체발주나',
    managerName: '',
    managerMobile: '',
    managerTel: '',
    businessType: '',
    address: '',
    useYn: 'Y',
    updDt: '20260804 18:04:05',
    updUser: '한상일_대',
    memo: '',
    productCount: 0,
  },
  {
    makerId: 'M201305000033',
    makerName: '삼경엘엔이(스카파)',
    managerName: '장두신',
    managerMobile: '',
    managerTel: '',
    businessType: 'company',
    address: '서울특별시 강남구 테헤',
    useYn: 'Y',
    updDt: '20260804 18:00:25',
    updUser: '한상일_대',
    memo: '[26.8.5 사업자변경] 삼경엘엔에스',
    productCount: 15,
  },
  {
    makerId: 'M201608001006',
    makerName: '남양아토어스_업체발송',
    managerName: '홍승진',
    managerMobile: '010-9543-7125',
    managerTel: '',
    businessType: '',
    address: '서울특별시 서초구',
    useYn: 'Y',
    updDt: '20260804 17:43:30',
    updUser: '한상일_대',
    memo: '[26.8.3 사업자변경] 남양아토어스',
    productCount: 6,
  },
  {
    makerId: 'M201608001156',
    makerName: '남양아토어스',
    managerName: '홍승진',
    managerMobile: '',
    managerTel: '010-3343-7129',
    businessType: 'company',
    address: '서울특별시 서초구',
    useYn: 'Y',
    updDt: '20260804 17:39:27',
    updUser: '한상일_대',
    memo: '이 브랜드는 (사)홍-남양에스에이로',
    productCount: 33,
  },
];

const EXTRA_NAMES = [
  '모먼트브루',
  '뉴디스코리아-업체발송',
  '알제이통상',
  '씨앤비커머스 그룹코리아',
  '로코리아',
  '유니원-업체발송',
  '커이스퀘어-업체발송',
  '이오오에이언더-업체발송',
  '이오오에이언더',
  '우양-업체발송',
  '씨제이프레시웨이-업체발송',
  '대흥푸드',
  '매일유업',
  '서울우유',
  '롯데칠성',
  '동서식품',
  '남양유업',
  '코카콜라음료',
  '일리코리아',
  '네슬레코리아',
];

const USERS = ['이유리_사', '정겨경_대', '김현숙_사', '이영아_사', '한상일_대', '김철수_사', '전창아_사'];

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function pad(num, size) {
  return String(num).padStart(size, '0');
}

function buildStore() {
  const rows = SEED.map((row, index) => ({ id: index + 1, ...row }));
  EXTRA_NAMES.forEach((makerName, index) => {
    const seq = index + 1;
    const isCompany = seq % 4 === 0;
    rows.push({
      id: rows.length + 1,
      makerId: `M20250${pad(seq, 7)}`,
      makerName,
      managerName: seq % 3 === 0 ? `담당자${seq}` : '',
      managerMobile: seq % 2 === 0 ? `010-${pad(1000 + seq, 4)}-${pad(2000 + seq, 4)}` : '',
      managerTel: seq % 5 === 0 ? `02-${pad(300 + seq, 4)}-${pad(1000 + seq, 4)}` : '',
      businessType: isCompany ? 'company' : '',
      address: seq % 2 === 0 ? '서울특별시 서초구' : '경기도 남양주시',
      useYn: seq % 9 === 0 ? 'N' : 'Y',
      updDt: `20250${pad((seq % 9) + 1, 1)}${pad((seq % 27) + 1, 2)} 10:${pad(seq % 60, 2)}:${pad(seq % 45, 2)}`,
      updUser: USERS[seq % USERS.length],
      memo: seq % 4 === 0 ? '샘플 제조사 메모' : '',
      productCount: seq % 7 === 0 ? 0 : seq * 3,
    });
  });
  return rows;
}

let store = null;

function ensureStore() {
  if (!store) store = buildStore();
  return store;
}

export function getMockMakers() {
  return clone(ensureStore());
}

export function findMockMaker(id) {
  const found = ensureStore().find((row) => String(row.id) === String(id));
  return found ? clone(found) : null;
}

export function saveMockMaker(payload) {
  const rows = ensureStore();
  const next = {
    id: payload.id,
    makerId: payload.makerId,
    makerName: String(payload.makerName || '').trim(),
    managerName: payload.managerName || '',
    managerMobile: payload.managerMobile || '',
    managerTel: payload.managerTel || '',
    businessType: payload.businessType === 'company' ? 'company' : '',
    address: payload.address || '',
    useYn: payload.useYn === 'N' ? 'N' : 'Y',
    updDt: payload.updDt,
    updUser: payload.updUser || '',
    memo: payload.memo || '',
    productCount: Number(payload.productCount) || 0,
  };

  if (!next.id) {
    next.id = Math.max(0, ...rows.map((row) => Number(row.id) || 0)) + 1;
    next.makerId = next.makerId || `M${String(payload.updDt || '').replace(/\D/g, '').slice(0, 6)}${pad(next.id, 6)}`;
    rows.unshift(next);
  } else {
    const index = rows.findIndex((row) => String(row.id) === String(next.id));
    if (index >= 0) rows.splice(index, 1, { ...rows[index], ...next });
    else rows.unshift(next);
  }

  return clone(next);
}
