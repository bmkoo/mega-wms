# i-WMS 프론트엔드 작업 노트

지금까지의 구성·결정·미해결 사항을 한곳에 모은 문서. (최종 정리: 2026-11-24)
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
| `System/PgOrderRaw.vue` | 주문번호 단위 체크박스(헤더 = 현재 페이지 전체, 페이지를 넘겨도 체크 유지) + [데이터이관] 버튼(`onApiOrderRawMove` → POST `v1/orderRawMove`, body `{ orderNos: 체크한 주문번호 }`), 주문채널 선택상자(채널 useYn=Y), 주문구분(전체/샵링커/자사몰) |
| `System/PgStockAssign.vue` | **생성기로 만든 화면 아님** (직접 작성). 재고할당 — 아래 7절 |
| `System/PgErrorLog.vue` | 행 높이 23px (`--ht-line-height` 18px, `--ht-cell-vertical-padding` 2px) |
| `System/*` 공통 | apiFunctions 메서드명을 생성기 관례로 정리함 (`onApiQueryUser` 등) |

---

## 5. 미해결 / 결정 필요

| # | 내용 | 비고 |
|---|---|---|
| 1 | 주문원본 `orderChannel`(이름) ↔ 채널목록 `channelNm` 불일치. 쿠팡·11번가만 일치 | channelId 저장 / 이름 정리 / 별칭 컬럼 중 선택 |
| 2 | `productComponentList`(6MB)·`productList`(30MB) 가 조건 무시 → 전체 전송 | 백엔드 Service 에 조건 추가 |
| 3 | `/api/v1/orderRawMove` 는 체크한 주문번호만 이관하도록 변경함 (6절). **2026-11-22 15:29 백엔드 재시작 전에 실행한 이관은 예전 로직(구분·채널 조건의 미전송 원본 전체)** 이었으므로 TB_ORDER/TB_ORDER_ITEM 에 의도치 않은 주문이 있는지 확인 | 6절 |
| 4 | 백엔드 `OrderRawService` 수정분(주문구분 DB 처리) 반영 확인 | 재시작 후 `?orderSource=SHOPLINKER` = 2,877건 기대 |
| 5 | User 응답·화면에 비밀번호 해시 `userPs` 노출 | 화면 FIELDS 제거 + 백엔드 `@JsonIgnore` |
| 6 | 공통코드 다국어 | `NAME_EN` 컬럼(권장) 또는 `DATA1` 임시 사용 |
| 7 | 그리드 컬럼 헤더가 언어 전환에 반응하지 않음 | locale watch → `updateSettings({ colHeaders })` |
| 8 | `_CODE` 공통코드 그룹이 아직 없음 | 컬럼명과 같은 groupCd 로 등록 |
| 9 | `scripts/genPage.log.md` 커밋 여부 | 팀 공유면 유지, 개인용이면 .gitignore |
| 10 | 재고 코드값 공통코드 등록: `IO_DIR_CD` = IN/OUT, `IO_TYPE_CD` 에 `ADJUST`(실사조정)·`CANCEL`(취소) 필수 포함, 실사 `STATUS_CD` = DRAFT/CONFIRMED/CANCELED | 등록 예정 (8절) |
| 11 | `TB_INVENTORY`·`TB_INVENTORY_IO` 에 `CREATED_AT`·`CREATED_BY` 컬럼 필요 (엔티티가 `TranJpaModel` 상속) | 8절 ALTER |
| 12 | `PUT /api/v1/inventory` 는 재고 수량을 직접 수정한다 (입출고 이력 없음). 재고 ≠ 이력 합계면 이 경로부터 확인 | 직접 수정 용도로 유지하기로 결정 |
| 13 | 샵링커 주문수집 **실호출 미확인** — 환경변수·포트포워딩(22021→8802)·재시작 후 확인 | 9절 |
| 14 | 주문원본 화면에 [샵링커 수집] 버튼 없음 (API 만 있음) | 9절 |
| 15 | `TB_ORDER_RAW` 에 주문일시 컬럼 없음 → 샵링커 `orderdate` 는 저장 안 됨, 이관 ORDER_DATE = 수집 시각(CREATED_AT) | 필요하면 `ORDER_DATE` 컬럼 추가 + 이관 SQL 변경 |
| 16 | 재고할당 목록(`v1/stockAssignList`)은 조건에 맞는 전체를 한 번에 받는다 (서버 페이징 없음) | 주문이 많아지면 서버 페이징 |

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
| 대상 | **화면에서 체크한 주문번호(`orderNos`)만.** 검색 조건은 쓰지 않는다. 그 주문번호의 미전송 원본 행은 **전부** 이관(다른 페이지의 같은 주문 행 포함, 주문이 쪼개지지 않게). 체크가 없으면 화면에서 막고, 서버도 "선택한 주문번호가 없습니다" |
| 오류 보고 | 실패 시 서버 로그 `logger.error`(스택트레이스 포함) + 응답 `map.error`. **HTTP 응답은 성공**이므로 화면은 `map.error` 로 판단 |

