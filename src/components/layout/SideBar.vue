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
            background-color="#001529"
            text-color="#fff"
            active-text-color="#1890ff"
        >
          <!-- 遍历一级菜单 -->
          <template v-for="item in menuItems" :key="item.path">
            <!-- 有子菜单的一级项 -->
            <el-sub-menu
                v-if="item.children && item.children.length"
                :index="item.path"
                popper-class="menu-popper"
            >
              <template #title>
                <div class="menu-item-content" @click="handleMenuClick(item)">
                  <span class="menu-icon" v-if="item.meta.icon">
                    <el-icon><component :is="item.meta.icon" /></el-icon>
                  </span>
                  <span class="menu-title">{{ item.meta.title }}</span>
                  <el-icon class="arrow-icon" v-if="item.children"><ArrowDown /></el-icon>
                </div>
              </template>

              <!-- 遍历二级菜单 -->
              <template v-for="child in item.children" :key="child.path">
                <!-- 有三级菜单的二级项 -->
                <el-sub-menu
                    v-if="child.children && child.children.length"
                    :index="child.path"
                >
                  <template #title>
                    <div class="submenu-item" @click="handleMenuClick(child)">
                      <span class="menu-title">{{ child.meta.title }}</span>
                      <el-icon class="arrow-icon"><ArrowRight /></el-icon>
                    </div>
                  </template>

                  <!-- 三级菜单项 -->
                  <el-menu-item
                      v-for="grandchild in child.children"
                      :key="grandchild.path"
                      :index="grandchild.path"
                      @click="handleMenuClick(grandchild)"
                  >
                    <span class="submenu-title">{{ grandchild.meta.title }}</span>
                  </el-menu-item>
                </el-sub-menu>

                <!-- 没有子菜单的二级项 -->
                <el-menu-item
                    v-else
                    :index="child.path"
                    @click="handleMenuClick(child)"
                >
                  <span class="submenu-title">{{ child.meta.title }}</span>
                </el-menu-item>
              </template>
            </el-sub-menu>

            <!-- 没有子菜单的一级项 -->
            <el-menu-item
                v-else
                :index="item.path"
                @click="handleMenuClick(item)"
            >
              <span class="menu-item-content">
                <span class="menu-icon" v-if="item.meta.icon">
                  <el-icon><component :is="item.meta.icon" /></el-icon>
                </span>
                <span class="menu-title">{{ item.meta.title }}</span>
              </span>
            </el-menu-item>
          </template>
        </el-menu>
      </el-scrollbar>
    </div>
    <div class="admin-area">
      <el-avatar :size="36" src="https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png" />
      <span class="admin-name">管理员</span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useTabsStore } from '@/store/tabs'
import {
  HomeFilled,
  Setting,
  Monitor,
  Tools,
  Box,
  Connection,
  User,
  List,
  Histogram
} from '@element-plus/icons-vue'

// 路由实例
const route = useRoute()
const router = useRouter()
const tabsStore = useTabsStore()

