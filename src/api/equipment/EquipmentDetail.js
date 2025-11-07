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
 * 创建审批任务（用于转移、闲置、报废）
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
 * 提交设备转移申请
 * @param {Object} data - 转移申请数据
 * @returns {Promise} - 请求Promise对象
 */
export function submitTransferApplication(data) {
    // 设备转移对应taskType=2
    const approvalData = {
        menuType: "设备管理",
        taskType: 2, // 设备转移
        deviceCode: data.deviceCode,
        deviceName: data.deviceName,
        taskName: `设备转移申请 - ${data.deviceCode}`,
        applyReason: data.reason,
        applicantId: data.applicantId,
        targetArea: data.targetArea // 必填字段
    };

    return createApprovalTask(approvalData);
}

/**
 * 提交带附件的设备转移申请
 * @param {Object} data - 转移申请数据（包含附件）
 * @returns {Promise} - 请求Promise对象
 */
export function submitTransferApplicationWithAttachments(data) {
    const formData = new FormData();

    const taskData = {
        menuType: "设备管理",
        taskType: 2, // 设备转移
        deviceCode: data.deviceCode,
        deviceName: data.deviceName,
        taskName: `设备转移申请 - ${data.deviceCode}`,
        applyReason: data.reason,
        applicantId: data.applicantId,
        targetArea: data.targetArea
    };

    formData.append('task', JSON.stringify(taskData));

    // 添加附件
    if (data.attachments && data.attachments.length > 0) {
        data.attachments.forEach(file => {
            formData.append('attachments', file.raw || file);
        });
    }

    return createApprovalTaskWithAttachments(formData);
}

/**
 * 提交设备闲置申请
 * @param {Object} data - 闲置申请数据
 * @returns {Promise} - 请求Promise对象
 */
export function submitIdleApplication(data) {
    // 设备闲置对应taskType=0
    const approvalData = {
        menuType: "设备管理",
        taskType: 0, // 设备闲置
        deviceCode: data.deviceCode,
        deviceName: data.deviceName,
        taskName: `设备闲置申请 - ${data.deviceCode}`,
        applyReason: data.description,
        applicantId: data.applicantId
        // 不需要targetArea
    };

    return createApprovalTask(approvalData);
}

/**
 * 提交带附件的设备闲置申请
 * @param {Object} data - 闲置申请数据（包含附件）
 * @returns {Promise} - 请求Promise对象
 */
export function submitIdleApplicationWithAttachments(data) {
    const formData = new FormData();

    const taskData = {
        menuType: "设备管理",
        taskType: 0, // 设备闲置
        deviceCode: data.deviceCode,
        deviceName: data.deviceName,
        taskName: `设备闲置申请 - ${data.deviceCode}`,
        applyReason: data.description,
        applicantId: data.applicantId
    };

    formData.append('task', JSON.stringify(taskData));

    // 添加附件
    if (data.attachments && data.attachments.length > 0) {
        data.attachments.forEach(file => {
            formData.append('attachments', file.raw || file);
        });
    }

    return createApprovalTaskWithAttachments(formData);
}

/**
 * 提交设备报废申请
 * @param {Object} data - 报废申请数据
 * @returns {Promise} - 请求Promise对象
 */
export function submitScrapApplication(data) {
    // 设备报废对应taskType=1
    const approvalData = {
        menuType: "设备管理",
        taskType: 1, // 设备报废
        deviceCode: data.deviceCode,
        deviceName: data.deviceName,
        taskName: `设备报废申请 - ${data.deviceCode}`,
        applyReason: data.description,
        applicantId: data.applicantId
        // 不需要targetArea
    };

    return createApprovalTask(approvalData);
}

/**
 * 提交带附件的设备报废申请
 * @param {Object} data - 报废申请数据（包含附件）
 * @returns {Promise} - 请求Promise对象
 */
export function submitScrapApplicationWithAttachments(data) {
    const formData = new FormData();

    const taskData = {
        menuType: "设备管理",
        taskType: 1, // 设备报废
        deviceCode: data.deviceCode,
        deviceName: data.deviceName,
        taskName: `设备报废申请 - ${data.deviceCode}`,
        applyReason: data.description,
        applicantId: data.applicantId
    };

    formData.append('task', JSON.stringify(taskData));

    // 添加附件
    if (data.attachments && data.attachments.length > 0) {
        data.attachments.forEach(file => {
            formData.append('attachments', file.raw || file);
        });
    }

    return createApprovalTaskWithAttachments(formData);
}

/**
 * 获取当前用户信息（用于获取applicantId）
 * @returns {Promise} - 请求Promise对象
 */
export function getCurrentUser() {
    return request.get('/user/current');
}
