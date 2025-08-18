import { getAllDevices, getDeviceById, saveDevice, deleteDevice } from './eqAPIdb'

// 构建树形表格数据（车间→产线→工段→设备）
const buildTreeData = (devices) => {
    const tree = []
    let nodeIdCounter = 10000 // 非设备节点ID（避免与设备ID冲突）
    const workshops = ['C2', 'C3', 'C4', 'C5', 'C6']
    const lineMap = {
        'C2': ['31', '32', '33', '34', '35', '36'],
        'C3': ['41', '42', '43', '44', '45', '46'],
        'C4': ['51', '52', '53', '54', '55', '56'],
        'C5': ['61', '62', '63', '64', '65', '66'],
        'C6': ['71', '72', '73', '74', '75', '76']
    }
    const segments = ['CFOG段', '贴合段', '组装段', '30米线段']

    workshops.forEach(workshop => {
        // 车间节点
        const workshopNode = {
            id: nodeIdCounter++,
            name: workshop,
            type: 'workshop',
            children: []
        }

        // 车间直属设备
        const workshopDevs = devices.filter(d => d.workshop === workshop && !d.line && !d.segment)
        if (workshopDevs.length > 0) workshopNode.children.push(...workshopDevs)

        // 产线节点
        lineMap[workshop].forEach(line => {
            const lineDevs = devices.filter(d => d.workshop === workshop && d.line === line)
            if (lineDevs.length === 0) return

            const lineNode = {
                id: nodeIdCounter++,
                name: line,
                type: 'line',
                children: []
            }

            // 工段节点
            segments.forEach(segment => {
                const segDevs = lineDevs.filter(d => d.segment === segment)
                if (segDevs.length === 0) return

                lineNode.children.push({
                    id: nodeIdCounter++,
                    name: segment,
                    type: 'segment',
                    children: segDevs
                })
            })

            workshopNode.children.push(lineNode)
        })

        tree.push(workshopNode)
    })

    return tree
}

// 获取分页数据
export const getDevicesByPage = (params) => {
    const { page, size, filterForm } = params
    return new Promise(resolve => {
        getAllDevices().then(allDevices => {
            // 应用筛选条件
            let filteredDevs = [...allDevices]
            const { deviceCode, status, name, manufacturer, lifespan, workshop, line, segment } = filterForm

            if (deviceCode) filteredDevs = filteredDevs.filter(d => d.deviceCode.includes(deviceCode))
            if (name) filteredDevs = filteredDevs.filter(d => d.name.includes(name)) // Add name filter
            if (status.length > 0) filteredDevs = filteredDevs.filter(d => status.includes(d.status))
            if (manufacturer) filteredDevs = filteredDevs.filter(d => d.manufacturer.includes(manufacturer))
            if (lifespan) filteredDevs = filteredDevs.filter(d => String(d.lifespan) === lifespan)
            if (workshop) filteredDevs = filteredDevs.filter(d => d.workshop === workshop)
            if (line && line.length > 0) filteredDevs = filteredDevs.filter(d => line.includes(d.line))
            if (segment && segment.length > 0) filteredDevs = filteredDevs.filter(d => segment.includes(d.segment))

            // 计算分页
            const total = filteredDevs.length
            const startIndex = (page - 1) * size
            const endIndex = Math.min(startIndex + size, total)
            const paginatedDevs = filteredDevs.slice(startIndex, endIndex)

            // 构建树形数据
            const treeData = buildTreeData(paginatedDevs)

            resolve({
                total,
                list: treeData,
                page,
                size
            })
        })
    })
}

// 获取设备详情
export const getDeviceDetail = (id) => {
    return getDeviceById(id)
}

// 新增设备
export const addDevice = (device) => {
    return saveDevice(device)
}

// 更新设备
export const updateDevice = (device) => {
    return saveDevice(device)
}

// 删除设备
export const removeDevice = (id) => {
    return deleteDevice(id)
}

// 获取车间选项
export const getWorkshopOptions = () => {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve(['C2', 'C3', 'C4', 'C5', 'C6'])
        }, 100)
    })
}

// 根据车间获取产线选项
export const getLineOptionsByWorkshop = (workshop) => {
    return new Promise(resolve => {
        setTimeout(() => {
            const lineMap = {
                'C2': ['31', '32', '33', '34', '35', '36'],
                'C3': ['41', '42', '43', '44', '45', '46'],
                'C4': ['51', '52', '53', '54', '55', '56'],
                'C5': ['61', '62', '63', '64', '65', '66'],
                'C6': ['71', '72', '73', '74', '75', '76']
            }
            resolve(lineMap[workshop] || [])
        }, 100)
    })
}

// 获取工段选项
export const getSegmentOptions = () => {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve(['CFOG段', '贴合段', '组装段', '30米线段'])
        }, 100)
    })
}
