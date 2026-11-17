/** 주문상세 팝업과 목록 창 사이의 통신 키 */
export const ORDER_DETAIL_STORAGE_PREFIX = 'wms:orderDetail:';

export function stashOrderDetailPayload(payload) {
  const token = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  localStorage.setItem(`${ORDER_DETAIL_STORAGE_PREFIX}${token}`, JSON.stringify(payload));
  return token;
}

export function takeOrderDetailPayload(token) {
  if (!token) return null;
  const key = `${ORDER_DETAIL_STORAGE_PREFIX}${token}`;
  const raw = localStorage.getItem(key);
  localStorage.removeItem(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function orderDetailUrl({ orderNo, token }) {
  const base = import.meta.env.BASE_URL || '/';
  const path = `${base.endsWith('/') ? base : `${base}/`}popup/order-detail`;
  const url = new URL(path, window.location.origin);
  if (orderNo) url.searchParams.set('orderNo', orderNo);
  if (token) url.searchParams.set('token', token);
  return url.toString();
}

export function openOrderDetailWindow(href) {
  const width = 1280;
  const height = 860;
  const offset = (Date.now() % 8) * 24;
  const left = Math.max(0, Math.round(window.screenX + (window.outerWidth - width) / 2) + offset);
  const top = Math.max(0, Math.round(window.screenY + (window.outerHeight - height) / 2) + offset);
  const features = [
    `width=${width}`,
    `height=${height}`,
    `left=${left}`,
    `top=${top}`,
    'menubar=no',
    'toolbar=no',
    'location=no',
    'status=no',
    'resizable=yes',
    'scrollbars=yes',
  ].join(',');

  const name = `wmsOrderDetail_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
  const popup = window.open(href, name, features);
  popup?.focus();
  return popup;
}
