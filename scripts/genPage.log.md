# genPage.mjs 작업 로그

`scripts/genPage.mjs` 를 실행할 때마다 맨 아래에 한 건씩 자동으로 추가된다. (남기지 않으려면 `--no-log`)
상태: ✅ 완료 · 🔍 DRY-RUN(파일 안 씀) · ⚠️ 일부 중단 · ❌ 실패

## 2026-11-22 00:00 경 · ✅ 완료

> 작업 로그 기능을 넣기 전 실행이라, 터미널에 붙여넣은 출력으로 기록했다. 시각은 생성된 파일의 수정 시각 기준.
> 당시 생성기는 공통코드 판별이 `_STATUS_CD` 규칙이었다 (지금은 `_CODE`).

- 명령: `node scripts/genPage.mjs /Users/bmkoo/IdeaProjects/workspace-20260520/backend/src/main/java/com/inno/axboot/admin/domain/mega/Product.java --menu BMKOO_L2_MENU --popup --code-status --api-name onApiGetMegaProduct`
- 실행 폴더: `/Users/bmkoo/IdeaProjects/i-wms-new` · 사용자: bmkoo
- 요약: 엔티티 1 · 생성 3 · 추가 5 · 건너뜀 56
- 바뀐 파일:
  - `src/common/utils/apiFunctions.js`
  - `src/router/index.js`
  - `src/config/menuConfig.js`
  - `src/views/pages/System/PgProduct.vue`
  - `src/views/pages/System/PgProductForm.vue`
  - `src/views/pages/System/productPopup.js`

<details><summary>상세 로그 (터미널 출력 전체)</summary>

```
■ Product (상품 마스터) — 필드 27개
  추가   apiFunctions.onApiGetMegaProduct() → GET v1/product
  추가   apiFunctions.onApiGetProduct() → GET v1/product/${id}
  추가   apiFunctions.onApiSaveProduct() → POST v1/product/save
  건너뜀 [ko] field.productCd (기존: "품번")
  건너뜀 [ko] field.productNm (기존: "상품명 (판매처 원문)")
  건너뜀 [ko] field.barcode (기존: "상품바코드")
  건너뜀 [ko] field.barcodeBox (기존: "박스바코드")
  건너뜀 [ko] field.qtyBox (기존: "박스수량")
  건너뜀 [ko] field.brandCd (기존: "브랜드코드")
  건너뜀 [ko] field.category1Cd (기존: "대분류")
  건너뜀 [ko] field.category2Cd (기존: "중분류")
  건너뜀 [ko] field.costPrice (기존: "원가")
  건너뜀 [ko] field.salePrice (기존: "판매가")
  건너뜀 [ko] field.supplierId (기존: "제조사(거래처ID)")
  건너뜀 [ko] field.memo (기존: "메모")
  건너뜀 [ko] field.memoUpdatedAt (기존: "메모 수정일시")
  건너뜀 [ko] field.saleTypeCd (기존: "판매형태")
  건너뜀 [ko] field.deliveryStatus (기존: "배송형태(직배송, 업체배송)")
  건너뜀 [ko] field.productStatusCd (기존: "상품상태")
  건너뜀 [ko] field.stockStatusCd (기존: "재고상태")
  건너뜀 [ko] field.setYn (기존: "구성품여부")
  건너뜀 [ko] field.locationWh (기존: "창고")
  건너뜀 [ko] field.location1 (기존: "존")
  건너뜀 [ko] field.location2 (기존: "행")
  건너뜀 [ko] field.location3 (기존: "열")
  건너뜀 [ko] field.location4 (기존: "단")
  건너뜀 [ko] field.imageL (기존: "이미지정보_L")
  건너뜀 [ko] field.imageM (기존: "이미지정보_M")
  건너뜀 [ko] field.imageS (기존: "이미지정보_S")
  건너뜀 [ko] field.productDesc (기존: "상품상세")
  건너뜀 [en] field.productCd (기존: "Product Cd")
  건너뜀 [en] field.productNm (기존: "Product Nm")
  건너뜀 [en] field.barcode (기존: "Barcode")
  건너뜀 [en] field.barcodeBox (기존: "Barcode Box")
  건너뜀 [en] field.qtyBox (기존: "Qty Box")
  건너뜀 [en] field.brandCd (기존: "Brand Cd")
  건너뜀 [en] field.category1Cd (기존: "Category1 Cd")
  건너뜀 [en] field.category2Cd (기존: "Category2 Cd")
  건너뜀 [en] field.costPrice (기존: "Cost Price")
  건너뜀 [en] field.salePrice (기존: "Sale Price")
  건너뜀 [en] field.supplierId (기존: "Supplier Id")
  건너뜀 [en] field.memo (기존: "Memo")
  건너뜀 [en] field.memoUpdatedAt (기존: "Memo Updated At")
  건너뜀 [en] field.saleTypeCd (기존: "Sale Type Cd")
  건너뜀 [en] field.deliveryStatus (기존: "Delivery Status")
  건너뜀 [en] field.productStatusCd (기존: "Product Status Cd")
  건너뜀 [en] field.stockStatusCd (기존: "Stock Status Cd")
  건너뜀 [en] field.setYn (기존: "Set Yn")
  건너뜀 [en] field.locationWh (기존: "Location Wh")
  건너뜀 [en] field.location1 (기존: "Zone")
  건너뜀 [en] field.location2 (기존: "Row")
  건너뜀 [en] field.location3 (기존: "Column")
  건너뜀 [en] field.location4 (기존: "Level")
  건너뜀 [en] field.imageL (기존: "Image L")
  건너뜀 [en] field.imageM (기존: "Image M")
  건너뜀 [en] field.imageS (기존: "Image S")
  건너뜀 [en] field.productDesc (기존: "Product Desc")
  건너뜀 [ko] menu.product (기존: "상품 마스터")
  건너뜀 [en] menu.product (기존: "Product")
  추가   메뉴 BMKOO_L2_MENU ← { path: 'product', nameKey: 'menu.product', component: 'System/PgProduct', roles: STAFF_ROLES },
  추가   팝업 라우트 /popup/product (productForm)
  코드   productStatusCd → 공통코드 PRODUCT_STATUS_CD, stockStatusCd → 공통코드 STOCK_STATUS_CD
  생성   src/views/pages/System/PgProduct.vue
  생성   src/views/pages/System/PgProductForm.vue
  생성   src/views/pages/System/productPopup.js

완료. npm run check:menu 로 정합성을 확인하세요.
```

