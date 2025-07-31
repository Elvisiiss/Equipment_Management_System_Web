<template>
  <div class="maintenance-form">
    <!-- 页面头部 -->
    <div class="page-header">
      <h2>{{ equipmentName }} - 保养管理</h2>
      <div class="header-actions">
        <el-button type="primary" @click="showCreateTask = true">
          <el-icon><Plus /></el-icon>
          创建保养任务
        </el-button>
        <el-button type="success" @click="showHistory = true">
          <el-icon><Document /></el-icon>
          保养记录
        </el-button>
      </div>
    </div>

    <!-- 设备信息卡片 -->
    <el-card class="equipment-card">
      <template #header>
        <div class="card-header">
          <span>设备信息</span>
          <el-tag :type="equipmentStatus.type">{{ equipmentStatus.label }}</el-tag>
        </div>
      </template>
      <el-descriptions :column="4" border>
        <el-descriptions-item label="设备名称">{{ equipmentInfo.name }}</el-descriptions-item>
        <el-descriptions-item label="设备型号">{{ equipmentInfo.model }}</el-descriptions-item>
        <el-descriptions-item label="所属产线">{{ equipmentInfo.line }}</el-descriptions-item>
        <el-descriptions-item label="安装位置">{{ equipmentInfo.position }}</el-descriptions-item>
        <el-descriptions-item label="上次保养">{{ equipmentInfo.lastMaintenance }}</el-descriptions-item>
        <el-descriptions-item label="下次保养">{{ equipmentInfo.nextMaintenance }}</el-descriptions-item>
        <el-descriptions-item label="运行时长">{{ equipmentInfo.runningTime }}小时</el-descriptions-item>
        <el-descriptions-item label="保养负责人">{{ equipmentInfo.maintenancePerson }}</el-descriptions-item>
      </el-descriptions>
    </el-card>

    <el-row :gutter="20" class="main-content">
      <!-- 左侧：保养计划 -->
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>保养计划</span>
              <el-button type="primary" text @click="showPlanDialog = true">
                <el-icon><Edit /></el-icon>
                编辑计划
              </el-button>
            </div>
          </template>

          <el-timeline>
            <el-timeline-item
                v-for="plan in maintenancePlans"
                :key="plan.id"
                :timestamp="plan.nextDate"
                :type="plan.status === 'OVERDUE' ? 'danger' : 'primary'"
            >
              <div class="plan-item">
                <h4>{{ plan.cycleTypeLabel }}保养</h4>
                <p>执行人：{{ plan.executor }}</p>
                <p>间隔：{{ plan.cycleValue }}{{ plan.cycleUnit }}</p>
                <el-tag size="small" :type="plan.status === 'OVERDUE' ? 'danger' : 'success'">
                  {{ plan.statusLabel }}
                </el-tag>
              </div>
            </el-timeline-item>
          </el-timeline>
        </el-card>
      </el-col>

      <!-- 右侧：数据分析 -->
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>设备健康分析</span>
              <el-button type="primary" text @click="refreshData">
                <el-icon><Refresh /></el-icon>
                刷新
              </el-button>
            </div>
          </template>

          <div class="metrics-container">
            <div class="metric-card" v-for="metric in equipmentMetrics" :key="metric.name">
              <div class="metric-header">
                <span>{{ metric.name }}</span>
                <el-tag size="small" :type="getTrendType(metric.trend)">
                  {{ metric.trend === 'UP' ? '上升' : metric.trend === 'DOWN' ? '下降' : '稳定' }}
                </el-tag>
              </div>
              <div class="metric-value">
                {{ metric.value }} {{ metric.unit }}
                <el-progress
                    :percentage="getProgressValue(metric)"
                    :color="getProgressColor(metric)"
                />
              </div>
              <div class="metric-suggestion">
                <el-icon><Warning /></el-icon>
                {{ metric.suggestion }}
              </div>
            </div>
          </div>

          <div class="quality-score">
            <h4>保养质量评分</h4>
            <el-progress
                type="circle"
                :percentage="qualityScore.score"
                :color="getScoreColor"
            />
            <div class="quality-factors">
              <div v-for="(value, key) in qualityScore.factors" :key="key">
                {{ key }}: {{ value }}分
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 当前任务 -->
    <el-card class="current-task" v-if="currentTask">
      <template #header>
        <div class="card-header">
          <span>当前任务：{{ currentTask.taskName }}</span>
          <el-button type="success" @click="startTask">
            <el-icon><VideoPlay /></el-icon>
            开始执行
          </el-button>
        </div>
      </template>

      <el-descriptions :column="3" border>
        <el-descriptions-item label="计划时间">{{ currentTask.plannedDate }}</el-descriptions-item>
        <el-descriptions-item label="执行人">{{ currentTask.executor }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="taskStatusType(currentTask.status)">
            {{ currentTask.statusLabel }}
          </el-tag>
        </el-descriptions-item>
      </el-descriptions>

      <div class="task-items">
        <h4>保养项目：</h4>
        <el-checkbox-group v-model="completedItems">
          <el-checkbox
              v-for="item in currentTask.items"
              :key="item"
              :label="item"
              :disabled="taskStarted"
          >
            {{ item }}
          </el-checkbox>
        </el-checkbox-group>
      </div>
    </el-card>

    <!-- 维保资料库 -->
    <el-card>
      <template #header>
        <div class="card-header">
          <span>维保资料库</span>
          <el-button type="primary" text @click="showLibrary = true">
            <el-icon><FolderOpened /></el-icon>
            查看全部
          </el-button>
        </div>
      </template>

      <el-collapse>
        <el-collapse-item
            v-for="category in maintenanceLibrary"
            :key="category.equipmentType"
            :title="category.equipmentTypeLabel"
        >
          <div
              v-for="item in category.maintenanceItems"
              :key="item.id"
              class="maintenance-item"
          >
            <h4>{{ item.name }}</h4>
            <p>{{ item.description }}</p>
            <div class="item-meta">
              <span>标准工时：{{ item.standardTime }}分钟</span>
              <span>工具：{{ item.tools.join('、') }}</span>
            </div>
            <el-button size="small" @click="applyTemplate(item)">
              应用模板
            </el-button>
          </div>
        </el-collapse-item>
      </el-collapse>
    </el-card>

    <!-- 对话框：创建任务 -->
    <el-dialog v-model="showCreateTask" title="创建保养任务" width="600px">
      <el-form :model="taskForm" label-width="100px">
        <el-form-item label="任务名称">
          <el-input v-model="taskForm.name" />
        </el-form-item>
        <el-form-item label="执行人">
          <el-select v-model="taskForm.executor" style="width: 100%">
            <el-option label="张三" value="张三" />
            <el-option label="李四" value="李四" />
          </el-select>
        </el-form-item>
        <el-form-item label="计划日期">
          <el-date-picker v-model="taskForm.plannedDate" type="date" style="width: 100%" />
        </el-form-item>
        <el-form-item label="保养项目">
          <el-select
              v-model="taskForm.items"
              multiple
              filterable
              allow-create
              style="width: 100%"
              placeholder="请选择或输入保养项目"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showCreateTask = false">取消</el-button>
        <el-button type="primary" @click="createTask">创建</el-button>
      </template>
    </el-dialog>

    <!-- 对话框：执行保养 -->
    <el-dialog v-model="showExecuteTask" title="执行保养任务" width="800px">
      <el-form :model="executeForm" label-width="120px">
        <el-form-item label="开始时间">
          {{ executeForm.startTime }}
        </el-form-item>
        <el-form-item label="保养项目">
          <div v-for="(item, index) in executeForm.items" :key="index" class="execute-item">
            <h4>{{ item.name }}</h4>
            <el-input v-model="item.result" placeholder="执行结果" />
            <el-upload
                :action="uploadAction"
                :headers="uploadHeaders"
                :on-success="(res) => handleUploadSuccess(res, item)"
                multiple
                list-type="picture-card"
                :limit="3"
            >
              <el-icon><Plus /></el-icon>
            </el-upload>
          </div>
        </el-form-item>
        <el-form-item label="使用配件">
          <el-table :data="executeForm.parts" style="width: 100%">
            <el-table-column prop="name" label="配件名称" />
            <el-table-column prop="quantity" label="数量">
              <template #default="{ row }">
                <el-input-number v-model="row.quantity" :min="0" />
              </template>
            </el-table-column>
            <el-table-column prop="unit" label="单位" />
          </el-table>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="executeForm.remarks" type="textarea" :rows="3" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showExecuteTask = false">取消</el-button>
        <el-button type="success" @click="completeTask">完成保养</el-button>
      </template>
    </el-dialog>

    <!-- 对话框：保养记录 -->
    <el-dialog v-model="showHistory" title="保养历史记录" width="900px">
      <el-timeline>
        <el-timeline-item
            v-for="record in maintenanceRecords"
            :key="record.id"
            :timestamp="record.startTime"
        >
          <el-card>
            <h4>{{ record.equipmentName }}</h4>
            <p>执行人：{{ record.executor }}</p>
            <p>耗时：{{ calculateDuration(record.startTime, record.endTime) }}</p>
            <p>状态：<el-tag :type="record.status === 'COMPLETED' ? 'success' : 'warning'">
              {{ record.status === 'COMPLETED' ? '已完成' : '进行中' }}
            </el-tag></p>
            <p>报告：{{ record.report }}</p>
            <div class="record-images" v-if="record.items[0]?.photos?.length">
              <img
                  v-for="photo in record.items[0].photos"
                  :key="photo"
                  :src="photo"
                  style="width: 100px; height: 100px; margin: 5px;"
              />
            </div>
          </el-card>
        </el-timeline-item>
      </el-timeline>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'

import { ElMessage } from 'element-plus'
import {
  Plus, Edit, Refresh, Warning, VideoPlay, Document, FolderOpened
} from '@element-plus/icons-vue'
import maintenanceAPI from '@/api/maintenanceAPI'

const route = useRoute()
const equipmentId = computed(() => route.query.id || 1)

const equipmentName = computed(() => route.query.name || '设备')

// 设备信息
const equipmentInfo = ref({
  name: equipmentName.value,
  model: 'VMC-850',
  line: 'A产线',
  position: '1号工位',
  lastMaintenance: '2025-07-24',
  nextMaintenance: '2025-08-01',
  runningTime: 2456,
  maintenancePerson: '张三'
})



// 状态计算
const equipmentStatus = computed(() => {
  const daysUntil = getDaysUntil(equipmentInfo.value.nextMaintenance)
  if (daysUntil < 0) return { type: 'danger', label: '保养超期' }
  if (daysUntil <= 3) return { type: 'warning', label: '即将保养' }
  return { type: 'success', label: '运行正常' }
})

// 数据
const maintenancePlans = ref([])
const currentTask = ref(null)
const equipmentMetrics = ref([])
const qualityScore = ref({
  score: 85,
  factors: {
    '按时完成率': 90,
    '操作规范性': 80,
    '故障减少率': 85
  },
  recommendations: []
})
const maintenanceLibrary = ref([])
const maintenanceRecords = ref([])

// 表单状态
const showCreateTask = ref(false)
const showExecuteTask = ref(false)
const showHistory = ref(false)
const showPlanDialog = ref(false)
const showLibrary = ref(false)
const taskStarted = ref(false)
const completedItems = ref([])

// 表单数据
const taskForm = reactive({
  name: '',
  executor: '',
  plannedDate: '',
  items: []
})

const executeForm = reactive({
  startTime: '',
  items: [],
  parts: [],
  remarks: ''
})

// 上传配置
const uploadAction = '/api/upload'
const uploadHeaders = { token: 'your-token' }

// 方法
const loadData = async () => {
  try {
    // 加载保养计划
    const plansRes = await maintenanceAPI.getMaintenanceCycles({ equipmentId: equipmentId.value })
    maintenancePlans.value = plansRes.data.content

    // 加载当前任务
    const tasksRes = await maintenanceAPI.getMaintenanceTasks({ equipmentId: equipmentId.value })
    currentTask.value = tasksRes.data.content.find(t => t.status === 'PENDING')

    // 加载设备指标
    const metricsRes = await maintenanceAPI.getEquipmentMetrics(equipmentId.value)
    equipmentMetrics.value = metricsRes.data.metrics

    // 加载质量评分
    const qualityRes = await maintenanceAPI.getMaintenanceQuality(equipmentId.value)
    qualityScore.value = qualityRes.data

    // 加载维保资料
    const libraryRes = await maintenanceAPI.getMaintenanceLibrary()
    maintenanceLibrary.value = libraryRes.data.content

    // 加载保养记录
    const recordsRes = await maintenanceAPI.getMaintenanceRecords({ equipmentId: equipmentId.value })
    maintenanceRecords.value = recordsRes.data.content
  } catch (error) {
    ElMessage.error('加载数据失败')
  }
}

const getDaysUntil = (dateStr) => {
  const target = new Date(dateStr)
  const today = new Date()
  const diffTime = target - today
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

const getTrendType = (trend) => {
  switch(trend) {
    case 'UP': return 'danger'
    case 'DOWN': return 'success'
    default: return 'info'
  }
}

const getProgressValue = (metric) => {
  // 简化的进度计算
  return Math.min(100, Math.max(0, metric.value))
}

const getProgressColor = (metric) => {
  if (metric.trend === 'UP') return '#f56c6c'
  if (metric.trend === 'DOWN') return '#67c23a'
  return '#409eff'
}

const getScoreColor = (score) => {
  if (score >= 90) return '#67c23a'
  if (score >= 70) return '#e6a23c'
  return '#f56c6c'
}

const taskStatusType = (status) => {
  switch(status) {
    case 'PENDING': return 'warning'
    case 'IN_PROGRESS': return 'primary'
    case 'COMPLETED': return 'success'
    default: return 'info'
  }
}

const createTask = async () => {
  try {
    await maintenanceAPI.createMaintenanceTask({
      equipmentId: equipmentId.value,
      taskName: taskForm.name,
      executor: taskForm.executor,
      plannedDate: taskForm.plannedDate,
      items: taskForm.items
    })
    ElMessage.success('任务创建成功')
    showCreateTask.value = false
    loadData()
  } catch (error) {
    ElMessage.error('创建失败')
  }
}

const startTask = () => {
  taskStarted.value = true
  executeForm.startTime = new Date().toLocaleString()
  executeForm.items = currentTask.value.items.map(item => ({
    name: item,
    result: '',
    photos: [],
    video: '',
    audio: ''
  }))
  executeForm.parts = [
    { name: '润滑油', quantity: 0, unit: '升' },
    { name: '滤芯', quantity: 0, unit: '个' }
  ]
  showExecuteTask.value = true
}

const handleUploadSuccess = (response, item) => {
  item.photos.push(response.url)
}

const completeTask = async () => {
  try {
    await maintenanceAPI.completeTask(currentTask.value.id, {
      items: executeForm.items,
      parts: executeForm.parts.filter(p => p.quantity > 0),
      remarks: executeForm.remarks,
      duration: Date.now() - new Date(executeForm.startTime).getTime()
    })
    ElMessage.success('任务完成')
    showExecuteTask.value = false
    loadData()
  } catch (error) {
    ElMessage.error('提交失败')
  }
}

const calculateDuration = (start, end) => {
  const startTime = new Date(start)
  const endTime = new Date(end)
  const diff = endTime - startTime
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  return `${hours}小时${minutes}分钟`
}

const applyTemplate = (template) => {
  taskForm.items = [template.name, ...template.description.split('、')]
  ElMessage.success('已应用模板')
}

const refreshData = () => {
  loadData()
  ElMessage.success('数据已刷新')
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.maintenance-form {
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

.equipment-card {
  margin-bottom: 20px;
}

.main-content {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.plan-item {
  padding: 10px;
}

.metrics-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 15px;
  margin-bottom: 20px;
}

.metric-card {
  background: white;
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.metric-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.metric-value {
  margin-bottom: 10px;
}

.metric-suggestion {
  font-size: 12px;
  color: #666;
}

.quality-score {
  text-align: center;
  margin-top: 20px;
}

.quality-factors {
  margin-top: 15px;
  font-size: 14px;
  color: #666;
}

.current-task {
  margin-bottom: 20px;
}

.task-items {
  margin-top: 20px;
}

.maintenance-item {
  padding: 15px;
  border-bottom: 1px solid #eee;
}

.maintenance-item:last-child {
  border-bottom: none;
}

.item-meta {
  margin: 10px 0;
  font-size: 12px;
  color: #666;
}

.execute-item {
  margin-bottom: 20px;
  padding: 15px;
  background: #f5f7fa;
  border-radius: 8px;
}

.record-images {
  margin-top: 10px;
}
</style>
