<!-- views/asset/manage/lifecycle/Layout.vue -->
<template>
  <div class="lifecycle-layout">
    <el-page-header :content="title" @back="$router.back()" />
    <el-divider />
    <slot />
  </div>
</template>

<script setup>
defineProps({ title: String })
</script>

<style scoped>
.lifecycle-layout {
  padding: 16px;
}
</style>