// 菜单结构（包含三级菜单示例）
const menuItems = [
  {
    path: '/',
    name: 'Home',
    meta: { title: '首页', icon: HomeFilled }
  },
  {
    path: '/asset',
    name: 'asset',
    meta: { title: '资产管理', icon: Connection },
    children: [
      {
        path: '/asset/manage',
        name: 'manage',
        meta: { title: '管理' },
        children: [
          {
            path: '/asset/manage/A',
            name: 'A',
            meta: { title: '页面A' },
          }
        ]
      },{
        path: '/asset/configuration',
        name: 'configuration',
        meta: { title: '配置' },
        children: [
          {
            path: '/asset/configuration/B',
            name: 'B',
            meta: { title: '页面B' },
          }
        ]
      },{
        path: '/asset/screen',
        name: 'screen',
        meta: { title: '大屏' },
        children: [
          {
            path: '/asset/screen/C',
            name: 'C',
            meta: { title: '页面C' },
          }
        ]
      }
    ]
  },
  {
    path: '/equipment',
    name: 'equipment',
    meta: { title: '设备实时监控', icon: Monitor },
    children: [
      {
        path: '/equipment/monitoring',
        name: 'Monitoring',
        component: () => import('@/views/equipment/Monitoring.vue'),
        meta: { title: '实时状态监控' },
        children: [
          {
            path: '/equipment/monitoring/spc',
            name: 'SPCManagement',
            meta: { title: '设备SPC监控' }
          },
          {
            path: '/equipment/monitoring/exception',
            name: 'Exception',
            meta: { title: '异常与阈值' }
          },
        ]
      },
      {
        path: '/equipment/status',
        name: 'Status',
        meta: { title: '设备状态管理' },
        children: [
          {
            path: '/equipment/status/policies',
            name: 'Policies',
            meta: { title: '状态规则与策略' }
          },
          {
            path: '/equipment/status/log',
            name: 'Log',
            meta: { title: '状态维护' }
          },
        ]
      },
      {
        path: '/equipment/location',
        name: 'Location',
        meta: { title: '布局管理' },
        children: [
          {
            path: '/equipment/location/transfer',
            name: 'Transfer',
            component: () => import('@/views/equipment/manage/Transfer.vue'),
            meta: { title: '设备转机' },
          },
          {
            path: '/equipment/location/pm',
            name: 'PM',
            component: () => import('@/views/equipment/manage/PM.vue'),
            meta: { title: 'PM工单' },
          },
          {
            path: '/equipment/location/recover',
            name: 'Recover',
            component: () => import('@/views/equipment/manage/Recover.vue'),
            meta: { title: '复机管理' },
          },
          {
            path: '/equipment/location/logic',
            name: 'Logic',
            component: () => import('@/views/equipment/manage/Logic.vue'),
            meta: { title: '逻辑位置' },
          }
        ]
      },

      {
        path: '/equipment/screen',
        name: 'screen',
        meta: { title: '大屏' },
        children: [
          {
            path: '/equipment/screen/oee',
            name: 'OEEManagement',
            meta: { title: 'OEE管理看板' },
          },
          {
            path: '/equipment/screen/status',
            name: 'EquipmentStatus',
            meta: { title: '设备状态看板' },
          },
          {
            path: '/equipment/screen/iot',
            name: 'IOTManagement',
            meta: { title: 'IOT管理看板' },
          }
        ]
      },
      {
        path: '/equipment/configuration',
        name: 'configuration',
        meta: { title: '配置' }
      }
    ]
  },
  {
    path: '/inspection',
    name: 'inspection',
    meta: { title: '点巡检管理', icon: List },
    children: [
      {
        path: '/inspection/manage',
        name: 'manage',
        meta: { title: '管理' },
        children: [
          {
            path: '/inspection/manage/G',
            name: 'G',
            meta: { title: '页面G' },
          }
        ]
      },{
        path: '/inspection/configuration',
        name: 'configuration',
        meta: { title: '配置' },
        children: [
          {
            path: '/inspection/configuration/H',
            name: 'H',
            meta: { title: '页面H' },
          }
        ]
      },
      {
        path: '/inspection/screen',
        name: 'screen',
        meta: { title: '大屏' },
        children: [
          {
            path: '/inspection/screen/I',
            name: 'I',
            meta: { title: '页面I' },
          }
        ]
      }
    ]
  },
  {
    path: '/maintenance',
    name: 'maintenance',
    meta: { title: '保养管理', icon: Setting },
    children: [
      {
        path: '/maintenance/manage',
        name: 'manage',
        meta: { title: '管理' },
        children: [
          {
            path: '/maintenance/manage/J',
            name: 'J',
            meta: { title: '页面J' },
          }
        ]
      },{
        path: '/maintenance/configuration',
        name: 'configuration',
        meta: { title: '配置' },
        children: [
          {
            path: '/maintenance/configuration/K',
            name: 'K',
            meta: { title: '页面K' },
          }
        ]
      },{
        path: '/maintenance/screen',
        name: 'screen',
        meta: { title: '大屏' },
        children: [
          {
            path: '/maintenance/screen/L',
            name: 'L',
            meta: { title: '页面L' },
          }
        ]
      }
    ]
  },
  {
    path: '/mold',
    name: 'mold',
    meta: { title: '模具/治工具管理', icon: HomeFilled },
    children: [
      {
        path: '/mold/cycle',
        name: 'manage',
        meta: { title: '全生命周期管理' },
        children: [
          {
            path: '/mold/manage/M',
            name: 'M',
            meta: { title: '页面M' },
          }
        ]
      },
      {
        path: '/mold/mistake',
        name: 'manage',
        meta: { title: '防用错管理' },
        children: [
          {
            path: '/mold/manage/M',
            name: 'M',
            meta: { title: '页面M' },
          }
        ]
      },
      {
        path: '/mold/cycle',
        name: 'manage',
        meta: { title: '台账管理' },
        children: [
          {
            path: '/mold/manage/M',
            name: 'M',
            meta: { title: '页面M' },
          }
        ]
      }
    ]
  },
  {
    path: '/parts',
    name: 'parts',
    meta: { title: '备件管理', icon: Box },
    children: [
      {
        path: '/parts/manage',
        name: 'manage',
        meta: { title: '管理' },
        children: [
          {
            path: '/parts/manage/SparePartCode',
            name: 'SparePartCode',
            meta: { title: '备件编码管理' },
          },
          {
            path: '/parts/manage/SparePartInventory',
            name: 'SparePartInventory',
            meta: { title: '备品备件台账' },
          },
          {
            path: '/parts/manage/EdgeInventory',
            name: 'EdgeInventory',
            meta: { title: '线边库存管理' },
          },
          {
            path: '/parts/manage/EquipmentBOM',
            name: 'EquipmentBOM',
            meta: { title: '设备BOM管理' },
          },
          {
            path: '/parts/manage/EquipmentDetail',
            name: 'EquipmentDetail',
            meta: { title: '设备详情-不要的' },
          },
          {
            path: '/parts/manage/LocationForm',
            name: 'LocationForm',
            meta: { title: '表单-不要的' },
          },
          {
            path: '/parts/manage/LocationManagement',
            name: 'LocationManagement',
            meta: { title: '库位管理' },
          },
        ]
      },{
        path: '/parts/configuration',
        name: 'configuration',
        meta: { title: '配置' },
        children: [
          {
            path: '/parts/configuration/Q',
            name: 'Q',
            meta: { title: '页面Q' },
          }
        ]
      },{
        path: '/parts/screen',
        name: 'screen',
        meta: { title: '大屏' },
        children: [
          {
            path: '/parts/screen/R',
            name: 'R',
            meta: { title: '页面R' },
          }
        ]
      }
    ]
  },
  {
    path: '/repair',
    name: 'repair',
    meta: { title: '维修管理', icon: Tools },
    children: [
      {
        path: '/repair/manage',
        name: 'manage',
        meta: { title: '管理' },
        children: [
          {
            path: '/repair/manage/KnowledgeBase',
            name: 'KnowledgeBase',
            meta: { title: '维修知识库' },
          },
          {
            path: '/repair/manage/RepairOrder',
            name: 'RepairOrder',
            meta: { title: '维修工单管理' },
          }
        ]
      },{
        path: '/repair/configuration',
        name: 'configuration',
        meta: { title: '配置' },
        children: [
          {
            path: '/repair/configuration/RepairConfig',
            name: 'RepairConfig',
            meta: { title: '维修配置管理' },
          }
        ]
      },{
        path: '/repair/screen',
        name: 'screen',
        meta: { title: '大屏' },
        children: [
          {
            path: '/repair/screen/RepairDashboard',
            name: 'RepairDashboard',
            meta: { title: '数据展示' },
          }
        ]
      }
    ]
  },
  {
    path: '/system',
    name: 'system',
    meta: { title: '系统管理', icon: User },
    children: [
      {
        path: '/system/manage',
        name: 'manage',
        meta: { title: '管理' },
        children: [
          {
            path: '/system/manage/V',
            name: 'V',
            meta: { title: '页面V' },
          }
        ]
      },{
        path: '/system/configuration',
        name: 'configuration',
        meta: { title: '配置' },
        children: [
          {
            path: '/system/configuration/W',
            name: 'W',
            meta: { title: '页面W' },
          }
        ]
      },{
        path: '/system/screen',
        name: 'screen',
        meta: { title: '大屏' },
        children: [
          {
            path: '/system/screen/X',
            name: 'X',
            meta: { title: '页面X' },
          }
        ]
      }
    ]
  },


]

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
    meta: {title: item.meta.title}
  }
  tabsStore.addTab(tabItem)
}

