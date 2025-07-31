<template>
  <div class="maintenance-form">
    <!-- 页面头部 -->
    <div class="page-header">
      <h2>{{ equipmentName }} - 保养管理</h2>
      <div class="header-actions">
        <!-- 自定义保养计划按钮 -->
        <el-button type="primary" @click="showCreatePlan = true">
          <el-icon><Setting /></el-icon>
          自定义保养计划
        </el-button>
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
              <el-button type="primary" text @click="showCreatePlan = true">
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
                <div class="plan-actions">
                  <el-button
                      type="primary"
                      size="small"
                      @click="startMaintenance(plan)"
                      v-if="plan.status === 'PENDING' || plan.status === 'OVERDUE'"
                  >
                    开始保养
                  </el-button>
                </div>
              </div>
            </el-timeline-item>
          </el-timeline>
        </el-card>
      </el-col>
    </el-row>

    <!-- 当前任务 -->
    <el-card class="current-task" v-if="currentTask">
      <template #header>
        <div class="card-header">
          <span>当前任务：{{ currentTask.taskName }}</span>
          <el-button type="success" @click="startMaintenance(currentTask)">
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

    <!-- 对话框：自定义保养计划 -->
    <el-dialog v-model="showCreatePlan" title="自定义保养计划" width="900px">
      <el-form :model="planForm" ref="planFormRef" label-width="120px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="计划名称" prop="name" required>
              <el-input v-model="planForm.name" placeholder="请输入计划名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="计划类别" prop="category" required>
              <el-select v-model="planForm.category" placeholder="请选择类别">
                <el-option label="日常保养" value="daily" />
                <el-option label="月度保养" value="monthly" />
                <el-option label="季度保养" value="quarterly" />
                <el-option label="年度保养" value="yearly" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="保养周期" prop="cycle" required>
              <el-input-number v-model="planForm.cycle" :min="1" :max="365" />
              <el-select v-model="planForm.cycleUnit" style="width: 100px; margin-left: 10px">
                <el-option label="天" value="days" />
                <el-option label="周" value="weeks" />
                <el-option label="月" value="months" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="执行人" prop="executor" required>
              <el-select v-model="planForm.executor" placeholder="请选择执行人">
                <el-option label="张三" value="张三" />
                <el-option label="李四" value="李四" />
                <el-option label="王五" value="王五" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="保养项目">
          <el-button type="primary" @click="addMaintenanceItem" plain>
            <el-icon><Plus /></el-icon> 添加保养项
          </el-button>

          <div v-for="(item, index) in planForm.items" :key="index" class="plan-item-card">
            <div class="item-header">
              <span>保养项 {{ index + 1 }}</span>
              <el-button type="danger" size="small" @click="removeItem(index)" circle>
                <el-icon><Delete /></el-icon>
              </el-button>
            </div>

            <el-form-item :label="'名称'" :prop="`items[${index}].name`" :rules="{ required: true, message: '请输入名称' }">
              <el-input v-model="item.name" placeholder="保养项名称" />
            </el-form-item>

            <el-form-item :label="'类别'">
              <el-input v-model="item.category" placeholder="保养类别" />
            </el-form-item>

            <el-form-item :label="'执行标准'">
              <el-input v-model="item.standard" type="textarea" :rows="2" placeholder="执行标准" />
            </el-form-item>

            <el-form-item :label="'执行方法'">
              <el-input v-model="item.method" type="textarea" :rows="2" placeholder="执行方法" />
            </el-form-item>

            <el-form-item :label="'问题处理'">
              <el-input v-model="item.problemHandling" type="textarea" :rows="2" placeholder="问题处理方法" />
            </el-form-item>

            <el-form-item :label="'处理方式'">
              <el-input v-model="item.handlingMethod" placeholder="处理方式" />
            </el-form-item>

            <el-form-item :label="'处理工具'">
              <el-input v-model="item.tools" placeholder="所需工具，用逗号分隔" />
            </el-form-item>

            <el-form-item :label="'备注'">
              <el-input v-model="item.remark" type="textarea" :rows="2" placeholder="备注信息" />
            </el-form-item>
          </div>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="showCreatePlan = false">取消</el-button>
        <el-button type="primary" @click="savePlan">保存计划</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  Plus, Edit, Document, Setting, Delete, VideoPlay
} from '@element-plus/icons-vue'
import maintenanceAPI from '@/api/maintenanceAPI'

const route = useRoute()
const router = useRouter()
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

