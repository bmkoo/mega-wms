# i-WMS (Vue 3 Boilerplate)

창고관리시스템(WMS) 프론트엔드 뼈대입니다. `vue3-rms` 프로젝트와 동일한 스택/디렉터리 컨벤션을 사용합니다.

- **상단**: 로고 + 대메뉴(`MyMenu` / `Seller` / `WMS` / `기타메뉴` / `원격지원`) + 사용자 유틸(환경설정/로그아웃), 그 아래 사용자 정보 + 작업 창고 선택
- **좌측**: 클릭한 대메뉴에 속한 중메뉴(아코디언) → 소메뉴 계층 + 메뉴 검색 + 즐겨찾기
- **우측**: 열린 화면 탭 → 페이지 제목/브레드크럼 → 컨텐츠

## 실행

```bash
npm install
npm run dev
```

기본 주소는 `http://localhost:5174/` 입니다.

`.env` 의 `VITE_USE_MOCK=true` 상태에서는 백엔드 없이도 동작합니다. 로그인 화면에서
아이디/비밀번호를 아무 값으로 입력하면 ADMIN 권한으로 진입하며, 목록 화면은 샘플 데이터를 표시합니다.
실제 서버에 연결할 때는 `VITE_USE_MOCK=false` 로 바꾸고 `VITE_API_URL` 을 설정하세요.
(서버 주소는 로그인 화면 하단 또는 상단 환경설정에서도 변경할 수 있으며 localStorage 에 저장됩니다.)

## 스크립트

| 명령                     | 설명                                  |
| ------------------------ | ------------------------------------- |
| `npm run dev`            | 개발 서버                             |
| `npm run build`          | 프로덕션 빌드 (`dist/`)               |
| `npm run preview`        | 빌드 결과 미리보기                    |
| `npm run check:menu`     | 메뉴 설정/i18n 정합성 점검            |
| `npm run deploy`         | 빌드 후 Firebase Hosting 배포         |
| `npm run deploy:preview` | 빌드 후 임시 미리보기 채널 배포       |

## 배포 (Firebase Hosting)

`firebase.json` / `.firebaserc` 가 이미 포함되어 있어 `firebase init` 은 다시 하지 않아도 됩니다.

```bash
firebase login          # 처음 한 번만
npm run deploy          # vite build + firebase deploy --only hosting
```

- 프로젝트: `amrlabs-wms` (`.firebaserc` 의 default)
- 배포 URL: `https://amrlabs-wms.web.app`
- Vue Router history 모드를 위해 모든 경로를 `/index.html` 로 rewrite 합니다
- 해시가 붙는 `assets/**` 는 1년 캐시, `index.html` 은 `no-cache` 로 설정해
  배포 직후에도 이전 화면이 캐시에 남지 않게 했습니다

리뷰용 임시 URL이 필요하면 `npm run deploy:preview` 를 쓰세요 (7일 후 자동 만료).
운영 배포를 되돌릴 때는 `firebase hosting:rollback` 입니다.

도메인 루트에서 서비스하는 것을 전제로 `vite.config.js` 의 `base` 가 `/` 입니다.
`/wms/` 같은 하위 경로로 배포할 때는 `base` 를 그 경로로 바꿔야 에셋 404가 나지 않습니다.

## 디렉터리 구조

```
src/
├── App.vue                     # ConfigProvider + 전역 로딩/알림
├── main.js                     # 플러그인 등록, 전역 속성($api/$cf/$fnc)
├── axios.js
├── assets/css/
│   ├── style.css               # 디자인 토큰(CSS 변수) + 유틸 클래스
│   └── antd.css                # ant-design-vue 밀도 오버라이드
├── common/utils/
│   ├── apiFunctions.js         # REST 래퍼 + onApi* 도메인 메서드
│   └── commonFunction.js       # 포맷/엑셀/쿼리 유틸
├── config/menuConfig.js        # 대·중·소메뉴 정의 (라우트 생성의 기준)
├── i18n/                       # ko / en 메시지
├── layouts/full-page/
│   ├── FullPageWithFrame.vue   # 프레임 있는 레이아웃 (업무 화면)
│   └── FullPageWithOutFrame.vue# 프레임 없는 레이아웃 (로그인)
├── router/index.js             # 메뉴 기반 라우트 생성 + 인증/권한 가드
├── store/
│   ├── appStore.js             # 사용자·서버 설정·작업 창고
│   └── menuStore.js            # 대메뉴 선택, LNB 상태, 열린 탭
└── views/
    ├── components/
    │   ├── fnc.js              # format(), useLoading(), 업무 상수
    │   └── Frame/              # AppHeader / AppUserBar / AppSideBar / AppStackTab / AppPageHead / AppFooter / AppSetting
    └── pages/
        ├── PgLogin.vue
        ├── PgDashboard.vue
        ├── PgReady.vue         # 화면이 아직 없는 메뉴의 기본 페이지
        ├── PgNotAuthorized.vue
        ├── Inbound/PgInboundPlan.vue   # 목록 + 등록/수정/삭제 + 엑셀 패턴
        └── Stock/PgStockStatus.vue     # 조회 전용 목록 패턴
```

