<template>
  <div class="warehouse-management">
    <header class="header">
      <h1><i class="fas fa-warehouse"></i> 仓库管理系统</h1>
      <button class="btn-primary" @click="showAddWarehouseDialog = true">
        <i class="fas fa-plus"></i> 添加新仓库
      </button>
    </header>

    <div class="stats-overview">
      <div class="stat-card">
        <div class="stat-icon">
          <i class="fas fa-warehouse"></i>
        </div>
        <div class="stat-info">
          <h3>{{ warehouses.length }}</h3>
          <p>仓库总数</p>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">
          <i class="fas fa-boxes"></i>
        </div>
        <div class="stat-info">
          <h3>{{ totalParts }}</h3>
          <p>备件总数</p>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">
          <i class="fas fa-exclamation-triangle"></i>
        </div>
        <div class="stat-info">
          <h3>{{ lowStockItemsCount }}</h3>
          <p>低库存预警</p>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">
          <i class="fas fa-hand-holding"></i>
        </div>
        <div class="stat-info">
          <h3>{{ borrowedItemsCount }}</h3>
          <p>借出中备件</p>
        </div>
      </div>
    </div>

    <div class="warehouse-filter">
      <div class="filter-group">
        <label>仓库类型:</label>
        <select v-model="filterType">
          <option value="all">全部</option>
          <option value="large">大仓库</option>
          <option value="small">小仓库</option>
        </select>
      </div>
      <div class="filter-group">
        <label>库存状态:</label>
        <select v-model="filterStock">
          <option value="all">全部</option>
          <option value="low">仅低库存</option>
        </select>
      </div>
      <div class="search-group">
        <input type="text" v-model="searchQuery" placeholder="搜索备件或仓库...">
        <i class="fas fa-search"></i>
      </div>
    </div>

    <div class="warehouse-list">
      <div v-for="warehouse in filteredWarehouses" :key="warehouse.id" class="warehouse-card">
        <div class="warehouse-header">
          <div class="warehouse-title">
            <h2>{{ warehouse.name }}</h2>
            <span class="warehouse-type" :class="warehouse.type">
              {{ warehouse.type === 'large' ? '大仓库' : '小仓库' }}
            </span>
          </div>
          <div class="warehouse-manager">
            <i class="fas fa-user"></i>
            <span>负责人: {{ warehouse.manager }}</span>
          </div>
          <div class="warehouse-actions">
            <button class="btn-icon" @click="editWarehouse(warehouse)" title="编辑仓库">
              <i class="fas fa-edit"></i>
            </button>
            <button class="btn-icon btn-danger" @click="deleteWarehouse(warehouse.id)" title="删除仓库">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>

        <div class="inventory-summary">
          <div class="summary-item">
            <span class="label">备件种类:</span>
            <span class="value">{{ warehouse.spareParts.length }}</span>
          </div>
          <div class="summary-item">
            <span class="label">总库存量:</span>
            <span class="value">{{ getWarehouseTotalQuantity(warehouse) }}</span>
          </div>
          <div class="summary-item">
            <span class="label">低库存项:</span>
            <span class="value warning">{{ getLowStockCount(warehouse) }}</span>
          </div>
        </div>

        <div class="inventory-table-container">
          <table class="inventory-table">
            <thead>
            <tr>
              <th>备件名称</th>
              <th>数量</th>
              <th>安全库存</th>
              <th>位置</th>
              <th>状态</th>
              <th>操作</th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="part in filteredParts(warehouse)" :key="part.id"
                :class="{ 'low-stock': part.quantity <= part.safetyStock }">
              <td>
                <div class="part-name">
                  {{ part.name }}
                  <i v-if="part.isValuable" class="fas fa-gem valuable-icon" title="贵重物品"></i>
                </div>
              </td>
              <td>
                <span class="quantity">{{ part.quantity }}</span>
              </td>
              <td>{{ part.safetyStock }}</td>
              <td>{{ part.location }}</td>
              <td>
                  <span v-if="part.quantity <= part.safetyStock" class="status-badge warning">
                    <i class="fas fa-exclamation-circle"></i> 库存不足
                  </span>
                <span v-else class="status-badge success">
                    <i class="fas fa-check-circle"></i> 正常
                  </span>
              </td>
              <td>
                <div class="part-actions">
                  <button class="btn-sm" @click="openMoveDialog(warehouse, part)" title="移动">
                    <i class="fas fa-exchange-alt"></i>
                  </button>
                  <button class="btn-sm" @click="openBorrowDialog(warehouse, part)" title="借出">
                    <i class="fas fa-hand-holding"></i>
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="filteredParts(warehouse).length === 0">
              <td colspan="6" class="no-data">
                暂无备件数据
              </td>
            </tr>
            </tbody>
          </table>
        </div>

        <div class="warehouse-footer">
          <button class="btn-outline" @click="openAddPartsDialog(warehouse)">
            <i class="fas fa-plus"></i> 添加备件
          </button>
          <button class="btn-outline" @click="openBorrowDialog(warehouse)">
            <i class="fas fa-hand-holding"></i> 借出备件
          </button>
          <button class="btn-outline" @click="openReturnDialog(warehouse)">
            <i class="fas fa-undo"></i> 归还备件
          </button>
        </div>
      </div>
    </div>

    <!-- 添加仓库对话框 -->
    <ModalDialog :show="showAddWarehouseDialog" @close="showAddWarehouseDialog = false" title="添加新仓库">
      <div class="form-group">
        <label>仓库名称</label>
        <input type="text" v-model="newWarehouse.name" placeholder="输入仓库名称">
      </div>
      <div class="form-group">
        <label>仓库类型</label>
        <select v-model="newWarehouse.type">
          <option value="small">小仓库</option>
          <option value="large">大仓库</option>
        </select>
      </div>
      <div class="form-group">
        <label>负责人</label>
        <input type="text" v-model="newWarehouse.manager" placeholder="输入负责人姓名">
      </div>
      <template #footer>
        <button class="btn-secondary" @click="showAddWarehouseDialog = false">取消</button>
        <button class="btn-primary" @click="addWarehouse">确认</button>
      </template>
    </ModalDialog>

    <!-- 添加备件对话框 -->
    <ModalDialog :show="showAddDialog" @close="showAddDialog = false" :title="'添加备件到 ' + selectedWarehouse?.name">
      <div class="form-group">
        <label>备件名称</label>
        <input type="text" v-model="newPart.name" placeholder="输入备件名称">
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>数量</label>
          <input type="number" v-model="newPart.quantity" min="1">
        </div>
        <div class="form-group">
          <label>安全库存</label>
          <input type="number" v-model="newPart.safetyStock" min="0">
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>位置</label>
          <input type="text" v-model="newPart.location" placeholder="例如: A-1-1">
        </div>
        <div class="form-group">
          <label class="checkbox-label">
            <input type="checkbox" v-model="newPart.isValuable">
            是否为贵重物品
          </label>
        </div>
      </div>
      <template #footer>
        <button class="btn-secondary" @click="showAddDialog = false">取消</button>
        <button class="btn-primary" @click="addPart">确认</button>
      </template>
    </ModalDialog>

    <!-- 移动备件对话框 -->
    <ModalDialog :show="showMoveDialog" @close="showMoveDialog = false"
                 :title="'移动备件: ' + (selectedPart ? selectedPart.name : '')">
      <div v-if="selectedPart" class="move-dialog-content">
        <div class="move-info">
          <p>从 <strong>{{ selectedWarehouse?.name }}</strong> 移动</p>
          <p>当前库存: <strong>{{ selectedPart.quantity }}</strong></p>
        </div>
        <div class="form-group">
          <label>移动数量</label>
          <input type="number" v-model="movePart.quantity" :max="selectedPart.quantity" min="1">
        </div>
        <div class="form-group">
          <label>目标仓库</label>
          <select v-model="movePart.targetWarehouse">
            <option v-for="wh in warehouses.filter(w => w.id !== selectedWarehouse?.id)"
                    :key="wh.id" :value="wh.id">
              {{ wh.name }} ({{ wh.type === 'large' ? '大仓库' : '小仓库' }})
            </option>
          </select>
        </div>
      </div>
      <template #footer>
        <button class="btn-secondary" @click="showMoveDialog = false">取消</button>
        <button class="btn-primary" @click="moveParts" :disabled="!canMove">确认移动</button>
      </template>
    </ModalDialog>

    <!-- 借出备件对话框 -->
    <ModalDialog :show="showBorrowDialog" @close="showBorrowDialog = false"
                 :title="'从 ' + selectedWarehouse?.name + ' 借出备件'">
      <div v-if="!selectedPart" class="form-group">
        <label>选择备件</label>
        <select v-model="borrowPart.id">
          <option v-for="part in selectedWarehouse?.spareParts" :key="part.id" :value="part.id">
            {{ part.name }} (库存: {{ part.quantity }})
          </option>
        </select>
      </div>
      <div class="form-group">
        <label>借出数量</label>
        <input type="number" v-model="borrowPart.quantity"
               :max="selectedPart ? selectedPart.quantity : getPartById(borrowPart.id)?.quantity"
               min="1">
      </div>
      <div class="form-group">
        <label>借出员工</label>
        <select v-model="borrowPart.employee">
          <option v-for="emp in employees" :key="emp" :value="emp">{{ emp }}</option>
        </select>
      </div>
      <template #footer>
        <button class="btn-secondary" @click="showBorrowDialog = false">取消</button>
        <button class="btn-primary" @click="borrowPartAction" :disabled="!canBorrow">确认借出</button>
      </template>
    </ModalDialog>

    <!-- 归还备件对话框 -->
    <ModalDialog :show="showReturnDialog" @close="showReturnDialog = false"
                 :title="'归还备件到 ' + selectedWarehouse?.name">
      <div class="form-group">
        <label>选择借出记录</label>
        <select v-model="returnRecord.id">
          <option v-for="(record, index) in borrowRecords" :key="index" :value="index">
            {{ record.partName }} - {{ record.employee }} (借出: {{ record.borrowDate }})
          </option>
        </select>
      </div>
      <div v-if="returnRecord.id !== null" class="return-info">
        <p>借出数量: <strong>{{ borrowRecords[returnRecord.id]?.borrowedQuantity }}</strong></p>
        <p>已归还: <strong>{{ borrowRecords[returnRecord.id]?.returnedQuantity || 0 }}</strong></p>
        <p>待归还: <strong>{{ (borrowRecords[returnRecord.id]?.borrowedQuantity || 0) - (borrowRecords[returnRecord.id]?.returnedQuantity || 0) }}</strong></p>
      </div>
      <div class="form-group">
        <label>归还数量</label>
        <input type="number" v-model="returnRecord.quantity"
               :max="returnRecord.id !== null ? borrowRecords[returnRecord.id].borrowedQuantity - (borrowRecords[returnRecord.id].returnedQuantity || 0) : 0"
               min="1">
      </div>
      <div class="form-group">
        <label class="checkbox-label">
          <input type="checkbox" v-model="returnRecord.installed">
          是否已安装
        </label>
      </div>
      <template #footer>
        <button class="btn-secondary" @click="showReturnDialog = false">取消</button>
        <button class="btn-primary" @click="returnPartAction" :disabled="!canReturn">确认归还</button>
      </template>
    </ModalDialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import ModalDialog from './ModalDialog.vue'

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
const filterType = ref('all')
const filterStock = ref('all')
const searchQuery = ref('')

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
    if (filterType.value !== 'all' && warehouse.type !== filterType.value) {
      return false
    }

    // 按搜索词筛选
    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase()
      const hasMatchingPart = warehouse.spareParts.some(part =>
          part.name.toLowerCase().includes(query)
      )
      return warehouse.name.toLowerCase().includes(query) || hasMatchingPart
    }

    return true
  })
})

