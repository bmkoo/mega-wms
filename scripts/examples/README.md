# genPage.mjs 예제

`scripts/genPage.mjs` 는 백엔드 JPA 엔티티(`*.java`)를 읽어 i-WMS 조회 화면(목록 + 선택적으로 상세 팝업)을 만든다.
이 폴더의 `SampleStock.java` 는 생성기가 처리하는 경우를 한 파일에 모은 **예제 엔티티**다 (실제 백엔드에는 없다).

모든 명령은 프로젝트 루트에서 실행한다.

```bash
cd /Users/bmkoo/IdeaProjects/i-wms-new
```

---

## 1. 먼저 미리보기 (`--dry-run`)

파일을 쓰지 않고 무엇을 추가·생성할지만 보여준다. **처음에는 항상 이것부터.**

```bash
node /Users/bmkoo/IdeaProjects/i-wms-new/scripts/genPage.mjs \
  /Users/bmkoo/IdeaProjects/i-wms-new/scripts/examples/SampleStock.java \
  --menu BMKOO_L2_MENU --folder Example --popup --code-status --dry-run
```

실제 출력:

```
■ SampleStock (예제 재고) — 필드 9개
  추가   apiFunctions.onApiQuerySampleStock() → GET v1/sampleStock
  추가   apiFunctions.onApiGetSampleStock() → GET v1/sampleStock/${id}
  추가   apiFunctions.onApiSaveSampleStock() → POST v1/sampleStock/save
  추가   [ko] field.whCd = "창고코드"
  추가   [ko] field.itemNo = "품목번호"
  건너뜀 [ko] field.qty (기존: "수량")              ← 이미 있는 i18n 키는 그대로 쓴다
  ...
  추가   [ko] menu.sampleStock = "예제 재고"
  추가   메뉴 BMKOO_L2_MENU ← { path: 'sampleStock', nameKey: 'menu.sampleStock', component: 'Example/PgSampleStock', roles: STAFF_ROLES },
  추가   팝업 라우트 /popup/sample-stock (sampleStockForm)
  코드   stockStatusCode → 공통코드 STOCK_STATUS_CODE
  생성   src/views/pages/Example/PgSampleStock.vue
  생성   src/views/pages/Example/PgSampleStockForm.vue
  생성   src/views/pages/Example/sampleStockPopup.js

--dry-run: 파일을 쓰지 않았습니다.
```

> ⚠️ `--dry-run` 없이 이 예제를 실행하면 실제로 `apiFunctions.js`, `i18nData.js`, `menuConfig.js`, `router/index.js` 에
> 예제용 항목이 추가된다. 예제는 미리보기로만 쓰고, 실제 엔티티에 적용할 때 `--dry-run` 을 뺀다.

---

## 2. 예제 엔티티 → 생성 결과

`SampleStock.java` 의 각 필드가 어떻게 바뀌는지 (실제 생성된 `PgSampleStock.vue` 의 `FIELDS`):

```js
const FIELDS = [
  { data: 'whCd', type: 'text', className: '', width: 90 },
  { data: 'itemNo', type: 'number', className: 'htRight', width: 90, id: true },
  { data: 'itemNm', type: 'text', className: '', width: 220 },
  { data: 'qty', type: 'number', className: 'htRight', width: 90 },
  { data: 'price', type: 'number', className: 'htRight', width: 90 },
  { data: 'receivedAt', type: 'date', className: 'htCenter', width: 140, format: 'YYYY-MM-DDTHH:mm:ss' },
  { data: 'expireDate', type: 'date', className: 'htCenter', width: 140, format: 'YYYY-MM-DD' },
  { data: 'stockStatusCode', type: 'code', className: 'htCenter', width: 100, codeGroup: 'STOCK_STATUS_CODE' },
  { data: 'useYn', type: 'text', className: '', width: 90 },
];
```

| 엔티티 필드 | 생성 결과 | 이유 |
|---|---|---|
| `@Id String whCd` (length 10) | 문자열, 폭 90 | length ≤ 10 → 좁게 |
| `@Id Long itemNo` | 숫자, `id: true` | @Id 숫자는 콤마를 붙이지 않는다 |
| `String itemNm` (length 130) | 문자열, 폭 220 | length ≥ 100 → 넓게. `@Comment("품목명(판매처 원문)")` 처럼 괄호도 읽는다 |
| `Integer qty`, `BigDecimal price` | 숫자 | 목록·폼에서 `12,345` 처럼 1000 단위 콤마 |
| `LocalDateTime receivedAt` | 날짜, 저장 `YYYY-MM-DDTHH:mm:ss` | 백엔드 Jackson ISO_LOCAL_DATE_TIME |
| `LocalDate expireDate` | 날짜, 저장 `YYYY-MM-DD` | 백엔드 Jackson ISO_LOCAL_DATE |
| `String stockStatusCode` (`STOCK_STATUS_CODE`) | **공통코드** (`--code-status`) | 컬럼명이 `_CODE` 로 끝남 → 그룹 = 컬럼명 |
| `Types.Used useYn = Types.Used.YES` | 문자열 | 점 들어간 타입·초기값도 읽는다. 컬럼명이 `_CODE` 로 끝나지 않아 공통코드 아님 |
| `@Transient String tempMemo` | **제외** | `@Column` 이 없다 |
| `SampleStockId` 내부 클래스 필드 | **제외** | `@Column` 이 없다 |

