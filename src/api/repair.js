import axios from 'axios'
import { useAuthStore } from '@/stores/auth'

const API_BASE_URL = '/api/repair'

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

// 模拟数据
const mockRepairs = [
    {
        id: 1,
        equipmentId: 1,
        equipmentName: '立式加工中心',
        equipmentNumber: 'MC-0001',
        reporter: '张三',
        phone: '13800138000',
        faultType: 'mechanical',
        faultDescription: '设备主轴异常振动，伴有异常噪音',
        images: ['https://via.placeholder.com/300x200?text=Fault+Image'],
        reportTime: '2023-06-15 10:30:25',
        status: 'assigned',
        assignInfo: {
            assignTime: '2023-06-15 11:15:42',
            assigner: '管理员',
            workerId: 1,
            workerName: '张师傅',
            workerPhone: '13800138001',
            deadline: '2023-06-16 18:00:00',
            remark: '请尽快处理'
        },
        repairInfo: null
    },
    // 更多模拟数据...
]

// 延迟函数
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
}

export default {
    // 获取待维修列表
    async getPendingRepairs() {
        await delay(600)
        const pendingRepairs = mockRepairs.filter(r => r.status === 'pending' || r.status === 'assigned')
        return {
            success: true,
            data: pendingRepairs
        }
    },

    // 创建维修申请
    async createRepairOrder(data) {
        await delay(500)
        const newId = Math.max(...mockRepairs.map(r => r.id), 0) + 1
        const newRepair = {
            id: newId,
            ...data,
            reportTime: new Date().toLocaleString(),
            status: 'pending',
            assignInfo: null,
            repairInfo: null
        }
        mockRepairs.unshift(newRepair)
        return { success: true, message: '维修申请创建成功', data: { id: newId } }
    },

    // 派单
    async assignRepairTask(repairId, data) {
        await delay(500)
        const repair = mockRepairs.find(r => r.id === repairId)
        if (repair) {
            const worker = workers.find(w => w.id === data.workerId)
            repair.status = 'assigned'
            repair.assignInfo = {
                assignTime: new Date().toLocaleString(),
                assigner: '管理员',
                workerId: data.workerId,
                workerName: worker.name,
                workerPhone: worker.phone,
                deadline: data.deadline,
                remark: data.remark
            }
            return { success: true, message: '派单成功' }
        }
        return { success: false, message: '工单不存在' }
    },

    // 获取维修工的工单
    async getWorkerRepairs(workerId, status = 'assigned') {
        await delay(600)
        const repairs = mockRepairs.filter(r =>
            r.assignInfo?.workerId === workerId && r.status === status
        )
        return {
            success: true,
            data: repairs
        }
    },

    // 开始维修
    async startRepair(repairId) {
        await delay(500)
        const repair = mockRepairs.find(r => r.id === repairId)
        if (repair) {
            repair.status = 'repairing'
            repair.repairInfo = {
                startTime: new Date().toLocaleString(),
                status: 'repairing'
            }
            return { success: true, message: '维修已开始' }
        }
        return { success: false, message: '工单不存在' }
    },

    // 完成维修
    async completeRepair(repairId, data) {
        await delay(500)
        const repair = mockRepairs.find(r => r.id === repairId)
        if (repair) {
            repair.status = 'completed'
            repair.repairInfo = {
                ...repair.repairInfo,
                endTime: new Date().toLocaleString(),
                status: 'completed',
                problem: data.problem,
                solution: data.solution,
                description: data.description,
                images: data.images,
                duration: '2小时15分钟' // 实际应计算时间差
            }
            return { success: true, message: '维修已完成' }
        }
        return { success: false, message: '工单不存在' }
    }
}

// 维修师傅列表
const workers = [
    { id: 1, name: '张师傅', phone: '13800138001' },
    { id: 2, name: '李师傅', phone: '13800138002' },
    { id: 3, name: '王师傅', phone: '13800138003' }
]
