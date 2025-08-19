import { getSPCDeviceListDB, getSPCDeviceDetailDB } from './spcAPIdb'

// 获取SPC设备列表
export const getSPCDeviceList = (params) => {
    return new Promise(resolve => {
        setTimeout(() => {
            const result = getSPCDeviceListDB(params)
            resolve(result)
        }, 300)
    })
}

// 获取SPC设备详情
export const getSPCDeviceDetail = (deviceId) => {
    return new Promise(resolve => {
        setTimeout(() => {
            const detail = getSPCDeviceDetailDB(deviceId)
            resolve(detail)
        }, 500)
    })
}
