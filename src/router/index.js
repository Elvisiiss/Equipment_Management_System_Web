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
        path: '/equipment/manage',
        name: 'equipment-manage',
        component: () => import('@/views/equipment/manage.vue'),
        meta: { title: '管理' },
    },
    {
        path: '/equipment/manage/D',
        name: 'D',
        component: () => import('@/views/equipment/manage/D.vue'),
        meta: { title: '页面D' },
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
        path: '/maintenance/manage',
        name: 'maintenance-manage',
        component: () => import('@/views/maintenance/manage.vue'),
        meta: { title: '管理' },
    },
    {
        path: '/maintenance/manage/J',
        name: 'J',
        component: () => import('@/views/maintenance/manage/J.vue'),
        meta: { title: '页面J' },
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
        path: '/repair/manage',
        name: 'repair-manage',
        component: () => import('@/views/repair/manage.vue'),
        meta: { title: '管理' },
    },
    {
        path: '/repair/manage/S',
        name: 'S',
        component: () => import('@/views/repair/manage/S.vue'),
        meta: { title: '页面S' },
    },
    {
        path: '/repair/configuration',
        name: 'repair-configuration',
        component: () => import('@/views/repair/configuration.vue'),
        meta: { title: '配置' },
    },
    {
        path: '/repair/configuration/T',
        name: 'T',
        component: () => import('@/views/repair/configuration/T.vue'),
        meta: { title: '页面T' },
    },
    {
        path: '/repair/screen',
        name: 'repair-screen',
        component: () => import('@/views/repair/screen.vue'),
        meta: { title: '大屏' },
    },
    {
        path: '/repair/screen/U',
        name: 'U',
        component: () => import('@/views/repair/screen/U.vue'),
        meta: { title: '页面U' },
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
        path: '/system/manage/V',
        name: 'V',
        component: () => import('@/views/system/manage/V.vue'),
        meta: { title: '页面V' },
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
