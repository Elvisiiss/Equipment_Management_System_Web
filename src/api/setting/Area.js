import request from '@/utils/request';

const areaAPI = {
    list() {
        return request({
            url: '/area',
            method: 'GET',
        });
    },
    get(id) {
        return request({
            url: `/area/${id}`,
            method: 'GET',
        });
    },
    add(area) {
        return request({
            url: '/area',
            method: 'POST',
            data: area,
        });
    },
    update(id, area) {
        return request({
            url: `/area/${id}`,
            method: 'PUT',
            data: area,
        });
    },
    delete(id) {
        return request({
            url: `/area/${id}`,
            method: 'DELETE',
        });
    },
    page(pageNum, pageSize, keyword) {
        return request({
            url: '/area/page',
            method: 'GET',
            params: {
                pageNum,
                pageSize,
                keyword,
            },
        });
    },
};

export default areaAPI;
