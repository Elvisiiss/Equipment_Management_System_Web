// 生成模拟设备数据
export const generateMockData = () => {
    const categories = ['清洗机', 'COG机', 'FOG机', 'AOI机', '组装机']
    const statuses = ['已验收', '待验收', '样机', '闲置']
    const manufacturers = ['三星电子', '索尼', '松下', '西门子', '华为', '中兴', '京东方', '天马微电子']
    const models = ['X-2000', 'ProMax 3000', 'Ultra 5', 'SuperClean', 'Fusion-X', 'Quantum']
    const names = ['精密清洗设备', '全自动COG机', '高精度FOG机', '视觉检测设备', '智能组装机', '高速贴片机']
    const people = ['张三', '李四', '王五', '赵六', '钱七', '孙八']
    const lifespans = [1, 2, 3, 4, 5]

    const devices = []
    let idCounter = 1
    const workshops = ['C2', 'C3', 'C4', 'C5', 'C6']
    const lineMap = {
        'C2': ['31', '32', '33', '34', '35', '36'],
        'C3': ['41', '42', '43', '44', '45', '46'],
        'C4': ['51', '52', '53', '54', '55', '56'],
        'C5': ['61', '62', '63', '64', '65', '66'],
        'C6': ['71', '72', '73', '74', '75', '76']
    }
    const segments = ['CFOG段', '贴合段', '组装段', '30米线段']

    // 生成车间/产线/工段关联数据
    workshops.forEach(workshop => {
        // 车间直属设备
        const workshopDevCount = Math.floor(Math.random() * 3) + 1
        for (let i = 0; i < workshopDevCount; i++) {
            devices.push({
                id: idCounter++,
                workshop,
                line: null,
                segment: null,
                name: names[Math.floor(Math.random() * names.length)],
                deviceCode: `DEV-${workshop}-${1000 + i}`,
                assetCode: `AST-${Math.floor(Math.random() * 10000)}`,
                manufacturer: manufacturers[Math.floor(Math.random() * manufacturers.length)],
                category: categories[Math.floor(Math.random() * categories.length)],
                model: models[Math.floor(Math.random() * models.length)],
                status: statuses[Math.floor(Math.random() * statuses.length)],
                lifespan: lifespans[Math.floor(Math.random() * lifespans.length)],
                inTime: `2023-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
                inCharge: people[Math.floor(Math.random() * people.length)],
                acceptTime: Math.random() > 0.3 ? `2023-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}` : '',
                acceptor: Math.random() > 0.3 ? people[Math.floor(Math.random() * people.length)] : '',
                type: 'device'
            })
        }

        // 产线-工段关联设备
        lineMap[workshop].forEach(line => {
            segments.forEach(segment => {
                const segDevCount = 1 + Math.floor(Math.random() * 3)
                for (let i = 0; i < segDevCount; i++) {
                    devices.push({
                        id: idCounter++,
                        workshop,
                        line,
                        segment,
                        name: names[Math.floor(Math.random() * names.length)],
                        deviceCode: `DEV-${workshop}-${line}-${segment.substring(0, 2)}-${100 + i}`,
                        assetCode: `AST-${Math.floor(Math.random() * 10000)}`,
                        manufacturer: manufacturers[Math.floor(Math.random() * manufacturers.length)],
                        category: categories[Math.floor(Math.random() * categories.length)],
                        model: models[Math.floor(Math.random() * models.length)],
                        status: statuses[Math.floor(Math.random() * statuses.length)],
                        lifespan: lifespans[Math.floor(Math.random() * lifespans.length)],
                        inTime: `2023-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
                        inCharge: people[Math.floor(Math.random() * people.length)],
                        acceptTime: Math.random() > 0.3 ? `2023-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}` : '',
                        acceptor: Math.random() > 0.3 ? people[Math.floor(Math.random() * people.length)] : '',
                        type: 'device'
                    })
                }
            })
        })
    })

    return devices
}

// 获取所有设备数据
export const getAllDevices = () => {
    // 模拟异步请求
    return new Promise(resolve => {
        setTimeout(() => {
            resolve(generateMockData())
        }, 300)
    })
}

// 根据ID获取设备
export const getDeviceById = (id) => {
    return new Promise(resolve => {
        getAllDevices().then(devices => {
            const device = devices.find(d => d.id === id)
            resolve(device)
        })
    })
}

// 保存设备（新增或更新）
export const saveDevice = (device) => {
    return new Promise(resolve => {
        setTimeout(() => {
            // 模拟保存操作
            resolve({ success: true, data: device })
        }, 300)
    })
}

// 删除设备
export const deleteDevice = (id) => {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve({ success: true })
        }, 300)
    })
}
