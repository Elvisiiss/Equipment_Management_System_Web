// 为了演示全部写成同步数据
export const getHierarchy = () => ({
    厂区A: {
        车间1: { 产线1: ['设备A1','设备A2','设备A3'], 产线2: ['设备B1','设备B2'] },
        车间2: { 产线3: ['设备C1'] },
    },
    厂区B: {
        车间3: { 产线4: ['设备D1','设备D2','设备D3'], 产线5: ['设备E1'], 产线6: ['设备F1','设备F2','设备F3','设备F4'] },
    },
})

export const getAssetStats = () => ({
    total: 1260,
    added: 35,
    scrap: 12,
    types: [
        { name: '生产设备', value: 820, life: 8 },
        { name: 'IT资产', value: 250, life: 5 },
        { name: '车辆', value: 90, life: 10 },
    ],
})

export const getModuleUsage = () => [
    { module: '设备台账', pv: 3500 },
    { module: '点检保养', pv: 2800 },
    { module: '维修管理', pv: 2600 },
    { module: '备件仓库', pv: 1900 },
    { module: '资产盘点', pv: 1700 },
]
