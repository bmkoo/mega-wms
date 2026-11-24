# i-WMS 프론트엔드 작업 노트

지금까지의 구성·결정·미해결 사항을 한곳에 모은 문서. (최종 정리: 2026-11-22)
화면 생성기 상세는 [`scripts/examples/README.md`](../scripts/examples/README.md), 생성 이력은 [`scripts/genPage.log.md`](../scripts/genPage.log.md).

---

## 1. 구성

| 구분 | 내용 |
|---|---|
| 프론트 | Vue 3 + Vite (개발 서버 5174), ant-design-vue, Handsontable 16, Pinia, vue-i18n(ko/en) |
| 백엔드 | 별도 프로젝트 `workspace-20260520/backend` (ax-boot, Spring, JDK 21, MariaDB). dev = `http://localhost:8802` |
| 저장소 | `https://github.com/bmkoo/mega-wms.git` (main) |

### 백엔드 연동
- 로그인: `POST /api/v1/auth/login` `{ username, password }` → 응답 body 의 `token` → 이후 요청 `Authorization: Bearer <token>`
- API 주소: 로그인 화면 서버설정 또는 localStorage `axios` = `http://127.0.0.1:8802/api/` (apiFunctions 의 `v1/...` 앞에 붙는다)
- 목록 응답은 `{ list, page }`. **NULL 필드는 JSON 에서 키가 빠진다.**
- ⚠️ 백엔드 Service 의 `gets()` 가 `findAll()` 만 호출해 **조회 조건을 무시**하는 곳이 많다. 조건이 안 먹으면 Service 부터 확인.
  (OrderRaw 는 `buildPredicate()` 사용으로 수정함)
- ⚠️ `@RequestMapping` 추가·삭제는 백엔드 **재시작**해야 반영된다 (HotSwap 불가). 새 API 가 404 면 재시작 여부부터.
- ⚠️ dev 프로필은 토큰이 없어도 `/api/**` 를 system 권한으로 통과시키는 개발용 우회가 있다. 운영 전 제거.

---

## 2. 주요 파일

| 파일 | 역할 |
|---|---|
| `src/common/utils/apiFunctions.js` | 모든 REST 호출. `onApi<동작><Entity>` 메서드. 하단 "자동 생성 조회 API" 구역은 생성기가 추가 |
| `src/config/menuConfig.js` | 대메뉴 → 중메뉴 → 소메뉴. 소메뉴 `path` = 라우트 name, `component` = `src/views/pages/` 하위 경로 |
| `src/router/index.js` | 메뉴 라우트 자동 생성 + `/popup/...` 팝업 라우트 (생성기가 추가). 로그인 후 공통코드 미리 로드 |
| `src/store/commonCodeStore.js` | 공통코드(`/api/v1/commonCodes?useYn=Y`)를 groupCd 별로 보관. `options(group)`, `name(group, code)` |
| `src/i18n/i18nData.js` | ko/en 라벨. 그리드 헤더·검색 라벨은 `field.<필드명>`, 메뉴는 `menu.<key>` |
| `scripts/genPage.mjs` + `scripts/templates/*.tpl` | 엔티티 → 화면 생성기 |
| `scripts/checkMenu.mjs` | 메뉴 정합성 검사 (`npm run check:menu`) |
| `.env`, `.env.development` | Vite 환경변수 (**git 제외**, 키 포함 — 커밋 금지). `.env.development` 는 개발 서버에서만 읽힌다 |

---

## 3. 화면 생성기 요약 (`scripts/genPage.mjs`)

```bash
node /Users/bmkoo/IdeaProjects/i-wms-new/scripts/genPage.mjs <Entity.java> --menu BMKOO_L2_MENU [--popup] [--code-status] [--keep] [--dry-run]
```

| 결정 사항 | 내용 |
|---|---|
| 덮어쓰기 | 기본은 화면 파일 **덮어쓰기**. 직접 고친 화면은 반드시 `--keep` (아래 4절 목록) |
| API 관례 | 목록 `onApiQuery<Entity>` GET `v1/<key>` / 단건 `onApiGet<Entity>(id)` GET `v1/<key>/${id}` (복합키 `"a,b"`) / 저장 `onApiSave<Entity>` POST `v1/<key>/save`. 같은 이름·다른 주소면 중단 → `--api-name`, 주소는 `--api` |
| 공통코드 | `--code-status`: `@Column(name)` 이 **`_CODE`** 로 끝나는 문자열 = 공통코드 (그룹명 = 컬럼명). `ZIP_CODE`·`*PRODUCT_CODE`·`HS_CODE` 가 있는 Order/Channel/OrderRaw 에는 쓰지 않는다 |
| 화면 동작 | 검색조건 한 행 4개, 숫자 1000단위 콤마(@Id 제외), 날짜 기간검색, 공통코드 선택상자, 엑셀 = 화면값 |
| 폴더 | 기본 = 대메뉴 key (SYSTEM → `System/`). 현재 주로 쓰는 중메뉴 `BMKOO_L2_MENU` |
| 작업 로그 | 실행마다 `scripts/genPage.log.md` 에 자동 누적 (`--no-log` 로 끔) |
| 팝업 디버깅 | `.env.development` 에 `VITE_POPUP_SAME_TAB=true` → 개발 서버에서만 팝업을 같은 탭으로 (IntelliJ 브레이크 가능) |

검증: 생성 후 `npm run check:menu`, `npx vite build`.

---

## 4. 직접 수정한 화면 (재생성 시 `--keep` 필수)

