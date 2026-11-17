<template>
  <div class="frame">
    <!-- 상단: 로고 + 대메뉴 + 사용자 유틸 -->
    <app-header @onClickSetting="settingOpen = true" />

    <!-- 상단 2단: 사용자 정보 + 작업 창고 -->
    <app-user-bar />

    <div class="frame__body">
      <!-- 좌측: 중메뉴 / 소메뉴 -->
      <app-side-bar />

      <!-- 우측: 컨텐츠 -->
      <section class="frame__content">
        <app-stack-tab />
        <app-page-head />
        <div class="frame__scroll">
          <router-view v-slot="{ Component }">
            <keep-alive :max="10" :exclude="['PgBrand', 'PgOrderList', 'PgMaker']">
              <component :is="Component" :key="route.name" />
            </keep-alive>
          </router-view>
        </div>
      </section>
    </div>

    <app-footer />
    <app-setting v-model:open="settingOpen" />
  </div>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useMenuStore } from '@/store/menuStore';
import AppHeader from '@/views/components/Frame/AppHeader.vue';
import AppUserBar from '@/views/components/Frame/AppUserBar.vue';
import AppSideBar from '@/views/components/Frame/AppSideBar.vue';
import AppStackTab from '@/views/components/Frame/AppStackTab.vue';
import AppPageHead from '@/views/components/Frame/AppPageHead.vue';
import AppFooter from '@/views/components/Frame/AppFooter.vue';
import AppSetting from '@/views/components/Frame/AppSetting.vue';

const route = useRoute();
const menuStore = useMenuStore();
const settingOpen = ref(false);

watch(
  () => route.name,
  (name) => {
    if (name) menuStore.syncRoute(name);
  },
  { immediate: true }
);

onMounted(() => menuStore.loadFavorites());
</script>

<style scoped>
.frame {
  display: flex;
  flex-direction: column;
  height: 100vh;
  min-width: 1180px;
  overflow: hidden;
  background-color: var(--wms-bg);
}

.frame__body {
  display: flex;
  flex: 1;
  min-height: 0;
}

.frame__content {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-width: 0;
}

.frame__scroll {
  flex: 1;
  overflow: auto;
}
</style>
