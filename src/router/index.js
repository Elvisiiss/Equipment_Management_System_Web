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
    try {
        // 处理空路径或默认路径
        if (!filePath || filePath === '@' || filePath === '@/views/index.vue') {
            return () => import('@/views/index.vue')
        }

        // 转换路径格式
        let relativePath = filePath.replace('@/', '../')

        // 确保路径以 .vue 结尾
        if (!relativePath.endsWith('.vue')) {
            relativePath += '.vue'
        }

        // 移除可能的多余的 @ 符号
        relativePath = relativePath.replace('@', '')

        console.log('Loading component from:', relativePath)

        const component = await import(/* @vite-ignore */ relativePath)
        return component.default || component
    } catch (error) {
        console.error(`加载组件失败: ${filePath}`, error)
        // 返回一个空的组件作为降级
        return {
            template: '<div>组件加载失败</div>'
        }
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

    // 如果菜单有文件路径，就加载对应的组件
    if (menu.filePath) {
        route.component = () => loadComponent(menu.filePath)
    } else {
        // 如果没有文件路径，使用默认布局组件
        route.component = () => import('@/components/layout/RouterViewLayout.vue')
    }

    // 如果有子菜单，递归处理
    if (menu.children && menu.children.length > 0) {
        route.children = menu.children.map(transformMenuToRoute)

        // 重要：不再设置自动重定向到第一个子路由！
        // 这样父菜单可以独立打开，用户点击父菜单时会打开父菜单页面
        // 用户可以在父菜单页面内通过导航访问子菜单
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
        // 先添加404路由，但设置较低优先级
        router.addRoute({
            path: '/:pathMatch(.*)*',
            name: 'NotFound',
            component: () => import('@/views/Error/NotFound.vue')
        })

        // 添加所有菜单路由
        authStore.menus.forEach(menu => {
            const route = transformMenuToRoute(menu)
            router.addRoute(route)
        })

        authStore.setDynamicRoutesAdded(true)
        console.log('动态路由添加完成，当前路由表:', router.getRoutes())
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
        next(to.fullPath)
        return
    }

    next()
})

export default router
