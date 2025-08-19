// 生成模拟设备列表
const generateDeviceList = (params) => {
    const workshops = ['C2', 'C3', 'C4', 'C5', 'C6']
    const lines = ['31', '32', '33', '34', '35', '36', '41', '42', '43', '44', '45', '46']
    const segments = ['CFOG段', '贴合段', '组装段', '30米线段']
    const names = [
        '精密清洗设备', '全自动COG机', '高精度FOG机', '视觉检测设备',
        '智能组装机', '高速贴片机', '自动点胶机', '回流焊设备'
    ]
    const models = ['X-2000', 'ProMax 3000', 'Ultra 5', 'SuperClean', 'Fusion-X', 'Quantum', 'Precision 8', 'Sprint 500']
    const statuses = ['运行中', '待机中', '故障中', '维护中']

    let deviceList = []
    const total = 32 // 总设备数

    // 应用筛选条件
    const filteredWorkshops = params.workshop ? [params.workshop] : workshops

    for (let i = 0; i < total; i++) {
        const workshop = filteredWorkshops[Math.floor(Math.random() * filteredWorkshops.length)]
        const name = names[Math.floor(Math.random() * names.length)]
        const model = models[Math.floor(Math.random() * models.length)]

        // 应用名称和型号筛选
        if (params.name && !name.includes(params.name)) continue
        if (params.model && !model.includes(params.model)) continue

        deviceList.push({
            id: i + 1,
            name,
            deviceCode: `DEV-${workshop}-${1000 + i}`,
            workshop,
            line: lines[Math.floor(Math.random() * lines.length)],
            segment: segments[Math.floor(Math.random() * segments.length)],
            model,
            status: statuses[Math.floor(Math.random() * statuses.length)],
            output: Math.floor(Math.random() * 10000) + 5000,
            yieldRate: (Math.random() * 5 + 95).toFixed(1),
            alarmCount: Math.floor(Math.random() * 5),
            lastUpdate: new Date(Date.now() - Math.floor(Math.random() * 3600000)).toLocaleTimeString()
        })
    }

    // 分页处理
    const start = (params.page - 1) * params.size
    const end = start + params.size
    const paginatedList = deviceList.slice(start, end)

    return {
        list: paginatedList,
        total: deviceList.length,
        page: params.page,
        size: params.size
    }
}

