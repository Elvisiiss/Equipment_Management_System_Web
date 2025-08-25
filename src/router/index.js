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
    //Check Management
    {
        path: '/check',
        name: 'check',
        component: () => import('@/views/check/IndexPage.vue'),
        meta: { title: '审核管理', icon: HomeFilled },
    },
    {
        path: '/check/list',
        name: 'CheckList',
        component: () => import('@/views/check/CheckList.vue'),
        meta: { title: '审核任务列表' },
    },

    // Asset Management
    {
        path: '/asset/result',
        name: 'CheckResult',
        component: () => import('@/views/check/CheckResult.vue'),
        meta: { title: '审批配置', icon: HomeFilled },
    },
    {
        path: '/asset/manage',
        name: 'asset-manage',
        component: () => import('@/views/asset/manage.vue'),
        meta: { title: '设备台账' },
    },
    {
        path: '/asset/manage/list',
        name: 'EquipmentLedger',
        component: () => import('@/views/asset/manage/EquipmentLedger.vue'),
        meta: { title: '设备清单' },
    },
    {
        path: '/asset/manage/index',
        name: 'AssetIndex',
        component: () => import('@/views/asset/manage/EquipmentDetail.vue'),
        meta: { title: '设备详情页' },
    },

    // {
    //     path: '/asset/configuration',
    //     name: 'asset-configuration',
    //     component: () => import('@/views/asset/configuration.vue'),
    //     meta: { title: '配置' },
    // },
    {
        path: '/asset/screen',
        name: 'asset-screen',
        component: () => import('@/views/asset/screen.vue'),
        meta: { title: '资产看板' },
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
        meta: { title: '管理' }
    },
    {
        path: '/equipment/monitoring/manage',
        name: 'Equipment',
        component: () => import('@/views/equipment/manage/Equipment.vue'),
        meta: {title: '设备管理2'},
    },
    {
        path: '/equipment/monitoring/summary',
        name: 'EquipmentSummary',
        component:()=>import('@/views/equipment/manage/EquipmentSummary.vue'),
        meta: {title: '设备详情2'},
    },
    {
        path: '/equipment/screen/SPC',
        name: 'SPCIndexPage',
        component: () => import('@/views/equipment/SPC/SPCIndexPage.vue'),
        meta: {title: '设备SPC看板'},
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
        meta: { title: '布局管理' },
    },



    {
        path: '/equipment/configuration',
        name: 'equipment-configuration',
        component: () => import('@/views/equipment/configuration.vue'),
        meta: { title: '配置' },
    },
    // {
    //     path: '/equipment/configuration/E',
    //     name: 'E',
    //     component: () => import('@/views/equipment/configuration/E.vue'),
    //     meta: { title: '页面E' },
    // },
    {
        path: '/equipment/EquipmentManage',
        name: 'EquipmentManage',
        component: () => import('@/views/equipment/EquipmentManage.vue'),
        meta: { title: '设备管理' }
    },
    {
        path: '/equipment/screen',
        name: 'screen',
        component: () => import('@/views/equipment/screen.vue'),
        meta: { title: '设备监控看板' },
    },
    {
        path: '/equipment/screen/oee',
        name: 'OEEManagement',
        component:()=>import('@/views/equipment/screen/OEEManagement.vue'),
        meta: { title: 'OEE管理看板' },
    },
    {
        path: '/equipment/screen/down',
        name: 'DownManagement',
        component:()=>import('@/views/equipment/screen/DownManagement.vue'),
        meta: {title: '停机分析报表'},
    },
    {
        path: '/equipment/screen/quality',
        name: 'QualityUtilization',
        component:()=>import('@/views/equipment/screen/QualityUtilization.vue'),
        meta: { title: '质量稼动率报表' },
    },
    {
        path: '/equipment/screen/time',
        name: 'TimeUtilization',
        component:()=>import('@/views/equipment/screen/TimeUtilization.vue'),
        meta: { title: '时间稼动率报表' },
    },
    {
        path: '/equipment/screen/perforce',
        name: 'PerUtilization',
        component:()=>import('@/views/equipment/screen/PerUtilization.vue'),
        meta: {title: '性能稼动率报表'},
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
        path: '/inspection/manage/ExceptionList',
        name: 'ExceptionList',
        component: () => import('@/views/inspection/manage/ExceptionList.vue'),
        meta: { title: '异常列表' },
    },
    {
        path: '/inspection/manage/PlanList',
        name: 'PlanList',
        component: () => import('@/views/inspection/manage/PlanList.vue'),
        meta: { title: '计划列表' },
    },
    {
        path: '/inspection/manage/TaskList',
        name: 'TaskList',
        component: () => import('@/views/inspection/manage/TaskList.vue'),
        meta: { title: '任务列表' },
    },
    {
        path: '/inspection/inspectionAction',
        name: 'inspectionAction',
        component: () => import('@/views/inspection/inspectionAction.vue'),
        meta: { title: '任务列表' },
    },
    {
        path: '/inspection/configuration',
        name: 'inspection-configuration',
        component: () => import('@/views/inspection/configuration.vue'),
        meta: { title: '配置' },
    },
    {
        path: '/inspection/configuration/PolicyConfig',
        name: 'PolicyConfig',
        component: () => import('@/views/inspection/configuration/PolicyConfig.vue'),
        meta: { title: '点巡检配置' },
    },
    {
        path: '/inspection/screen',
        name: 'inspection-screen',
        component: () => import('@/views/inspection/screen.vue'),
        meta: { title: '大屏' },
    },
    {
        path: '/inspection/screen/Dashboard',
        name: 'Dashboard',
        component: () => import('@/views/inspection/screen/Dashboard.vue'),
        meta: { title: '仪表盘' },
    },
    {
        path: '/inspection/screen/EfficiencyAnalysis',
        name: 'EfficiencyAnalysis',
        component: () => import('@/views/inspection/screen/EfficiencyAnalysis.vue'),
        meta: { title: '效率分析' },
    },
    {
        path: '/inspection/screen/ExceptionAnalysis',
        name: 'ExceptionAnalysis',
        component: () => import('@/views/inspection/screen/ExceptionAnalysis.vue'),
        meta: { title: '异常分析' },
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
    // {
    //     path: '/maintenance/configuration',
    //     name: 'maintenance-configuration',
    //     component: () => import('@/views/maintenance/configuration.vue'),
    //     meta: { title: '配置' },
    // },
    // {
    //     path: '/maintenance/configuration/K',
    //     name: 'K',
    //     component: () => import('@/views/maintenance/configuration/K.vue'),
    //     meta: { title: '页面K' },
    // },
    // {
    //     path: '/maintenance/screen',
    //     name: 'maintenance-screen',
    //     component: () => import('@/views/maintenance/screen.vue'),
    //     meta: { title: '大屏' },
    // },
    // {
    //     path: '/maintenance/screen/L',
    //     name: 'L',
    //     component: () => import('@/views/maintenance/screen/L.vue'),
    //     meta: { title: '页面L' },
    // },
    // Mold Management
    {
        path: '/mold',
        name: 'mold',
        component: () => import('@/views/mold/IndexPage.vue'),
        meta: { title: '模具/治工具管理', icon: HomeFilled },
    },
    {
        path: '/mold/MoldManagement',
        name: 'MoldManagement',
        component: () => import('@/views/mold/data/pages/MoldManagement.vue'),
        meta: { title: '模/治具管理' },
    },
    {
        path: '/mold/detail/:id',
        name: 'MoldDetail',
        component: () => import('@/views/mold/data/pages/MoldDetail.vue'),
        props: true,
        meta: { title: '模/治具详情' },
    },
    {
        path: '/mold/manage',
        name: 'manage',
        component: () => import('@/views/mold/manage.vue'),
        meta: { title: '模/治具台账管理' },
    },
    {
        path: '/mold/manage/life',
        name: 'MoldLifecycle',
        component: () => import('@/views/mold/manage/MoldLifecycle.vue'),
        meta: { title: '模治具管理' },
    },
    {
        path: '/mold/manage/operation',
        name: 'ToolErrorProof',
        component: () => import('@/views/mold/manage/ToolErrorProof.vue'),
        meta: { title: '模治具详情' },
    },
    {
        path: '/mold/manage/maintenance',
        name: 'ToolMaintenance',
        component: () => import('@/views/mold/manage/ToolMaintenance.vue'),
        meta: { title: ' 维护与点检' },
    },
    {
        path: '/mold/manage/storage',
        name: 'ToolStorage',
        component: () => import('@/views/mold/manage/ToolStorage.vue'),
        meta: { title: '存储与权限' },
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
        component: () => import('@/views/parts/data/PartsManagement.vue'),
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
    // {
    //     path: '/parts/manage/SparePartInventory',
    //     name: 'SparePartInventory',
    //     component: () => import('@/views/parts/manage/SparePartInventory.vue'),
    //     meta: { title: '备品备件台账' },
    // },
    {
        path: '/parts/manage/EdgeInventory',
        name: 'EdgeInventory',
        component: () => import('@/views/parts/manage/EdgeInventory.vue'),
        meta: { title: '仓库管理' },
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
        meta: { title: '备件列表' },
    },
    {
        path: '/parts/manage/partsDetail/:id',
        name: 'partsDetail',
        component: () => import('@/views/parts/manage/PartsDetail.vue'),
        meta: {title: '备件详情页'}
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
        meta: { title: '用户管理' },
    },
    {
        path: '/system/manage/UserManagement',
        name: 'UserManagement',
        component: () => import('@/views/system/manage/UserManagement.vue'),
        meta: { title: '用户管理' },
    },
    {
        path: '/system/manage/RoleList',
        name: 'RoleList',
        component: () => import('@/views/system/manage/RoleList.vue'),
        meta: { title: '角色列表' },
    },
    {
        path: '/system/manage/PermissionManagement',
        name: 'PermissionManagement',
        component: () => import('@/views/system/manage/PermissionManagement.vue'),
        meta: { title: '权限管理' },
    },
    {
        path: '/system/manage/department_management',
        name: 'department_management',
        component: () => import('@/views/system/manage/departmentManagement.vue'),
        meta: {title: '部门管理'},
    },
    {
        path: '/system/manage/regionManagement',
        name: 'regionManagement',
        component: () => import('@/views/system/manage/regionManagement.vue'),
        meta: { title: '区域管理' },
    },
    {
        path: '/system/data/region',
        name: 'region',
        component: () => import('@/views/system/data/Region.vue'),
        meta: { title: '区域管理2' },
    },
    {
        path: '/system/data/product',
        name: 'regionManagement',
        meta: {title: '产品型号管理'},
        component:()=>import('@/views/system/data/Product.vue'),
        permissionId: 1,
    },
    {
        path: '/system/data/DepartmentApproval',
        name: 'DepartmentApproval',
        component: () => import('@/views/system/data/DepartmentApproval.vue'),
        meta: { title: '审批设置' },
    },
    {
        path: '/system/data/dict',
        name: 'dictionary',
        meta: {title: '字典管理'},
        component: () => import('@/views/system/data/Dictionary.vue'),
        permissionId: 1
    },
    {
        path: '/system/data/log',
        name: 'log',
        meta: {title: '日志管理'},
        component: () => import('@/views/system/data/Log.vue'),
        permissionId: 1
    },

]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router
