<template>
  <div class="exception-list-container">
    <div class="header">
      <h2>点检异常列表</h2>
      <div class="actions">
        <el-button type="primary" @click="handleExport">
          <el-icon><Download /></el-icon>
          导出
        </el-button>
      </div>
    </div>

    <div class="filter-area">
      <el-form :inline="true" :model="filterForm">
        <el-form-item label="异常状态">
          <el-select v-model="filterForm.status" placeholder="请选择状态">
            <el-option
              v-for="item in statusOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="异常级别">
          <el-select v-model="filterForm.level" placeholder="请选择级别">
            <el-option
              v-for="item in levelOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="异常日期">
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
      :data="exceptionList"
      border
      style="width: 100%"
      v-loading="loading"
    >
      <el-table-column prop="exceptionNo" label="异常编号" width="120" />
      <el-table-column prop="taskName" label="关联任务" width="150" />
      <el-table-column prop="deviceName" label="设备名称" width="120" />
      <el-table-column prop="itemName" label="检查项" width="150" />
      <el-table-column prop="level" label="异常级别" width="100">
        <template #default="{row}">
          <el-tag :type="getLevelTagType(row.level)">
            {{ formatLevel(row.level) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="status" label="处理状态" width="120">
        <template #default="{row}">
          <el-tag :type="getStatusTagType(row.status)">
            {{ formatStatus(row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="上报时间" width="160" />
      <el-table-column prop="handler" label="处理人" width="100" />
      <el-table-column label="操作" width="180" fixed="right">
        <template #default="{row}">
          <el-button
            type="primary"
            size="small"
            @click="handleViewDetail(row)"
          >
            详情
          </el-button>
          <el-button
            v-if="row.status === 'PENDING'"
            type="success"
            size="small"
            @click="handleProcess(row)"
          >
            处理
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

    <!-- 异常详情对话框 -->
    <el-dialog
      v-model="detailDialogVisible"
      :title="`异常详情 - ${currentException.exceptionNo}`"
      width="70%"
    >
      <el-descriptions :column="2" border>
        <el-descriptions-item label="异常编号">
          {{ currentException.exceptionNo }}
        </el-descriptions-item>
        <el-descriptions-item label="关联任务">
          {{ currentException.taskName }}
        </el-descriptions-item>
        <el-descriptions-item label="设备名称">
          {{ currentException.deviceName }}
        </el-descriptions-item>
        <el-descriptions-item label="检查项">
          {{ currentException.itemName }}
        </el-descriptions-item>
        <el-descriptions-item label="标准值">
          {{ currentException.standard }}
        </el-descriptions-item>
        <el-descriptions-item label="实际值">
          {{ currentException.actualValue }}
        </el-descriptions-item>
        <el-descriptions-item label="异常级别">
          <el-tag :type="getLevelTagType(currentException.level)">
            {{ formatLevel(currentException.level) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="上报时间">
          {{ currentException.createTime }}
        </el-descriptions-item>
        <el-descriptions-item label="上报人">
          {{ currentException.reporter }}
        </el-descriptions-item>
        <el-descriptions-item label="处理状态">
          <el-tag :type="getStatusTagType(currentException.status)">
            {{ formatStatus(currentException.status) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="处理人">
          {{ currentException.handler || '--' }}
        </el-descriptions-item>
        <el-descriptions-item label="处理时间">
          {{ currentException.handleTime || '--' }}
        </el-descriptions-item>
      </el-descriptions>

      <div class="exception-process" v-if="currentException.processRecords">
        <h3>处理流程</h3>
        <el-timeline>
          <el-timeline-item
            v-for="(record, index) in currentException.processRecords"
            :key="index"
            :timestamp="record.time"
            placement="top"
          >
            <el-card>
              <h4>{{ record.action }}</h4>
              <p>{{ record.content }}</p>
              <p>操作人: {{ record.operator }}</p>
            </el-card>
          </el-timeline-item>
        </el-timeline>
      </div>

      <template #footer>
        <el-button @click="detailDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Download } from '@element-plus/icons-vue'
import { getExceptionList, processException } from '@/api/inspection'

const loading = ref(false)
const exceptionList = ref([])
const filterForm = ref({
  status: '',
  level: '',
  dateRange: []
})
const pagination = ref({
  current: 1,
  size: 10,
  total: 0
})
const detailDialogVisible = ref(false)
const currentException = ref({
  exceptionNo: '',
  taskName: '',
  deviceName: '',
  itemName: '',
  standard: '',
  actualValue: '',
  level: '',
  status: '',
  createTime: '',
  reporter: '',
  handler: '',
  handleTime: '',
  processRecords: []
})

// 状态选项
const statusOptions = [
  { label: '待处理', value: 'PENDING' },
  { label: '处理中', value: 'PROCESSING' },
  { label: '已解决', value: 'RESOLVED' },
  { label: '已关闭', value: 'CLOSED' }
]

// 级别选项
const levelOptions = [
  { label: '一般', value: 'NORMAL' },
  { label: '严重', value: 'SEVERE' },
  { label: '紧急', value: 'URGENT' }
]

// 获取异常列表
const fetchExceptionList = async () => {
  try {
    loading.value = true
    const params = {
      ...filterForm.value,
      pageNum: pagination.value.current,
      pageSize: pagination.value.size
    }
    const res = await getExceptionList(params)
    exceptionList.value = res.data.list
    pagination.value.total = res.data.total
  } catch (error) {
    console.error('获取异常列表失败:', error)
  } finally {
    loading.value = false
  }
}

// 格式化状态显示
const formatStatus = (status) => {
  const statusMap = {
    PENDING: '待处理',
    PROCESSING: '处理中',
    RESOLVED: '已解决',
    CLOSED: '已关闭'
  }
  return statusMap[status] || status
}

// 获取状态标签类型
const getStatusTagType = (status) => {
  const types = {
    PENDING: 'warning',
    PROCESSING: 'primary',
    RESOLVED: 'success',
    CLOSED: 'info'
  }
  return types[status] || ''
}

// 格式化级别显示
const formatLevel = (level) => {
  const levelMap = {
    NORMAL: '一般',
    SEVERE: '严重',
    URGENT: '紧急'
  }
  return levelMap[level] || level
}

// 获取级别标签类型
const getLevelTagType = (level) => {
  const types = {
    NORMAL: '',
    SEVERE: 'warning',
    URGENT: 'danger'
  }
  return types[level] || ''
}

// 查询
const handleSearch = () => {
  pagination.value.current = 1
  fetchExceptionList()
}

// 重置
const handleReset = () => {
  filterForm.value = {
    status: '',
    level: '',
    dateRange: []
  }
  handleSearch()
}

// 分页大小变化
const handleSizeChange = (size) => {
  pagination.value.size = size
  fetchExceptionList()
}

// 当前页变化
const handleCurrentChange = (current) => {
  pagination.value.current = current
  fetchExceptionList()
}

// 导出
const handleExport = () => {
  // TODO: 实现导出逻辑
  console.log('导出异常')
}

// 查看详情
const handleViewDetail = (exception) => {
  currentException.value = { ...exception }
  detailDialogVisible.value = true
}

// 处理异常
const handleProcess = async (exception) => {
  try {
    await processException(exception.exceptionNo)
    await fetchExceptionList()
  } catch (error) {
    console.error('处理异常失败:', error)
  }
}

onMounted(() => {
  fetchExceptionList()
})
</script>

<style scoped lang="scss">
.exception-list-container {
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

  .exception-process {
    margin-top: 20px;

    h3 {
      margin: 20px 0 10px;
      font-size: 16px;
      color: #333;
    }
  }
}
</style>
