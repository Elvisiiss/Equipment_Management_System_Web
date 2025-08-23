import request from '@/utils/request'

// 根据车间获取产线选项
export const getLineOptionsByWorkshop = (workshop) => {
    return new Promise(resolve => {
        setTimeout(() => {
            const lineMap = {
                'C2': ['31', '32', '33', '34', '35', '36'],
                'C3': ['41', '42', '43', '44', '45', '46'],
                'C4': ['51', '52', '53', '54', '55', '56'],
                'C5': ['61', '62', '63', '64', '65', '66'],
                'C6': ['71', '72', '73', '74', '75', '76']
            }
            resolve(lineMap[workshop] || [])
        }, 100)
    })
}

// 获取工段选项
export const getSegmentOptions = () => {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve(['CFOG段', '贴合段', '组装段', '30米线段'])
        }, 100)
    })
}

// 新增审批流程API函数
// 获取审批流程分页列表
export const getApprovalProcesses = (params) => {
    return request({
        url: '/approval-processes/page',
        method: 'get',
        params
    })
}

// 创建审批流程
export const createApprovalProcess = (data) => {
    return request({
        url: '/approval-processes',
        method: 'post',
        data
    })
}

// 更新审批流程
export const updateApprovalProcess = (id, data) => {
    return request({
        url: `/approval-processes/${id}`,
        method: 'put',
        data
    })
}

// 删除审批流程
export const deleteApprovalProcess = (id) => {
    return request({
        url: `/approval-processes/${id}`,
        method: 'delete'
    })
}

// 获取所有用户列表
export const getAllUsers = () => {
    return request({
        url: '/users',
        method: 'get'
    })
}

// 获取车间列表（包含ID）
export const getWorkshopList = () => {
    return request({
        url: '/workshops',
        method: 'get'
    })
}

// 获取产线列表（根据车间ID）
export const getLineListByWorkshop = (workshopId) => {
    return request({
        url: `/lines/by-workshop/${workshopId}`,
        method: 'get'
    })
}

// 获取工段列表（根据产线ID）
export const getSegmentListByLine = (lineId) => {
    return request({
        url: `/segments/by-line/${lineId}`,
        method: 'get'
    })
}

// 搜索设备
export const searchDevicesApi = (params) => {
    return request({
        url: '/devices/search',
        method: 'get',
        params
    })
}
