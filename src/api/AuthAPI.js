import request from '@/utils/request'

export default {
    // 用户登录
    loginWithUsername(account, password, remember) {
        return request.post('/auth/login/password', {
            msg: "账号密码登录",
            account: account,
            password: password,
            remember: remember
        })
    },

    // 获取用户列表
    getUserList() {
        return request.get('/system/menu-permission/users')
    },

    // 创建用户
    createUser(userData) {
        return request.post('/system/menu-permission/users', userData)
    },

    // 更新用户
    updateUser(userId, userData) {
        return request.put(`/system/menu-permission/users/${userId}`, userData)
    },

    // 更新用户状态
    updateUserStatus(userId, statusData) {
        return request.put(`/system/menu-permission/users/${userId}/status?status=${statusData.status}`)
    },

    // 重置用户密码
    resetUserPassword(userId, passwordData) {
        return request.put(`/system/menu-permission/users/${userId}/password`, passwordData)
    },

    // 删除用户
    deleteUser(userId) {
        return request.delete(`/system/menu-permission/users/${userId}`)
    },

    // 获取角色列表
    getRoleList() {
        return request.get('/system/menu-permission/roles')
    },

    // 创建角色
    createRole(roleData) {
        return request.post('/system/menu-permission/roles', roleData)
    },

    // 更新角色
    updateRole(roleId, roleData) {
        return request.put(`/system/menu-permission/roles/${roleId}`, roleData)
    },

    //获取角色权限
    getRolePermissions(roleId){
        return request.get(`/system/menu-permission/roles/${roleId}/permissions`)
    },

    // 更新角色权限
    updateRolePermissions(roleId, permissionData) {
        return request.put(`/system/menu-permission/${roleId}/permissions`, permissionData)
    },

    // 删除角色
    deleteRole(roleId) {
        return request.delete(`/system/menu-permission/roles/${roleId}`)
    },

    // 获取权限列表
    getPermissionList() {
        return request.get('/system/menu-permission/permissions')
    },

    // 更新权限
    updatePermission(permissionId, permissionData) {
        return request.put(`/system/menu-permission/permissions/${permissionId}`, permissionData)
    },

    // 删除权限
    deletePermission(permissionId) {
        return request.delete(`/system/menu-permission/permissions/${permissionId}`)
    }
}
