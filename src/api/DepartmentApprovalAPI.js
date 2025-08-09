import request from '@/utils/request';

export default {
    // 部门管理API
    // 获取部门列表
    getDepartmentList() {
        return request.get('/departments');
    },

    // 创建部门
    createDepartment(departmentData) {
        return request.post('/departments', departmentData);
    },

    // 更新部门
    updateDepartment(departmentId, departmentData) {
        return request.put(`/departments/${departmentId}`, departmentData);
    },

    // 删除部门
    deleteDepartment(departmentId) {
        return request.delete(`/departments/${departmentId}`);
    },

    // 审批层级管理API
    // 获取审批层级列表
    getApprovalLevelList() {
        return request.get('/approval-levels');
    },

    // 创建审批层级
    createApprovalLevel(approvalData) {
        return request.post('/approval-levels', approvalData);
    },

    // 更新审批层级
    updateApprovalLevel(levelId, approvalData) {
        return request.put(`/approval-levels/${levelId}`, approvalData);
    },

    // 删除审批层级
    deleteApprovalLevel(levelId) {
        return request.delete(`//approval-levels/${levelId}`);
    },

    // 获取用户列表（用于审批人选择）
    getUserList() {
        return request.get('/users/simple');
    }
};
