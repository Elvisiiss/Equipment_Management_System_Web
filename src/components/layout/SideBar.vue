<template>
  <div class="side-bar">
    <div class="menu-container">
      <el-scrollbar>
        <el-menu
            :default-active="activeMenu"
            router
            :collapse="isCollapse"
            @select="handleMenuSelect"
        >
          <SideBarItem
              v-for="item in menuItems"
              :key="item.path"
              :item="item"
          />
        </el-menu>
      </el-scrollbar>
    </div>
    <div class="collapse-btn" @click="toggleCollapse">
      <el-icon>
        <component :is="isCollapse ? 'Expand' : 'Fold'" />
      </el-icon>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useTabsStore } from '@/store/tabs'
import SideBarItem from '@/components/ui/SideBarItem.vue'
import { Fold, Expand } from '@element-plus/icons-vue'

const route = useRoute()
const tabsStore = useTabsStore()

const isCollapse = ref(false)

const menuItems = [
  {
    path: '/inspection',
    name: '点巡检管理',
    meta: { title: '点巡检管理' },
    children: [
      { path: '/inspection/period', name: '点检项目周期设置', meta: { title: '点检项目周期设置' } },
      { path: '/inspection/history', name: '历史数据', meta: { title: '历史数据' } }
    ]
  },
  {
    path: '/maintenance',
    name: '维修管理',
    meta: { title: '维修管理' },
    children: [
      { path: '/maintenance/mms', name: '设备维修无纸化MMS', meta: { title: '设备维修无纸化MMS' } },
      { path: '/maintenance/guide', name: '维修指引', meta: { title: '维修指引' } }
    ]
  }
]

const activeMenu = computed(() => {
  const { meta, path } = route
  return path
})

const handleMenuSelect = (index) => {
  const routeItem = findRouteItem(index)
  if (routeItem) {
    tabsStore.addTab(routeItem)
  }
}

const findRouteItem = (path) => {
  for (const group of menuItems) {
    if (group.path === path) return group
    for (const item of group.children || []) {
      if (item.path === path) return item
    }
  }
  return null
}

const toggleCollapse = () => {
  isCollapse.value = !isCollapse.value
}
</script>

<style scoped>
.side-bar {
  display: flex;
  flex-direction: column;
  width: 15%;
  min-width: 200px;
  background-color: #fff;
  border-right: 1px solid #e6e6e6;
  height: 95vh;
  overflow: hidden;
}

.menu-container {
  flex: 1;
  overflow: auto;
}

.el-menu {
  border-right: none;
  height: 100%;
}

.collapse-btn {
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-top: 1px solid #e6e6e6;
  cursor: pointer;
  background-color: #f5f7fa;
  transition: background-color 0.3s;
}

.collapse-btn:hover {
  background-color: #e4e7ed;
}

.el-icon {
  font-size: 18px;
  color: #606266;
}
</style>
