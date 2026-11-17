/** 메모 신규/변경 팝업과 목록 창 사이의 통신 키 */
export const MEMO_FORM_CHANNEL = 'wms-order-memo';
export const MEMO_FORM_STORAGE_PREFIX = 'wms:orderMemoForm:';

export function stashMemoFormPayload(payload) {
  const token = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  localStorage.setItem(`${MEMO_FORM_STORAGE_PREFIX}${token}`, JSON.stringify(payload));
  return token;
}

export function takeMemoFormPayload(token) {
  if (!token) return null;
  const key = `${MEMO_FORM_STORAGE_PREFIX}${token}`;
  const raw = localStorage.getItem(key);
  localStorage.removeItem(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function memoFormUrl({ mode, id, token }) {
  const base = import.meta.env.BASE_URL || '/';
  const path = `${base.endsWith('/') ? base : `${base}/`}popup/order-memo`;
  const url = new URL(path, window.location.origin);
  url.searchParams.set('mode', mode);
  if (id != null && id !== '') url.searchParams.set('id', String(id));
  if (token) url.searchParams.set('token', token);
  return url.toString();
}

export function openMemoFormWindow(href) {
  const width = 680;
  const height = 560;
  const left = Math.max(0, Math.round(window.screenX + (window.outerWidth - width) / 2));
  const top = Math.max(0, Math.round(window.screenY + (window.outerHeight - height) / 2));
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

  const popup = window.open(href, 'wmsOrderMemoForm', features);
  popup?.focus();
  return popup;
}