---

## 7. 재고할당 화면 (`System/PgStockAssign.vue`, 메뉴 `stockAssign`)

| 항목 | 내용 |
|---|---|
| API | `onApiQueryStockAssign` → GET `v1/stockAssignList` (`OrderController` → `OrderService.stockAssignList`, 네이티브 쿼리) |
| 조회 | `TB_ORDER` ⋈ `TB_ORDER_ITEM` ⟕ `TB_PRODUCT` (품목 1개 = 1행), `ORDER_ID DESC, LINE_NO`. 응답 키는 camelCase (`ORDER_PRODUCT_NM` → `orderProductNm`) |
| 검색 (서버) | 주문번호·주문자·수령자 부분일치 / 채널 정확히 / 주문일 기간(`orderDateFrom/To` YYYYMMDD) / 품목수·결제·정산금액 Min~Max / **할당여부 `isAssign`·배송상태 `deliveryStatus` 정확히 일치** |
| 화면 | 그리드 1개, 왼쪽 3열 고정, 상품마스터 미매칭(`productMatchedYn = N`) 행 연주황, 엑셀 |
| i18n | `menu.stockAssign`, `field.orderProductNm`(판매처 원문), `field.masterProductNm`(마스터 상품명 — `productNm` 라벨을 이 화면에서만 대체), `field.productMatchedYn` |

---

## 8. 재고 (백엔드)

### 테이블 (DDL 은 대화에서 작성 — DB 적용 여부 확인)
| 테이블 | 내용 |
|---|---|
| `TB_INVENTORY` | 품번당 1행 (세트 품번은 행 없음, 구성품만). `AVAILABLE_QTY` = `CURRENT_QTY - ALLOCATED_QTY` **DB 계산 컬럼** (엔티티는 insertable/updatable=false). CHECK: 현재고 ≥ 0, 0 ≤ 할당 ≤ 현재고 |
| `TB_INVENTORY_IO` | 실물 이동 1건 = 1행. `QTY` 는 항상 양수(CHECK > 0), 방향은 `IO_DIR_CD`(IN/OUT). 수정·삭제하지 않고 취소 건으로 정정 |
| `TB_STOCKTAKE` / `TB_STOCKTAKE_ITEM` | 재고실사 헤더(상태 DRAFT/CONFIRMED/CANCELED, 대상창고 `LOCATION_WH`) / 상세(장부·실사수량, `DIFF_QTY` 계산 컬럼). **서비스 미구현** |
| `TB_INVENTORY_MONTHLY` | 월마감 (YM, 품번, 기초·입고·출고·조정, `END_QTY` 계산 컬럼). **서비스 미구현** |