</details>

## 2026-11-22 00:26:28 · 🔍 DRY-RUN

- 명령: `node scripts/genPage.mjs scripts/examples/SampleStock.java --menu BMKOO_L2_MENU --folder Example --dry-run`
- 실행 폴더: `/Users/bmkoo/IdeaProjects/i-wms-new` · 사용자: bmkoo · 소요: 0.0s
- 요약: 엔티티 1 · 생성 1 · 추가 14 · 건너뜀 8

<details><summary>상세 로그 (터미널 출력 전체)</summary>

```
■ SampleStock (예제 재고) — 필드 9개
  추가   apiFunctions.onApiQuerySampleStock() → GET v1/sampleStock
  추가   [ko] field.whCd = "창고코드"
  추가   [ko] field.itemNo = "품목번호"
  추가   [ko] field.itemNm = "품목명(판매처 원문)"
  건너뜀 [ko] field.qty (기존: "수량")
  추가   [ko] field.price = "단가"
  추가   [ko] field.receivedAt = "입고일시"
  건너뜀 [ko] field.expireDate (기존: "유통기한")
  건너뜀 [ko] field.stockStatusCode (기존: "재고상태")
  건너뜀 [ko] field.useYn (기존: "사용구분")
  추가   [en] field.whCd = "Wh Cd"
  추가   [en] field.itemNo = "Item No"
  추가   [en] field.itemNm = "Item Nm"
  건너뜀 [en] field.qty (기존: "Qty")
  추가   [en] field.price = "Price"
  추가   [en] field.receivedAt = "Received At"
  건너뜀 [en] field.expireDate (기존: "Expiry")
  건너뜀 [en] field.stockStatusCode (기존: "Stock Status Code")
  건너뜀 [en] field.useYn (기존: "Usage")
  추가   [ko] menu.sampleStock = "예제 재고"
  추가   [en] menu.sampleStock = "Sample Stock"
  추가   메뉴 BMKOO_L2_MENU ← { path: 'sampleStock', nameKey: 'menu.sampleStock', component: 'Example/PgSampleStock', roles: STAFF_ROLES },
  생성   src/views/pages/Example/PgSampleStock.vue

--dry-run: 파일을 쓰지 않았습니다.
```

