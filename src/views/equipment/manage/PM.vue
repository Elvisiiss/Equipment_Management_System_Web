<template>
  <el-container style="height:100vh">
    <!-- 顶部标题 -->
<!--    <el-header class="header">-->
<!--      <h2>动态车间设备整体布局</h2>-->
<!--    </el-header>-->
    <!-- 主体内容 -->
    <el-main>
      <!-- 1. 实时监控 -->
      <div class="section">
        <h3 class="section-title">实时监控</h3>
        <MonitorPanel />
      </div>

      <!-- 2. 逻辑位置管理 -->
      <div class="section">
        <h3 class="section-title">逻辑位置管理</h3>
        <LocationPanel />
      </div>

      <!-- 3. PM / 复机检查 -->
      <div class="section">
        <h3 class="section-title">PM / 复机检查</h3>
        <PmCheckPanel />
      </div>
    </el-main>
  </el-container>
</template>

<script setup>
import { ref } from 'vue'
import MonitorPanel from '@/components/equip/MonitorPanel.vue'
import LocationPanel from '@/components/equip/LocationPanel.vue'
import PmCheckPanel from '@/components/equip/PmCheckPanel.vue'

// 不再需要路由相关逻辑
</script>

<style scoped>
.header {
  background:#409EFF;
  color:#fff;
  display:flex;
  align-items:center;
}

.section {
  margin-bottom: 30px;
  padding: 20px;
  background: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.section-title {
  margin-bottom: 15px;
  color: #409EFF;
  border-bottom: 1px solid #eee;
  padding-bottom: 10px;
}
</style>
