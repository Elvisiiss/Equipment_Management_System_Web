<template>
  <div class="warehouse-management">
    <!-- 页面标题和仓库切换 -->
    <div class="page-header">
      <div class="header-content">
        <div class="title-section">
          <i class="el-icon-office-building"></i>
          <h1>仓库管理</h1>
        </div>
        <div class="actions-section">
          <el-select
              v-model="selectedWarehouseId"
              @change="handleWarehouseChange"
              placeholder="选择仓库"
              class="warehouse-select"
          >
            <el-option
                v-for="warehouse in warehouses"
                :key="warehouse.id"
                :label="warehouse.name"
                :value="warehouse.id"
            ></el-option>
          </el-select>
          <el-button type="primary" @click="showAddPartDialog = true" class="add-part-btn">
            <i class="el-icon-plus"></i> 添加备件
          </el-button>
        </div>
      </div>
    </div>

    <!-- 当前仓库信息 -->
    <el-card v-if="currentWarehouse" class="warehouse-info-card">
      <div class="warehouse-info-header">
        <h2>{{ currentWarehouse.name }}</h2>
        <div class="warehouse-type">
          <el-tag :type="currentWarehouse.type === 'large' ? 'primary' : 'success'" effect="dark" size="small">
            {{ currentWarehouse.type === 'large' ? '大型仓库' : '小型仓库' }}
          </el-tag>
        </div>
      </div>

      <div class="warehouse-details">
        <div class="detail-item">
          <span class="label">负责人:</span>
          <span class="value">{{ currentWarehouse.manager }}</span>
        </div>
        <div class="detail-item">
          <span class="label">位置:</span>
          <span class="value">{{ currentWarehouse.location }}</span>
        </div>
        <div class="detail-item">
          <span class="label">联系电话:</span>
          <span class="value">{{ currentWarehouse.phone }}</span>
        </div>
        <div class="detail-item">
          <span class="label">容量:</span>
          <span class="value">{{ currentWarehouse.capacity }} 立方米</span>
        </div>
        <div class="detail-item">
          <span class="label">使用率:</span>
          <span class="value">{{ currentWarehouse.utilizationRate }}%</span>
        </div>
      </div>
    </el-card>

    <!-- 库存概览 -->
    <el-row :gutter="20" class="inventory-stats" v-if="currentWarehouse">
      <el-col :xs="12" :sm="6" v-for="(stat, index) in inventoryStats" :key="index">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-content">
            <div class="stat-icon" :style="{ backgroundColor: stat.color }">
              <i :class="stat.icon"></i>
            </div>
            <div class="stat-info">
              <p class="stat-label">{{ stat.label }}</p>
              <h3 class="stat-value">{{ stat.value }}</h3>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 库存筛选 -->
    <el-card class="filter-card" v-if="currentWarehouse">
      <el-form :inline="true" :model="filterForm" class="filter-form">
        <el-form-item label="备件类别:">
          <el-select v-model="filterForm.category" placeholder="全部" clearable>
            <el-option label="电子元件" value="electronic"></el-option>
            <el-option label="机械零件" value="mechanical"></el-option>
            <el-option label="耗材" value="consumable"></el-option>
            <el-option label="工具" value="tool"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="库存状态:">
          <el-select v-model="filterForm.stockStatus" placeholder="全部" clearable>
            <el-option label="正常" value="normal"></el-option>
            <el-option label="低库存" value="low"></el-option>
            <el-option label="缺货" value="out"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-input
              v-model="filterForm.search"
              placeholder="搜索备件名称或编号"
              suffix-icon="el-icon-search"
              class="search-input"
              clearable
          ></el-input>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 备件列表 -->
    <el-card class="parts-list-card" v-if="currentWarehouse">
      <div class="parts-list-header">
        <h2>备件库存列表</h2>
        <div class="list-actions">
          <el-button type="text" @click="exportInventory" class="export-btn">
            <i class="el-icon-download"></i> 导出库存
          </el-button>
        </div>
      </div>

      <el-table
          :data="filteredParts"
          border
          stripe
          style="width: 100%"
          empty-text="暂无数据"
          v-loading="loading"
      >
        <el-table-column type="index" label="序号" width="60" align="center"></el-table-column>
        <el-table-column prop="code" label="备件编号" width="120" sortable></el-table-column>
        <el-table-column prop="name" label="备件名称" width="180" sortable>
          <template #default="scope">
            <div class="part-name">
              {{ scope.row.name }}
              <el-tag v-if="scope.row.isValuable" size="mini" type="warning" class="valuable-tag">
                贵重
              </el-tag>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="category" label="类别" width="120" sortable>
          <template #default="scope">
            <el-tag size="small" :type="getCategoryTagType(scope.row.category)" effect="plain">
              {{ getCategoryName(scope.row.category) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="quantity" label="库存数量" width="110" sortable align="center"></el-table-column>
        <el-table-column prop="safetyStock" label="安全库存" width="110" sortable align="center"></el-table-column>
        <el-table-column prop="location" label="库位" width="100" align="center"></el-table-column>
        <el-table-column prop="lastUpdated" label="最后更新" width="140" sortable></el-table-column>
        <el-table-column label="状态" width="100" align="center">
          <template #default="scope">
            <el-tag
                size="small"
                :type="scope.row.quantity === 0 ? 'danger' : (scope.row.quantity <= scope.row.safetyStock ? 'warning' : 'success')"
                effect="light"
            >
              {{ scope.row.quantity === 0 ? '缺货' : (scope.row.quantity <= scope.row.safetyStock ? '低库存' : '正常') }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" align="center" fixed="right">
          <template #default="scope">
            <el-tooltip content="编辑" placement="top">
              <el-button
                  size="mini"
                  @click="handleEditPart(scope.row)"
                  icon="el-icon-edit"
                  circle
              ></el-button>
            </el-tooltip>
            <el-tooltip content="移动" placement="top">
              <el-button
                  size="mini"
                  type="warning"
                  @click="handleMovePart(scope.row)"
                  icon="el-icon-refresh-right"
                  circle
              ></el-button>
            </el-tooltip>
            <el-tooltip content="删除" placement="top">
              <el-button
                  size="mini"
                  type="danger"
                  @click="handleDeletePart(scope.row.id)"
                  icon="el-icon-delete"
                  circle
              ></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination" v-if="filteredParts.length > 0">
        <el-pagination
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            :current-page="currentPage"
            :page-sizes="[10, 20, 50]"
            :page-size="pageSize"
            layout="total, sizes, prev, pager, next, jumper"
            :total="filteredParts.length"
        ></el-pagination>
      </div>
    </el-card>

    <!-- 添加/编辑备件对话框 -->
    <el-dialog
        :title="isEditing ? '编辑备件' : '添加新备件'"
        v-model="showAddPartDialog"
        width="600px"
        :close-on-click-modal="false"
    >
      <el-form :model="currentPart" label-width="100px" ref="partForm" :rules="partRules">
        <el-form-item label="备件编号" prop="code">
          <el-input v-model="currentPart.code" :disabled="isEditing" placeholder="请输入备件编号"></el-input>
        </el-form-item>
        <el-form-item label="备件名称" prop="name">
          <el-input v-model="currentPart.name" placeholder="请输入备件名称"></el-input>
        </el-form-item>
        <el-form-item label="备件类别" prop="category">
          <el-select v-model="currentPart.category" placeholder="请选择" style="width: 100%">
            <el-option label="电子元件" value="electronic"></el-option>
            <el-option label="机械零件" value="mechanical"></el-option>
            <el-option label="耗材" value="consumable"></el-option>
            <el-option label="工具" value="tool"></el-option>
          </el-select>
        </el-form-item>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="库存数量" prop="quantity">
              <el-input-number v-model="currentPart.quantity" :min="0" controls-position="right" style="width: 100%"></el-input-number>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="安全库存" prop="safetyStock">
              <el-input-number v-model="currentPart.safetyStock" :min="0" controls-position="right" style="width: 100%"></el-input-number>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="库位" prop="location">
          <el-input v-model="currentPart.location" placeholder="例如: A-1-05"></el-input>
        </el-form-item>
        <el-form-item>
          <el-checkbox v-model="currentPart.isValuable">标记为贵重物品</el-checkbox>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAddPartDialog = false">取消</el-button>
        <el-button type="primary" @click="savePart">确认</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// 仓库数据
const warehouses = ref([
  {
    id: 1,
    name: '主仓库',
    type: 'large',
    manager: '张经理',
    location: '工业园区A区1号',
    phone: '13800138000',
    capacity: 5000,
    utilizationRate: 68,
    parts: [
      {
        id: 101,
        code: 'ELEC-001',
        name: 'PLC控制器',
        category: 'electronic',
        quantity: 15,
        safetyStock: 5,
        location: 'A-1-01',
        isValuable: true,
        lastUpdated: '2023-06-15'
      },
      {
        id: 102,
        code: 'MECH-001',
        name: '伺服电机',
        category: 'mechanical',
        quantity: 8,
        safetyStock: 3,
        location: 'B-2-05',
        isValuable: true,
        lastUpdated: '2023-06-10'
      },
      {
        id: 103,
        code: 'ELEC-002',
        name: '接近开关',
        category: 'electronic',
        quantity: 30,
        safetyStock: 10,
        location: 'A-3-12',
        isValuable: false,
        lastUpdated: '2023-06-18'
      },
      {
        id: 104,
        code: 'TOOL-001',
        name: '扭矩扳手',
        category: 'tool',
        quantity: 5,
        safetyStock: 2,
        location: 'C-1-08',
        isValuable: false,
        lastUpdated: '2023-06-05'
      },
      {
        id: 105,
        code: 'CONS-001',
        name: '润滑油',
        category: 'consumable',
        quantity: 25,
        safetyStock: 10,
        location: 'D-2-03',
        isValuable: false,
        lastUpdated: '2023-06-20'
      }
    ]
  },
  {
    id: 2,
    name: '东区仓库',
    type: 'small',
    manager: '李主管',
    location: '工业园区B区3号',
    phone: '13900139000',
    capacity: 2000,
    utilizationRate: 45,
    parts: [
      {
        id: 201,
        code: 'ELEC-003',
        name: '光电传感器',
        category: 'electronic',
        quantity: 12,
        safetyStock: 5,
        location: 'A-1-02',
        isValuable: false,
        lastUpdated: '2023-06-16'
      },
      {
        id: 202,
        code: 'MECH-002',
        name: '滚珠轴承',
        category: 'mechanical',
        quantity: 50,
        safetyStock: 20,
        location: 'B-1-09',
        isValuable: false,
        lastUpdated: '2023-06-12'
      },
      {
        id: 203,
        code: 'CONS-002',
        name: '密封胶',
        category: 'consumable',
        quantity: 18,
        safetyStock: 8,
        location: 'C-3-04',
        isValuable: false,
        lastUpdated: '2023-06-19'
      }
    ]
  },
  {
    id: 3,
    name: '西区仓库',
    type: 'small',
    manager: '王主管',
    location: '工业园区C区5号',
    phone: '13700137000',
    capacity: 1500,
    utilizationRate: 72,
    parts: [
      {
        id: 301,
        code: 'ELEC-004',
        name: '继电器',
        category: 'electronic',
        quantity: 40,
        safetyStock: 15,
        location: 'A-2-07',
        isValuable: false,
        lastUpdated: '2023-06-14'
      },
      {
        id: 302,
        code: 'MECH-003',
        name: '齿轮箱',
        category: 'mechanical',
        quantity: 3,
        safetyStock: 2,
        location: 'B-3-01',
        isValuable: true,
        lastUpdated: '2023-06-08'
      },
      {
        id: 303,
        code: 'TOOL-002',
        name: '万用表',
        category: 'tool',
        quantity: 6,
        safetyStock: 2,
        location: 'C-2-10',
        isValuable: false,
        lastUpdated: '2023-06-11'
      },
      {
        id: 304,
        code: 'CONS-003',
        name: '砂纸',
        category: 'consumable',
        quantity: 100,
        safetyStock: 50,
        location: 'D-1-06',
        isValuable: false,
        lastUpdated: '2023-06-03'
      }
    ]
  }
])

// 表单验证规则
const partRules = reactive({
  code: [{ required: true, message: '请输入备件编号', trigger: 'blur' }],
  name: [{ required: true, message: '请输入备件名称', trigger: 'blur' }],
  category: [{ required: true, message: '请选择备件类别', trigger: 'change' }],
  quantity: [{ required: true, type: 'number', min: 0, message: '请输入有效数量', trigger: 'blur' }],
  safetyStock: [{ required: true, type: 'number', min: 0, message: '请输入安全库存', trigger: 'blur' }]
})

// 状态管理
const selectedWarehouseId = ref('')
const currentWarehouse = ref(null)
const filterForm = reactive({
  category: '',
  stockStatus: '',
  search: ''
})
const currentPage = ref(1)
const pageSize = ref(10)
const loading = ref(false)

// 对话框状态
const showAddPartDialog = ref(false)
const isEditing = ref(false)
const currentPart = reactive({
  id: null,
  code: '',
  name: '',
  category: '',
  quantity: 0,
  safetyStock: 0,
  location: '',
  isValuable: false,
  lastUpdated: ''
})

// 初始化
onMounted(() => {
  if (warehouses.value.length > 0) {
    selectedWarehouseId.value = warehouses.value[0].id
    currentWarehouse.value = warehouses.value[0]
  }
})

// 处理仓库切换
function handleWarehouseChange(id) {
  currentWarehouse.value = warehouses.value.find(warehouse => warehouse.id === id)
  // 重置筛选条件
  filterForm.category = ''
  filterForm.stockStatus = ''
  filterForm.search = ''
  currentPage.value = 1
}

// 库存统计
const inventoryStats = computed(() => {
  if (!currentWarehouse.value) return []

  const totalParts = currentWarehouse.value.parts.length
  const totalQuantity = currentWarehouse.value.parts.reduce((sum, part) => sum + part.quantity, 0)
  const valuableCount = currentWarehouse.value.parts.filter(part => part.isValuable).length
  const lowStockCount = currentWarehouse.value.parts.filter(part => part.quantity <= part.safetyStock && part.quantity > 0).length
  const outOfStockCount = currentWarehouse.value.parts.filter(part => part.quantity === 0).length

  return [
    { label: '备件种类', value: totalParts, color: '#409EFF', icon: 'el-icon-box' },
    { label: '库存总量', value: totalQuantity, color: '#67C23A', icon: 'el-icon-calculator' },
    { label: '贵重物品', value: valuableCount, color: '#E6A23C', icon: 'el-icon-diamond' },
    { label: '低库存项', value: lowStockCount + (outOfStockCount > 0 ? `+${outOfStockCount}缺货` : ''), color: '#F56C6C', icon: 'el-icon-warning' }
  ]
})

// 筛选备件
const filteredParts = computed(() => {
  if (!currentWarehouse.value) return []

  return currentWarehouse.value.parts.filter(part => {
    // 类别筛选
    if (filterForm.category && part.category !== filterForm.category) {
      return false
    }

    // 库存状态筛选
    if (filterForm.stockStatus) {
      if (filterForm.stockStatus === 'normal' && (part.quantity === 0 || part.quantity <= part.safetyStock)) {
        return false
      }
      if (filterForm.stockStatus === 'low' && (part.quantity === 0 || part.quantity > part.safetyStock)) {
        return false
      }
      if (filterForm.stockStatus === 'out' && part.quantity !== 0) {
        return false
      }
    }

    // 搜索筛选
    if (filterForm.search) {
      const searchStr = filterForm.search.toLowerCase()
      if (!part.name.toLowerCase().includes(searchStr) && !part.code.toLowerCase().includes(searchStr)) {
        return false
      }
    }

    return true
  })
})

// 分页处理
function handleSizeChange(val) {
  pageSize.value = val
  currentPage.value = 1
}

function handleCurrentChange(val) {
  currentPage.value = val
}

// 类别名称转换
function getCategoryName(category) {
  const map = {
    'electronic': '电子元件',
    'mechanical': '机械零件',
    'consumable': '耗材',
    'tool': '工具'
  }
  return map[category] || category
}

// 类别标签样式
function getCategoryTagType(category) {
  const map = {
    'electronic': 'primary',
    'mechanical': 'success',
    'consumable': 'warning',
    'tool': 'info'
  }
  return map[category] || 'default'
}

// 添加备件
function handleAddPart() {
  isEditing.value = false
  Object.assign(currentPart, {
    id: null,
    code: '',
    name: '',
    category: '',
    quantity: 0,
    safetyStock: 0,
    location: '',
    isValuable: false,
    lastUpdated: ''
  })
  showAddPartDialog.value = true
}

// 编辑备件
function handleEditPart(part) {
  isEditing.value = true
  Object.assign(currentPart, { ...part })
  showAddPartDialog.value = true
}

// 保存备件
function savePart() {
  if (!currentPart.code || !currentPart.name || !currentPart.category) {
    ElMessage.warning('请填写必填字段')
    return
  }

  if (isEditing.value) {
    // 更新现有备件
    const index = currentWarehouse.value.parts.findIndex(p => p.id === currentPart.id)
    if (index !== -1) {
      currentPart.lastUpdated = new Date().toISOString().split('T')[0]
      currentWarehouse.value.parts[index] = { ...currentPart }
      ElMessage.success('备件更新成功')
    }
  } else {
    // 添加新备件
    const newPart = {
      ...currentPart,
      id: Date.now(),
      lastUpdated: new Date().toISOString().split('T')[0]
    }
    currentWarehouse.value.parts.push(newPart)
    ElMessage.success('备件添加成功')
  }

  showAddPartDialog.value = false
}

// 移动备件
function handleMovePart(part) {
  ElMessage.info(`移动备件: ${part.name} (功能待实现)`)
}

// 删除备件
function handleDeletePart(id) {
  ElMessageBox.confirm(
      '确定要删除这个备件吗？',
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
  ).then(() => {
    const index = currentWarehouse.value.parts.findIndex(p => p.id === id)
    if (index !== -1) {
      currentWarehouse.value.parts.splice(index, 1)
      ElMessage.success('备件已删除')
    }
  }).catch(() => {
    // 取消删除
  })
}

// 导出库存
function exportInventory() {
  ElMessage.success('库存数据已导出')
}
</script>

<style scoped lang="scss">
.warehouse-management {
  padding: 24px;
  background-color: #f5f7fa;
  min-height: 100vh;
}

.page-header {
  margin-bottom: 24px;

  .header-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 16px;

    .title-section {
      display: flex;
      align-items: center;
      gap: 12px;

      h1 {
        margin: 0;
        color: #1f2d3d;
        font-size: 24px;
        font-weight: 600;
      }

      .el-icon-office-building {
        font-size: 28px;
        color: #409EFF;
      }
    }

    .actions-section {
      display: flex;
      align-items: center;
      gap: 12px;

      .warehouse-select {
        width: 250px;
      }

      .add-part-btn {
        margin-left: 0;
      }
    }
  }
}

.warehouse-info-card {
  margin-bottom: 24px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  border: none;

  :deep(.el-card__body) {
    padding: 24px;
  }
}

.warehouse-info-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px dashed #e6e8eb;

  h2 {
    margin: 0;
    color: #1f2d3d;
    font-size: 20px;
    font-weight: 600;
  }
}

.warehouse-details {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;

  .detail-item {
    display: flex;
    align-items: center;

    .label {
      color: #606266;
      width: 80px;
      font-size: 14px;
    }

    .value {
      color: #1f2d3d;
      font-weight: 500;
    }
  }
}

.inventory-stats {
  margin-bottom: 24px;

  .stat-card {
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    border: none;
    transition: transform 0.3s ease;

    &:hover {
      transform: translateY(-4px);
    }

    :deep(.el-card__body) {
      padding: 20px;
    }
  }

  .stat-content {
    display: flex;
    align-items: center;
  }

  .stat-icon {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    margin-right: 16px;
    font-size: 20px;
  }

  .stat-info {
    .stat-label {
      color: #606266;
      margin: 0 0 8px 0;
      font-size: 14px;
    }

    .stat-value {
      margin: 0;
      font-size: 24px;
      font-weight: 700;
      color: #1f2d3d;
    }
  }
}

.filter-card {
  margin-bottom: 24px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  border: none;

  :deep(.el-card__body) {
    padding: 20px;
  }

  .filter-form {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;

    .el-form-item {
      margin-bottom: 0;
    }

    .search-input {
      width: 280px;
    }
  }
}

.parts-list-card {
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  border: none;

  :deep(.el-card__body) {
    padding: 24px;
  }
}

.parts-list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;

  h2 {
    margin: 0;
    font-size: 18px;
    color: #1f2d3d;
    font-weight: 600;
  }

  .export-btn {
    padding: 8px 12px;
    border-radius: 4px;

    &:hover {
      background-color: #f5f7fa;
    }
  }
}

.part-name {
  display: flex;
  align-items: center;

  .valuable-tag {
    margin-left: 8px;
  }
}

.pagination {
  margin-top: 24px;
  display: flex;
  justify-content: flex-end;
}

// 响应式调整
@media (max-width: 768px) {
  .warehouse-management {
    padding: 16px;
  }

  .page-header {
    .header-content {
      flex-direction: column;
      align-items: flex-start;

      .actions-section {
        width: 100%;

        .warehouse-select {
          width: 100%;
        }

        .add-part-btn {
          width: 100%;
          margin-top: 12px;
        }
      }
    }
  }

  .warehouse-details {
    grid-template-columns: 1fr;
  }

  .filter-form {
    flex-direction: column;
    align-items: flex-start !important;

    .search-input {
      width: 100% !important;
    }
  }

  .parts-list-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;

    .list-actions {
      align-self: flex-end;
    }
  }
}
</style>
