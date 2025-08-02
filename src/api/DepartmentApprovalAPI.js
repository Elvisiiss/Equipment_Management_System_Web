import request from '@/utils/request'

export default {
    // 部门管理API
    // 获取部门列表
    getDepartmentList() {
        // 实际API调用，暂用假数据
        // return request.get('/system/departments')
        return new Promise(resolve => {
            setTimeout(() => {
                resolve({
                    success: true,
                    data: {
                        data: [
                            { id: 1, name: '技术部', parentId: 0, description: '负责技术开发', status: 1 },
                            { id: 2, name: '市场部', parentId: 0, description: '负责市场推广', status: 1 },
                            { id: 3, name: '前端开发组', parentId: 1, description: '负责前端开发', status: 1 },
                            { id: 4, name: '后端开发组', parentId: 1, description: '负责后端开发', status: 1 }
                        ]
                    }
                })
            }, 500)
        })
    },

    // 创建部门
    createDepartment(departmentData) {
        // 实际API调用，暂用假数据
        // return request.post('/system/departments', departmentData)
        return new Promise(resolve => {
            setTimeout(() => {
                resolve({
                    success: true,
                    message: '部门创建成功',
                    data: { id: Date.now() }
                })
            }, 500)
        })
    },

    // 更新部门
    updateDepartment(departmentId, departmentData) {
        // 实际API调用，暂用假数据
        // return request.put(`/system/departments/${departmentId}`, departmentData)
        return new Promise(resolve => {
            setTimeout(() => {
                resolve({
                    success: true,
                    message: '部门更新成功'
                })
            }, 500)
        })
    },

    // 删除部门
    deleteDepartment(departmentId) {
        // 实际API调用，暂用假数据
        // return request.delete(`/system/departments/${departmentId}`)
        return new Promise(resolve => {
            setTimeout(() => {
                resolve({
                    success: true,
                    message: '部门删除成功'
                })
            }, 500)
        })
    },

    // 审批层级管理API
    // 获取审批层级列表
    getApprovalLevelList() {
        // 实际API调用，暂用假数据
        // return request.get('/system/approval-levels')
        return new Promise(resolve => {
            setTimeout(() => {
                resolve({
                    success: true,
                    data: {
                        data: [
                            {
                                id: 1,
                                name: '请假审批',
                                level: 2,
                                departmentId: 1,
                                departmentName: '技术部',
                                approverIds: [1, 3],
                                approverNames: ['张三', '王五'],
                                description: '员工请假审批流程'
                            },
                            {
                                id: 2,
                                name: '报销审批',
                                level: 3,
                                departmentId: 0,
                                departmentName: '全公司',
                                approverIds: [1, 2, 5],
                                approverNames: ['张三', '李四', '赵六'],
                                description: '费用报销审批流程'
                            }
                        ]
                    }
                })
            }, 500)
        })
    },

    // 创建审批层级
    createApprovalLevel(approvalData) {
        // 实际API调用，暂用假数据
        // return request.post('/system/approval-levels', approvalData)
        return new Promise(resolve => {
            setTimeout(() => {
                resolve({
                    success: true,
                    message: '审批层级创建成功',
                    data: { id: Date.now() }
                })
            }, 500)
        })
    },

    // 更新审批层级
    updateApprovalLevel(levelId, approvalData) {
        // 实际API调用，暂用假数据
        // return request.put(`/system/approval-levels/${levelId}`, approvalData)
        return new Promise(resolve => {
            setTimeout(() => {
                resolve({
                    success: true,
                    message: '审批层级更新成功'
                })
            }, 500)
        })
    },

    // 删除审批层级
    deleteApprovalLevel(levelId) {
        // 实际API调用，暂用假数据
        // return request.delete(`/system/approval-levels/${levelId}`)
        return new Promise(resolve => {
            setTimeout(() => {
                resolve({
                    success: true,
                    message: '审批层级删除成功'
                })
            }, 500)
        })
    },

    // 获取用户列表（用于审批人选择）
    getUserList() {
        // 实际API调用，暂用假数据
        // return request.get('/system/users/simple')
        return new Promise(resolve => {
            setTimeout(() => {
                resolve({
                    success: true,
                    data: {
                        data: [
                            { id: 1, userName: '张三', email: 'zhangsan@example.com' },
                            { id: 2, userName: '李四', email: 'lisi@example.com' },
                            { id: 3, userName: '王五', email: 'wangwu@example.com' },
                            { id: 4, userName: '赵六', email: 'zhaoliu@example.com' }
                        ]
                    }
                })
            }, 500)
        })
    }
}
