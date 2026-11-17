/**
 * JPA 엔티티 → i-WMS 조회 화면 생성기
 *
 *   node scripts/genPage.mjs <Entity.java ...> --menu <중메뉴 key> [--popup] [--folder <폴더>] [--roles STAFF_ROLES]
 *                            [--api <주소>] [--api-name <메서드명>] [--keep] [--dry-run]
 *
 *   --menu <key>       (필수) 소메뉴를 넣을 중메뉴 key (menuConfig.js 의 중메뉴 key. 예: ORDER_MENU, BMKOO)
 *   --popup            상세 폼 팝업도 만든다 (순번 클릭 → 팝업, 단건 조회 + 저장). 없으면 목록 화면만 만든다
 *   --folder <폴더>     화면 폴더. 기본은 대메뉴 key (ORDER → Order, BMKOO → Bmkoo)
 *   --roles <상수>      메뉴 권한. 기본 STAFF_ROLES (ALL_ROLES 가능)
 *   --api <주소>        API 주소. 기본 v1/<엔티티키> (예: --api /api/v1/order)
 *   --api-name <이름>   목록 조회 메서드명. 기본 onApiQuery<Entity> (기존 메서드와 이름이 겹칠 때 사용)
 *   --keep             이미 있는 화면 파일을 덮어쓰지 않는다 (기본은 덮어쓴다)
 *   --dry-run          파일을 쓰지 않고 무엇을 할지만 보여준다
 *   (--api / --api-name 은 엔티티 파일을 하나만 줄 때만 쓸 수 있다)
 *
 * 예) 프로젝트 루트(/Users/bmkoo/IdeaProjects/i-wms-new)에서 실행
 *   # 목록 화면만 (미리보기)
 *   node /Users/bmkoo/IdeaProjects/i-wms-new/scripts/genPage.mjs \
 *     /Users/bmkoo/IdeaProjects/workspace-20260520/backend/src/main/java/com/inno/axboot/admin/domain/mega/OrderItem.java \
 *     --menu BMKOO --dry-run
 *
 *   # 목록 + 상세 폼 팝업
 *   node /Users/bmkoo/IdeaProjects/i-wms-new/scripts/genPage.mjs \
 *     /Users/bmkoo/IdeaProjects/workspace-20260520/backend/src/main/java/com/inno/axboot/admin/domain/mega/OrderItem.java \
 *     --menu BMKOO --popup
 *
 *   # 메서드명이 기존 것과 겹칠 때 (onApiQueryOrder 는 출고 API 가 이미 사용)
 *   node /Users/bmkoo/IdeaProjects/i-wms-new/scripts/genPage.mjs \
 *     /Users/bmkoo/IdeaProjects/workspace-20260520/backend/src/main/java/com/inno/axboot/admin/domain/mega/Order.java \
 *     --menu BMKOO --popup --api-name onApiQueryOrderEntity
 *
 *   # 엔티티 여러 개를 한 번에
 *   node /Users/bmkoo/IdeaProjects/i-wms-new/scripts/genPage.mjs \
 *     /Users/bmkoo/IdeaProjects/workspace-20260520/backend/src/main/java/com/inno/axboot/admin/domain/mega/Order.java \
 *     /Users/bmkoo/IdeaProjects/workspace-20260520/backend/src/main/java/com/inno/axboot/admin/domain/mega/OrderItem.java \
 *     --menu BMKOO
 *
 * 하는 일 (엔티티마다)
 *   1. apiFunctions.js 에 API 메서드 추가 (같은 이름·같은 주소면 그대로 쓰고, 주소가 다르면 그 엔티티는 중단)
 *        onApiQuery<Entity>(params) → GET <주소>          (목록)
 *        onApiGet<Entity>(id)       → GET <주소>/{id}     (--popup. @Id 가 여러 개면 id = "값1,값2")
 *        onApiSave<Entity>(data)    → POST <주소>/save    (--popup. body = 행 전체 JSON)
 *   2. i18nData.js  ko/en 의 field.<필드명>, menu.<엔티티키> 추가 (이미 있는 키는 건너뛴다)
 *   3. menuConfig.js 지정한 중메뉴 children 끝에 소메뉴 추가 (같은 path 가 있으면 건너뛴다)
 *   4. (--popup) router/index.js 의 /popup 아래에 상세 폼 라우트 추가 (/popup/<kebab>, name <엔티티키>Form)
 *   5. src/views/pages/<폴더>/ 에 생성 (templates/ 의 각 .tpl)
 *        Pg<Entity>.vue      목록 (--popup 이면 순번 클릭 → 상세 팝업)
 *        Pg<Entity>Form.vue  (--popup) 상세 폼 (@Id 외 필드 수정 + 저장 → 목록 다시 조회)
 *        <엔티티키>Popup.js   (--popup) 팝업 창 열기 / 행 전달
 *
 * 엔티티에서 읽는 것: 클래스 @Comment, @Column 이 붙은 필드의 이름/타입/@Comment/length.
 * 부모 클래스(SimpleJpaModel 등)의 필드와 @Column 이 없는 필드(@IdClass 내부 클래스 등)는 제외한다.
 */


