const STORAGE_PREFIX = 'wms:orderBoxSplit:';

export function stashBoxSplitPayload(payload) {
  const token = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  localStorage.setItem(`${STORAGE_PREFIX}${token}`, JSON.stringify(payload));
  return token;
}

export function takeBoxSplitPayload(token) {
  if (!token) return null;
  const key = `${STORAGE_PREFIX}${token}`;
  const raw = localStorage.getItem(key);
  localStorage.removeItem(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function boxSplitUrl(token) {
  const base = import.meta.env.BASE_URL || '/';
  const path = `${base.endsWith('/') ? base : `${base}/`}popup/order-box-split`;
  const url = new URL(path, window.location.origin);
  if (token) url.searchParams.set('token', token);
  return url.toString();
}

export function openBoxSplitWindow(href) {
  if (import.meta.env.DEV && import.meta.env.VITE_POPUP_SAME_TAB === 'true') {
    const url = new URL(href);
    window.location.assign(`${url.pathname}${url.search}`);
    return window;
  }

  const width = 1280;
  const height = 800;
  const left = Math.max(0, Math.round(window.screenX + (window.outerWidth - width) / 2));
  const top = Math.max(0, Math.round(window.screenY + (window.outerHeight - height) / 2));
  const popup = window.open(
    href,
    'wmsOrderBoxSplit',
    `width=${width},height=${height},left=${left},top=${top},menubar=no,toolbar=no,location=no,status=no,resizable=yes,scrollbars=yes`
  );
  popup?.focus();
  return popup;
}
