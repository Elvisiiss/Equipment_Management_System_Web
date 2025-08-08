<template>
  <el-container style="height:100vh">
    <!-- 顶部标题 -->
    <el-header class="header">
      <h2>动态车间设备整体布局</h2>
    </el-header>

    <el-container>
      <!-- 左侧导航 -->
      <el-aside width="220px">
        <el-menu
            :default-active="activeMenu"
            @select="handleMenuSelect"
        >
          <el-menu-item index="/equipment/status/monitor">实时监控</el-menu-item>
          <el-menu-item index="/equipment/status/location">逻辑位置管理</el-menu-item>
          <el-menu-item index="/equipment/status/pm?id=1">PM / 复机检查</el-menu-item>
        </el-menu>
      </el-aside>

      <!-- 右侧主体 -->
      <el-main>
        <!-- 1. 实时监控 -->
        <MonitorPanel v-if="activeMenu.includes('monitor')" />

        <!-- 2. 逻辑位置管理 -->
        <LocationPanel v-if="activeMenu.includes('location')" />

        <!-- 3. PM / 复机检查 -->
        <PmCheckPanel v-if="activeMenu.includes('pm')" />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import MonitorPanel from '@/components/equip/MonitorPanel.vue'
import LocationPanel from '@/components/equip/LocationPanel.vue'
import PmCheckPanel from '@/components/equip/PmCheckPanel.vue'

const route = useRoute()
const activeMenu = ref('/equipment/status/monitor')

// 监听路由变化更新激活菜单
watch(() => route.path, (newPath) => {
  if (newPath.includes('/equipment/status')) {
    activeMenu.value = newPath
  }
}, { immediate: true })

const handleMenuSelect = (index) => {
  activeMenu.value = index
  // 这里实际项目中应该使用vue-router的push方法进行导航
  // 例如：router.push(index)
}
</script>

<style scoped>
.header {
  background:#409EFF;
  color:#fff;
  display:flex;
  align-items:center;
}
</style>
