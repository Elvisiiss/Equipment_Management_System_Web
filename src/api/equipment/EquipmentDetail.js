import request from '@/utils/request';

/**
 * 获取设备详情
 * @param {string} code - 设备编码
 * @returns {Promise} - 请求Promise对象
 */
export function getDeviceDetail(code) {
    return request.get(`/devices/by-mc-number?mcNumber=${code}`);
}

/**
 * 获取文件信息
 * @param {string} collectionId - 文件集合ID
 * @returns {Promise} - 请求Promise对象
 */
export function getFileInfo(collectionId) {
    return request.get(`/file/info?collectionId=${collectionId}`);
}

/**
 * 提交设备验收申请
 * @param {Object} data - 验收申请数据
 * @returns {Promise} - 请求Promise对象
 */
export function submitAcceptApplication(data) {
    return request.post('/equipment/accept', data);
}

/**
 * 提交设备转移申请
 * @param {Object} data - 转移申请数据
 * @returns {Promise} - 请求Promise对象
 */
export function submitTransferApplication(data) {
    return request.post('/equipment/transfer', data);
}

/**
 * 提交设备闲置申请
 * @param {Object} data - 闲置申请数据
 * @returns {Promise} - 请求Promise对象
 */
export function submitIdleApplication(data) {
    return request.post('/equipment/idle', data);
}

/**
 * 提交设备报废申请
 * @param {Object} data - 报废申请数据
 * @returns {Promise} - 请求Promise对象
 */
export function submitScrapApplication(data) {
    return request.post('/equipment/scrap', data);
}