추가 필요 (5절 #11):
```sql
ALTER TABLE TB_INVENTORY    ADD COLUMN CREATED_AT datetime NULL, ADD COLUMN CREATED_BY varchar(100) NULL;
ALTER TABLE TB_INVENTORY_IO ADD COLUMN CREATED_AT datetime NULL, ADD COLUMN CREATED_BY varchar(100) NULL;
```

### 결정 사항
- 창고는 여러 개지만 **`TB_PRODUCT.LOCATION_WH` 로 관리** (품번 1개 = 창고 1곳). 재고 PK = 품번
- **음수 재고 불허** (서비스에서 먼저 검사, DB CHECK 가 최종 방어)
- **세트상품은 구성품 재고 차감**: `SET_YN = 'Y'` 품번은 `TB_PRODUCT_COMPONENT` 로 구성품 × (수량 × 구성수량) 으로 풀어 처리. 하나라도 부족하면 전체 롤백
- 할당/할당해제는 실물 이동이 아니므로 이력 없이 `ALLOCATED_QTY` 만 변경

### `InventoryIOService`
| 메서드 | 동작 | 이력 |
|---|---|---|
| `inbound` | 현재고 + (재고 행 없으면 생성) | IN |
| `outbound` | 가용재고에서 현재고 − | OUT |
| `shipAllocated` | 할당분 출고: 현재고 −, 할당 − | OUT |
| `register` / `registerAll` | 여러 건 한 트랜잭션 (전부 또는 전부 롤백) | IN/OUT |
| `cancel(id)` | 반대 방향 `CANCEL` 건 추가 (이중 취소·취소의 취소 불가) | 반대 |
| `adjustTo` | 실사 반영: 차이만큼 `ADJUST` 건. 실사수량 < 할당이면 오류 | IN/OUT |
| `allocate` / `deallocate` | 할당수량만 변경 | 없음 |
| `getAvailableQty` / `getAvailableQtyMap` / `isAvailable` | 가용재고 (세트 = 만들 수 있는 세트 수) | 조회 |

- 트랜잭션: 변경 메서드는 `@Transactional(rollbackFor = Exception.class)` REQUIRED — 상위 트랜잭션(예: 주문 출고)에 합류
- 잠금: 재고 행 `SELECT … FOR UPDATE`, 여러 품번은 **품번 오름차순**으로 잠가 교착 방지
- 재고 행 없을 때: 입고·실사 증가는 `INSERT … ON DUPLICATE KEY UPDATE` 로 0 행 생성 후 잠금 (`INSERT IGNORE` 는 FK 오류까지 삼켜서 쓰지 않음). 출고·할당·해제는 "재고가 없습니다" 오류
- API (`InventoryController`): `PUT v1/inventoryio`(registerAll), `POST v1/inventoryio/ship`, `POST v1/inventoryio/{id}/cancel`, `POST v1/inventory/adjust`, `POST v1/inventory/allocate`, `POST v1/inventory/deallocate`, `GET v1/inventory/available?productCds=A,B`

---

## 9. 샵링커 주문수집 (백엔드)

| 항목 | 내용 |
|---|---|
| 파일 | `ShoplinkerService`(전체 로직) + `ShoplinkerController`. 인계서 `~/Documents/workspace-megacoffee/SHOPLINKER_HANDOFF.md` |
| 호출 방식 | 요청 XML 을 이 앱의 공개 주소 `GET /shoplinker/request/{token}.xml` 에 1회용 랜덤 토큰으로 올림 → `orderlist.php?iteminfo_url=그주소` 호출 → 샵링커 서버(117.52.109.150)가 XML 을 가져간 뒤 응답 → 호출이 끝나면(최대 2분) 토큰 폐기 |
| 수집 API | `POST /api/v1/shoplinker/collect` `{ stDate, edDate (yyyyMMdd), orderFlag }` → `{ totalCount, saved, skipped }`. 페이지 끝까지 반복 |
| `orderFlag` | **필수, 기본값 없음.** `000` 일반 — **신규주문을 발주확인으로 바꿈(되돌릴 수 없음)** / `007` 발주확인 / `002` 정산확정 / `003` 송장등록 / `004` 송장전송완료 |
| 오류 | `<ResultMessage>` 응답·XML 아닌 응답(`could not open XML input13`) 은 예외 (0건으로 오인 방지) |
| 저장 | `TB_ORDER_RAW` (한 트랜잭션). `shoplinker_order_id` 가 이미 있으면 건너뜀. `TRANSFER_YN = 'N'`, `CREATED_AT` = 수집 시각, `RAW_SRC` = `SHOPLINKER_API 시작~종료`. 매핑은 `ShoplinkerService.toOrderRaw` (품번 `partner_product_id` → `CLIENT_PRODUCT_CODE`) |
| 보안 | `/shoplinker/request/**` 만 `AXBootSecurityConfig.ignorePages` 에 추가. 고객사코드·계정은 **환경변수** `SHOPLINKER_CUSTOMER_ID`, `SHOPLINKER_ID` (저장소에 값 커밋 금지). 비밀번호 불필요 |
| dev 설정 | `shoplinker.public-base-url=http://14.33.191.159:22021` — 공유기 **22021 → 개발 PC 8802** 포트포워딩 필요. 운영 주소는 별도 확인 |
| 인코딩 | 요청/응답 euc-kr. Java 에서는 MS949 로 읽고 씀 (확장 한글) |

---

## 10. 개발 환경 메모

- 디버깅: IntelliJ `ScriptDebug`(JavaScript Debug, `http://localhost:5174`) 로 띄운 Chrome 에서만 브레이크가 걸린다. 팝업은 위 3절 설정 또는 Chrome DevTools "Auto-open DevTools for popups".
- push 는 HTTPS 토큰(PAT) 또는 `gh auth login` 필요.
- 백엔드 테스트: `pom.xml` 의 `maven.test.skip=true` 라 기본은 건너뜀. 실행은 `mvn -Dmaven.test.skip=false -Dtest=ShoplinkerServiceTest test`.
  ⚠️ JUnit 4(4.13.2)가 다른 의존성으로 함께 들어와 surefire 2.22.2 가 JUnit 4 로 실행한다 → **테스트는 `org.junit.Test` (JUnit 4) 로 작성** (JUnit 5 로 쓰면 0건 실행).
- 백엔드 로그: `axboot.log.level=ERROR`, `axboot.log.slack.enabled=false` (dev, 웹훅 URL 이 비어 있어 Slack 전송이 조용히 실패하던 문제). production 의 Slack 웹훅 URL 형식(`https://hooks.slack.com/services/…`) 확인 필요.
