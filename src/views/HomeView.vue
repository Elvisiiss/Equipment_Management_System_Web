<template>
  <div class="home-view">
    <div class="welcome-card">
      <h1>欢迎使用设备管理系统</h1>
      <p>请从左侧菜单选择功能进行操作</p>
      <div class="stats">
        <el-row :gutter="20">
          <el-col :span="8">
            <el-statistic title="设备总数" :value="1268" />
          </el-col>
          <el-col :span="8">
            <el-statistic title="待检设备" :value="42" />
          </el-col>
          <el-col :span="8">
            <el-statistic title="待维修设备" :value="18" />
          </el-col>
        </el-row>
      </div>
      <el-divider />
      <div class="quick-links">
        <h3>快速导航</h3>
        <el-row :gutter="20">
          <el-col :span="6" v-for="link in quickLinks" :key="link.path">
            <el-card shadow="hover" class="link-card" @click="$router.push(link.path)">
              <div class="link-content">
                <el-icon :size="36" :color="link.color">
                  <component :is="link.icon" />
                </el-icon>
                <span>{{ link.title }}</span>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Document, Calendar, Setting, DataAnalysis } from '@element-plus/icons-vue'

const quickLinks = [
  { path: '/inspection/period', title: '点检周期设置', icon: Calendar, color: '#409EFF' },
  { path: '/inspection/history', title: '点检历史', icon: DataAnalysis, color: '#67C23A' },
  { path: '/maintenance/mms', title: '维修管理', icon: Document, color: '#E6A23C' },
  { path: '/maintenance/guide', title: '维修指引', icon: Setting, color: '#F56C6C' }
]
</script>

<style scoped>
.home-view {
  padding: 20px;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.welcome-card {
  width: 90%;
  max-width: 1000px;
  background: white;
  border-radius: 10px;
  padding: 30px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.welcome-card h1 {
  color: #1e3c72;
  margin-bottom: 15px;
}

.welcome-card p {
  color: #606266;
  font-size: 18px;
  margin-bottom: 30px;
}

.stats {
  margin: 30px 0;
}

.quick-links {
  margin-top: 30px;
  text-align: left;
}

.link-card {
  cursor: pointer;
  transition: transform 0.3s;
  height: 120px;
}

.link-card:hover {
  transform: translateY(-5px);
}

.link-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
}

.link-content span {
  margin-top: 10px;
  font-size: 16px;
  font-weight: 500;
}
</style>
