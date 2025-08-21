// 模拟数据库操作
let warehouses = [
    { id: 1, name: '主仓库', location: '一楼', type: 'main' },
    { id: 2, name: '五楼线边仓', location: '五楼', type: 'sub' }
];

let shelves = [
    { id: 1, warehouseId: 1, code: 'A01', location: 'A区第1排', description: '存放小型零件' },
    { id: 2, warehouseId: 1, code: 'A02', location: 'A区第2排', description: '存放电子元件' },
    { id: 3, warehouseId: 2, code: 'B01', location: 'B区第1排', description: '五楼常用零件' }
];

let partTypes = [
    { id: 1, name: '电池', description: '各种型号电池' },
    { id: 2, name: '螺丝', description: '各种规格螺丝' },
    { id: 3, name: '发动机', description: '各种型号发动机' }
];

let parts = [
    {
        id: 1,
        name: '三号电池',
        typeId: 1,
        brand: '南孚',
        specification: 'AAA',
        hasUniqueCode: false,
        totalQuantity: 300,
        availableQuantity: 280,
        minStock: 50,
        shelfId: 2
    },
    {
        id: 2,
        name: '六号电池',
        typeId: 1,
        brand: '松下',
        specification: 'AA',
        hasUniqueCode: false,
        totalQuantity: 100,
        availableQuantity: 95,
        minStock: 30,
        shelfId: 2
    },
    {
        id: 3,
        name: '标准螺丝',
        typeId: 2,
        brand: '标准件',
        specification: 'M3x10',
        hasUniqueCode: false,
        totalQuantity: 500,
        availableQuantity: 85,
        minStock: 100,
        shelfId: 1
    },
    {
        id: 4,
        name: '发动机',
        typeId: 3,
        brand: '康明斯',
        specification: 'X15-2022',
        hasUniqueCode: true,
        totalQuantity: 5,
        availableQuantity: 3,
        minStock: 1,
        shelfId: 1,
        uniqueCodes: ['ENG-001', 'ENG-002', 'ENG-003', 'ENG-004', 'ENG-005']
    }
];

let borrowRecords = [
    {
        id: 1,
        partId: 1,
        quantity: 20,
        borrower: '张三',
        borrowerDepartment: '生产一部',
        borrowTime: '2023-05-10 09:30:25',
        expectedReturnTime: '2023-05-17 09:30:25',
        actualReturnTime: null,
        status: '借用中',
        operator: '管理员A'
    },
    {
        id: 2,
        partId: 4,
        uniqueCode: 'ENG-001',
        quantity: 1,
        borrower: '李四',
        borrowerDepartment: '维修部',
        borrowTime: '2023-05-15 14:20:10',
        expectedReturnTime: '2023-05-22 14:20:10',
        actualReturnTime: null,
        status: '借用中',
        operator: '管理员B'
    }
];

let lifecycleRecords = [
    {
        id: 1,
        partId: 4,
        uniqueCode: 'ENG-001',
        eventType: '采购入库',
        eventTime: '2022-03-10 10:00:00',
        operator: '采购员A',
        description: '新采购发动机入库',
        location: '主仓库'
    },
    {
        id: 2,
        partId: 4,
        uniqueCode: 'ENG-001',
        eventType: '安装使用',
        eventTime: '2022-04-15 09:30:00',
        operator: '技术员B',
        description: '安装到生产线A',
        location: '生产线A'
    },
    {
        id: 3,
        partId: 4,
        uniqueCode: 'ENG-001',
        eventType: '拆卸送修',
        eventTime: '2022-10-20 14:25:00',
        operator: '技术员C',
        description: '发动机故障送修',
        location: '维修车间'
    },
    {
        id: 4,
        partId: 4,
        uniqueCode: 'ENG-001',
        eventType: '维修完成',
        eventTime: '2022-11-05 11:10:00',
        operator: '维修员D',
        description: '发动机维修完成返回仓库',
        location: '主仓库'
    }
];