// #node scripts/genPage.mjs /Users/bmkoo/IdeaProjects/workspace-20260520/backend/src/main/java/com/inno/axboot/admin/domain/mega/OrderRaw.java --menu BMKOO --api v1/orderRaw

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, dirname, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const ROOT = resolve(dirname(new URL(import.meta.url).pathname), '..');
const I18N_FILE = resolve(ROOT, 'src/i18n/i18nData.js');
const MENU_FILE = resolve(ROOT, 'src/config/menuConfig.js');
const API_FILE = resolve(ROOT, 'src/common/utils/apiFunctions.js');
const ROUTER_FILE = resolve(ROOT, 'src/router/index.js');
const TEMPLATE_FILE = resolve(ROOT, 'scripts/templates/PgEntity.vue.tpl');
const FORM_TEMPLATE_FILE = resolve(ROOT, 'scripts/templates/PgEntityForm.vue.tpl');
const POPUP_TEMPLATE_FILE = resolve(ROOT, 'scripts/templates/entityPopup.js.tpl');
const PAGES_DIR = resolve(ROOT, 'src/views/pages');

const NUMBER_TYPES = ['Integer', 'int', 'Long', 'long', 'Short', 'short', 'Double', 'double', 'Float', 'float', 'BigDecimal', 'BigInteger'];
const DATE_TYPES = ['LocalDateTime', 'LocalDate', 'LocalTime', 'Timestamp', 'Date', 'Instant', 'ZonedDateTime'];
/** 저장할 때 서버로 보내는 날짜 형식 (dayjs). 백엔드 Jackson: LocalDateTime=ISO_LOCAL_DATE_TIME, LocalDate=ISO_LOCAL_DATE */
const DATE_FORMATS = { LocalDateTime: 'YYYY-MM-DDTHH:mm:ss', LocalDate: 'YYYY-MM-DD' };

// ─────────────────────────────────────────────
// 인자
// ─────────────────────────────────────────────
function parseArgs(argv) {
    const opts = { files: [], menu: '', folder: '', roles: 'STAFF_ROLES', force: true, dryRun: false, popup: false };
    for (let i = 0; i < argv.length; i += 1) {
        const arg = argv[i];
        if (arg === '--menu') opts.menu = argv[++i];
        else if (arg === '--folder') opts.folder = argv[++i];
        else if (arg === '--roles') opts.roles = argv[++i];
        else if (arg === '--api') opts.api = argv[++i];
        else if (arg === '--api-name') opts.apiName = argv[++i];
        else if (arg === '--popup') opts.popup = true;
        else if (arg === '--force') opts.force = true;
        else if (arg === '--keep') opts.force = false;
        else if (arg === '--dry-run') opts.dryRun = true;
        else opts.files.push(arg);
    }
    if (!opts.files.length || !opts.menu) {
        console.error(
            '사용법: node scripts/genPage.mjs <Entity.java ...> --menu <중메뉴 key> [--popup] [--folder <폴더>] [--roles STAFF_ROLES] [--api <주소>] [--api-name <메서드명>] [--keep] [--dry-run]'
        );
        process.exit(1);
    }
    if ((opts.api || opts.apiName) && opts.files.length > 1) {
        console.error('--api / --api-name 은 엔티티 파일을 하나만 줄 때 쓸 수 있습니다');
        process.exit(1);
    }
    return opts;
}

