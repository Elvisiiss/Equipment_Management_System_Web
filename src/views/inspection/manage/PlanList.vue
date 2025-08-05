<template>
  <div class="plan-list-container">
    <div class="header">
      <h2>点检计划列表</h2>
      <div class="actions">
        <el-button type="primary" @click="handleCreatePlan">
          <el-icon><Plus /></el-icon>
          创建计划
        </el-button>
        <el-button @click="handleGenerateTasks">
          <el-icon><Refresh /></el-icon>
          生成任务
        </el-button>
      </div>
    </div>

    <div class="filter-area">
      <el-form :inline="true" :model="filterForm">
        <el-form-item label="计划状态">
          <el-select v-model="filterForm.status" placeholder="请选择状态">
            <el-option
              v-for="item in statusOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="计划类型">
          <el-select v-model="filterForm.type" placeholder="请选择类型">
            <el-option
              v-for="item in typeOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <el-table
      :data="planList"
      border
      style="width: 100%"
      v-loading="loading"
    >
      <el-table-column prop="planNo" label="计划编号" width="120" />
      <el-table-column prop="planName" label="计划名称" width="150" />
      <el-table-column prop="policyName" label="关联策略" width="150" />
      <el-table-column prop="type" label="计划类型" width="100">
        <template #default="{row}">
          <el-tag>{{ formatType(row.type) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="frequency" label="执行频率" width="120">
        <template #default="{row}">
          {{ formatFrequency(row.frequency) }}
        </template>
      </el-table-column>
      <el-table-column prop="nextTime" label="下次执行时间" width="160" />
      <el-table-column prop="status" label="状态" width="100">
        <template #default="{row}">
          <el-switch
            v-model="row.status"
            :active-value="1"
            :inactive-value="0"
            @change="handleStatusChange(row)"
          />
        </template>
      </el-table-column>
      <el-table-column label="操作" width="220" fixed="right">
        <template #default="{row}">
          <el-button
            type="primary"
            size="small"
            @click="handleViewDetail(row)"
          >
            详情
          </el-button>
          <el-button
            type="success"
            size="small"
            @click="handleGeneratePlanTasks(row)"
          >
            生成任务
          </el-button>
          <el-button
            type="danger"
            size="small"
            @click="handleDelete(row)"
          >
            删除
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

    <!-- 计划详情对话框 -->
    <el-dialog
      v-model="detailDialogVisible"
      :title="`计划详情 - ${currentPlan.planNo}`"
      width="70%"
    >
      <el-descriptions :column="2" border>
        <el-descriptions-item label="计划编号">
          {{ currentPlan.planNo }}
        </el-descriptions-item>
        <el-descriptions-item label="计划名称">
          {{ currentPlan.planName }}
        </el-descriptions-item>
        <el-descriptions-item label="关联策略">
          {{ currentPlan.policyName }}
        </el-descriptions-item>
        <el-descriptions-item label="计划类型">
          {{ formatType(currentPlan.type) }}
        </el-descriptions-item>
        <el-descriptions-item label="执行频率">
          {{ formatFrequency(currentPlan.frequency) }}
        </el-descriptions-item>
        <el-descriptions-item label="下次执行时间">
          {{ currentPlan.nextTime }}
        </el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="currentPlan.status ? 'success' : 'danger'">
            {{ currentPlan.status ? '启用' : '禁用' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="创建时间">
          {{ currentPlan.createTime }}
        </el-descriptions-item>
        <el-descriptions-item label="更新时间">
          {{ currentPlan.updateTime }}
        </el-descriptions-item>
      </el-descriptions>

      <div class="plan-devices">
        <h3>适用设备</h3>
        <el-table :data="currentPlan.devices" border style="width: 100%">
          <el-table-column prop="deviceName" label="设备名称" width="150" />
          <el-table-column prop="deviceType" label="设备类型" width="120" />
          <el-table-column prop="location" label="位置" width="150" />
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
import { Plus, Refresh } from '@element-plus/icons-vue'
import { getPlanList, updatePlanStatus, deletePlan, generateTasks } from '@/api/inspection'

const loading = ref(false)
const planList = ref([])
const filterForm = ref({
  status: '',
  type: ''
})
const pagination = ref({
  current: 1,
  size: 10,
  total: 0
})
const detailDialogVisible = ref(false)
const currentPlan = ref({
  planNo: '',
  planName: '',
  policyName: '',
  type: '',
  frequency: '',
  nextTime: '',
  status: 0,
  createTime: '',
  updateTime: '',
  devices: []
})

// 状态选项
const statusOptions = [
  { label: '全部', value: '' },
  { label: '启用', value: '1' },
  { label: '禁用', value: '0' }
]

// 类型选项
const typeOptions = [
  { label: '全部', value: '' },
  { label: '日常点检', value: 'DAILY' },
  { label: '周检', value: 'WEEKLY' },
  { label: '月检', value: 'MONTHLY' },
  { label: '季度检', value: 'QUARTERLY' },
  { label: '年检', value: 'YEARLY' }
]

// 获取计划列表
const fetchPlanList = async () => {
  try {
    loading.value = true
    const params = {
      ...filterForm.value,
      pageNum: pagination.value.current,
      pageSize: pagination.value.size
    }
    const res = await getPlanList(params)
    planList.value = res.data.list
    pagination.value.total = res.data.total
  } catch (error) {
    console.error('获取计划列表失败:', error)
  } finally {
    loading.value = false
  }
}

// 格式化类型显示
const formatType = (type) => {
  const typeMap = {
    DAILY: '日常点检',
    WEEKLY: '周检',
    MONTHLY: '月检',
    QUARTERLY: '季度检',
    YEARLY: '年检'
  }
  return typeMap[type] || type
}

// 格式化频率显示
const formatFrequency = (frequency) => {
  if (!frequency) return ''
  const [value, unit] = frequency.split('|')
  const unitMap = {
    DAY: '天',
    WEEK: '周',
    MONTH: '月'
  }
  return `每${value}${unitMap[unit] || unit}`
}

// 查询
const handleSearch = () => {
  pagination.value.current = 1
  fetchPlanList()
}

// 重置
const handleReset = () => {
  filterForm.value = {
    status: '',
    type: ''
  }
  handleSearch()
}

// 分页大小变化
const handleSizeChange = (size) => {
  pagination.value.size = size
  fetchPlanList()
}

// 当前页变化
const handleCurrentChange = (current) => {
  pagination.value.current = current
  fetchPlanList()
}

// 创建计划
const handleCreatePlan = () => {
  // TODO: 实现创建计划逻辑
  console.log('创建计划')
}

// 状态变更
const handleStatusChange = async (plan) => {
  try {
    await updatePlanStatus(plan.planNo, plan.status)
  } catch (error) {
    console.error('更新计划状态失败:', error)
    // 恢复原状态
    plan.status = plan.status ? 0 : 1
  }
}

// 查看详情
const handleViewDetail = (plan) => {
  currentPlan.value = { ...plan }
  detailDialogVisible.value = true
}

// 删除计划
const handleDelete = async (plan) => {
  try {
    await deletePlan(plan.planNo)
    await fetchPlanList()
  } catch (error) {
    console.error('删除计划失败:', error)
  }
}

// 生成所有计划任务
const handleGenerateTasks = async () => {
  try {
    await generateTasks()
    await fetchPlanList()
  } catch (error) {
    console.error('生成任务失败:', error)
  }
}

// 生成单个计划任务
const handleGeneratePlanTasks = async (plan) => {
  try {
    await generateTasks(plan.planNo)
    await fetchPlanList()
  } catch (error) {
    console.error('生成任务失败:', error)
  }
}

onMounted(() => {
  fetchPlanList()
})
</script>

<style scoped lang="scss">
.plan-list-container {
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

  .plan-devices {
    margin-top: 20px;

    h3 {
      margin: 20px 0 10px;
      font-size: 16px;
      color: #333;
    }
  }
}
</style>
