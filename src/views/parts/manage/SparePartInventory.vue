<template>
  <div class="spare-part-inventory">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2>备品备件台账</h2>
      <div>
        <el-button @click="activeTab = 'inventory'">库存管理</el-button>
        <el-button @click="activeTab = 'records'">操作记录</el-button>
      </div>
    </div>

    <!-- 库存管理标签页 -->
    <div v-if="activeTab === 'inventory'">
      <!-- 搜索栏 -->
      <div class="search-bar">
        <el-input
            v-model="searchKeyword"
            placeholder="搜索备件名称或编码..."
            style="width: 250px"
            @keyup.enter="loadInventory"
        />
        <el-select
            v-model="category"
            placeholder="全部类别"
            style="width: 150px; margin-left: 10px"
            @change="loadInventory"
        >
          <el-option label="全部类别" value="" />
          <el-option label="机械零件" value="机械零件" />
          <el-option label="电气元件" value="电气元件" />
          <el-option label="传动部件" value="传动部件" />
        </el-select>
        <el-button type="primary" style="margin-left: 10px" @click="showOperationDialog('inbound')">
          零件入库
        </el-button>
        <el-button type="primary" @click="showOperationDialog('outbound')">
          零件出库
        </el-button>
      </div>

      <!-- 库存表格 -->
      <el-table :data="inventoryData" v-loading="loading" border>
        <el-table-column prop="code" label="备件编码" width="120" />
        <el-table-column prop="name" label="备件名称" />
        <el-table-column prop="category" label="类别" width="100" />
        <el-table-column prop="totalQuantity" label="总库存" width="80" align="center" />
        <el-table-column prop="availableQuantity" label="可用库存" width="80" align="center" />
        <el-table-column prop="safetyStock" label="安全库存" width="80" align="center" />
        <el-table-column prop="unit" label="单位" width="60" />
        <el-table-column label="库存状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.warningStatus === '库存不足' ? 'danger' : 'success'">
              {{ row.warningStatus }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click="showOperationDialog('borrow', row)">借用</el-button>
            <el-button size="small" @click="showOperationDialog('return', row)">退场</el-button>
            <el-button size="small" type="danger" @click="showOperationDialog('scrap', row)">
              报废
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination">
        <el-pagination
            v-model:current-page="currentPage"
            :page-size="pageSize"
            :total="total"
            layout="prev, pager, next"
            @current-change="loadInventory"
        />
      </div>
    </div>

    <!-- 操作记录标签页 -->
    <div v-if="activeTab === 'records'">
      <div class="search-bar">
        <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            style="width: 300px"
        />
        <el-select
            v-model="recordType"
            placeholder="全部类型"
            style="width: 150px; margin-left: 10px"
        >
          <el-option label="全部类型" value="" />
          <el-option label="入库" value="入库" />
          <el-option label="出库" value="出库" />
          <el-option label="借用" value="借用" />
          <el-option label="退场" value="退场" />
          <el-option label="报废" value="报废" />
        </el-select>
        <el-button type="primary" style="margin-left: 10px" @click="loadRecords">
          查询
        </el-button>
      </div>

      <el-table :data="recordData" v-loading="loading" border>
        <el-table-column prop="code" label="备件编码" width="120" />
        <el-table-column prop="name" label="备件名称" />
        <el-table-column prop="type" label="操作类型" width="80">
          <template #default="{ row }">
            <el-tag :type="getRecordTypeColor(row.type)">{{ row.type }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="quantity" label="数量" width="80" align="center" />
        <el-table-column prop="unit" label="单位" width="60" />
        <el-table-column prop="operator" label="操作人" width="100" />
        <el-table-column prop="operateTime" label="操作时间" width="180" />
        <el-table-column prop="remark" label="备注" show-overflow-tooltip />
      </el-table>

      <div class="pagination">
        <el-pagination
            v-model:current-page="recordCurrentPage"
            :page-size="pageSize"
            :total="recordTotal"
            layout="prev, pager, next"
            @current-change="loadRecords"
        />
      </div>
    </div>

    <!-- 操作对话框 -->
    <el-dialog
        v-model="operationDialogVisible"
        :title="operationTitle"
        width="500px"
        @close="handleOperationClose"
    >
      <el-form :model="operationForm" label-width="80px">
        <el-form-item label="备件">
          <span>{{ currentSparePart?.name || '' }}</span>
        </el-form-item>
        <el-form-item label="当前库存">
          <span>{{ currentSparePart?.availableQuantity || 0 }} {{ currentSparePart?.unit || '' }}</span>
        </el-form-item>
        <el-form-item label="数量" required>
          <el-input-number v-model="operationForm.quantity" :min="1" :max="1000" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="operationForm.remark" type="textarea" :rows="3" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="operationDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleOperationSubmit">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import sparePartAPI from '@/api/sparePart'

// 标签页
const activeTab = ref('inventory')

// 库存数据
const loading = ref(false)
const searchKeyword = ref('')
const category = ref('')
const inventoryData = ref([])
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

// 记录数据
const dateRange = ref([])
const recordType = ref('')
const recordData = ref([])
const recordCurrentPage = ref(1)
const recordTotal = ref(0)

// 操作对话框
const operationDialogVisible = ref(false)
const operationType = ref('')
const operationTitle = ref('')
const currentSparePart = ref(null)
const operationForm = reactive({
  quantity: 1,
  remark: ''
})

// 加载库存
const loadInventory = async () => {
  loading.value = true
  try {
    const res = await sparePartAPI.getSparePartInventory(
        currentPage.value - 1,
        pageSize.value,
        searchKeyword.value,
        category.value
    )
    inventoryData.value = res.data.content
    total.value = res.data.totalElements
  } catch (error) {
    ElMessage.error('加载库存失败')
  } finally {
    loading.value = false
  }
}

// 加载记录
const loadRecords = async () => {
  loading.value = true
  try {
    const res = await sparePartAPI.getInventoryRecords(
        recordCurrentPage.value - 1,
        pageSize.value,
        recordType.value,
        dateRange.value
    )
    recordData.value = res.data.content
    recordTotal.value = res.data.totalElements
  } catch (error) {
    ElMessage.error('加载记录失败')
  } finally {
    loading.value = false
  }
}

// 显示操作对话框
const showOperationDialog = (type, row) => {
  operationType.value = type
  currentSparePart.value = row || null

  const titles = {
    inbound: '零件入库',
    outbound: '零件出库',
    borrow: '零件借用',
    return: '零件退场',
    scrap: '零件报废'
  }
  operationTitle.value = titles[type]
  operationForm.quantity = 1
  operationForm.remark = ''
  operationDialogVisible.value = true
}

// 提交操作
const handleOperationSubmit = async () => {
  try {
    let apiMethod
    switch (operationType.value) {
      case 'inbound':
        apiMethod = sparePartAPI.sparePartInbound
        break
      case 'outbound':
        apiMethod = sparePartAPI.sparePartOutbound
        break
      case 'borrow':
        apiMethod = sparePartAPI.sparePartBorrow
        break
      case 'return':
        apiMethod = sparePartAPI.sparePartReturn
        break
      case 'scrap':
        apiMethod = sparePartAPI.sparePartScrap
        break
    }

    const params = {
      sparePartId: currentSparePart.value?.id,
      quantity: operationForm.quantity,
      remark: operationForm.remark
    }

    await apiMethod(params)
    ElMessage.success(`${operationTitle.value}成功`)
    operationDialogVisible.value = false

    // 刷新数据
    if (activeTab.value === 'inventory') {
      loadInventory()
    } else {
      loadRecords()
    }
  } catch (error) {
    ElMessage.error('操作失败')
  }
}

const handleOperationClose = () => {
  operationForm.quantity = 1
  operationForm.remark = ''
  currentSparePart.value = null
}

const getRecordTypeColor = (type) => {
  const colors = {
    '入库': 'success',
    '出库': 'primary',
    '借用': 'warning',
    '退场': 'info',
    '报废': 'danger'
  }
  return colors[type] || ''
}

onMounted(() => {
  loadInventory()
})
</script>

<style scoped>
.spare-part-inventory {
  padding: 20px;
  background: #f5f7fa;
  min-height: 100vh;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.search-bar {
  margin-bottom: 20px;
  background: white;
  padding: 15px;
  border-radius: 8px;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}
</style>
