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
      />
    </el-tabs>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useTabsStore } from '@/store/tabs'

const route = useRoute()
const router = useRouter()
const tabsStore = useTabsStore()

const tabs = computed(() => tabsStore.tabs)
const activeTab = ref(route.path)

watch(
    () => route.path,
    (newPath) => {
      activeTab.value = newPath
      tabsStore.addTab({ path: newPath, title: route.meta.title })
    },
    { immediate: true }
)

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

const handleTabClick = (tab) => {
  const path = tab.props.name
  if (path !== route.path) {
    router.push(path)
  }
}
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
</style>
