import request from '@/utils/request'
import axios from "axios";
import {useAuthStore} from "@/stores/auth.js";

/**
 * 角色菜单管理API
 * 专门处理角色与菜单之间的关联关系
 */
export default {
    // 获取角色列表
    getRoleList() {
        return request.get('/roles')
    },

    // 创建角色
    createRole(roleData) {
        return request.post('/roles', roleData)
    },

    // 更新角色
    updateRole(roleId, roleData) {
        return request.put(`/roles/${roleId}`, roleData)
    },

    // 删除角色
    deleteRole(roleId) {
        return request.delete(`/roles/${roleId}`)
    },

    // 为角色分配菜单
    assignMenusToRole(roleId, menuIds) {
        return request.post(`/roles/${roleId}/menus`, menuIds)
    },

    // 根据菜单ID获取关联角色
    getRolesByMenuId(menuId) {
        return request.get(`/roles/by-menu/${menuId}`)
    },

    // 获取菜单树
    getMenuTree() {
        return request.get('/menus/tree')
    },

    // 根据ID获取菜单详情
    getMenuById(menuId) {
        return request.get(`/menus/${menuId}`)
    },

    // 创建菜单
    createMenu(menuData) {
        return request.post('/menus', menuData)
    },

    // 更新菜单
    updateMenu(menuId, menuData) {
        return request.put(`/menus/${menuId}`, menuData)
    },

    // 删除菜单
    deleteMenu(menuId) {
        return request.delete(`/menus/${menuId}`)
    },

    // 更新菜单顺序
    updateMenuOrder(menuId, orderData) {
        return request.put(`/menus/${menuId}/order`, orderData)
    },

    // 批量更新菜单顺序
    updateMenusOrder(menusData) {
        return request.put('/menus/order/batch', menusData)
    },

    // 根据角色ID获取菜单权限
    getRoleMenus(roleId) {
        return request.get(`/roles/${roleId}/menus`)
    },

    // 检查角色是否有特定菜单权限
    checkRoleMenuPermission(roleId, menuId) {
        return request.get(`/roles/${roleId}/menus/${menuId}/check`)
    },

    // 批量更新角色菜单权限
    batchUpdateRoleMenus(roleId, menuOperations) {
        return request.put(`/roles/${roleId}/menus/batch`, menuOperations)
    }
}
