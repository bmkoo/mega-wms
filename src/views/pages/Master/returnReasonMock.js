/** 반품사유 관리 화면 확인용 임시 데이터 */

const SEED = [
  ['A001', '단순변심-단순변심', 1, 'Y', '20170105', '시스템', ''],
  ['A002', '단순변심-배송지연', 2, 'Y', '20170105', '시스템', ''],
  ['C005', '오배송-물류오류', 3, 'Y', '20230710', '마정숙_팀장', '115.95.114.91'],
  ['D008', '불량-상품불량', 4, 'Y', '20230710', '마정숙_팀장', '115.95.114.91'],
  ['Z009', '기타-기타', 5, 'Y', '20230710', '마정숙_팀장', '115.95.114.91'],
  ['E010', '기타-택배분실', 6, 'Y', '20230710', '마정숙_팀장', '115.95.114.91'],
  ['E015', '기타-택배파손', 7, 'Y', '20230710', '마정숙_팀장', '115.95.114.91'],
  ['X0001', 'CJ-상차중택배파손', 8, 'Y', '20240103', '마정숙_팀장', '115.95.114.91'],
  ['X0002', '미회수-파손', 8, 'N', '20240103', '마정숙_팀장', '115.95.114.91'],
  ['C006', '오배송-매칭오류', 10, 'N', '20230710', '마정숙_팀장', '115.95.114.91'],
  ['C004', '오배송-누락배송', 11, 'N', '20230710', '마정숙_팀장', '115.95.114.91'],
  ['C001', '오배송-품번오류', 12, 'N', '20230710', '마정숙_팀장', '115.95.114.91'],
  ['C002', '오배송-사이즈오류', 12, 'N', '20230710', '마정숙_팀장', '115.95.114.91'],
  ['C003', '오배송-색상오류', 12, 'N', '20230710', '마정숙_팀장', '115.95.114.91'],
  ['D001', '불량-봉제불량', 12, 'N', '20230710', '마정숙_팀장', '115.95.114.91'],
  ['D002', '불량-인쇄불량', 13, 'N', '20230710', '마정숙_팀장', '115.95.114.91'],
  ['D003', '불량-원단불량', 14, 'N', '20230710', '마정숙_팀장', '115.95.114.91'],
  ['D004', '불량-원단오염', 15, 'N', '20230710', '마정숙_팀장', '115.95.114.91'],
  ['D005', '불량-물빠짐', 16, 'N', '20230710', '마정숙_팀장', '115.95.114.91'],
  ['D006', '불량-부자재오류', 17, 'N', '20230710', '마정숙_팀장', '115.95.114.91'],
  ['D007', '불량-기타불량', 18, 'N', '20230710', '마정숙_팀장', '115.95.114.91'],
  ['D009', '불량-상품파손', 20, 'N', '20230710', '마정숙_팀장', '115.95.114.91'],
  ['D010', '불량-실마감', 21, 'N', '20230710', '마정숙_팀장', '115.95.114.91'],
  ['D011', '불량-냄새', 22, 'N', '20230710', '마정숙_팀장', '115.95.114.91'],
  ['D013', '불량-내용물이상', 23, 'N', '20230710', '마정숙_팀장', '115.95.114.91'],
  ['B001', '고객오류-사이즈오류', 24, 'N', '20230710', '마정숙_팀장', '115.95.114.91'],
  ['B002', '고객오류-색상오류', 24, 'N', '20230710', '마정숙_팀장', '115.95.114.91'],
  ['B003', '고객오류-주소지오류', 24, 'N', '20230710', '마정숙_팀장', '115.95.114.91'],
  ['D012', '불량-실측불량', 24, 'N', '20230710', '마정숙_팀장', '115.95.114.91'],
  ['S001', 'AS-유상', 25, 'N', '20230710', '마정숙_팀장', '115.95.114.91'],
  ['S002', 'AS-무상', 26, 'N', '20230710', '마정숙_팀장', '115.95.114.91'],
  ['S003', 'AS-맞교환', 27, 'N', '20230710', '마정숙_팀장', '115.95.114.91'],
  ['S004', 'AS-타업체', 28, 'N', '20230710', '마정숙_팀장', '115.95.114.91'],
  ['E001', '기타-웹과상이', 29, 'N', '20230710', '마정숙_팀장', '115.95.114.91'],
  ['E002', '기타-사이즈불만', 30, 'N', '20230710', '마정숙_팀장', '115.95.114.91'],
  ['E003', '기타-등록오류', 31, 'N', '20230710', '마정숙_팀장', '115.95.114.91'],
  ['E004', '기타-소재불만', 32, 'N', '20230710', '마정숙_팀장', '115.95.114.91'],
  ['E005', '기타-인수전취소', 33, 'N', '20230710', '마정숙_팀장', '115.95.114.91'],
  ['E014', '기타-트러블', 34, 'N', '20230710', '마정숙_팀장', '115.95.114.91'],
  ['E006', '기타-털빠짐', 35, 'N', '20230710', '마정숙_팀장', '115.95.114.91'],
  ['E009', '기타-구성품누락', 36, 'N', '20230710', '마정숙_팀장', '115.95.114.91'],
  ['E013', '기타-구성품중복', 37, 'N', '20230710', '마정숙_팀장', '115.95.114.91'],
  ['E011', '기타-가송장', 40, 'N', '20230710', '마정숙_팀장', '115.95.114.91'],
  ['E012', '기타-교환상품품절', 41, 'N', '20230710', '마정숙_팀장', '115.95.114.91'],
  ['E007', '기타-SITE단순변심', 42, 'N', '20230710', '마정숙_팀장', '115.95.114.91'],
  ['E008', '기타-SITE불량', 43, 'N', '20230710', '마정숙_팀장', '115.95.114.91'],
];

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

