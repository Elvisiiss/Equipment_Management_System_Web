import request from '@/utils/request';

const regionAPI = {
    // 新增区域
    add: (data) => {
        return request({
            url: '/areas',
            method: 'post',
            data
        });
    },
    // 更新区域
    update: (data) => {  // 修改参数格式，直接传递完整对象
        return request({
            url: '/areas',
            method: 'put',
            data
        });
    },
    // 删除区域
    delete: (id) => {
        return request({
            url: `/areas/${id}`,
            method: 'delete'
        });
    },
    // 分页查询区域（移除多余的searchQuery参数）
    page: (pageNum, pageSize) => {
        return request({
            url: '/areas/page',
            method: 'get',
            params: {
                pageNum,
                pageSize
            }
        });
    },
    // 根据ID查询区域
    getById: (id) => {
        return request({
            url: `/areas/${id}`,
            method: 'get'
        });
    },
    // 根据父ID查询子区域
    getByParentId: (parentId) => {
        return request({
            url: `/areas/parent/${parentId}`,
            method: 'get'
        });
    },
    // 根据类型查询区域
    getByType: (type) => {
        return request({
            url: `/areas/type/${type}`,
            method: 'get'
        });
    },
    // 获取区域子树
    getSubTree: (parentId) => {
        return request({
            url: '/areas/tree',
            method: 'get',
            params: parentId ? { parentId } : {}  // 处理parentId为null的情况
        });
    }
};

export default regionAPI;
