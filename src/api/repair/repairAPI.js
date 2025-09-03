import request from '@/utils/request';

/**
 * 创建维修工单
 * @param {Object} repairWorkOrder - 维修工单信息
 * @param {File[]} images - 故障图片文件列表
 * @returns {Promise} - 请求Promise对象
 */
export function createRepairWorkOrder(repairWorkOrder, images) {
    // 创建FormData对象
    const formData = new FormData();

    // 添加维修工单信息（JSON字符串）
    formData.append('repairWorkOrder', new Blob(
        [JSON.stringify(repairWorkOrder)],
        { type: 'application/json' }
    ));

    // 添加图片文件
    if (images && images.length > 0) {
        images.forEach(image => {
            formData.append('repairImage', image);
        });
    }

    // 发送POST请求
    return request.post('/repair/workOrder', formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
}

export default {
    createRepairWorkOrder
};
