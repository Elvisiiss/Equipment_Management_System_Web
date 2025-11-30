// menuAPI.js
import request from '@/utils/request.js'

export default {
    // 获取菜单树
    getMenuTree() {
        return request.get('/menus/tree')
    },

    // 根据ID获取菜单详情
    getMenuById(id) {
        return request.get(`/menus/${id}`)
    },

    // 创建菜单
    createMenu(menuData) {
        return request.post('/menus', menuData)
    },

    // 更新菜单
    updateMenu(id, menuData) {
        return request.put(`/menus/${id}`, menuData)
    },

    // 删除菜单
    deleteMenu(id) {
        return request.delete(`/menus/${id}`)
    },

    // 更新菜单顺序（拖拽后调用）
    updateMenuOrder(menuId, orderData) {
        return request.put(`/menus/${menuId}/order`, orderData)
    },

    // 批量更新菜单顺序
    updateMenusOrder(menusData) {
        return request.put('/menus/order/batch', menusData)
    }
}