// ─────────────────────────────────────────────
// 엔티티 파싱
// ─────────────────────────────────────────────
const commentOf = (text) => text.match(/@Comment\(\s*(?:value\s*=\s*)?"([^"]*)"\s*\)/)?.[1] ?? '';

function parseEntity(file) {
    const src = readFileSync(file, 'utf8');
    const classMatch = src.match(/public\s+class\s+(\w+)/);
    if (!classMatch) throw new Error(`클래스 선언을 찾을 수 없습니다: ${file}`);
    const className = classMatch[1];
    const label = commentOf(src.slice(0, classMatch.index));

    // 필드 선언 하나 = 직전 선언/블록 끝 이후의 어노테이션 묶음 + "private Type name;"
    const fields = [];
    // 어노테이션 인자 안의 문자열에 괄호가 있을 수 있다 (예: @Comment("주문자(수령자)"))
    const fieldRe = /((?:\s*@\w+(?:\((?:"[^"]*"|[^)"])*\))?)*)\s*private\s+([\w<>, ]+?)\s+(\w+)\s*;/g;
    for (const m of src.matchAll(fieldRe)) {
        const annotations = m[1];
        if (!/@Column\b/.test(annotations)) continue;
        fields.push({
            name: m[3],
            type: m[2].trim(),
            label: commentOf(annotations),
            length: Number(annotations.match(/length\s*=\s*(\d+)/)?.[1] || 0),
            isId: /@Id\b/.test(annotations),
        });
    }
    if (!fields.length) throw new Error(`@Column 필드가 없습니다: ${file}`);
    return { className, key: className[0].toLowerCase() + className.slice(1), label, fields };
}

/** 서버 경로 → apiFunctions baseURL(…/api/) 기준 상대경로. "/api/v1/order" → "v1/order" */
const toApiPath = (url) => url.replace(/^\/?(api\/)?/, '');

// ─────────────────────────────────────────────
// apiFunctions.js : 조회 메서드 추가
// ─────────────────────────────────────────────
const API_SECTION = '// 자동 생성 조회 API (scripts/genPage.mjs)';

/**
 * API 메서드를 추가한다. kind
 *  - 'query' : methodName(params) → GET  <apiPath>?params     (목록)
 *  - 'get'   : methodName(id)     → GET  <apiPath>/${id}      (단건, 상세 팝업)
 *  - 'save'  : methodName(data)   → POST <apiPath>/save       (상세 팝업 저장)
 * methodName 이 이미 있으면 그 주소를 비교한다.
 *  - 같은 주소: 그대로 사용 { text, ok: true }
 *  - 다른 주소: 덮어쓰지 않음 { ok: false, existingUrl }
 * 없으면 클래스 끝(자동 생성 구역)에 추가한다.
 */