</details>

## 2026-11-22 01:11:26 · ✅ 완료

- 명령: `node scripts/genPage.mjs /Users/bmkoo/IdeaProjects/workspace-20260520/backend/src/main/java/com/inno/axboot/admin/domain/mega/OrderRaw.java --menu BMKOO_L2_MENU --popup --code-status --api-name onApiGetMegaOrderRaw`
- 실행 폴더: `/Users/bmkoo/IdeaProjects/i-wms-new` · 사용자: bmkoo · 소요: 0.0s
- 요약: 엔티티 1 · 생성 3 · 추가 5 · 건너뜀 82
- 바뀐 파일:
  - `src/common/utils/apiFunctions.js`
  - `src/router/index.js`
  - `src/config/menuConfig.js`
  - `src/views/pages/System/PgOrderRaw.vue`
  - `src/views/pages/System/PgOrderRawForm.vue`
  - `src/views/pages/System/orderRawPopup.js`

<details><summary>상세 로그 (터미널 출력 전체)</summary>

```
■ OrderRaw (매출데이터(오클릭/네이버체크아웃/오픈마켓)) — 필드 40개
  추가   apiFunctions.onApiGetMegaOrderRaw() → GET v1/orderRaw
  추가   apiFunctions.onApiGetOrderRaw() → GET v1/orderRaw/${id}
  추가   apiFunctions.onApiSaveOrderRaw() → POST v1/orderRaw/save
  건너뜀 [ko] field.rawId (기존: "행 ID")
  건너뜀 [ko] field.rawSrc (기존: "원본 파일명")
  건너뜀 [ko] field.srcRow (기존: "시트 내 데이터 행번호(1부터)")
  건너뜀 [ko] field.orderChannel (기존: "주문 채널")
  건너뜀 [ko] field.orderType (기존: "주문 유형")
  건너뜀 [ko] field.orderNo (기존: "주문번호")
  건너뜀 [ko] field.orderItemNo (기존: "상품주문번호")
  건너뜀 [ko] field.ordererName (기존: "주문자 이름")
  건너뜀 [ko] field.ordererTel (기존: "주문자 전화번호")
  건너뜀 [ko] field.ordererMobile (기존: "주문자 핸드폰 번호")
  건너뜀 [ko] field.receiverName (기존: "수취인 이름")
  건너뜀 [ko] field.receiverTel (기존: "수취인 전화번호")
  건너뜀 [ko] field.receiverMobile (기존: "수취인 핸드폰 번호")
  건너뜀 [ko] field.receiverZipcode (기존: "수취인 우편번호")
  건너뜀 [ko] field.receiverAddress (기존: "수취인 전체주소")
  건너뜀 [ko] field.productName (기존: "상품명")
  건너뜀 [ko] field.optionInfo (기존: "옵션정보")
  건너뜀 [ko] field.quantity (기존: "상품수량")
  건너뜀 [ko] field.orderMessage (기존: "주문시 남기는 글")
  건너뜀 [ko] field.invoiceNo (기존: "송장 번호")
  건너뜀 [ko] field.orderStatus (기존: "주문상태")
  건너뜀 [ko] field.ownProductCode (기존: "자체상품코드")
  건너뜀 [ko] field.maker (기존: "제조사")
  건너뜀 [ko] field.brandName (기존: "브랜드명")
  건너뜀 [ko] field.paymentMethod (기존: "결제방법")
  건너뜀 [ko] field.shopType (기존: "상점구분")
  건너뜀 [ko] field.mobileAppDiscountAmount (기존: "모바일앱 할인금액")
  건너뜀 [ko] field.orderSeq (기존: "주문코드(순서)")
  건너뜀 [ko] field.hsCode (기존: "HS코드")
  건너뜀 [ko] field.shoplinkerOrderNo (기존: "샵링커주문번호")
  건너뜀 [ko] field.clientCompany (기존: "고객사")
  건너뜀 [ko] field.productCode (기존: "상품코드")
  건너뜀 [ko] field.mallProductCode (기존: "쇼핑몰 상품코드")
  건너뜀 [ko] field.clientProductCode (기존: "고객사 상품코드")
  건너뜀 [ko] field.shippingPayment (기존: "배송결제(신용,착불)")
  건너뜀 [ko] field.mallSalePrice (기존: "쇼핑몰 판매가")
  건너뜀 [ko] field.expectedSettlementAmount (기존: "정산예정액")
  건너뜀 [ko] field.orderAmount (기존: "주문금액")
  건너뜀 [ko] field.combinedPackageNo (기존: "합포장번호")
  건너뜀 [ko] field.mallId (기존: "쇼핑몰아이디")
  건너뜀 [en] field.rawId (기존: "Raw Id")
  건너뜀 [en] field.rawSrc (기존: "Raw Src")
  건너뜀 [en] field.srcRow (기존: "Src Row")
  건너뜀 [en] field.orderChannel (기존: "Order Channel")
  건너뜀 [en] field.orderType (기존: "Order Type")
  건너뜀 [en] field.orderNo (기존: "Order no.")
  건너뜀 [en] field.orderItemNo (기존: "Order Item No")
  건너뜀 [en] field.ordererName (기존: "Orderer Name")
  건너뜀 [en] field.ordererTel (기존: "Orderer Tel")
  건너뜀 [en] field.ordererMobile (기존: "Orderer Mobile")
  건너뜀 [en] field.receiverName (기존: "Receiver Name")
  건너뜀 [en] field.receiverTel (기존: "Receiver Tel")
  건너뜀 [en] field.receiverMobile (기존: "Receiver Mobile")
  건너뜀 [en] field.receiverZipcode (기존: "Receiver Zipcode")
  건너뜀 [en] field.receiverAddress (기존: "Receiver Address")
  건너뜀 [en] field.productName (기존: "Product")
  건너뜀 [en] field.optionInfo (기존: "Option Info")
  건너뜀 [en] field.quantity (기존: "Quantity")
  건너뜀 [en] field.orderMessage (기존: "Order Message")
  건너뜀 [en] field.invoiceNo (기존: "Invoice No")
  건너뜀 [en] field.orderStatus (기존: "Order Status")
  건너뜀 [en] field.ownProductCode (기존: "Own Product Code")
  건너뜀 [en] field.maker (기존: "Maker")
  건너뜀 [en] field.brandName (기존: "Brand Name")
  건너뜀 [en] field.paymentMethod (기존: "Payment Method")
  건너뜀 [en] field.shopType (기존: "Shop Type")
  건너뜀 [en] field.mobileAppDiscountAmount (기존: "Mobile App Discount Amount")
  건너뜀 [en] field.orderSeq (기존: "Order Seq")
  건너뜀 [en] field.hsCode (기존: "Hs Code")
  건너뜀 [en] field.shoplinkerOrderNo (기존: "Shoplinker Order No")
  건너뜀 [en] field.clientCompany (기존: "Client Company")
  건너뜀 [en] field.productCode (기존: "Product Code")
  건너뜀 [en] field.mallProductCode (기존: "Mall Product Code")
  건너뜀 [en] field.clientProductCode (기존: "Client Product Code")
  건너뜀 [en] field.shippingPayment (기존: "Shipping Payment")
  건너뜀 [en] field.mallSalePrice (기존: "Mall Sale Price")
  건너뜀 [en] field.expectedSettlementAmount (기존: "Expected Settlement Amount")
  건너뜀 [en] field.orderAmount (기존: "Order Amount")
  건너뜀 [en] field.combinedPackageNo (기존: "Combined Package No")
  건너뜀 [en] field.mallId (기존: "Mall Id")
  건너뜀 [ko] menu.orderRaw (기존: "매출데이터")
  건너뜀 [en] menu.orderRaw (기존: "Order Raw")
  추가   메뉴 BMKOO_L2_MENU ← { path: 'orderRaw', nameKey: 'menu.orderRaw', component: 'System/PgOrderRaw', roles: STAFF_ROLES },
  추가   팝업 라우트 /popup/order-raw (orderRawForm)
  코드   ownProductCode → 공통코드 OWN_PRODUCT_CODE, hsCode → 공통코드 HS_CODE, productCode → 공통코드 PRODUCT_CODE, mallProductCode → 공통코드 MALL_PRODUCT_CODE, clientProductCode → 공통코드 CLIENT_PRODUCT_CODE
  생성   src/views/pages/System/PgOrderRaw.vue
  생성   src/views/pages/System/PgOrderRawForm.vue
  생성   src/views/pages/System/orderRawPopup.js

완료. npm run check:menu 로 정합성을 확인하세요.
```

