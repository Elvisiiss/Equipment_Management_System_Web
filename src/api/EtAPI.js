import {
    fetchEquipmentList,
    createEquipment,
    modifyEquipment,
    removeEquipment,
    exportEquipment,
    importEquipment,
    downloadTemplate
} from '@/api/EtAPIdb'

/**
 * 获取设备列表（带分页和筛选）
 * @param {Object} params - 查询参数
 * @returns {Promise} - 设备列表数据
 */
export const getEquipmentList = async (params) => {
    try {
        // 模拟API请求延迟
        await new Promise(resolve => setTimeout(resolve, 500))

        // 调用数据库层获取数据
        const allData = fetchEquipmentList()

        // 应用筛选条件
        let filteredData = [...allData]

        // 车间筛选
        if (params.workshop) {
            filteredData = filteredData.filter(item => item.workshop === params.workshop)
        }

        // 产线筛选
        if (params.line && params.line.length > 0) {
            filteredData = filteredData.filter(item => params.line.includes(item.line))
        }

        // 工段筛选
        if (params.segment && params.segment.length > 0) {
            filteredData = filteredData.filter(item => params.segment.includes(item.segment))
        }

        // 设备状态筛选
        if (params.status && params.status.length > 0) {
            filteredData = filteredData.filter(item => params.status.includes(item.status))
        }

        // 点检状态筛选
        if (params.inspectionStatus) {
            filteredData = filteredData.filter(item => item.inspectionStatus === params.inspectionStatus)
        }

        // 设备编码筛选
        if (params.deviceCode) {
            const code = params.deviceCode.toLowerCase()
            filteredData = filteredData.filter(item =>
                item.deviceCode && item.deviceCode.toLowerCase().includes(code)
            )
        }

        // 处理分页
        const total = filteredData.length
        const { page = 1, size = 20 } = params
        const startIndex = (page - 1) * size
        const endIndex = startIndex + size
        const paginatedData = filteredData.slice(startIndex, endIndex)

        // 构建树形结构
        const treeData = buildEquipmentTree(paginatedData)

        return {
            data: treeData,
            total,
            page,
            size
        }
    } catch (error) {
        console.error('获取设备列表失败:', error)
        throw error
    }
}

/**
 * 添加新设备
 * @param {Object} equipment - 设备信息
 * @returns {Promise} - 操作结果
 */
export const addEquipment = async (equipment) => {
    try {
        // 模拟API请求延迟
        await new Promise(resolve => setTimeout(resolve, 500))

        // 调用数据库层添加设备
        createEquipment(equipment)
        return true
    } catch (error) {
        console.error('添加设备失败:', error)
        throw error
    }
}

/**
 * 更新设备信息
 * @param {Object} equipment - 设备信息
 * @returns {Promise} - 操作结果
 */
export const updateEquipment = async (equipment) => {
    try {
        // 模拟API请求延迟
        await new Promise(resolve => setTimeout(resolve, 500))

        // 调用数据库层更新设备
        modifyEquipment(equipment)
        return true
    } catch (error) {
        console.error('更新设备失败:', error)
        throw error
    }
}

/**
 * 删除设备
 * @param {number} id - 设备ID
 * @returns {Promise} - 操作结果
 */
export const deleteEquipment = async (id) => {
    try {
        // 模拟API请求延迟
        await new Promise(resolve => setTimeout(resolve, 500))

        // 调用数据库层删除设备
        removeEquipment(id)
        return true
    } catch (error) {
        console.error('删除设备失败:', error)
        throw error
    }
}

/**
 * 导出设备数据
 * @param {Object} params - 筛选参数
 * @returns {Promise} - 操作结果
 */
export const exportEquipmentData = async (params) => {
    try {
        // 模拟API请求延迟
        await new Promise(resolve => setTimeout(resolve, 1000))

        // 调用数据库层导出数据
        exportEquipment(params)
        return true
    } catch (error) {
        console.error('导出设备数据失败:', error)
        throw error
    }
}

/**
 * 导入设备数据
 * @param {File} file - 导入的文件
 * @returns {Promise} - 操作结果
 */
export const importEquipmentData = async (file) => {
    try {
        // 模拟API请求延迟
        await new Promise(resolve => setTimeout(resolve, 1500))

        // 调用数据库层导入数据
        importEquipment(file)
        return true
    } catch (error) {
        console.error('导入设备数据失败:', error)
        throw error
    }
}



/**
 * 下载设备模板
 * @returns {Promise} - 操作结果
 */
export const downloadEquipmentTemplate = async () => {
    try {
        // 模拟API请求延迟
        await new Promise(resolve => setTimeout(resolve, 500))

        // 调用数据库层下载模板
        downloadTemplate()
        return true
    } catch (error) {
        console.error('下载模板失败:', error)
        throw error
    }
}

/**
 * 构建设备树形结构
 * @param {Array} data - 扁平设备数据
 * @returns {Array} - 树形结构数据
 */
function buildEquipmentTree(data) {
    // 按车间、产线、工段分组
    const workshopMap = {}

    data.forEach(item => {
        // 确保只处理设备类型
        if (item.type !== 'device') return

        // 处理车间
        if (!workshopMap[item.workshop]) {
            workshopMap[item.workshop] = {
                id: `ws-${item.workshop}`,
                name: item.workshop,
                type: 'workshop',
                children: {}
            }
        }
        const workshop = workshopMap[item.workshop]

        // 处理产线
        if (!workshop.children[item.line]) {
            workshop.children[item.line] = {
                id: `line-${item.workshop}-${item.line}`,
                name: item.line,
                type: 'line',
                children: {}
            }
        }
        const line = workshop.children[item.line]

        // 处理工段
        if (!line.children[item.segment]) {
            line.children[item.segment] = {
                id: `seg-${item.workshop}-${item.line}-${item.segment}`,
                name: item.segment,
                type: 'segment',
                children: []
            }
        }
        const segment = line.children[item.segment]

        // 添加设备
        segment.children.push(item)
    })

    // 转换为数组结构
    return Object.values(workshopMap).map(workshop => ({
        ...workshop,
        children: Object.values(workshop.children).map(line => ({
            ...line,
            children: Object.values(line.children)
        }))
    }))
}