const showCreatePlan = ref(false)
const planFormRef = ref()
const planForm = reactive({
  name: '',
  category: '',
  cycle: 1,
  cycleUnit: 'days',
  executor: '',
  items: [
    {
      name: '',
      category: '',
      standard: '',
      method: '',
      problemHandling: '',
      handlingMethod: '',
      tools: '',
      remark: ''
    }
  ]
})

// 新增方法
const addMaintenanceItem = () => {
  planForm.items.push({
    name: '',
    category: '',
    standard: '',
    method: '',
    problemHandling: '',
    handlingMethod: '',
    tools: '',
    remark: ''
  })
}

const removeItem = (index) => {
  if (planForm.items.length > 1) {
    planForm.items.splice(index, 1)
  } else {
    ElMessage.warning('至少保留一个保养项')
  }
}

const savePlan = async () => {
  try {
    await planFormRef.value.validate()

    // 调用API保存保养计划
    await maintenanceAPI.createMaintenancePlan({
      equipmentId: equipmentId.value,
      ...planForm
    })

    ElMessage.success('保养计划保存成功')
    showCreatePlan.value = false

    // 刷新数据
    loadData()
  } catch (error) {
    if (!error) {
      ElMessage.error('请填写完整信息')
    }
  }
}

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
const maintenanceRecords = ref([])

// 表单状态
const showCreateTask = ref(false)
const showHistory = ref(false)
const taskStarted = ref(false)

// 表单数据
const taskForm = reactive({
  name: '',
  executor: '',
  plannedDate: '',
  items: []
})

// 方法
const loadData = async () => {
  try {
    // 加载保养计划
    const plansRes = await maintenanceAPI.getMaintenanceCycles({ equipmentId: equipmentId.value })
    maintenancePlans.value = plansRes.data.content.map(plan => {
      return {
        ...plan,
        cycleTypeLabel: getCycleTypeLabel(plan.cycleType),
        statusLabel: getStatusLabel(plan.status)
      }
    })

    // 加载当前任务
    const tasksRes = await maintenanceAPI.getMaintenanceTasks({ equipmentId: equipmentId.value })
    const tasks = tasksRes.data.content.map(task => {
      return {
        ...task,
        statusLabel: getTaskStatusLabel(task.status)
      }
    })

    // 找到待处理或进行中的任务
    currentTask.value = tasks.find(t => t.status === 'PENDING' || t.status === 'IN_PROGRESS')

    // 加载保养记录
    const recordsRes = await maintenanceAPI.getMaintenanceRecords({ equipmentId: equipmentId.value })
    maintenanceRecords.value = recordsRes.data.content
  } catch (error) {
    ElMessage.error('加载数据失败')
    console.error(error)
  }
}

const getDaysUntil = (dateStr) => {
  const target = new Date(dateStr)
  const today = new Date()
  const diffTime = target - today
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

// 状态类型转换
const getCycleTypeLabel = (type) => {
  switch(type) {
    case 'DAILY': return '日常'
    case 'WEEKLY': return '每周'
    case 'MONTHLY': return '每月'
    case 'QUARTERLY': return '每季'
    case 'YEARLY': return '每年'
    default: return type
  }
}

const getStatusLabel = (status) => {
  switch(status) {
    case 'PENDING': return '待处理'
    case 'IN_PROGRESS': return '进行中'
    case 'COMPLETED': return '已完成'
    case 'OVERDUE': return '已超期'
    default: return status
  }
}

const getTaskStatusLabel = (status) => {
  switch(status) {
    case 'PENDING': return '待处理'
    case 'IN_PROGRESS': return '进行中'
    case 'COMPLETED': return '已完成'
    default: return status
  }
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
    console.error(error)
  }
}

const calculateDuration = (start, end) => {
  if (!start || !end) return '-'
  const startTime = new Date(start)
  const endTime = new Date(end)
  const diff = endTime - startTime
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  return `${hours}小时${minutes}分钟`
}

// 开始保养 - 路由跳转
const startMaintenance = (task) => {
  router.push({
    path: '/maintenance/action',
    query: {
      id: equipmentId.value,
      name: equipmentName.value,
      taskId: task.id,
      taskName: task.taskName
    }
  })
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
  position: relative;
}

.plan-actions {
  margin-top: 10px;
}

.current-task {
  margin-bottom: 20px;
}

.plan-item-card {
  border: 1px solid #ebeef5;
  border-radius: 4px;
  padding: 15px;
  margin: 15px 0;
  background-color: #f8f9fa;
  position: relative;
}

.item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid #dcdfe6;
}
</style>
