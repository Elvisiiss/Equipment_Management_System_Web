<template>
  <div class="my-approvals">
    <div class="page-header">
      <h2>我的审批结果</h2>
      <el-tabs v-model="activeTab" @tab-change="loadTasks">
        <el-tab-pane label="全部" name="all" />
        <el-tab-pane label="已通过" name="approved" />
        <el-tab-pane label="已驳回" name="rejected" />
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
      <el-table-column prop="plannedDate" label="计划时间" width="120" />
      <el-table-column prop="completedDate" label="完成时间" width="150" />
      <el-table-column label="审批状态" width="120">
        <template #default="{ row }">
          <el-tag :type="statusTagType(row.status)">
            {{ statusText(row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="180" align="center">
        <template #default="{ row }">
          <el-button
              type="primary"
              size="small"
              @click="viewApprovalDetail(row)"
          >
            查看
          </el-button>
          <el-button
              v-if="row.status === 'REJECTED'"
              type="warning"
              size="small"
              @click="resubmitTask(row)"
          >
            重新提交
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
const activeTab = ref('all')
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
        plannedDate: '2023-08-01',
        completedDate: '2023-08-01 10:30:00',
        approvalDate: '2023-08-01 14:20:00',
        status: 'APPROVED',
        overallApprovalComment: '保养完成良好，符合标准',
        items: [
          { name: '清洁导轨', result: '正常', approvalComment: '' },
          { name: '检查润滑油', result: '油量不足', approvalComment: '已补充润滑油' }
        ]
      },
      {
        taskId: 'T20230802-003',
        equipmentId: 'EQ003',
        equipmentName: '激光切割机-LC100',
        taskName: '月度保养',
        plannedDate: '2023-08-02',
        completedDate: '2023-08-02 09:45:00',
        approvalDate: '2023-08-02 13:15:00',
        status: 'REJECTED',
        overallApprovalComment: '润滑点检查不全面，请补充检查',
        items: [
          { name: '激光头清洁', result: '完成', approvalComment: '清洁到位' },
          { name: '润滑点检查', result: '部分完成', approvalComment: '遗漏3个润滑点' }
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

// 重新提交任务
const resubmitTask = (task) => {
  router.push({
    path: '/maintenance/manage/ResubmitTask',
    query: {
      taskId: task.taskId
    }
  })
}

onMounted(() => {
  loadTasks()
})
</script>

<style scoped>
.my-approvals {
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
