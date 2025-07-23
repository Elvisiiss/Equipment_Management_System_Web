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
        >
          <!-- 遍历一级菜单 -->
          <template v-for="item in menuItems" :key="item.path">
            <!-- 有子菜单的一级项 -->
            <el-sub-menu
                v-if="item.children && item.children.length"
                :index="item.path"
            >
              <template #title>
                <div class="parent-menu-wrapper" @click.stop="handleParentMenuClick(item)">
                  <span class="menu-title">{{ item.meta.title }}</span>
                </div>
              </template>
              <!-- 二级菜单项 -->
              <el-menu-item
                  v-for="child in item.children"
                  :key="child.path"
                  :index="child.path"
                  @click="handleChildMenuClick(child)"
              >
                <span class="submenu-title">{{ child.meta.title }}</span>
              </el-menu-item>
            </el-sub-menu>

            <!-- 没有子菜单的一级项 -->
            <el-menu-item
                v-else
                :index="item.path"
                @click="handleChildMenuClick(item)"
            >
              <span class="menu-title">{{ item.meta.title }}</span>
            </el-menu-item>
          </template>
        </el-menu>
      </el-scrollbar>
    </div>
    <div class="admin-area">
      <span>管理员</span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useTabsStore } from '@/store/tabs'

// 路由实例
const route = useRoute()
const router = useRouter()
const tabsStore = useTabsStore()

// 菜单结构（与路由配置完全匹配）
const menuItems = [
  {
    path: '/',
    name: 'Home',
    meta: { title: '首页' }
  },
  {
    path: '/inspection',
    name: 'InspectionManagement',
    meta: { title: '点巡检管理' },
    children: [
      {
        path: '/inspection/period',
        name: 'InspectionPeriodSetting',
        meta: { title: '点检项目周期设置' }
      },
      {
        path: '/inspection/history',
        name: 'InspectionHistory',
        meta: { title: '历史数据' }
      },
      {
        path: '/inspection/abnormal-setting',
        name: 'InspectionAbnormalSetting',
        meta: { title: '点检项目异常标识设置' }
      }
    ]
  },
  {
    path: '/repair',
    name: 'RepairManagement',
    meta: { title: '维修管理' },
    children: [
      {
        path: '/repair/guide',
        name: 'RepairGuide',
        meta: { title: '维修指引' }
      },
      {
        path: '/repair/manage',
        name: 'RepairManage',
        meta: { title: '设备维修管理' }
      }
    ]
  },
  {
    path: '/maintenance',
    name: 'MaintenanceManagement',
    meta: { title: '保养管理' }
  },
  {
    path: '/equipment',
    name: 'EquipmentManagement',
    meta: { title: '设备实时监控管理' },
    children: [
      {
        path: '/equipment/monitoring-room',
        name: 'EquipmentMonitoringRoom',
        meta: { title: '设备监控室' }
      },
      {
        path: '/equipment/status-history',
        name: 'EquipmentStatusHistory',
        meta: { title: '设备状态履历图' }
      },
      {
        path: '/equipment/real-time',
        name: 'EquipmentRealTimeMonitoring',
        meta: { title: '设备OEE趋势' }
      },
      {
        path: '/equipment/online-management',
        name: 'OnlineEquipmentManagement',
        meta: { title: '虚拟工厂及设置' }
      },
      {
        path: '/equipment/online-detail',
        name: 'OnlineEquipmentDetail',
        meta: { title: '稼动率报表' }
      },
      {
        path: '/equipment/history',
        name: 'EquipmentHistory',
        meta: { title: '设备停机管理' }
      }
    ]
  },
  {
    path: '/parts',
    name: 'PartsManagement',
    meta: { title: '备件管理' },
    children: [
      {
        path: '/parts/inventory-list',
        name: 'InventoryList',
        meta: { title: '库存列表' }
      },
      {
        path: '/parts/pending-storage',
        name: 'PendingStorageManagement',
        meta: { title: '待入库管理' }
      },
      {
        path: '/parts/storage-detail',
        name: 'StorageDetail',
        meta: { title: '入库明细' }
      },
      {
        path: '/parts/outbound-audit',
        name: 'OutboundAudit',
        meta: { title: '出库审核页面' }
      },
      {
        path: '/parts/outbound-detail',
        name: 'OutboundDetail',
        meta: { title: '出库明细' }
      }
    ]
  },
  {
    path: '/mold',
    name: 'MoldManagement',
    meta: { title: '模具管理' },
    children: [
      {
        path: '/mold/life-cycle',
        name: 'MoldLifeCycle',
        meta: { title: '模具生命周期管理' }
      },
      {
        path: '/mold/warehouse',
        name: 'MoldWarehouse',
        meta: { title: '模具仓库' }
      }
    ]
  },
  {
    path: '/system',
    name: 'SystemManagement',
    meta: { title: '权限管理' },
    children: [
      {
        path: '/system/menu-permission',
        name: 'MenuPermissionManagement',
        meta: { title: '系统菜单管理及账户权限' }
      },
      {
        path: '/system/staff-configuration',
        name: 'StaffConfiguration',
        meta: { title: '人员配置' }
      },
      {
        path: '/system/wechat-alert',
        name: 'WechatAlertSetting',
        meta: { title: '微信预警设置' }
      },
      {
        path: '/system/wechat-message',
        name: 'WechatMessageManagement',
        meta: { title: '微信信息管理' }
      }
    ]
  },
  {
    path: '/asset',
    name: 'AssetManage',
    meta: { title: '资产管理' },
    children: [
      {
        path: '/asset/manage',
        name: 'EquipmentManage',
        meta: { title: '设备管理' }
      },
      {
        path: '/asset/history',
        name: 'EquipmentHistory',
        meta: { title: '设备履历页' }
      },
      {
        path: '/asset/online-equip',
        name: 'OnlineEquipmentManagement',
        meta: { title: '联机设备管理' }
      },
      {
        path: '/asset/detail',
        name: 'OnlineEquipmentDetail',
        meta: { title: '联机设备详情' }
      }
    ]
  }
]

