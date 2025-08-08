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
            router
        >
          <el-menu-item index="monitor">实时监控</el-menu-item>
          <el-menu-item index="location">逻辑位置管理</el-menu-item>
          <el-menu-item index="pm">PM / 复机检查</el-menu-item>
        </el-menu>
      </el-aside>

      <!-- 右侧主体 -->
      <el-main>
        <!-- 1. 实时监控 -->
        <MonitorPanel v-if="activeMenu==='monitor'" />

        <!-- 2. 逻辑位置管理 -->
        <LocationPanel v-if="activeMenu==='location'" />

        <!-- 3. PM / 复机检查 -->
        <PmCheckPanel v-if="activeMenu==='pm'" />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { ref } from 'vue'
import MonitorPanel from '@/components/equip/MonitorPanel.vue'
import LocationPanel from '@/components/equip/LocationPanel.vue'
import PmCheckPanel from '@/components/equip/ PmCheckPanel.vue'

const activeMenu = ref('monitor')
const handleMenuSelect = (index) => (activeMenu.value = index)
</script>

<style scoped>
.header {
  background:#409EFF;color:#fff;display:flex;align-items:center;
}
</style>
