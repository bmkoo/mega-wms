/** 주문상세 화면 확인용 임시 데이터 */

function formatInputInfo(row) {
  const date = row?.inputDate || '';
  return `${date} 11:41:32 ${row?.inputUser || ''}`.trim();
}

function toMemoLog(row, index) {
  const date = row.inputDate || '';
  const pretty = date.length === 8 ? `${date.slice(0, 4)}/${date.slice(4, 6)}/${date.slice(6, 8)}` : date;
  return {
    id: row.id,
    no: index + 1,
    inputAt: `${pretty} 11:55:25`,
    alarmAt: '',
    inputUser: row.inputUser || '',
    memoType: row.memoType,
    content: row.content || '',
    status: row.status,
    doneAt: row.processDate ? `${pretty} 11:55:25` : '',
  };
}

export function createMockOrderDetail(memoRow = {}, memos = []) {
  const orderNo = memoRow.orderNo || 'Z00000000000000';
  const logs = (memos.length ? memos : [memoRow].filter((row) => row?.id)).map(toMemoLog);

  return {
    orderNo,
    channel: memoRow.channel || '메가커피',
    orderer: memoRow.orderer || '',
    receiver: memoRow.receiver || memoRow.orderer || '',
    email: '네이버페이',
    ordererTel: '',
    ordererPhone: '010-5354-2498',
    receiverTel: '--',
    receiverPhone: '010-5354-2498',
    smsRemain: 0,
    zip: '49063',
    address: '부산광역시 영도구 절영로49번길',
    addressDetail: '기타추가주소 : 32 (남항동1가) 위드카페',
    deliveryMemo: '',
    inputInfo: formatInputInfo(memoRow),
    items: [
      {
        no: 1,
        kind: '주문',
        sku: 'G0000059570',
        color: 'FREE',
        size: 'FREE',
        inputDate: memoRow.inputDate || '',
        name: '세미 베버시티 고구마라떼 페이스',
        stock: 1013,
        qty: 1,
        price: 7980,
        cost: 7700,
        settle: 7980,
        warehouse: '1.[선불]',
        channelOrderNo: '2609151128306174/405050599',
        memo: '품질메모: 증료 소잔두 증정,할인행사종료,가격수정 260331까지10+1 -3% 가격수정 26.06.17 1PL(68박스)',
        option: '후처리리 스트로우 추가',
        cancelled: false,
      },
      {
        no: 1,
        kind: '취소',
        sku: 'G0000059570',
        color: 'FREE',
        size: 'FREE',
        inputDate: memoRow.inputDate || '',
        name: '세미 베버시티 고구마라떼 페이스',
        stock: 1013,
        qty: -1,
        price: -7980,
        cost: -7700,
        settle: -7980,
        warehouse: '1.[선불]',
        channelOrderNo: '',
        memo: '',
        option: '',
        cancelled: true,
      },
    ],
    memos: logs.reverse(),
  };
}
