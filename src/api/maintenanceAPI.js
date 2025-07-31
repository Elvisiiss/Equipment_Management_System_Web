import axios from 'axios'
import { useAuthStore } from '@/stores/auth'

const API_BASE_URL = '/api/maintenance'

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
    // ========= 保养周期管理 =========
    // 获取保养周期列表
    async getMaintenanceCycles(params) {
        // 实际调用
        // const response = await auth.get('/cycles', { params })
        // return response.data

        // 假数据
        await delay(500)
        return {
            success: true,
            data: {
                content: [
                    {
                        id: 1,
                        equipmentId: 1,
                        equipmentName: '立式加工中心-MC001',
                        cycleType: 'DAILY',
                        cycleValue: 1,
                        nextDate: '2025-08-01',
                        executor: '张三',
                        line: 'A产线'
                    },
                    {
                        id: 2,
                        equipmentId: 2,
                        equipmentName: '数控车床-LT002',
                        cycleType: 'WEEKLY',
                        cycleValue: 2,
                        nextDate: '2025-08-03',
                        executor: '李四',
                        line: 'B产线'
                    }
                ],
                totalElements: 2
            }
        }
    },

    // 创建保养周期
    async createMaintenanceCycle(data) {
        // await auth.post('/cycles', data)
        await delay(500)
        return { success: true, message: '创建成功' }
    },

    // 更新保养周期
    async updateMaintenanceCycle(id, data) {
        // await auth.put(`/cycles/${id}`, data)
        await delay(500)
        return { success: true, message: '更新成功' }
    },

    // ========= 保养任务 =========
    // 获取保养任务
    async getMaintenanceTasks(params) {
        // const response = await auth.get('/tasks', { params })
        // return response.data
        await delay(500)
        return {
            success: true,
            data: {
                content: [
                    {
                        id: 1,
                        equipmentId: 1,
                        equipmentName: '立式加工中心-MC001',
                        taskName: '日常保养检查',
                        status: 'PENDING',
                        plannedDate: '2025-08-01',
                        executor: '张三',
                        items: ['清洁导轨', '检查润滑油', '紧固螺丝']
                    }
                ],
                totalElements: 1
            }
        }
    },

    // 创建保养任务
    async createMaintenanceTask(data) {
        // await auth.post('/tasks', data)
        await delay(500)
        return { success: true, message: '创建任务成功' }
    },

    // 完成任务
    async completeTask(id, data) {
        // await auth.post(`/tasks/${id}/complete`, data)
        await delay(500)
        return { success: true, message: '任务完成' }
    },

    // ========= 维保资料库 =========
    // 获取维保资料
    async getMaintenanceLibrary(params) {
        // const response = await auth.get('/library', { params })
        // return response.data
        await delay(500)
        return {
            success: true,
            data: {
                content: [
                    {
                        id: 1,
                        equipmentType: 'MACHINE_CENTER',
                        equipmentTypeLabel: '加工中心',
                        maintenanceItems: [
                            {
                                id: 101,
                                name: '主轴保养',
                                description: '检查主轴运行状态',
                                standardTime: 30,
                                tools: ['千分表', '润滑油'],
                                documents: ['主轴保养手册.pdf']
                            }
                        ]
                    }
                ]
            }
        }
    },

    // ========= 流程监控 =========
    // 获取保养记录
    async getMaintenanceRecords(params) {
        // const response = await auth.get('/records', { params })
        // return response.data
        await delay(500)
        return {
            success: true,
            data: {
                content: [
                    {
                        id: 1,
                        taskId: 1,
                        equipmentName: '立式加工中心-MC001',
                        executor: '张三',
                        startTime: '2025-07-31 09:00:00',
                        endTime: '2025-07-31 10:30:00',
                        status: 'COMPLETED',
                        items: [
                            {
                                name: '清洁导轨',
                                result: '正常',
                                photos: ['photo1.jpg', 'photo2.jpg'],
                                video: 'video1.mp4',
                                audio: 'audio1.mp3',
                                parts: [
                                    { name: '润滑油', quantity: 2, unit: '升' }
                                ]
                            }
                        ],
                        report: '设备运行正常，建议下次更换润滑油'
                    }
                ],
                totalElements: 1
            }
        }
    },

    // 提交保养记录
    async submitMaintenanceRecord(data) {
        // await auth.post('/records', data)
        await delay(500)
        return { success: true, message: '记录提交成功' }
    },

    // ========= 数据分析 =========
    // 获取设备指标数据
    async getEquipmentMetrics(equipmentId) {
        // const response = await auth.get(`/analytics/metrics/${equipmentId}`)
        // return response.data
        await delay(500)
        return {
            success: true,
            data: {
                equipmentId: equipmentId,
                metrics: [
                    {
                        name: '主轴温度',
                        unit: '°C',
                        data: [
                            { date: '2025-07-25', value: 45 },
                            { date: '2025-07-26', value: 47 },
                            { date: '2025-07-27', value: 46 },
                            { date: '2025-07-28', value: 48 },
                            { date: '2025-07-29', value: 49 },
                            { date: '2025-07-30', value: 50 }
                        ],
                        trend: 'UP',
                        suggestion: '建议检查冷却系统'
                    }
                ]
            }
        }
    },

    // 获取保养质量评估
    async getMaintenanceQuality(equipmentId) {
        // const response = await auth.get(`/analytics/quality/${equipmentId}`)
        // return response.data
        await delay(500)
        return {
            success: true,
            data: {
                equipmentId: equipmentId,
                score: 85,
                factors: {
                    '按时完成率': 90,
                    '操作规范性': 80,
                    '故障减少率': 85
                },
                recommendations: [
                    '建议增加润滑频率',
                    '检查主轴皮带张力'
                ]
            }
        }
    }
}

// 延迟函数
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
}
