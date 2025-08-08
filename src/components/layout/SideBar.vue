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
          <!-- 遍历过滤后的一级菜单 -->
          <template v-for="item in filteredMenuItems" :key="item.path">
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
      <el-avatar :size="36" :src="userAvatar" />
      <span class="admin-name">{{ userName }}</span>
    </div>
  </div>
</template>

<script setup>
import {ref, computed, onMounted} from 'vue'
import {useRoute, useRouter} from 'vue-router'
import {useAuthStore} from '@/stores/auth'
import {useTabsStore} from '@/store/tabs'
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
const authStore = useAuthStore()

// 用户信息计算属性
const userAvatar = computed(() => authStore.user?.avatar_url || 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png')
const userName = computed(() => authStore.user?.user_name || '管理员')

// 权限映射表（权限ID -> 权限路径）
const permissionMap = {
  16: '/',
  17: '/asset',
  18: '/asset/manage',
  19: '/asset/manage/ledger',
  20: '/asset/manage/master',
  21: '/asset/manage/index',
  22: '/asset/manage/import',
  23: '/asset/manage/life',
  24: '/asset/manage/life/transfer',
  25: '/asset/configuration',
  26: '/asset/configuration/B',
  27: '/asset/screen',
  28: '/asset/screen/C',
  29: '/equipment',
  30: '/equipment/monitoring',
  31: '/equipment/monitoring/spc',
  32: '/equipment/monitoring/exception',
  33: '/equipment/status',
  34: '/equipment/status/policies',
  35: '/equipment/status/log',
  36: '/equipment/location',
  37: '/equipment/location/transfer',
  38: '/equipment/location/pm',
  39: '/equipment/location/recover',
  40: '/equipment/location/logic',
  41: '/equipment/EquipmentManage',
  42: '/equipment/screen',
  43: '/equipment/screen/oee',
  44: '/equipment/screen/status',
  45: '/equipment/screen/iot',
  46: '/equipment/configuration',
  47: '/inspection',
  48: '/inspection/manage',
  49: '/inspection/manage/ExceptionList',
  50: '/inspection/manage/PlanList',
  51: '/inspection/manage/TaskList',
  52: '/inspection/configuration',
  53: '/inspection/configuration/PolicyConfig',
  54: '/inspection/screen',
  55: '/inspection/screen/Dashboard',
  56: '/inspection/screen/EfficiencyAnalysis',
  57: '/inspection/screen/ExceptionAnalysis',
  58: '/maintenance',
  59: '/maintenance/manage',
  60: '/maintenance/manage/ApprovalList',
  61: '/maintenance/manage/MyApprovals',
  62: '/maintenance/configuration',
  63: '/maintenance/configuration/K',
  64: '/maintenance/screen',
  65: '/maintenance/screen/L',
  66: '/mold',
  67: '/mold/manage',
  68: '/mold/manage/life',
  69: '/mold/manage/operation',
  70: '/mold/manage/maintenance',
  71: '/mold/manage/storage',
  72: '/parts',
  73: '/parts/manage',
  74: '/parts/manage/SparePartCode',
  75: '/parts/manage/SparePartInventory',
  76: '/parts/manage/EdgeInventory',
  77: '/parts/manage/EquipmentBOM',
  78: '/parts/manage/EquipmentDetail',
  79: '/parts/manage/LocationForm',
  80: '/parts/manage/LocationManagement',
  81: '/parts/configuration',
  82: '/parts/configuration/Q',
  83: '/parts/screen',
  84: '/parts/screen/R',
  85: '/repair',
  86: '/repair/manage',
  87: '/repair/manage/KnowledgeBase',
  88: '/repair/manage/RepairOrder',
  89: '/repair/configuration',
  90: '/repair/configuration/RepairConfig',
  91: '/repair/screen',
  92: '/repair/screen/RepairDashboard',
  93: '/repair/worker/list',
  94: '/repair/admin/list',
  95: '/system',
  96: '/system/manage',
  97: '/system/manage/users_roles_permissions',
  98: '/system/manage/regionManagement',
  99: '/system/configuration',
  100: '/system/configuration/DepartmentApproval',
  101: '/system/screen',
  102: '/system/screen/X'
}

// 菜单结构（包含三级菜单示例）
const menuItems = [
  {
    path: '/',
    name: 'Home',
    meta: {title: '首页', icon: HomeFilled},
    permissionId: 16
  },
  {
    path: '/asset',
    name: 'asset',
    meta: {title: '资产管理', icon: Connection},
    permissionId: 17,
    children: [
      {
        path: '/asset/manage',
        name: 'manage',
        meta: {title: '管理'},
        permissionId: 18,
        children: [
          {
            path: '/asset/manage/ledger',
            name: 'EquipmentLedger',
            meta: {title: '设备台账'},
            permissionId: 19
          },
          {
            path: '/asset/manage/master',
            name: 'AssetMaster',
            meta: {title: '主数据管理'},
            permissionId: 20
          },
          {
            path: '/asset/manage/index',
            name: 'AssetIndex',
            meta: {title: '资产索引'},
            permissionId: 21
          },
          {
            path: '/asset/manage/import',
            name: 'AssetImport',
            meta: {title: '资产入库'},
            permissionId: 22
          },
          {
            path: '/asset/manage/life',
            name: 'AssetLifecycle',
            meta: {title: '全生命周期管理'},
            permissionId: 23
          },
          {
            path: '/asset/manage/life/transfer',
            name: 'AssetTransfer',
            meta: {title: '资产转移'},
            permissionId: 24
          },

        ]
      }, {
        path: '/asset/configuration',
        name: 'configuration',
        meta: {title: '配置'},
        permissionId: 25,
        children: [
          {
            path: '/asset/configuration/B',
            name: 'B',
            meta: {title: '页面B'},
            permissionId: 26
          }
        ]
      }, {
        path: '/asset/screen',
        name: 'screen',
        meta: {title: '大屏'},
        permissionId: 27,
        children: [
          {
            path: '/asset/screen/C',
            name: 'C',
            meta: {title: '页面C'},
            permissionId: 28
          }
        ]
      }
    ]
  },
  {
    path: '/equipment',
    name: 'equipment',
    meta: {title: '设备实时监控', icon: Monitor},
    permissionId: 29,
    children: [
      {
        path: '/equipment/monitoring',
        name: 'Monitoring',
        meta: {title: '实时状态监控'},
        permissionId: 30,
        children: [
          {
            path: '/equipment/monitoring/spc',
            name: 'SPCManagement',
            meta: {title: '设备SPC监控'},
            permissionId: 31
          },
          {
            path: '/equipment/monitoring/exception',
            name: 'Exception',
            meta: {title: '异常与阈值'},
            permissionId: 32
          },
        ]
      },
      {
        path: '/equipment/status',
        name: 'Status',
        meta: {title: '设备状态管理'},
        permissionId: 33,
        children: [
          {
            path: '/equipment/status/policies',
            name: 'Policies',
            meta: {title: '状态规则与策略'},
            permissionId: 34
          },
          {
            path: '/equipment/status/log',
            name: 'Log',
            meta: {title: '状态维护'},
            permissionId: 35
          },
        ]
      },
      {
        path: '/equipment/location',
        name: 'Location',
        meta: {title: '布局管理'},
        permissionId: 36,
        children: [
          {
            path: '/equipment/location/transfer',
            name: 'Transfer',
            meta: {title: '设备转机'},
            permissionId: 37
          },
          {
            path: '/equipment/location/pm',
            name: 'PM',
            meta: {title: 'PM工单'},
            permissionId: 38
          },
          {
            path: '/equipment/location/recover',
            name: 'Recover',
            meta: {title: '复机管理'},
            permissionId: 39
          },
          {
            path: '/equipment/location/logic',
            name: 'Logic',
            meta: {title: '逻辑位置'},
            permissionId: 40
          }
        ]
      },
      {
        path: '/equipment/EquipmentManage',
        name: 'EquipmentManage',
        meta: {title: '设备管理'},
        permissionId: 41
      },
      {
        path: '/equipment/screen',
        name: 'screen',
        meta: {title: '大屏'},
        permissionId: 42,
        children: [
          {
            path: '/equipment/screen/oee',
            name: 'OEEManagement',
            meta: {title: 'OEE管理看板'},
            permissionId: 43
          },
          {
            path: '/equipment/screen/status',
            name: 'EquipmentStatus',
            meta: {title: '设备状态看板'},
            permissionId: 44
          },
          {
            path: '/equipment/screen/iot',
            name: 'IOTManagement',
            meta: {title: 'IOT管理看板'},
            permissionId: 45
          }
        ]
      },
      {
        path: '/equipment/configuration',
        name: 'configuration',
        meta: {title: '配置'},
        permissionId: 46
      }
    ]
  },
  {
    path: '/inspection',
    name: 'inspection',
    meta: {title: '点巡检管理', icon: List},
    permissionId: 47,
    children: [
      {
        path: '/inspection/manage',
        name: 'manage',
        meta: {title: '管理'},
        permissionId: 48,
        children: [
          {
            path: '/inspection/manage/ExceptionList',
            name: 'ExceptionList',
            meta: {title: '异常列表'},
            permissionId: 49
          }, {
            path: '/inspection/manage/PlanList',
            name: 'PlanList',
            meta: {title: '计划列表'},
            permissionId: 50
          }, {
            path: '/inspection/manage/TaskList',
            name: 'TaskList',
            meta: {title: '任务列表'},
            permissionId: 51
          },
        ]
      }, {
        path: '/inspection/configuration',
        name: 'configuration',
        meta: {title: '配置'},
        permissionId: 52,
        children: [
          {
            path: '/inspection/configuration/PolicyConfig',
            name: 'PolicyConfig',
            meta: {title: '点巡检配置'},
            permissionId: 53
          }
        ]
      },
      {
        path: '/inspection/screen',
        name: 'screen',
        meta: {title: '大屏'},
        permissionId: 54,
        children: [
          {
            path: '/inspection/screen/Dashboard',
            name: 'Dashboard',
            meta: {title: '仪表盘'},
            permissionId: 55
          }, {
            path: '/inspection/screen/EfficiencyAnalysis',
            name: 'EfficiencyAnalysis',
            meta: {title: '效率分析'},
            permissionId: 56
          }, {
            path: '/inspection/screen/ExceptionAnalysis',
            name: 'ExceptionAnalysis',
            meta: {title: '异常分析'},
            permissionId: 57
          },
        ]
      }
    ]
  },
  {
    path: '/maintenance',
    name: 'maintenance',
    meta: {title: '保养管理', icon: Setting},
    permissionId: 58,
    children: [
      {
        path: '/maintenance/manage',
        name: 'manage',
        meta: {title: '管理'},
        permissionId: 59,
        children: [
          {
            path: '/maintenance/manage/ApprovalList',
            name: 'ApprovalList',
            meta: {title: '审批列表页面'},
            permissionId: 60
          },
          {
            path: '/maintenance/manage/MyApprovals',
            name: 'MyApprovals',
            meta: {title: '我的审批结果'},
            permissionId: 61
          }
        ]
      }, {
        path: '/maintenance/configuration',
        name: 'configuration',
        meta: {title: '配置'},
        permissionId: 62,
        children: [
          {
            path: '/maintenance/configuration/K',
            name: 'K',
            meta: {title: '页面K'},
            permissionId: 63
          }
        ]
      }, {
        path: '/maintenance/screen',
        name: 'screen',
        meta: {title: '大屏'},
        permissionId: 64,
        children: [
          {
            path: '/maintenance/screen/L',
            name: 'L',
            meta: {title: '页面L'},
            permissionId: 65
          }
        ]
      }
    ]
  },
  {
    path: '/mold',
    name: 'mold',
    meta: {title: '模具/治工具管理', icon: HomeFilled},
    permissionId: 66,
    children: [
      {
        path: '/mold/manage',
        name: 'manage',
        meta: {title: '管理'},
        permissionId: 67,
        children: [
          {
            path: '/mold/manage/life',
            name: 'MoldLifecycle',
            meta: {title: '全生命周期管理'},
            permissionId: 68
          },
          {
            path: '/mold/manage/operation',
            name: 'ToolErrorProof',
            meta: {title: '防用错处理'},
            permissionId: 69
          },
          {
            path: '/mold/manage/maintenance',
            name: 'ToolMaintenance',
            meta: {title: ' 维护与点检'},
            permissionId: 70
          },
          {
            path: '/mold/manage/storage',
            name: 'ToolStorage',
            meta: {title: '全生命周期2.0'},
            permissionId: 71
          },
        ]
      }
    ]
  },
  {
    path: '/parts',
    name: 'parts',
    meta: {title: '备件管理', icon: Box},
    permissionId: 72,
    children: [
      {
        path: '/parts/manage',
        name: 'manage',
        meta: {title: '管理'},
        permissionId: 73,
        children: [
          {
            path: '/parts/manage/SparePartCode',
            name: 'SparePartCode',
            meta: {title: '备件编码管理'},
            permissionId: 74
          },
          {
            path: '/parts/manage/SparePartInventory',
            name: 'SparePartInventory',
            meta: {title: '备品备件台账'},
            permissionId: 75
          },
          {
            path: '/parts/manage/EdgeInventory',
            name: 'EdgeInventory',
            meta: {title: '线边库存管理'},
            permissionId: 76
          },
          {
            path: '/parts/manage/EquipmentBOM',
            name: 'EquipmentBOM',
            meta: {title: '设备BOM管理'},
            permissionId: 77
          },
          {
            path: '/parts/manage/EquipmentDetail',
            name: 'EquipmentDetail',
            meta: {title: '设备详情-不要的'},
            permissionId: 78
          },
          {
            path: '/parts/manage/LocationForm',
            name: 'LocationForm',
            meta: {title: '表单-不要的'},
            permissionId: 79
          },
          {
            path: '/parts/manage/LocationManagement',
            name: 'LocationManagement',
            meta: {title: '库位管理'},
            permissionId: 80
          },
        ]
      }, {
        path: '/parts/configuration',
        name: 'configuration',
        meta: {title: '配置'},
        permissionId: 81,
        children: [
          {
            path: '/parts/configuration/Q',
            name: 'Q',
            meta: {title: '页面Q'},
            permissionId: 82
          }
        ]
      }, {
        path: '/parts/screen',
        name: 'screen',
        meta: {title: '大屏'},
        permissionId: 83,
        children: [
          {
            path: '/parts/screen/R',
            name: 'R',
            meta: {title: '页面R'},
            permissionId: 84
          }
        ]
      }
    ]
  },
  {
    path: '/repair',
    name: 'repair',
    meta: {title: '维修管理', icon: Tools},
    permissionId: 85,
    children: [
      {
        path: '/repair/manage',
        name: 'manage',
        meta: {title: '管理'},
        permissionId: 86,
        children: [
          {
            path: '/repair/manage/KnowledgeBase',
            name: 'KnowledgeBase',
            meta: {title: '维修知识库'},
            permissionId: 87
          },
          {
            path: '/repair/manage/RepairOrder',
            name: 'RepairOrder',
            meta: {title: '维修工单管理'},
            permissionId: 88
          }
        ]
      }, {
        path: '/repair/configuration',
        name: 'configuration',
        meta: {title: '配置'},
        permissionId: 89,
        children: [
          {
            path: '/repair/configuration/RepairConfig',
            name: 'RepairConfig',
            meta: {title: '维修配置管理'},
            permissionId: 90
          }
        ]
      }, {
        path: '/repair/screen',
        name: 'screen',
        meta: {title: '大屏'},
        permissionId: 91,
        children: [
          {
            path: '/repair/screen/RepairDashboard',
            name: 'RepairDashboard',
            meta: {title: '数据展示'},
            permissionId: 92
          }
        ]
      }, {
        path: '/repair/worker/list',
        name: 'repair-worker-list',
        meta: {title: '我的工单'},
        permissionId: 93
      }, {
        path: '/repair/admin/list',
        name: 'repair-admin-list',
        meta: {title: '待维修设备'},
        permissionId: 94
      }
    ]
  },
  {
    path: '/system',
    name: 'system',
    meta: {title: '系统管理', icon: User},
    permissionId: 95,
    children: [
      {
        path: '/system/manage',
        name: 'manage',
        meta: {title: '管理'},
        permissionId: 96,
        children: [
          {
            path: '/system/manage/users_roles_permissions',
            name: 'users_roles_permissions',
            meta: {title: '用户管理'},
            permissionId: 97
          }, {
            path: '/system/manage/regionManagement',
            name: 'regionManagement',
            meta: {title: '区域管理'},
            permissionId: 98
          }
        ]
      }, {
        path: '/system/configuration',
        name: 'configuration',
        meta: {title: '配置'},
        permissionId: 99,
        children: [
          {
            path: '/system/configuration/DepartmentApproval',
            name: 'DepartmentApproval',
            meta: {title: '审批设置'},
            permissionId: 100
          }
        ]
      }, {
        path: '/system/screen',
        name: 'screen',
        meta: {title: '大屏'},
        permissionId: 101,
        children: [
          {
            path: '/system/screen/X',
            name: 'X',
            meta: {title: '页面X'},
            permissionId: 102
          }
        ]
      }
    ]
  }
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

// 递归过滤菜单项
const filterMenuItems = (items, permissions) => {
  return items
      .map(item => {
        // 深拷贝当前项
        const newItem = {...item}

        // 处理子菜单
        if (newItem.children) {
          newItem.children = filterMenuItems(newItem.children, permissions)
        }

        return newItem
      })
      .filter(item => {
        // 检查当前项是否有权限
        const hasPermission = permissions.includes(item.permissionId)

        // 如果有子菜单，检查子菜单是否为空
        if (item.children && item.children.length > 0) {
          return hasPermission || item.children.length > 0
        }

        return hasPermission
      })
}

// 过滤后的菜单项
const filteredMenuItems = computed(() => {
  if (!authStore.user || !authStore.user.powers) return []

  // 获取用户权限ID列表
  const permissions = authStore.user.powers

  // 递归过滤菜单项
  return filterMenuItems(menuItems, permissions)
})
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
