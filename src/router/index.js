import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

// 仅保留登录页作为基础路由
const baseRoutes = [
    {
        path: '/login',
        name: 'Login',
        component: () => import('@/views/Auth/Login.vue'),
        meta: { title: '登录' }
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes: baseRoutes
})

// 图标名称映射 - 确保与后端返回的 metaIcon 值匹配
const iconMap = {
    'HomeFilled': 'HomeFilled',
    'StarFilled': 'StarFilled',
    'Connection': 'Connection',
    'Monitor': 'Monitor',
    'List': 'List',
    'Setting': 'Setting',
    'Tools': 'Tools',
    'Box': 'Box',
    'User': 'User'
}

// 动态导入组件 - 处理嵌套路径
async function loadComponent(filePath) {
    console.log(0)
    try {
        console.log("filePath",filePath)
        console.log(1)
        // if (!filePath || filePath === '@/views/index.vue') {
        //     console.log(2)
        //     return () => import('@/views/index.vue')
        // }
        console.log(3)

        // 移除 @ 符号并转换路径
        const relativePath = filePath.replace('@/', '../')
        console.log("relativePath",relativePath)
        const component = await import(/* @vite-ignore */ relativePath)
        console.log("component",component)
        return component.default || component
    } catch (error) {
        console.error(`加载组件失败: ${filePath}`, error)
        return () => import('@/views/Error/NotFound.vue')
    }
}

// 将后端菜单转换为前端路由格式
function transformMenuToRoute(menu) {
    const route = {
        path: menu.path,
        name: menu.name,
        meta: {
            title: menu.metaTitle,
            icon: menu.metaIcon ? iconMap[menu.metaIcon] : null
        }
    }

    // 动态设置组件
    if (menu.filePath) {
        route.component = () => loadComponent(menu.filePath)
    } else {
        // 如果没有指定文件路径，使用默认布局组件
        route.component = () => import('@/views/index.vue')
    }

    // 递归处理子菜单
    if (menu.children && menu.children.length > 0) {
        route.children = menu.children.map(transformMenuToRoute)
    }

    return route
}

// 动态添加路由
export function addDynamicRoutes() {
    const authStore = useAuthStore()

    if (authStore.dynamicRoutesAdded || !authStore.menus || authStore.menus.length === 0) {
        return
    }

    try {
        // 添加首页路由（如果后端返回了首页）
        const homeMenu = authStore.menus.find(menu => menu.path === '/')
        if (homeMenu) {
            const homeRoute = transformMenuToRoute(homeMenu)
            router.addRoute(homeRoute)
        }

        // 添加其他路由
        authStore.menus.forEach(menu => {
            if (menu.path !== '/') { // 首页已单独处理
                const route = transformMenuToRoute(menu)
                router.addRoute(route)
            }
        })

        // 添加404兜底路由（必须在最后添加）
        router.addRoute({
            path: '/:pathMatch(.*)*',
            name: 'NotFound',
            component: () => import('@/views/Error/NotFound.vue')
        })

        authStore.setDynamicRoutesAdded(true)
        console.log('动态路由添加完成')
    } catch (error) {
        console.error('添加动态路由失败:', error)
    }
}

// 路由守卫
router.beforeEach(async (to, from, next) => {
    const authStore = useAuthStore()

    // 如果访问登录页且已登录，跳转到首页
    if (to.path === '/login' && authStore.isAuthenticated) {
        next('/')
        return
    }

    // 如果访问需要登录的页面但未登录，跳转到登录页
    if (to.path !== '/login' && !authStore.isAuthenticated) {
        next('/login')
        return
    }

    // 如果用户已登录且有菜单数据，但动态路由未添加，则添加路由
    if (authStore.isAuthenticated && authStore.menus && authStore.menus.length > 0 && !authStore.dynamicRoutesAdded) {
        await addDynamicRoutes()
        // 路由添加后重新导航到目标页面
        next(to.path)
        return
    }

    next()
})

export default router
