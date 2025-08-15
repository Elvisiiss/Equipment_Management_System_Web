// 模拟数据库存储
const ckApiStore = {
    // 设备数据
    devices: {},

    // 审核任务列表
    auditTasks: [],

    // 初始化设备数据
    initDeviceData(code) {
        this.devices[code] = {
            imageUrl: 'https://via.placeholder.com/300x180?text=' + code,
            status: '待机',
            assetCode: `ASSET-${code}`,
            code,
            name: '盖板全自动设备',
            workshop: 'C4车间',
            line: '51产线',
            category: '清洗机',
            model: '深圳序佑盖板全自动',
            vendor: '序佑',
            inDate: '2023-04-12',
            owner: '李工',
            section: 'CFOG段',
            qrText: `http://asset.example.com/device/${code}`
        };
    },

    // 获取设备详情
    getDeviceDetail(code) {
        if (!this.devices[code]) {
            this.initDeviceData(code);
        }
        return JSON.parse(JSON.stringify(this.devices[code]));
    },

    // 更新设备信息
    updateDevice(code, data) {
        if (this.devices[code]) {
            this.devices[code] = { ...this.devices[code], ...data };
            return true;
        }
        return false;
    },

    // 获取设备相关列表数据
    getDeviceLists(code) {
        const device = this.getDeviceDetail(code);
        const currentAreaId = device.status === '转移中' ? 42 : 40;

        // 区域映射表
        const areaMap = {
            1: 'C2车间',
            2: 'C2车间31产线',
            3: 'C2车间31产线CFOG段',
            4: 'C2车间31产线贴合段',
            5: 'C2车间31产线组装段',
            6: 'C2车间31产线30米线段',
            38: 'C4车间',
            39: 'C4车间51产线',
            40: 'C4车间51产线CFOG段',
            41: 'C4车间51产线贴合段',
            42: 'C4车间51产线组装段',
            43: 'C4车间51产线30米线段',
        };

        // BOM清单
        const bomList = [
            { areaId: currentAreaId, spareCode: 'SP001', spareName: '电机', usage: 2, stock: 15 },
            { areaId: currentAreaId, spareCode: 'SP002', spareName: '轴承', usage: 4, stock: 32 }
        ].map(item => ({
            ...item,
            areaName: areaMap[item.areaId] || `未知区域(${item.areaId})`
        }));

        // 模治具清单
        const mouldList = [
            { areaId: currentAreaId, mouldCode: 'M001', mouldName: '上模', usage: 1, stock: 8, productModel: 'P-1001' },
            { areaId: currentAreaId, mouldCode: 'M002', mouldName: '下模', usage: 1, stock: 6, productModel: 'P-1002' }
        ].map(item => ({
            ...item,
            areaName: areaMap[item.areaId] || `未知区域(${item.areaId})`
        }));

        // 生命周期履历
        const lifeCycleList = [
            { stage: '入库', areaId: 38, submitter: '张采购', submitTime: '2025-08-12 09:00',
                approver: '王经理', approveTime: '2025-08-12 10:00', remark: '新购入库' },
            { stage: '验收阶段', areaId: currentAreaId, submitter: '李工', submitTime: '2023-04-12 10:30',
                approver: '王经理', approveTime: '2023-04-12 11:30', remark: '验收合格' }
        ].map(item => ({
            ...item,
            areaName: areaMap[item.areaId] || `未知区域(${item.areaId})`
        }));

        // 点检任务
        const checkList = [
            { time: '08:00-08:30', areaId: currentAreaId, content: '检查电机温度', checker: '刘工', period: '早班', status: '待执行' }
        ].map(item => ({
            ...item,
            areaName: areaMap[item.areaId] || `未知区域(${item.areaId})`
        }));

        // 保养信息
        const maintainList = [
            { date: '2023-06-15', areaId: currentAreaId, content: '润滑保养', maintainer: '王技师', status: '已保养' }
        ].map(item => ({
            ...item,
            areaName: areaMap[item.areaId] || `未知区域(${item.areaId})`
        }));

        return { bomList, mouldList, lifeCycleList, checkList, maintainList };
    },

    // 创建审核任务
    createAuditTask(task) {
        const newTask = {
            id: 'T' + Date.now(),
            createTime: new Date().toISOString(),
            status: '待审核',
            initiator: 'admin', // 默认发起人
            ...task,
            attachments: task.attachments || [] // 确保附件数组存在
        };
        this.auditTasks.unshift(newTask);
        return newTask;
    },

    // 获取审核任务列表（支持分页）
    getAuditTasks(page = 1, pageSize = 10, status = '') {
        let filtered = this.auditTasks;
        if (status) {
            filtered = filtered.filter(task => task.status === status);
        }

        // 分页处理
        const total = filtered.length;
        const startIndex = (page - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        const list = filtered.slice(startIndex, endIndex);

        return {
            list,
            total,
            page,
            pageSize
        };
    },

    // 审核任务
    auditTask(taskId, result, approver, remark = '') {
        const task = this.auditTasks.find(t => t.id === taskId);
        if (task) {
            task.status = result ? '审核通过' : '审核拒绝';
            task.approver = approver;
            task.approveTime = new Date().toISOString();
            task.remark = remark;

            // 如果审核通过，更新设备状态
            if (result && task.taskType) {
                switch (task.taskType) {
                    case '验收':
                        this.updateDevice(task.deviceCode, { status: task.result === '合格' ? '正常' : '待维修' });
                        break;
                    case '转移':
                        this.updateDevice(task.deviceCode, {
                            status: '正常',
                            workshop: task.targetArea.split(' > ')[0],
                            line: task.targetArea.split(' > ')[1] || '',
                            section: task.targetArea.split(' > ')[2] || ''
                        });
                        break;
                    case '闲置':
                        this.updateDevice(task.deviceCode, { status: '闲置' });
                        break;
                    case '报废':
                        this.updateDevice(task.deviceCode, { status: '报废' });
                        break;
                }
            }

            return true;
        }
        return false;
    },

    resubmitTask(taskId) {
        const task = this.auditTasks.find(t => t.id === taskId);
        if (task) {
            task.status = '待审核';
            task.approver = '';
            task.approveTime = '';
            task.remark = '';
            return true;
        }
        return false;
    }
};

export default ckApiStore;
