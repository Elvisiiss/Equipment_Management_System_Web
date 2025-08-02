# 部门与审批层级管理API文档

## 概述
本文档描述部门管理和审批层级管理模块的API接口，包括接口地址、请求参数、响应格式等信息，用于前后端开发人员协作。

## 部门管理API

### 1. 获取部门列表
**GET** `/system/departments`

#### 请求参数
无

#### 成功响应
```json
{
  "success": true,
  "message": "获取成功",
  "data": {
    "data": [
      {
        "id": 1,
        "name": "技术部",
        "parentId": 0,
        "description": "负责技术开发",
        "status": 1,
        "createTime": "2023-01-15 09:30:00",
        "updateTime": "2023-01-15 09:30:00"
      },
      {
        "id": 2,
        "name": "市场部",
        "parentId": 0,
        "description": "负责市场推广",
        "status": 1,
        "createTime": "2023-01-15 09:35:00",
        "updateTime": "2023-01-15 09:35:00"
      }
    ]
  }
}
```

### 2. 创建部门
**POST** `/system/departments`

#### 请求体
```json
{
  "name": "产品部",
  "parentId": 0,
  "description": "负责产品规划与设计",
  "status": 1
}
```

#### 成功响应
```json
{
  "success": true,
  "message": "部门创建成功",
  "data": {
    "id": 3
  }
}
```

### 3. 更新部门
**PUT** `/system/departments/{id}`

#### 路径参数
- `id`: 部门ID

#### 请求体
```json
{
  "name": "产品研发部",
  "parentId": 0,
  "description": "负责产品规划、设计与研发",
  "status": 1
}
```

#### 成功响应
```json
{
  "success": true,
  "message": "部门更新成功"
}
```

### 4. 删除部门
**DELETE** `/system/departments/{id}`

#### 路径参数
- `id`: 部门ID

#### 成功响应
```json
{
  "success": true,
  "message": "部门删除成功"
}
```

## 审批层级管理API

### 1. 获取审批层级列表
**GET** `/system/approval-levels`

#### 请求参数
无

#### 成功响应
```json
{
  "success": true,
  "message": "获取成功",
  "data": {
    "data": [
      {
        "id": 1,
        "name": "请假审批",
        "level": 2,
        "departmentId": 1,
        "departmentName": "技术部",
        "approverIds": [1, 3],
        "approverNames": ["张三", "王五"],
        "description": "员工请假审批流程",
        "createTime": "2023-02-10 14:20:00",
        "updateTime": "2023-02-10 14:20:00"
      },
      {
        "id": 2,
        "name": "报销审批",
        "level": 3,
        "departmentId": 0,
        "departmentName": "全公司",
        "approverIds": [1, 2, 5],
        "approverNames": ["张三", "李四", "赵六"],
        "description": "费用报销审批流程",
        "createTime": "2023-02-11 10:15:00",
        "updateTime": "2023-02-11 10:15:00"
      }
    ]
  }
}
```

### 2. 创建审批层级
**POST** `/system/approval-levels`

#### 请求体
```json
{
  "name": "采购审批",
  "level": 3,
  "departmentId": 0,
  "approverIds": [1, 2, 4],
  "description": "公司物品采购审批流程"
}
```

#### 成功响应
```json
{
  "success": true,
  "message": "审批层级创建成功",
  "data": {
    "id": 3
  }
}
```

### 3. 更新审批层级
**PUT** `/system/approval-levels/{id}`

#### 路径参数
- `id`: 审批层级ID

#### 请求体
```json
{
  "name": "采购审批",
  "level": 4,
  "departmentId": 0,
  "approverIds": [1, 2, 4, 6],
  "description": "公司物品采购审批流程，金额大于10000需总经理审批"
}
```

#### 成功响应
```json
{
  "success": true,
  "message": "审批层级更新成功"
}
```

### 4. 删除审批层级
**DELETE** `/system/approval-levels/{id}`

#### 路径参数
- `id`: 审批层级ID

#### 成功响应
```json
{
  "success": true,
  "message": "审批层级删除成功"
}
```

### 5. 获取用户列表（用于审批人选择）
**GET** `/system/users/simple`

#### 请求参数
无

#### 成功响应
```json
{
  "success": true,
  "message": "获取成功",
  "data": {
    "data": [
      {
        "id": 1,
        "userName": "张三",
        "email": "zhangsan@example.com"
      },
      {
        "id": 2,
        "userName": "李四",
        "email": "lisi@example.com"
      }
    ]
  }
}
```

## 数据库表结构

### 部门表 (department)
```sql
CREATE TABLE `department` (
  `id` int NOT NULL AUTO_INCREMENT,
  `createtime` datetime(6) DEFAULT NULL,
  `updatetime` datetime(6) DEFAULT NULL,
  `name` varchar(50) NOT NULL COMMENT '部门名称',
  `parent_id` int DEFAULT 0 COMMENT '上级部门ID',
  `description` varchar(200) DEFAULT NULL COMMENT '部门描述',
  `status` int DEFAULT 1 COMMENT '状态：1-启用，0-禁用',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='部门表';
```

### 审批层级表 (approval_level)
```sql
CREATE TABLE `approval_level` (
  `id` int NOT NULL AUTO_INCREMENT,
  `createtime` datetime(6) DEFAULT NULL,
  `updatetime` datetime(6) DEFAULT NULL,
  `name` varchar(50) NOT NULL COMMENT '审批名称',
  `level` int NOT NULL COMMENT '审批层级',
  `department_id` int DEFAULT 0 COMMENT '适用部门ID，0表示全公司',
  `approver_ids` varchar(200) NOT NULL COMMENT '审批人ID，逗号分隔',
  `description` varchar(200) DEFAULT NULL COMMENT '描述',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='审批层级表';
```

## 使用示例

### 获取部门列表
```bash
curl -X GET "http://localhost:8080/system/departments" \
  -H "token: YOUR_TOKEN"
```

### 创建部门
```bash
curl -X POST http://localhost:8080/system/departments \
  -H "Content-Type: application/json" \
  -H "token: YOUR_TOKEN" \
  -d '{
    "name": "产品部",
    "parentId": 0,
    "description": "负责产品规划与设计",
    "status": 1
  }'
```

### 创建审批层级
```bash
curl -X POST http://localhost:8080/system/approval-levels \
  -H "Content-Type: application/json" \
  -H "token: YOUR_TOKEN" \
  -d '{
    "name": "采购审批",
    "level": 3,
    "departmentId": 0,
    "approverIds": [1, 2, 4],
    "description": "公司物品采购审批流程"
  }'
```
```

以上代码实现了部门信息管理和审批层级管理两个功能模块，放在同一个Vue文件中，通过侧边栏进行切换。主要功能包括：

1. 部门管理：
   - 部门列表展示
   - 部门新增、编辑、删除
   - 部门状态启用/禁用切换
   - 部门搜索和状态筛选

2. 审批层级管理：
   - 审批层级列表展示
   - 审批层级新增、编辑、删除
   - 审批层级搜索和部门筛选
   - 审批人选择功能

代码使用了Vue3的`<script setup>`语法，结合Element Plus组件库，使用假数据模拟API请求，并提供了完整的API文档用于与后端沟通。
