#### 1. 获取设备列表（分页+树形结构）
**GET** `/api/equipment/list`

##### 请求参数
| 参数名      | 类型     | 必填 | 说明                             |
|-------------|----------|------|----------------------------------|
| page        | int      | 否   | 页码（默认1）                   |
| size        | int      | 否   | 每页数量（默认20）              |
| deviceCode  | string   | 否   | 设备编码模糊搜索               |
| status      | string[] | 否   | 设备状态筛选（多选）           |
| manufacturer| string   | 否   | 厂商模糊搜索                   |
| lifespan    | string   | 否   | 寿命上限筛选                   |
| workshop    | string   | 否   | 车间筛选（单选）               |
| line        | string[] | 否   | 产线筛选（多选）               |
| segment     | string[] | 否   | 工段筛选（多选）               |

##### 成功响应
```json
{
  "success": true,
  "message": "获取成功",
  "data": {
    "content": [
      {
        "id": 1,
        "name": "C2车间",
        "type": "workshop",
        "children": [
          {
            "id": 10001,
            "name": "31产线",
            "type": "line",
            "children": [
              {
                "id": 20001,
                "name": "CFOG段",
                "type": "segment",
                "children": [
                  {
                    "id": 3,
                    "name": "精密清洗设备",
                    "type": "device",
                    "deviceCode": "DEV-C2-31-CF-100",
                    "assetCode": "AST-5842",
                    "manufacturer": "三星电子",
                    "category": "清洗机",
                    "model": "X-2000",
                    "status": "已验收",
                    "workshop": "C2",
                    "line": "31",
                    "segment": "CFOG段",
                    "lifespan": 3,
                    "inTime": "2023-05-12",
                    "inCharge": "张三",
                    "acceptTime": "2023-06-01",
                    "acceptor": "李四"
                  }
                ]
              }
            ]
          }
        ]
      }
    ],
    "totalElements": 150,
    "totalPages": 8,
    "size": 20,
    "number": 1
  }
}
```

---

#### 2. 获取设备详情
**GET** `/api/equipment/{id}`

##### 路径参数
| 参数名 | 类型 | 必填 | 说明   |
|--------|------|------|--------|
| id     | int  | 是   | 设备ID |

##### 成功响应
```json
{
  "success": true,
  "message": "获取成功",
  "data": {
    "id": 3,
    "name": "精密清洗设备",
    "deviceCode": "DEV-C2-31-CF-100",
    "assetCode": "AST-5842",
    "manufacturer": "三星电子",
    "category": "清洗机",
    "model": "X-2000",
    "status": "已验收",
    "lifespan": 3,
    "inTime": "2023-05-12",
    "inCharge": "张三",
    "acceptTime": "2023-06-01",
    "acceptor": "李四",
    "workshop": "C2",
    "line": "31",
    "segment": "CFOG段"
  }
}
```

---

#### 3. 新增设备
**POST** `/api/equipment`

##### 请求体
```json
{
  "name": "全自动COG机",
  "deviceCode": "DEV-C3-42-COG-200",
  "assetCode": "AST-7845",
  "manufacturer": "京东方",
  "category": "COG机",
  "model": "ProMax 3000",
  "status": "待验收",
  "lifespan": 5,
  "inTime": "2023-07-15",
  "inCharge": "王五",
  "acceptTime": "",
  "acceptor": "",
  "workshop": "C3",
  "line": "42",
  "segment": "贴合段"
}
```

##### 成功响应
```json
{
  "success": true,
  "message": "设备添加成功",
  "data": {
    "id": 201
  }
}
```

---

#### 4. 更新设备
**PUT** `/api/equipment/{id}`

##### 路径参数
| 参数名 | 类型 | 必填 | 说明   |
|--------|------|------|--------|
| id     | int  | 是   | 设备ID |

##### 请求体
```json
{
  "name": "全自动COG机(升级版)",
  "status": "已验收",
  "acceptTime": "2023-08-10",
  "acceptor": "赵六",
  "lifespan": 5
}
```

##### 成功响应
```json
{
  "success": true,
  "message": "设备更新成功"
}
```

---

#### 5. 删除设备
**DELETE** `/api/equipment/{id}`

##### 路径参数
| 参数名 | 类型 | 必填 | 说明   |
|--------|------|------|--------|
| id     | int  | 是   | 设备ID |

##### 成功响应
```json
{
  "success": true,
  "message": "设备删除成功"
}
```

---

#### 6. 获取车间选项
**GET** `/api/equipment/workshops`

##### 成功响应
```json
{
  "success": true,
  "data": ["C2", "C3", "C4", "C5", "C6"]
}
```

---

#### 7. 获取产线选项
**GET** `/api/equipment/lines`

##### 请求参数
| 参数名   | 类型   | 必填 | 说明         |
|----------|--------|------|--------------|
| workshop | string | 是   | 车间名称     |

##### 成功响应
```json
{
  "success": true,
  "data": ["31", "32", "33", "34", "35", "36"]
}
```

---

#### 8. 获取工段选项
**GET** `/api/equipment/segments`

##### 成功响应
```json
{
  "success": true,
  "data": ["CFOG段", "贴合段", "组装段", "30米线段"]
}
```

---

### 使用示例

#### 获取设备列表
```bash
curl -X GET "http://localhost:8080/api/equipment/list?workshop=C2&line[]=31&line[]=32&status[]=已验收&status[]=待验收" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### 新增设备
```bash
curl -X POST http://localhost:8080/api/equipment \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "高精度FOG机",
    "deviceCode": "DEV-C4-53-FOG-300",
    "manufacturer": "索尼",
    "status": "样机",
    "workshop": "C4",
    "line": "53",
    "segment": "组装段"
  }'
```

#### 删除设备
```bash
curl -X DELETE http://localhost:8080/api/equipment/45 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### 数据结构说明
#### 设备对象属性
| 字段名        | 类型   | 说明                |
|---------------|--------|---------------------|
| id            | int    | 设备唯一ID          |
| name          | string | 设备名称            |
| deviceCode    | string | 设备编码（唯一）    |
| assetCode     | string | 资产编码            |
| manufacturer  | string | 厂商                |
| category      | string | 设备类别            |
| model         | string | 型号                |
| status        | string | 状态（枚举值）      |
| workshop      | string | 所属车间            |
| line          | string | 所属产线            |
| segment       | string | 所属工段            |
| lifespan      | int    | 寿命上限（年）      |
| inTime        | string | 入库时间（YYYY-MM-DD）|
| inCharge      | string | 入库负责人          |
| acceptTime    | string | 验收时间（YYYY-MM-DD）|
| acceptor      | string | 验收人              |

#### 状态枚举值
- `已验收`：设备已完成验收
- `待验收`：设备等待验收
- `样机`：样品展示设备
- `闲置`：未投入使用设备
