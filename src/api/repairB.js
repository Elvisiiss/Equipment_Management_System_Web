import axios from 'axios';
import { useAuthStore } from '@/stores/auth';

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
            const response = await auth.get('/orders', {
                params: { page, size, keyword, status }
            });
            return response.data;
        } catch (error) {
            console.error('获取维修工单失败', error);
            throw error;
        }
    },

    async createRepairOrder(data) {
        try {
            const response = await auth.post('/orders', data);
            return response.data;
        } catch (error) {
            console.error('创建维修工单失败', error);
            throw error;
        }
    },

    async updateRepairOrder(id, data) {
        try {
            const response = await auth.put(`/orders/${id}`, data);
            return response.data;
        } catch (error) {
            console.error('更新维修工单失败', error);
            throw error;
        }
    },

    async assignRepairOrder(id, assignee) {
        try {
            const response = await auth.put(`/orders/${id}/assign`, { assignee });
            return response.data;
        } catch (error) {
            console.error('派单失败', error);
            throw error;
        }
    },

    async completeRepairOrder(id, data) {
        try {
            const response = await auth.put(`/orders/${id}/complete`, data);
            return response.data;
        } catch (error) {
            console.error('完成维修失败', error);
            throw error;
        }
    },

    // ============= 知识库管理 =============
    async getKnowledgeBase(page, size, keyword, deviceCode) {
        try {
            const response = await auth.get('/knowledge', {
                params: { page, size, keyword, deviceCode }
            });
            return response.data;
        } catch (error) {
            console.error('获取知识库失败', error);
            throw error;
        }
    },

    async createKnowledge(data) {
        try {
            const response = await auth.post('/knowledge', data);
            return response.data;
        } catch (error) {
            console.error('创建知识失败', error);
            throw error;
        }
    },

    async updateKnowledge(id, data) {
        try {
            const response = await auth.put(`/knowledge/${id}`, data);
            return response.data;
        } catch (error) {
            console.error('更新知识失败', error);
            throw error;
        }
    },

    async deleteKnowledge(id) {
        try {
            const response = await auth.delete(`/knowledge/${id}`);
            return response.data;
        } catch (error) {
            console.error('删除知识失败', error);
            throw error;
        }
    },

    // ============= 统计报表 =============
    async getRepairStats(timeRange) {
        try {
            const response = await auth.get('/stats', {
                params: { timeRange }
            });
            return response.data;
        } catch (error) {
            console.error('获取统计失败', error);
            throw error;
        }
    },

    // ============= 配置管理 =============
    async getConfig() {
        try {
            const response = await auth.get('/config');
            return response.data;
        } catch (error) {
            console.error('获取配置失败', error);
            throw error;
        }
    },

    async updateConfig(data) {
        try {
            const response = await auth.put('/config', data);
            return response.data;
        } catch (error) {
            console.error('更新配置失败', error);
            throw error;
        }
    }
};
