// 模拟模具数据
let moldsData = JSON.parse(localStorage.getItem('moldsData')) || [
    {
        id: 1,
        code: 'MOLD-001',
        name: '注塑模具A型',
        type: '注塑模具',
        status: '可用',
        location: 'A区-1架',
        manufacturer: '精密模具厂',
        manufactureDate: '2023-01-15',
        lifespan: 100000,
        currentUsage: 25000,
        lastMaintenance: '2023-06-20',
        nextMaintenance: '2023-12-20',
        borrower: null,
        borrowDate: null,
        returnDate: null,
        notes: '高精度模具，需定期保养'
    },
    {
        id: 2,
        code: 'MOLD-002',
        name: '压铸模具B型',
        type: '压铸模具',
        status: '维修中',
        location: 'B区-3架',
        manufacturer: '重工模具',
        manufactureDate: '2022-08-10',
        lifespan: 80000,
        currentUsage: 45000,
        lastMaintenance: '2023-04-15',
        nextMaintenance: '2023-10-15',
        borrower: '张三',
        borrowDate: '2023-05-10',
        returnDate: null,
        notes: '近期出现轻微磨损，正在检修'
    }
];

// 模拟BOM数据
let bomData = JSON.parse(localStorage.getItem('bomData')) || [
    {
        id: 1,
        moldId: 1,
        items: [
            { id: 1, name: '模芯', material: 'SKD61', specification: 'φ200×150mm', quantity: 1, supplier: '日立金属' },
            { id: 2, name: '导柱', material: 'SUJ2', specification: 'φ30×200mm', quantity: 4, supplier: '大同特殊钢' },
            { id: 3, name: '顶针', material: 'SKH51', specification: 'φ5×150mm', quantity: 24, supplier: '龙记集团' },
            { id: 4, name: '热流道系统', material: '铜合金', specification: '8点', quantity: 1, supplier: 'YUDO' }
        ]
    },
    {
        id: 2,
        moldId: 2,
        items: [
            { id: 1, name: '模座', material: 'S50C', specification: '500×500×200mm', quantity: 1, supplier: '宝钢' },
            { id: 2, name: '滑块', material: 'H13', specification: '100×80×60mm', quantity: 2, supplier: '一胜百' },
            { id: 3, name: '浇口套', material: 'SKD61', specification: 'φ40×120mm', quantity: 1, supplier: '日立金属' }
        ]
    }
];

// 模拟生命周期记录
let lifecycleData = JSON.parse(localStorage.getItem('lifecycleData')) || [
    {
        id: 1,
        moldId: 1,
        records: [
            { id: 1, date: '2023-01-15', type: '入库', operator: '系统', description: '新模具入库' },
            { id: 2, date: '2023-02-10', type: '使用', operator: '李四', description: '生产订单PO-20230210-001' },
            { id: 3, date: '2023-06-20', type: '保养', operator: '王师傅', description: '定期保养，更换导柱' }
        ]
    },
    {
        id: 2,
        moldId: 2,
        records: [
            { id: 1, date: '2022-08-10', type: '入库', operator: '系统', description: '新模具入库' },
            { id: 2, date: '2022-09-05', type: '使用', operator: '王五', description: '生产订单PO-20220905-045' },
            { id: 3, date: '2023-04-15', type: '保养', operator: '张师傅', description: '定期保养，抛光模芯' },
            { id: 4, date: '2023-05-10', type: '借用', operator: '张三', description: '借用于新产品试制' },
            { id: 5, date: '2023-05-20', type: '维修', operator: '维修部', description: '发现磨损，进行维修' }
        ]
    }
];

// 保存数据到localStorage
function saveData() {
    localStorage.setItem('moldsData', JSON.stringify(moldsData));
    localStorage.setItem('bomData', JSON.stringify(bomData));
    localStorage.setItem('lifecycleData', JSON.stringify(lifecycleData));
}

