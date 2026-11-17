/**
 * Firebase 초기화
 *
 * 설정값은 .env 의 VITE_FIREBASE_* 로 주입한다.
 * 값이 비어 있으면 초기화를 건너뛰므로, Firebase 없이도 앱은 정상 동작한다.
 *
 * Analytics 는 브라우저 지원 여부(isSupported)를 확인한 뒤에만 켠다.
 * 광고 차단기나 쿠키를 못 쓰는 환경에서 초기화가 실패할 수 있다.
 */
import { initializeApp } from 'firebase/app';
import { getAnalytics, isSupported, logEvent, setUserId } from 'firebase/analytics';

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

/** 설정이 채워져 있는지 (미설정 환경에서 조용히 비활성화하기 위한 플래그) */
export const isFirebaseConfigured = Boolean(firebaseConfig.apiKey && firebaseConfig.projectId);

export const firebaseApp = isFirebaseConfigured ? initializeApp(firebaseConfig) : null;

// 개발 중에는 통계가 오염되지 않도록 기본 비활성. .env 의 플래그로 강제할 수 있다.
const analyticsFlag = import.meta.env.VITE_FIREBASE_ANALYTICS;
const analyticsEnabled =
    analyticsFlag === 'true' || (import.meta.env.PROD && analyticsFlag !== 'false');

let analytics = null;

/** Analytics 인스턴스 (초기화 전이거나 비활성이면 null) */
export const getAnalyticsInstance = () => analytics;

/** main.js 에서 한 번만 호출한다. 실패해도 앱 실행을 막지 않는다. */
export async function initAnalytics() {
    if (analytics) return analytics;
    if (!firebaseApp || !firebaseConfig.measurementId || !analyticsEnabled) return null;

    try {
        if (!(await isSupported())) return null;
        analytics = getAnalytics(firebaseApp);
    } catch (error) {
        console.warn('[firebase] Analytics 초기화를 건너뜁니다.', error);
    }
    return analytics;
}

/** 커스텀 이벤트 기록 (Analytics 가 꺼져 있으면 무시) */
export function logAppEvent(name, params = {}) {
    if (analytics) logEvent(analytics, name, params);
}

/** SPA 라우팅은 자동 수집되지 않으므로 화면 전환 시 직접 기록한다. */
export function logScreenView(screenName, path) {
    logAppEvent('screen_view', { firebase_screen: screenName, screen_path: path });
}

/** 로그인/로그아웃 시 사용자 식별자 연결 (로그아웃은 null) */
export function setAnalyticsUser(userId) {
    if (analytics) setUserId(analytics, userId ?? null);
}
