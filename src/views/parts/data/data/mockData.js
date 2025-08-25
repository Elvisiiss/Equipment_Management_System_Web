// 模拟数据生成和本地存储处理
export const generateMockData = () => {
    const categories = ['electronic', 'mechanical', 'consumable']
    const warehouses = ['主仓库', '东区仓库', '西区仓库', '备用仓库']
    const parts = []

    for (let i = 1; i <= 50; i++) {
        const category = categories[Math.floor(Math.random() * categories.length)]
        const safetyStock = Math.floor(Math.random() * 50) + 10
        const currentStock = Math.floor(Math.random() * 70) + 5

        parts.push({
            id: `part-${i}`,
            name: `备件 ${i}`,
            category,
            currentStock,
            safetyStock,
            warehouse: warehouses[Math.floor(Math.random() * warehouses.length)],
            price: parseFloat((Math.random() * 1000 + 10).toFixed(2)),
            lastUpdated: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString(),
            monthlyOutbound: Math.floor(Math.random() * 20)
        })
    }

    return parts
}

export const savePartsData = (parts) => {
    localStorage.setItem('parts-data', JSON.stringify(parts))
}

export const loadPartsData = () => {
    const data = localStorage.getItem('parts-data')
    return data ? JSON.parse(data) : null
}
