<template>
  <div class="inspection-action">
    <div class="page-header">
      <h2>{{ equipmentName }} - 点检执行</h2>
      <div class="header-actions">
        <el-button type="success" @click="completeInspection">
          <el-icon><Check /></el-icon>
          完成点检
        </el-button>
      </div>
    </div>

    <el-card class="task-info">
      <template #header>
        <div class="card-header">
          <span>任务信息</span>
          <el-tag :type="taskStatusType(currentTask.status)">
            {{ currentTask.statusLabel }}
          </el-tag>
        </div>
      </template>

      <el-descriptions :column="3" border>
        <el-descriptions-item label="任务名称">{{ currentTask.taskName }}</el-descriptions-item>
        <el-descriptions-item label="计划时间">{{ currentTask.plannedDate }}</el-descriptions-item>
        <el-descriptions-item label="执行人">{{ currentTask.executor }}</el-descriptions-item>
      </el-descriptions>
    </el-card>

    <div class="inspection-items">
      <div v-for="(item, index) in currentTask.items" :key="index" class="item-card">
        <div class="item-header">
          <h3>{{ item.name }}</h3>
          <el-tag :type="item.completed ? 'success' : 'warning'">
            {{ item.completed ? '已完成' : '待执行' }}
          </el-tag>
        </div>

        <el-descriptions :column="1" border>
          <el-descriptions-item label="类别">{{ item.category }}</el-descriptions-item>
          <el-descriptions-item label="执行标准">{{ item.standard }}</el-descriptions-item>
          <el-descriptions-item label="执行方法">{{ item.method }}</el-descriptions-item>
          <el-descriptions-item label="处理工具">{{ item.tools }}</el-descriptions-item>
        </el-descriptions>

        <el-form :model="item" class="inspection-form" label-width="100px">
          <el-form-item label="实际结果">
            <el-radio-group v-model="item.result" :disabled="item.completed">
              <el-radio label="PASS">合格</el-radio>
              <el-radio label="FAIL">不合格</el-radio>
            </el-radio-group>
          </el-form-item>

          <el-form-item label="实际值/测量值">
            <el-input v-model="item.actualValue" placeholder="请输入实际测量值" :disabled="item.completed" />
          </el-form-item>

          <el-form-item label="问题描述" v-if="item.result === 'FAIL'">
            <el-input v-model="item.problemDesc" type="textarea" :rows="2" placeholder="请描述发现的问题" :disabled="item.completed" />
          </el-form-item>

          <el-form-item label="现场照片">
            <el-upload
                class="upload-demo"
                action="/api/upload"
                list-type="picture-card"
                :auto-upload="false"
                :on-change="(file) => handleUploadChange(file, item)"
                :file-list="item.photos"
                :disabled="item.completed"
            >
              <el-icon><Plus /></el-icon>
            </el-upload>
          </el-form-item>

          <el-form-item label="备注">
            <el-input v-model="item.remark" type="textarea" :rows="2" placeholder="请输入备注信息" :disabled="item.completed" />
          </el-form-item>
        </el-form>

        <div class="item-actions">
          <el-button
              type="primary"
              @click="completeItem(index)"
              :disabled="item.completed"
              v-if="!item.completed"
          >
            标记完成
          </el-button>
          <el-button
              type="warning"
              @click="editItem(index)"
              v-if="item.completed"
          >
            再次编辑
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Check, Plus } from '@element-plus/icons-vue'
import maintenanceAPI from '@/api/maintenanceAPI.js'

const route = useRoute()
const router = useRouter()
const equipmentId = route.query.deviceId
const equipmentName = route.query.deviceName || '设备'
const taskId = route.query.taskId

// 当前任务数据
const currentTask = reactive({
  id: taskId,
  taskName: '设备点检任务',
  plannedDate: new Date().toLocaleDateString(),
  executor: '当前登录用户',
  status: 'PROCESSING',
  statusLabel: '执行中',
  items: [
    {
      name: '设备外观检查',
      category: '外观',
      standard: '无明显损伤、变形、锈蚀',
      method: '目视检查',
      tools: '无',
      completed: false,
      result: null,
      actualValue: '',
      problemDesc: '',
      photos: [],
      remark: ''
    },
    {
      name: '运行声音检查',
      category: '运行状态',
      standard: '无异常噪音',
      method: '听觉检查',
      tools: '无',
      completed: false,
      result: null,
      actualValue: '',
      problemDesc: '',
      photos: [],
      remark: ''
    },
    {
      name: '温度检查',
      category: '运行状态',
      standard: '≤40℃',
      method: '使用温度计测量',
      tools: '红外温度计',
      completed: false,
      result: null,
      actualValue: '',
      problemDesc: '',
      photos: [],
      remark: ''
    }
  ]
})

// 处理图片上传
const handleUploadChange = (file, item) => {
  // 这里只是模拟上传，实际项目中需要调用上传接口
  item.photos.push(file)
}

// 标记单个点检项完成
const completeItem = (index) => {
  const item = currentTask.items[index]
  if (!item.result) {
    ElMessage.warning('请选择检查结果')
    return
  }

  item.completed = true
  ElMessage.success(`点检项 "${item.name}" 已完成`)
}

// 再次编辑点检项
const editItem = (index) => {
  currentTask.items[index].completed = false
  ElMessage.info(`点检项 "${currentTask.items[index].name}" 可再次编辑`)
}

// 完成整个点检任务
const completeInspection = async () => {
  try {
    const allCompleted = currentTask.items.every(item => item.completed)
    if (!allCompleted) {
      ElMessage.warning('请完成所有点检项后再提交')
      return
    }

    await maintenanceAPI.completeTask(currentTask.id, {
      items: currentTask.items
    })

    ElMessage.success('点检任务已完成')
    // 跳转回任务列表页面
    router.push('/taskList')
  } catch (error) {
    ElMessage.error('提交失败')
  }
}

// 任务状态样式
const taskStatusType = (status) => {
  switch (status) {
    case 'PENDING':
      return 'warning'
    case 'PROCESSING':
      return 'primary'
    case 'COMPLETED':
      return 'success'
    default:
      return 'info'
  }
}

onMounted(() => {
  // 实际应用中应通过API加载任务详情
  // maintenanceAPI.getTaskDetail(taskId).then(res => {
  //   Object.assign(currentTask, res.data)
  // })
})
</script>

<style scoped>
.inspection-action {
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

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.inspection-items {
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.item-card {
  background: #fff;
  border-radius: 4px;
  padding: 15px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
}

.item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.inspection-form {
  margin-top: 15px;
}

.item-actions {
  margin-top: 15px;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>
