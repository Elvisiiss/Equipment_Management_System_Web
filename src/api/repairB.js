import axios from 'axios';
import { useAuthStore } from '@/stores/auth'

const API_BASE_URL = '/api/repair';

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
    // ============= 维修工单管理 =============
    async getRepairOrders(page, size, keyword, status) {
        try {
            // 实际调用
            // const response = await auth.get('/orders', {
            //     params: { page, size, keyword, status }
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
                            code: "WO-2024-001",
                            deviceName: "贴片机#1",
                            deviceCode: "SMT-001",
                            faultDesc: "贴装精度异常",
                            status: "处理中",
                            priority: "高",
                            reporter: "张三",
                            assignee: "李四",
                            createTime: "2024-01-15 10:00:00",
                            updateTime: "2024-01-15 14:30:00",
                            faultImages: ["img1.jpg"],
                            repairImages: ["repair1.jpg"],
                            parts: [{name: "电机", quantity: 1}]
                        },
                        {
                            id: 2,
                            code: "WO-2024-002",
                            deviceName: "回流焊#2",
                            deviceCode: "REFLOW-002",
                            faultDesc: "温度控制失效",
                            status: "待处理",
                            priority: "中",
                            reporter: "王五",
                            assignee: null,
                            createTime: "2024-01-16 09:15:00",
                            updateTime: "2024-01-16 09:15:00",
                            faultImages: [],
                            repairImages: [],
                            parts: []
                        }
                    ],
                    totalElements: 2,
                    totalPages: 1,
                    size: 10,
                    number: 0
                }
            };
        } catch (error) {
            console.error('获取维修工单失败', error);
            throw error;
        }
    },

    async createRepairOrder(data) {
        try {
            // 实际调用
            // const response = await auth.post('/orders', data);
            // return response.data;

            // 假数据
            await new Promise(resolve => setTimeout(resolve, 500));
            return {
                success: true,
                message: "创建成功",
                data: { id: Math.floor(Math.random() * 1000) }
            };
        } catch (error) {
            console.error('创建维修工单失败', error);
            throw error;
        }
    },

    async updateRepairOrder(id, data) {
        try {
            // 实际调用
            // const response = await auth.put(`/orders/${id}`, data);
            // return response.data;

            // 假数据
            await new Promise(resolve => setTimeout(resolve, 500));
            return {
                success: true,
                message: "更新成功"
            };
        } catch (error) {
            console.error('更新维修工单失败', error);
            throw error;
        }
    },

    async assignRepairOrder(id, assignee) {
        try {
            // 实际调用
            // const response = await auth.put(`/orders/${id}/assign`, { assignee });
            // return response.data;

            // 假数据
            await new Promise(resolve => setTimeout(resolve, 500));
            return {
                success: true,
                message: "派单成功"
            };
        } catch (error) {
            console.error('派单失败', error);
            throw error;
        }
    },

    async completeRepairOrder(id, data) {
        try {
            // 实际调用
            // const response = await auth.put(`/orders/${id}/complete`, data);
            // return response.data;

            // 假数据
            await new Promise(resolve => setTimeout(resolve, 500));
            return {
                success: true,
                message: "维修完成"
            };
        } catch (error) {
            console.error('完成维修失败', error);
            throw error;
        }
    },

    // ============= 知识库管理 =============
    async getKnowledgeBase(page, size, keyword, deviceCode) {
        try {
            // 实际调用
            // const response = await auth.get('/knowledge', {
            //     params: { page, size, keyword, deviceCode }
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
                            title: "贴片机常见故障处理",
                            deviceCode: "SMT-001",
                            type: "故障案例",
                            content: "贴装精度异常处理步骤...",
                            createTime: "2024-01-10 10:00:00",
                            viewCount: 125
                        },
                        {
                            id: 2,
                            title: "回流焊温度校准SOP",
                            deviceCode: "REFLOW-002",
                            type: "SOP",
                            content: "温度校准标准操作流程...",
                            createTime: "2024-01-08 15:30:00",
                            viewCount: 89
                        }
                    ],
                    totalElements: 2,
                    totalPages: 1,
                    size: 10,
                    number: 0
                }
            };
        } catch (error) {
            console.error('获取知识库失败', error);
            throw error;
        }
    },

    async createKnowledge(data) {
        try {
            // 实际调用
            // const response = await auth.post('/knowledge', data);
            // return response.data;

            // 假数据
            await new Promise(resolve => setTimeout(resolve, 500));
            return {
                success: true,
                message: "创建成功",
                data: { id: Math.floor(Math.random() * 1000) }
            };
        } catch (error) {
            console.error('创建知识失败', error);
            throw error;
        }
    },

    // ============= 统计报表 =============
    async getRepairStats(timeRange) {
        try {
            // 实际调用
            // const response = await auth.get('/stats', {
            //     params: { timeRange }
            // });
            // return response.data;

            // 假数据
            await new Promise(resolve => setTimeout(resolve, 500));
            return {
                success: true,
                message: "获取成功",
                data: {
                    totalOrders: 156,
                    completedOrders: 142,
                    pendingOrders: 14,
                    mtbf: 8760,
                    mttr: 2.5,
                    deviceStats: [
                        {deviceName: "贴片机#1", mtbf: 8760, mttr: 2.5, downtime: 5},
                        {deviceName: "回流焊#2", mtbf: 7200, mttr: 3.2, downtime: 8}
                    ],
                    personLoading: [
                        {name: "李四", orderCount: 45, avgTime: 2.3},
                        {name: "王五", orderCount: 38, avgTime: 2.8}
                    ]
                }
            };
        } catch (error) {
            console.error('获取统计失败', error);
            throw error;
        }
    },

    // ============= 配置管理 =============
    async getConfig() {
        try {
            // 实际调用
            // const response = await auth.get('/config');
            // return response.data;

            // 假数据
            await new Promise(resolve => setTimeout(resolve, 500));
            return {
                success: true,
                message: "获取成功",
                data: {
                    escalationRules: [
                        {
                            level: 1,
                            delay: 30,
                            notifyType: ["app", "email"],
                            recipients: ["张三", "李四"]
                        },
                        {
                            level: 2,
                            delay: 60,
                            notifyType: ["app", "email", "wechat"],
                            recipients: ["王经理", "李主管"]
                        }
                    ],
                    repairTypes: ["自叫维修", "手叫维修"],
                    priorityLevels: ["低", "中", "高", "紧急"]
                }
            };
        } catch (error) {
            console.error('获取配置失败', error);
            throw error;
        }
    },

    async updateConfig(data) {
        try {
            // 实际调用
            // const response = await auth.put('/config', data);
            // return response.data;

            // 假数据
            await new Promise(resolve => setTimeout(resolve, 500));
            return {
                success: true,
                message: "更新成功"
            };
        } catch (error) {
            console.error('更新配置失败', error);
            throw error;
        }
    }
};