| 화면 | 직접 추가한 내용 |
|---|---|
| `System/PgProductForm.vue` | 상품 세트 구성품 그리드 (`onApiQueryProductComponent` → `v1/productComponentList`, 화면에서 productCdOrigin 필터) |
| `System/PgProduct.vue` | 목록 API `onApiGetMegaProduct` → `v1/productList` |
| `System/PgOrderRaw.vue` | [데이터이관] 버튼(`onApiOrderRawMove` → POST `v1/orderRawMove`, 현재 조회조건 전송), 주문채널 선택상자(채널 useYn=Y), 주문구분(전체/샵링커/자사몰) |
| `System/PgErrorLog.vue` | 행 높이 23px (`--ht-line-height` 18px, `--ht-cell-vertical-padding` 2px) |
| `System/*` 공통 | apiFunctions 메서드명을 생성기 관례로 정리함 (`onApiQueryUser` 등) |

---

## 5. 미해결 / 결정 필요

| # | 내용 | 비고 |
|---|---|---|
| 1 | 주문원본 `orderChannel`(이름) ↔ 채널목록 `channelNm` 불일치. 쿠팡·11번가만 일치 | channelId 저장 / 이름 정리 / 별칭 컬럼 중 선택 |
| 2 | `productComponentList`(6MB)·`productList`(30MB) 가 조건 무시 → 전체 전송 | 백엔드 Service 에 조건 추가 |
| 3 | `/api/v1/orderRawMove` 구현함 (OrderRawService.moveToOrder, 네이티브 INSERT…SELECT, 한 트랜잭션). **백엔드 재시작 후 실행 확인 필요** | 아래 7절 참고 |
| 4 | 백엔드 `OrderRawService` 수정분(주문구분 DB 처리) 반영 확인 | 재시작 후 `?orderSource=SHOPLINKER` = 2,877건 기대 |
| 5 | User 응답·화면에 비밀번호 해시 `userPs` 노출 | 화면 FIELDS 제거 + 백엔드 `@JsonIgnore` |
| 6 | 공통코드 다국어 | `NAME_EN` 컬럼(권장) 또는 `DATA1` 임시 사용 |
| 7 | 그리드 컬럼 헤더가 언어 전환에 반응하지 않음 | locale watch → `updateSettings({ colHeaders })` |
| 8 | `_CODE` 공통코드 그룹이 아직 없음 | 컬럼명과 같은 groupCd 로 등록 |
| 9 | `scripts/genPage.log.md` 커밋 여부 | 팀 공유면 유지, 개인용이면 .gitignore |

---

## 6. 데이터 이관 규칙 (TB_ORDER_RAW → TB_ORDER / TB_ORDER_ITEM)

| 항목 | 규칙 |
|---|---|
| 구분 | `SHOPLINKER_ORDER_NO` 있음 = 샵링커, NULL/빈 값 = 자사몰 (화면 주문구분 `orderSource` = SHOPLINKER / OWN_MALL / 없음=둘 다) |
| TB_ORDER | **ORDER_NO 당 1행**. 주문번호마다: TB_ORDER 확인 → `INSERT (ORDER_NO)` 로 키 발행 → 품목 INSERT → 주문 UPDATE (첫 원본 행 정보, **ITEM_COUNT = 품목 QTY 합계, ORDER_COUNT = 품목 행 수**) → 원본 Y |
| 금액 | 자사몰: PAID = BILL = SUM(MOBILE_APP_DISCOUNT_AMOUNT) / 샵링커: PAID = SUM(ORDER_AMOUNT), BILL = SUM(EXPECTED_SETTLEMENT_AMOUNT) (줄별 금액이라 합계) |
| 날짜 | ORDER_DATE = DATE(CREATED_AT), PRIVACY_PURGED_AT = DATE(CREATED_AT) + 10일 (`PRIVACY_KEEP_DAYS`) |
| TB_ORDER_ITEM | 원본 1행 = 1행, ORDER_ID = 이번에 넣은 주문, **LINE_NO = 주문마다 RAW_ID 순 1,2,3…**, 품번 = 자사몰 **OWN_PRODUCT_CODE** / 샵링커 CLIENT_PRODUCT_CODE (2026-11-22 기존 11,699건도 OWN_PRODUCT_CODE 로 수정, 백업 `~/IdeaProjects/db-backup/TB_ORDER_ITEM_PRODUCT_CD_before_20261122.csv`), IS_ASSIGN = 미할당 |
| 중복 | 이미 TB_ORDER 에 있는 ORDER_NO 는 건너뜀 (재실행 안전) |
| 전송여부 | 대상 = `TRANSFER_YN` 이 Y 가 아닌 원본. 이관한 원본은 `TRANSFER_YN = 'Y'` (화면 검색 기본값 N) |
| 묶음·트랜잭션 | **주문 100건씩** 묶어서 묶음마다 별도 트랜잭션(`OrderRawMoveBatchService.moveBatch`, REQUIRES_NEW): TB_ORDER INSERT + TB_ORDER_ITEM INSERT + TRANSFER_YN=Y. 품목 수 ≠ Y 처리 수면 그 묶음 롤백. 실패 시 앞 묶음은 커밋 유지 → 재실행하면 이어서 |
| 조건 | 화면 조건 중 orderSource, orderChannel(정확히 일치)만 사용 |

---

## 7. 개발 환경 메모

- 디버깅: IntelliJ `ScriptDebug`(JavaScript Debug, `http://localhost:5174`) 로 띄운 Chrome 에서만 브레이크가 걸린다. 팝업은 위 3절 설정 또는 Chrome DevTools "Auto-open DevTools for popups".
- push 는 HTTPS 토큰(PAT) 또는 `gh auth login` 필요.