// 模拟API调用延迟
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const partsAPI = {
    // 仓库相关API
    async getWarehouses() {
        await delay(300);
        return [...warehouses];
    },

    async addWarehouse(warehouse) {
        await delay(300);
        const newWarehouse = {
            id: Date.now(),
            ...warehouse
        };
        warehouses.push(newWarehouse);
        return newWarehouse;
    },

    async updateWarehouse(id, updates) {
        await delay(300);
        const index = warehouses.findIndex(w => w.id === id);
        if (index !== -1) {
            warehouses[index] = { ...warehouses[index], ...updates };
            return warehouses[index];
        }
        throw new Error('仓库不存在');
    },

    async deleteWarehouse(id) {
        await delay(300);
        const index = warehouses.findIndex(w => w.id === id);
        if (index !== -1) {
            return warehouses.splice(index, 1)[0];
        }
        throw new Error('仓库不存在');
    },

    // 货架相关API
    async getShelves(warehouseId = null) {
        await delay(300);
        let result = [...shelves];
        if (warehouseId) {
            result = result.filter(s => s.warehouseId === warehouseId);
        }
        return result;
    },

    async addShelf(shelf) {
        await delay(300);
        const newShelf = {
            id: Date.now(),
            ...shelf
        };
        shelves.push(newShelf);
        return newShelf;
    },

    async updateShelf(id, updates) {
        await delay(300);
        const index = shelves.findIndex(s => s.id === id);
        if (index !== -1) {
            shelves[index] = { ...shelves[index], ...updates };
            return shelves[index];
        }
        throw new Error('货架不存在');
    },

    async deleteShelf(id) {
        await delay(300);
        const index = shelves.findIndex(s => s.id === id);
        if (index !== -1) {
            return shelves.splice(index, 1)[0];
        }
        throw new Error('货架不存在');
    },

    // 备件类型相关API
    async getPartTypes() {
        await delay(300);
        return [...partTypes];
    },

    // 备件相关API
    async getParts(filters = {}) {
        await delay(300);
        let result = [...parts];

        if (filters.typeId) {
            result = result.filter(p => p.typeId === filters.typeId);
        }

        if (filters.warehouseId) {
            // 先获取该仓库的所有货架
            const warehouseShelves = shelves.filter(s => s.warehouseId === filters.warehouseId);
            const shelfIds = warehouseShelves.map(s => s.id);
            result = result.filter(p => shelfIds.includes(p.shelfId));
        }

        if (filters.hasUniqueCode !== undefined) {
            result = result.filter(p => p.hasUniqueCode === filters.hasUniqueCode);
        }

        if (filters.lowStock) {
            result = result.filter(p => p.availableQuantity <= p.minStock);
        }

        return result;
    },

    async getPart(id) {
        await delay(300);
        const part = parts.find(p => p.id === id);
        if (!part) throw new Error('备件不存在');
        return { ...part };
    },

    async addPart(part) {
        await delay(300);
        const newPart = {
            id: Date.now(),
            ...part
        };
        parts.push(newPart);
        return newPart;
    },

    async updatePart(id, updates) {
        await delay(300);
        const index = parts.findIndex(p => p.id === id);
        if (index !== -1) {
            parts[index] = { ...parts[index], ...updates };
            return parts[index];
        }
        throw new Error('备件不存在');
    },

    async deletePart(id) {
        await delay(300);
        const index = parts.findIndex(p => p.id === id);
        if (index !== -1) {
            return parts.splice(index, 1)[0];
        }
        throw new Error('备件不存在');
    },

    // 借用记录相关API
    async getBorrowRecords(filters = {}) {
        await delay(300);
        let result = [...borrowRecords];

        if (filters.partId) {
            result = result.filter(r => r.partId === filters.partId);
        }

        if (filters.status) {
            result = result.filter(r => r.status === filters.status);
        }

        return result;
    },

    async addBorrowRecord(record) {
        await delay(300);
        const newRecord = {
            id: Date.now(),
            borrowTime: new Date().toLocaleString(),
            status: '借用中',
            ...record
        };

        // 更新库存
        const partIndex = parts.findIndex(p => p.id === record.partId);
        if (partIndex !== -1) {
            if (parts[partIndex].hasUniqueCode) {
                // 对于有唯一编码的备件，需要标记特定编码为已借出
                const codeIndex = parts[partIndex].uniqueCodes.indexOf(record.uniqueCode);
                if (codeIndex !== -1) {
                    parts[partIndex].uniqueCodes.splice(codeIndex, 1);
                    parts[partIndex].availableQuantity -= 1;
                }
            } else {
                // 对于普通备件，直接减少可用数量
                parts[partIndex].availableQuantity -= record.quantity;
            }
        }

        borrowRecords.push(newRecord);
        return newRecord;
    },

    async returnBorrowRecord(id, returnData = {}) {
        await delay(300);
        const recordIndex = borrowRecords.findIndex(r => r.id === id);
        if (recordIndex === -1) throw new Error('借用记录不存在');

        const record = borrowRecords[recordIndex];
        record.status = returnData.isDamaged ? '已损坏' : '已归还';
        record.actualReturnTime = new Date().toLocaleString();
        record.returnNotes = returnData.notes;

        // 如果是完好的有唯一编码的备件，需要归还到库存
        if (!returnData.isDamaged && record.uniqueCode) {
            const partIndex = parts.findIndex(p => p.id === record.partId);
            if (partIndex !== -1) {
                parts[partIndex].uniqueCodes.push(record.uniqueCode);
                parts[partIndex].availableQuantity += 1;
            }
        } else if (!returnData.isDamaged && !record.uniqueCode) {
            // 普通备件归还，增加可用数量
            const partIndex = parts.findIndex(p => p.id === record.partId);
            if (partIndex !== -1) {
                parts[partIndex].availableQuantity += record.quantity;
            }
        }

        return record;
    },

    // 生命周期记录相关API
    async getLifecycleRecords(partId, uniqueCode = null) {
        await delay(300);
        let result = lifecycleRecords.filter(r => r.partId === partId);

        if (uniqueCode) {
            result = result.filter(r => r.uniqueCode === uniqueCode);
        }

        return result;
    },

    async addLifecycleRecord(record) {
        await delay(300);
        const newRecord = {
            id: Date.now(),
            eventTime: new Date().toLocaleString(),
            ...record
        };
        lifecycleRecords.push(newRecord);
        return newRecord;
    }
};
