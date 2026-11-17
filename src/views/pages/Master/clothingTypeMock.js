/** 복종 관리 화면 확인용 임시 데이터 */

const SEED = [
  [18, '1.커피 - 갓볶은'],
  [52, '1.커피 - 생두'],
  [53, '1.커피 - 원두외'],
  [59, '1.커피 - 캡슐커피'],
  [61, '2.파우더 - 녹차 홍차'],
  [62, '2.파우더 - 아이스티'],
  [60, '2.파우더 - 요거트'],
  [64, '2.파우더 - 초코'],
  [63, '2.파우더 - 페이스트 곡물'],
  [6, '2.파우더 - 프라페외'],
  [38, '3.카페식자재 - 빙수'],
  [34, '3.카페식자재 - 소스'],
  [35, '3.카페식자재 - 스무디'],
  [33, '3.카페식자재 - 시럽'],
  [55, '3.카페식자재 - 에이드'],
  [65, '3.카페식자재 - 쿠킹'],
  [37, '3.카페식자재 - 휘핑외'],
  [47, '4.음료 - 우유 비건유'],
  [54, '4.음료 - 전통차 과일청'],
  [51, '4.음료 - 주스외'],
  [56, '4.음료 - 커피 콜드브로'],
  [49, '4.음료 - 탄산수 물'],
  [7, '4.음료 - 탄산음료 사이다'],
  [36, '4.음료 - 티'],
  [10, '5.용품 - 머신'],
  [1, '5.용품 - 수입제품'],
  [42, '5.용품 - 주방 매장'],
  [41, '5.용품 - 커피용품'],
  [5, '5.용품 - 테이크아웃'],
  [45, '5.용품 - 티용품'],
  [46, '6.식품 - 건강기능식품'],
  [48, '6.식품 - 과일'],
  [39, '6.식품 - 베이커리'],
  [2, '6.식품 - 스낵'],
  [58, '6.식품 - 신선 완제'],
  [57, '6.식품 - 아이스크림'],
  [50, '6.식품 - 잼 꿀'],
  [12, '99.기타 - 기타'],
  [43, '99.기타 - 도서'],
  [25, '99.기타 - 샘플'],
  [26, '99.기타 - 증정'],
  [44, '99.기타 - 특가'],
  [29, '99.기타 - 프로모션 이벤트'],
];

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

export function splitClothingName(fullName) {
  const text = String(fullName || '');
  const idx = text.indexOf(' - ');
  if (idx < 0) return { groupName: text || '기타', clothingName: text };
  return { groupName: text.slice(0, idx), clothingName: text.slice(idx + 3) };
}

export function joinClothingName(groupName, clothingName) {
  const group = String(groupName || '').trim();
  const name = String(clothingName || '').trim();
  if (!group) return name;
  if (!name) return group;
  return `${group} - ${name}`;
}

function groupOrder(name) {
  const num = Number(String(name).split('.')[0]);
  return Number.isFinite(num) ? num : 999;
}

function buildStore() {
  const map = new Map();
  SEED.forEach(([clothingNo, fullName]) => {
    const { groupName, clothingName } = splitClothingName(fullName);
    if (!map.has(groupName)) {
      map.set(groupName, {
        id: groupOrder(groupName),
        groupName,
        items: [],
      });
    }
    map.get(groupName).items.push({
      id: clothingNo,
      clothingNo,
      clothingName,
      fullName,
      useYn: 'Y',
    });
  });
  return [...map.values()].sort((a, b) => a.id - b.id);
}

let store = null;

function ensureStore() {
  if (!store) store = buildStore();
  return store;
}

export function getMockClothingGroups() {
  return clone(ensureStore());
}

export function findMockClothingGroup(id) {
  const found = ensureStore().find((group) => String(group.id) === String(id));
  return found ? clone(found) : null;
}

export function saveMockClothingGroup(payload) {
  const groups = ensureStore();
  const groupName = String(payload.groupName || '').trim();
  const items = (payload.items || [])
    .map((row) => {
      const clothingName = String(row.clothingName || '').trim();
      if (!clothingName) return null;
      return {
        id: row.id || row.clothingNo || Date.now() + Math.floor(Math.random() * 1000),
        clothingNo: row.clothingNo == null || row.clothingNo === '' ? null : Number(row.clothingNo),
        clothingName,
        fullName: joinClothingName(groupName, clothingName),
        useYn: row.useYn === 'N' ? 'N' : 'Y',
      };
    })
    .filter(Boolean);

  const next = {
    id: payload.id || groupOrder(groupName) || Math.max(0, ...groups.map((group) => Number(group.id) || 0)) + 1,
    groupName,
    items,
  };

  const index = groups.findIndex((group) => String(group.id) === String(next.id));
  if (index >= 0) groups.splice(index, 1, next);
  else groups.push(next);
  groups.sort((a, b) => a.id - b.id);
  return clone(next);
}