## 화면 추가 방법

1. `src/views/pages/` 아래에 `Pg*.vue` 파일을 만듭니다.
   (`Inbound/PgInboundPlan.vue` 를 복사해 시작하면 조회·등록·엑셀 패턴이 그대로 들어옵니다.)
2. `src/config/menuConfig.js` 의 해당 중메뉴 `children` 에 소메뉴를 추가합니다.

```js
{ path: 'inboundList', nameKey: 'menu.inboundList', component: 'Inbound/PgInboundList', roles: ALL_ROLES }
```

- `path` → 라우트 name (URL 은 kebab-case 로 자동 변환)
- `nameKey` → `i18n/i18nData.js` 의 `menu.*` 키
- `component` → `src/views/pages` 기준 상대 경로 (생략하면 준비중 화면)
- `roles` → 접근 가능한 권한. 권한이 없으면 메뉴에 노출되지 않고 라우터 가드가 차단합니다.

3. `i18nData.js` 의 `ko.menu` / `en.menu` 에 메뉴명을 추가합니다.

라우트는 `menuConfig.js` 에서 자동 생성되므로 `router/index.js` 는 수정할 필요가 없습니다.

## Firebase

`firebase` npm 패키지를 쓰고, 설정은 `.env` 의 `VITE_FIREBASE_*` 로 주입합니다.
초기화 코드는 `src/firebase.js` 한 곳에 모여 있고 `main.js` 에서 마운트 직후 호출합니다.

```js
import { firebaseApp, logAppEvent } from '@/firebase';

logAppEvent('inbound_confirm', { count: 12 });
```

- 값이 비어 있으면 초기화를 건너뛰므로 Firebase 없이도 앱은 그대로 동작합니다
- Analytics 는 운영 빌드에서만 자동으로 켜집니다. `VITE_FIREBASE_ANALYTICS` 로 강제 on/off
- SPA 는 화면 전환이 자동 수집되지 않아 라우터 `afterEach` 에서 `screen_view` 를 직접 보냅니다
- 로그인/로그아웃 시 `setUserId` 로 사용자 식별자를 연결합니다
- Auth, Firestore 등을 추가할 때는 `firebase/auth` 처럼 필요한 모듈만 import 하세요
  (Firebase SDK 는 모듈 단위로 트리셰이킹됩니다)

웹 클라이언트 설정값은 번들에 그대로 노출되는 공개 식별자입니다.
실제 접근 제어는 Firebase 보안 규칙과 API 키 제한(HTTP 리퍼러)으로 하세요.

## 메뉴 정합성 점검

```bash
npm run check:menu
```

`src/config/menuConfig.js` 와 `src/i18n/i18nData.js` 를 대조해서 라우트 name/URL 중복,
중메뉴 key 중복, ko/en 번역 누락을 잡아줍니다. 메뉴를 추가한 뒤 실행하세요.

## 메뉴 즐겨찾기

좌측 메뉴 항목에 마우스를 올리면 나타나는 별, 또는 페이지 제목 옆의 별로 추가/해제합니다.
즐겨찾기한 메뉴는 `MyMenu` 대메뉴의 LNB 최상단 `즐겨찾기` 그룹에 등록한 순서대로 표시됩니다.

- 저장 위치: `localStorage`의 `favorites:{loginId}` (사용자별로 분리)
- 권한이 없는 메뉴는 즐겨찾기에 남아 있어도 화면에 노출되지 않습니다
- 메뉴 구성에서 삭제된 항목은 불러올 때 자동으로 정리됩니다
- 상태와 로직은 `src/store/menuStore.js`의 `favorites` / `toggleFavorite()` / `loadFavorites()`

`즐겨찾기` 그룹은 사용자 데이터로 채워지므로 `menuConfig.js`의 `MENUS` 에는 없고,
`FAVORITE_GROUP` 정의를 `AppSideBar.vue` 에서 MyMenu 트리 앞에 붙이는 방식입니다.

## 화면에서 쓰는 전역 속성

```js
const { proxy } = getCurrentInstance();

proxy.$api.onApiQueryStock(params); // REST 호출
proxy.$cf.fncComma(1234567); // "1,234,567"
proxy.$fnc.format('menu.dashboard'); // i18n 메시지
proxy.$message.success('저장되었습니다.');
```

## 스택

Vue 3.5 · Vite 7 · Pinia · vue-router · vue-i18n · ant-design-vue 4 · axios · dayjs · ApexCharts · Handsontable · SheetJS(xlsx)
