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
          <!-- 遍历一级菜单 -->
          <template v-for="item in menuItems" :key="item.path">
            <!-- 有子菜单的项 -->
            <el-sub-menu v-if="item.children && item.children.length" :index="item.path">
              <template #title>
                <span @click="handleParentClick(item)">{{ item.meta.title }}</span>
              </template>
              <!-- 二级菜单项 -->
              <el-menu-item
                  v-for="child in item.children"
                  :key="child.path"
                  :index="child.path"
              >
                {{ child.meta.title }}
              </el-menu-item>
            </el-sub-menu>

            <!-- 没有子菜单的项 -->
            <el-menu-item v-else :index="item.path">
              {{ item.meta.title }}
            </el-menu-item>
          </template>
        </el-menu>
      </el-scrollbar>
    </div>
    <!-- 已删除收起按钮 -->
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useTabsStore } from '@/store/tabs'
import router from "@/router/index.js";

const route = useRoute()
const tabsStore = useTabsStore()

const isCollapse = ref(false)

// 更新后的菜单结构 - 为所有一级菜单添加路径
const menuItems = [
  {
    path: '/',
    name: 'Home',
    meta: { title: '首页' }
  },
  {
    path: '/inspection', // 添加一级菜单路径
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
    path: '/repair', // 添加一级菜单路径
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
        meta: { title: '设备维修管理无纸化' }
      }
    ]
  },
  {
    path: '/maintenance',
    name: 'MaintenanceManagement',
    meta: { title: '保养管理' }
  },
  {
    path: '/equipment', // 添加一级菜单路径
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
    path: '/parts', // 添加一级菜单路径
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
    path: '/mold', // 添加一级菜单路径
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
    path: '/system', // 添加一级菜单路径
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
    path: '/asset', // 添加一级菜单路径
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

const activeMenu = computed(() => {
  const { path } = route
  return path
})

const handleMenuSelect = (index) => {
  const routeItem = findRouteItem(index)
  if (routeItem) {
    tabsStore.addTab(routeItem)
  }
}

// 处理一级菜单点击
const handleParentClick = (item) => {
  // 确保一级菜单有自己的路由页面
  if (item.path) {
    const routeItem = findRouteItem(item.path)
    if (routeItem) {
      tabsStore.addTab(routeItem)
      // 新增路由跳转逻辑
      if (route.path !== item.path) {
        router.push(item.path)
      }
    }
  }
}

const findRouteItem = (path) => {
  // 递归查找路由项
  const findItem = (items) => {
    for (const item of items) {
      if (item.path === path) return item
      if (item.children && item.children.length) {
        const found = findItem(item.children)
        if (found) return found
      }
    }
    return null
  }
  return findItem(menuItems)
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

/* 删除收起按钮相关样式 */
</style>
