<template>
  <div class="router-view-layout">
    <router-view />
  </div>
</template>

<script setup>
// 这是一个空布局组件，只包含 router-view
// 用于在嵌套路由中正确渲染子组件
</script>

<style scoped>
.router-view-layout {
  height: 100%;
  width: 100%;
}
</style>
