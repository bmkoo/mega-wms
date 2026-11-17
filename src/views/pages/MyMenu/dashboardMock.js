/** 대시보드(출고상태보기) 화면 확인용 임시 데이터 */
import dayjs from 'dayjs';

const CHANNELS = [
  ['메가커피', 26916, 123230990],
  ['네이버 체크아웃', 12829, 63236940],
  ['네이버스토어팜', 123, 9687950],
  ['쿠팡', 646, 5412900],
  ['카페24', 566, 4821895],
  ['이커머', 421, 2244920],
  ['11번가', 101, 822180],
  ['옥션', 98, 726200],
  ['롯데온', 50, 344500],
  ['위메프', 26, 251100],
  ['GS홈쇼핑', 22, 211900],
];

const BRANDS = [
  ['이디야커피', 9027, 16948753],
  ['하트만', 6581, 11743120],
  ['1080커피소스', 3657, 9957357],
  ['세원', 860, 9145166],
  ['노란컵', 1847, 8305409],
  ['오가닉', 844, 6425109],
  ['강릉 메가커피', 360, 3697890],
  ['할리스', 754, 3192800],
  ['모나', 554, 1176959],
  ['타코', 554, 5449060],
  ['유어컵/주점', 2510, 7035765],
  ['동서', 695, 4082011],
  ['런던백작', 521, 4043593],
  ['맥심애', 417, 4205229],
  ['스트로우/스틱', 1233, 3773626],
  ['가리대컵', 729, 3731820],
  ['핫초코', 680, 3576903],
  ['핫앤', 442, 3477650],
  ['와라/티라노', 257, 2169100],
  ['와라', 218, 1737490],
  ['대상', 210, 1744400],
  ['잔잔대', 178, 1598277],
  ['최재이', 226, 1540979],
  ['기타', 143, 1522232],
  ['조은', 159, 1517227],
  ['시즌드럭스', 152, 1418990],
  ['잔잔대믹스', 141, 1397200],
  ['와', 146, 1291900],
  ['베러드링크', 165, 1274097],
  ['나무주스', 136, 1171439],
  ['디칸테', 119, 1156800],
  ['그라데이션', 98, 980400],
  ['카페봉봉', 87, 872100],
  ['밀크티', 76, 761500],
  ['콜드브루', 71, 698200],
  ['원두', 64, 640800],
  ['시럽', 58, 512300],
  ['컵홀더', 52, 430100],
  ['리드', 47, 389000],
  ['스트로우', 41, 312400],
  ['냅킨', 33, 210900],
];

function rankRows(list) {
  return list.map(([name, qty, amount], index) => ({
    seq: index + 1,
    name,
    qty,
    amount,
  }));
}

export function getMockDashboard({ startDate, endDate } = {}) {
  const start = dayjs(String(startDate || '').replace(/-/g, '') || undefined);
  const end = dayjs(String(endDate || '').replace(/-/g, '') || undefined);
  const from = (start.isValid() ? start : dayjs()).startOf('day');
  const to = (end.isValid() ? end : from).startOf('day');
  const first = from.isAfter(to) ? to : from;
  const last = from.isAfter(to) ? from : to;

  const statusRows = [];
  for (let cursor = first; !cursor.isAfter(last); cursor = cursor.add(1, 'day')) {
    const date = cursor.format('YYYYMMDD');
    statusRows.push(
      {
        allocDate: date,
        packType: 'together',
        orderDemand: 257,
        orderPrinted: 254,
        orderUnprinted: 63,
        orderConfirmed: 2271,
        orderUnconfirmed: 1164,
        orderUnclosed: 3435,
        itemDemand: 44504,
        itemPrinted: 43811,
        itemUnprinted: 713,
        itemScanned: 34946,
        itemUnscanned: 9538,
        itemConfirmed: 34946,
        itemUnconfirmed: 9538,
      },
      {
        allocDate: date,
        packType: 'total',
        orderDemand: 3632,
        orderPrinted: 3626,
        orderUnprinted: 66,
        orderConfirmed: 2430,
        orderUnconfirmed: 1272,
        orderUnclosed: 3632,
        itemDemand: 44701,
        itemPrinted: 44015,
        itemUnprinted: 706,
        itemScanned: 35095,
        itemUnscanned: 9606,
        itemConfirmed: 35095,
        itemUnconfirmed: 9578,
      }
    );
    if (statusRows.length >= 62) break;
  }

  return {
    statusRows,
    channels: rankRows(CHANNELS),
    brands: rankRows(BRANDS),
  };
}