</details>

## 2026-11-22 01:45:18 · ✅ 완료

- 명령: `node scripts/genPage.mjs /Users/bmkoo/IdeaProjects/workspace-20260520/backend/src/main/java/com/inno/axboot/admin/domain/mega/Channel.java --menu BMKOO_L2_MENU --popup --code-status --api-name onApiGetChannel`
- 실행 폴더: `/Users/bmkoo/IdeaProjects/i-wms-new` · 사용자: bmkoo · 소요: 0.0s
- 요약: 엔티티 1 · 생성 3 · 추가 27 · 건너뜀 12
- 바뀐 파일:
  - `src/common/utils/apiFunctions.js`
  - `src/router/index.js`
  - `src/i18n/i18nData.js`
  - `src/config/menuConfig.js`
  - `src/views/pages/System/PgChannel.vue`
  - `src/views/pages/System/PgChannelForm.vue`
  - `src/views/pages/System/channelPopup.js`

<details><summary>상세 로그 (터미널 출력 전체)</summary>

```
■ Channel (판매채널) — 필드 16개
  추가   apiFunctions.onApiGetChannel() → GET v1/channel
  추가   apiFunctions.onApiGetChannelList() → GET v1/channel/${id}
  추가   apiFunctions.onApiSaveChannel() → POST v1/channel/save
  건너뜀 [ko] field.channelId (기존: "판매처ID")
  추가   [ko] field.bizNo = "사업자번호"
  추가   [ko] field.channelNm = "판매처명"
  추가   [ko] field.channelTypeCd = "판매처구분코드"
  추가   [ko] field.channelTypeNm = "판매처구분"
  건너뜀 [ko] field.memo (기존: "메모")
  추가   [ko] field.privacyKeepDays = "개인정보 보존일"
  건너뜀 [ko] field.sort (기존: "정렬")
  건너뜀 [ko] field.useYn (기존: "사용구분")
  건너뜀 [ko] field.zipCode (기존: "우편번호")
  건너뜀 [ko] field.address (기존: "주소")
  추가   [ko] field.addressDetail = "상세주소"
  추가   [ko] field.allocOrder = "할당 순서"
  추가   [ko] field.autoLoginType = "자동로그인타입"
  추가   [ko] field.channelAlias = "판매처명(고객사별)"
  추가   [ko] field.channelClass = "판매처분류"
  건너뜀 [en] field.channelId (기존: "Channel Id")
  추가   [en] field.bizNo = "Biz No"
  추가   [en] field.channelNm = "Channel Nm"
  추가   [en] field.channelTypeCd = "Channel Type Cd"
  추가   [en] field.channelTypeNm = "Channel Type Nm"
  건너뜀 [en] field.memo (기존: "Memo")
  추가   [en] field.privacyKeepDays = "Privacy Keep Days"
  건너뜀 [en] field.sort (기존: "Sort")
  건너뜀 [en] field.useYn (기존: "Usage")
  건너뜀 [en] field.zipCode (기존: "Zip Code")
  건너뜀 [en] field.address (기존: "Address")
  추가   [en] field.addressDetail = "Address Detail"
  추가   [en] field.allocOrder = "Alloc Order"
  추가   [en] field.autoLoginType = "Auto Login Type"
  추가   [en] field.channelAlias = "Channel Alias"
  추가   [en] field.channelClass = "Channel Class"
  추가   [ko] menu.channel = "판매채널"
  추가   [en] menu.channel = "Channel"
  추가   메뉴 BMKOO_L2_MENU ← { path: 'channel', nameKey: 'menu.channel', component: 'System/PgChannel', roles: STAFF_ROLES },
  추가   팝업 라우트 /popup/channel (channelForm)
  코드   zipCode → 공통코드 ZIP_CODE
  생성   src/views/pages/System/PgChannel.vue
  생성   src/views/pages/System/PgChannelForm.vue
  생성   src/views/pages/System/channelPopup.js

완료. npm run check:menu 로 정합성을 확인하세요.
```

