<template>
  <div class="resubmit-task">
    <div class="page-header">
      <h2>重新提交保养任务</h2>
      <div class="header-actions">
        <el-button type="primary" @click="submitResubmission">
          重新提交
        </el-button>
        <el-button @click="goBack">
          取消
        </el-button>
      </div>
    </div>

    <el-alert type="warning" show-icon>
      <template #title>
        <div class="alert-content">
          <h3>审批驳回原因</h3>
          <p>{{ taskData.overallApprovalComment }}</p>
        </div>
      </template>
    </el-alert>

    <el-card class="task-info">
      <template #header>
        <div class="card-header">
          <span>任务信息</span>
          <el-tag type="danger">已驳回</el-tag>
        </div>
      </template>

      <el-descriptions :column="3" border>
        <el-descriptions-item label="任务ID">{{ taskData.taskId }}</el-descriptions-item>
        <el-descriptions-item label="设备名称">{{ taskData.equipmentName }}</el-descriptions-item>
        <el-descriptions-item label="执行人">{{ taskData.executor }}</el-descriptions-item>
        <el-descriptions-item label="计划时间">{{ taskData.plannedDate }}</el-descriptions-item>
        <el-descriptions-item label="完成时间">{{ taskData.completedDate }}</el-descriptions-item>
        <el-descriptions-item label="审批时间">{{ taskData.approvalDate }}</el-descriptions-item>
      </el-descriptions>
    </el-card>

    <div class="resubmit-items">
      <div v-for="(item, index) in taskData.items" :key="index" class="item-card">
        <div class="item-header">
          <h3>{{ item.name }}</h3>
          <div class="item-status">
            <el-tag :type="item.result === '正常' ? 'success' : 'danger'">
              {{ item.result }}
            </el-tag>
            <el-tag v-if="item.approvalComment" type="warning">
              审批意见
            </el-tag>
          </div>
        </div>

        <div class="original-data">
          <h4>原始记录</h4>
          <el-descriptions :column="1" border>
            <el-descriptions-item label="问题描述">
              {{ item.problem || '无' }}
            </el-descriptions-item>
            <el-descriptions-item label="处理方式">
              {{ item.handlingMethod || '无' }}
            </el-descriptions-item>
            <el-descriptions-item label="审批意见" v-if="item.approvalComment">
              {{ item.approvalComment }}
            </el-descriptions-item>
          </el-descriptions>
        </div>

        <div class="resubmit-section">
          <h4>补充说明</h4>
          <el-input
              v-model="item.additionalComment"
              type="textarea"
              :rows="3"
              placeholder="请根据审批意见补充说明或操作"
          />

          <div class="resubmit-actions">
            <el-upload
                action="#"
                list-type="picture-card"
                :auto-upload="false"
                :on-change="(file) => handleUploadChange(file, item)"
                :file-list="item.additionalPhotos"
            >
              <el-icon><Plus /></el-icon>
            </el-upload>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

const route = useRoute()
const router = useRouter()
const taskId = route.query.taskId

const taskData = ref({
  taskId: '',
  equipmentId: '',
  equipmentName: '',
  taskName: '',
  executor: '',
  plannedDate: '',
  completedDate: '',
  approvalDate: '',
  status: 'REJECTED',
  overallApprovalComment: '',
  items: []
})

// 加载任务详情
const loadTaskDetail = () => {
  // 模拟API调用
  setTimeout(() => {
    taskData.value = {
      taskId: taskId,
      equipmentId: 'EQ003',
      equipmentName: '激光切割机-LC100',
      taskName: '月度保养',
      executor: '李四',
      plannedDate: '2023-08-02',
      completedDate: '2023-08-02 09:45:00',
      approvalDate: '2023-08-02 13:15:00',
      status: 'REJECTED',
      overallApprovalComment: '润滑点检查不全面，请补充检查',
      items: [
        {
          name: '激光头清洁',
          result: '完成',
          problem: '镜片有轻微污染',
          handlingMethod: '使用专用清洁剂擦拭',
          approvalComment: '清洁到位',
          additionalComment: '',
          additionalPhotos: []
        },
        {
          name: '润滑点检查',
          result: '部分完成',
          problem: '3个润滑点未检查',
          handlingMethod: '补充检查并润滑',
          approvalComment: '遗漏3个润滑点',
          additionalComment: '已补充检查以下润滑点：X轴导轨、Y轴丝杠、Z轴轴承',
          additionalPhotos: [
            { url: 'https://dummyimage.com/300x200/4CAF50/fff', name: '润滑点1.jpg' },
            { url: 'https://dummyimage.com/300x200/2196F3/fff', name: '润滑点2.jpg' }
          ]
        }
      ]
    }
  }, 500)
}

// 处理上传图片
const handleUploadChange = (file, item) => {
  if (!item.additionalPhotos) {
    item.additionalPhotos = []
  }
  item.additionalPhotos.push({
    url: URL.createObjectURL(file.raw),
    name: file.name
  })
}

// 提交重新提交的任务
const submitResubmission = () => {
  // 模拟API调用
  setTimeout(() => {
    ElMessage.success('任务已重新提交审批')

    // 返回我的审批结果页面
    setTimeout(() => {
      router.push('/approval/my')
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
.resubmit-task {
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

.alert-content {
  padding: 10px;
}

.alert-content h3 {
  margin: 0 0 8px 0;
  font-size: 16px;
}

.task-info {
  margin: 20px 0;
}

.resubmit-items {
  margin-top: 20px;
}

.item-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  padding: 20px;
  margin-bottom: 20px;
}

.item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
}

.item-status {
  display: flex;
  gap: 10px;
}

.original-data {
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px dashed #eee;
}

.resubmit-section {
  margin-top: 15px;
}

.resubmit-actions {
  margin-top: 15px;
}
</style>
