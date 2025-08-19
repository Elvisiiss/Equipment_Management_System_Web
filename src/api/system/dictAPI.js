// @/api/system/dictAPI.js
import request from '@/utils/request'

// 字典管理 API

// 分页查询字典列表
export function getDictsPage(params) {
    return request({
        url: '/dicts',
        method: 'get',
        params
    })
}

// 新增字典
export function createDict(data) {
    return request({
        url: '/dicts',
        method: 'post',
        data
    })
}

// 修改字典
export function updateDict(data) {
    return request({
        url: `/dicts/${data.id}`,
        method: 'put',
        data
    })
}

// 删除字典
export function deleteDict(id) {
    return request({
        url: `/dicts/${id}`,
        method: 'delete'
    })
}

// 查询字典项列表
export function getDictItems(dictType) {
    return request({
        url: `/dicts/${dictType}/items`,
        method: 'get'
    })
}

// 新增字典项
export function createDictItem(data) {
    return request({
        url: '/dicts/items',
        method: 'post',
        data
    })
}

// 修改字典项
export function updateDictItem(data) {
    return request({
        url: `/dicts/items/${data.id}`,
        method: 'put',
        data
    })
}

// 删除字典项
export function deleteDictItem(id) {
    return request({
        url: `/dicts/items/${id}`,
        method: 'delete'
    })
}
