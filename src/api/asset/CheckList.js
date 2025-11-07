import request from '@/utils/request';

/**
 * 分页查询审批任务 (DTO版本)
 * @param {Object} params - 查询参数
 * @returns {Promise} - 请求Promise对象
 */
export function getApprovalTasksPage(params) {
    return request.post('/approval-tasks/page', params);
}

/**
 * 查询审批任务详情
 * @param {string} id - 任务ID
 * @returns {Promise} - 请求Promise对象
 */
export function getApprovalTaskDetail(id) {
    return request.get(`/approval-tasks/${id}`);
}

/**
 * 审核任务
 * @param {Object} params - 审核参数
 * @returns {Promise} - 请求Promise对象
 */
export function approveTask(params) {
    const { id, status, comment } = params;
    return request.put(`/approval-tasks/${id}/approve`, null, {
        params: {
            status,
            comment
        }
    });
}

/**
 * 批量审核任务
 * @param {Object} params - 批量审核参数
 * @returns {Promise} - 请求Promise对象
 */
export function batchApproveTasks(params) {
    const { taskIds, status, comment } = params;
    return request.put('/approval-tasks/batch-approve', null, {
        params: {
            taskIds: JSON.stringify(taskIds),
            status,
            comment
        }
    });
}

/**
 * 根据申请人查询任务
 * @param {string} applicantId - 申请人ID
 * @returns {Promise} - 请求Promise对象
 */
export function getTasksByApplicant(applicantId) {
    return request.get(`/approval-tasks/by-applicant/${applicantId}`);
}

/**
 * 根据审核状态查询任务
 * @param {number} status - 审核状态 (0: 待审核, 1: 已通过, 2: 已驳回)
 * @returns {Promise} - 请求Promise对象
 */
export function getTasksByStatus(status) {
    return request.get(`/approval-tasks/by-status/${status}`);
}

/**
 * 根据设备编码查询任务
 * @param {string} deviceCode - 设备编码
 * @returns {Promise} - 请求Promise对象
 */
export function getTasksByDeviceCode(deviceCode) {
    return request.get('/approval-tasks/by-device-code', {
        params: { deviceCode }
    });
}

/**
 * 查询归属审核任务
 * @returns {Promise} - 请求Promise对象
 */
export function getAssignedTasks() {
    return request.get('/approval-tasks/assigned');
}

/**
 * 统计任务数量
 * @param {number} status - 审核状态 (0: 待审核, 1: 已通过, 2: 已驳回)
 * @returns {Promise} - 请求Promise对象
 */
export function countTasksByStatus(status) {
    return request.get(`/approval-tasks/count-by-status/${status}`);
}

/**
 * 查询具有审核权限的用户
 * @returns {Promise} - 请求Promise对象
 */
export function getApprovalUsers() {
    return request.get('/approval-tasks/approval-users');
}

/**
 * 删除审批任务
 * @param {string} id - 任务ID
 * @returns {Promise} - 请求Promise对象
 */
export function deleteApprovalTask(id) {
    return request.delete(`/approval-tasks/${id}`);
}

/**
 * 获取审批任务附件列表
 * @param {string} taskId - 任务ID
 * @returns {Promise} - 请求Promise对象
 */
export function getTaskAttachments(taskId) {
    return request.get(`/approval-tasks/${taskId}/attachments`);
}

/**
 * 为审批任务添加附件
 * @param {Object} params - 附件参数
 * @returns {Promise} - 请求Promise对象
 */
export function addTaskAttachments(params) {
    const { taskId, attachments } = params;
    const formData = new FormData();

    attachments.forEach(file => {
        formData.append('attachments', file.raw || file);
    });

    return request.post(`/approval-tasks/${taskId}/attachments`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
}

/**
 * 删除审批任务附件
 * @param {Object} params - 删除参数
 * @returns {Promise} - 请求Promise对象
 */
export function deleteTaskAttachment(params) {
    const { taskId, fileId } = params;
    return request.delete(`/approval-tasks/${taskId}/attachments/${fileId}`);
}

/**
 * 下载审批任务附件
 * @param {Object} params - 下载参数
 * @returns {Promise} - 请求Promise对象
 */
export function downloadTaskAttachment(params) {
    const { taskId, fileId } = params;
    return request.get(`/approval-tasks/${taskId}/attachments/${fileId}/download`, {
        responseType: 'blob'
    });
}

/**
 * 创建审批任务（通用）
 * @param {Object} data - 审批任务数据
 * @returns {Promise} - 请求Promise对象
 */
export function createApprovalTask(data) {
    return request.post('/approval-tasks', data);
}

/**
 * 创建带附件的审批任务
 * @param {Object} formData - FormData对象，包含任务数据和附件
 * @returns {Promise} - 请求Promise对象
 */
export function createApprovalTaskWithAttachments(formData) {
    return request.post('/approval-tasks/with-attachments', formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
}

/**
 * 获取当前用户信息
 * @returns {Promise} - 请求Promise对象
 */
export function getCurrentUser() {
    return request.get('/user/current');
}

/**
 * 任务类型映射
 */
export const TASK_TYPE_MAP = {
    '验收': 4, // 设备采购对应验收
    '转移': 2, // 设备转移
    '闲置': 0, // 设备闲置
    '报废': 1  // 设备报废
};

/**
 * 状态映射
 */
export const STATUS_MAP = {
    '待审核': 0,
    '审核通过': 1,
    '审核拒绝': 2
};

/**
 * 反向状态映射
 */
export const REVERSE_STATUS_MAP = {
    0: '待审核',
    1: '审核通过',
    2: '审核拒绝'
};

/**
 * 任务类型反向映射
 */
export const REVERSE_TASK_TYPE_MAP = {
    0: '闲置',
    1: '报废',
    2: '转移',
    3: '维修',
    4: '验收'
};
