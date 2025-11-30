<template>
  <!-- 有子菜单的项 -->
  <el-sub-menu
      v-if="item.children && item.children.length"
      :index="item.path"
      popper-class="menu-popper"
  >
    <template #title>
      <div class="menu-item-content" @click="handleClick(item)">
        <span class="menu-icon" v-if="item.metaIcon">
          <el-icon><component :is="getIconComponent(item.metaIcon)"/></el-icon>
        </span>
        <span class="menu-title">{{ item.metaTitle }}</span>
      </div>
    </template>

    <!-- 递归渲染子菜单 -->
    <menu-item
        v-for="child in item.children"
        :key="child.path"
        :item="child"
        @menu-click="$emit('menu-click', $event)"
    />
  </el-sub-menu>

  <!-- 没有子菜单的项 -->
  <el-menu-item
      v-else
      :index="item.path"
      @click="handleClick(item)"
  >
    <span class="menu-item-content">
      <span class="menu-icon" v-if="item.metaIcon">
        <el-icon><component :is="getIconComponent(item.metaIcon)"/></el-icon>
      </span>
      <span class="menu-title">{{ item.metaTitle }}</span>
    </span>
  </el-menu-item>
</template>

<script setup>
import {Box, Connection, HomeFilled, List, Monitor, Setting, StarFilled, Tools, User} from '@element-plus/icons-vue'

const props = defineProps({
  item: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['menu-click'])

// 图标映射
const iconMap = {
  'HomeFilled': HomeFilled,
  'StarFilled': StarFilled,
  'Connection': Connection,
  'Monitor': Monitor,
  'List': List,
  'Setting': Setting,
  'Tools': Tools,
  'Box': Box,
  'User': User
}

const getIconComponent = (iconName) => {
  return iconMap[iconName] || HomeFilled
}

const handleClick = (item) => {
  emit('menu-click', item)
}
</script>

<style scoped>
.menu-item-content {
  display: flex;
  align-items: center;
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

.menu-title {
  font-weight: 500;
  letter-spacing: 0.3px;
}
</style>
