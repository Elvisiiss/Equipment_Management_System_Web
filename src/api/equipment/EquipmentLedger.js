import request from '@/utils/request'

// 获取区域树结构
export function getAreaTree() {
    return request.get('/areas/type/0')
}

// 根据父区域ID获取子区域
export function getChildAreas(parentId) {
    return request.get(`/areas/parent/${parentId}`)
}

// 获取设备树形数据
export function getDeviceTree(params) {
    return request.get('/devices/tree', { params })
}

// 新增设备
export function addDevice(data) {
    return request.post('/devices', data)
}

// 更新设备
export function updateDevice(id, data) {
    return request.put(`/devices/${id}`, data)
}

// 删除设备
export function deleteDevice(id) {
    return request.delete(`/devices/${id}`)
}

// 获取设备详情
export function getDeviceDetail(id) {
    return request.get(`/devices/${id}`)
}
