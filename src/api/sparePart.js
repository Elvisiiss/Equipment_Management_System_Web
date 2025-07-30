import axios from 'axios';
import { useAuthStore } from '@/stores/auth'

const API_BASE_URL = '/api/spare-part';

const auth = axios.create({
    baseURL: API_BASE_URL,
});

auth.interceptors.request.use(config => {
    const authStore = useAuthStore();
    const token = authStore.user?.token;
    if (token) {
        config.headers.token = token;
    }
    return config;
}, error => {
    return Promise.reject(error);
});

export default {
    // ============= 备件编码管理 =============
    // 获取备件编码列表
    async getSparePartCodes(page, size, keyword, sortBy, sortDir) {
        try {
            // 实际调用
            // const response = await auth.get('/codes', {
            //     params: { page, size, keyword, sortBy, sortDir }
            // });
            // return response.data;

            // 假数据
            await new Promise(resolve => setTimeout(resolve, 500));
            return {
                success: true,
                message: "获取成功",
                data: {
                    content: [
                        {
                            id: 1,
                            code: "SP-2024-001",
                            name: "轴承6204",
                            category: "机械零件",
                            model: "6204-2RS",
                            specifications: "内径20mm外径47mm",
                            unit: "个",
                            createdAt: "2024-01-15T10:00:00",
                            updatedAt: "2024-01-15T10:00:00"
                        },
                        {
                            id: 2,
                            code: "SP-2024-002",
                            name: "电机皮带",
                            category: "传动部件",
                            model: "A-50",
                            specifications: "周长1250mm",
                            unit: "条",
                            createdAt: "2024-01-10T09:30:00",
                            updatedAt: "2024-01-10T09:30:00"
                        }
                    ],
                    totalElements: 2,
                    totalPages: 1,
                    size: 10,
                    number: 0
                }
            };
        } catch (error) {
            console.error('获取备件编码列表失败', error);
            throw error;
        }
    },

    // 创建备件编码
    async createSparePartCode(data) {
        try {
            // 实际调用
            // const response = await auth.post('/codes', data);
            // return response.data;

            // 假数据
            await new Promise(resolve => setTimeout(resolve, 500));
            return {
                success: true,
                message: "备件编码创建成功",
                data: { id: Math.floor(Math.random() * 1000) }
            };
        } catch (error) {
            console.error('创建备件编码失败', error);
            throw error;
        }
    },

    // 更新备件编码
    async updateSparePartCode(id, data) {
        try {
            // 实际调用
            // const response = await auth.put(`/codes/${id}`, data);
            // return response.data;

            // 假数据
            await new Promise(resolve => setTimeout(resolve, 500));
            return {
                success: true,
                message: "备件编码更新成功"
            };
        } catch (error) {
            console.error('更新备件编码失败', error);
            throw error;
        }
    },

    // 获取备件编码详情
    async getSparePartCodeDetail(id) {
        try {
            // 实际调用
            // const response = await auth.get(`/codes/${id}`);
            // return response.data;

            // 假数据
            await new Promise(resolve => setTimeout(resolve, 500));
            return {
                success: true,
                message: "获取成功",
                data: {
                    id: 1,
                    code: "SP-2024-001",
                    name: "轴承6204",
                    category: "机械零件",
                    model: "6204-2RS",
                    specifications: "内径20mm外径47mm",
                    unit: "个",
                    description: "用于设备主轴支撑",
                    safetyStock: 10,
                    lifespan: 365,
                    warningDays: 30,
                    createdAt: "2024-01-15T10:00:00",
                    updatedAt: "2024-01-15T10:00:00"
                }
            };
        } catch (error) {
            console.error('获取备件编码详情失败', error);
            throw error;
        }
    },

    // ============= 备件台账管理 =============
    // 获取备件台账列表
    async getSparePartInventory(page, size, keyword, category) {
        try {
            // 实际调用
            // const response = await auth.get('/inventory', {
            //     params: { page, size, keyword, category }
            // });
            // return response.data;

            // 假数据
            await new Promise(resolve => setTimeout(resolve, 500));
            return {
                success: true,
                message: "获取成功",
                data: {
                    content: [
                        {
                            id: 1,
                            code: "SP-2024-001",
                            name: "轴承6204",
                            category: "机械零件",
                            totalQuantity: 25,
                            availableQuantity: 20,
                            safetyStock: 10,
                            unit: "个",
                            lastInDate: "2024-01-20",
                            lastOutDate: "2024-01-25",
                            warningStatus: "正常"
                        },
                        {
                            id: 2,
                            code: "SP-2024-002",
                            name: "电机皮带",
                            category: "传动部件",
                            totalQuantity: 8,
                            availableQuantity: 5,
                            safetyStock: 10,
                            unit: "条",
                            lastInDate: "2024-01-15",
                            lastOutDate: "2024-01-22",
                            warningStatus: "库存不足"
                        }
                    ],
                    totalElements: 2,
                    totalPages: 1,
                    size: 10,
                    number: 0
                }
            };
        } catch (error) {
            console.error('获取备件台账失败', error);
            throw error;
        }
    },

    // 零件入库
    async sparePartInbound(data) {
        try {
            // 实际调用
            // const response = await auth.post('/inventory/inbound', data);
            // return response.data;

            // 假数据
            await new Promise(resolve => setTimeout(resolve, 500));
            return {
                success: true,
                message: "入库成功"
            };
        } catch (error) {
            console.error('零件入库失败', error);
            throw error;
        }
    },

    // 零件出库
    async sparePartOutbound(data) {
        try {
            // 实际调用
            // const response = await auth.post('/inventory/outbound', data);
            // return response.data;

            // 假数据
            await new Promise(resolve => setTimeout(resolve, 500));
            return {
                success: true,
                message: "出库成功"
            };
        } catch (error) {
            console.error('零件出库失败', error);
            throw error;
        }
    },

    // 零件借用
    async sparePartBorrow(data) {
        try {
            // 实际调用
            // const response = await auth.post('/inventory/borrow', data);
            // return response.data;

            // 假数据
            await new Promise(resolve => setTimeout(resolve, 500));
            return {
                success: true,
                message: "借用成功"
            };
        } catch (error) {
            console.error('零件借用失败', error);
            throw error;
        }
    },

    // 零件退场
    async sparePartReturn(data) {
        try {
            // 实际调用
            // const response = await auth.post('/inventory/return', data);
            // return response.data;

            // 假数据
            await new Promise(resolve => setTimeout(resolve, 500));
            return {
                success: true,
                message: "退场成功"
            };
        } catch (error) {
            console.error('零件退场失败', error);
            throw error;
        }
    },

    // 零件报废
    async sparePartScrap(data) {
        try {
            // 实际调用
            // const response = await auth.post('/inventory/scrap', data);
            // return response.data;

            // 假数据
            await new Promise(resolve => setTimeout(resolve, 500));
            return {
                success: true,
                message: "报废成功"
            };
        } catch (error) {
            console.error('零件报废失败', error);
            throw error;
        }
    },

    // 零件盘点
    async sparePartInventoryCheck(data) {
        try {
            // 实际调用
            // const response = await auth.post('/inventory/check', data);
            // return response.data;

            // 假数据
            await new Promise(resolve => setTimeout(resolve, 500));
            return {
                success: true,
                message: "盘点完成"
            };
        } catch (error) {
            console.error('零件盘点失败', error);
            throw error;
        }
    },

    // 获取库存记录
    async getInventoryRecords(page, size, type, dateRange) {
        try {
            // 实际调用
            // const params = { page, size, type, startDate: dateRange?.[0], endDate: dateRange?.[1] };
            // const response = await auth.get('/inventory/records', { params });
            // return response.data;

            // 假数据
            await new Promise(resolve => setTimeout(resolve, 500));
            return {
                success: true,
                message: "获取成功",
                data: {
                    content: [
                        {
                            id: 1,
                            code: "SP-2024-001",
                            name: "轴承6204",
                            type: "入库",
                            quantity: 20,
                            unit: "个",
                            operator: "张三",
                            operateTime: "2024-01-20 10:30:00",
                            remark: "采购入库"
                        },
                        {
                            id: 2,
                            code: "SP-2024-001",
                            name: "轴承6204",
                            type: "出库",
                            quantity: 5,
                            unit: "个",
                            operator: "李四",
                            operateTime: "2024-01-25 14:20:00",
                            remark: "设备维修使用"
                        }
                    ],
                    totalElements: 2,
                    totalPages: 1,
                    size: 10,
                    number: 0
                }
            };
        } catch (error) {
            console.error('获取库存记录失败', error);
            throw error;
        }
    }
};