export function splitReasonName(fullName) {
  const text = String(fullName || '');
  const idx = text.indexOf('-');
  if (idx < 0) return { groupName: text || '기타', reasonName: text };
  return { groupName: text.slice(0, idx), reasonName: text.slice(idx + 1) };
}

export function joinReasonName(groupName, reasonName) {
  const group = String(groupName || '').trim();
  const name = String(reasonName || '').trim();
  if (!group) return name;
  if (!name) return group;
  return `${group}-${name}`;
}

function buildStore() {
  const map = new Map();
  SEED.forEach(([defectCode, fullName, displayOrder, useYn, updDt, updUser, updIp], index) => {
    const { groupName, reasonName } = splitReasonName(fullName);
    if (!map.has(groupName)) {
      map.set(groupName, {
        id: map.size + 1,
        groupName,
        items: [],
      });
    }
    map.get(groupName).items.push({
      id: defectCode,
      defectCode,
      reasonName,
      fullName,
      displayOrder,
      useYn,
      updDt,
      updUser,
      updIp: updIp || '',
      seq: index + 1,
    });
  });
  return [...map.values()];
}

let store = null;

function ensureStore() {
  if (!store) store = buildStore();
  return store;
}

export function getMockReturnReasonGroups() {
  return clone(ensureStore());
}

export function findMockReturnReasonGroup(id) {
  const found = ensureStore().find((group) => String(group.id) === String(id));
  return found ? clone(found) : null;
}

function todayYmd() {
  const d = new Date();
  return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
}

export function saveMockReturnReasonGroup(payload) {
  const groups = ensureStore();
  const groupName = String(payload.groupName || '').trim();
  const updDt = todayYmd();
  const items = (payload.items || [])
    .map((row) => {
      const reasonName = String(row.reasonName || '').trim();
      const defectCode = String(row.defectCode || '').trim();
      if (!reasonName && !defectCode) return null;
      return {
        id: row.id || defectCode || Date.now() + Math.floor(Math.random() * 1000),
        defectCode,
        reasonName,
        fullName: joinReasonName(groupName, reasonName),
        displayOrder: row.displayOrder == null || row.displayOrder === '' ? null : Number(row.displayOrder),
        useYn: row.useYn === 'N' ? 'N' : 'Y',
        updDt,
        updUser: row.updUser || payload.updUser || '시스템',
        updIp: row.updIp || payload.updIp || '',
      };
    })
    .filter(Boolean);

  const next = {
    id: payload.id || Math.max(0, ...groups.map((group) => Number(group.id) || 0)) + 1,
    groupName,
    items,
  };

  const index = groups.findIndex((group) => String(group.id) === String(next.id));
  if (index >= 0) groups.splice(index, 1, next);
  else groups.push(next);
  return clone(next);
}
