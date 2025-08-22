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
  StarFilled
} from '@element-plus/icons-vue'

// 路由实例
const route = useRoute()
const router = useRouter()
const tabsStore = useTabsStore()
const authStore = useAuthStore()

// 用户信息计算属性
const userAvatar = computed(() => authStore.user?.avatar_url || 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png')
const userName = computed(() => authStore.user?.user_name || '管理员')

// 菜单结构（包含三级菜单示例）
const menuItems = [
  {
    path: '/',
    name: 'Home',
    meta: {title: '首页', icon: HomeFilled},
    permissionId: 1
  },
  //Check Management
  {
    path: '/check',
    name: 'check',
    meta: { title: '审核管理', icon: StarFilled },
    permissionId: 1,
    children: [
      {
        path: '/check/list',
        name: 'CheckList',
        meta: { title: '审核任务' },
        permissionId: 1,
      },
      {
        path: '/asset/result',
        name: 'CheckResult',
        meta: {title: '审批配置', icon: StarFilled},
        permissionId: 1,
      },
    ]
  },
  // Asset Management
  {
    path: '/asset',
    name: 'asset',
    meta: {title: '资产管理', icon: Connection},
    permissionId: 1,
    children: [
      {
        path: '/asset/manage',
        name: 'manage',
        meta: {title: '设备台账'},
        permissionId: 1,
        children: [
          {
            path: '/asset/manage/list',
            name: 'EquipmentLedger',
            meta: {title: '设备清单'},
            permissionId: 1
          },
          {
            path: '/asset/manage/index',
            name: 'AssetIndex',
            meta: {title: '设备详情页'},
            permissionId: 1
          },
        ]
      },
      {
        path: '/asset/screen',
        name: 'screen',
        meta: {title: '资产看板'},
        permissionId: 1,
      }
    ]
  },
  {
    path: '/equipment',
    name: 'equipment',
    meta: {title: '设备实时监控', icon: Monitor},
    permissionId: 1,
    children: [
      {
        path: '/equipment/monitoring',
        name: 'Monitoring',
        meta: {title: '管理'},
        permissionId: 1,
        children: [
          {
            path: '/equipment/monitoring/manage',
            name: 'Equipment',
            meta: {title: '设备管理2'},
            permissionId: 1,
          },
          {
            path: '/equipment/monitoring/summary',
            name: 'EquipmentSummary',
            meta: {title: '设备详情2'},
            permissionId: 1
          },
          {
            path: '/equipment/monitoring/exception',
            name: 'Exception',
            meta: {title: '异常与阈值'},
            permissionId: 1,
          },
          {
            path: '/equipment/status/policies',
            name: 'Policies',
            meta: {title: '状态规则与策略'},
            permissionId: 1,
          },
          {
            path: '/equipment/location/transfer',
            name: 'Transfer',
            meta: {title: '设备转机'},
            permissionId: 1,
          },
          {
            path: '/equipment/location/pm',
            name: 'PM',
            meta: {title: '布局管理'},
            permissionId: 1,
          },
          {
            path: '/equipment/EquipmentManage',
            name: 'EquipmentManage',
            meta: {title: '设备管理'},
            permissionId: 1,
          },
        ]
      },
      {
        path: '/equipment/screen',
        name: 'screen',
        meta: {title: '设备监控看板'},
        permissionId: 1,
        children: [
          {
            path: '/equipment/screen/oee',
            name: 'OEEManagement',
            meta: {title: 'OEE管理看板'},
            permissionId: 1
          },
          {
            path: '/equipment/screen/down',
            name: 'DownManagement',
            meta: {title: '停机分析报表'},
            permissionId: 1
          },
          {
            path: '/equipment/screen/status',
            name: 'EquipmentStatus',
            meta: {title: '性能稼动率报表'},
            permissionId: 1
          },
          {
            path: '/equipment/screen/iot',
            name: 'IOTManagement',
            meta: {title: '时间稼动率报表'},
            permissionId: 1
          }
        ]
      },
      {
        path: '/equipment/SPC',
        name: 'SPCIndexPage',
        meta: {title: '设备SPC看板'},
        permissionId: 1,
        children: []
      },
      {
        path: '/equipment/configuration',
        name: 'configuration',
        meta: {title: '配置'},
        permissionId: 1,
      }
    ]
  },
  {
    path: '/inspection',
    name: 'inspection',
    meta: {title: '点巡检管理', icon: List},
    permissionId: 1,
    children: [
      {
        path: '/inspection/manage',
        name: 'manage',
        meta: {title: '管理'},
        permissionId: 1,
        children: [
          {
            path: '/inspection/manage/ExceptionList',
            name: 'ExceptionList',
            meta: {title: '异常列表'},
            permissionId: 1
          }, {
            path: '/inspection/manage/PlanList',
            name: 'PlanList',
            meta: {title: '计划列表'},
            permissionId: 1
          }, {
            path: '/inspection/manage/TaskList',
            name: 'TaskList',
            meta: {title: '任务列表'},
            permissionId: 1
          },
        ]
      }, {
        path: '/inspection/configuration',
        name: 'configuration',
        meta: {title: '配置'},
        permissionId: 1,
        children: [
          {
            path: '/inspection/configuration/PolicyConfig',
            name: 'PolicyConfig',
            meta: {title: '点巡检配置'},
            permissionId: 1
          }
        ]
      },
      {
        path: '/inspection/screen',
        name: 'screen',
        meta: {title: '大屏'},
        permissionId: 1,
        children: [
          {
            path: '/inspection/screen/Dashboard',
            name: 'Dashboard',
            meta: {title: '仪表盘'},
            permissionId: 1
          }, {
            path: '/inspection/screen/EfficiencyAnalysis',
            name: 'EfficiencyAnalysis',
            meta: {title: '效率分析'},
            permissionId: 1
          }, {
            path: '/inspection/screen/ExceptionAnalysis',
            name: 'ExceptionAnalysis',
            meta: {title: '异常分析'},
            permissionId: 1
          },
        ]
      }
    ]
  },
  {
    path: '/maintenance',
    name: 'maintenance',
    meta: {title: '保养管理', icon: Setting},
    permissionId: 1,
    children: [
      {
        path: '/maintenance/manage',
        name: 'manage',
        meta: {title: '管理'},
        permissionId: 1,
        children: [
          {
            path: '/maintenance/manage/ApprovalList',
            name: 'ApprovalList',
            meta: {title: '审批列表页面'},
            permissionId: 1
          },
          {
            path: '/maintenance/manage/MyApprovals',
            name: 'MyApprovals',
            meta: {title: '我的审批结果'},
            permissionId: 1
          }
        ]
      }
    ]
  },
  {
    path: '/mold',
    name: 'mold',
    meta: {title: '模具/治工具管理', icon: HomeFilled},
    permissionId: 1,
    children: [
      {
        path: '/mold/MoldManagement',
        name: 'manage',
        meta: {title: '管理'},
        permissionId: 1,
        children: [
          {
            path: '/mold/manage/life',
            name: 'MoldLifecycle',
            meta: {title: '全生命周期管理'},
            permissionId: 1
          },
          {
            path: '/mold/manage/operation',
            name: 'ToolErrorProof',
            meta: {title: '防用错处理'},
            permissionId: 1
          },
          {
            path: '/mold/manage/maintenance',
            name: 'ToolMaintenance',
            meta: {title: ' 维护与点检'},
            permissionId: 1
          },
          {
            path: '/mold/manage/storage',
            name: 'ToolStorage',
            meta: {title: '全生命周期2.0'},
            permissionId: 1
          },
        ]
      }
    ]
  },
  {
    path: '/parts',
    name: 'parts',
    meta: {title: '备件管理', icon: Box},
    permissionId: 1,
    children: [
      {
        path: '/parts/manage',
        name: 'manage',
        meta: {title: '管理'},
        permissionId: 1,
        children: [
          {
            path: '/parts/manage/SparePartCode',
            name: 'SparePartCode',
            meta: {title: '备件编码管理'},
            permissionId: 1
          },
          {
            path: '/parts/manage/SparePartInventory',
            name: 'SparePartInventory',
            meta: {title: '备品备件台账'},
            permissionId: 1
          },
          {
            path: '/parts/manage/EdgeInventory',
            name: 'EdgeInventory',
            meta: {title: '线边库存管理'},
            permissionId: 1
          },
          {
            path: '/parts/manage/EquipmentBOM',
            name: 'EquipmentBOM',
            meta: {title: '设备BOM管理'},
            permissionId: 1
          },
          {
            path: '/parts/manage/LocationManagement',
            name: 'LocationManagement',
            meta: {title: '库位管理'},
            permissionId: 1
          },
        ]
      }
    ]
  },
  {
    path: '/repair',
    name: 'repair',
    meta: {title: '维修管理', icon: Tools},
    permissionId: 1,
    children: [
      {
        path: '/repair/manage',
        name: 'manage',
        meta: {title: '管理'},
        permissionId: 1,
        children: [
          {
            path: '/repair/manage/KnowledgeBase',
            name: 'KnowledgeBase',
            meta: {title: '维修知识库'},
            permissionId: 1
          },
          {
            path: '/repair/manage/RepairOrder',
            name: 'RepairOrder',
            meta: {title: '维修工单管理'},
            permissionId: 1
          }
        ]
      }, {
        path: '/repair/configuration',
        name: 'configuration',
        meta: {title: '配置'},
        permissionId: 1,
        children: [
          {
            path: '/repair/configuration/RepairConfig',
            name: 'RepairConfig',
            meta: {title: '维修配置管理'},
            permissionId: 1
          }
        ]
      },
      {
        path: '/repair/screen',
        name: 'screen',
        meta: {title: '大屏'},
        permissionId: 1,
        children: [
          {
            path: '/repair/screen/RepairDashboard',
            name: 'RepairDashboard',
            meta: {title: '数据展示'},
            permissionId: 1
          }
        ]
      }, {
        path: '/repair/worker/list',
        name: 'repair-worker-list',
        meta: {title: '我的工单'},
        permissionId: 1
      }, {
        path: '/repair/admin/list',
        name: 'repair-admin-list',
        meta: {title: '待维修设备'},
        permissionId: 1
      }
    ]
  },
  {
    path: '/system',
    name: 'system',
    meta: {title: '系统管理', icon: User},
    permissionId:1,
    children: [
      {
        path: '/system/manage',
        name: 'manage',
        meta: {title: '用户管理'},
        permissionId: 1,
        children: [
          {
            path: '/system/manage/users_roles_permissions',
            name: 'users_roles_permissions',
            meta: {title: '用户管理'},
            permissionId: 1
          },
          {
            path: '/system/manage/department_management',
            name: 'department_management',
            meta: {title: '部门管理'},
            permissionId: 1
          },
          {
            path: '/system/manage/regionManagement',
            name: 'regionManagement',
            meta: {title: '区域管理'},
            permissionId: 1,
          },

        ]
      },
      {
        path: '/system/data',
        name: 'manage',
        meta: {title: '基础数据管理'},
        permissionId: 1,
        children: [
          {
            path: '/system/data/region',
            name: 'region',
            component: () => import('@/views/system/data/Region.vue'),
            meta: {title: '区域管理2'},
            permissionId: 1,
          },
          {
            path: '/system/data/product',
            name: 'regionManagement',
            meta: {title: '产品型号管理'},
            permissionId: 1,
          },
          {
            path: '/system/data/dict',
            name: 'dictionary',
            meta: {title: '字典管理'},
            permissionId: 1
          },
          {
            path: '/system/data/log',
            name: 'log',
            meta: {title: '日志管理'},
            permissionId: 1
          },
          {
            path: '/system/data/DepartmentApproval',
            name: 'DepartmentApproval',
            meta: {title: '审批设置'},
            permissionId: 1
          },
        ]
      },

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
