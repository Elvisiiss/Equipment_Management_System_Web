// depAPI.js
import request from '@/utils/request.js'

export default {
    // 查询所有部门
    getAllDepartments() {
        return request.get('/departments')
    },

    // 获取树状部门信息
    getDepartmentTree() {
        return request.get('/departments/tree')
    },

    // 根据id查询单个部门
    getDepartmentById(id) {
        return request.get(`/departments/${id}`)
    },

    // 新增部门
    createDepartment(departmentData) {
        return request.post('/departments', departmentData)
    },

    // 更新部门信息
    updateDepartment(id, departmentData) {
        return request.put(`/departments/${id}`, departmentData)
    },

    // 删除部门
    deleteDepartment(id) {
        return request.delete(`/departments/${id}`)
    },

    // 获取部门下的所有用户
    getDepartmentUsers(departmentId) {
        return request.get(`/auth/user-departments/departments/${departmentId}/users`)
    },

    // 为用户分配部门
    assignUserToDepartment(userId, departmentId) {
        return request.post(`/auth/user-departments/${userId}/departments/${departmentId}`)
    },

    // 从用户移除部门
    removeUserFromDepartment(userId, departmentId) {
        return request.delete(`/auth/user-departments/${userId}/departments/${departmentId}`)
    },

    // 获取用户所属的所有部门
    getUserDepartments(userId) {
        return request.get(`/auth/user-departments/${userId}/departments`)
    },

    // 清空用户的所有部门关联
    clearUserDepartments(userId) {
        return request.delete(`/auth/user-departments/${userId}/departments`)
    },

    // 批量为用户分配部门
    assignUserToDepartments(userId, departmentIds) {
        return request.post(`/auth/user-departments/${userId}/departments`, departmentIds)
    }
}