function addApiMethod(text, methodName, apiPath, log, kind = 'query') {
    const url = kind === 'get' ? `${apiPath}/\${id}` : kind === 'save' ? `${apiPath}/save` : apiPath;
    const verb = kind === 'save' ? 'POST' : 'GET';
    const defAt = text.search(new RegExp(`^\\s{4}${methodName}\\s*\\(`, 'm'));
    if (defAt >= 0) {
        const body = text.slice(defAt, text.indexOf('\n    }', defAt));
        const existingUrl = body.match(/fnc\w+Api\(\s*['"`]([^'"`]*)/)?.[1] ?? '';
        if (toApiPath(existingUrl) !== url) return { ok: false, existingUrl };
        log.push(`  유지   apiFunctions.${methodName}() → ${verb} ${url} (이미 있음)`);
        return { text, ok: true };
    }

    const classOpen = text.indexOf('{', text.search(/\bclass\s+apiFunctions\b/));
    const classClose = matchBracket(text, classOpen);
    const lineStart = text.lastIndexOf('\n', classClose) + 1;
    const lines = [];
    if (!text.includes(API_SECTION)) {
        lines.push('', '    // ─────────────────────────────────────────────', `    ${API_SECTION}`, '    // ─────────────────────────────────────────────');
    } else {
        lines.push('');
    }
    if (kind === 'get') {
        lines.push(`    ${methodName}(id) {`, `        return this.fncGetApi(\`${url}\`);`, '    }');
    } else if (kind === 'save') {
        lines.push(`    ${methodName}(data) {`, `        return this.fncPostApi('${url}', data);`, '    }');
    } else {
        lines.push(`    ${methodName}(params) {`, `        return this.fncGetApi('${url}', params);`, '    }');
    }
    log.push(`  추가   apiFunctions.${methodName}() → ${verb} ${url}`);
    const before = text.slice(0, lineStart).replace(/\s*$/, '\n');
    return { text: `${before}${lines.join('\n')}\n${text.slice(lineStart)}`, ok: true };
}

const kindOf = (type) => (NUMBER_TYPES.includes(type) ? 'number' : DATE_TYPES.includes(type) ? 'date' : 'text');

/** 그리드 컬럼 정의 (className / width) */
function toColumn(field) {
    const kind = kindOf(field.type);
    if (kind === 'number') return { data: field.name, type: kind, className: 'htRight', width: 90 };
    if (kind === 'date') return { data: field.name, type: kind, className: 'htCenter', width: 140, format: DATE_FORMATS[field.type] || DATE_FORMATS.LocalDateTime };
    const width = field.length >= 100 ? 220 : field.length > 0 && field.length <= 10 ? 90 : 120;
    return { data: field.name, type: kind, className: '', width };
}

/** camelCase → "Camel Case" (영문 라벨 초안) */
const toTitle = (name) =>
    name
        .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
        .replace(/^./, (c) => c.toUpperCase());

const toKebab = (name) => name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();

// ─────────────────────────────────────────────
// JS 소스 블록 탐색 (문자열/주석 안의 괄호는 무시)
// ─────────────────────────────────────────────
/** text[open] 의 '{' 또는 '[' 에 짝이 맞는 닫는 괄호 위치 */
function matchBracket(text, open) {
    const pairs = { '{': '}', '[': ']' };
    const stack = [];
    for (let i = open; i < text.length; i += 1) {
        const c = text[i];
        if (c === '/' && text[i + 1] === '/') {
            i = text.indexOf('\n', i);
            if (i < 0) break;
            continue;
        }
        if (c === '/' && text[i + 1] === '*') {
            i = text.indexOf('*/', i) + 1;
            continue;
        }
        if (c === "'" || c === '"' || c === '`') {
            for (i += 1; i < text.length && text[i] !== c; i += 1) if (text[i] === '\\') i += 1;
            continue;
        }
        if (pairs[c]) stack.push(pairs[c]);
        else if (c === '}' || c === ']') {
            if (stack.pop() !== c) throw new Error(`괄호 짝이 맞지 않습니다 (위치 ${i})`);
            if (!stack.length) return i;
        }
    }
    throw new Error('닫는 괄호를 찾을 수 없습니다');
}

/** [start, end) 범위 안에서 바로 한 단계 아래에 있는 `key: {` 블록의 { 위치 */
function findChildBlock(text, start, end, key) {
    const re = new RegExp(`(^|[\\s,{])${key}\\s*:\\s*([{\\[])`, 'g');
    re.lastIndex = start + 1;
    let m;
    while ((m = re.exec(text)) && m.index < end) {
        const open = m.index + m[0].length - 1;
        // 바로 아래 단계인지: start 의 괄호 안쪽에서 open 까지 다른 블록 안에 있지 않아야 한다
        let depth = 0;
        for (let i = start + 1; i < open; i += 1) {
            const c = text[i];
            if (c === "'" || c === '"' || c === '`') {
                for (i += 1; i < open && text[i] !== c; i += 1) if (text[i] === '\\') i += 1;
            } else if (c === '{' || c === '[') depth += 1;
            else if (c === '}' || c === ']') depth -= 1;
        }
        if (depth === 0) return open;
    }
    return -1;
}

/** close 위치(닫는 괄호) 바로 앞에 lines 를 끼워 넣는다. 들여쓰기는 블록의 마지막 항목을 따른다 */
function insertBeforeClose(text, close, lines) {
    const lineStart = text.lastIndexOf('\n', close) + 1;
    const closeIndent = text.slice(lineStart, close);
    const indent = /^\s*$/.test(closeIndent) ? closeIndent + '    ' : '    ';
    const body = lines.map((line) => `${indent}${line}\n`).join('');
    // 마지막 항목 뒤에 쉼표가 없으면 붙인다
    let before = text.slice(0, lineStart).replace(/\s*$/, '');
    if (!/[,{[]$/.test(before)) before += ',';
    return `${before}\n${body}${text.slice(lineStart)}`;
}

const quote = (value) => `'${String(value).replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;

// ─────────────────────────────────────────────
// i18nData.js
// ─────────────────────────────────────────────
function addI18n(text, existing, locale, section, entries, log) {
    const rootOpen = text.indexOf('{', text.indexOf('export default'));
    const rootClose = matchBracket(text, rootOpen);
    const localeOpen = findChildBlock(text, rootOpen, rootClose, locale);
    if (localeOpen < 0) throw new Error(`i18nData.js 에 ${locale} 블록이 없습니다`);
    const localeClose = matchBracket(text, localeOpen);
    const sectionOpen = findChildBlock(text, localeOpen, localeClose, section);
    if (sectionOpen < 0) throw new Error(`i18nData.js 에 ${locale}.${section} 블록이 없습니다`);

    const lines = [];
    for (const [key, value] of entries) {
        const current = existing[locale]?.[section]?.[key];
        if (current !== undefined) {
            log.push(`  건너뜀 [${locale}] ${section}.${key} (기존: ${JSON.stringify(current)})`);
            continue;
        }
        lines.push(`${key}: ${quote(value)},`);
        log.push(`  추가   [${locale}] ${section}.${key} = ${JSON.stringify(value)}`);
        existing[locale][section][key] = value; // 같은 실행 안의 다음 엔티티가 중복 추가하지 않게
    }
    if (!lines.length) return text;
    return insertBeforeClose(text, matchBracket(text, sectionOpen), lines);
}

// ─────────────────────────────────────────────
// menuConfig.js
// ─────────────────────────────────────────────
function addMenu(text, menuKey, leafLine, log) {
    const keyAt = text.search(new RegExp(`key:\\s*'${menuKey}'`));
    if (keyAt < 0) throw new Error(`menuConfig.js 에 중메뉴 key '${menuKey}' 가 없습니다`);
    const groupOpen = text.lastIndexOf('{', keyAt);
    const groupClose = matchBracket(text, groupOpen);
    const childrenOpen = findChildBlock(text, groupOpen, groupClose, 'children');
    if (childrenOpen < 0) throw new Error(`중메뉴 '${menuKey}' 에 children 이 없습니다`);
    log.push(`  추가   메뉴 ${menuKey} ← ${leafLine}`);
    return insertBeforeClose(text, matchBracket(text, childrenOpen), [leafLine]);
}

// ─────────────────────────────────────────────
// router/index.js : 상세 폼 팝업 라우트 (/popup/<kebab>)
// ─────────────────────────────────────────────
/** menuConfig 의 권한 상수 → router 에서 쓰는 ROLE 배열 (router 는 ROLE 만 import 한다) */
const ROUTER_ROLES = {
    STAFF_ROLES: '[ROLE.ADMIN, ROLE.MANAGER]',
    ALL_ROLES: '[ROLE.ADMIN, ROLE.MANAGER, ROLE.USER]',
};

function addPopupRoute(text, { routeName, popupPath, component, nameKey, roles }, log) {
    if (new RegExp(`name:\\s*'${routeName}'`).test(text)) {
        log.push(`  건너뜀 팝업 라우트 '${routeName}' (이미 있음)`);
        return text;
    }
    const popupAt = text.search(/path:\s*'\/popup'/);
    if (popupAt < 0) throw new Error("router/index.js 에 path: '/popup' 라우트가 없습니다");
    const blockOpen = text.lastIndexOf('{', popupAt);
    const childrenOpen = findChildBlock(text, blockOpen, matchBracket(text, blockOpen), 'children');
    if (childrenOpen < 0) throw new Error("router/index.js 의 '/popup' 라우트에 children 이 없습니다");
    const lines = [
        '{',
        `    path: '${popupPath}',`,
        `    name: '${routeName}',`,
        `    component: () => import('@/views/pages/${component}.vue'),`,
        '    meta: {',
        '        requiresAuth: true,',
        `        role: ${ROUTER_ROLES[roles] || roles},`,
        `        nameKey: '${nameKey}',`,
        '        popup: true,',
        '    },',
        '},',
    ];
    log.push(`  추가   팝업 라우트 /popup/${popupPath} (${routeName})`);
    return insertBeforeClose(text, matchBracket(text, childrenOpen), lines);
}

// ─────────────────────────────────────────────
// 화면 파일
// ─────────────────────────────────────────────
/** 목록 / 폼 / 팝업 헬퍼 템플릿에 공통으로 넣는 값 */
function templateVars(entity, entityFile, api) {
    const columns = entity.fields.map(toColumn);
    const fieldLines = columns
        .map(
            (c) =>
                `  { data: '${c.data}', type: '${c.type}', className: '${c.className}', width: ${c.width}${c.format ? `, format: '${c.format}'` : ''} },`
        )
        .join('\n');
    // 기본 정렬: 첫 날짜 필드 내림차순(최신 먼저), 날짜 필드가 없으면 @Id 오름차순
    const firstDate = columns.find((c) => c.type === 'date')?.data;
    const idFields = entity.fields.filter((f) => f.isId).map((f) => f.name);
    if (!idFields.length) idFields.push(columns[0].data);
    const defaultSort = firstDate ? `${firstDate}:desc` : `${idFields[0]}:asc`;
    return {
        __PREFIX__: toKebab(entity.key),
        __KEY__: entity.key,
        __ENTITY__: entity.className,
        __ENTITY_FILE__: basename(entityFile),
        __API_URL__: api.path,
        __API_METHOD__: api.queryMethod,
        __GET_API_METHOD__: api.getMethod,
        __SAVE_API_METHOD__: api.saveMethod,
        __POPUP_FILE__: `${entity.key}Popup`,
        __POPUP_PATH__: toKebab(entity.key),
        __ID_FIELDS__: `[${idFields.map((f) => `'${f}'`).join(', ')}]`,
        __FIELDS__: fieldLines,
        __DEFAULT_SORT__: defaultSort,
    };
}

/**
 * 템플릿 조건 구역 처리. 마커는 한 줄에 단독으로 쓴다 (중첩 불가)
 *   // #if popup   …   // #else   …   // #endif        (JS)
 *   /* #if popup *\/ … /* #endif *\/                     (CSS)
 */
function applyConditions(template, flags) {
    const marker = /^\s*(?:\/\/|\/\*)\s*#(if\s+(\w+)|else|endif)\b.*$/;
    const out = [];
    let keep = true;
    let cond = null;
    for (const line of template.split('\n')) {
        const m = line.match(marker);
        if (!m) {
            if (keep) out.push(line);
            continue;
        }
        if (m[2]) {
            cond = !!flags[m[2]];
            keep = cond;
        } else if (m[1] === 'else') {
            keep = !cond;
        } else {
            keep = true;
            cond = null;
        }
    }
    return out.join('\n');
}

const fillTemplate = (template, vars, flags = {}) =>
    applyConditions(template, flags).replace(/__[A-Z_]+__/g, (token) => (token in vars ? vars[token] : token));

// ─────────────────────────────────────────────
// 실행
// ─────────────────────────────────────────────
const opts = parseArgs(process.argv.slice(2));

const load = (p) => import(`${pathToFileURL(p).href}?t=${Date.now()}`);
const { default: i18nObj } = await load(I18N_FILE);
const { MENUS, LEAF_MENUS } = await load(MENU_FILE);
const existing = structuredClone(i18nObj);

const gnb = MENUS.find((g) => (g.children || []).some((c) => c.key === opts.menu));
if (!gnb) {
    console.error(`중메뉴 key '${opts.menu}' 를 menuConfig.js 에서 찾을 수 없습니다`);
    process.exit(1);
}
const folder = opts.folder || gnb.key[0] + gnb.key.slice(1).toLowerCase();
const paths = new Set(LEAF_MENUS.map((l) => l.path));

let i18nText = readFileSync(I18N_FILE, 'utf8');
let menuText = readFileSync(MENU_FILE, 'utf8');
let apiText = readFileSync(API_FILE, 'utf8');
let routerText = readFileSync(ROUTER_FILE, 'utf8');
const template = readFileSync(TEMPLATE_FILE, 'utf8');
const formTemplate = readFileSync(FORM_TEMPLATE_FILE, 'utf8');
const popupTemplate = readFileSync(POPUP_TEMPLATE_FILE, 'utf8');
const pageWrites = [];
const log = [];
const failed = [];

// npm run 은 작업 폴더를 프로젝트 루트로 바꾸므로, 상대경로는 명령을 실행한 폴더(INIT_CWD) 기준으로 푼다
const CALLER_DIR = process.env.INIT_CWD || process.cwd();

for (const file of opts.files) {
    const entityPath = resolve(CALLER_DIR, file);
    if (!existsSync(entityPath)) {
        console.error(`엔티티 파일이 없습니다: ${entityPath}`);
        process.exit(1);
    }
    const entity = parseEntity(entityPath);
    log.push(`\n■ ${entity.className} (${entity.label || '라벨 없음'}) — 필드 ${entity.fields.length}개`);

    // 1. API 메서드: 목록 onApiQuery<Entity>(params)
    //    --popup 이면 단건 onApiGet<Entity>(id) / 저장 onApiSave<Entity>(data) 도 추가한다
    //    이름이 겹치는데 주소가 다르면 이 엔티티는 아무것도 하지 않는다
    const apiPath = opts.api ? toApiPath(opts.api) : `v1/${entity.key}`;
    const api = {
        path: apiPath,
        queryMethod: opts.apiName || `onApiQuery${entity.className}`,
        getMethod: `onApiGet${entity.className}`,
        saveMethod: `onApiSave${entity.className}`,
    };
    let nextApiText = apiText;
    let conflict = null;
    const methods = [[api.queryMethod, 'query']];
    if (opts.popup) methods.push([api.getMethod, 'get'], [api.saveMethod, 'save']);
    for (const [name, kind] of methods) {
        const result = addApiMethod(nextApiText, name, apiPath, log, kind);
        if (!result.ok) {
            conflict = { name, kind, existingUrl: result.existingUrl };
            break;
        }
        nextApiText = result.text;
    }
    if (conflict) {
        log.push(
            `  중단   apiFunctions.${conflict.name}() 가 이미 다른 주소(${conflict.existingUrl})를 씁니다.` +
                (conflict.kind === 'query' ? ` --api-name 으로 다른 이름을 지정하세요 (예: --api-name ${conflict.name}List)` : '')
        );
        failed.push(entity.className);
        continue;
    }
    apiText = nextApiText;

    // 2. i18n
    const fieldEntries = entity.fields.map((f) => [f.name, f.label || toTitle(f.name)]);
    i18nText = addI18n(i18nText, existing, 'ko', 'field', fieldEntries, log);
    i18nText = addI18n(i18nText, existing, 'en', 'field', entity.fields.map((f) => [f.name, toTitle(f.name)]), log);
    i18nText = addI18n(i18nText, existing, 'ko', 'menu', [[entity.key, entity.label || entity.className]], log);
    i18nText = addI18n(i18nText, existing, 'en', 'menu', [[entity.key, toTitle(entity.className)]], log);

    // 3. 메뉴
    const component = `${folder}/Pg${entity.className}`;
    if (paths.has(entity.key)) {
        log.push(`  건너뜀 메뉴 path '${entity.key}' (이미 있음)`);
    } else {
        const leaf = `{ path: '${entity.key}', nameKey: 'menu.${entity.key}', component: '${component}', roles: ${opts.roles} },`;
        menuText = addMenu(menuText, opts.menu, leaf, log);
        paths.add(entity.key);
    }

    // 4. 상세 폼 팝업 라우트 (--popup)
    const formComponent = `${folder}/Pg${entity.className}Form`;
    if (opts.popup) {
        routerText = addPopupRoute(
            routerText,
            {
                routeName: `${entity.key}Form`,
                popupPath: toKebab(entity.key),
                component: formComponent,
                nameKey: `menu.${entity.key}`,
                roles: opts.roles,
            },
            log
        );
    }

    // 5. 화면: 목록 (+ --popup 이면 상세 폼 / 팝업 헬퍼)
    const vars = templateVars(entity, file, api);
    const outputs = [[`${component}.vue`, template]];
    if (opts.popup) {
        outputs.push([`${formComponent}.vue`, formTemplate], [`${folder}/${entity.key}Popup.js`, popupTemplate]);
    }
    for (const [rel, tpl] of outputs) {
        const target = resolve(PAGES_DIR, rel);
        if (existsSync(target) && !opts.force) {
            log.push(`  건너뜀 ${rel} (이미 있음, --keep)`);
            continue;
        }
        pageWrites.push([target, fillTemplate(tpl, vars, { popup: opts.popup })]);
        log.push(`  ${existsSync(target) ? '덮어씀' : '생성  '} src/views/pages/${rel}`);
    }
    // 팝업 없이 다시 만들면 예전에 만든 팝업 파일은 쓰이지 않게 된다. 지우지는 않고 알려만 준다
    if (!opts.popup) {
        const leftovers = [`${formComponent}.vue`, `${folder}/${entity.key}Popup.js`].filter((rel) => existsSync(resolve(PAGES_DIR, rel)));
        if (leftovers.length) log.push(`  참고   팝업 없이 생성: 기존 ${leftovers.join(', ')} 와 /popup 라우트는 그대로 둡니다`);
    }
}

console.log(log.join('\n'));

if (opts.dryRun) {
    console.log('\n--dry-run: 파일을 쓰지 않았습니다.');
} else {
    writeFileSync(API_FILE, apiText);
    writeFileSync(ROUTER_FILE, routerText);
    writeFileSync(I18N_FILE, i18nText);
    writeFileSync(MENU_FILE, menuText);
    for (const [file, content] of pageWrites) {
        mkdirSync(dirname(file), { recursive: true });
        writeFileSync(file, content);
    }
    console.log('\n완료. npm run check:menu 로 정합성을 확인하세요.');
}

if (failed.length) {
    console.error(`\n중단된 엔티티: ${failed.join(', ')}\n\n\n`);
    process.exit(1);
}