// 方法
function filteredParts(warehouse) {
  let parts = warehouse.spareParts

  // 按库存状态筛选
  if (filterStock.value === 'low') {
    parts = parts.filter(part => part.quantity <= part.safetyStock)
  }

  // 按搜索词筛选
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
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
  if (!newPart.name || newPart.quantity <= 0) return

  const part = {
    id: Date.now(),
    ...newPart
  }

  selectedWarehouse.value.spareParts.push(part)
  showAddDialog.value = false
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
}

function addWarehouse() {
  if (!newWarehouse.name || !newWarehouse.manager) return

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
}

function editWarehouse(warehouse) {
  // 在实际应用中，这里应该打开编辑对话框
  console.log('编辑仓库:', warehouse)
}

function deleteWarehouse(id) {
  if (confirm('确定要删除这个仓库吗？此操作不可恢复。')) {
    const index = warehouses.value.findIndex(w => w.id === id)
    if (index !== -1) {
      warehouses.value.splice(index, 1)
    }
  }
}
</script>

<style scoped>
.warehouse-management {
  padding: 20px;
  background-color: #f5f7f9;
  min-height: 100vh;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e8eaed;
}

.header h1 {
  color: #2c3e50;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 10px;
}

.stats-overview {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.stat-card {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-icon {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: #e3f2fd;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #1976d2;
  font-size: 20px;
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

.warehouse-filter {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
  flex-wrap: wrap;
  align-items: center;
}

.filter-group, .search-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.filter-group label, .search-group {
  font-weight: 500;
  color: #2c3e50;
  font-size: 14px;
}

.filter-group select, .search-group input {
  padding: 8px 12px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  font-size: 14px;
}

.search-group {
  position: relative;
  margin-left: auto;
}

.search-group input {
  padding-left: 36px;
  width: 250px;
}

.search-group i {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #7f8c8d;
}

.warehouse-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.warehouse-card {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.warehouse-header {
  padding: 16px 20px;
  background: #f8f9fa;
  border-bottom: 1px solid #e8eaed;
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

.warehouse-type {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.warehouse-type.large {
  background: #e3f2fd;
  color: #1976d2;
}

.warehouse-type.small {
  background: #f3e5f5;
  color: #7b1fa2;
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
  display: flex;
  padding: 12px 20px;
  background: #fafbfc;
  border-bottom: 1px solid #e8eaed;
  gap: 24px;
}

.summary-item {
  display: flex;
  flex-direction: column;
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
  overflow-x: auto;
}

.inventory-table {
  width: 100%;
  border-collapse: collapse;
}

.inventory-table th {
  background: #f8f9fa;
  padding: 12px 16px;
  text-align: left;
  font-weight: 600;
  color: #2c3e50;
  border-bottom: 1px solid #e8eaed;
}

.inventory-table td {
  padding: 12px 16px;
  border-bottom: 1px solid #e8eaed;
}

.inventory-table tr:last-child td {
  border-bottom: none;
}

.inventory-table tr.low-stock {
  background-color: #fff8f8;
}

.inventory-table tr.low-stock:hover {
  background-color: #ffefef;
}

.part-name {
  display: flex;
  align-items: center;
  gap: 8px;
}

.valuable-icon {
  color: #f1c40f;
}

.quantity {
  font-weight: 600;
  color: #2c3e50;
}

.status-badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.status-badge.success {
  background: #e8f5e9;
  color: #2e7d32;
}

.status-badge.warning {
  background: #ffecb3;
  color: #f57c00;
}

.part-actions {
  display: flex;
  gap: 8px;
}

.no-data {
  text-align: center;
  color: #7f8c8d;
  font-style: italic;
  padding: 20px;
}

.warehouse-footer {
  padding: 16px 20px;
  background: #f8f9fa;
  border-top: 1px solid #e8eaed;
  display: flex;
  gap: 12px;
}

/* 按钮样式 */
.btn-primary, .btn-secondary, .btn-outline, .btn-icon, .btn-sm {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid transparent;
}

.btn-primary {
  background: #1976d2;
  color: white;
}

.btn-primary:hover {
  background: #1565c0;
}

.btn-secondary {
  background: #f5f7f9;
  color: #2c3e50;
  border-color: #dcdfe6;
}

.btn-secondary:hover {
  background: #e8eaed;
}

.btn-outline {
  background: transparent;
  color: #1976d2;
  border-color: #1976d2;
}

.btn-outline:hover {
  background: #e3f2fd;
}

.btn-icon {
  padding: 6px;
  background: transparent;
  color: #7f8c8d;
}

.btn-icon:hover {
  background: #f5f7f9;
  color: #2c3e50;
}

.btn-icon.btn-danger {
  color: #e74c3c;
}

.btn-icon.btn-danger:hover {
  background: #ffebee;
}

.btn-sm {
  padding: 4px 8px;
  background: transparent;
  color: #7f8c8d;
}

.btn-sm:hover {
  background: #f5f7f9;
  color: #2c3e50;
}

/* 表单样式 */
.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
}

.form-row {
  display: flex;
  gap: 16px;
}

.form-row .form-group {
  flex: 1;
}

.form-group label {
  font-weight: 500;
  color: #2c3e50;
  font-size: 14px;
}

.form-group input, .form-group select {
  padding: 10px 12px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  font-size: 14px;
}

.form-group input:focus, .form-group select:focus {
  outline: none;
  border-color: #1976d2;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  margin-top: 16px;
}

.checkbox-label input {
  margin: 0;
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
</style>
