<template>
  <div class="approval-detail">
    <div class="page-header">
      <h2>审批详情</h2>
      <div class="header-actions">
        <el-button v-if="isApproving" type="primary" @click="approveTask('APPROVED')">
          通过
        </el-button>
        <el-button v-if="isApproving" type="danger" @click="approveTask('REJECTED')">
          驳回
        </el-button>
        <el-button @click="goBack">
          返回
        </el-button>
      </div>
    </div>

    <el-card class="task-info">
      <template #header>
        <div class="card-header">
          <span>任务信息</span>
          <el-tag :type="statusTagType(taskData.status)">
            {{ statusText(taskData.status) }}
          </el-tag>
        </div>
      </template>

      <el-descriptions :column="3" border>
        <el-descriptions-item label="任务ID">{{ taskData.taskId }}</el-descriptions-item>
        <el-descriptions-item label="设备名称">{{ taskData.equipmentName }}</el-descriptions-item>
        <el-descriptions-item label="执行人">{{ taskData.executor }}</el-descriptions-item>
        <el-descriptions-item label="计划时间">{{ taskData.plannedDate }}</el-descriptions-item>
        <el-descriptions-item label="完成时间">{{ taskData.completedDate }}</el-descriptions-item>
      </el-descriptions>
    </el-card>

    <div class="approval-items">
      <div v-for="(item, index) in taskData.items" :key="index" class="item-card">
        <div class="item-header">
          <h3>{{ item.name }}</h3>
          <el-tag :type="item.result === '正常' ? 'success' : 'danger'">
            {{ item.result }}
          </el-tag>
        </div>

        <div class="item-content">
          <el-descriptions :column="1" border>
            <el-descriptions-item label="问题描述">
              {{ item.problem || '无' }}
            </el-descriptions-item>
            <el-descriptions-item label="处理方式">
              {{ item.handlingMethod || '无' }}
            </el-descriptions-item>
          </el-descriptions>

          <div v-if="item.photos && item.photos.length" class="photo-section">
            <h4>相关图片</h4>
            <div class="photo-grid">
              <el-image
                  v-for="(photo, pIndex) in item.photos"
                  :key="pIndex"
                  :src="photo"
                  :preview-src-list="item.photos"
                  fit="cover"
                  class="photo-item"
              />
            </div>
          </div>
        </div>

        <div class="approval-comment">
          <h4>审批意见</h4>
          <el-input
              v-model="item.approvalComment"
              type="textarea"
              :rows="2"
              placeholder="请输入审批意见"
              :disabled="!isApproving"
          />
        </div>
      </div>
    </div>

    <div v-if="isApproving" class="overall-comment">
      <h3>总体审批意见</h3>
      <el-input
          v-model="taskData.overallApprovalComment"
          type="textarea"
          :rows="3"
          placeholder="请输入总体审批意见"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const taskId = route.query.taskId
const isApproving = computed(() => route.query.status === 'approve')

const taskData = ref({
  taskId: '',
  equipmentId: '',
  equipmentName: '',
  taskName: '',
  executor: '',
  plannedDate: '',
  completedDate: '',
  status: 'PENDING_APPROVAL',
  overallApprovalComment: '',
  items: []
})

// 加载任务详情
const loadTaskDetail = () => {
  // 模拟API调用
  setTimeout(() => {
    taskData.value = {
      taskId: taskId,
      equipmentId: 'EQ001',
      equipmentName: '立式加工中心-MC001',
      taskName: '日常保养检查',
      executor: '张三',
      plannedDate: '2023-08-01',
      completedDate: '2023-08-01 10:30:00',
      status: 'PENDING_APPROVAL',
      overallApprovalComment: '',
      items: [
        {
          name: '清洁导轨',
          result: '正常',
          problem: '',
          handlingMethod: '',
          photos: [
            'https://dummyimage.com/300x200/4CAF50/fff',
            'https://dummyimage.com/300x200/2196F3/fff'
          ],
          approvalComment: ''
        },
        {
          name: '检查润滑油',
          result: '油量不足',
          problem: '油位低于标准线约2cm',
          handlingMethod: '补充同型号润滑油',
          photos: [
            'https://dummyimage.com/300x200/FF9800/fff'
          ],
          approvalComment: ''
        }
      ]
    }
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

// 审批任务
const approveTask = (status) => {
  // 模拟API调用
  setTimeout(() => {
    taskData.value.status = status

    // 显示成功消息
    const message = status === 'APPROVED' ? '任务已通过审批' : '任务已驳回'
    ElMessage.success(message)

    // 返回审批列表
    setTimeout(() => {
      router.push('/approval/list')
    }, 1000)
  }, 500)
}

// 返回上一页
const goBack = () => {
  router.go(-1)
}

onMounted(() => {
  loadTaskDetail()
})
</script>

<style scoped>
.approval-detail {
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

.task-info {
  margin-bottom: 20px;
}

.approval-items {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(500px, 1fr));
  gap: 20px;
}

.item-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  padding: 20px;
}

.item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
}

.photo-section {
  margin-top: 15px;
}

.photo-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  margin-top: 10px;
}

.photo-item {
  width: 100%;
  height: 100px;
  border-radius: 4px;
  cursor: pointer;
}

.approval-comment {
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px dashed #eee;
}

.overall-comment {
  margin-top: 30px;
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}
</style>
