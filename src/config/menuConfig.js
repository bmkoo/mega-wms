/**
 * WMS 메뉴 정의 (대메뉴 → 중메뉴 → 소메뉴 3단 구조)
 *
 * - 대메뉴: 상단 GNB 탭. 선택 시 좌측 LNB 에 하위 중/소메뉴가 노출된다.
 * - 중메뉴: LNB 아코디언 그룹.
 * - 소메뉴: 실제 라우트. `path` 가 라우트 name 이 되고 `component` 는
 *           `src/views/pages` 하위 경로다. `component` 가 없으면 준비중(PgReady) 화면이 열린다.
 *
 * `nameKey` 는 i18n 키를 그대로 담아두고 화면에서 t() 로 변환한다.
 * (모듈 로딩 시점에 문자열로 굳히면 언어 전환에 반응하지 못한다.)
 */

export const ROLE = Object.freeze({
    ADMIN: 'ADMIN',
    MANAGER: 'MANAGER',
    USER: 'USER',
});

const ALL_ROLES = [ROLE.ADMIN, ROLE.MANAGER, ROLE.USER];
const STAFF_ROLES = [ROLE.ADMIN, ROLE.MANAGER];

export const MENUS = [
    {
        key: 'MYMENU',
        nameKey: 'gnb.myMenu',
        icon: 'StarOutlined',
        children: [
            {
                key: 'MYMENU_WORK',
                nameKey: 'group.myWork',
                icon: 'DesktopOutlined',
                children: [
                    { path: 'dashboard', nameKey: 'menu.dashboard', component: 'MyMenu/PgDashboard', roles: ALL_ROLES },
                    { path: 'realtime', nameKey: 'menu.realtime', roles: ALL_ROLES },
                    { path: 'workMonitor', nameKey: 'menu.workMonitor', roles: ALL_ROLES },
                ],
            },
            {
                key: 'MYMENU_ANALYSIS',
                nameKey: 'group.analysis',
                icon: 'AreaChartOutlined',
                children: [
                    { path: 'statsInOut', nameKey: 'menu.statsInOut', roles: STAFF_ROLES },
                    { path: 'statsTurnover', nameKey: 'menu.statsTurnover', roles: STAFF_ROLES },
                    { path: 'statsWorker', nameKey: 'menu.statsWorker', roles: STAFF_ROLES },
                ],
            },
            {
                key: 'SYSTEM_MENU',
                nameKey: 'group.system',
                icon: 'SettingOutlined',
                children: [
                    { path: 'baseInfoSetting', nameKey: 'menu.baseInfoSetting', roles: STAFF_ROLES },
                    { path: 'channelManage', nameKey: 'menu.channelManage', roles: STAFF_ROLES },
                    { path: 'logisticsWarehouse', nameKey: 'menu.logisticsWarehouse', roles: STAFF_ROLES },
                    { path: 'userPermission', nameKey: 'menu.userPermission', roles: [ROLE.ADMIN] },
                ],
            },
            {
                key: 'MASTER_MENU',
                nameKey: 'group.master',
                icon: 'IdcardOutlined',
                children: [
                    { path: 'maker', nameKey: 'menu.maker', component: 'Master/PgMaker', roles: STAFF_ROLES },
                    {
                        path: 'clothingType',
                        nameKey: 'menu.clothingType',
                        component: 'Master/PgClothingType',
                        roles: STAFF_ROLES,
                    },
                    {
                        path: 'returnReason',
                        nameKey: 'menu.returnReason',
                        component: 'Master/PgReturnReason',
                        roles: STAFF_ROLES,
                    },
                    { path: 'brand', nameKey: 'menu.brand', component: 'Master/PgBrand', roles: STAFF_ROLES },
                    { path: 'waybillSetting', nameKey: 'menu.waybillSetting', roles: STAFF_ROLES },
                ],
            },
            {
                key: 'ORDER_MENU',
                nameKey: 'group.order',
                icon: 'ShoppingCartOutlined',
                children: [
                    { path: 'orderUpload', nameKey: 'menu.orderUpload', roles: STAFF_ROLES },
                    { path: 'orderList', nameKey: 'menu.orderList',  component: 'Order/PgOrderList',   roles: ALL_ROLES },
                    { path: 'confirmMessage', nameKey: 'menu.confirmMessage', roles: STAFF_ROLES },
                ],
            },
            //
            {
                key: 'DELIVERY_MENU',
                nameKey: 'group.delivery',
                icon: 'CarOutlined',
                children: [
                    { path: 'allocate', nameKey: 'menu.allocate', roles: STAFF_ROLES },
                    { path: 'orderLedger', nameKey: 'menu.orderLedger', roles: ALL_ROLES },
                    { path: 'waybillPrint', nameKey: 'menu.waybillPrint', roles: ALL_ROLES },
                    { path: 'invoiceReprint', nameKey: 'menu.invoiceReprint', roles: ALL_ROLES },
                    { path: 'courierTransmit', nameKey: 'menu.courierTransmit', roles: STAFF_ROLES },
                    { path: 'dailyClose', nameKey: 'menu.dailyClose', roles: STAFF_ROLES },
                    { path: 'channelDeliveryList', nameKey: 'menu.channelDeliveryList', roles: ALL_ROLES },
                    { path: 'outboundStatus', nameKey: 'menu.outboundStatus', roles: ALL_ROLES },
                ],
            },
            //
            {
                key: 'PURCHASE_MENU',
                nameKey: 'group.purchase',
                icon: 'FileTextOutlined',
                children: [
                    { path: 'purchaseList', nameKey: 'menu.purchaseList', roles: STAFF_ROLES },
                    { path: 'soldOut', nameKey: 'menu.soldOut', roles: ALL_ROLES },
                    { path: 'inboundScanList', nameKey: 'menu.inboundScanList', roles: ALL_ROLES },
                    { path: 'vendorPurchaseList', nameKey: 'menu.vendorPurchaseList', roles: STAFF_ROLES },
                    { path: 'purchaseSendList', nameKey: 'menu.purchaseSendList', roles: STAFF_ROLES },
                ],
            },
            //
            {
                key: 'SETTLE_MENU',
                nameKey: 'group.settle',
                icon: 'AccountBookOutlined',
                children: [
                    { path: 'orderLedgerDetail', nameKey: 'menu.orderLedgerDetail', roles: STAFF_ROLES },
                    { path: 'salesByChannel', nameKey: 'menu.salesByChannel', roles: STAFF_ROLES },
                    { path: 'salesByProduct', nameKey: 'menu.salesByProduct', roles: STAFF_ROLES },
                    { path: 'salesByBrand', nameKey: 'menu.salesByBrand', roles: STAFF_ROLES },
                    { path: 'salesByMaker', nameKey: 'menu.salesByMaker', roles: STAFF_ROLES },
                    { path: 'salesByKeyword', nameKey: 'menu.salesByKeyword', roles: STAFF_ROLES },
                    { path: 'salesByMonth', nameKey: 'menu.salesByMonth', roles: STAFF_ROLES },
                    { path: 'ecountSalesUpload', nameKey: 'menu.ecountSalesUpload', roles: STAFF_ROLES },
                    { path: 'priceChangeList', nameKey: 'menu.priceChangeList', roles: STAFF_ROLES },
                    { path: 'productSalesHistory', nameKey: 'menu.productSalesHistory', roles: STAFF_ROLES },
                ],
            },
            //
            {
                key: 'PRODUCT_MENU',
                nameKey: 'group.product',
                icon: 'TagsOutlined',
                children: [
                    { path: 'productAssort', nameKey: 'menu.productExcelAssort', roles: ALL_ROLES },
                    { path: 'productBatchUpdate', nameKey: 'menu.productBatchUpdate', roles: STAFF_ROLES },
                    { path: 'barcodeLabel', nameKey: 'menu.barcodeLabel', roles: ALL_ROLES },
                ],
            },
        ],
    },
    {
        key: 'SYSTEM',
        nameKey: 'gnb.system',
        icon: 'SettingOutlined',
        children: [
            {
                key: 'BMKOO_L2_MENU',
                nameKey: 'group.orderInfo',
                icon: 'TagsOutlined',
                children: [
                    { path: 'user', nameKey: 'menu.user', component: 'System/PgUser', roles:ALL_ROLES },
                    { path: 'commonCode', nameKey: 'menu.commonCode', component: 'System/PgCommonCode', roles: STAFF_ROLES },
                    { path: 'errorLog', nameKey: 'menu.errorLog', component: 'System/PgErrorLog', roles: STAFF_ROLES },
                    { path: 'loginHistory', nameKey: 'menu.loginHistory', component: 'System/PgLoginHistory', roles: STAFF_ROLES },
                    { path: 'product', nameKey: 'menu.product', component: 'System/PgProduct', roles: STAFF_ROLES },
                    { path: 'orderRaw', nameKey: 'menu.orderRaw', component: 'System/PgOrderRaw', roles: STAFF_ROLES },
                    { path: 'channel', nameKey: 'menu.channel', component: 'System/PgChannel', roles: STAFF_ROLES },
                    { path: 'order', nameKey: 'menu.order', component: 'System/PgOrder', roles: STAFF_ROLES },
                    { path: 'orderItem', nameKey: 'menu.orderItem', component: 'System/PgOrderItem', roles: STAFF_ROLES },
                    { path: 'stockAssign', nameKey: 'menu.stockAssign', component: 'System/PgStockAssign', roles: STAFF_ROLES },
                    { path: 'orderTransfer', nameKey: 'menu.orderTransfer', component: 'System/PgOrderTransfer', roles: STAFF_ROLES },
                    { path: 'apiLog', nameKey: 'menu.apiLog', component: 'System/PgApiLog', roles: STAFF_ROLES },
                ],
            },
        ],
    },
    {
        key: 'MASTER',
        nameKey: 'gnb.master',
        icon: 'IdcardOutlined',
        children: [

        ],
    },
    {
        key: 'ORDER',
        nameKey: 'gnb.order',
        icon: 'ShoppingCartOutlined',
        children: [

        ],
    },
    {
        key: 'DELIVERY',
        nameKey: 'gnb.delivery',
        icon: 'CarOutlined',
        children: [

        ],
    },
    {
        key: 'PRODUCT',
        nameKey: 'gnb.product',
        icon: 'TagsOutlined',
        children: [

        ],
    },
    {
        key: 'PURCHASE',
        nameKey: 'gnb.purchase',
        icon: 'FileTextOutlined',
        children: [

        ],
    },
    {
        key: 'SETTLE',
        nameKey: 'gnb.settle',
        icon: 'AccountBookOutlined',
        children: [

        ],
    },
    {
        key: 'ETC',
        nameKey: 'gnb.etc',
        icon: 'AppstoreOutlined',
        children: [
            {
                key: 'ETC_BOARD',
                nameKey: 'group.board',
                icon: 'NotificationOutlined',
                children: [{ path: 'notice', nameKey: 'menu.notice', roles: ALL_ROLES }],
            },
            {
                key: 'ETC_WAREHOUSE',
                nameKey: 'group.baseWarehouse',
                icon: 'HomeOutlined',
                children: [
                    { path: 'warehouse', nameKey: 'menu.warehouse', roles: STAFF_ROLES },
                    { path: 'zone', nameKey: 'menu.zone', roles: STAFF_ROLES },
                    { path: 'location', nameKey: 'menu.location', roles: STAFF_ROLES },
                ],
            },
            {
                key: 'ETC_CODE',
                nameKey: 'group.baseCode',
                icon: 'UnorderedListOutlined',
                children: [
                    { path: 'codeGroup', nameKey: 'menu.codeGroup', roles: [ROLE.ADMIN] },
                    { path: 'code', nameKey: 'menu.code', roles: [ROLE.ADMIN] },
                ],
            },
            {
                key: 'ETC_USER',
                nameKey: 'group.systemUser',
                icon: 'TeamOutlined',
                children: [
                    { path: 'userGroup', nameKey: 'menu.userGroup', roles: [ROLE.ADMIN] },
                    { path: 'role', nameKey: 'menu.role', roles: [ROLE.ADMIN] },
                    { path: 'menuManage', nameKey: 'menu.menuManage', roles: [ROLE.ADMIN] },
                    { path: 'roleMenuView', nameKey: 'menu.roleMenuView', roles: [ROLE.ADMIN] },
                    // 본인 정보 조회는 모든 사용자에게 열어 둔다.
                    { path: 'loginUserInfo', nameKey: 'menu.loginUserInfo', roles: ALL_ROLES },
                ],
            },
            {
                key: 'ETC_LOG',
                nameKey: 'group.systemLog',
                icon: 'FileSearchOutlined',
                children: [
                    { path: 'history', nameKey: 'menu.history', roles: [ROLE.ADMIN] },

                ],
            },

        ],
    },
    {
        key: 'REMOTE',
        nameKey: 'gnb.remote',
        icon: 'CustomerServiceOutlined',
        children: [
            {
                key: 'REMOTE_SUPPORT',
                nameKey: 'group.remoteSupport',
                icon: 'ToolOutlined',
                children: [
                    { path: 'remoteRequest', nameKey: 'menu.remoteRequest', roles: ALL_ROLES },
                    { path: 'remoteHistory', nameKey: 'menu.remoteHistory', roles: ALL_ROLES },
                ],
            },
        ],
    }
];

