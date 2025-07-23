import { createRouter, createWebHistory } from 'vue-router'

const routes = [
    {
        path: '/',
        name: 'Home',
        component: () => import('@/views/index.vue'),
        meta: { title: '首页' }
    },
    {
        path: '/inspection',
        name: 'InspectionManagement',
        component: () => import('@/views/inspection/InspectionManagement.vue'),
        meta: { title: '点巡检管理' },
    },
    {
        path: '/inspection/period',
        name: 'InspectionPeriodSetting',
        component: () => import('@/views/inspection/InspectionPeriodSetting.vue'),
        meta: { title: '点检项目周期设置' }
    },
    {
        path: '/inspection/history',
        name: 'InspectionHistory',
        component: () => import('@/views/inspection/InspectionHistory.vue'),
        meta: { title: '历史数据' }
    },
    {
        path: '/inspection/abnormal-setting',
        name: 'InspectionAbnormalSetting',
        component: () => import('@/views/inspection/InspectionAbnormalSetting.vue'),
        meta: { title: '点检项目异常标识设置' }
    },
    {
        path: '/repair',
        name: 'RepairManagement',
        component: () => import('@/views/repair/RepairManagement.vue'),
        meta: { title: '维修管理' },
    },
    {
        path: '/repair/guide',
        name: 'RepairGuide',
        component: () => import('@/views/repair/RepairGuide.vue'),
        meta: { title: '维修指引' }
    },
    {
        path: '/repair/manage',
        name: 'RepairManage',
        component: () => import('@/views/repair/RepairManage.vue'),
        meta: { title: '设备维修管理' }
    },
    {
        path: '/maintenance',
        name: 'MaintenanceManagement',
        component: () => import('@/views/maintenance/MaintenanceManagement.vue'),
        meta: { title: '保养管理' }
    },
    {
        path: '/equipment',
        name: 'EquipmentManagement',
        component: () => import('@/views/equipment/EquipmentManagement.vue'),
        meta: { title: '设备实时监控管理' },
    },
    {
        path: '/equipment/monitoring-room',
        name: 'EquipmentMonitoringRoom',
        component: () => import('@/views/equipment/EquipmentMonitoringRoom.vue'),
        meta: { title: '设备监控室' }
    },
    {
        path: '/equipment/status-history',
        name: 'EquipmentStatusHistory',
        component: () => import('@/views/equipment/EquipmentStatusHistory.vue'),
        meta: { title: '设备状态履历图' }
    },
    {
        path: '/equipment/real-time',
        name: 'EquipmentRealTimeMonitoring',
        component: () => import('@/views/equipment/EquipmentOEETrend.vue'),
        meta: { title: '设备OEE趋势' }
    },
    {
        path: '/equipment/online-management',
        name: 'OnlineEquipmentManagement',
        component: () => import('@/views/equipment/VirtualFactory.vue'),
        meta: { title: '虚拟工厂及设置' }
    },
    {
        path: '/equipment/online-detail',
        name: 'OnlineEquipmentDetail',
        component: () => import('@/views/equipment/UtilizationReport.vue'),
        meta: { title: '稼动率报表' }
    },
    {
        path: '/equipment/history',
        name: 'EquipmentHistory',
        component: () => import('@/views/equipment/DowntimeManagement.vue'),
        meta: { title: '设备停机管理' }
    },
    {
        path: '/parts',
        name: 'PartsManagement',
        component: () => import('@/views/parts/PartsManagement.vue'),
        meta: { title: '备件管理' },
    },
    {
        path: '/parts/inventory-list',
        name: 'InventoryList',
        component: () => import('@/views/parts/InventoryList.vue'),
        meta: { title: '库存列表' }
    },
    {
        path: '/parts/pending-storage',
        name: 'PendingStorageManagement',
        component: () => import('@/views/parts/PendingStorageManagement.vue'),
        meta: { title: '待入库管理' }
    },
    {
        path: '/parts/storage-detail',
        name: 'StorageDetail',
        component: () => import('@/views/parts/StorageDetail.vue'),
        meta: { title: '入库明细' }
    },
    {
        path: '/parts/outbound-audit',
        name: 'OutboundAudit',
        component: () => import('@/views/parts/OutboundAudit.vue'),
        meta: { title: '出库审核页面' }
    },
    {
        path: '/parts/outbound-detail',
        name: 'OutboundDetail',
        component: () => import('@/views/parts/OutboundDetail.vue'),
        meta: { title: '出库明细' }
    },
    {
        path: '/mold',
        name: 'MoldManagement',
        component: () => import('@/views/mold/MoldManagement.vue'),
        meta: { title: '模具管理' },
    },
    {
        path: '/mold/life-cycle',
        name: 'MoldLifeCycle',
        component: () => import('@/views/mold/MoldLifeCycle.vue'),
        meta: { title: '模具生命周期管理' }
    },
    {
        path: '/mold/warehouse',
        name: 'MoldWarehouse',
        component: () => import('@/views/mold/MoldWarehouse.vue'),
        meta: { title: '模具仓库' }
    },
    {
        path: '/system',
        name: 'SystemManagement',
        component: () => import('@/views/system/SystemManagement.vue'),
        meta: { title: '权限管理' },
    },
    {
        path: '/system/menu-permission',
        name: 'MenuPermissionManagement',
        component: () => import('@/views/system/MenuPermissionManagement.vue'),
        meta: { title: '系统菜单管理及账户权限' }
    },
    {
        path: '/system/staff-configuration',
        name: 'StaffConfiguration',
        component: () => import('@/views/system/StaffConfiguration.vue'),
        meta: { title: '人员配置' }
    },
    {
        path: '/system/wechat-alert',
        name: 'WechatAlertSetting',
        component: () => import('@/views/system/WechatAlertSetting.vue'),
        meta: { title: '微信预警设置' }
    },
    {
        path: '/system/wechat-message',
        name: 'WechatMessageManagement',
        component: () => import('@/views/system/WechatMessageManagement.vue'),
        meta: { title: '微信信息管理' }
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router
