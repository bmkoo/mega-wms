import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';

export default defineConfig(() => {
    return {
        root: '.',
        publicDir: 'public',
        // Firebase Hosting 도메인 루트에서 서비스한다.
        // 하위 경로(예: /wms/)로 배포할 때만 이 값을 바꾸면 된다.
        base: '/',
        plugins: [vue()],
        resolve: {
            alias: {
                '@': path.resolve(__dirname, './src'),
            },
            dedupe: ['handsontable'],
        },
        optimizeDeps: {
            include: ['handsontable', 'handsontable/base', 'handsontable/registry', '@handsontable/vue3'],
        },
        server: {
            port: 5174,
            host: true,
        },
    };
});