// 当前激活的菜单
const activeMenu = computed(() => route.path)

// 处理有子菜单的一级菜单点击
const handleParentMenuClick = (item) => {
  // 跳转到一级菜单对应的页面
  if (item.path && route.path!== item.path) {
    router.push(item.path)
  }

  // 添加到标签页
  if (item.path) {
    const tabItem = {
      path: item.path,
      name: item.name,
      meta: { title: item.meta.title }
    }
    tabsStore.addTab(tabItem)
  }
}

// 处理二级菜单和无子菜单的一级菜单点击
const handleChildMenuClick = (item) => {
  // 跳转到对应页面
  if (item.path && route.path!== item.path) {
    router.push(item.path)
  }

  // 添加到标签页
  const tabItem = {
    path: item.path,
    name: item.name,
    meta: { title: item.meta.title }
  }
  tabsStore.addTab(tabItem)
}

// 处理菜单选择事件（兼容Element UI内部事件）
const handleMenuSelect = (index) => {
  const routeItem = findRouteItem(index)
  if (routeItem) {
    handleChildMenuClick(routeItem)
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

<style scoped>
.side-bar {
  width: 220px;
  background-color: #001529;
  color: #fff;
  height: 100vh;
  display: flex;
  flex-direction: column;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.1);
}

.system-title {
  height: 60px;
  line-height: 60px;
  text-align: center;
  font-size: 18px;
  font-weight: bold;
  border-bottom: 1px solid #1890ff;
  padding: 0 16px;
}

.menu-container {
  flex: 1;
  overflow: hidden;
}

.admin-area {
  height: 50px;
  line-height: 50px;
  text-align: center;
  border-top: 1px solid #1890ff;
  font-size: 14px;
}

/* 菜单样式 */
:deep(.custom-menu) {
  background-color: #001529;
  border-right: none;
}

:deep(.el-sub-menu__title),
:deep(.el-menu-item) {
  color: rgba(255, 255, 255, 0.85);
  height: 50px;
  line-height: 50px;
  font-size: 14px;
  padding-left: 24px !important;
}

/* 一级菜单点击区域样式 */
.parent-menu-wrapper {
  width: 100%;
  height: 100%;
  cursor: pointer;
  display: flex;
  align-items: center;
}

:deep(.el-sub-menu__title:hover),
:deep(.el-menu-item:hover) {
  background-color: #1890ff !important;
  color: #fff !important;
}

:deep(.el-menu-item.is-active),
:deep(.el-sub-menu.is-active .el-sub-menu__title) {
  background-color: #1890ff !important;
  color: #fff !important;
  border-left: 3px solid #fff;
}

:deep(.el-sub-menu .el-menu) {
  background-color: #000c17;
}

:deep(.el-sub-menu .el-menu .el-menu-item) {
  padding-left: 48px !important;
}

:deep(.el-sub-menu__icon-arrow) {
  color: rgba(255, 255, 255, 0.6);
  margin-right: 10px;
}

:deep(.el-sub-menu__title:hover .el-sub-menu__icon-arrow) {
  color: #fff;
}

.menu-title, .submenu-title {
  display: inline-block;
  width: 100%;
}
</style>
