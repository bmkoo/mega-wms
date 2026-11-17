import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router/index';
import i18n from './i18n/i18n';

// ─────────────────────────────────────────────
// 스타일
// ─────────────────────────────────────────────
import 'ant-design-vue/dist/reset.css';
import 'vue-loading-overlay/dist/css/index.css';
import 'handsontable/styles/handsontable.css';
import 'handsontable/styles/ht-theme-main.css';
import './assets/css/style.css';
import './assets/css/antd.css';

// ─────────────────────────────────────────────
// 외부 라이브러리
// ─────────────────────────────────────────────
import Antd, { Modal, message } from 'ant-design-vue';
import * as Icons from '@ant-design/icons-vue';
import Notifications from '@kyvg/vue3-notification';
import VueApexCharts from 'vue3-apexcharts';
import Loading from 'vue-loading-overlay';

// ─────────────────────────────────────────────
// 공통 유틸 / API
// ─────────────────────────────────────────────
import * as fnc from '@/views/components/fnc';
import commonFunction from '@/common/utils/commonFunction';
import apiFunctions from '@/common/utils/apiFunctions';
import axios from './axios.js';
import { initAnalytics } from './firebase.js';

const app = createApp(App);

app.use(createPinia());
app.use(router);
app.use(i18n);

// ─────────────────────────────────────────────
// 플러그인 / 전역 컴포넌트
// ─────────────────────────────────────────────
app.use(Antd);
app.use(Notifications);
app.use(VueApexCharts);
app.component('Loading', Loading);

// 아이콘 컴포넌트만 등록 (setTwoToneColor 등 유틸 export 는 제외)
Object.keys(Icons).forEach((key) => {
    if (/^[A-Z]/.test(key)) app.component(key, Icons[key]);
});

// ─────────────────────────────────────────────
// 전역 속성
// ─────────────────────────────────────────────
app.config.globalProperties.$fnc = fnc;
app.config.globalProperties.$cf = commonFunction;
app.config.globalProperties.$api = apiFunctions;
app.config.globalProperties.$http = axios;
app.config.globalProperties.$confirm = Modal.confirm;
app.config.globalProperties.$info = Modal.info;
app.config.globalProperties.$success = Modal.success;
app.config.globalProperties.$message = message;

// ─────────────────────────────────────────────
// 서버 설정 (localStorage 우선, 없으면 .env 값)
// ─────────────────────────────────────────────
const ip = localStorage.getItem('ip') || import.meta.env.VITE_API_URL;
const apiUrl = localStorage.getItem('axios') || `http://${ip}:8802/`;

localStorage.setItem('ip', ip);
localStorage.setItem('axios', apiUrl);

app.config.globalProperties.$config = { ip, apiUrl };

app.mount('#app');

// index.html 의 초기 로딩 화면 제거
document.getElementById('loading-bg')?.remove();

// 첫 렌더를 막지 않도록 마운트 이후에 붙인다.
initAnalytics();
