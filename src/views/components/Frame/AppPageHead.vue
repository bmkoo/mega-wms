<template>
  <div class="pagehead">
    <div class="pagehead__left">
      <h1 class="pagehead__title ellipsis">{{ title }}</h1>
      <a-tooltip
        v-if="leaf"
        :title="isFavorite ? t('common.removeFavorite') : t('common.addFavorite')"
      >
        <button
          type="button"
          class="pagehead__star"
          :class="{ 'pagehead__star--on': isFavorite }"
          @click="onToggleFavorite"
        >
          <StarFilled v-if="isFavorite" />
          <StarOutlined v-else />
        </button>
      </a-tooltip>
    </div>

    <a-breadcrumb class="pagehead__crumb" separator="›">
      <a-breadcrumb-item v-for="(crumb, index) in crumbs" :key="index">
        {{ crumb }}
      </a-breadcrumb-item>
    </a-breadcrumb>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { message } from 'ant-design-vue';
import { findLeafMenu } from '@/config/menuConfig';
import { useMenuStore } from '@/store/menuStore';

const { t } = useI18n();
const route = useRoute();
const menuStore = useMenuStore();

const leaf = computed(() => findLeafMenu(route.name));
const isFavorite = computed(() => !!leaf.value && menuStore.isFavorite(leaf.value.path));

const onToggleFavorite = () => {
  const added = menuStore.toggleFavorite(leaf.value.path);
  message.success(t(added ? 'message.favoriteAdded' : 'message.favoriteRemoved'));
};

const title = computed(() => {
  if (leaf.value) return t(leaf.value.nameKey);
  return route.meta?.nameKey ? t(route.meta.nameKey) : '';
});

const crumbs = computed(() => {
  if (!leaf.value) return [];
  return [t(leaf.value.gnbNameKey), t(leaf.value.groupNameKey), t(leaf.value.nameKey)];
});
</script>

<style scoped>
.pagehead {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  height: 36px;
  padding: 0 14px;
  background-color: var(--wms-panel);
  border-bottom: 1px solid var(--wms-border);
}

.pagehead__left {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
}

.pagehead__title {
  margin: 0;
  font-size: 15px;
  font-weight: 700;
  color: var(--wms-text);
}

.pagehead__star {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  padding: 0;
  border: 0;
  border-radius: 3px;
  background: transparent;
  color: var(--wms-border-strong);
  font-size: 14px;
  cursor: pointer;
  transition: color 0.15s, background-color 0.15s;
}

.pagehead__star:hover {
  background-color: var(--wms-primary-soft);
  color: var(--wms-accent);
}

.pagehead__star--on {
  color: var(--wms-accent);
}

.pagehead__crumb {
  color: var(--wms-text-sub);
  white-space: nowrap;
}
</style>
