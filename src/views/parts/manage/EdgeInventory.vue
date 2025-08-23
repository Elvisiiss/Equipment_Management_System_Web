<template>
  <div class="warehouse-management">
    <el-container>
      <el-header class="header">
        <h1><i class="office-building"></i> 仓库管理系统</h1>
        <el-button type="primary" @click="showAddWarehouseDialog = true">
          <i class="plus"></i> 添加新仓库
        </el-button>
      </el-header>

      <el-main>
        <!-- 统计卡片 -->
        <el-row :gutter="20" class="stats-overview">
          <el-col :xs="12" :sm="6" v-for="(stat, index) in stats" :key="index">
            <el-card shadow="hover" class="stat-card">
              <div class="stat-content">
                <div class="stat-icon" :class="stat.color">
                  <i :class="stat.icon"></i>
                </div>
                <div class="stat-info">
                  <h3>{{ stat.value }}</h3>
                  <p>{{ stat.label }}</p>
                </div>
              </div>
            </el-card>
          </el-col>
        </el-row>

        <!-- 筛选和搜索 -->
        <el-card shadow="never" class="filter-card">
          <el-form :inline="true" :model="filterForm" class="warehouse-filter">
            <el-form-item label="仓库类型:">
              <el-select v-model="filterForm.type" placeholder="请选择" style="width: 180px">
                <el-option label="全部" value="all"></el-option>
                <el-option label="大仓库" value="large"></el-option>
                <el-option label="小仓库" value="small"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="库存状态:">
              <el-select v-model="filterForm.stock" placeholder="请选择" style="width: 180px">
                <el-option label="全部" value="all"></el-option>
                <el-option label="仅低库存" value="low"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-input
                  v-model="filterForm.search"
                  placeholder="搜索备件或仓库..."
                  suffix-icon="search"
                  style="width: 250px"
              ></el-input>
            </el-form-item>
          </el-form>
        </el-card>

        <!-- 仓库列表 -->
        <div class="warehouse-list">
          <el-card
              v-for="warehouse in filteredWarehouses"
              :key="warehouse.id"
              class="warehouse-card"
              shadow="hover"
          >
            <template #header>
              <div class="warehouse-header">
                <div class="warehouse-title">
                  <h2>{{ warehouse.name }}</h2>
                  <el-tag
                      :type="warehouse.type === 'large' ? 'primary' : 'success'"
                      size="small"
                  >
                    {{ warehouse.type === "large" ? "大仓库" : "小仓库" }}
                  </el-tag>
                </div>
                <div class="warehouse-manager">
                  <i class="user"></i>
                  <span>负责人: {{ warehouse.manager }}</span>
                </div>
                <div class="warehouse-actions">
                  <el-button
                      icon="edit"
                      circle
                      @click="editWarehouse(warehouse)"
                      title="编辑仓库"
                  ></el-button>
                  <el-button
                      icon="delete"
                      circle
                      type="danger"
                      @click="deleteWarehouse(warehouse.id)"
                      title="删除仓库"
                  ></el-button>
                </div>
              </div>
            </template>

            <!-- 库存摘要 -->
            <el-row :gutter="20" class="inventory-summary">
              <el-col :span="8">
                <div class="summary-item">
                  <span class="label">备件种类:</span>
                  <span class="value">{{ warehouse.spareParts.length }}</span>
                </div>
              </el-col>
              <el-col :span="8">
                <div class="summary-item">
                  <span class="label">总库存量:</span>
                  <span class="value">{{ getWarehouseTotalQuantity(warehouse) }}</span>
                </div>
              </el-col>
              <el-col :span="8">
                <div class="summary-item">
                  <span class="label">低库存项:</span>
                  <span class="value warning">{{ getLowStockCount(warehouse) }}</span>
                </div>
              </el-col>
            </el-row>

            <!-- 库存表格 -->
            <div class="inventory-table-container">
              <el-table
                  :data="filteredParts(warehouse)"
                  style="width: 100%"
                  empty-text="暂无备件数据"
                  stripe
              >
                <el-table-column prop="name" label="备件名称" min-width="120">
                  <template #default="{ row }">
                    <div class="part-name">
                      {{ row.name }}
                      <i
                          v-if="row.isValuable"
                          class="star-on valuable-icon"
                          title="贵重物品"
                      ></i>
                    </div>
                  </template>
                </el-table-column>
                <el-table-column prop="quantity" label="数量" width="80"></el-table-column>
                <el-table-column prop="safetyStock" label="安全库存" width="90"></el-table-column>
                <el-table-column prop="location" label="位置" width="100"></el-table-column>
                <el-table-column label="状态" width="110">
                  <template #default="{ row }">
                    <el-tag
                        :type="row.quantity <= row.safetyStock ? 'danger' : 'success'"
                        size="small"
                    >
                      <i
                          :class="
                          row.quantity <= row.safetyStock
                            ? 'warning-outline'
                            : 'success'
                        "
                      ></i>
                      {{ row.quantity <= row.safetyStock ? "库存不足" : "正常" }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column label="操作" width="120">
                  <template #default="{ row }">
                    <div class="part-actions">
                      <el-button
                          icon="refresh"
                          circle
                          size="mini"
                          @click="openMoveDialog(warehouse, row)"
                          title="移动"
                      ></el-button>
                      <el-button
                          icon="back"
                          circle
                          size="mini"
                          type="warning"
                          @click="openBorrowDialog(warehouse, row)"
                          title="借出"
                      ></el-button>
                    </div>
                  </template>
                </el-table-column>
              </el-table>
            </div>

            <div class="warehouse-footer">
              <el-button @click="openAddPartsDialog(warehouse)" icon="plus" size="small">
                添加备件
              </el-button>
              <el-button @click="openBorrowDialog(warehouse)" icon="back" size="small">
                借出备件
              </el-button>
              <el-button @click="openReturnDialog(warehouse)" icon="refresh-left" size="small">
                归还备件
              </el-button>
            </div>
          </el-card>
        </div>
      </el-main>
    </el-container>

    <!-- 添加仓库对话框 -->
    <el-dialog
        title="添加新仓库"
        v-model="showAddWarehouseDialog"
        width="500px"
        :before-close="handleClose"
    >
      <el-form :model="newWarehouse" label-width="80px">
        <el-form-item label="仓库名称">
          <el-input v-model="newWarehouse.name" placeholder="输入仓库名称"></el-input>
        </el-form-item>
        <el-form-item label="仓库类型">
          <el-select v-model="newWarehouse.type" placeholder="请选择">
            <el-option label="小仓库" value="small"></el-option>
            <el-option label="大仓库" value="large"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="负责人">
          <el-input v-model="newWarehouse.manager" placeholder="输入负责人姓名"></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showAddWarehouseDialog = false">取消</el-button>
          <el-button type="primary" @click="addWarehouse">确认</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 添加备件对话框 -->
    <el-dialog
        :title="'添加备件到 ' + (selectedWarehouse?.name || '')"
        v-model="showAddDialog"
        width="600px"
    >
      <el-form :model="newPart" label-width="80px">
        <el-form-item label="备件名称">
          <el-input v-model="newPart.name" placeholder="输入备件名称"></el-input>
        </el-form-item>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="数量">
              <el-input-number v-model="newPart.quantity" :min="1" style="width: 100%"></el-input-number>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="安全库存">
              <el-input-number v-model="newPart.safetyStock" :min="0" style="width: 100%"></el-input-number>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="位置">
          <el-input v-model="newPart.location" placeholder="例如: A-1-1"></el-input>
        </el-form-item>
        <el-form-item>
          <el-checkbox v-model="newPart.isValuable">是否为贵重物品</el-checkbox>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showAddDialog = false">取消</el-button>
          <el-button type="primary" @click="addPart">确认</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 移动备件对话框 -->
    <el-dialog
        :title="'移动备件: ' + (selectedPart ? selectedPart.name : '')"
        v-model="showMoveDialog"
        width="500px"
    >
      <div v-if="selectedPart" class="move-dialog-content">
        <div class="move-info">
          <p>从 <strong>{{ selectedWarehouse?.name }}</strong> 移动</p>
          <p>当前库存: <strong>{{ selectedPart.quantity }}</strong></p>
        </div>
        <el-form :model="movePart" label-width="80px">
          <el-form-item label="移动数量">
            <el-input-number
                v-model="movePart.quantity"
                :min="1"
                :max="selectedPart.quantity"
                style="width: 100%"
            ></el-input-number>
          </el-form-item>
          <el-form-item label="目标仓库">
            <el-select v-model="movePart.targetWarehouse" placeholder="请选择" style="width: 100%">
              <el-option
                  v-for="wh in warehouses.filter(w => w.id !== selectedWarehouse?.id)"
                  :key="wh.id"
                  :label="`${wh.name} (${wh.type === 'large' ? '大仓库' : '小仓库'})`"
                  :value="wh.id"
              ></el-option>
            </el-select>
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showMoveDialog = false">取消</el-button>
          <el-button type="primary" @click="moveParts" :disabled="!canMove">确认移动</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 借出备件对话框 -->
    <el-dialog
        :title="'从 ' + selectedWarehouse?.name + ' 借出备件'"
        v-model="showBorrowDialog"
        width="500px"
    >
      <el-form :model="borrowPart" label-width="80px">
        <el-form-item v-if="!selectedPart" label="选择备件">
          <el-select v-model="borrowPart.id" placeholder="请选择" style="width: 100%">
            <el-option
                v-for="part in selectedWarehouse?.spareParts"
                :key="part.id"
                :label="`${part.name} (库存: ${part.quantity})`"
                :value="part.id"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="借出数量">
          <el-input-number
              v-model="borrowPart.quantity"
              :min="1"
              :max="selectedPart ? selectedPart.quantity : getPartById(borrowPart.id)?.quantity"
              style="width: 100%"
          ></el-input-number>
        </el-form-item>
        <el-form-item label="借出员工">
          <el-select v-model="borrowPart.employee" placeholder="请选择" style="width: 100%">
            <el-option
                v-for="emp in employees"
                :key="emp"
                :label="emp"
                :value="emp"
            ></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showBorrowDialog = false">取消</el-button>
          <el-button type="primary" @click="borrowPartAction" :disabled="!canBorrow">确认借出</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 归还备件对话框 -->
    <el-dialog
        :title="'归还备件到 ' + selectedWarehouse?.name"
        v-model="showReturnDialog"
        width="600px"
    >
      <el-form :model="returnRecord" label-width="100px">
        <el-form-item label="选择借出记录">
          <el-select v-model="returnRecord.id" placeholder="请选择" style="width: 100%">
            <el-option
                v-for="(record, index) in borrowRecords"
                :key="index"
                :label="`${record.partName} - ${record.employee} (借出: ${record.borrowDate})`"
                :value="index"
            ></el-option>
          </el-select>
        </el-form-item>
        <div v-if="returnRecord.id !== null" class="return-info">
          <p>借出数量: <strong>{{ borrowRecords[returnRecord.id]?.borrowedQuantity }}</strong></p>
          <p>已归还: <strong>{{ borrowRecords[returnRecord.id]?.returnedQuantity || 0 }}</strong></p>
          <p>待归还: <strong>{{ (borrowRecords[returnRecord.id]?.borrowedQuantity || 0) - (borrowRecords[returnRecord.id]?.returnedQuantity || 0) }}</strong></p>
        </div>
        <el-form-item label="归还数量">
          <el-input-number
              v-model="returnRecord.quantity"
              :min="1"
              :max="returnRecord.id !== null ? borrowRecords[returnRecord.id].borrowedQuantity - (borrowRecords[returnRecord.id].returnedQuantity || 0) : 0"
              style="width: 100%"
          ></el-input-number>
        </el-form-item>
        <el-form-item>
          <el-checkbox v-model="returnRecord.installed">是否已安装</el-checkbox>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showReturnDialog = false">取消</el-button>
          <el-button type="primary" @click="returnPartAction" :disabled="!canReturn">确认归还</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// 模拟数据
const warehousesData = [
  {
    id: 1,
    name: '主仓库',
    type: 'large',
    manager: '张经理',
    spareParts: [
      { id: 101, name: '发动机', quantity: 5, safetyStock: 3, isValuable: true, location: 'A-1-2' },
      { id: 102, name: '电池', quantity: 20, safetyStock: 10, isValuable: false, location: 'B-2-1' },
      { id: 103, name: '控制器', quantity: 8, safetyStock: 5, isValuable: true, location: 'C-3-4' }
    ]
  },
  {
    id: 2,
    name: '北区仓库',
    type: 'small',
    manager: '李主管',
    spareParts: [
      { id: 101, name: '发动机', quantity: 2, safetyStock: 2, isValuable: true, location: 'D-1-1' },
      { id: 104, name: '传感器', quantity: 15, safetyStock: 8, isValuable: false, location: 'E-2-3' }
    ]
  },
  {
    id: 3,
    name: '南区仓库',
    type: 'small',
    manager: '王主管',
    spareParts: [
      { id: 102, name: '电池', quantity: 12, safetyStock: 5, isValuable: false, location: 'F-3-2' },
      { id: 105, name: '显示屏', quantity: 6, safetyStock: 4, isValuable: true, location: 'G-1-5' }
    ]
  }
]

const sparePartsData = [
  {
    id: 101,
    name: '发动机',
    description: '重型机械发动机',
    totalQuantity: 7,
    isValuable: true,
    warehouses: [
      { id: 1, name: '主仓库', quantity: 5, safetyStock: 3 },
      { id: 2, name: '北区仓库', quantity: 2, safetyStock: 2 }
    ],
    borrowedItems: [
      { employee: '张三', borrowDate: '2023-05-10', quantity: 1, manager: '张经理', returnDate: '2023-05-15', returnQuantity: 1, returnManager: '张经理', installed: true },
      { employee: '李四', borrowDate: '2023-06-01', quantity: 1, manager: '李主管', returnDate: null, returnQuantity: 0, returnManager: null, installed: false }
    ]
  },
  {
    id: 102,
    name: '电池',
    description: '锂电池组',
    totalQuantity: 32,
    isValuable: false,
    warehouses: [
      { id: 1, name: '主仓库', quantity: 20, safetyStock: 10 },
      { id: 3, name: '南区仓库', quantity: 12, safetyStock: 5 }
    ],
    borrowedItems: [
      { employee: '王五', borrowDate: '2023-05-20', quantity: 2, manager: '张经理' },
      { employee: '赵六', borrowDate: '2023-06-05', quantity: 3, manager: '王主管' }
    ]
  },
  {
    id: 103,
    name: '控制器',
    description: 'PLC控制器',
    totalQuantity: 8,
    isValuable: true,
    warehouses: [
      { id: 1, name: '主仓库', quantity: 8, safetyStock: 5 }
    ],
    borrowedItems: [
      { employee: '钱七', borrowDate: '2023-05-15', quantity: 1, manager: '张经理', returnDate: null, returnQuantity: 0, returnManager: null, installed: true }
    ]
  },
  {
    id: 104,
    name: '传感器',
    description: '温度传感器',
    totalQuantity: 15,
    isValuable: false,
    warehouses: [
      { id: 2, name: '北区仓库', quantity: 15, safetyStock: 8 }
    ],
    borrowedItems: [
      { employee: '孙八', borrowDate: '2023-06-02', quantity: 5, manager: '李主管' }
    ]
  },
  {
    id: 105,
    name: '显示屏',
    description: '工业触摸屏',
    totalQuantity: 6,
    isValuable: true,
    warehouses: [
      { id: 3, name: '南区仓库', quantity: 6, safetyStock: 4 }
    ],
    borrowedItems: []
  }
]

const employeesData = ['张三', '李四', '王五', '赵六', '钱七', '孙八']

// 状态管理
const warehouses = ref([...warehousesData])
const spareParts = ref([...sparePartsData])
const employees = ref([...employeesData])

// 筛选和搜索
const filterForm = reactive({
  type: 'all',
  stock: 'all',
  search: ''
})

// 对话框状态
const showAddWarehouseDialog = ref(false)
const showAddDialog = ref(false)
const showMoveDialog = ref(false)
const showBorrowDialog = ref(false)
const showReturnDialog = ref(false)

// 选中的仓库和备件
const selectedWarehouse = ref(null)
const selectedPart = ref(null)

// 表单数据
const newWarehouse = reactive({
  name: '',
  type: 'small',
  manager: ''
})

const newPart = reactive({
  name: '',
  quantity: 1,
  safetyStock: 0,
  isValuable: false,
  location: ''
})

const movePart = reactive({
  id: null,
  quantity: 1,
  targetWarehouse: null
})

const borrowPart = reactive({
  id: null,
  quantity: 1,
  employee: ''
})

const returnRecord = reactive({
  id: null,
  quantity: 1,
  installed: false
})

const borrowRecords = ref([])

// 计算属性
const totalParts = computed(() => {
  return warehouses.value.reduce((total, warehouse) => {
    return total + warehouse.spareParts.reduce((sum, part) => sum + part.quantity, 0)
  }, 0)
})

const lowStockItemsCount = computed(() => {
  let count = 0
  warehouses.value.forEach(warehouse => {
    count += warehouse.spareParts.filter(part => part.quantity <= part.safetyStock).length
  })
  return count
})

const borrowedItemsCount = computed(() => {
  return spareParts.value.reduce((total, part) => {
    return total + part.borrowedItems.reduce((sum, item) => {
      return sum + (item.returnQuantity ? item.quantity - item.returnQuantity : item.quantity)
    }, 0)
  }, 0)
})

const filteredWarehouses = computed(() => {
  return warehouses.value.filter(warehouse => {
    // 按类型筛选
    if (filterForm.type !== 'all' && warehouse.type !== filterForm.type) {
      return false
    }

    // 按搜索词筛选
    if (filterForm.search) {
      const query = filterForm.search.toLowerCase()
      const hasMatchingPart = warehouse.spareParts.some(part =>
          part.name.toLowerCase().includes(query)
      )
      return warehouse.name.toLowerCase().includes(query) || hasMatchingPart
    }

    return true
  })
})

// 统计卡片数据
const stats = computed(() => [
  {
    icon: 'office-building',
    color: 'blue',
    value: warehouses.value.length,
    label: '仓库总数'
  },
  {
    icon: 'box',
    color: 'green',
    value: totalParts.value,
    label: '备件总数'
  },
  {
    icon: 'warning-outline',
    color: 'orange',
    value: lowStockItemsCount.value,
    label: '低库存预警'
  },
  {
    icon: 'thumb',
    color: 'purple',
    value: borrowedItemsCount.value,
    label: '借出中备件'
  }
])

// 方法
function filteredParts(warehouse) {
  let parts = warehouse.spareParts

  // 按库存状态筛选
  if (filterForm.stock === 'low') {
    parts = parts.filter(part => part.quantity <= part.safetyStock)
  }

  // 按搜索词筛选
  if (filterForm.search) {
    const query = filterForm.search.toLowerCase()
    parts = parts.filter(part => part.name.toLowerCase().includes(query))
  }

  return parts
}

function getWarehouseTotalQuantity(warehouse) {
  return warehouse.spareParts.reduce((total, part) => total + part.quantity, 0)
}

function getLowStockCount(warehouse) {
  return warehouse.spareParts.filter(part => part.quantity <= part.safetyStock).length
}

function getPartById(partId) {
  for (const warehouse of warehouses.value) {
    const part = warehouse.spareParts.find(p => p.id === partId)
    if (part) return part
  }
  return null
}

function openAddPartsDialog(warehouse) {
  selectedWarehouse.value = warehouse
  Object.assign(newPart, {
    name: '',
    quantity: 1,
    safetyStock: 0,
    isValuable: false,
    location: ''
  })
  showAddDialog.value = true
}

function addPart() {
  if (!newPart.name || newPart.quantity <= 0) {
    ElMessage.warning('请填写完整的备件信息')
    return
  }

  const part = {
    id: Date.now(),
    ...newPart
  }

  selectedWarehouse.value.spareParts.push(part)
  showAddDialog.value = false
  ElMessage.success('备件添加成功')
}

function openMoveDialog(warehouse, part) {
  selectedWarehouse.value = warehouse
  selectedPart.value = part
  Object.assign(movePart, {
    id: part.id,
    quantity: 1,
    targetWarehouse: warehouses.value.find(w => w.id !== warehouse.id)?.id || null
  })
  showMoveDialog.value = true
}

const canMove = computed(() => {
  if (!selectedPart.value) return false
  return movePart.quantity > 0 &&
      movePart.quantity <= selectedPart.value.quantity &&
      movePart.targetWarehouse !== null
})

function moveParts() {
  if (!canMove.value) return

  const sourcePart = selectedWarehouse.value.spareParts.find(p => p.id === movePart.id)
  if (!sourcePart || sourcePart.quantity < movePart.quantity) return

  // 减少源仓库库存
  sourcePart.quantity -= movePart.quantity

  // 如果库存为0，从源仓库移除该备件
  if (sourcePart.quantity === 0) {
    const index = selectedWarehouse.value.spareParts.findIndex(p => p.id === movePart.id)
    if (index !== -1) {
      selectedWarehouse.value.spareParts.splice(index, 1)
    }
  }

  // 增加目标仓库库存
  const targetWarehouse = warehouses.value.find(w => w.id === movePart.targetWarehouse)
  if (targetWarehouse) {
    const targetPart = targetWarehouse.spareParts.find(p => p.name === sourcePart.name)

    if (targetPart) {
      targetPart.quantity += movePart.quantity
    } else {
      targetWarehouse.spareParts.push({
        ...sourcePart,
        quantity: movePart.quantity
      })
    }
  }

  showMoveDialog.value = false
  ElMessage.success('备件移动成功')
}

function openBorrowDialog(warehouse, part = null) {
  selectedWarehouse.value = warehouse
  selectedPart.value = part

  Object.assign(borrowPart, {
    id: part ? part.id : null,
    quantity: 1,
    employee: employees.value[0] || ''
  })

  showBorrowDialog.value = true
}

const canBorrow = computed(() => {
  const part = selectedPart.value || getPartById(borrowPart.id)
  if (!part) return false

  return borrowPart.quantity > 0 &&
      borrowPart.quantity <= part.quantity &&
      borrowPart.employee !== ''
})

function borrowPartAction() {
  if (!canBorrow.value) return

  const part = selectedPart.value || getPartById(borrowPart.id)
  if (!part || part.quantity < borrowPart.quantity) return

  // 减少库存
  part.quantity -= borrowPart.quantity

  // 记录借出信息
  const sparePart = spareParts.value.find(p => p.name === part.name)
  if (sparePart) {
    sparePart.borrowedItems.push({
      employee: borrowPart.employee,
      borrowDate: new Date().toISOString().split('T')[0],
      quantity: borrowPart.quantity,
      manager: selectedWarehouse.value.manager,
      returnDate: null,
      returnQuantity: 0,
      returnManager: null,
      installed: false
    })
  }

  showBorrowDialog.value = false
  ElMessage.success('备件借出成功')
}

function openReturnDialog(warehouse) {
  selectedWarehouse.value = warehouse
  borrowRecords.value = []

  // 收集所有可归还的记录
  spareParts.value.forEach(part => {
    part.borrowedItems.forEach((record, index) => {
      if (!record.returnDate || record.returnQuantity < record.quantity) {
        borrowRecords.value.push({
          index: index,
          partId: part.id,
          partName: part.name,
          employee: record.employee,
          borrowDate: record.borrowDate,
          borrowedQuantity: record.quantity,
          returnedQuantity: record.returnQuantity || 0
        })
      }
    })
  })

  Object.assign(returnRecord, {
    id: null,
    quantity: 1,
    installed: false
  })

  showReturnDialog.value = true
}

const canReturn = computed(() => {
  if (returnRecord.id === null) return false

  const record = borrowRecords.value[returnRecord.id]
  if (!record) return false

  const remaining = record.borrowedQuantity - (record.returnedQuantity || 0)
  return returnRecord.quantity > 0 && returnRecord.quantity <= remaining
})

function returnPartAction() {
  if (!canReturn.value) return

  const record = borrowRecords.value[returnRecord.id]
  const sparePart = spareParts.value.find(p => p.id === record.partId)
  const borrowRecord = sparePart.borrowedItems[record.index]

  // 更新归还信息
  const returnQty = Math.min(returnRecord.quantity, record.borrowedQuantity - record.returnedQuantity)
  borrowRecord.returnQuantity = (borrowRecord.returnQuantity || 0) + returnQty
  borrowRecord.returnDate = new Date().toISOString().split('T')[0]
  borrowRecord.returnManager = selectedWarehouse.value.manager
  borrowRecord.installed = returnRecord.installed

  // 增加库存
  const warehousePart = selectedWarehouse.value.spareParts.find(p => p.name === record.partName)
  if (warehousePart) {
    warehousePart.quantity += returnQty
  } else {
    selectedWarehouse.value.spareParts.push({
      id: Date.now(),
      name: record.partName,
      quantity: returnQty,
      safetyStock: 0,
      isValuable: sparePart.isValuable,
      location: '待定'
    })
  }

  showReturnDialog.value = false
  ElMessage.success('备件归还成功')
}

function addWarehouse() {
  if (!newWarehouse.name || !newWarehouse.manager) {
    ElMessage.warning('请填写完整的仓库信息')
    return
  }

  const warehouse = {
    id: Date.now(),
    name: newWarehouse.name,
    type: newWarehouse.type,
    manager: newWarehouse.manager,
    spareParts: []
  }

  warehouses.value.push(warehouse)
  showAddWarehouseDialog.value = false

  // 重置表单
  Object.assign(newWarehouse, {
    name: '',
    type: 'small',
    manager: ''
  })

  ElMessage.success('仓库添加成功')
}

function editWarehouse(warehouse) {
  // 在实际应用中，这里应该打开编辑对话框
  ElMessage.info('编辑功能待实现')
}

function deleteWarehouse(id) {
  ElMessageBox.confirm('确定要删除这个仓库吗？此操作不可恢复。', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    const index = warehouses.value.findIndex(w => w.id === id)
    if (index !== -1) {
      warehouses.value.splice(index, 1)
      ElMessage.success('仓库删除成功')
    }
  }).catch(() => {
    // 用户取消删除
  })
}

