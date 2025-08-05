<template>
  <el-container style="height:100vh">
<!--    &lt;!&ndash; 顶部身份栏 &ndash;&gt;-->
<!--    <el-header class="header">-->
<!--      <span>模具防错管理系统</span>-->
<!--      <div class="user">-->
<!--        <el-avatar :size="32" :src="user.avatar" />-->
<!--        <span>{{ user.name }}</span>-->
<!--        <el-button type="danger" size="small" @click="logout">退出</el-button>-->
<!--      </div>-->
<!--    </el-header>-->

    <el-container>
      <!-- 左侧导航 -->
      <el-aside width="200px">
        <el-menu :default-active="activeTab" @select="(i) => activeTab = i">
          <el-menu-item index="identity">身份管理</el-menu-item>
          <el-menu-item index="storage">存储管理</el-menu-item>
          <el-menu-item index="bom">BOM 设定</el-menu-item>
          <el-menu-item index="pick">模具领用</el-menu-item>
          <el-menu-item index="verify">生产验证</el-menu-item>
          <el-menu-item index="return">模具归还</el-menu-item>
          <el-menu-item index="status">状态管理</el-menu-item>
        </el-menu>
      </el-aside>

      <!-- 主体内容 -->
      <el-main>
        <IdentityPanel   v-show="activeTab==='identity'" />
        <StoragePanel    v-show="activeTab==='storage'" />
        <BomPanel        v-show="activeTab==='bom'" />
        <PickPanel       v-show="activeTab==='pick'" />
        <VerifyPanel     v-show="activeTab==='verify'" />
        <ReturnPanel     v-show="activeTab==='return'" />
        <StatusPanel     v-show="activeTab==='status'" />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { ref } from 'vue'

import IdentityPanel from '@/components/mold/IdentityPanel.vue'
import StoragePanel  from '@/components/mold/StoragePanel.vue'
import BomPanel      from '@/components/mold/BomPanel.vue'
import PickPanel     from '@/components/mold/PickPanel.vue'
import VerifyPanel   from '@/components/mold/VerifyPanel.vue'
import ReturnPanel   from '@/components/mold/ReturnPanel.vue'
import StatusPanel   from '@/components/mold/StatusPanel.vue'

const activeTab = ref('identity')
const user = ref({
  name: '张三',
  avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png'
})

const logout = () => location.reload()
</script>

<style scoped>
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #001529;
  color: #fff;
}
.user {
  display: flex;
  align-items: center;
  gap: 8px;
}
</style>
