// 이 파일은 scripts/genPage.mjs 가 생성했다. (템플릿: scripts/templates/entityPopup.js.tpl)
/** __ENTITY__ 목록 ↔ 상세 폼 팝업: 창 열기 / 행 데이터 전달 / 저장 알림 */
export const FORM_CHANNEL = 'wms-__KEY__';
const STORAGE_PREFIX = 'wms:__KEY__Form:';

/** 목록에서 클릭한 행을 팝업에 넘긴다. 팝업은 이 값으로 먼저 그리고, 이어서 API 로 다시 조회한다 */
export function stashFormPayload(payload) {
  const token = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  localStorage.setItem(`${STORAGE_PREFIX}${token}`, JSON.stringify(payload));
  return token;
}

export function takeFormPayload(token) {
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

export function formUrl({ id, token }) {
  const base = import.meta.env.BASE_URL || '/';
  const path = `${base.endsWith('/') ? base : `${base}/`}popup/__POPUP_PATH__`;
  const url = new URL(path, window.location.origin);
  if (id != null && id !== '') url.searchParams.set('id', String(id));
  if (token) url.searchParams.set('token', token);
  return url.toString();
}

export function openFormWindow(href) {
  // 개발 중 IntelliJ 디버깅용: .env.development 에 VITE_POPUP_SAME_TAB=true 면 새 창 대신 같은 탭으로 연다
  // (window.open 으로 뜬 창은 IntelliJ 브레이크가 걸리지 않는다. 운영 빌드에서는 항상 새 창)
  if (import.meta.env.DEV && import.meta.env.VITE_POPUP_SAME_TAB === 'true') {
    const url = new URL(href);
    window.location.assign(`${url.pathname}${url.search}`);
    return window;
  }

  const width = 720;
  const height = 720;
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

  const popup = window.open(href, 'wms__ENTITY__Form', features);
  popup?.focus();
  return popup;
}
