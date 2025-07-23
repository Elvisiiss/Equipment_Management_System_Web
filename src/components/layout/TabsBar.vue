<template>
  <div class="tabs-bar">
    <el-tabs
        v-model="activeTab"
        type="card"
        closable
        @tab-remove="removeTab"
        @tab-click="handleTabClick"
    >
      <el-tab-pane
          v-for="tab in tabs"
          :key="tab.path"
          :label="tab.title"
          :name="tab.path"
          :closable="tab.path !== '/'"
      >
        <template #label>
          <div
              class="custom-tab-label"
              @contextmenu.prevent="openContextMenu($event, tab.path)"
          >
            {{ tab.title }}
          </div>
        </template>
      </el-tab-pane>
    </el-tabs>

    <!-- 右键菜单 -->
    <div
        v-show="contextMenu.visible"
        class="context-menu"
        :style="{
        top: contextMenu.top + 'px',
        left: contextMenu.left + 'px'
      }"
    >
      <div class="menu-item" @click="closeTab">关闭</div>
      <div class="menu-item" @click="closeOtherTabs">关闭其他标签页</div>
      <div class="menu-item" @click="closeAllTabs">关闭所有标签页</div>
      <div class="menu-item" @click="closeLeftTabs">关闭左侧标签页</div>
      <div class="menu-item" @click="closeRightTabs">关闭右侧标签页</div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useTabsStore } from '@/store/tabs'

const route = useRoute()
const router = useRouter()
const tabsStore = useTabsStore()

const tabs = computed(() => tabsStore.tabs)
const activeTab = ref(route.path)

// 右键菜单状态
const contextMenu = ref({
  visible: false,
  top: 0,
  left: 0,
  targetPath: null
})

// 监听路由变化
watch(
    () => route.path,
    (newPath) => {
      activeTab.value = newPath
      tabsStore.addTab({path: newPath, title: route.meta.title})
    },
    {immediate: true}
)

// 关闭右键菜单
const closeContextMenu = () => {
  contextMenu.value.visible = false
}

// 打开右键菜单
const openContextMenu = (event, path) => {
  contextMenu.value = {
    visible: true,
    top: event.clientY,
    left: event.clientX,
    targetPath: path
  }
}

// 关闭当前标签页
const closeTab = () => {
  if (contextMenu.value.targetPath && contextMenu.value.targetPath !== '/') {
    removeTab(contextMenu.value.targetPath)
  }
  closeContextMenu()
}

// 关闭其他标签页
const closeOtherTabs = () => {
  if (!contextMenu.value.targetPath) {
    closeContextMenu()
    return
  }

  const keepTabs = tabs.value.filter(tab =>
      tab.path === '/' || tab.path === contextMenu.value.targetPath
  )

  tabsStore.setTabs(keepTabs)

  // 如果当前路由不在保留的标签页中，则跳转到目标页
  if (!keepTabs.find(tab => tab.path === route.path)) {
    router.push(contextMenu.value.targetPath)
  }

  closeContextMenu()
}

// 关闭所有标签页（保留主页）
const closeAllTabs = () => {
  const homeTab = tabs.value.find(tab => tab.path === '/')
  tabsStore.setTabs(homeTab ? [homeTab] : [])

  // 如果当前不是主页，则跳转到主页
  if (route.path !== '/') {
    router.push('/')
  }

  closeContextMenu()
}

// 关闭左侧标签页
const closeLeftTabs = () => {
  if (!contextMenu.value.targetPath) {
    closeContextMenu()
    return
  }

  const targetIndex = tabs.value.findIndex(tab => tab.path === contextMenu.value.targetPath)
  if (targetIndex <= 0) {
    closeContextMenu()
    return
  }

  // 保留主页和右侧的标签页（包括当前标签页）
  const keepTabs = tabs.value.filter((tab, index) =>
      tab.path === '/' || index >= targetIndex
  )

  tabsStore.setTabs(keepTabs)

  // 如果当前路由不在保留的标签页中，则跳转到目标页
  if (!keepTabs.find(tab => tab.path === route.path)) {
    router.push(contextMenu.value.targetPath)
  }

  closeContextMenu()
}

// 关闭右侧标签页
const closeRightTabs = () => {
  if (!contextMenu.value.targetPath) {
    closeContextMenu()
    return
  }

  const targetIndex = tabs.value.findIndex(tab => tab.path === contextMenu.value.targetPath)
  if (targetIndex === -1 || targetIndex >= tabs.value.length - 1) {
    closeContextMenu()
    return
  }

  // 保留主页和左侧的标签页（包括当前标签页）
  const keepTabs = tabs.value.filter((tab, index) =>
      tab.path === '/' || index <= targetIndex
  )

  tabsStore.setTabs(keepTabs)

  // 如果当前路由不在保留的标签页中，则跳转到目标页
  if (!keepTabs.find(tab => tab.path === route.path)) {
    router.push(contextMenu.value.targetPath)
  }

  closeContextMenu()
}

// 关闭单个标签页
const removeTab = (targetPath) => {
  if (targetPath === '/') return // 禁止关闭首页

  const currentPath = route.path
  const tabs = tabsStore.tabs
  let activePath = activeTab.value

  if (targetPath === activePath) {
    // 关闭当前激活的标签
    const index = tabs.findIndex(tab => tab.path === targetPath)
    const nextTab = tabs[index + 1] || tabs[index - 1]

    if (nextTab) {
      activePath = nextTab.path
    } else {
      activePath = '/'
    }
  }

  tabsStore.removeTab(targetPath)

  if (targetPath === currentPath) {
    router.push(activePath)
  }
}

// 点击标签页切换路由
const handleTabClick = (tab) => {
  const path = tab.props.name
  if (path !== route.path) {
    router.push(path)
  }
}

// 全局点击关闭右键菜单
const handleGlobalClick = () => {
  if (contextMenu.value.visible) {
    closeContextMenu()
  }
}

// 添加全局点击监听
onMounted(() => {
  document.addEventListener('click', handleGlobalClick)
})

// 移除全局点击监听
onUnmounted(() => {
  document.removeEventListener('click', handleGlobalClick)
})
</script>

<style scoped>
.tabs-bar {
  height: 5vh;
  min-height: 40px;
  background-color: #fff;
  border-bottom: 1px solid #e6e6e6;
  padding: 0 10px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
  z-index: 10;
  position: relative;
}

:deep(.el-tabs) {
  height: 100%;
}

:deep(.el-tabs__header) {
  margin: 0;
  border-bottom: none;
  height: 100%;
}

:deep(.el-tabs__nav) {
  border: none !important;
}

:deep(.el-tabs__item) {
  height: 32px;
  line-height: 32px;
  border: 1px solid #e6e6e6 !important;
  border-radius: 4px 4px 0 0 !important;
  margin-right: 4px;
  background-color: #f5f7fa;
  transition: all 0.3s;
  position: relative;
}

:deep(.el-tabs__item.is-active) {
  background-color: #fff;
  border-bottom-color: #fff !important;
}

:deep(.el-tabs__item:not(.is-active):hover) {
  color: #409eff;
}

:deep(.el-tabs__nav-next),
:deep(.el-tabs__nav-prev) {
  line-height: 40px;
}

.custom-tab-label {
  height: 100%;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 右键菜单样式 */
.context-menu {
  position: fixed;
  background-color: #fff;
  border: 1px solid #e6e6e6;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  z-index: 2000;
  min-width: 120px;
}

.menu-item {
  padding: 8px 12px;
  font-size: 13px;
  cursor: pointer;
}

.menu-item:hover {
  background-color: #f5f7fa;
  color: #409eff;
}
</style>
