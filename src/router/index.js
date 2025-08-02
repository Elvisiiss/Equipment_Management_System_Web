import { createRouter, createWebHistory } from 'vue-router'
import {HomeFilled} from "@element-plus/icons-vue";

const routes = [
    {
        path: '/',
        name: 'Home',
        component: () => import('@/views/index.vue'),
        meta: { title: '首页' }
    },
    {
        path: '/login',
        name: 'Login',
        component: () => import('@/views/Auth/Login.vue'),
        meta: { title: '登录' }
    },
    // Asset Management
    {
        path: '/asset',
        name: 'asset',
        component: () => import('@/views/asset/IndexPage.vue'),
        meta: { title: '资产管理', icon: HomeFilled },
    },
    {
        path: '/asset/manage',
        name: 'asset-manage',
        component: () => import('@/views/asset/manage.vue'),
        meta: { title: '管理' },
    },
    {
        path: '/asset/manage/A',
        name: 'A',
        component: () => import('@/views/asset/manage/A.vue'),
        meta: { title: '页面A' },
    },
    {
        path: '/asset/configuration',
        name: 'asset-configuration',
        component: () => import('@/views/asset/configuration.vue'),
        meta: { title: '配置' },
    },
    {
        path: '/asset/configuration/B',
        name: 'B',
        component: () => import('@/views/asset/configuration/B.vue'),
        meta: { title: '页面B' },
    },
    {
        path: '/asset/screen',
        name: 'asset-screen',
        component: () => import('@/views/asset/screen.vue'),
        meta: { title: '大屏' },
    },
    {
        path: '/asset/screen/C',
        name: 'C',
        component: () => import('@/views/asset/screen/C.vue'),
        meta: { title: '页面C' },
    },
    // Equipment Monitoring
    {
        path: '/equipment',
        name: 'equipment',
        component: () => import('@/views/equipment/IndexPage.vue'),
        meta: { title: '设备实时监控', icon: HomeFilled },
    },
    {
        path: '/equipment/monitoring',
        name: 'Monitoring',
        component: () => import('@/views/equipment/Monitoring.vue'),
        meta: { title: '实时状态监控' }
    },
    {
        path: '/equipment/monitoring/spc',
        name: 'SPCManagement',
        component: () => import('@/views/equipment/manage/SPCManagement.vue'),
        meta: { title: '设备SPC监控' }
    },
    {
        path: '/equipment/monitoring/exception',
        name: 'Exception',
        component: () => import('@/views/equipment/manage/Exception.vue'),
        meta: { title: '异常与阈值' }
    },
    {
        path: '/equipment/status',
        name: 'Status',
        component: () => import('@/views/equipment/Status.vue'),
        meta: { title: '设备状态管理' },
    },
    {
        path: '/equipment/status/policies',
        name: 'Policies',
        component: () => import('@/views/equipment/manage/Policies.vue'),
        meta: { title: '状态规则与策略' },
    },
    {
        path: '/equipment/status/log',
        name: 'Log',
        component: () => import('@/views/equipment/manage/Log.vue'),
        meta: { title: '状态维护' },
    },
    {
        path: '/equipment/location',
        name: 'Location',
        component: () => import('@/views/equipment/Location.vue'),
        meta: { title: '布局管理' },
    },
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
    },


    {
        path: '/equipment/configuration',
        name: 'equipment-configuration',
        component: () => import('@/views/equipment/configuration.vue'),
        meta: { title: '配置' },
    },
    {
        path: '/equipment/configuration/E',
        name: 'E',
        component: () => import('@/views/equipment/configuration/E.vue'),
        meta: { title: '页面E' },
    },
    {
        path: '/equipment/EquipmentManage',
        name: 'EquipmentManage',
        component: () => import('@/views/equipment/EquipmentManage.vue'),
        meta: { title: '设备管理' }
    },
    {
        path: '/equipment/screen',
        name: 'equipment-screen',
        component: () => import('@/views/equipment/screen.vue'),
        meta: { title: '大屏' },
    },
    {
        path: '/equipment/screen/oee',
        name: 'OEEManagement',
        component:()=>import('@/views/equipment/screen/OEEManagement.vue'),
        meta: { title: 'OEE管理看板' },
    },
    {
        path: '/equipment/screen/status',
        name: 'EquipmentStatus',
        component:()=>import('@/views/equipment/screen/EquipmentStatus.vue'),
        meta: { title: '设备状态看板' },
    },
    {
        path: '/equipment/screen/iot',
        name: 'IOTManagement',
        component:()=>import('@/views/equipment/screen/IOTManagement.vue'),
        meta: { title: 'IOT管理看板' },
    },
    // Inspection Management
    {
        path: '/inspection',
        name: 'inspection',
        component: () => import('@/views/inspection/IndexPage.vue'),
        meta: { title: '点巡检管理', icon: HomeFilled },
    },
    {
        path: '/inspection/manage',
        name: 'inspection-manage',
        component: () => import('@/views/inspection/manage.vue'),
        meta: { title: '管理' },
    },
    {
        path: '/inspection/manage/G',
        name: 'G',
        component: () => import('@/views/inspection/manage/G.vue'),
        meta: { title: '页面G' },
    },
    {
        path: '/inspection/configuration',
        name: 'inspection-configuration',
        component: () => import('@/views/inspection/configuration.vue'),
        meta: { title: '配置' },
    },
    {
        path: '/inspection/configuration/H',
        name: 'H',
        component: () => import('@/views/inspection/configuration/H.vue'),
        meta: { title: '页面H' },
    },
    {
        path: '/inspection/screen',
        name: 'inspection-screen',
        component: () => import('@/views/inspection/screen.vue'),
        meta: { title: '大屏' },
    },
    {
        path: '/inspection/screen/I',
        name: 'I',
        component: () => import('@/views/inspection/screen/I.vue'),
        meta: { title: '页面I' },
    },
    // Maintenance Management
    {
        path: '/maintenance',
        name: 'maintenance',
        component: () => import('@/views/maintenance/IndexPage.vue'),
        meta: { title: '保养管理', icon: HomeFilled },
    },
    {
        path: '/maintenance/form',
        name: 'm_form',
        component: () => import('@/views/maintenance/m_form.vue'),
        meta: { title: '设备保养-表单' },
    },
    {
        path: '/maintenance/action',
        name: 'm_action',
        component: () => import('@/views/maintenance/m_action.vue'),
        meta: { title: '设备保养-执行' },
    },
    {
        path: '/maintenance/manage',
        name: 'maintenance-manage',
        component: () => import('@/views/maintenance/manage.vue'),
        meta: { title: '管理' },
    },
    {
        path: '/maintenance/manage/ApprovalList',
        name: 'ApprovalList',
        component: () => import('@/views/maintenance/manage/ApprovalList.vue'),
        meta: { title: '审批列表' },
    },
    {
        path: '/maintenance/manage/ApprovalDetail',
        name: 'ApprovalDetail',
        component: () => import('@/views/maintenance/manage/ApprovalDetail.vue'),
        meta: { title: '审批详情' },
    },
    {
        path: '/maintenance/manage/MyApprovals',
        name: 'MyApprovals',
        component: () => import('@/views/maintenance/manage/MyApprovals.vue'),
        meta: { title: '我的审批结果' },
    },
    {
        path: '/maintenance/manage/ResubmitTask',
        name: 'ResubmitTask',
        component: () => import('@/views/maintenance/manage/ResubmitTask.vue'),
        meta: { title: '重新提交页面' },
    },
    {
        path: '/maintenance/configuration',
        name: 'maintenance-configuration',
        component: () => import('@/views/maintenance/configuration.vue'),
        meta: { title: '配置' },
    },
    {
        path: '/maintenance/configuration/K',
        name: 'K',
        component: () => import('@/views/maintenance/configuration/K.vue'),
        meta: { title: '页面K' },
    },
    {
        path: '/maintenance/screen',
        name: 'maintenance-screen',
        component: () => import('@/views/maintenance/screen.vue'),
        meta: { title: '大屏' },
    },
    {
        path: '/maintenance/screen/L',
        name: 'L',
        component: () => import('@/views/maintenance/screen/L.vue'),
        meta: { title: '页面L' },
    },
    // Mold Management
    {
        path: '/mold',
        name: 'mold',
        component: () => import('@/views/mold/IndexPage.vue'),
        meta: { title: '模具/治工具管理', icon: HomeFilled },
    },
    {
        path: '/mold/manage',
        name: 'mold-manage',
        component: () => import('@/views/mold/manage.vue'),
        meta: { title: '管理' },
    },
    {
        path: '/mold/manage/M',
        name: 'M',
        component: () => import('@/views/mold/manage/M.vue'),
        meta: { title: '页面M' },
    },
    {
        path: '/mold/configuration',
        name: 'mold-configuration',
        component: () => import('@/views/mold/configuration.vue'),
        meta: { title: '配置' },
    },
    {
        path: '/mold/configuration/N',
        name: 'N',
        component: () => import('@/views/mold/configuration/N.vue'),
        meta: { title: '页面N' },
    },
    {
        path: '/mold/screen',
        name: 'mold-screen',
        component: () => import('@/views/mold/screen.vue'),
        meta: { title: '大屏' },
    },
    {
        path: '/mold/screen/O',
        name: 'O',
        component: () => import('@/views/mold/screen/O.vue'),
        meta: { title: '页面O' },
    },
    // Parts Management
    {
        path: '/parts',
        name: 'parts',
        component: () => import('@/views/parts/IndexPage.vue'),
        meta: { title: '备件管理', icon: HomeFilled },
    },
    {
        path: '/parts/manage',
        name: 'parts-manage',
        component: () => import('@/views/parts/manage.vue'),
        meta: { title: '管理' },
    },
    {
        path: '/parts/manage/P',
        name: 'P',
        component: () => import('@/views/parts/manage/P.vue'),
        meta: { title: '页面P' },
    },
    {
        path: '/parts/manage/SparePartCode',
        name: 'SparePartCode',
        component: () => import('@/views/parts/manage/SparePartCode.vue'),
        meta: { title: '备件编码管理' },
    },
    {
        path: '/parts/manage/SparePartInventory',
        name: 'SparePartInventory',
        component: () => import('@/views/parts/manage/SparePartInventory.vue'),
        meta: { title: '备品备件台账' },
    },
    {
        path: '/parts/manage/EdgeInventory',
        name: 'EdgeInventory',
        component: () => import('@/views/parts/manage/EdgeInventory.vue'),
        meta: { title: '线边库存管理' },
    },
    {
        path: '/parts/manage/EquipmentBOM',
        name: 'EquipmentBOM',
        component: () => import('@/views/parts/manage/EquipmentBOM.vue'),
        meta: { title: '设备BOM管理' },
    },
    {
        path: '/parts/manage/EquipmentDetail',
        name: 'EquipmentDetail',
        component: () => import('@/views/parts/manage/EquipmentDetail.vue'),
        meta: { title: '设备详情-不要的' },
    },
    {
        path: '/parts/manage/LocationForm',
        name: 'LocationForm',
        component: () => import('@/views/parts/manage/LocationForm.vue'),
        meta: { title: '表单-不要的' },
    },
    {
        path: '/parts/manage/LocationManagement',
        name: 'LocationManagement',
        component: () => import('@/views/parts/manage/LocationManagement.vue'),
        meta: { title: '库位管理' },
    },
    {
        path: '/parts/configuration',
        name: 'parts-configuration',
        component: () => import('@/views/parts/configuration.vue'),
        meta: { title: '配置' },
    },
    {
        path: '/parts/configuration/Q',
        name: 'Q',
        component: () => import('@/views/parts/configuration/Q.vue'),
        meta: { title: '页面Q' },
    },
    {
        path: '/parts/screen',
        name: 'parts-screen',
        component: () => import('@/views/parts/screen.vue'),
        meta: { title: '大屏' },
    },
    {
        path: '/parts/screen/R',
        name: 'R',
        component: () => import('@/views/parts/screen/R.vue'),
        meta: { title: '页面R' },
    },
    // Repair Management
    {
        path: '/repair',
        name: 'repair',
        component: () => import('@/views/repair/IndexPage.vue'),
        meta: { title: '维修管理', icon: HomeFilled },
    },
    {
        path: '/repair/form',
        name: 'RepairForm',
        component: () => import('@/views/repair/RepairForm.vue'),
        meta: { title: '维修申请' }
    },
    {
        path: '/repair/admin/list',
        name: 'RepairListAdmin',
        component: () => import('@/views/repair/RepairListAdmin.vue'),
        meta: { title: '待维修设备' }
    },
    {
        path: '/repair/worker/list',
        name: 'RepairListWorker',
        component: () => import('@/views/repair/RepairListWorker.vue'),
        meta: { title: '我的工单' }
    },
    {
        path: '/repair/detail/:id',
        name: 'RepairDetail',
        component: () => import('@/views/repair/RepairOrder.vue'),
        meta: { title: '工单详情' }
    },
    {
        path: '/repair/manage',
        name: 'repair-manage',
        component: () => import('@/views/repair/manage.vue'),
        meta: { title: '管理' },
    },
    {
        path: '/repair/manage/KnowledgeBase',
        name: 'KnowledgeBase',
        component: () => import('@/views/repair/manage/KnowledgeBase.vue'),
        meta: { title: '维修知识库' },
    },
    {
        path: '/repair/manage/RepairOrder',
        name: 'RepairOrder',
        component: () => import('@/views/repair/manage/RepairOrder.vue'),
        meta: { title: '维修工单管理' },
    },
    {
        path: '/repair/configuration',
        name: 'repair-configuration',
        component: () => import('@/views/repair/configuration.vue'),
        meta: { title: '配置' },
    },
    {
        path: '/repair/configuration/RepairConfig',
        name: 'RepairConfig',
        component: () => import('@/views/repair/configuration/RepairConfig.vue'),
        meta: { title: '维修配置管理' },
    },
    {
        path: '/repair/screen',
        name: 'repair-screen',
        component: () => import('@/views/repair/screen.vue'),
        meta: { title: '大屏' },
    },
    {
        path: '/repair/screen/RepairDashboard',
        name: 'RepairDashboard',
        component: () => import('@/views/repair/screen/RepairDashboard.vue'),
        meta: { title: '数据展示' },
    },
    // System Management
    {
        path: '/system',
        name: 'system',
        component: () => import('@/views/system/IndexPage.vue'),
        meta: { title: '系统管理', icon: HomeFilled },
    },
    {
        path: '/system/manage',
        name: 'system-manage',
        component: () => import('@/views/system/manage.vue'),
        meta: { title: '管理' },
    },
    {
        path: '/system/manage/users_roles_permissions',
        name: 'users_roles_permissions',
        component: () => import('@/views/system/manage/users_roles_permissions.vue'),
        meta: { title: '用户管理' },
    },
    {
        path: '/system/configuration',
        name: 'system-configuration',
        component: () => import('@/views/system/configuration.vue'),
        meta: { title: '配置' },
    },
    {
        path: '/system/configuration/W',
        name: 'W',
        component: () => import('@/views/system/configuration/W.vue'),
        meta: { title: '页面W' },
    },
    {
        path: '/system/screen',
        name: 'system-screen',
        component: () => import('@/views/system/screen.vue'),
        meta: { title: '大屏' },
    },
    {
        path: '/system/screen/X',
        name: 'X',
        component: () => import('@/views/system/screen/X.vue'),
        meta: { title: '页面X' },
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router
