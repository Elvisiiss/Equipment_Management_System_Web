# 备件管理系统API文档

## 概述
备件管理系统用于管理备件编码和备品备件台账，支持备件编码的创建、修改、详情查看，以及备件的入库、出库、借用、退场、报废、盘点等操作。

## API端点

### 1. 备件编码管理

#### 1.1 获取备件编码列表（分页）
**GET** `/api/spare-part/codes`

##### 请求参数
- `page`: 页码（可选，默认0）
- `size`: 每页大小（可选，默认10）
- `keyword`: 搜索关键词（可选，支持备件名称和编码模糊搜索）
- `sortBy`: 排序字段（可选，默认createTime，支持：id、createTime）
- `sortDir`: 排序方向（可选，默认desc，支持：asc、desc）

##### 成功响应
```json
{
  "success": true,
  "message": "获取成功",
  "data": {
    "content": [
      {
        "id": 1,
        "code": "SP-2024-001",
        "name": "轴承6204",
        "category": "机械零件",
        "model": "6204-2RS",
        "specifications": "内径20mm外径47mm",
        "unit": "个",
        "createdAt": "2024-01-15T10:00:00",
        "updatedAt": "2024-01-15T10:00:00"
      }
    ],
    "totalElements": 50,
    "totalPages": 5,
    "size": 10,
    "number": 0
  }
}
```

#### 1.2 创建备件编码
**POST** `/api/spare-part/codes`

##### 请求体
```json
{
  "code": "SP-2024-001",
  "name": "轴承6204",
  "category": "机械零件",
  "model": "6204-2RS",
  "specifications": "内径20mm外径47mm",
  "unit": "个",
  "description": "用于设备主轴支撑",
  "safetyStock": 10,
  "lifespan": 365,
  "warningDays": 30
}
```

##### 成功响应
```json
{
  "success": true,
  "message": "备件编码创建成功",
  "data": {
    "id": 1
  }
}
```

#### 1.3 更新备件编码
**PUT** `/api/spare-part/codes/{id}`

##### 路径参数
- `id`: 备件编码ID

##### 请求体
```json
{
  "code": "SP-2024-001",
  "name": "轴承6204",
  "category": "机械零件",
  "model": "6204-2RS",
  "specifications": "内径20mm外径47mm",
  "unit": "个",
  "description": "用于设备主轴支撑",
  "safetyStock": 10,
  "lifespan": 365,
  "warningDays": 30
}
```

##### 成功响应
```json
{
  "success": true,
  "message": "备件编码更新成功"
}
```

#### 1.4 获取备件编码详情
**GET** `/api/spare-part/codes/{id}`

##### 路径参数
- `id`: 备件编码ID

##### 成功响应
```json
{
  "success": true,
  "message": "获取成功",
  "data": {
    "id": 1,
    "code": "SP-2024-001",
    "name": "轴承6204",
    "category": "机械零件",
    "model": "6204-2RS",
    "specifications": "内径20mm外径47mm",
    "unit": "个",
    "description": "用于设备主轴支撑",
    "safetyStock": 10,
    "lifespan": 365,
    "warningDays": 30,
    "createdAt": "2024-01-15T10:00:00",
    "updatedAt": "2024-01-15T10:00:00"
  }
}
```

### 2. 备件台账管理

#### 2.1 获取备件台账列表
**GET** `/api/spare-part/inventory`

##### 请求参数
- `page`: 页码（可选，默认0）
- `size`: 每页大小（可选，默认10）
- `keyword`: 搜索关键词（可选，支持备件名称和编码模糊搜索）
- `category`: 备件类别（可选）

##### 成功响应
```json
{
  "success": true,
  "message": "获取成功",
  "data": {
    "content": [
      {
        "id": 1,
        "code": "SP-2024-001",
        "name": "轴承6204",
        "category": "机械零件",
        "totalQuantity": 25,
        "availableQuantity": 20,
        "safetyStock": 10,
        "unit": "个",
        "lastInDate": "2024-01-20",
        "lastOutDate": "2024-01-25",
        "warningStatus": "正常"
      }
    ]
  }
}
```

#### 2.2 零件入库
**POST** `/api/spare-part/inventory/inbound`

##### 请求体
```json
{
  "sparePartId": 1,
  "quantity": 20,
  "remark": "采购入库"
}
```

##### 成功响应
```json
{
  "success": true,
  "message": "入库成功"
}
```

#### 2.3 零件出库
**POST** `/api/spare-part/inventory/outbound`

##### 请求体
```json
{
  "sparePartId": 1,
  "quantity": 5,
  "remark": "设备维修使用"
}
```

##### 成功响应
```json
{
  "success": true,
  "message": "出库成功"
}
```

#### 2.4 零件借用
**POST** `/api/spare-part/inventory/borrow`

