<template>
  <div class="home-container">
    <h1 class="page-title">设备管理系统</h1>

    <!-- 9 个模块 -->
    <el-row :gutter="24">
      <el-col
          v-for="item in modules"
          :key="item.path"
          :xs="24"
          :sm="12"
          :md="8"
          :lg="8"
          :xl="8"
          style="margin-bottom: 24px"
      >
        <div class="module-card" @click="$router.push(item.path)">
          <el-icon class="module-icon" size="48">
            <component :is="item.icon" />
          </el-icon>
          <h3>{{ item.title }}</h3>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import {
  HomeFilled,
  Monitor,
  List,
  Setting,
  Tools,
  Coin,
  EditPen,
  Operation,
  DocumentChecked  // 新增审核管理图标
} from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'
const router = useRouter()

// 模块配置
const modules = [
  { title: '资产管理',     path: '/asset/screen',       icon: HomeFilled },
  { title: '设备实时监控', path: '/equipment/screen',   icon: Monitor },
  { title: '点巡检管理',   path: '/inspection/screen',  icon: List },
  { title: '保养管理',     path: '/maintenance/screen', icon: Setting },
  { title: '模具/治工具',  path: '/mold/manage',        icon: Tools },
  { title: '备件管理',     path: '/parts/screen',       icon: Coin },
  { title: '维修管理',     path: '/repair/screen',      icon: EditPen },
  { title: '系统管理',     path: '/system/screen',      icon: Operation },
  // 新增审核管理模块
  { title: '审核管理',     path: '/check/list',         icon: DocumentChecked }
]
</script>

<style scoped>
.home-container {
  padding: 24px;
  background: #f5f7fa;
  min-height: 100vh;
}
.page-title {
  text-align: center;
  margin-bottom: 32px;
  font-weight: 600;
  color: #303133;
}
.module-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 160px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.08);
  cursor: pointer;
  transition: all 0.3s;
}
.module-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 4px 20px 0 rgba(0, 0, 0, 0.12);
}
.module-icon {
  color: #409eff;
  margin-bottom: 12px;
}
h3 {
  margin: 0;
  font-size: 16px;
  color: #303133;
}
</style>
