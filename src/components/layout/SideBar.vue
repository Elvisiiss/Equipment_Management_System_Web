<template>
  <div class="side-bar">
    <div class="system-title">设备管理系统</div>
    <div class="menu-container">
      <el-scrollbar>
        <el-menu
            :default-active="activeMenu"
            router
            :collapse="false"
            @select="handleMenuSelect"
            :unique-opened="true"
            class="custom-menu"
            background-color="#165DFF"
            text-color="#e6efff"
            active-text-color="#fff"
        >
          <!-- 递归渲染菜单组件 -->
          <menu-item
              v-for="item in menuItems"
              :key="item.path"
              :item="item"
              @menu-click="handleMenuClick"
          />
        </el-menu>
      </el-scrollbar>
    </div>
    <div class="admin-area">
      <el-avatar :size="36" :src="userAvatar"/>
      <span class="admin-name">{{ userName }}</span>
    </div>
  </div>
</template>

<script setup>
import {computed} from 'vue'
import {useRoute, useRouter} from 'vue-router'
import {useAuthStore} from '@/stores/auth'
import {useTabsStore} from '@/store/tabs'
import MenuItem from '@/components/layout/MenuItem.vue'

// 路由实例
const route = useRoute()
const router = useRouter()
const tabsStore = useTabsStore()
const authStore = useAuthStore()

// 用户信息计算属性
const userAvatar = computed(() => authStore.user?.avatar_url || 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png')
const userName = computed(() => authStore.user?.user_name || '管理员')

// 菜单项 - 从authStore获取
const menuItems = computed(() => {
  return authStore.menus || []
})

// 当前激活的菜单
const activeMenu = computed(() => route.path)

// 统一处理菜单点击事件
const handleMenuClick = (item) => {
  // 跳转到对应页面
  if (item.path && route.path !== item.path) {
    router.push(item.path)
  }

  // 添加到标签页
  const tabItem = {
    path: item.path,
    name: item.name,
    meta: {title: item.metaTitle}
  }
  tabsStore.addTab(tabItem)
}

// 处理菜单选择事件
const handleMenuSelect = (index) => {
  const routeItem = findRouteItem(index, menuItems.value)
  if (routeItem) {
    handleMenuClick(routeItem)
  }
}

// 递归查找路由项
const findRouteItem = (path, items) => {
  for (const item of items) {
    if (item.path === path) return item
    if (item.children && item.children.length) {
      const found = findRouteItem(path, item.children)
      if (found) return found
    }
  }
  return null
}
</script>

<style scoped lang="scss">
.side-bar {
  width: 240px;
  background: linear-gradient(to bottom, #1e3c72, #2a5298);
  color: #e6efff;
  height: 100vh;
  display: flex;
  flex-direction: column;
  box-shadow: 2px 0 15px rgba(0, 0, 0, 0.3);
  transition: all 0.3s ease;
  border-right: 1px solid rgba(255, 255, 255, 0.1);
}

.system-title {
  height: 64px;
  line-height: 64px;
  text-align: center;
  font-size: 18px;
  font-weight: 600;
  letter-spacing: 1px;
  background-color: rgba(0, 0, 0, 0.1);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding: 0 16px;
  color: #fff;
}

.menu-container {
  flex: 1;
  overflow: hidden;
  padding: 12px 0;
}

.admin-area {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  background-color: rgba(0, 0, 0, 0.1);
  padding: 0 20px;

  .admin-name {
    font-size: 14px;
    font-weight: 500;
    color: #e6efff;
  }
}

/* 菜单项样式 */
.menu-item-content {
  display: flex;
  align-items: center;
  width: 100%;
  padding: 0 4px;
  cursor: pointer;
}

.submenu-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 0 4px;
  cursor: pointer;
}

.menu-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  font-size: 18px;
  width: 24px;
  height: 24px;
  color: #cce0ff;
}

.arrow-icon {
  margin-left: auto;
  font-size: 16px;
  transition: transform 0.1s ease;
  color: #cce0ff;
}

/* 手风琴效果 - 展开时旋转箭头 */
:deep(.el-sub-menu.is-opened) .arrow-icon {
  transform: rotate(90deg);
}

/* 菜单激活样式 */
:deep(.el-menu) {
  border-right: none;
  background-color: transparent;
}

:deep(.el-menu-item),
:deep(.el-sub-menu__title) {
  height: 50px;
  line-height: 50px;
  font-size: 14px;
  transition: all 0.1s;
  border-radius: 4px;
  margin: 4px 8px;
  color: #e6efff;

  &:hover {
    background-color: rgba(255, 255, 255, 0.1) !important;
    color: #fff !important;
  }
}

:deep(.el-menu-item.is-active) {
  background-color: rgba(255, 255, 255, 0.2) !important;
  color: #fff !important;
  font-weight: 500;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    height: 100%;
    width: 3px;
    background-color: #fff;
    border-radius: 0 4px 4px 0;
  }
}

:deep(.el-sub-menu.is-active .el-sub-menu__title) {
  color: #fff !important;
}

:deep(.el-sub-menu .el-menu) {
  background-color: rgba(0, 0, 0, 0.1);
}

:deep(.el-sub-menu .el-menu .el-menu-item) {
  padding-left: 44px !important;
  height: 44px;
  line-height: 44px;
  margin: 2px 8px;
  font-size: 13px;
}

:deep(.el-sub-menu .el-menu .el-sub-menu .el-menu-item) {
  padding-left: 70px !important;
}

:deep(.el-menu--popup) {
  padding: 6px;
  border-radius: 8px;
  background-color: #1e3c72;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);

  .el-menu-item {
    min-width: 160px;
    border-radius: 4px;
    margin: 4px 0;

    &:hover {
      background-color: rgba(255, 255, 255, 0.1) !important;
    }
  }
}

.menu-title {
  font-weight: 500;
  letter-spacing: 0.3px;
}

.submenu-title {
  letter-spacing: 0.2px;
}

/* 滚动条样式 */
:deep(.el-scrollbar__bar) {
  opacity: 0.5;
}

:deep(.el-scrollbar__thumb) {
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 4px;

  &:hover {
    background-color: rgba(255, 255, 255, 0.3);
  }
}

/* 优化图标颜色 */
:deep(.el-icon) {
  color: inherit;
}

/* 子菜单展开/折叠动画 - 加速动画 */
:deep(.el-sub-menu .el-menu) {
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.1s ease-out;
}

:deep(.el-sub-menu.is-opened .el-menu) {
  max-height: 1000px;
  transition: max-height 0.2s ease-in;
}
</style>
