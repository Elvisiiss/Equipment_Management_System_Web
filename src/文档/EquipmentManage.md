# 设备管理API文档

## 概述
设备管理模块用于管理工厂设备信息，包括设备的创建、查询、更新和删除等操作。

## API端点

### 1. 获取设备列表（分页）
**GET** `/api/base-mc/list`

#### 请求参数
- `page`: 页码（可选，默认0）
- `size`: 每页大小（可选，默认10）
- `keyword`: 搜索关键词（可选，支持设备名称和编号模糊搜索）

#### 成功响应
```json
{
  "success": true,
  "message": "获取成功",
  "data": {
    "content": [
      {
        "id": 1,
        "mcNumber": "MC-0001",
        "mcName": "立式加工中心",
        "assetNumber": "ASSET-00123",
        "serialNumber": "SN-123456",
        "status": 1,
        "enterFactoryTime": "2022-05-15",
        "position": "A区-01-001",
        "mcCoordinateX": "23.45",
        "mcCoordinateY": "56.78",
        "image": "https://example.com/image.jpg",
        "remark": "需要定期维护"
      }
    ],
    "totalElements": 50,
    "totalPages": 5,
    "size": 10,
    "number": 0
  }
}
```

### 2. 创建设备
**POST** `/api/base-mc`

#### 请求体
```json
{
  "mcName": "立式加工中心",
  "mcNumber": "MC-0001",
  "assetNumber": "ASSET-00123",
  "serialNumber": "SN-123456",
  "enterFactoryTime": "2022-05-15",
  "status": 1,
  "mcCoordinateX": "23.45",
  "mcCoordinateY": "56.78",
  "image": "https://example.com/image.jpg",
  "mcNameplateFile": "nameplate.pdf",
  "remark": "需要定期维护"
}
```

#### 成功响应
```json
{
  "success": true,
  "message": "设备创建成功",
  "data": {
    "id": 1
  }
}
```

### 3. 更新设备
**PUT** `/api/base-mc/{id}`

#### 路径参数
- `id`: 设备ID

#### 请求体
```json
{
  "mcName": "立式加工中心(更新)",
  "mcNumber": "MC-0001",
  "assetNumber": "ASSET-00123",
  "serialNumber": "SN-123456",
  "enterFactoryTime": "2022-05-15",
  "status": 1,
  "mcCoordinateX": "23.45",
  "mcCoordinateY": "56.78",
  "image": "https://example.com/new-image.jpg",
  "mcNameplateFile": "updated-nameplate.pdf",
  "remark": "更新后的备注信息"
}
```

#### 成功响应
```json
{
  "success": true,
  "message": "设备更新成功"
}
```

### 4. 删除设备
**DELETE** `/api/base-mc/{id}`

#### 路径参数
- `id`: 设备ID

#### 成功响应
```json
{
  "success": true,
  "message": "设备删除成功"
}
```

## 数据库表结构

```sql
CREATE TABLE `base_mc` (
  `id` int NOT NULL AUTO_INCREMENT,
  `createtime` datetime(6) DEFAULT NULL,
  `deletetime` datetime(6) DEFAULT NULL,
  `updatetime` datetime(6) DEFAULT NULL,
  `weigh` int DEFAULT NULL,
  `applicable_product_scope` varchar(50) NOT NULL,
  `asset_number` varchar(255) DEFAULT NULL,
  `base_mctype_id` int DEFAULT NULL,
  `base_position_id` int DEFAULT NULL,
  `day_duration` varchar(60) DEFAULT NULL,
  `day_duration_time` varchar(60) DEFAULT NULL,
  `duty_admin_id` int DEFAULT NULL,
  `duty_role_id` int DEFAULT NULL,
  `enter_factory_time` varchar(255) DEFAULT NULL,
  `image` varchar(255) DEFAULT NULL,
  `is_check_status` tinyint DEFAULT NULL,
  `is_hinge` int DEFAULT NULL,
  `is_multiple_cards` tinyint DEFAULT NULL,
  `is_repair_status` tinyint DEFAULT NULL,
  `isreal` int DEFAULT '1',
  `mc_coordinate_x` varchar(255) DEFAULT NULL,
  `mc_coordinate_y` varchar(255) DEFAULT NULL,
  `mc_name` varchar(255) NOT NULL,
  `mc_nameplate_file` varchar(255) DEFAULT NULL,
  `mc_number` varchar(50) NOT NULL,
  `mes_mc_number` varchar(50) DEFAULT NULL,
  `position_put_area_id` int DEFAULT NULL,
  `serial_number` varchar(100) DEFAULT NULL,
  `status` int DEFAULT NULL,
  `yunke_device_no` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `mc_number` (`mc_number`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
```

## 使用示例

### 获取设备列表
```bash
curl -X GET "http://localhost:8080/api/base-mc/list?page=0&size=10&keyword=加工中心" \
  -H "token: YOUR_TOKEN"
```

### 创建设备
```bash
curl -X POST http://localhost:8080/api/base-mc \
  -H "Content-Type: application/json" \
  -H "token: YOUR_TOKEN" \
  -d '{
    "mcName": "立式加工中心",
    "mcNumber": "MC-0001",
    "assetNumber": "ASSET-00123",
    "status": 1
  }'
```

### 更新设备
```bash
curl -X PUT http://localhost:8080/api/base-mc/1 \
  -H "Content-Type: application/json" \
  -H "token: YOUR_TOKEN" \
  -d '{
    "mcName": "立式加工中心(更新)",
    "mcNumber": "MC-0001",
    "status": 1
  }'
```

### 删除设备
```bash
curl -X DELETE http://localhost:8080/api/base-mc/1 \
  -H "token: YOUR_TOKEN"
```

```

## 功能特点

1. **完整的设备管理功能**：实现了设备的增删改查操作
2. **分页与搜索**：支持分页浏览和设备名称/编号的模糊搜索
3. **状态管理**：使用标签直观显示设备状态
4. **表单验证**：对关键字段进行必填验证
5. **图片上传**：支持设备图片上传预览
6. **响应式布局**：适配不同屏幕尺寸
7. **模拟数据**：使用假数据模拟后端API，便于前端独立开发
8. **详细API文档**：提供完整的API接口文档，便于前后端协作

## 使用说明

1. 将`BaseMc.vue`文件放在`src/views/equipment/`目录下
2. 将`equipment.js`文件放在`src/api/`目录下
3. 在路由配置中添加设备管理页面的路由
4. 使用`BaseMcApi.md`文档与后端开发人员沟通API细节

这个实现方案完全遵循了您的要求，包括使用Vue3框架、Element Plus组件库、模拟API数据以及提供详细的API文档。界面设计简洁美观，功能完整，可以直接集成到现有项目中。
