<template>
  <div class="maintenance-action">
    <div class="page-header">
      <h2>{{ equipmentName }} - 保养执行</h2>
      <div class="header-actions">
        <el-button type="success" @click="completeMaintenance">
          <el-icon><Check /></el-icon>
          完成保养
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

    <div class="maintenance-items">
      <div v-for="(item, index) in currentTask.items" :key="index" class="item-card">
        <div class="item-header">
          <h3>{{ item.name }}</h3>
          <el-tag :type="item.completed ? 'success' : 'warning'">
            {{ item.completed ? '已完成' : '待执行' }}
          </el-tag>
        </div>

        <el-descriptions :column="1" border>
          <el-descriptions-item label="类别">{{ item.category || '-' }}</el-descriptions-item>
          <el-descriptions-item label="执行标准">{{ item.standard || '-' }}</el-descriptions-item>
          <el-descriptions-item label="执行方法">{{ item.method || '-' }}</el-descriptions-item>
        </el-descriptions>

        <div class="execution-section">
          <h4>执行记录</h4>
          <el-form :model="item" label-width="80px">
            <el-form-item label="执行结果">
              <el-input
                  v-model="item.result"
                  type="textarea"
                  :rows="2"
                  placeholder="记录执行结果"
                  :disabled="item.completed"
              />
            </el-form-item>

            <el-form-item label="问题描述">
              <el-input
                  v-model="item.problem"
                  type="textarea"
                  :rows="2"
                  placeholder="如发现问题请描述"
                  :disabled="item.completed"
              />
            </el-form-item>

            <el-form-item label="处理方式">
              <el-input
                  v-model="item.handlingMethod"
                  placeholder="处理方式"
                  :disabled="item.completed"
              />
            </el-form-item>

            <el-form-item label="上传图片">
              <el-upload
                  action="#"
                  list-type="picture-card"
                  :auto-upload="false"
                  :on-change="(file) => handleUploadChange(file, item)"
                  :file-list="item.photos"
                  :disabled="item.completed"
              >
                <el-icon><Plus /></el-icon>
              </el-upload>
            </el-form-item>
          </el-form>
        </div>

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
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Check, Plus } from '@element-plus/icons-vue'
import maintenanceAPI from '@/api/maintenanceAPI'

const route = useRoute()
const equipmentId = route.query.id
const equipmentName = route.query.name || '设备'
const taskId = route.query.taskId

// 当前任务数据
const currentTask = reactive({
  id: taskId,
  taskName: '日常保养检查',
  plannedDate: '2025-08-01',
  executor: '张三',
  status: 'IN_PROGRESS',
  statusLabel: '进行中',
  items: [
    {
      name: '清洁导轨',
      category: '清洁类',
      standard: '导轨无灰尘、油污',
      method: '使用无尘布和专用清洁剂擦拭',
      problemHandling: '发现生锈立即报告',
      handlingMethod: '',
      tools: '无尘布,清洁剂',
      completed: false,
      result: '',
      problem: '',
      photos: []
    },
    {
      name: '检查润滑油',
      category: '检查类',
      standard: '油位在标准线内',
      method: '观察油位计指示',
      problemHandling: '油位不足时补充同型号润滑油',
      handlingMethod: '',
      tools: '润滑油',
      completed: false,
      result: '',
      problem: '',
      photos: []
    },
    {
      name: '紧固螺丝',
      category: '紧固类',
      standard: '所有螺丝无松动',
      method: '使用扭力扳手检查',
      problemHandling: '发现松动立即紧固',
      handlingMethod: '',
      tools: '扭力扳手',
      completed: false,
      result: '',
      problem: '',
      photos: []
    }
  ]
})

// 处理上传图片
const handleUploadChange = (file, item) => {
  if (!item.photos) {
    item.photos = []
  }
  item.photos.push({url: URL.createObjectURL(file.raw), name: file.name})
}

// 标记保养项完成
const completeItem = (index) => {
  currentTask.items[index].completed = true
  ElMessage.success(`保养项 "${currentTask.items[index].name}" 已完成`)
}

// 再次编辑保养项
const editItem = (index) => {
  currentTask.items[index].completed = false
  ElMessage.info(`保养项 "${currentTask.items[index].name}" 可再次编辑`)
}

// 完成整个保养任务
const completeMaintenance = async () => {
  try {
    console.log(1)
    const allCompleted = currentTask.items.every(item => item.completed)
    console.log(2)
    if (!allCompleted) {
      ElMessage.warning('请完成所有保养项后再提交')
      return
    }

    await maintenanceAPI.completeTask(currentTask.id, {
      items: currentTask.items
    })

    ElMessage.success('保养任务已完成')
    // 这里可以添加跳转回上一页的逻辑
  } catch (error) {
    ElMessage.error('提交失败')
  }
}

// 任务状态样式
const taskStatusType = (status) => {
  switch (status) {
    case 'PENDING':
      return 'warning'
    case 'IN_PROGRESS':
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
.maintenance-action {
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

.maintenance-items {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(450px, 1fr));
  gap: 20px;
}

.item-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  padding: 15px;
  transition: all 0.3s;
}

.item-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}

.item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
}

.execution-section {
  margin-top: 20px;
  padding-top: 15px;
  border-top: 1px dashed #eee;
}

.item-actions {
  margin-top: 15px;
  text-align: right;
}
</style>
