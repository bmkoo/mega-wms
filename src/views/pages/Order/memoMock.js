/** 메모관리 화면 확인용 임시 데이터 */

export const MEMO_CHANNELS = ['메가커피', '네이버 체크아웃', '쿠팡', '모두의원두', '카카오톡스토어'];
export const MEMO_CHANNEL_GROUPS = ['자사몰', '오픈마켓', '종합몰'];
export const MEMO_BRANDS = ['메가MGC커피', '스타벅스', '투썸플레이스', '이디야커피', '빽다방'];
export const MEMO_PRODUCT_GROUPS = ['원두', '시럽', '파우더', '디저트', '기기'];
export const MEMO_TYPES = ['etc', 'delivery', 'return', 'exchange'];
export const MEMO_STATUSES = ['wait', 'done'];

const CHANNEL_GROUP_MAP = {
  메가커피: '자사몰',
  '네이버 체크아웃': '오픈마켓',
  쿠팡: '오픈마켓',
  모두의원두: '자사몰',
  카카오톡스토어: '종합몰',
};

const USERS = ['이유진_사', '김경양_차', '김미연_사', '이유주_사', '이광민_팀', '홍길동'];

const FIXED_ROWS = [
  {
    channel: '메가커피',
    orderNo: 'Z20260915419440',
    memoCount: 1,
    orderer: '문진숙',
    receiver: '문진숙_오',
    content: '폐기된 운송장번호 : 929215085675',
    memoType: 'etc',
  },
  {
    channel: '네이버 체크아웃',
    orderNo: 'Z20260914325812',
    memoCount: 1,
    orderer: '홍승표',
    receiver: '홍승표',
    content: '오리스트 스테인레스 겨자소스 21.9cm -> 1개 누락 재배송',
    memoType: 'delivery',
    inputUser: '김경양_차',
    processor: '김경양_차',
  },
  {
    channel: '메가커피',
    orderNo: 'Z20260915420249',
    memoCount: 1,
    orderer: '홍승표',
    receiver: '홍승표',
    content: '오리스트 스테인레스 겨자소스 21.9cm -> 1개 누락 재배송',
    memoType: 'delivery',
    inputUser: '김경양_차',
    processor: '김경양_차',
  },
  {
    channel: '메가커피',
    orderNo: 'Z20260908985335',
    memoCount: 3,
    orderer: '안정현',
    receiver: '안정현*나',
    content: '★ 물건 수거해가신다고 빠른 환불 요청 -> 환불되면 돈',
    memoType: 'delivery',
    alarmDate: 1,
    inputUser: '김미연_사',
    processor: '김미연_사',
  },
  {
    channel: '메가커피',
    orderNo: 'Z20260915418996',
    memoCount: 1,
    orderer: '김진환',
    receiver: '이한섭',
    content: '[기본정보변경] 처리시 배송정보 변경 내용입니다. -->',
    memoType: 'etc',
    inputUser: '이유주_사',
    processor: '이유주_사',
  },
  {
    channel: '메가커피',
    orderNo: 'Z20260915418733',
    memoCount: 1,
    orderer: '카페 항목',
    receiver: '카페항목북',
    content: '[50X] 올데이 32온스 아이스전용 물대(루지) 1박스 오주',
    memoType: 'return',
    inputUser: '이유주_사',
    processor: '이유주_사',
  },
  {
    channel: '메가커피',
    orderNo: 'Z20260915418734',
    memoCount: 1,
    orderer: '카페 항목',
    receiver: '카페항목북',
    content: '배송받은 업체 별로 배송 상품',
    memoType: 'delivery',
    inputUser: '이유주_사',
    processor: '이유주_사',
  },
  {
    channel: '쿠팡',
    orderNo: 'Z20260903749668',
    memoCount: 4,
    orderer: '장승석',
    receiver: '장승석_오',
    content: '451-2266-3703 반송장으로 입고중 분실된 10일 이전',
    memoType: 'delivery',
    inputUser: '김미연_사',
    processor: '김미연_사',
  },
  {
    channel: '네이버 체크아웃',
    orderNo: 'Z20260915418019',
    memoCount: 1,
    orderer: '조철진',
    receiver: '줄눈아침',
    content: '[기본정보변경] 처리시 배송정보 변경 내용입니다. -->',
    memoType: 'etc',
    inputUser: '이유주_사',
    processor: '이유주_사',
  },
  {
    channel: '메가커피',
    orderNo: 'Z20260911190851',
    memoCount: 1,
    orderer: '서옥분',
    receiver: '서옥분_오',
    content: '010-2082-2475 MEC3 요거트 파우더 체리니타 1kg ->',
    memoType: 'exchange',
    inputUser: '김미연_사',
    processor: '김미연_사',
  },
  {
    channel: '메가커피',
    orderNo: 'Z20260911190851',
    memoCount: 1,
    orderer: '서옥분',
    receiver: '서옥분',
    content: '[맞고환입직] 처리시 배송정보 변경 내용입니다. -->',
    memoType: 'etc',
    inputUser: '김미연_사',
    processor: '김미연_사',
  },
  {
    channel: '메가커피',
    orderNo: 'Z20260911190851',
    memoCount: 1,
    orderer: '서옥분',
    receiver: '서옥분_오',
    content: '수령나누가 -> 누보면호 [!]',
    memoType: 'etc',
    inputUser: '김미연_사',
    processor: '김미연_사',
  },
  {
    channel: '메가커피',
    orderNo: 'Z20260910093380',
    memoCount: 1,
    orderer: '최선옥',
    receiver: '최선옥',
    content: '[폐기] 운대 폐기 청원서 금일 회수 기사님께서 회수',
    memoType: 'delivery',
  },
  {
    channel: '메가커피',
    orderNo: 'Z20260907092822',
    memoCount: 1,
    orderer: '윤소정',
    receiver: '박승주*이',
    content: '[폐지발송] 솔 냉동 딸기 (국내산) 1kg*FREE/FREE 롯데',
    memoType: 'delivery',
    inputUser: '김미연_사',
    processor: '김미연_사',
  },
  {
    channel: '메가커피',
    orderNo: 'Z20260715145390',
    memoCount: 2,
    orderer: '김지완',
    receiver: '온시제3_2',
    content: '업체분 서류 요청 메일 발송 완료',
    memoType: 'delivery',
  },
  {
    channel: '메가커피',
    orderNo: 'Z20260915410420',
    memoCount: 1,
    orderer: '김혜선',
    receiver: '김혜선',
    content: '전기원 운송장번호 (운송장 나가지) 92321521125',
    memoType: 'etc',
    inputUser: '이광민_팀',
    processor: '이광민_팀',
  },
  {
    channel: '네이버 체크아웃',
    orderNo: 'Z20260911195864',
    memoCount: 1,
    orderer: '김현구',
    receiver: '김현구_오',
    content: '< 전가이 80아이스 아이스컵 심즈뚜껑 / 중 100개 1박스 >',
    memoType: 'exchange',
    inputUser: '김미연_사',
    processor: '김미연_사',
  },
  {
    channel: '네이버 체크아웃',
    orderNo: 'Z20260911195864',
    memoCount: 1,
    orderer: '김현구',
    receiver: '김현구_오',
    content: '[맞고환입직] 처리시 배송정보 변경 내용입니다. -->',
    memoType: 'etc',
    inputUser: '김미연_사',
    processor: '김미연_사',
  },
  {
    channel: '메가커피',
    orderNo: 'Z20260911199978',
    memoCount: 1,
    orderer: '김재순',
    receiver: '김재순_오',
    content: '동서 리치즈 토핑용 3kg / 2개 파손 - 맞고환 회수안내',
    memoType: 'delivery',
  },
  {
    channel: '메가커피',
    orderNo: 'Z20260911199978',
    memoCount: 1,
    orderer: '김재순',
    receiver: '김재순_오',
    content: '[맞고환입직] 처리시 배송정보 변경 내용입니다. -->',
    memoType: 'etc',
  },
];

