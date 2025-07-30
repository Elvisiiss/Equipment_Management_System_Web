# 库位与设备BOM管理API文档

## 1. 库位管理

### 1.1 获取库位列表
**GET** `/api/location/locations`

参数：
- page (int): 页码，默认0
- size (int): 每页数量，默认10
- type (string): 库位类型 [STEREO, FLAT, EDGE]
- area (string): 区域 [A, B, C]
- status (string): 使用状态 [FREE, OCCUPIED, MAINTAIN]

响应：
```json
{
  "success": true,
  "data": {
    "content": [...],
    "totalElements": 50
  }
}
```

### 1.2 创建库位
**POST** `/api/location/locations`
```json
{
  "code": "A-01-001",
  "name": "立体库位001",
  "type": "STEREO",
  "area": "A",
  "capacity": 100,
  "remark": "备注"
}
```

### 1.3 更新库位
**PUT** `/api/location/locations/{id}`
（同创建结构）

## 2. 线边库存

### 2.1 获取线边库存
**GET** `/api/location/edge-inventory`

参数：
- barcodeType [BARCODE, NO_BARCODE]
- status [UNUSED, USED]
- dateRange [start, end]

## 3. 设备BOM

### 3.1 获取设备列表
**GET** `/api/location/equipments`

参数：
- keyword: 搜索关键词
- category: 设备类型 [MACHINE_CENTER, LATHE, MILLING]

### 3.2 获取设备详情
**GET** `/api/location/equipments/{id}`
包含：
- 设备基本信息
- 部位及零件树形结构
- 技术资料（手册、SOP、3D模型等）
```

---

## 使用说明

1. **路由配置** (router/index.js)
```javascript
const routes = [
  { path: '/locations', component: () => import('@/views/LocationManagement.vue') },
  { path: '/edge-inventory', component: () => import('@/views/EdgeInventory.vue') },
  { path: '/equipment-bom', component: () => import('@/views/EquipmentBOM.vue') }
]
```

2. **组件注册** (main.js)
```javascript
app.use(ElementPlus)
```

3. **运行环境** 需要安装：
- vue@3
- element-plus
- axios
- vue-router@4
