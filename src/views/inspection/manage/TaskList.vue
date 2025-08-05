<template>
  <div class="task-list-container">
    <div class="header">
      <h2>点检任务列表</h2>
      <div class="actions">
        <el-button type="primary" @click="handleCreateTask">
          <el-icon><Plus /></el-icon>
          创建任务
        </el-button>
        <el-button @click="handleExport">
          <el-icon><Download /></el-icon>
          导出
        </el-button>
      </div>
    </div>

    <div class="filter-area">
      <el-form :inline="true" :model="filterForm">
        <el-form-item label="任务状态">
          <el-select v-model="filterForm.status" placeholder="请选择状态">
            <el-option
              v-for="item in statusOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="设备类型">
          <el-select v-model="filterForm.deviceType" placeholder="请选择设备类型">
            <el-option
              v-for="item in deviceTypeOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="任务日期">
          <el-date-picker
            v-model="filterForm.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <el-table
      :data="taskList"
      border
      style="width: 100%"
      v-loading="loading"
    >
      <el-table-column prop="taskNo" label="任务编号" width="120" />
      <el-table-column prop="taskName" label="任务名称" width="150" />
      <el-table-column prop="deviceName" label="设备名称" width="120" />
      <el-table-column prop="deviceType" label="设备类型" width="100">
        <template #default="{row}">
          <el-tag>{{ row.deviceType }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="planName" label="所属计划" width="150" />
      <el-table-column prop="startTime" label="开始时间" width="160" />
      <el-table-column prop="endTime" label="结束时间" width="160" />
      <el-table-column prop="status" label="状态" width="100">
        <template #default="{row}">
          <el-tag :type="getStatusTagType(row.status)">
            {{ formatStatus(row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="operator" label="执行人" width="100" />
      <el-table-column label="操作" width="180" fixed="right">
        <template #default="{row}">
          <el-button
            v-if="row.status === 'PENDING'"
            type="primary"
            size="small"
            @click="handleExecute(row)"
          >
            执行
          </el-button>
          <el-button
            v-else
            type="info"
            size="small"
            @click="handleViewDetail(row)"
          >
            详情
          </el-button>
          <el-button
            v-if="row.status === 'PENDING'"
            type="danger"
            size="small"
            @click="handleCancel(row)"
          >
            取消
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination">
      <el-pagination
        v-model:current-page="pagination.current"
        v-model:page-size="pagination.size"
        :total="pagination.total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>

    <!-- 任务详情对话框 -->
    <el-dialog
      v-model="detailDialogVisible"
      :title="`任务详情 - ${currentTask.taskNo}`"
      width="70%"
    >
      <el-descriptions :column="2" border>
        <el-descriptions-item label="任务编号">
          {{ currentTask.taskNo }}
        </el-descriptions-item>
        <el-descriptions-item label="任务名称">
          {{ currentTask.taskName }}
        </el-descriptions-item>
        <el-descriptions-item label="设备名称">
          {{ currentTask.deviceName }}
        </el-descriptions-item>
        <el-descriptions-item label="设备类型">
          {{ currentTask.deviceType }}
        </el-descriptions-item>
        <el-descriptions-item label="所属计划">
          {{ currentTask.planName }}
        </el-descriptions-item>
        <el-descriptions-item label="执行人">
          {{ currentTask.operator }}
        </el-descriptions-item>
        <el-descriptions-item label="开始时间">
          {{ currentTask.startTime }}
        </el-descriptions-item>
        <el-descriptions-item label="结束时间">
          {{ currentTask.endTime }}
        </el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="getStatusTagType(currentTask.status)">
            {{ formatStatus(currentTask.status) }}
          </el-tag>
        </el-descriptions-item>
      </el-descriptions>

      <div class="task-result" v-if="currentTask.status !== 'PENDING'">
        <h3>点检结果</h3>
        <el-table :data="currentTask.results" border style="width: 100%">
          <el-table-column prop="itemName" label="检查项" width="180" />
          <el-table-column prop="standard" label="标准值" width="120" />
          <el-table-column prop="actualValue" label="实际值" width="120" />
          <el-table-column prop="result" label="结果" width="100">
            <template #default="{row}">
              <el-tag :type="row.result === 'PASS' ? 'success' : 'danger'">
                {{ row.result === 'PASS' ? '合格' : '不合格' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="remark" label="备注" />
        </el-table>
      </div>

      <template #footer>
        <el-button @click="detailDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Plus, Download } from '@element-plus/icons-vue'
import { getTaskList, executeTask, cancelTask } from '@/api/inspection'

const loading = ref(false)
const taskList = ref([])
const filterForm = ref({
  status: '',
  deviceType: '',
  dateRange: []
})
const pagination = ref({
  current: 1,
  size: 10,
  total: 0
})
const detailDialogVisible = ref(false)
const currentTask = ref({
  taskNo: '',
  taskName: '',
  deviceName: '',
  deviceType: '',
  planName: '',
  operator: '',
  startTime: '',
  endTime: '',
  status: '',
  results: []
})

// 状态选项
const statusOptions = [
  { label: '待执行', value: 'PENDING' },
  { label: '执行中', value: 'PROCESSING' },
  { label: '已完成', value: 'COMPLETED' },
  { label: '已取消', value: 'CANCELED' },
  { label: '已超时', value: 'TIMEOUT' }
]

// 设备类型选项
const deviceTypeOptions = [
  { label: 'CNC机床', value: 'CNC' },
  { label: '注塑机', value: 'INJECTION' },
  { label: '冲压机', value: 'PRESS' },
  { label: '组装线', value: 'ASSEMBLY' }
]

// 获取任务列表
const fetchTaskList = async () => {
  try {
    loading.value = true
    const params = {
      ...filterForm.value,
      pageNum: pagination.value.current,
      pageSize: pagination.value.size
    }
    const res = await getTaskList(params)
    taskList.value = res.data.list
    pagination.value.total = res.data.total
  } catch (error) {
    console.error('获取任务列表失败:', error)
  } finally {
    loading.value = false
  }
}

// 格式化状态显示
const formatStatus = (status) => {
  const statusMap = {
    PENDING: '待执行',
    PROCESSING: '执行中',
    COMPLETED: '已完成',
    CANCELED: '已取消',
    TIMEOUT: '已超时'
  }
  return statusMap[status] || status
}

// 获取状态标签类型
const getStatusTagType = (status) => {
  const types = {
    PENDING: 'warning',
    PROCESSING: 'primary',
    COMPLETED: 'success',
    CANCELED: 'info',
    TIMEOUT: 'danger'
  }
  return types[status] || ''
}

// 查询
const handleSearch = () => {
  pagination.value.current = 1
  fetchTaskList()
}

// 重置
const handleReset = () => {
  filterForm.value = {
    status: '',
    deviceType: '',
    dateRange: []
  }
  handleSearch()
}

// 分页大小变化
const handleSizeChange = (size) => {
  pagination.value.size = size
  fetchTaskList()
}

// 当前页变化
const handleCurrentChange = (current) => {
  pagination.value.current = current
  fetchTaskList()
}

// 创建任务
const handleCreateTask = () => {
  // TODO: 实现创建任务逻辑
  console.log('创建任务')
}

// 导出
const handleExport = () => {
  // TODO: 实现导出逻辑
  console.log('导出任务')
}

// 执行任务
const handleExecute = async (row) => {
  try {
    await executeTask(row.taskNo)
    await fetchTaskList()
  } catch (error) {
    console.error('执行任务失败:', error)
  }
}

// 查看详情
const handleViewDetail = (row) => {
  currentTask.value = { ...row }
  detailDialogVisible.value = true
}

// 取消任务
const handleCancel = async (row) => {
  try {
    await cancelTask(row.taskNo)
    await fetchTaskList()
  } catch (error) {
    console.error('取消任务失败:', error)
  }
}

onMounted(() => {
  fetchTaskList()
})
</script>

<style scoped lang="scss">
.task-list-container {
  padding: 20px;
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;

    h2 {
      margin: 0;
      font-size: 18px;
      color: #333;
    }

    .actions {
      display: flex;
      gap: 10px;
    }
  }

  .filter-area {
    margin-bottom: 20px;
    padding: 15px;
    background-color: #f5f7fa;
    border-radius: 4px;
  }

  .pagination {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
  }

  .task-result {
    margin-top: 20px;

    h3 {
      margin: 20px 0 10px;
      font-size: 16px;
      color: #333;
    }
  }
}
</style>
