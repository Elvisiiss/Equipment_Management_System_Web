import axios from 'axios'
import { useAuthStore } from '@/stores/auth'

const API_BASE_URL = '/api/base-mc'

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

// 模拟数据生成器
function generateMockData(count = 20) {
    const data = []
    const statuses = [1, 2, 3, 4]
    const positions = ['A区-01-001', 'B区-02-015', 'C区-03-027', 'D区-04-038']

    for (let i = 1; i <= count; i++) {
        data.push({
            id: i,
            mcNumber: `MC-${String(i).padStart(4, '0')}`,
            mcName: `设备${i}`,
            assetNumber: `ASSET-${String(i).padStart(5, '0')}`,
            serialNumber: `SN-${Math.floor(10000 + Math.random() * 90000)}`,
            status: statuses[Math.floor(Math.random() * statuses.length)],
            enterFactoryTime: `202${Math.floor(Math.random() * 4)}-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
            position: positions[Math.floor(Math.random() * positions.length)],
            mcCoordinateX: (Math.random() * 100).toFixed(2),
            mcCoordinateY: (Math.random() * 100).toFixed(2),
            image: i % 4 === 0 ? 'https://via.placeholder.com/150' : '',
            remark: i % 3 === 0 ? '需要定期维护' : ''
        })
    }
    return data
}

const mockData = generateMockData()

export default {
    // 获取设备列表（分页）
    async getBaseMcList(page = 0, size = 10, keyword = '') {
        // 实际调用
        // const response = await auth.get('/list', {
        //   params: { page, size, keyword }
        // })
        // return response.data

        // 模拟数据
        await delay(500)

        let filteredData = mockData
        if (keyword) {
            const lowerKeyword = keyword.toLowerCase()
            filteredData = mockData.filter(item =>
                item.mcName.toLowerCase().includes(lowerKeyword) ||
                item.mcNumber.toLowerCase().includes(lowerKeyword))
        }

        const start = page * size
        const end = start + size
        const pageData = filteredData.slice(start, end)

        return {
            success: true,
            data: {
                content: pageData,
                totalElements: filteredData.length,
                totalPages: Math.ceil(filteredData.length / size),
                size,
                number: page
            }
        }
    },

    // 创建设备
    async createBaseMc(data) {
        // await auth.post('', data)
        await delay(500)

        const newId = mockData.length + 1
        mockData.unshift({
            id: newId,
            ...data,
            position: '未设置',
            enterFactoryTime: data.enterFactoryTime || new Date().toISOString().split('T')[0]
        })

        return {
            success: true,
            message: '设备创建成功',
            data: { id: newId }
        }
    },

    // 更新设备
    async updateBaseMc(id, data) {
        // await auth.put(`/${id}`, data)
        await delay(500)

        const index = mockData.findIndex(item => item.id === id)
        if (index !== -1) {
            mockData[index] = { ...mockData[index], ...data }
            return { success: true, message: '设备更新成功' }
        }
        return { success: false, message: '设备不存在' }
    },

    // 删除设备
    async deleteBaseMc(id) {
        // await auth.delete(`/${id}`)
        await delay(500)

        const index = mockData.findIndex(item => item.id === id)
        if (index !== -1) {
            mockData.splice(index, 1)
            return { success: true, message: '设备删除成功' }
        }
        return { success: false, message: '设备不存在' }
    }
}

// 延迟函数
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
}
