<template>
  <div class="repair-order">
    <div class="page-header">
      <h2>维修工单管理</h2>
      <div class="header-actions">
        <el-button type="primary" @click="handleCreate">新建工单</el-button>
        <el-button @click="handleBatchAssign">批量派单</el-button>
      </div>
    </div>

    <div class="search-bar">
      <el-form :inline="true" :model="searchForm">
        <el-form-item label="工单状态">
          <el-select v-model="searchForm.status" placeholder="全部" clearable>
            <el-option label="待处理" value="待处理" />
            <el-option label="处理中" value="处理中" />
            <el-option label="已完成" value="已完成" />
          </el-select>
        </el-form-item>
        <el-form-item label="设备">
          <el-input v-model="searchForm.device" placeholder="设备名称/编号" />
        </el-form-item>
        <el-form-item label="时间范围">
          <el-date-picker
              v-model="searchForm.dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <div class="table-container">
      <el-table
          :data="tableData"
          v-loading="loading"
          @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="code" label="工单编号" width="120" />
        <el-table-column prop="deviceName" label="设备名称" />
        <el-table-column prop="faultDesc" label="故障描述" show-overflow-tooltip />
        <el-table-column prop="status" label="状态">
          <template #default="{ row }">
            <el-tag :type="statusType[row.status]">{{ row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="priority" label="优先级">
          <template #default="{ row }">
            <el-tag :type="priorityType[row.priority]">{{ row.priority }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="assignee" label="维修人" />
        <el-table-column prop="createTime" label="创建时间" width="180" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="handleEdit(row)">
              编辑
            </el-button>
            <el-button
                type="success"
                size="small"
                @click="handleAssign(row)"
                v-if="!row.assignee && row.status === '待处理'"
            >
              派单
            </el-button>
            <el-button type="info" size="small" @click="handleDetail(row)">
              详情
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination">
        <el-pagination
            v-model:current-page="currentPage"
            :page-size="pageSize"
            :total="total"
            layout="total, prev, pager, next"
            @current-change="handlePageChange"
        />
      </div>
    </div>

    <!-- 新建/编辑工单对话框 -->
    <el-dialog
        v-model="dialogVisible"
        :title="dialogTitle"
        width="800px"
        @close="handleDialogClose"
    >
      <RepairForm
          ref="repairFormRef"
          :data="currentOrder"
          :is-edit="isEdit"
          @submit="handleSubmit"
          @cancel="dialogVisible = false"
      />
    </el-dialog>

    <!-- 派单对话框 -->
    <el-dialog
        v-model="assignDialogVisible"
        title="工单派单"
        width="400px"
    >
      <el-form>
        <el-form-item label="维修人员">
          <el-select v-model="selectedAssignee" placeholder="请选择维修人员">
            <el-option label="李四" value="李四" />
            <el-option label="王五" value="王五" />
            <el-option label="赵六" value="赵六" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="assignDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmAssign">确认派单</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import RepairForm from '@/views/repair/components/RepairForm.vue'
import repairAPI from '@/api/repairB.js'

const loading = ref(false)
const tableData = ref([])
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const selectedRows = ref([])
const dialogVisible = ref(false)
const assignDialogVisible = ref(false)
const dialogTitle = ref('')
const isEdit = ref(false)
const currentOrder = ref({})
const selectedAssignee = ref('')
const assignOrderId = ref(null)

const searchForm = reactive({
  status: '',
  device: '',
  dateRange: []
})

const statusType = {
  '待处理': 'warning',
  '处理中': 'primary',
  '已完成': 'success'
}

const priorityType = {
  '低': 'info',
  '中': 'warning',
  '高': 'danger',
  '紧急': 'danger'
}

const loadData = async () => {
  loading.value = true
  try {
    const res = await repairAPI.getRepairOrders(
        currentPage.value - 1,
        pageSize.value,
        searchForm.device,
        searchForm.status
    )
    if (res.success) {
      tableData.value = res.data.content
      total.value = res.data.totalElements
    }
  } catch (error) {
    ElMessage.error('加载数据失败')
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  currentPage.value = 1
  loadData()
}

const handleReset = () => {
  searchForm.status = ''
  searchForm.device = ''
  searchForm.dateRange = []
  handleSearch()
}

const handleCreate = () => {
  dialogTitle.value = '新建维修工单'
  isEdit.value = false
  currentOrder.value = {}
  dialogVisible.value = true
}

const handleEdit = (row) => {
  dialogTitle.value = '编辑维修工单'
  isEdit.value = true
  currentOrder.value = { ...row }
  dialogVisible.value = true
}

const handleDetail = (row) => {
  // 跳转到详情页面或打开详情对话框
  console.log('查看详情:', row)
}

const handleAssign = (row) => {
  assignOrderId.value = row.id
  selectedAssignee.value = ''
  assignDialogVisible.value = true
}

const confirmAssign = async () => {
  if (!selectedAssignee.value) {
    ElMessage.warning('请选择维修人员')
    return
  }

  try {
    await repairAPI.assignRepairOrder(assignOrderId.value, selectedAssignee.value)
    ElMessage.success('派单成功')
    assignDialogVisible.value = false
    loadData()
  } catch (error) {
    ElMessage.error('派单失败')
  }
}

const handleSelectionChange = (val) => {
  selectedRows.value = val
}

const handleBatchAssign = () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请选择要派单的工单')
    return
  }
  // 批量派单逻辑
}

const handleSubmit = async (data) => {
  try {
    if (isEdit.value) {
      await repairAPI.updateRepairOrder(currentOrder.value.id, data)
      ElMessage.success('更新成功')
    } else {
      await repairAPI.createRepairOrder(data)
      ElMessage.success('创建成功')
    }
    dialogVisible.value = false
    loadData()
  } catch (error) {
    ElMessage.error('操作失败')
  }
}

const handleDialogClose = () => {
  currentOrder.value = {}
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.repair-order {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.search-bar {
  margin-bottom: 20px;
  padding: 20px;
  background: #f5f7fa;
  border-radius: 8px;
}

.table-container {
  background: white;
  border-radius: 8px;
  padding: 20px;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>