`@Id` 가 2개라 상세 팝업 id 는 `"whCd,itemNo"` 로 이어 붙인다 → `GET v1/sampleStock/W01,1001`.

---

## 3. 생성된 화면의 동작

| 종류 | 목록 그리드 | 검색 조건 | 상세 폼 (`--popup`) | 엑셀 |
|---|---|---|---|---|
| 문자열 | 그대로 | 부분일치 입력 | 입력칸 | 그대로 |
| 숫자 | 1000 단위 콤마 (@Id 제외) | 최소 ~ 최대 | 콤마 입력 (저장은 숫자) | 숫자 |
| 날짜 | `YYYY-MM-DD HH:mm:ss` | 기간 | 날짜(시간) 선택 | 표시 형식 |
| 공통코드 | 코드명 (`NORMAL` → `활성`) | 선택상자 (정확 일치) | 선택상자 (저장은 코드) | 코드명 |

- 한 행에 검색 조건 4개씩, 정렬은 필드별 ↑/↓ 2단계.
- 공통코드는 `src/store/commonCodeStore.js` 가 로그인 후 `/api/v1/commonCodes` 에서 미리 불러둔다.
  그룹이 아직 없으면 코드값을 그대로 보여주고, 공통코드에 그룹(`STOCK_STATUS_CODE`)을 등록하면 바로 코드명으로 바뀐다.

---

## 4. 상황별 명령

### 목록 화면만

```bash
node /Users/bmkoo/IdeaProjects/i-wms-new/scripts/genPage.mjs \
  /Users/bmkoo/IdeaProjects/workspace-20260520/backend/src/main/java/com/inno/axboot/admin/domain/mega/OrderItem.java \
  --menu BMKOO_L2_MENU
```

### 목록 + 상세 폼 팝업 (단건 조회 + 저장)

```bash
node /Users/bmkoo/IdeaProjects/i-wms-new/scripts/genPage.mjs \
  /Users/bmkoo/IdeaProjects/workspace-20260520/backend/src/main/java/com/inno/axboot/admin/domain/mega/OrderItem.java \
  --menu BMKOO_L2_MENU --popup
```

### `_CODE` 컬럼을 공통코드로 (`--code-status`)

```bash
node /Users/bmkoo/IdeaProjects/i-wms-new/scripts/genPage.mjs \
  /Users/bmkoo/IdeaProjects/i-wms-new/scripts/examples/SampleStock.java \
  --menu BMKOO_L2_MENU --folder Example --popup --code-status --dry-run
# → stockStatusCode → 공통코드 STOCK_STATUS_CODE
```

- 대상은 `@Column(name)` 이 **`_CODE`** 로 끝나는 문자열 컬럼이다. `_STATUS`, `_STATUS_CD` 로 끝나는 컬럼은 일반 문자열.
- 공통코드 그룹 이름 = 컬럼명 (`STOCK_STATUS_CODE`). 같은 이름으로 공통코드 그룹을 등록해야 코드명이 보인다.
- ⚠️ 공통코드가 **아닌** `_CODE` 컬럼도 대상이 된다. 지금 백엔드에는 아래 컬럼이 있으니, 이 엔티티들에는 `--code-status` 를 쓰지 않는다.

  | 엔티티 | 컬럼 | 의미 |
  |---|---|---|
  | Order, Channel | `ZIP_CODE` | 우편번호 |
  | OrderRaw | `PRODUCT_CODE`, `OWN_PRODUCT_CODE`, `MALL_PRODUCT_CODE`, `CLIENT_PRODUCT_CODE` | 품번 |
  | OrderRaw | `HS_CODE` | 세관 HS 코드 |

### 메서드 이름이 이미 있을 때 (예: `onApiQueryOrder` 는 출고 API 가 사용 중)

```bash
node /Users/bmkoo/IdeaProjects/i-wms-new/scripts/genPage.mjs \
  /Users/bmkoo/IdeaProjects/workspace-20260520/backend/src/main/java/com/inno/axboot/admin/domain/mega/Order.java \
  --menu BMKOO_L2_MENU --popup --api-name onApiQueryOrderEntity
```

