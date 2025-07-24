<template>
  <router-view v-if="$route.path === '/login'" />
  <div class="app-container">
    <TopBar />
    <div class="main-container">
      <SideBar />
      <div class="content-container">
        <TabsBar />
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

export default {
  components: {
    TopBar,
    SideBar,
    TabsBar
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
</style>
