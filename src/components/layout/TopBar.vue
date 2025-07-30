<template>
  <div class="top-bar">
    <div class="logo-container">
      <img src="/public/img.png" alt="Logo" class="logo">
      <h1 class="title">设备管理系统</h1>
    </div>
    <div class="user-info">
      <div class="user-avatar">
        <el-avatar :size="36" :src="user.avatar" />
      </div>
      <span class="user-name">{{ user.name }}</span>
      <el-dropdown>
      <span class="el-dropdown-link">
        <el-icon><arrow-down /></el-icon>
      </span>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item>个人中心</el-dropdown-item>
            <el-dropdown-item>修改密码</el-dropdown-item>
            <el-dropdown-item divided @click="logout">退出登录</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
</template>

<script setup>
import { ArrowDown } from '@element-plus/icons-vue'

import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()

const user = {
  name: '管理员',
  avatar: 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'
}

const logout = () => {
  authStore.clearUser()
  router.push('/login')
}
</script>

<style scoped>
.top-bar {
  height: 5vh;
  min-height: 50px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  background: linear-gradient(to right, #1e3c72, #2a5298);
  color: white;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  z-index: 100;
}

.logo-container {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo {
  height: 40%;
  width: 40%;
}

.title {
  margin: 0;
  font-size: 1.4rem;
  font-weight: 600;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-avatar {
  display: flex;
  align-items: center;
}

.user-name {
  font-size: 1rem;
}

.el-dropdown-link {
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
}
</style>