### 직접 고친 화면은 그대로 두고 i18n·메뉴만 보충 (`--keep`) + API 주소가 관례와 다를 때 (`--api`)

Product 는 목록 API 가 `v1/productList` 이고 화면(`System/PgProduct.vue`)을 직접 고쳐 쓰고 있다.

```bash
node /Users/bmkoo/IdeaProjects/i-wms-new/scripts/genPage.mjs \
  /Users/bmkoo/IdeaProjects/workspace-20260520/backend/src/main/java/com/inno/axboot/admin/domain/mega/Product.java \
  --menu BMKOO_L2_MENU --api /api/v1/productList --keep
# → apiFunctions.onApiQueryProduct() 유지, 새 필드의 i18n 만 추가, PgProduct.vue 는 건너뜀
```

- `--api` 없이 실행하면 `onApiQueryProduct()` 가 이미 `v1/productList` 를 쓰고 있어서 **중단**된다 (이름 충돌 방지).
- `--keep` 없이 실행하면 직접 고친 `PgProduct.vue` 를 **덮어쓴다** (구성품 그리드 등 사라짐).

### 화면 폴더를 지정 (기본은 대메뉴 key: SYSTEM → System)

```bash
node /Users/bmkoo/IdeaProjects/i-wms-new/scripts/genPage.mjs \
  /Users/bmkoo/IdeaProjects/workspace-20260520/backend/src/main/java/com/inno/axboot/admin/domain/mega/OrderItem.java \
  --menu BMKOO_L2_MENU --folder Order
```

생성 후에는 항상:

```bash
npm run check:menu
```

---

## 5. 작업 로그 (`scripts/genPage.log.md`)

생성기를 실행할 때마다 **맨 아래에 한 건씩 자동으로 누적**된다. 남기지 않으려면 `--no-log`.

| 상태 | 언제 |
|---|---|
| ✅ 완료 | 파일을 실제로 썼다 |
| 🔍 DRY-RUN | `--dry-run` (파일 안 씀) |
| ⚠️ 일부 중단 | 엔티티 여러 개 중 일부가 API 메서드 이름 충돌로 중단 |
| ❌ 실패 | 인자 오류, 없는 중메뉴, 없는 엔티티 파일, 엔티티를 읽지 못함 등 |

한 건에 남는 내용: 실행 시각 · 명령 전체 · 실행 폴더 · 사용자 · 요약(엔티티/생성/덮어씀/추가/유지/건너뜀/중단 건수) ·
중단된 엔티티 · 오류 메시지 · **실제로 바뀐 파일 목록** · 상세 로그(펼치기).

```markdown
## 2026-11-22 00:18:24 · ✅ 완료

- 명령: `node scripts/genPage.mjs scripts/examples/SampleStock.java --menu BMKOO_L2_MENU --folder Example --popup --code-status`
- 실행 폴더: `/Users/bmkoo/IdeaProjects/i-wms-new` · 사용자: bmkoo · 소요: 0.0s
- 요약: 엔티티 1 · 생성 3 · 추가 17 · 건너뜀 8
- 바뀐 파일:
  - `src/common/utils/apiFunctions.js`
  - `src/router/index.js`
  - …
<details><summary>상세 로그</summary> … </details>
```

---

## 6. 주의

- **기본은 덮어쓰기**: 이미 있는 `Pg<Entity>.vue` 등을 다시 만든다. 직접 고친 화면이면 `--keep`.
  (i18n · 메뉴 · 라우트 · API 메서드는 항상 "없을 때만 추가")
- **메뉴 path 가 이미 있으면** 메뉴 추가는 건너뛰지만 화면 파일은 만든다. 다른 폴더에 만들어졌다면 `menuConfig.js` 의 `component` 를 확인할 것.
- **API 메서드 이름이 같은데 주소가 다르면** 그 엔티티는 아무 파일도 건드리지 않고 중단한다 → `--api-name` 으로 다른 이름.
- **`--api` / `--api-name`** 은 엔티티 파일을 하나만 줄 때만 쓸 수 있다.
- **팝업 디버깅**: `.env.development` 에 `VITE_POPUP_SAME_TAB=true` 면 개발 서버에서만 팝업을 같은 탭으로 연다
  (`window.open` 창은 IntelliJ 브레이크가 걸리지 않는다). 바꾼 뒤 `npm run dev` 재시작.
- 영문 i18n 은 필드명을 풀어 쓴 초안이다 (`Wh Cd`, `Item No`). 필요하면 `i18nData.js` 에서 고친다.