// API方法
export const moldAPI = {
    // 获取所有模具
    getMolds() {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve([...moldsData]);
            }, 300);
        });
    },

    // 根据ID获取模具
    getMoldById(id) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const mold = moldsData.find(m => m.id === parseInt(id));
                if (mold) {
                    resolve({...mold});
                } else {
                    reject(new Error('模具不存在'));
                }
            }, 300);
        });
    },

    // 添加模具
    addMold(mold) {
        return new Promise((resolve) => {
            setTimeout(() => {
                const newMold = {
                    ...mold,
                    id: Math.max(...moldsData.map(m => m.id), 0) + 1,
                    status: '可用',
                    currentUsage: 0,
                    borrower: null,
                    borrowDate: null,
                    returnDate: null
                };
                moldsData.push(newMold);

                // 创建对应的BOM和生命周期记录
                bomData.push({
                    id: Math.max(...bomData.map(b => b.id), 0) + 1,
                    moldId: newMold.id,
                    items: []
                });

                lifecycleData.push({
                    id: Math.max(...lifecycleData.map(l => l.id), 0) + 1,
                    moldId: newMold.id,
                    records: [{
                        id: 1,
                        date: new Date().toISOString().split('T')[0],
                        type: '入库',
                        operator: '系统',
                        description: '新模具入库'
                    }]
                });

                saveData();
                resolve(newMold);
            }, 300);
        });
    },

    // 更新模具
    updateMold(updatedMold) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const index = moldsData.findIndex(m => m.id === updatedMold.id);
                if (index !== -1) {
                    moldsData[index] = {...updatedMold};
                    saveData();
                    resolve(moldsData[index]);
                } else {
                    reject(new Error('模具不存在'));
                }
            }, 300);
        });
    },

    // 删除模具
    deleteMold(id) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const index = moldsData.findIndex(m => m.id === parseInt(id));
                if (index !== -1) {
                    moldsData.splice(index, 1);
                    // 同时删除对应的BOM和生命周期记录
                    bomData = bomData.filter(b => b.moldId !== parseInt(id));
                    lifecycleData = lifecycleData.filter(l => l.moldId !== parseInt(id));
                    saveData();
                    resolve(true);
                } else {
                    reject(new Error('模具不存在'));
                }
            }, 300);
        });
    },

    // 获取模具的BOM
    getBomByMoldId(moldId) {
        return new Promise((resolve) => {
            setTimeout(() => {
                const bom = bomData.find(b => b.moldId === parseInt(moldId));
                resolve(bom ? {...bom} : { moldId: parseInt(moldId), items: [] });
            }, 300);
        });
    },

    // 更新模具的BOM
    updateBom(moldId, items) {
        return new Promise((resolve) => {
            setTimeout(() => {
                let bom = bomData.find(b => b.moldId === parseInt(moldId));
                if (bom) {
                    bom.items = [...items];
                } else {
                    bom = {
                        id: Math.max(...bomData.map(b => b.id), 0) + 1,
                        moldId: parseInt(moldId),
                        items: [...items]
                    };
                    bomData.push(bom);
                }
                saveData();
                resolve({...bom});
            }, 300);
        });
    },

    // 获取模具的生命周期记录
    getLifecycleByMoldId(moldId) {
        return new Promise((resolve) => {
            setTimeout(() => {
                const lifecycle = lifecycleData.find(l => l.moldId === parseInt(moldId));
                resolve(lifecycle ? {...lifecycle} : { moldId: parseInt(moldId), records: [] });
            }, 300);
        });
    },

    // 添加生命周期记录
    addLifecycleRecord(moldId, record) {
        return new Promise((resolve) => {
            setTimeout(() => {
                let lifecycle = lifecycleData.find(l => l.moldId === parseInt(moldId));
                if (!lifecycle) {
                    lifecycle = {
                        id: Math.max(...lifecycleData.map(l => l.id), 0) + 1,
                        moldId: parseInt(moldId),
                        records: []
                    };
                    lifecycleData.push(lifecycle);
                }

                const newRecord = {
                    ...record,
                    id: Math.max(...lifecycle.records.map(r => r.id), 0) + 1,
                    date: record.date || new Date().toISOString().split('T')[0]
                };

                lifecycle.records.push(newRecord);
                saveData();
                resolve(newRecord);
            }, 300);
        });
    },

    // 借用模具
    borrowMold(id, borrower) {
        return new Promise(async (resolve, reject) => {
            try {
                const mold = await this.getMoldById(id);
                if (mold.status !== '可用') {
                    throw new Error('模具当前不可借用');
                }

                mold.status = '已借用';
                mold.borrower = borrower;
                mold.borrowDate = new Date().toISOString().split('T')[0];
                mold.returnDate = null;

                await this.updateMold(mold);
                await this.addLifecycleRecord(id, {
                    type: '借用',
                    operator: borrower,
                    description: `借用人: ${borrower}`
                });

                resolve(mold);
            } catch (error) {
                reject(error);
            }
        });
    },

    // 归还模具
    returnMold(id) {
        return new Promise(async (resolve, reject) => {
            try {
                const mold = await this.getMoldById(id);
                if (mold.status !== '已借用') {
                    throw new Error('模具未被借用，无法归还');
                }

                mold.status = '可用';
                mold.returnDate = new Date().toISOString().split('T')[0];

                await this.updateMold(mold);
                await this.addLifecycleRecord(id, {
                    type: '归还',
                    operator: mold.borrower,
                    description: `归还人: ${mold.borrower}`
                });

                resolve(mold);
            } catch (error) {
                reject(error);
            }
        });
    }
};