</details>

## 2026-11-22 04:06:21 · ✅ 완료

- 명령: `node scripts/genPage.mjs /Users/bmkoo/IdeaProjects/workspace-20260520/backend/src/main/java/com/inno/axboot/admin/domain/mega/Order.java --menu BMKOO_L2_MENU --popup --code-status --api-name onApiGetOrder`
- 실행 폴더: `/Users/bmkoo/IdeaProjects/i-wms-new` · 사용자: bmkoo · 소요: 0.0s
- 요약: 엔티티 1 · 생성 3 · 추가 5 · 건너뜀 34
- 바뀐 파일:
  - `src/common/utils/apiFunctions.js`
  - `src/router/index.js`
  - `src/config/menuConfig.js`
  - `src/views/pages/System/PgOrder.vue`
  - `src/views/pages/System/PgOrderForm.vue`
  - `src/views/pages/System/orderPopup.js`

<details><summary>상세 로그 (터미널 출력 전체)</summary>

```
■ Order (주문) — 필드 16개
  추가   apiFunctions.onApiGetOrder() → GET v1/order
  추가   apiFunctions.onApiGetOrderList() → GET v1/order/${id}
  추가   apiFunctions.onApiSaveOrder() → POST v1/order/save
  건너뜀 [ko] field.orderId (기존: "주문ID")
  건너뜀 [ko] field.orderNo (기존: "주문번호")
  건너뜀 [ko] field.channelId (기존: "판매처ID")
  건너뜀 [ko] field.ordererNm (기존: "주문자")
  건너뜀 [ko] field.orderDate (기존: "주문일")
  건너뜀 [ko] field.zipCode (기존: "우편번호")
  건너뜀 [ko] field.address1 (기존: "주소1")
  건너뜀 [ko] field.address2 (기존: "주소2")
  건너뜀 [ko] field.hpNo (기존: "휴대전화")
  건너뜀 [ko] field.tel (기존: "일반전화")
  건너뜀 [ko] field.itemCount (기존: "주문건수")
  건너뜀 [ko] field.paidAmount (기존: "정산금액")
  건너뜀 [ko] field.billAmount (기존: "주문결재액")
  건너뜀 [ko] field.privacyPurgedAt (기존: "개인정보 파기일시")
  건너뜀 [ko] field.receiverNm (기존: "수령자")
  건너뜀 [ko] field.memo (기존: "메모")
  건너뜀 [en] field.orderId (기존: "Order Id")
  건너뜀 [en] field.orderNo (기존: "Order no.")
  건너뜀 [en] field.channelId (기존: "Channel Id")
  건너뜀 [en] field.ordererNm (기존: "Orderer Nm")
  건너뜀 [en] field.orderDate (기존: "Order Date")
  건너뜀 [en] field.zipCode (기존: "Zip Code")
  건너뜀 [en] field.address1 (기존: "Address1")
  건너뜀 [en] field.address2 (기존: "Address2")
  건너뜀 [en] field.hpNo (기존: "Hp No")
  건너뜀 [en] field.tel (기존: "Tel")
  건너뜀 [en] field.itemCount (기존: "Item Count")
  건너뜀 [en] field.paidAmount (기존: "Paid Amount")
  건너뜀 [en] field.billAmount (기존: "Bill Amount")
  건너뜀 [en] field.privacyPurgedAt (기존: "Privacy Purged At")
  건너뜀 [en] field.receiverNm (기존: "Receiver Nm")
  건너뜀 [en] field.memo (기존: "Memo")
  건너뜀 [ko] menu.order (기존: "주문")
  건너뜀 [en] menu.order (기존: "Order")
  추가   메뉴 BMKOO_L2_MENU ← { path: 'order', nameKey: 'menu.order', component: 'System/PgOrder', roles: STAFF_ROLES },
  추가   팝업 라우트 /popup/order (orderForm)
  코드   zipCode → 공통코드 ZIP_CODE
  생성   src/views/pages/System/PgOrder.vue
  생성   src/views/pages/System/PgOrderForm.vue
  생성   src/views/pages/System/orderPopup.js

완료. npm run check:menu 로 정합성을 확인하세요.
```