// 处理菜单选择事件
const handleMenuSelect = (index) => {
  const routeItem = findRouteItem(index)
  if (routeItem) {
    handleMenuClick(routeItem)
  }
}

// 递归查找路由项
const findRouteItem = (path) => {
  const search = (items) => {
    for (const item of items) {
      if (item.path === path) return item
      if (item.children && item.children.length) {
        const found = search(item.children)
        if (found) return found
      }
    }
    return null
  }
  return search(menuItems)
}
</script>

<style scoped lang="scss">
.side-bar {
  width: 240px;
  background: linear-gradient(to bottom, #001529, #002140);
  color: #fff;
  height: 100vh;
  display: flex;
  flex-direction: column;
  box-shadow: 2px 0 12px rgba(0, 0, 0, 0.25);
  transition: all 0.3s ease;
}

.system-title {
  height: 64px;
  line-height: 64px;
  text-align: center;
  font-size: 18px;
  font-weight: 600;
  letter-spacing: 1px;
  background-color: rgba(0, 21, 41, 0.85);
  border-bottom: 1px solid rgba(24, 144, 255, 0.3);
  padding: 0 16px;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
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
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  background-color: rgba(0, 21, 41, 0.85);
  padding: 0 20px;

  .admin-name {
    font-size: 14px;
    font-weight: 500;
  }
}

/* 菜单项样式 */
.menu-item-content {
  display: flex;
  align-items: center;
  width: 100%;
  padding: 0 4px;
}

.submenu-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 0 4px;
}

