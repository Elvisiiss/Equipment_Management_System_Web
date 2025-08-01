<template>
  <div class="approval-container">
    <div class="page-header">
      <h2>保养任务审批</h2>
      <el-tabs v-model="activeTab" @tab-change="loadTasks">
        <el-tab-pane label="待我审批" name="pending" />
        <el-tab-pane label="已审批" name="approved" />
      </el-tabs>
    </div>

    <el-table :data="taskList" border style="width: 100%">
      <el-table-column prop="taskId" label="任务ID" width="100" />
      <el-table-column label="设备信息">
        <template #default="{ row }">
          <div>{{ row.equipmentName }}</div>
          <div class="small-text">ID: {{ row.equipmentId }}</div>
        </template>
      </el-table-column>
      <el-table-column prop="taskName" label="任务名称" />
      <el-table-column prop="executor" label="执行人" width="120" />
      <el-table-column prop="plannedDate" label="计划时间" width="120" />
      <el-table-column label="状态" width="120">
        <template #default="{ row }">
          <el-tag :type="statusTagType(row.status)">
            {{ statusText(row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="180" align="center">
        <template #default="{ row }">
          <el-button
              v-if="row.status === 'PENDING_APPROVAL'"
              type="primary"
              size="small"
              @click="openApprovalDetail(row)"
          >
            审批
          </el-button>
          <el-button
              v-else
              type="info"
              size="small"
              @click="viewApprovalDetail(row)"
          >
            查看
          </el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const activeTab = ref('pending')
const taskList = ref([])

// 加载任务数据
const loadTasks = () => {
  // 模拟API调用
  setTimeout(() => {
    taskList.value = [
      {
        taskId: 'T20230801-001',
        equipmentId: 'EQ001',
        equipmentName: '立式加工中心-MC001',
        taskName: '日常保养检查',
        executor: '张三',
        plannedDate: '2023-08-01',
        completedDate: '2023-08-01 10:30:00',
        status: 'PENDING_APPROVAL',
        items: [
          { name: '清洁导轨', result: '正常', problem: '' },
          { name: '检查润滑油', result: '油量不足', problem: '油位低于标准线' }
        ]
      },
      {
        taskId: 'T20230801-002',
        equipmentId: 'EQ002',
        equipmentName: '数控车床-CT005',
        taskName: '月度保养',
        executor: '李四',
        plannedDate: '2023-08-01',
        completedDate: '2023-08-01 14:20:00',
        status: 'APPROVED',
        items: [
          { name: '主轴检查', result: '正常', problem: '' },
          { name: '皮带张力调整', result: '已调整', problem: '皮带松动' }
        ]
      }
    ]
  }, 500)
}

// 状态标签样式
const statusTagType = (status) => {
  switch(status) {
    case 'PENDING_APPROVAL': return 'warning'
    case 'APPROVED': return 'success'
    case 'REJECTED': return 'danger'
    default: return 'info'
  }
}

// 状态文本
const statusText = (status) => {
  switch(status) {
    case 'PENDING_APPROVAL': return '待审批'
    case 'APPROVED': return '已通过'
    case 'REJECTED': return '已驳回'
    default: return status
  }
}

// 打开审批详情
const openApprovalDetail = (task) => {
  router.push({
    path: '/maintenance/manage/ApprovalDetail',
    query: {
      taskId: task.taskId,
      status: 'approve'
    }
  })
}

// 查看审批详情
const viewApprovalDetail = (task) => {
  router.push({
    path: '/maintenance/manage/ApprovalDetail',
    query: {
      taskId: task.taskId,
      status: 'view'
    }
  })
}

onMounted(() => {
  loadTasks()
})
</script>

<style scoped>
.approval-container {
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

.small-text {
  font-size: 12px;
  color: #999;
}
</style>
