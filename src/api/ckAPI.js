import ckApiStore from './ckApiStore';

// 设备相关API
export const deviceAPI = {
    // 获取设备详情
    getDeviceDetail: (code) => {
        return new Promise(resolve => {
            // 模拟API延迟
            setTimeout(() => {
                const data = ckApiStore.getDeviceDetail(code);
                resolve({ success: true, data });
            }, 300);
        });
    },

    // 获取设备相关列表
    getDeviceLists: (code) => {
        return new Promise(resolve => {
            setTimeout(() => {
                const data = ckApiStore.getDeviceLists(code);
                resolve({ success: true, data });
            }, 300);
        });
    },

    // 提交验收任务
    submitAcceptTask: (params) => {
        return new Promise(resolve => {
            setTimeout(() => {
                const task = ckApiStore.createAuditTask({
                    taskType: '验收',
                    taskName: '设备验收',
                    deviceCode: params.deviceCode,
                    deviceName: params.deviceName,
                    result: params.result,
                    opinion: params.opinion,
                    initiator: params.initiator,
                    date: params.date,
                    attachments: params.attachments
                });

                resolve({ success: true, data: task });
            }, 300);
        });
    },

    // 提交转移任务
    submitTransferTask: (params) => {
        return new Promise(resolve => {
            setTimeout(() => {
                // 先将设备状态改为转移中
                ckApiStore.updateDevice(params.deviceCode, { status: '转移中' });

                const task = ckApiStore.createAuditTask({
                    taskType: '转移',
                    taskName: '设备转移',
                    deviceCode: params.deviceCode,
                    deviceName: params.deviceName,
                    targetArea: params.targetArea,
                    reason: params.reason,
                    attachments: params.attachments,
                    initiator: 'admin' // 添加发起人
                });

                resolve({ success: true, data: task });
            }, 300);
        });
    },

    // 提交闲置任务
    submitIdleTask: (params) => {
        return new Promise(resolve => {
            setTimeout(() => {
                const task = ckApiStore.createAuditTask({
                    taskType: '闲置',
                    taskName: '设备闲置',
                    deviceCode: params.deviceCode,
                    deviceName: params.deviceName,
                    description: params.description,
                    attachments: params.attachments
                });

                resolve({ success: true, data: task });
            }, 300);
        });
    },

    // 提交报废任务
    submitScrapTask: (params) => {
        return new Promise(resolve => {
            setTimeout(() => {
                const task = ckApiStore.createAuditTask({
                    taskType: '报废',
                    taskName: '设备报废',
                    deviceCode: params.deviceCode,
                    deviceName: params.deviceName,
                    description: params.description,
                    attachments: params.attachments
                });

                resolve({ success: true, data: task });
            }, 300);
        });
    },

    // 刷新点检任务
    refreshCheckTasks: (code) => {
        return new Promise(resolve => {
            setTimeout(() => {
                const { checkList } = ckApiStore.getDeviceLists(code);
                // 随机更新状态
                const updatedList = checkList.map(r => ({
                    ...r,
                    status: Math.random() > 0.5 ? '已执行' : '待执行'
                }));
                resolve({ success: true, data: updatedList });
            }, 300);
        });
    },

    // 刷新保养任务
    refreshMaintainTasks: (code) => {
        return new Promise(resolve => {
            setTimeout(() => {
                const { maintainList } = ckApiStore.getDeviceLists(code);
                // 随机更新
                let updatedList = maintainList;
                if (Math.random() > 0.5) {
                    updatedList = [
                        { date: new Date().toLocaleDateString(), areaId: 40, content: '深度清洁', maintainer: '张技师', status: '已保养', areaName: 'C4车间51产线CFOG段' }
                    ];
                } else {
                    updatedList = [];
                }
                resolve({ success: true, data: updatedList });
            }, 300);
        });
    }
};

// 审核相关API
export const auditAPI = {
    // 获取审核任务列表
    getAuditTasks: (page = 1, pageSize = 10, status = '') => {
        return new Promise(resolve => {
            setTimeout(() => {
                const data = ckApiStore.getAuditTasks(page, pageSize, status);
                resolve({ success: true, data });
            }, 300);
        });
    },

    // 审核任务
    auditTask: (taskId, result, approver, remark = '') => {
        return new Promise(resolve => {
            setTimeout(() => {
                const success = ckApiStore.auditTask(taskId, result, approver, remark);
                resolve({ success, data: { taskId, result } });
            }, 300);
        });
    },

    resubmitTask: (taskId) => {
        return new Promise(resolve => {
            setTimeout(() => {
                const success = ckApiStore.resubmitTask(taskId);
                resolve({ success, data: { taskId } });
            }, 300);
        });
    }
};
