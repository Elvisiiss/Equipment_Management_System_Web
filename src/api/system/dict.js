import axios from '@/utils/request'   // 你项目里封装的 axios

// ===== 第一层字典 =====
export const getDictList = (params) => axios.get('/dict', { params })
export const addDict      = (data)   => axios.post('/dict', data)
export const updateDict   = (data)   => axios.put('/dict', data)
export const delDict      = (id)     => axios.delete(`/dict/${id}`)

// ===== 第二层字典项 =====
export const getDictItemList = (dictType, params) => axios.get(`/dict/${dictType}/item`, { params })
export const addDictItem     = (dictType, data)   => axios.post(`/dict/${dictType}/item`, data)
export const updateDictItem  = (dictType, data)   => axios.put(`/dict/${dictType}/item`, data)
export const delDictItem     = (dictType, id)     => axios.delete(`/dict/${dictType}/item/${id}`)
