// 模拟数据
export const warehouses = [
    {
        id: 1,
        name: '主仓库',
        type: 'large',
        manager: '张经理',
        spareParts: [
            { id: 101, name: '发动机', quantity: 5, safetyStock: 3, isValuable: true, location: 'A-1-2' },
            { id: 102, name: '电池', quantity: 20, safetyStock: 10, isValuable: false, location: 'B-2-1' },
            { id: 103, name: '控制器', quantity: 8, safetyStock: 5, isValuable: true, location: 'C-3-4' }
        ]
    },
    {
        id: 2,
        name: '北区仓库',
        type: 'small',
        manager: '李主管',
        spareParts: [
            { id: 101, name: '发动机', quantity: 2, safetyStock: 2, isValuable: true, location: 'D-1-1' },
            { id: 104, name: '传感器', quantity: 15, safetyStock: 8, isValuable: false, location: 'E-2-3' }
        ]
    },
    {
        id: 3,
        name: '南区仓库',
        type: 'small',
        manager: '王主管',
        spareParts: [
            { id: 102, name: '电池', quantity: 12, safetyStock: 5, isValuable: false, location: 'F-3-2' },
            { id: 105, name: '显示屏', quantity: 6, safetyStock: 4, isValuable: true, location: 'G-1-5' }
        ]
    }
]

export const spareParts = [
    {
        id: 101,
        name: '发动机',
        description: '重型机械发动机',
        totalQuantity: 7,
        isValuable: true,
        warehouses: [
            { id: 1, name: '主仓库', quantity: 5, safetyStock: 3 },
            { id: 2, name: '北区仓库', quantity: 2, safetyStock: 2 }
        ],
        borrowedItems: [
            { employee: '张三', borrowDate: '2023-05-10', quantity: 1, manager: '张经理', returnDate: '2023-05-15', returnQuantity: 1, returnManager: '张经理', installed: true },
            { employee: '李四', borrowDate: '2023-06-01', quantity: 1, manager: '李主管', returnDate: null, returnQuantity: 0, returnManager: null, installed: false }
        ]
    },
    {
        id: 102,
        name: '电池',
        description: '锂电池组',
        totalQuantity: 32,
        isValuable: false,
        warehouses: [
            { id: 1, name: '主仓库', quantity: 20, safetyStock: 10 },
            { id: 3, name: '南区仓库', quantity: 12, safetyStock: 5 }
        ],
        borrowedItems: [
            { employee: '王五', borrowDate: '2023-05-20', quantity: 2, manager: '张经理' },
            { employee: '赵六', borrowDate: '2023-06-05', quantity: 3, manager: '王主管' }
        ]
    },
    {
        id: 103,
        name: '控制器',
        description: 'PLC控制器',
        totalQuantity: 8,
        isValuable: true,
        warehouses: [
            { id: 1, name: '主仓库', quantity: 8, safetyStock: 5 }
        ],
        borrowedItems: [
            { employee: '钱七', borrowDate: '2023-05-15', quantity: 1, manager: '张经理', returnDate: null, returnQuantity: 0, returnManager: null, installed: true }
        ]
    },
    {
        id: 104,
        name: '传感器',
        description: '温度传感器',
        totalQuantity: 15,
        isValuable: false,
        warehouses: [
            { id: 2, name: '北区仓库', quantity: 15, safetyStock: 8 }
        ],
        borrowedItems: [
            { employee: '孙八', borrowDate: '2023-06-02', quantity: 5, manager: '李主管' }
        ]
    },
    {
        id: 105,
        name: '显示屏',
        description: '工业触摸屏',
        totalQuantity: 6,
        isValuable: true,
        warehouses: [
            { id: 3, name: '南区仓库', quantity: 6, safetyStock: 4 }
        ],
        borrowedItems: []
    }
]

export const employees = ['张三', '李四', '王五', '赵六', '钱七', '孙八']
