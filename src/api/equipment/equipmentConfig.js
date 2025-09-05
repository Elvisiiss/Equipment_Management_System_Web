import request from '@/utils/request'

// 根据设备ID获取产品型号
export function getProductModelsByDevice(deviceId) {
    return request.get(`/product-models/by-device/${deviceId}`)
}

// 新增：创建产品型号
export function createProductModel(data) {
    return request.post('/product-models/with-device', data)
}

// 新增：更新产品型号
export function updateProductModel(id, data) {
    return request.put(`/product-models/${id}`, data)
}

// 新增：删除产品型号
export function deleteProductModel(id) {
    return request.delete(`/product-models/${id}`)
}
