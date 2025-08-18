<template>
  <router-view v-if="$route.path === '/login'" />
  <div v-else class="app-container">
    <!-- 根据全屏状态和当前路由控制顶部栏显示 -->
    <TopBar v-if="!isFullScreen || $route.path !== '/equipment/screen'" />
    <div class="main-container">
      <!-- 根据全屏状态和当前路由控制侧边栏显示 -->
      <SideBar v-if="!isFullScreen || $route.path !== '/equipment/screen'" />
      <div class="content-container" :class="{ 'full-screen': isFullScreen && $route.path === '/equipment/screen' }">
        <!-- 根据全屏状态和当前路由控制标签栏显示 -->
        <TabsBar v-if="!isFullScreen || $route.path !== '/equipment/screen'" />
        <div class="view-container">
          <router-view v-slot="{ Component }">
            <keep-alive>
              <component :is="Component" :key="$route.fullPath" />
            </keep-alive>
          </router-view>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import TopBar from '@/components/layout/TopBar.vue'
import SideBar from '@/components/layout/SideBar.vue'
import TabsBar from '@/components/layout/TabsBar.vue'
import { ref, provide } from 'vue'
import { useRoute } from 'vue-router' // 引入vue-router的useRoute

export default {
  components: {
    TopBar,
    SideBar,
    TabsBar
  },
  setup() {
    // 获取路由实例
    const $route = useRoute()
    // 全屏状态变量
    const isFullScreen = ref(false)

    // 提供全屏切换方法给子组件
    provide('toggleFullScreen', () => {
      isFullScreen.value = !isFullScreen.value
    })

    return {
      isFullScreen,
      $route // 将路由实例返回给模板使用
    }
  }
}
</script>

<style scoped>
.app-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
  background-color: #f0f2f5;
}

.main-container {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.content-container {
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow: hidden;
}

.view-container {
  flex: 1;
  padding: 16px;
  overflow: auto;
  background-color: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1) inset;
}

/* 新增全屏样式 */
.full-screen {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 999;
}

.full-screen .view-container {
  padding: 0;
  background-color: transparent;
  box-shadow: none;
}
</style>
