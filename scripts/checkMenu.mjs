/**
 * 메뉴 정의 정합성 점검 (node scripts/checkMenu.mjs)
 *
 * - 소메뉴 path(라우트 name) / URL 중복
 * - i18n 키 누락 (ko/en 양쪽)
 * - 대/중메뉴 아이콘이 @ant-design/icons-vue 에 실제로 존재하는지
 */
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';

const load = (p) => import(pathToFileURL(resolve(p)).href);

const { MENUS, LEAF_MENUS, FAVORITE_GROUP } = await load('src/config/menuConfig.js');
const { default: i18n } = await load('src/i18n/i18nData.js');
const icons = await import('@ant-design/icons-vue');

const toUrlPath = (name) => name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
const dig = (obj, key) => key.split('.').reduce((acc, k) => acc?.[k], obj);

const errors = [];
const dup = (list, label) => {
    const seen = new Set();
    for (const v of list) {
        if (seen.has(v)) errors.push(`${label} 중복: ${v}`);
        seen.add(v);
    }
};

dup(
    LEAF_MENUS.map((l) => l.path),
    '라우트 name'
);
dup(
    LEAF_MENUS.map((l) => toUrlPath(l.path)),
    'URL'
);
dup(
    MENUS.flatMap((g) => (g.children || []).map((c) => c.key)),
    '중메뉴 key'
);

const keys = [
    ...MENUS.map((g) => g.nameKey),
    ...MENUS.flatMap((g) => (g.children || []).map((c) => c.nameKey)),
    ...LEAF_MENUS.map((l) => l.nameKey),
    FAVORITE_GROUP.nameKey,
];

const iconNames = [
    ...MENUS.map((g) => g.icon),
    ...MENUS.flatMap((g) => (g.children || []).map((c) => c.icon)),
    FAVORITE_GROUP.icon,
];
for (const icon of iconNames) {
    if (icon && !icons[icon]) errors.push(`아이콘 없음: ${icon}`);
}

for (const locale of ['ko', 'en']) {
    for (const key of keys) {
        if (!dig(i18n[locale], key)) errors.push(`i18n 누락 [${locale}] ${key}`);
    }
}

for (const gnb of MENUS) {
    const leaves = (gnb.children || []).flatMap((c) => c.children || []).length;
    console.log(`${gnb.key.padEnd(8)} 중메뉴 ${String((gnb.children || []).length).padStart(2)}개 / 소메뉴 ${String(leaves).padStart(2)}개`);
}
console.log(`총 소메뉴 ${LEAF_MENUS.length}개`);

if (errors.length) {
    console.error(`\n실패 (${errors.length})\n${errors.join('\n')}`);
    process.exit(1);
}
console.log('\n정합성 OK');
