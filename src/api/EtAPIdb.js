// 模拟数据库存储
let equipmentDatabase = []
let nextId = 1

// 初始化模拟数据
const initMockData = () => {
    const workshopOptions = ['C2', 'C3', 'C4', 'C5', 'C6']
    const segmentOptions = ['CFOG段', '贴合段', '组装段', '30米线段']
    const manufacturers = ['西门子', '发那科', '三菱', 'ABB', '安川']
    const categories = ['清洗机', 'COG机', 'FOG机', 'AOI机', '组装机']
    const statuses = ['running', 'standby', 'fault', 'offline']

    // 生成车间数据
    workshopOptions.forEach(workshop => {
        // 生成产线数据
        const startLine = parseInt(workshop.substring(1)) * 10 + 1
        for (let i = 1; i <= 6; i++) {
            const lineNo = startLine + i - 1

            // 生成工段数据
            segmentOptions.forEach(segment => {
                // 生成设备数据（每个工段下随机1-3台设备）
                const deviceCount = Math.floor(Math.random() * 3) + 1
                for (let j = 0; j < deviceCount; j++) {
                    const deviceId = nextId++
                    const deviceStatus = statuses[Math.floor(Math.random() * 4)]
                    const inspectionStatus = Math.random() > 0.3 ? 'done' : 'pending'

                    equipmentDatabase.push({
                        id: deviceId,
                        name: `设备${deviceId}`,
                        deviceCode: `DEV-${deviceId}`,
                        assetCode: `AST-${Math.floor(Math.random() * 10000)}`,
                        manufacturer: manufacturers[Math.floor(Math.random() * 5)],
                        category: categories[Math.floor(Math.random() * 5)],
                        model: `MOD-${Math.floor(Math.random() * 1000)}`,
                        status: deviceStatus,
                        inspectionStatus: inspectionStatus,
                        areaName: `${workshop}车间-${lineNo}产线-${segment}`,
                        production: Math.floor(Math.random() * 10000),
                        utilization: Math.floor(Math.random() * 100),
                        workshop: workshop,
                        line: lineNo,
                        segment: segment,
                        type: 'device'
                    })
                }
            })
        }
    })
}

// 初始化数据库
initMockData()

/**
 * 获取所有设备列表
 * @returns {Array} - 设备列表
 */
export const fetchEquipmentList = () => {
    return [...equipmentDatabase]
}

/**
 * 创建新设备
 * @param {Object} equipment - 设备信息
 */
export const createEquipment = (equipment) => {
    const newEquipment = {
        ...equipment,
        id: nextId++,
        type: 'device'
    }
    equipmentDatabase.push(newEquipment)
}

/**
 * 修改设备信息
 * @param {Object} equipment - 设备信息
 */
export const modifyEquipment = (equipment) => {
    const index = equipmentDatabase.findIndex(item => item.id === equipment.id)
    if (index !== -1) {
        equipmentDatabase[index] = {
            ...equipmentDatabase[index],
            ...equipment,
            type: 'device'
        }
    } else {
        throw new Error(`设备ID ${equipment.id} 不存在`)
    }
}

/**
 * 删除设备
 * @param {number} id - 设备ID
 */
export const removeEquipment = (id) => {
    const index = equipmentDatabase.findIndex(item => item.id === id)
    if (index !== -1) {
        equipmentDatabase.splice(index, 1)
    } else {
        throw new Error(`设备ID ${id} 不存在`)
    }
}

/**
 * 导出设备数据
 * @param {Object} params - 筛选参数
 */
export const exportEquipment = (params) => {
    // 实际项目中这里会处理导出逻辑
    console.log('导出设备数据，筛选参数:', params)
}

/**
 * 导入设备数据
 * @param {File} file - 导入的文件
 */
export const importEquipment = (file) => {
    // 实际项目中这里会处理导入逻辑
    console.log('导入设备数据，文件名:', file.name)
}

/**
 * 下载设备模板
 */
export const downloadTemplate = () => {
    // 实际项目中这里会处理下载模板逻辑
    console.log('下载设备模板')
}
