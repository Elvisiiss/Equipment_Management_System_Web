import request from '@/utils/request';

/**
 * 获取审批流程列表（分页）
 * @param {Object} params - 查询参数
 * @returns {Promise} - 请求Promise对象
 */
export function getApprovalProcesses(params) {
    return request.get('/approval-processes/page', { params });
}

/**
 * 创建审批流程
 * @param {Object} data - 审批流程数据
 * @returns {Promise} - 请求Promise对象
 */
export function createApprovalProcess(data) {
    return request.post('/approval-processes', data);
}

/**
 * 更新审批流程
 * @param {number} id - 流程ID
 * @param {Object} data - 更新数据
 * @returns {Promise} - 请求Promise对象
 */
export function updateApprovalProcess(id, data) {
    return request.put(`/approval-processes/${id}`, data);
}

/**
 * 删除审批流程
 * @param {number} id - 流程ID
 * @returns {Promise} - 请求Promise对象
 */
export function deleteApprovalProcess(id) {
    return request.delete(`/approval-processes/${id}`);
}

/**
 * 启用/禁用审批流程
 * @param {number} id - 流程ID
 * @param {boolean} enabled - 启用状态
 * @returns {Promise} - 请求Promise对象
 */
export function toggleApprovalProcessStatus(id, enabled) {
    return request.put(`/approval-processes/${id}/status?enabled=${enabled}`);
}

/**
 * 获取所有用户列表
 * @returns {Promise} - 请求Promise对象
 */
export function getAllUsers() {
    return request.get('/approval-tasks/approval-users');
}

/**
 * 获取车间列表
 * @returns {Promise} - 请求Promise对象
 */
export function getWorkshopList() {
    return request.get('/areas/workshops');
}

/**
 * 根据车间ID获取产线列表
 * @param {number} workshopId - 车间ID
 * @returns {Promise} - 请求Promise对象
 */
export function getLineListByWorkshop(workshopId) {
    return request.get(`/areas/lines?workshopId=${workshopId}`);
}

/**
 * 根据产线ID获取工段列表
 * @param {number} lineId - 产线ID
 * @returns {Promise} - 请求Promise对象
 */
export function getSegmentListByLine(lineId) {
    return request.get(`/areas/segments?lineId=${lineId}`);
}

/**
 * 搜索设备
 * @param {Object} params - 搜索参数
 * @returns {Promise} - 请求Promise对象
 */
export function searchDevicesApi(params) {
    return request.get('/devices/search', { params });
}

/**
 * 获取区域树（车间、产线、工段）
 * @returns {Promise} - 请求Promise对象
 */
export function getAreaTree() {
    return request.get('/areas/tree');
}

/**
 * 获取子区域列表
 * @param {number} parentId - 父区域ID
 * @returns {Promise} - 请求Promise对象
 */
export function getChildAreas(parentId) {
    return request.get(`/areas/children?parentId=${parentId}`);
}

/**
 * 获取启用的审批流程列表
 * @returns {Promise} - 请求Promise对象
 */
export function getEnabledApprovalProcesses() {
    return request.get('/approval-processes/enabled');
}

/**
 * 查找适用的审批流程
 * @param {Object} params - 查询参数
 * @returns {Promise} - 请求Promise对象
 */
export function getApplicableApprovalProcess(params) {
    return request.get('/approval-processes/applicable', { params });
}
