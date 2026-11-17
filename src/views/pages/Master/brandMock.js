/** 브랜드 그룹 + 브랜드 화면 확인용 임시 데이터 */

const BRAND_NAMES = [
  '*갓볶은 메가커피',
  '*품절',
  '1883시럽소스',
  '3M CUNO',
  'AOP',
  'BBC',
  'BFC',
  'BTB',
  'BUNN',
  'CP',
  'DEEU-FOOD',
  'Diller',
  'Elektra',
  'FAC',
  'FO',
  'FRANKE',
  'FRD',
  'G7',
  '메가MGC커피',
  '스타벅스',
  '투썸플레이스',
  '이디야커피',
  '빽다방',
  '컴포즈커피',
  '매머드커피',
  '할리스',
  '엔제리너스',
  '파스쿠찌',
  '드롭탑',
  '커피빈',
  '폴바셋',
  '탐앤탐스',
  '카페베네',
  '더벤티',
  '메가커피 원두',
  '메가커피 시럽',
  '메가커피 파우더',
  '메가커피 디저트',
  '코카콜라',
  '펩시',
  '롯데칠성',
  '매일유업',
  '서울우유',
  '남양유업',
  '동서식품',
  '맥심',
  '카누',
  '네스카페',
  '일리',
  '라바짜',
  '테라로사',
];

const USERS = ['정동한_주', '이영준_주', '송원석_과', '김민수_대', '박지현_사', '최은정_주', '이재승_주'];
const IPS = ['115.95.114.93', '1.221.165.34', '211.36.142.18', '123.142.88.11', '210.103.55.20', '118.32.10.44'];
const FIXED_NOS = [2, 490, 6, 69, 675, 667, 1005, 1027, 1011, 199, 1053, 495, 820, 185, 265, 1012, 823, 676];

const GROUP_SEED = [
  { id: 5, groupName: '상위매출', inputUser: '정동한_주', inputDate: '20160621', updUser: '정동한_주', updDt: '20160621' },
  { id: 4, groupName: '보고서', inputUser: '정동한_주', inputDate: '20160323', updUser: '정동한_주', updDt: '20160323' },
  { id: 3, groupName: '미할당', inputUser: '정동한_주', inputDate: '20150909', updUser: '정동한_주', updDt: '20150909' },
  { id: 2, groupName: '갓볶은 커피', inputUser: '정동한_주', inputDate: '20150821', updUser: '이재승_주', updDt: '20181128' },
  { id: 1, groupName: '일본수입용품', inputUser: '이영준_주', inputDate: '20140913', updUser: '이영준_주', updDt: '20140913' },
];

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function padDate(index) {
  const y = 2014 + (index % 12);
  const m = String((index % 12) + 1).padStart(2, '0');
  const d = String((index % 27) + 1).padStart(2, '0');
  return `${y}${m}${d}`;
}

function assignGroupId(index) {
  if (index < 2) return 2;
  if (index < 4) return 1;
  if (index < 9) return 4;
  return 5;
}

function buildMockBrandGroups() {
  const groups = GROUP_SEED.map((group) => ({ ...group, brands: [] }));
  const byId = new Map(groups.map((group) => [group.id, group]));

  BRAND_NAMES.forEach((brandName, index) => {
    const group = byId.get(assignGroupId(index));
    group.brands.push({
      id: index + 1,
      groupId: group.id,
      brandNo: FIXED_NOS[index] ?? 400 + index,
      brandName,
      useYn: index % 8 === 7 ? 'N' : 'Y',
      updDt: padDate(index),
      updUser: USERS[index % USERS.length],
      updIp: IPS[index % IPS.length],
    });
  });

  return groups;
}

let store = null;

function ensureStore() {
  if (!store) store = buildMockBrandGroups();
  return store;
}

export function getMockBrandGroups() {
  return clone(ensureStore());
}

export function findMockBrandGroup(id) {
  const found = ensureStore().find((group) => String(group.id) === String(id));
  return found ? clone(found) : null;
}

export function saveMockBrandGroup(payload) {
  const groups = ensureStore();
  const brands = (payload.brands || [])
    .map((row) => ({
      id: row.id || Date.now() + Math.floor(Math.random() * 1000),
      groupId: payload.id,
      brandNo: row.brandNo == null || row.brandNo === '' ? null : Number(row.brandNo),
      brandName: String(row.brandName || '').trim(),
      useYn: row.useYn === 'N' ? 'N' : 'Y',
      updDt: row.updDt || payload.updDt,
      updUser: row.updUser || payload.updUser,
      updIp: row.updIp || '',
    }))
    .filter((row) => row.brandName);

  const next = {
    id: payload.id || Math.max(0, ...groups.map((group) => Number(group.id) || 0)) + 1,
    groupName: String(payload.groupName || '').trim(),
    inputUser: payload.inputUser || payload.updUser || '',
    inputDate: payload.inputDate || payload.updDt || '',
    updUser: payload.updUser || '',
    updDt: payload.updDt || '',
    brands,
  };

  brands.forEach((row) => {
    row.groupId = next.id;
  });

  const index = groups.findIndex((group) => String(group.id) === String(next.id));
  if (index >= 0) {
    next.inputUser = groups[index].inputUser || next.inputUser;
    next.inputDate = groups[index].inputDate || next.inputDate;
    groups.splice(index, 1, next);
  } else {
    groups.unshift(next);
  }

  return clone(next);
}

/** 기존 브랜드 단건 조회용 (플랫 목록) */
export function createMockBrands() {
  return getMockBrandGroups().flatMap((group) =>
    group.brands.map((brand) => ({ ...brand, groupId: group.id, groupName: group.groupName }))
  );
}
