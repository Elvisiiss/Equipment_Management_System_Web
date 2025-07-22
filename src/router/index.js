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
        children: [
            {
                path: 'period',
                name: 'InspectionPeriodSetting',
                component: () => import('@/views/inspection/InspectionPeriodSetting.vue'),
                meta: { title: '点检项目周期设置' }
            },
            {
                path: 'history',
                name: 'InspectionHistory',
                component: () => import('@/views/inspection/InspectionHistory.vue'),
                meta: { title: '历史数据' }
            }
        ]
    },
    {
        path: '/maintenance',
        name: 'MaintenanceManagement',
        component: () => import('@/views/maintenance/MaintenanceManagement.vue'),
        meta: { title: '维修管理' },
        children: [
            {
                path: 'mms',
                name: 'MaintenanceMMS',
                component: () => import('@/views/maintenance/MaintenanceMMS.vue'),
                meta: { title: '设备维修无纸化MMS' }
            },
            {
                path: 'guide',
                name: 'MaintenanceGuide',
                component: () => import('@/views/maintenance/MaintenanceGuide.vue'),
                meta: { title: '维修指引' }
            }
        ]
    },
    // 正确的车间详情路由配置（作为一级路由）
    {
        path: '/workshop/:id',
        name: 'Workshop',
        component: () => import('@/views/WorkshopDetail.vue'),
        meta: { title: '车间详情' },
        props: true
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router