const EXTRA_CONTENTS = [
  '배송지연 고객 안내 완료',
  '부분출고 요청',
  '송장 재출력',
  '고객 연락처 변경',
  '오배송 확인 요청',
  '출고보류',
  '클레임 접수',
];

function todayYmd() {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}${mm}${dd}`;
}

export function createMockMemos(today = '') {
  const inputDate = today || todayYmd();
  const alarmDate = (() => {
    const y = Number(inputDate.slice(0, 4));
    const m = Number(inputDate.slice(4, 6));
    const d = Number(inputDate.slice(6, 8));
    const next = new Date(y, m - 1, d + 1);
    const mm = String(next.getMonth() + 1).padStart(2, '0');
    const dd = String(next.getDate()).padStart(2, '0');
    return `${next.getFullYear()}${mm}${dd}`;
  })();

  const toRow = (item, index) => {
    const channel = item.channel || MEMO_CHANNELS[index % MEMO_CHANNELS.length];
    const user = item.inputUser || USERS[index % USERS.length];
    return {
      id: index + 1,
      channel,
      channelGroup: CHANNEL_GROUP_MAP[channel] || '자사몰',
      brandName: MEMO_BRANDS[index % MEMO_BRANDS.length],
      productGroup: MEMO_PRODUCT_GROUPS[index % MEMO_PRODUCT_GROUPS.length],
      orderNo: item.orderNo || '',
      memoCount: item.memoCount || 1,
      orderer: item.orderer || `주문자${index + 1}`,
      receiver: item.receiver || `수량자${index + 1}`,
      content: item.content,
      memoType: item.memoType || MEMO_TYPES[index % MEMO_TYPES.length],
      status: item.status || 'done',
      inputDate,
      alarmDate: item.alarmDate ? alarmDate : '',
      inputUser: user,
      processDate: item.status === 'wait' ? '' : inputDate,
      processor: item.status === 'wait' ? '' : item.processor || user,
    };
  };

  const extras = Array.from({ length: 28 }, (_, i) => {
    const index = FIXED_ROWS.length + i;
    const noOrder = i < 4;
    return toRow(
      {
        channel: MEMO_CHANNELS[i % MEMO_CHANNELS.length],
        orderNo: noOrder ? '' : `Z${inputDate}${String(30000 + i).padStart(5, '0')}`,
        memoCount: 1,
        orderer: noOrder ? '내부메모' : `샘플주문자${i + 1}`,
        receiver: noOrder ? '' : `샘플수량자${i + 1}`,
        content: noOrder ? `주문 없는 내부 메모 ${i + 1}` : EXTRA_CONTENTS[i % EXTRA_CONTENTS.length],
        memoType: MEMO_TYPES[i % MEMO_TYPES.length],
        status: i % 7 === 0 ? 'wait' : 'done',
        inputUser: i % 9 === 0 ? '홍길동' : USERS[i % USERS.length],
        processor: i % 7 === 0 ? '' : USERS[i % USERS.length],
        alarmDate: i % 11 === 0 ? 1 : 0,
      },
      index
    );
  });

  return [...FIXED_ROWS.map((row, index) => toRow(row, index)), ...extras];
}

export function findMockMemo(id) {
  return createMockMemos().find((row) => String(row.id) === String(id)) || null;
}