// 生成设备详情
const generateDeviceDetail = (deviceId) => {
    // 产量及状态参数
    const output = [
        { id: 1, param: 'O001', description: '今日产量', value: Math.floor(Math.random() * 5000) + 10000, unit: 'pcs', isAlarm: false, isWarning: false, updateTime: new Date().toLocaleString() },
        { id: 2, param: 'O002', description: '昨日产量', value: Math.floor(Math.random() * 5000) + 10000, unit: 'pcs', isAlarm: false, isWarning: false, updateTime: new Date().toLocaleString() },
        { id: 3, param: 'O003', description: '本月累计', value: Math.floor(Math.random() * 50000) + 200000, unit: 'pcs', isAlarm: false, isWarning: false, updateTime: new Date().toLocaleString() },
        { id: 4, param: 'O004', description: '生产效率', value: (Math.random() * 20 + 80).toFixed(1), unit: '%', isAlarm: false, isWarning: false, updateTime: new Date().toLocaleString() },
        { id: 5, param: 'O005', description: '设备利用率', value: (Math.random() * 30 + 60).toFixed(1), unit: '%', isAlarm: false, isWarning: Math.random() > 0.7, updateTime: new Date().toLocaleString() },
        { id: 6, param: 'O006', description: '运行时长', value: (Math.random() * 10 + 10).toFixed(1), unit: 'h', isAlarm: false, isWarning: false, updateTime: new Date().toLocaleString() },
        { id: 7, param: 'O007', description: '停机时长', value: (Math.random() * 2 + 0.1).toFixed(1), unit: 'h', isAlarm: Math.random() > 0.8, isWarning: Math.random() > 0.7, updateTime: new Date().toLocaleString() },
        { id: 8, param: 'O008', description: '计划达成率', value: (Math.random() * 10 + 85).toFixed(1), unit: '%', isAlarm: false, isWarning: Math.random() > 0.8, updateTime: new Date().toLocaleString() }
    ]

    // 报警参数
    const alarmParams = [
        { id: 1, param: 'P001', description: '清洁升降气缸压力异常', value: '0.85', unit: 'MPa', isAlarm: true, isWarning: false, updateTime: new Date().toLocaleString() },
        { id: 2, param: 'P002', description: '保压升降气缸位置偏差过大', value: '1.2', unit: 'mm', isAlarm: false, isWarning: true, updateTime: new Date().toLocaleString() },
        { id: 3, param: 'P003', description: '下料翻转破真空B超时', value: '超时', unit: '', isAlarm: true, isWarning: false, updateTime: new Date().toLocaleString() },
        { id: 4, param: 'P004', description: '清洁平移气缸速度异常', value: '120', unit: 'mm/s', isAlarm: true, isWarning: false, updateTime: new Date().toLocaleString() },
        { id: 5, param: 'P005', description: '加热板温度偏差过大', value: '5.2', unit: '℃', isAlarm: false, isWarning: true, updateTime: new Date().toLocaleString() },
        { id: 6, param: 'P006', description: '真空度不足', value: '-85', unit: 'kPa', isAlarm: true, isWarning: false, updateTime: new Date().toLocaleString() },
        { id: 7, param: 'P007', description: '传送带电机过载', value: '125', unit: '%', isAlarm: true, isWarning: false, updateTime: new Date().toLocaleString() },
        { id: 8, param: 'P008', description: '冷却水流量不足', value: '8.5', unit: 'L/min', isAlarm: false, isWarning: true, updateTime: new Date().toLocaleString() }
    ]

    // 关键参数
    const keyParams = [
        { id: 1, param: 'T001', description: '热压头温度', value: '182.5', unit: '℃', isAlarm: false, isWarning: false, updateTime: new Date().toLocaleString() },
        { id: 2, param: 'P101', description: '热压压力', value: '45.2', unit: 'MPa', isAlarm: false, isWarning: false, updateTime: new Date().toLocaleString() },
        { id: 3, param: 'T002', description: '冷却温度', value: '24.8', unit: '℃', isAlarm: false, isWarning: false, updateTime: new Date().toLocaleString() },
        { id: 4, param: 'V001', description: '传送带速度', value: '12.5', unit: 'm/min', isAlarm: false, isWarning: true, updateTime: new Date().toLocaleString() },
        { id: 5, param: 'A001', description: '对位精度', value: '0.012', unit: 'mm', isAlarm: false, isWarning: false, updateTime: new Date().toLocaleString() },
        { id: 6, param: 'S001', description: '伺服电机转速', value: '1500', unit: 'rpm', isAlarm: false, isWarning: false, updateTime: new Date().toLocaleString() },
        { id: 7, param: 'L001', description: '激光功率', value: '85', unit: '%', isAlarm: false, isWarning: true, updateTime: new Date().toLocaleString() },
        { id: 8, param: 'F001', description: '气流速度', value: '5.2', unit: 'm/s', isAlarm: false, isWarning: false, updateTime: new Date().toLocaleString() }
    ]

    // 非关键参数
    const nonKeyParams = [
        { id: 1, param: 'H001', description: '设备运行时间', value: Math.floor(Math.random() * 1000) + 2000, unit: 'h', isAlarm: false, isWarning: false, updateTime: new Date().toLocaleString() },
        { id: 2, param: 'E001', description: '能耗', value: (Math.random() * 10 + 25).toFixed(1), unit: 'kWh', isAlarm: false, isWarning: false, updateTime: new Date().toLocaleString() },
        { id: 3, param: 'C001', description: '环境温度', value: (Math.random() * 5 + 23).toFixed(1), unit: '℃', isAlarm: false, isWarning: false, updateTime: new Date().toLocaleString() },
        { id: 4, param: 'C002', description: '环境湿度', value: Math.floor(Math.random() * 10) + 40, unit: '%', isAlarm: false, isWarning: false, updateTime: new Date().toLocaleString() },
        { id: 5, param: 'V002', description: '气源压力', value: (Math.random() * 0.1 + 0.6).toFixed(2), unit: 'MPa', isAlarm: false, isWarning: false, updateTime: new Date().toLocaleString() },
        { id: 6, param: 'W001', description: '用水量', value: (Math.random() * 50 + 100).toFixed(1), unit: 'L', isAlarm: false, isWarning: false, updateTime: new Date().toLocaleString() },
        { id: 7, param: 'N001', description: '噪音水平', value: (Math.random() * 5 + 65).toFixed(1), unit: 'dB', isAlarm: false, isWarning: Math.random() > 0.8, updateTime: new Date().toLocaleString() },
        { id: 8, param: 'D001', description: '振动频率', value: (Math.random() * 2 + 10).toFixed(1), unit: 'Hz', isAlarm: false, isWarning: false, updateTime: new Date().toLocaleString() }
    ]

    // SOP参数
    const sop = [
        { id: 1, param: 'SOP001', description: '开机检查完成度', value: '100', unit: '%', isAlarm: false, isWarning: false, updateTime: new Date().toLocaleString() },
        { id: 2, param: 'SOP002', description: '参数设置合规性', value: '100', unit: '%', isAlarm: false, isWarning: false, updateTime: new Date().toLocaleString() },
        { id: 3, param: 'SOP003', description: '材料装载规范性', value: '95', unit: '%', isAlarm: false, isWarning: true, updateTime: new Date().toLocaleString() },
        { id: 4, param: 'SOP004', description: '安全装置检查', value: '100', unit: '%', isAlarm: false, isWarning: false, updateTime: new Date().toLocaleString() },
        { id: 5, param: 'SOP005', description: '维护周期合规性', value: '80', unit: '%', isAlarm: false, isWarning: true, updateTime: new Date().toLocaleString() },
        { id: 6, param: 'SOP006', description: '记录完整性', value: '90', unit: '%', isAlarm: false, isWarning: false, updateTime: new Date().toLocaleString() },
        { id: 7, param: 'SOP007', description: '停机操作规范性', value: '100', unit: '%', isAlarm: false, isWarning: false, updateTime: new Date().toLocaleString() },
        { id: 8, param: 'SOP008', description: '异常处理及时性', value: '75', unit: '%', isAlarm: true, isWarning: false, updateTime: new Date().toLocaleString() }
    ]

    return {
        id: deviceId,
        name: `设备 ${deviceId}`,
        deviceCode: `DEV-${['C2', 'C3', 'C4', 'C5', 'C6'][deviceId % 5]}-${1000 + deviceId}`,
        workshop: ['C2', 'C3', 'C4', 'C5', 'C6'][deviceId % 5],
        line: ['31', '32', '33', '34', '35', '36'][deviceId % 6],
        segment: ['CFOG段', '贴合段', '组装段', '30米线段'][deviceId % 4],
        model: ['X-2000', 'ProMax 3000', 'Ultra 5', 'SuperClean'][deviceId % 4],
        status: ['运行中', '待机中', '故障中', '维护中'][deviceId % 4],
        output,          // 产量及状态参数
        alarmParams,     // 报警参数
        keyParams,       // 关键参数
        nonKeyParams,    // 非关键参数
        sop              // SOP参数
    }
}

// 获取SPC设备列表
export const getSPCDeviceListDB = (params) => {
    return generateDeviceList(params)
}

// 获取SPC设备详情
export const getSPCDeviceDetailDB = (deviceId) => {
    return generateDeviceDetail(deviceId)
}
