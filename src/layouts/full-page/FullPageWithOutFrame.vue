<template>
  <div class="plain">
    <router-view />
  </div>
</template>

<script setup></script>

<style scoped>
.plain {
  height: 100vh;
  overflow: auto;
  background: linear-gradient(160deg, #4a0c13 0%, #6e121c 55%, #a51c30 100%);
}
</style>
