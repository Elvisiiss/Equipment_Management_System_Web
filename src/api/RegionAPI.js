import axios from 'axios'
import { useAuthStore } from '@/stores/auth'

const API_BASE_URL = '/api/system'

const auth = axios.create({
    baseURL: API_BASE_URL
})

auth.interceptors.request.use(config => {
    const authStore = useAuthStore()
    const token = authStore.user?.token
    if (token) {
        config.headers.token = token
    }
    return config
}, error => Promise.reject(error))

export default {
    // 获取区域列表
    async getRegionList(params) {
        // 实际调用
        // const response = await auth.get('/regions', { params })
        // return response.data

        // 假数据
        await delay(500)
        return {
            success: true,
            data: {
                content: [
                    {
                        id: 1,
                        name: '销售A区',
                        description: '包括一楼整个大厅外加靠门的那一小个部分',
                        createTime: '2024-01-15 10:30:00',
                        updateTime: '2024-01-15 10:30:00'
                    },
                    {
                        id: 2,
                        name: '生产B区',
                        description: '二楼左手边所有',
                        createTime: '2024-01-16 11:20:00',
                        updateTime: '2024-01-18 09:15:00'
                    },
                    {
                        id: 3,
                        name: '服务C区',
                        description: '二楼右手边所有',
                        createTime: '2024-01-17 14:45:00',
                        updateTime: '2024-01-17 14:45:00'
                    }
                ],
                totalElements: 3,
                totalPages: 1
            }
        }
    },

    // 创建区域
    async createRegion(data) {
        // await auth.post('/regions', data)
        await delay(500)
        return {
            success: true,
            message: '区域创建成功',
            data: {
                id: Math.floor(Math.random() * 1000) + 4, // 生成一个随机ID
                ...data,
                createTime: new Date().toISOString(),
                updateTime: new Date().toISOString()
            }
        }
    },

    // 更新区域
    async updateRegion(id, data) {
        // await auth.put(`/regions/${id}`, data)
        await delay(500)
        return {
            success: true,
            message: '区域更新成功',
            data: {
                id,
                ...data,
                updateTime: new Date().toISOString()
            }
        }
    },

    // 获取区域详情
    async getRegionDetail(id) {
        // const response = await auth.get(`/regions/${id}`)
        // return response.data
        await delay(500)
        const regions = [
            {
                id: 1,
                name: '销售A区',
                description: '包括一楼整个大厅外加靠门的那一小个部分',
                createTime: '2024-01-15 10:30:00',
                updateTime: '2024-01-15 10:30:00'
            },
            {
                id: 2,
                name: '生产B区',
                description: '二楼左手边所有',
                createTime: '2024-01-16 11:20:00',
                updateTime: '2024-01-18 09:15:00'
            },
            {
                id: 3,
                name: '服务C区',
                description: '二楼右手边所有',
                createTime: '2024-01-17 14:45:00',
                updateTime: '2024-01-17 14:45:00'
            }
        ]
        return {
            success: true,
            data: regions.find(region => region.id === id) || null
        }
    },

    // 删除区域
    async deleteRegion(id) {
        // await auth.delete(`/regions/${id}`)
        await delay(500)
        return { success: true, message: '区域删除成功' }
    }
}

// 延迟函数
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
}
