<template>
  <div class="app-container">
    <!-- 过滤条件区 -->
    <div class="filter-container">
      <el-form :model="filterForm" class="filter-form">
        <el-form-item label="备件名称/描述">
          <el-input
              v-model="searchQuery"
              placeholder="请输入备件名称或描述"
              clearable
              @input="resetPagination"
          >
            <template #prefix>
              <i class="el-icon-search"></i>
            </template>
          </el-input>
        </el-form-item>

        <!-- 添加物料分类过滤 -->
        <el-form-item label="物料分类">
          <el-select
              v-model="filterCategory"
              placeholder="请选择物料分类"
              clearable
              @change="resetPagination"
          >
            <el-option value="all">所有分类</el-option>
            <el-option
                v-for="category in categoryOptions"
                :key="category.value"
                :value="category.value"
            >
              {{ category.label }}
            </el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="贵重属性">
          <el-select
              v-model="filterValuable"
              placeholder="请选择贵重属性"
              clearable
              @change="resetPagination"
          >
            <el-option value="all">所有贵重属性</el-option>
            <el-option value="yes">贵重</el-option>
            <el-option value="no">非贵重</el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="库存状态">
          <el-select
              v-model="filterStock"
              placeholder="请选择库存状态"
              clearable
              @change="resetPagination"
          >
            <el-option value="all">所有库存状态</el-option>
            <el-option value="low">库存不足</el-option>
            <el-option value="sufficient">库存充足</el-option>
          </el-select>
        </el-form-item>
      </el-form>

      <!-- 操作按钮区 -->
      <div class="operation-buttons">
        <el-button type="primary" icon="plus" @click="openAddDialog">添加备件</el-button>
      </div>
    </div>

    <!-- 表格区 -->
    <div class="table-container">
      <div class="table-header">
        <div class="total-text">共 {{ filteredParts.length }} 个备件</div>
        <el-button type="text" icon="el-icon-refresh" @click="resetPagination">刷新</el-button>
      </div>

      <!-- 空数据提示 -->
      <div v-if="filteredParts.length === 0" class="empty-data-hint">
        <el-empty description="暂无符合条件的备件数据"></el-empty>
      </div>

      <!-- 表格 -->
      <el-table
          v-if="filteredParts.length > 0"
          :data="paginatedParts"
          row-key="id"
          border
          style="width: 100%"
      >
        <el-table-column prop="id" label="ID" width="80"></el-table-column>
        <el-table-column prop="name" label="名称" width="180">
          <template #default="{ row }">
            <span class="part-link">{{ row.name }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="category" label="物料分类" width="120">
          <template #default="{ row }">
            <span>{{ getCategoryLabel(row.category) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="description" label="描述" min-width="200">
          <template #default="{ row }">
            <div class="description-cell">{{ row.description }}</div>
          </template>
        </el-table-column>
        <el-table-column prop="totalQuantity" label="总库存" width="100">
          <template #default="{ row }">
            <span :class="row.totalQuantity <= 3 ? 'low-stock' : ''">{{ row.totalQuantity }}</span>
          </template>
        </el-table-column>
        <el-table-column label="是否贵重" width="120">
          <template #default="{ row }">
            <span :class="['status-tag', row.isValuable ? 'valuable' : 'not-valuable']">
              {{ row.isValuable ? '贵重' : '非贵重' }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="库存状态" width="120">
          <template #default="{ row }">
            <span :class="getStockStatusClass(row.totalQuantity)">
              {{ getStockStatusText(row.totalQuantity) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button type="text" size="small" @click="editPart(row)">编辑</el-button>
            <el-button
                type="text"
                size="small"
                @click="deletePart(row)"
                :disabled="row.totalQuantity > 0"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination">
        <el-pagination
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            :current-page="currentPage"
            :page-sizes="[10, 20, 50]"
            :page-size="itemsPerPage"
            layout="total, sizes, prev, pager, next, jumper"
            :total="filteredParts.length"
        ></el-pagination>
      </div>
    </div>

    <!-- 弹窗 -->
    <el-dialog
        v-model="showDialog"
        :title="isEditing ? '编辑备件' : '添加备件'"
        class="add-device-dialog"
        width="500px"
    >
      <div class="dialog-body">
        <el-form :model="currentPart" label-width="100px" label-position="top">
          <el-form-item label="备件名称" required>
            <el-input v-model="currentPart.name" placeholder="请输入备件名称"></el-input>
          </el-form-item>

          <!-- 添加物料分类选择 -->
          <el-form-item label="物料分类" required>
            <el-select v-model="currentPart.category" placeholder="请选择物料分类">
              <el-option
                  v-for="category in categoryOptions"
                  :key="category.value"
                  :value="category.value"
                  :label="category.label"
              ></el-option>
            </el-select>
          </el-form-item>

          <el-form-item label="描述">
            <el-input
                v-model="currentPart.description"
                placeholder="请输入备件描述"
                type="textarea"
                rows="3"
            ></el-input>
          </el-form-item>

          <el-form-item label="是否贵重">
            <el-checkbox v-model="currentPart.isValuable">标记为贵重备件</el-checkbox>
          </el-form-item>
        </el-form>
      </div>

      <div class="dialog-footer">
        <el-button @click="closeDialog">取消</el-button>
        <el-button type="primary" @click="savePart">{{ isEditing ? '更新' : '添加' }}</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { ElMessage, ElMessageBox, ElEmpty } from 'element-plus'

// 物料分类选项
const categoryOptions = [
  { value: 'screwdriver', label: '螺丝刀' },
  { value: 'flat_screwdriver', label: '一字螺丝刀' },
  { value: 'cross_screwdriver', label: '十字螺丝刀' },
  { value: 'bearing', label: '轴承' },
  { value: 'motor', label: '电机' },
  { value: 'sensor', label: '传感器' },
  { value: 'controller', label: '控制器' },
  { value: 'gear', label: '齿轮' },
  { value: 'other', label: '其他' }
]

// 模拟备件数据
const spareParts = [
  { id: 1, name: '轴承', category: 'bearing', description: '机械轴承，型号6205', totalQuantity: 15, isValuable: false },
  { id: 2, name: '电机', category: 'motor', description: '驱动电机，功率2.5kW', totalQuantity: 3, isValuable: true },
  { id: 3, name: '传感器', category: 'sensor', description: '光电传感器', totalQuantity: 8, isValuable: false },
  { id: 4, name: '控制器', category: 'controller', description: '主控制器模块', totalQuantity: 2, isValuable: true },
  { id: 5, name: '齿轮', category: 'gear', description: '传动齿轮', totalQuantity: 20, isValuable: false },
  { id: 6, name: '十字螺丝刀', category: 'cross_screwdriver', description: '十字型螺丝刀', totalQuantity: 12, isValuable: false },
  { id: 7, name: '一字螺丝刀', category: 'flat_screwdriver', description: '一字型螺丝刀', totalQuantity: 8, isValuable: false },
]

// 状态管理
const parts = ref([])
const searchQuery = ref('')
const filterCategory = ref('all')
const filterValuable = ref('all')
const filterStock = ref('all')
const showDialog = ref(false)
const isEditing = ref(false)
const currentPart = ref({
  id: null,
  name: '',
  category: '',
  description: '',
  isValuable: false
})
const currentPage = ref(1)
const itemsPerPage = ref(10)
const filterForm = reactive({})

// 获取分类标签
const getCategoryLabel = (categoryValue) => {
  const category = categoryOptions.find(item => item.value === categoryValue)
  return category ? category.label : '未知分类'
}

// 过滤备件
const filteredParts = computed(() => {
  return parts.value.filter(part => {
    // 文本搜索
    const matchesSearch = searchQuery.value === '' ||
        part.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
        part.description.toLowerCase().includes(searchQuery.value.toLowerCase())

    // 分类过滤
    const matchesCategory = filterCategory.value === 'all' || part.category === filterCategory.value

    // 贵重属性过滤
    const matchesValuable = filterValuable.value === 'all' ||
        (filterValuable.value === 'yes' && part.isValuable) ||
        (filterValuable.value === 'no' && !part.isValuable)

    // 库存状态过滤
    const matchesStock = filterStock.value === 'all' ||
        (filterStock.value === 'low' && part.totalQuantity <= 3) ||
        (filterStock.value === 'sufficient' && part.totalQuantity > 3)

    return matchesSearch && matchesCategory && matchesValuable && matchesStock
  })
})

// 分页相关计算
const totalPages = computed(() => Math.ceil(filteredParts.value.length / itemsPerPage.value))

const paginatedParts = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return filteredParts.value.slice(start, end)
})

// 分页方法
const handleSizeChange = (val) => {
  itemsPerPage.value = val
  currentPage.value = 1
}

const handleCurrentChange = (val) => {
  currentPage.value = val
}

const resetPagination = () => {
  currentPage.value = 1
}

// 打开添加对话框
const openAddDialog = () => {
  isEditing.value = false
  currentPart.value = {
    id: null,
    name: '',
    category: '',
    description: '',
    isValuable: false
  }
  showDialog.value = true
}

// 编辑备件
const editPart = (part) => {
  isEditing.value = true
  currentPart.value = { ...part }
  showDialog.value = true
}

// 保存备件
const savePart = () => {
  if (!currentPart.value.name.trim()) {
    ElMessage.error('备件名称不能为空')
    return
  }

  if (!currentPart.value.category) {
    ElMessage.error('请选择物料分类')
    return
  }

  if (isEditing.value) {
    // 更新现有备件
    const index = parts.value.findIndex(p => p.id === currentPart.value.id)
    if (index !== -1) {
      parts.value.splice(index, 1, {
        ...parts.value[index],
        name: currentPart.value.name,
        category: currentPart.value.category,
        description: currentPart.value.description,
        isValuable: currentPart.value.isValuable
      })
    }
    ElMessage.success('备件更新成功')
  } else {
    // 添加新备件
    const newPart = {
      id: Date.now(),
      name: currentPart.value.name,
      category: currentPart.value.category,
      description: currentPart.value.description,
      totalQuantity: 0,
      isValuable: currentPart.value.isValuable,
      warehouses: [],
      borrowedItems: []
    }
    parts.value.push(newPart)
    ElMessage.success('备件添加成功')
  }
  showDialog.value = false
}

// 删除备件
const deletePart = (part) => {
  if (part.totalQuantity === 0) {
    ElMessageBox.confirm(`确定要删除备件 "${part.name}" 吗？此操作不可恢复。`, '删除确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(() => {
      const index = parts.value.findIndex(p => p.id === part.id)
      if (index !== -1) {
        parts.value.splice(index, 1)
      }
      ElMessage.success('备件已删除')
    }).catch(() => {
      ElMessage.info('已取消删除')
    })
  } else {
    ElMessage.warning('只有库存为0的备件才能删除')
  }
}

// 关闭对话框
const closeDialog = () => {
  showDialog.value = false
}

// 库存状态文本
const getStockStatusText = (quantity) => {
  if (quantity <= 0) return '缺货'
  if (quantity <= 3) return '库存不足'
  return '库存充足'
}

// 库存状态样式
const getStockStatusClass = (quantity) => {
  if (quantity <= 0) return 'status-tag out-of-stock'
  if (quantity <= 3) return 'status-tag low-stock-status'
  return 'status-tag in-stock'
}

// 监听过滤条件变化
watch([searchQuery, filterCategory, filterValuable, filterStock], () => {
  resetPagination()
})

// 加载数据
onMounted(() => {
  parts.value = [...spareParts]
})
</script>

<style scoped>
/* 全局样式重置 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: "PingFang SC", "Microsoft YaHei", sans-serif;
}

body {
  background-color: #f5f7fa;
  color: #333;
  padding: 20px;
}

/* 容器样式 */
.app-container {
  max-width: 1600px;
  margin: 0 auto;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

/* 过滤条件区 */
.filter-container {
  background: #fff;
  padding: 20px;
  margin: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
}

.filter-form {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 15px;
}

/* 操作按钮区 */
.operation-buttons {
  display: flex;
  gap: 10px;
  margin-top: 15px;
  flex-wrap: wrap;
  align-items: center;
}

.operation-buttons .el-button {
  height: 32px;
  line-height: 32px;
  padding: 0 15px;
  display: flex;
  align-items: center;
}

.operation-buttons .el-button i {
  margin-right: 5px;
}

/* 表格区 */
.table-container {
  padding: 0 20px 20px;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.total-text {
  font-size: 14px;
  color: #606266;
}

/* 空数据提示 */
.empty-data-hint {
  padding: 40px 0;
  text-align: center;
}

/* 分页控件 */
.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

/* 状态标签 */
.status-tag {
  border-radius: 4px;
  padding: 4px 8px;
  font-size: 12px;
  font-weight: 500;
}

.out-of-stock {
  background: #f8d7da;
  color: #721c24;
}

.low-stock-status {
  background: #fff3cd;
  color: #856404;
}

.in-stock {
  background: #d4edda;
  color: #155724;
}

.valuable {
  background-color: #fff3cd;
  color: #856404;
}

.not-valuable {
  background-color: #d4edda;
  color: #155724;
}

/* 链接样式 */
.part-link {
  color: #409EFF;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s;
}

.part-link:hover {
  color: #66b1ff;
  text-decoration: underline;
}

/* 描述单元格 */
.description-cell {
  max-width: 300px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 低库存样式 */
.low-stock {
  color: #f56c6c;
  font-weight: 500;
}

/* 弹窗样式 */
.add-device-dialog {
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.dialog-body {
  padding: 20px;
  max-height: 70vh;
  overflow-y: auto;
}

.dialog-footer {
  padding: 15px 20px;
  border-top: 1px solid #eee;
  text-align: right;
}

/* 表格样式穿透 */
:deep(.el-table) {
  overflow: visible;
}

:deep(.el-table__header-wrapper) {
  position: sticky;
  top: 0;
  z-index: 2;
  background: white;
}

/* 适配响应式 */
@media (max-width: 768px) {
  .filter-form {
    grid-template-columns: 1fr;
  }

  .operation-buttons {
    justify-content: center;
  }

  .table-container {
    height: auto;
  }
}
</style>