</details>

## 2026-11-22 04:06:53 · ✅ 완료

- 명령: `node scripts/genPage.mjs /Users/bmkoo/IdeaProjects/workspace-20260520/backend/src/main/java/com/inno/axboot/admin/domain/mega/OrderItem.java --menu BMKOO_L2_MENU --popup --code-status --api-name onApiGetOrderItem`
- 실행 폴더: `/Users/bmkoo/IdeaProjects/i-wms-new` · 사용자: bmkoo · 소요: 0.0s
- 요약: 엔티티 1 · 생성 3 · 추가 5 · 건너뜀 20
- 바뀐 파일:
  - `src/common/utils/apiFunctions.js`
  - `src/router/index.js`
  - `src/config/menuConfig.js`
  - `src/views/pages/System/PgOrderItem.vue`
  - `src/views/pages/System/PgOrderItemForm.vue`
  - `src/views/pages/System/orderItemPopup.js`

<details><summary>상세 로그 (터미널 출력 전체)</summary>

```
■ OrderItem (주문상세) — 필드 9개
  추가   apiFunctions.onApiGetOrderItem() → GET v1/orderItem
  추가   apiFunctions.onApiGetOrderItemList() → GET v1/orderItem/${id}
  추가   apiFunctions.onApiSaveOrderItem() → POST v1/orderItem/save
  건너뜀 [ko] field.orderId (기존: "주문ID")
  건너뜀 [ko] field.lineNo (기존: "라인번호")
  건너뜀 [ko] field.recipientNm (기존: "주문자(수령자)")
  건너뜀 [ko] field.productCd (기존: "품번")
  건너뜀 [ko] field.productNm (기존: "상품명 (판매처 원문)")
  건너뜀 [ko] field.qty (기존: "수량")
  건너뜀 [ko] field.deliveryStatus (기존: "배송형태(직배송, 업체배송)")
  건너뜀 [ko] field.shippingNo (기존: "송장ID")
  건너뜀 [ko] field.isAssign (기존: "할당여부(직배송,업체발송)")
  건너뜀 [en] field.orderId (기존: "Order Id")
  건너뜀 [en] field.lineNo (기존: "Line No")
  건너뜀 [en] field.recipientNm (기존: "Recipient Nm")
  건너뜀 [en] field.productCd (기존: "Product Cd")
  건너뜀 [en] field.productNm (기존: "Product Nm")
  건너뜀 [en] field.qty (기존: "Qty")
  건너뜀 [en] field.deliveryStatus (기존: "Delivery Status")
  건너뜀 [en] field.shippingNo (기존: "Shipping No")
  건너뜀 [en] field.isAssign (기존: "Is Assign")
  건너뜀 [ko] menu.orderItem (기존: "주문상세")
  건너뜀 [en] menu.orderItem (기존: "Order Item")
  추가   메뉴 BMKOO_L2_MENU ← { path: 'orderItem', nameKey: 'menu.orderItem', component: 'System/PgOrderItem', roles: STAFF_ROLES },
  추가   팝업 라우트 /popup/order-item (orderItemForm)
  코드   _CODE 로 끝나는 문자열 컬럼이 없습니다
  생성   src/views/pages/System/PgOrderItem.vue
  생성   src/views/pages/System/PgOrderItemForm.vue
  생성   src/views/pages/System/orderItemPopup.js

완료. npm run check:menu 로 정합성을 확인하세요.
```

</details>
