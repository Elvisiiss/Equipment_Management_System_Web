import axios from 'axios'
import { useAuthStore } from '@/stores/auth'

const API_BASE_URL = '/api/location'

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
    // ========= 库位管理 =========
    // 获取库位列表
    async getLocations(params) {
        // 实际调用
        // const response = await auth.get('/locations', { params })
        // return response.data

        // 假数据
        await delay(500)
        return {
            success: true,
            data: {
                content: [
                    {
                        id: 1,
                        code: 'A-01-001',
                        name: '立体库位001',
                        type: 'STEREO',
                        typeLabel: '立体库',
                        area: 'A',
                        status: 'FREE',
                        statusLabel: '空闲',
                        resourceStatus: 'NORMAL',
                        resourceStatusLabel: '正常',
                        capacity: 100,
                        used: 0
                    },
                    {
                        id: 2,
                        code: 'B-02-003',
                        name: '线边库003',
                        type: 'EDGE',
                        typeLabel: '线边库',
                        area: 'B',
                        status: 'OCCUPIED',
                        statusLabel: '占用',
                        resourceStatus: 'LOCKED',
                        resourceStatusLabel: '锁定',
                        capacity: 50,
                        used: 45
                    }
                ],
                totalElements: 2,
                totalPages: 1
            }
        }
    },

    // 创建库位
    async createLocation(data) {
        // await auth.post('/locations', data)
        await delay(500)
        return { success: true, message: '创建成功' }
    },

    // 更新库位
    async updateLocation(id, data) {
        // await auth.put(`/locations/${id}`, data)
        await delay(500)
        return { success: true, message: '更新成功' }
    },

    // 获取库位详情
    async getLocationDetail(id) {
        // const response = await auth.get(`/locations/${id}`)
        // return response.data
        await delay(500)
        return {
            success: true,
            data: {
                id,
                code: 'A-01-001',
                name: '立体库位001',
                type: 'STEREO',
                area: 'A',
                capacity: 100,
                status: 'FREE',
                resourceStatus: 'NORMAL',
                remark: '备注信息'
            }
        }
    },

    // ========= 线边库存 =========
    // 获取线边库存
    async getEdgeInventory(params) {
        // const response = await auth.get('/edge-inventory', { params })
        // return response.data
        await delay(500)
        return {
            success: true,
            data: {
                content: [
                    {
                        id: 1,
                        barcode: 'BR-2024-001',
                        partName: '主轴轴承',
                        equipment: '加工中心-MC01',
                        position: '主轴',
                        status: 'USED',
                        installDate: '2024-01-15',
                        lifeLeft: 45,
                        totalLife: 365
                    },
                    {
                        id: 2,
                        barcode: null,
                        partName: '冷却液',
                        equipment: '加工中心-MC01',
                        position: '冷却系统',
                        status: 'UNUSED',
                        installDate: null,
                        lifeLeft: 30,
                        totalLife: 30
                    }
                ],
                totalElements: 2
            }
        }
    },

    // ========= 设备BOM =========
    // 获取设备列表
    async getEquipments(params) {
        // const response = await auth.get('/equipments', { params })
        // return response.data
        await delay(500)
        return {
            success: true,
            data: {
                content: [
                    {
                        id: 1,
                        code: 'MC-001',
                        name: '立式加工中心',
                        category: 'MACHINE_CENTER',
                        categoryLabel: '加工中心',
                        model: 'VMC-850',
                        partsCount: 12,
                        hasStandard: true
                    },
                    {
                        id: 2,
                        code: 'LT-002',
                        name: '数控车床',
                        category: 'LATHE',
                        categoryLabel: '车床',
                        model: 'CK6136',
                        partsCount: 8,
                        hasStandard: false
                    }
                ],
                totalElements: 2
            }
        }
    },

    // 创建设备
    async createEquipment(data) {
        // await auth.post('/equipments', data)
        await delay(500)
        return { success: true, message: '创建设备成功' }
    },

    // 获取设备详情
    async getEquipmentDetail(id) {
        // const response = await auth.get(`/equipments/${id}`)
        // return response.data
        await delay(500)
        return {
            success: true,
            data: {
                id,
                code: 'MC-001',
                name: '立式加工中心',
                category: 'MACHINE_CENTER',
                model: 'VMC-850',
                parts: [
                    {
                        id: 1,
                        name: '主轴',
                        position: '主轴系统',
                        parts: [
                            { id: 11, name: '主轴轴承', partNo: '6204-2RS' },
                            { id: 12, name: '主轴密封圈', partNo: 'TC-30-47' }
                        ]
                    }
                ],
                documents: [
                    { type: 'MANUAL', name: '设备手册.pdf', url: '/docs/manual.pdf' },
                    { type: 'SOP', name: '操作规范.docx', url: '/docs/sop.docx' },
                    { type: 'MODEL', name: '3D模型.step', url: '/models/mc-001.step' }
                ]
            }
        }
    }
}

// 延迟函数
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
}