##### 请求体
```json
{
  "sparePartId": 1,
  "quantity": 2,
  "remark": "临时借用"
}
```

##### 成功响应
```json
{
  "success": true,
  "message": "借用成功"
}
```

#### 2.5 零件退场
**POST** `/api/spare-part/inventory/return`

##### 请求体
```json
{
  "sparePartId": 1,
  "quantity": 2,
  "remark": "归还借用备件"
}
```

##### 成功响应
```json
{
  "success": true,
  "message": "退场成功"
}
```

#### 2.6 零件报废
**POST** `/api/spare-part/inventory/scrap`

##### 请求体
```json
{
  "sparePartId": 1,
  "quantity": 3,
  "remark": "损坏报废"
}
```

##### 成功响应
```json
{
  "success": true,
  "message": "报废成功"
}
```

#### 2.7 零件盘点
**POST** `/api/spare-part/inventory/check`

##### 请求体
```json
{
  "sparePartId": 1,
  "actualQuantity": 18,
  "remark": "定期盘点"
}
```

##### 成功响应
```json
{
  "success": true,
  "message": "盘点完成"
}
```

#### 2.8 获取库存记录
**GET** `/api/spare-part/inventory/records`

##### 请求参数
- `page`: 页码（可选，默认0）
- `size`: 每页大小（可选，默认10）
- `type`: 操作类型（可选，支持：入库、出库、借用、退场、报废）
- `startDate`: 开始日期（可选，格式：yyyy-MM-dd）
- `endDate`: 结束日期（可选，格式：yyyy-MM-dd）

##### 成功响应
```json
{
  "success": true,
  "message": "获取成功",
  "data": {
    "content": [
      {
        "id": 1,
        "code": "SP-2024-001",
        "name": "轴承6204",
        "type": "入库",
        "quantity": 20,
        "unit": "个",
        "operator": "张三",
        "operateTime": "2024-01-20 10:30:00",
        "remark": "采购入库"
      }
    ]
  }
}
```

## 数据库表结构

### spare_part_codes 备件编码表
```sql
CREATE TABLE spare_part_codes (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    code VARCHAR(50) UNIQUE NOT NULL COMMENT '备件编码',
    name VARCHAR(100) NOT NULL COMMENT '备件名称',
    category VARCHAR(50) NOT NULL COMMENT '类别',
    model VARCHAR(100) COMMENT '型号',
    specifications TEXT COMMENT '规格',
    unit VARCHAR(10) NOT NULL COMMENT '单位',
    description TEXT COMMENT '描述',
    safety_stock INT DEFAULT 0 COMMENT '安全库存',
    lifespan INT DEFAULT 0 COMMENT '寿命期限(天)',
    warning_days INT DEFAULT 0 COMMENT '预警天数',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### spare_part_inventory 备件库存表
```sql
CREATE TABLE spare_part_inventory (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    code_id BIGINT NOT NULL COMMENT '备件编码ID',
    total_quantity INT NOT NULL DEFAULT 0 COMMENT '总库存',
    available_quantity INT NOT NULL DEFAULT 0 COMMENT '可用库存',
    last_in_date DATE COMMENT '最后入库日期',
    last_out_date DATE COMMENT '最后出库日期',
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (code_id) REFERENCES spare_part_codes(id)
);
```

### inventory_records 库存操作记录表
```sql
CREATE TABLE inventory_records (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    code_id BIGINT NOT NULL COMMENT '备件编码ID',
    type ENUM('INBOUND', 'OUTBOUND', 'BORROW', 'RETURN', 'SCRAP', 'CHECK') NOT NULL COMMENT '操作类型',
    quantity INT NOT NULL COMMENT '数量',
    operator VARCHAR(50) NOT NULL COMMENT '操作人',
    operate_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    remark TEXT COMMENT '备注',
    FOREIGN KEY (code_id) REFERENCES spare_part_codes(id)
);
```

## 使用示例

### 创建备件编码
```bash
curl -X POST http://localhost:8080/api/spare-part/codes \
  -H "Content-Type: application/json" \
  -H "token: YOUR_TOKEN" \
  -d '{
    "code": "SP-2024-001",
    "name": "轴承6204",
    "category": "机械零件",
    "model": "6204-2RS",
    "unit": "个"
  }'
```

### 零件入库
```bash
curl -X POST http://localhost:8080/api/spare-part/inventory/inbound \
  -H "Content-Type: application/json" \
  -H "token: YOUR_TOKEN" \
  -d '{
    "sparePartId": 1,
    "quantity": 20,
    "remark": "采购入库"
  }'
```

### 获取库存记录
```bash
curl -X GET "http://localhost:8080/api/spare-part/inventory/records?type=入库&startDate=2024-01-01&endDate=2024-01-31" \
  -H "token: YOUR_TOKEN"
```
```