/**
 * 즐겨찾기 그룹.
 * 사용자가 지정한 메뉴로 채워지므로 MENUS 에는 넣지 않고 MyMenu LNB 최상단에 동적으로 붙인다.
 */
export const FAVORITE_GROUP = Object.freeze({
    key: 'MYMENU_FAVORITE',
    nameKey: 'group.favorite',
    icon: 'StarFilled',
    gnbKey: 'MYMENU',
});

/** 대메뉴/중메뉴 정보가 붙은 소메뉴 목록 (라우트 생성·탭·브레드크럼용) */
export const LEAF_MENUS = MENUS.flatMap((gnb) =>
    (gnb.children || []).flatMap((group) =>
        (group.children || []).map((leaf) => ({
            ...leaf,
            gnbKey: gnb.key,
            gnbNameKey: gnb.nameKey,
            groupKey: group.key,
            groupNameKey: group.nameKey,
        }))
    )
);

const LEAF_MAP = new Map(LEAF_MENUS.map((leaf) => [leaf.path, leaf]));

/** 라우트 name 으로 소메뉴 찾기 */
export function findLeafMenu(routeName) {
    return LEAF_MAP.get(routeName) || null;
}

/** 소메뉴 접근 가능 여부 */
export function isMenuAllowed(leaf, roles = []) {
    if (!leaf) return false;
    return !leaf.roles?.length || leaf.roles.some((r) => roles.includes(r));
}

/** 사용자 권한으로 필터링한 메뉴 트리 (빈 그룹/대메뉴는 제거) */
export function filterMenusByRoles(roles = []) {
    const allowed = (leaf) => isMenuAllowed(leaf, roles);

    return MENUS.map((gnb) => ({
        ...gnb,
        children: (gnb.children || [])
            .map((group) => ({ ...group, children: (group.children || []).filter(allowed) }))
            .filter((group) => group.children.length > 0),
    })).filter((gnb) => gnb.children.length > 0);
}
