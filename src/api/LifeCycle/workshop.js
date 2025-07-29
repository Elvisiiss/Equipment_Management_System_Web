import axios from 'axios';
import { useAuthStore } from '@/stores/auth'

const API_BASE_URL = '/api/workshop';

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
    // 获取车间列表（分页）
    async getWorkshopList(page, size, keyword, sortBy, sortDir) {
        try {
            const response = await auth.get('/list', {
                params: {
                    page,
                    size,
                    keyword,
                    sortBy,
                    sortDir
                }
            });
            return response.data;
        } catch (error) {
            console.error('获取车间列表失败', error.response?.data);
            throw error;
        }
    },

    // 更新车间状态
    async updateWorkshopStatus(id, status) {
        try {
            const response = await auth.put('/status', {
                id,
                status
            });
            return response.data;
        } catch (error) {
            console.error('车间状态更新失败', error.response?.data);
            throw error;
        }
    },

    // 批量更新车间
    async batchUpdateWorkshops(action, ids) {
        try {
            const response = await auth.put('/batch', null, {
                params: {
                    action,
                    ids
                }
            });
            return response.data;
        } catch (error) {
            console.error('批量操作失败', error.response?.data);
            throw error;
        }
    },

    // 删除车间（软删除）
    async deleteWorkshop(id) {
        try {
            const response = await auth.delete(`/${id}`);
            return response.data;
        } catch (error) {
            console.error('删除车间失败', error.response?.data);
            throw error;
        }
    }
};
