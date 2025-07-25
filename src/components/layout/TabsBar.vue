<template>
  <div class="tab-manager-container">
    <el-tabs
        v-model="activeTab"
        type="card"
        closable
        @tab-click="handleTabClick"
        @tab-remove="handleTabRemove"
        @contextmenu.prevent="showContextMenu"
    >
      <el-tab-pane
          v-for="tab in tabs"
          :key="tab.path"
          :label="tab.title"
          :name="tab.path"
          :closable="tab.path !== '/'"
      >
        <router-view />
      </el-tab-pane>
    </el-tabs>

    <!-- 右键菜单 -->
    <div
        v-show="contextMenu.visible"
        class="context-menu"
        :style="{
        left: contextMenu.x + 'px',
        top: contextMenu.y + 'px'
      }"
    >
      <div class="menu-item" @click="closeCurrentTab">关闭当前标签页</div>
      <div class="menu-item" @click="closeOtherTabs">关闭其他标签页</div>
      <div class="menu-item" @click="closeAllTabs">关闭所有标签页</div>
      <div class="menu-item" @click="closeLeftTabs">关闭左侧标签页</div>
      <div class="menu-item" @click="closeRightTabs">关闭右侧标签页</div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, watch, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

// 标签页状态
const tabs = ref([
  { title: '首页', path: '/', name: 'Home' }
])

// 当前激活的标签页
const activeTab = ref('/')

// 右键菜单状态
const contextMenu = reactive({
  visible: false,
  x: 0,
  y: 0,
  currentTab: null
})

// 监听路由变化
watch(
    () => route.path,
    (newPath) => {
      activeTab.value = newPath

      // 如果该路由不存在于标签页中，则添加
      const tabExists = tabs.value.some(tab => tab.path === newPath)
      if (!tabExists && newPath !== '/') {
        tabs.value.push({
          title: route.meta.title || '新标签',
          path: newPath,
          name: route.name
        })
      }
    },
    { immediate: true }
)

// 标签页点击事件
const handleTabClick = (tab) => {
  router.push(tab.props.name)
}

// 关闭标签页
const handleTabRemove = (targetPath) => {
  if (targetPath === '/') return // 禁止关闭首页

  const index = tabs.value.findIndex(tab => tab.path === targetPath)
  if (index !== -1) {
    // 如果关闭的是当前激活的标签页
    if (targetPath === activeTab.value) {
      // 优先切换到左侧标签页
      const prevTab = tabs.value[index - 1]
      if (prevTab) {
        router.push(prevTab.path)
      }
      // 没有左侧标签页则切换到右侧
      else if (tabs.value[index + 1]) {
        router.push(tabs.value[index + 1].path)
      }
      // 没有其他标签页则回到首页
      else {
        router.push('/')
      }
    }

    tabs.value.splice(index, 1)
  }
}

// 显示右键菜单
const showContextMenu = (e) => {
  // 获取点击的标签页元素
  const tabEl = e.target.closest('.el-tabs__item')
  if (!tabEl) return

  // 获取标签页路径
  const tabPath = tabEl.getAttribute('id')?.replace('tab-', '') || ''
  if (!tabPath) return

  contextMenu.visible = true
  contextMenu.x = e.clientX
  contextMenu.y = e.clientY
  contextMenu.currentTab = tabPath
}

// 关闭右键菜单
const closeContextMenu = () => {
  contextMenu.visible = false
}

// 点击页面其他位置关闭菜单
const handleClickOutside = (e) => {
  if (contextMenu.visible && !e.target.closest('.context-menu')) {
    closeContextMenu()
  }
}

// 关闭当前标签页
const closeCurrentTab = () => {
  if (contextMenu.currentTab) {
    handleTabRemove(contextMenu.currentTab)
    closeContextMenu()
  }
}

// 关闭其他标签页
const closeOtherTabs = () => {
  if (contextMenu.currentTab) {
    tabs.value = tabs.value.filter(tab =>
        tab.path === contextMenu.currentTab || tab.path === '/'
    )

    // 如果当前激活的不是右键选中的标签页，则跳转过去
    if (activeTab.value !== contextMenu.currentTab) {
      router.push(contextMenu.currentTab)
    }

    closeContextMenu()
  }
}

// 关闭所有标签页
const closeAllTabs = () => {
  tabs.value = tabs.value.filter(tab => tab.path === '/')
  router.push('/')
  closeContextMenu()
}

// 关闭左侧标签页
const closeLeftTabs = () => {
  if (contextMenu.currentTab) {
    const currentIndex = tabs.value.findIndex(tab => tab.path === contextMenu.currentTab)
    tabs.value = tabs.value.filter((tab, index) =>
        index >= currentIndex || tab.path === '/'
    )

    closeContextMenu()
  }
}

// 关闭右侧标签页
const closeRightTabs = () => {
  if (contextMenu.currentTab) {
    const currentIndex = tabs.value.findIndex(tab => tab.path === contextMenu.currentTab)
    tabs.value = tabs.value.filter((tab, index) =>
        index <= currentIndex || tab.path === '/'
    )

    closeContextMenu()
  }
}

// 添加全局点击事件监听
onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

// 移除事件监听
onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.tab-manager-container {
  position: relative;
  width: 100%;
  height: 40px; /* 设置固定高度 */
}

.context-menu {
  position: fixed;
  background: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  z-index: 3000;
  min-width: 160px;
}

.menu-item {
  padding: 8px 20px;
  font-size: 14px;
  color: #606266;
  cursor: pointer;
  transition: all 0.3s;
}

.menu-item:hover {
  background-color: #ecf5ff;
  color: #409eff;
}

:deep(.el-tabs__header) {
  margin: 0;
  height: 40px; /* 设置固定高度 */
}

:deep(.el-tabs__content) {
  display: none; /* 隐藏内容区域，因为我们在App.vue中已经有router-view了 */
}
</style>
