import { createI18n } from 'vue-i18n';
import i18nData from './i18nData';

const i18n = createI18n({
    legacy: false, // Composition API 사용
    globalInjection: true, // 템플릿에서 $t 사용 허용
    locale: localStorage.getItem('locale') || 'ko',
    fallbackLocale: 'ko',
    messages: i18nData,
});

export default i18n;
