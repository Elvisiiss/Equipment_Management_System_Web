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

// 新增设备（带文件上传）
export function addDeviceWithFiles(formData) {
    return request.post('/devices/with-files', formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    })
}

// 更新设备（带文件上传）
export function updateDeviceWithFiles(id, formData) {
    return request.put(`/devices/with-files/${id}`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    })
}

// 获取设备图片
export function getDeviceImage(imageId) {
    return request.get(`/files/${imageId}`)
}

// 获取设备说明书
export function getDeviceManual(manualId) {
    return request.get(`/files/${manualId}`)
}

// 获取设备图纸
export function getDeviceDrawing(drawingId) {
    return request.get(`/files/${drawingId}`)
}

// 下载设备导入模板
export function downloadDeviceTemplate() {
    return request.get('/devices/template', {
        responseType: 'blob'
    })
}

// 导入设备数据
export function importDevices(formData) {
    return request.post('/devices/import', formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    })
}

// 导出设备数据
export function exportDevices(params) {
    return request.get('/devices/export', {
        params,
        responseType: 'blob'
    })
}