function handleClose(done) {
  done()
}
</script>

<style scoped>
.warehouse-management {
  background-color: #f5f7f9;
  min-height: 100vh;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #fff;
  border-bottom: 1px solid #e6e8ec;
  padding: 0 20px;
}

.header h1 {
  color: #2c3e50;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 10px;
}

.stats-overview {
  margin-bottom: 20px;
}

.stat-card {
  margin-bottom: 20px;
}

.stat-content {
  display: flex;
  align-items: center;
}

.stat-icon {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 15px;
  font-size: 20px;
  color: white;
}

.stat-icon.blue {
  background: #409EFF;
}

.stat-icon.green {
  background: #67C23A;
}

.stat-icon.orange {
  background: #E6A23C;
}

.stat-icon.purple {
  background: #8E44AD;
}

.stat-info h3 {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: #2c3e50;
}

.stat-info p {
  margin: 4px 0 0;
  color: #7f8c8d;
  font-size: 14px;
}

.filter-card {
  margin-bottom: 20px;
}

.warehouse-filter {
  padding: 10px 0;
}

.warehouse-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.warehouse-card {
  margin-bottom: 20px;
}

.warehouse-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
}

.warehouse-title {
  display: flex;
  align-items: center;
  gap: 10px;
}

.warehouse-title h2 {
  margin: 0;
  color: #2c3e50;
  font-size: 18px;
}

.warehouse-manager {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #7f8c8d;
  font-size: 14px;
}

.warehouse-actions {
  display: flex;
  gap: 8px;
}

.inventory-summary {
  margin-bottom: 20px;
  padding: 0 10px;
}

.summary-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.summary-item .label {
  font-size: 12px;
  color: #7f8c8d;
}

.summary-item .value {
  font-size: 16px;
  font-weight: 600;
  color: #2c3e50;
}

.summary-item .value.warning {
  color: #e74c3c;
}

.inventory-table-container {
  margin-bottom: 20px;
}

.part-name {
  display: flex;
  align-items: center;
  gap: 8px;
}

.valuable-icon {
  color: #f1c40f;
}

.part-actions {
  display: flex;
  gap: 8px;
}

.warehouse-footer {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.move-dialog-content, .return-info {
  margin-bottom: 16px;
}

.move-info p, .return-info p {
  margin: 8px 0;
  color: #2c3e50;
}

.move-info strong, .return-info strong {
  color: #1976d2;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>
