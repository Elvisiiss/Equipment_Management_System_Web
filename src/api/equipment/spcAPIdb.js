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
    // 报警参数
    const alarmParams = [
        { id: 1, param: 'P001', description: '清洁升降气缸压力异常', value: '0.85', unit: 'MPa', isAlarm: true, updateTime: new Date().toLocaleString() },
        { id: 2, param: 'P002', description: '保压升降气缸位置偏差过大', value: '1.2', unit: 'mm', isAlarm: false, updateTime: new Date().toLocaleString() },
        { id: 3, param: 'P003', description: '下料翻转破真空B超时', value: '超时', unit: '', isAlarm: true, updateTime: new Date().toLocaleString() },
        { id: 4, param: 'P004', description: '清洁平移气缸速度异常', value: '120', unit: 'mm/s', isAlarm: true, updateTime: new Date().toLocaleString() },
        { id: 5, param: 'P005', description: '加热板温度偏差过大', value: '5.2', unit: '℃', isAlarm: false, updateTime: new Date().toLocaleString() },
        { id: 6, param: 'P006', description: '真空度不足', value: '-85', unit: 'kPa', isAlarm: true, updateTime: new Date().toLocaleString() },
        { id: 7, param: 'P007', description: '传送带电机过载', value: '125', unit: '%', isAlarm: true, updateTime: new Date().toLocaleString() },
        { id: 8, param: 'P008', description: '冷却水流量不足', value: '8.5', unit: 'L/min', isAlarm: false, updateTime: new Date().toLocaleString() }
    ]

    // 关键参数
    const keyParams = [
        { id: 1, param: 'T001', description: '热压头温度', value: '182.5', unit: '℃', standard: '180', range: '±5℃', isWarning: false, updateTime: new Date().toLocaleString() },
        { id: 2, param: 'P101', description: '热压压力', value: '45.2', unit: 'MPa', standard: '45', range: '40-50MPa', isWarning: false, updateTime: new Date().toLocaleString() },
        { id: 3, param: 'T002', description: '冷却温度', value: '24.8', unit: '℃', standard: '25', range: '20-30℃', isWarning: false, updateTime: new Date().toLocaleString() },
        { id: 4, param: 'V001', description: '传送带速度', value: '12.5', unit: 'm/min', standard: '12.8', range: '12.0-13.5m/min', isWarning: true, updateTime: new Date().toLocaleString() },
        { id: 5, param: 'A001', description: '对位精度', value: '0.012', unit: 'mm', standard: '0.010', range: '≤0.015mm', isWarning: false, updateTime: new Date().toLocaleString() }
    ]

    // 非关键参数
    const nonKeyParams = [
        { id: 1, param: 'H001', description: '设备运行时间', value: '2568', unit: 'h', updateTime: new Date().toLocaleString() },
        { id: 2, param: 'E001', description: '能耗', value: '32.5', unit: 'kWh', updateTime: new Date().toLocaleString() },
        { id: 3, param: 'C001', description: '环境温度', value: '25.5', unit: '℃', updateTime: new Date().toLocaleString() },
        { id: 4, param: 'C002', description: '环境湿度', value: '45', unit: '%', updateTime: new Date().toLocaleString() },
        { id: 5, param: 'V002', description: '气源压力', value: '0.65', unit: 'MPa', updateTime: new Date().toLocaleString() }
    ]

    // SOP看板
    const sop = {
        activeStep: 3,
        steps: [
            { title: '开机准备', description: '检查设备状态，确认各安全装置正常' },
            { title: '参数设定', description: '根据生产计划设定设备参数' },
            { title: '材料装载', description: '将原材料正确装载到指定位置' },
            { title: '启动运行', description: '启动设备，监控初始运行状态' },
            { title: '过程监控', description: '持续监控设备运行参数和产品质量' },
            { title: '完成停机', description: '完成生产后按规程关闭设备' },
            { title: '清洁维护', description: '清洁设备并进行日常维护' }
        ],
        attachments: [
            { id: 1, name: '设备操作手册_V2.3.pdf' },
            { id: 2, name: '安全操作规程.docx' },
            { id: 3, name: '维护保养计划表.xlsx' }
        ]
    }

    // 产量及状态
    const outputMetrics = {
        todayOutput: 12500,
        todayChange: 2.5,
        yieldRate: 98.7,
        yieldChange: 0.3,
        runningHours: 18.5,
        oee: 85.2
    }

    return {
        id: deviceId,
        name: `设备 ${deviceId}`,
        deviceCode: `DEV-${deviceId}`,
        workshop: ['C2', 'C3', 'C4', 'C5', 'C6'][deviceId % 5],
        line: ['31', '32', '33', '34', '35', '36'][deviceId % 6],
        segment: ['CFOG段', '贴合段', '组装段', '30米线段'][deviceId % 4],
        model: ['X-2000', 'ProMax 3000', 'Ultra 5', 'SuperClean'][deviceId % 4],
        status: ['运行中', '待机中', '故障中', '维护中'][deviceId % 4],
        alarmParams,
        keyParams,
        nonKeyParams,
        sop,
        outputMetrics
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
