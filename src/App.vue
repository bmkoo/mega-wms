<template>
  <a-config-provider :locale="antLocale" :theme="antTheme">
    <div id="app">
      <loading
        v-model:active="isLoading"
        :is-full-page="true"
        color="#a51c30"
        background-color="rgba(255, 255, 255, 0.6)"
        loader="dots"
      />
      <RouterView />
      <notifications position="bottom center" />
    </div>
  </a-config-provider>
</template>

<script setup>
import { computed, onMounted } from 'vue';
import { RouterView } from 'vue-router';
import { useI18n } from 'vue-i18n';
import dayjs from 'dayjs';
import 'dayjs/locale/ko';
import koKR from 'ant-design-vue/es/locale/ko_KR';
import enUS from 'ant-design-vue/es/locale/en_US';
import { useLoading } from '@/views/components/fnc';
import { useAppStore } from '@/store/appStore';

const { isLoading } = useLoading();
const { locale } = useI18n();
const appStore = useAppStore();

const antLocale = computed(() => (locale.value === 'en' ? enUS : koKR));

const antTheme = {
  token: {
    colorPrimary: '#a51c30',
    borderRadius: 4,
    fontSize: 13,
    controlHeight: 30,
  },
};

onMounted(() => {
  locale.value = appStore.locale;
  dayjs.locale(appStore.locale === 'en' ? 'en' : 'ko');
});
</script>

<style>
#app {
  height: 100%;
}
</style>