.menu-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  font-size: 18px;
  width: 24px;
  height: 24px;
}

.arrow-icon {
  margin-left: auto;
  font-size: 14px;
  transition: transform 0.3s;
}

/* 菜单激活样式 */
:deep(.el-menu) {
  border-right: none;
}

:deep(.el-menu-item),
:deep(.el-sub-menu__title) {
  height: 48px;
  line-height: 48px;
  font-size: 14px;
  transition: all 0.3s;
  border-radius: 4px;
  margin: 4px 8px;

  &:hover {
    background-color: rgba(24, 144, 255, 0.15) !important;
    color: #fff !important;
  }
}

:deep(.el-menu-item.is-active) {
  background: linear-gradient(to right, rgba(24, 144, 255, 0.25), transparent) !important;
  color: #1890ff !important;
  font-weight: 500;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    height: 100%;
    width: 4px;
    background-color: #1890ff;
    border-radius: 0 4px 4px 0;
  }
}

:deep(.el-sub-menu.is-active .el-sub-menu__title) {
  color: #1890ff !important;
}

:deep(.el-sub-menu .el-menu) {
  background-color: rgba(0, 33, 64, 0.5);
}

:deep(.el-sub-menu .el-menu .el-menu-item) {
  padding-left: 50px !important;
  height: 42px;
  line-height: 42px;
  margin: 2px 8px;
  font-size: 13px;
}

:deep(.el-menu--popup) {
  padding: 6px;
  border-radius: 8px;
  background: linear-gradient(to bottom, rgba(0, 21, 41, 0.95), rgba(0, 33, 64, 0.95));
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);

  .el-menu-item {
    min-width: 160px;
    border-radius: 4px;
    margin: 4px 0;

    &:hover {
      background-color: rgba(24, 144, 255, 0.2) !important;
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
</style>
