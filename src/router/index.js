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
        meta: { title: '资产管理', icon: HomeFilled },
    },
    {
        path: '/asset/manage',
        name: 'asset-manage',
        meta: { title: '管理' },
    },
    {
        path: '/asset/manage/A',
        name: 'A',
        meta: { title: '页面A' },
    },
    {
        path: '/asset/configuration',
        name: 'asset-configuration',
        meta: { title: '配置' },
    },
    {
        path: '/asset/configuration/B',
        name: 'B',
        meta: { title: '页面B' },
    },
    {
        path: '/asset/screen',
        name: 'asset-screen',
        meta: { title: '大屏' },
    },
    {
        path: '/asset/screen/C',
        name: 'C',
        meta: { title: '页面C' },
    },
    // Equipment Monitoring
    {
        path: '/equipment',
        name: 'equipment',
        meta: { title: '设备实时监控', icon: HomeFilled },
    },
    {
        path: '/equipment/manage',
        name: 'equipment-manage',
        meta: { title: '管理' },
    },
    {
        path: '/equipment/manage/D',
        name: 'D',
        meta: { title: '页面D' },
    },
    {
        path: '/equipment/configuration',
        name: 'equipment-configuration',
        meta: { title: '配置' },
    },
    {
        path: '/equipment/configuration/E',
        name: 'E',
        meta: { title: '页面E' },
    },
    {
        path: '/equipment/screen',
        name: 'equipment-screen',
        meta: { title: '大屏' },
    },
    {
        path: '/equipment/screen/F',
        name: 'F',
        meta: { title: '页面F' },
    },
    // Inspection Management
    {
        path: '/inspection',
        name: 'inspection',
        meta: { title: '点巡检管理', icon: HomeFilled },
    },
    {
        path: '/inspection/manage',
        name: 'inspection-manage',
        meta: { title: '管理' },
    },
    {
        path: '/inspection/manage/G',
        name: 'G',
        meta: { title: '页面G' },
    },
    {
        path: '/inspection/configuration',
        name: 'inspection-configuration',
        meta: { title: '配置' },
    },
    {
        path: '/inspection/configuration/H',
        name: 'H',
        meta: { title: '页面H' },
    },
    {
        path: '/inspection/screen',
        name: 'inspection-screen',
        meta: { title: '大屏' },
    },
    {
        path: '/inspection/screen/I',
        name: 'I',
        meta: { title: '页面I' },
    },
    // Maintenance Management
    {
        path: '/maintenance',
        name: 'maintenance',
        meta: { title: '保养管理', icon: HomeFilled },
    },
    {
        path: '/maintenance/manage',
        name: 'maintenance-manage',
        meta: { title: '管理' },
    },
    {
        path: '/maintenance/manage/J',
        name: 'J',
        meta: { title: '页面J' },
    },
    {
        path: '/maintenance/configuration',
        name: 'maintenance-configuration',
        meta: { title: '配置' },
    },
    {
        path: '/maintenance/configuration/K',
        name: 'K',
        meta: { title: '页面K' },
    },
    {
        path: '/maintenance/screen',
        name: 'maintenance-screen',
        meta: { title: '大屏' },
    },
    {
        path: '/maintenance/screen/L',
        name: 'L',
        meta: { title: '页面L' },
    },
    // Mold Management
    {
        path: '/mold',
        name: 'mold',
        meta: { title: '模具/治工具管理', icon: HomeFilled },
    },
    {
        path: '/mold/manage',
        name: 'mold-manage',
        meta: { title: '管理' },
    },
    {
        path: '/mold/manage/M',
        name: 'M',
        meta: { title: '页面M' },
    },
    {
        path: '/mold/configuration',
        name: 'mold-configuration',
        meta: { title: '配置' },
    },
    {
        path: '/mold/configuration/N',
        name: 'N',
        meta: { title: '页面N' },
    },
    {
        path: '/mold/screen',
        name: 'mold-screen',
        meta: { title: '大屏' },
    },
    {
        path: '/mold/screen/O',
        name: 'O',
        meta: { title: '页面O' },
    },
    // Parts Management
    {
        path: '/parts',
        name: 'parts',
        meta: { title: '备件管理', icon: HomeFilled },
    },
    {
        path: '/parts/manage',
        name: 'parts-manage',
        meta: { title: '管理' },
    },
    {
        path: '/parts/manage/P',
        name: 'P',
        meta: { title: '页面P' },
    },
    {
        path: '/parts/configuration',
        name: 'parts-configuration',
        meta: { title: '配置' },
    },
    {
        path: '/parts/configuration/Q',
        name: 'Q',
        meta: { title: '页面Q' },
    },
    {
        path: '/parts/screen',
        name: 'parts-screen',
        meta: { title: '大屏' },
    },
    {
        path: '/parts/screen/R',
        name: 'R',
        meta: { title: '页面R' },
    },
    // Repair Management
    {
        path: '/repair',
        name: 'repair',
        meta: { title: '维修管理', icon: HomeFilled },
    },
    {
        path: '/repair/manage',
        name: 'repair-manage',
        meta: { title: '管理' },
    },
    {
        path: '/repair/manage/S',
        name: 'S',
        meta: { title: '页面S' },
    },
    {
        path: '/repair/configuration',
        name: 'repair-configuration',
        meta: { title: '配置' },
    },
    {
        path: '/repair/configuration/T',
        name: 'T',
        meta: { title: '页面T' },
    },
    {
        path: '/repair/screen',
        name: 'repair-screen',
        meta: { title: '大屏' },
    },
    {
        path: '/repair/screen/U',
        name: 'U',
        meta: { title: '页面U' },
    },
    // System Management
    {
        path: '/system',
        name: 'system',
        meta: { title: '系统管理', icon: HomeFilled },
    },
    {
        path: '/system/manage',
        name: 'system-manage',
        meta: { title: '管理' },
    },
    {
        path: '/system/manage/V',
        name: 'V',
        meta: { title: '页面V' },
    },
    {
        path: '/system/configuration',
        name: 'system-configuration',
        meta: { title: '配置' },
    },
    {
        path: '/system/configuration/W',
        name: 'W',
        meta: { title: '页面W' },
    },
    {
        path: '/system/screen',
        name: 'system-screen',
        meta: { title: '大屏' },
    },
    {
        path: '/system/screen/X',
        name: 'X',
        meta: { title: '页面X' },
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router
