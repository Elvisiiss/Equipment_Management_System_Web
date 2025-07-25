import { defineStore } from 'pinia'

// 设备类型定义
interface Device {
    id: number
    name: string
    color: string
    x: number // 坐标，用于拖动
    y: number
}

// 默认设备数据（模拟你的工厂布局）
const DEFAULT_DEVICES: Device[] = [
    { id: 1, name: 'C4-51-01', color: 'green', x: 0, y: 0 },
    { id: 2, name: 'C4-51-02', color: 'gray', x: 0, y: 0 },
    { id: 3, name: 'C4-51-03', color: 'green', x: 0, y: 0 },
    { id: 4, name: 'C4-51-04', color: 'green', x: 0, y: 0 },
    //... 补充更多设备，与截图对应
]

export const useFactoryStore = defineStore('factory', {
    state: () => ({
        devices: DEFAULT_DEVICES // 初始设备数据
    }),
    actions: {
        // 保存位置（可扩展：调用后端接口持久化）
        saveDevicePositions(newPositions: Device[]) {
            this.devices = newPositions
            // 示例：本地缓存（若需要）
            localStorage.setItem('factoryDevices', JSON.stringify(newPositions))
        },
        // 重置默认布局
        resetDevices() {
            this.devices = DEFAULT_DEVICES
            localStorage.removeItem('factoryDevices') // 清除缓存
        }
    }
})
