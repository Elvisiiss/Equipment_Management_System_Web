<template>
  <div class="maintenance-form">
    <!-- 页面头部 -->
    <div class="page-header">
      <h2>{{ equipmentName }} - 保养管理</h2>
      <div class="header-actions">
        <!-- 自定义保养计划按钮 -->
        <el-button type="primary" @click="openPlanDialog(null)">
          <el-icon><Setting /></el-icon>
          自定义保养计划
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

    <!-- 保养计划列表 -->
    <el-card class="plan-list-card">
      <template #header>
        <div class="card-header">
          <span>保养计划</span>
          <el-button type="primary" @click="openPlanDialog(null)">
            <el-icon><Plus /></el-icon>
            添加计划
          </el-button>
        </div>
      </template>

      <el-table :data="maintenancePlans" border style="width: 100%">
        <el-table-column prop="name" label="计划名称" width="180" />
        <el-table-column label="周期">
          <template #default="{ row }">
            {{ row.cycleValue }}{{ row.cycleUnitLabel }}
          </template>
        </el-table-column>
        <el-table-column prop="executor" label="执行人" width="120" />
        <el-table-column prop="nextDate" label="下次执行" width="120" />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 'OVERDUE' ? 'danger' : 'success'" size="small">
              {{ row.statusLabel }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="250" align="center">
          <template #default="{ row }">
            <el-button size="small" @click="openPlanDialog(row)">
              <el-icon><Edit /></el-icon>编辑
            </el-button>
            <el-button
                size="small"
                type="danger"
                @click="deletePlan(row.id)"
                :disabled="row.status === 'IN_PROGRESS'"
            >
              <el-icon><Delete /></el-icon>删除
            </el-button>
            <el-button
                size="small"
                type="primary"
                @click="startMaintenance(row)"
                v-if="row.status === 'PENDING' || row.status === 'OVERDUE'"
            >
              <el-icon><VideoPlay /></el-icon>执行
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

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

    <!-- 对话框：保养计划管理 -->
    <el-dialog
        v-model="showPlanDialog"
        :title="editPlanId ? '编辑保养计划' : '创建保养计划'"
        width="900px"
        top="5vh"
    >
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
            <el-form-item label="执行人" prop="executor" required>
              <el-select v-model="planForm.executor" placeholder="请选择执行人">
                <el-option label="张三" value="张三" />
                <el-option label="李四" value="李四" />
                <el-option label="王五" value="王五" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 保养周期设置 -->
        <el-form-item label="保养周期">
          <div class="cycle-section">
            <div class="form-group">
              <label>重复类型：</label>
              <el-select v-model="planForm.repeat_type" @change="resetRepeatConfig">
                <el-option value="none">不重复</el-option>
                <el-option value="daily">每天</el-option>
                <el-option value="weekly">每周</el-option>
                <el-option value="monthly_date">每月（按日期）</el-option>
                <el-option value="monthly_week">每月（按周）</el-option>
                <el-option value="yearly">每年</el-option>
                <el-option value="custom">自定义</el-option>
              </el-select>
            </div>

            <!-- 每周重复配置 -->
            <div v-if="planForm.repeat_type === 'weekly'" class="form-group">
              <label>重复星期：</label>
              <div class="weekdays">
                <button v-for="(day, index) in weekdays" :key="index"
                        type="button"
                        :class="{ 'active': weeklyConfig.days.includes(index) }"
                        @click="toggleWeekday(index)">
                  {{ day }}
                </button>
              </div>
            </div>

            <!-- 每月按日期重复 -->
            <div v-if="planForm.repeat_type === 'monthly_date'" class="form-group">
              <label>每月日期：</label>
              <el-input-number v-model="monthlyDateConfig.day" :min="1" :max="31" />
            </div>

            <!-- 每月按周重复 -->
            <div v-if="planForm.repeat_type === 'monthly_week'" class="form-row">
              <div class="form-group">
                <label>第几周：</label>
                <el-select v-model="monthlyWeekConfig.week">
                  <el-option value="1">第一周</el-option>
                  <el-option value="2">第二周</el-option>
                  <el-option value="3">第三周</el-option>
                  <el-option value="4">第四周</el-option>
                  <el-option value="last">最后一周</el-option>
                </el-select>
              </div>

              <div class="form-group">
                <label>星期：</label>
                <el-select v-model="monthlyWeekConfig.day">
                  <el-option v-for="(day, index) in weekdays" :key="index" :value="index">{{ day }}</el-option>
                </el-select>
              </div>
            </div>

            <!-- 每年重复 -->
            <div v-if="planForm.repeat_type === 'yearly'" class="form-row">
              <div class="form-group">
                <label>月份：</label>
                <el-input-number v-model="yearlyConfig.month" :min="1" :max="12" />
              </div>

              <div class="form-group">
                <label>日期：</label>
                <el-input-number v-model="yearlyConfig.day" :min="1" :max="31" />
              </div>
            </div>

            <!-- 自定义重复 -->
            <div v-if="planForm.repeat_type === 'custom'" class="form-row">
              <div class="form-group">
                <label>间隔：</label>
                <el-input-number v-model="customConfig.interval" :min="1" />
              </div>

              <div class="form-group">
                <label>单位：</label>
                <el-select v-model="customConfig.unit">
                  <el-option value="day">天</el-option>
                  <el-option value="week">周</el-option>
                  <el-option value="month">月</el-option>
                </el-select>
              </div>
            </div>

            <!-- 自定义每周重复 -->
            <div v-if="planForm.repeat_type === 'custom' && customConfig.unit === 'week'" class="form-group">
              <label>重复星期：</label>
              <div class="weekdays">
                <button v-for="(day, index) in weekdays" :key="index"
                        type="button"
                        :class="{ 'active': customConfig.days.includes(index) }"
                        @click="toggleCustomWeekday(index)">
                  {{ day }}
                </button>
              </div>
            </div>
          </div>
        </el-form-item>

        <!-- 结束条件 -->
        <el-form-item label="结束条件">
          <div class="end-condition">
            <div class="form-group">
              <label>结束类型：</label>
              <el-select v-model="planForm.end_type">
                <el-option value="never">永不结束</el-option>
                <el-option value="after_occurrences">重复次数后结束</el-option>
                <el-option value="on_date">指定日期结束</el-option>
              </el-select>
            </div>

            <div v-if="planForm.end_type === 'after_occurrences'" class="form-group">
              <label>重复次数：</label>
              <el-input-number v-model="planForm.end_value" :min="1" />
            </div>

            <div v-if="planForm.end_type === 'on_date'" class="form-group">
              <label>结束日期：</label>
              <el-date-picker v-model="planForm.end_value" type="date" placeholder="选择日期" />
            </div>
          </div>
        </el-form-item>

        <el-form-item label="保养项目">
          <div class="add-item-btn">
            <el-button type="primary" @click="addMaintenanceItem" plain>
              <el-icon><Plus /></el-icon> 添加保养项
            </el-button>
          </div>

          <div
              v-for="(item, index) in planForm.items"
              :key="index"
              class="plan-item-card"
          >
            <div class="item-header">
              <span>保养项 {{ index + 1 }}</span>
              <el-button
                  type="danger"
                  size="small"
                  @click="removeItem(index)"
                  circle
              >
                <el-icon><Delete /></el-icon>
              </el-button>
            </div>

            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item
                    :label="'名称'"
                    :prop="`items[${index}].name`"
                    :rules="{ required: true, message: '请输入名称' }"
                >
                  <el-input v-model="item.name" placeholder="保养项名称" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item :label="'类别'">
                  <el-input v-model="item.category" placeholder="保养类别" />
                </el-form-item>
              </el-col>
            </el-row>

            <el-form-item :label="'执行标准'">
              <el-input v-model="item.standard" type="textarea" :rows="2" placeholder="执行标准" />
            </el-form-item>

            <el-form-item :label="'执行方法'">
              <el-input v-model="item.method" type="textarea" :rows="2" placeholder="执行方法" />
            </el-form-item>

            <el-form-item :label="'问题处理'">
              <el-input v-model="item.problemHandling" type="textarea" :rows="2" placeholder="问题处理方法" />
            </el-form-item>

            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item :label="'处理方式'">
                  <el-input v-model="item.handlingMethod" placeholder="处理方式" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item :label="'处理工具'">
                  <el-input v-model="item.tools" placeholder="所需工具，用逗号分隔" />
                </el-form-item>
              </el-col>
            </el-row>

            <el-form-item :label="'备注'">
              <el-input v-model="item.remark" type="textarea" :rows="2" placeholder="备注信息" />
            </el-form-item>
          </div>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="showPlanDialog = false">取消</el-button>
        <el-button type="primary" @click="savePlan">
          {{ editPlanId ? '更新计划' : '保存计划' }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
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

// 状态计算
const equipmentStatus = computed(() => {
  const daysUntil = getDaysUntil(equipmentInfo.value.nextMaintenance)
  if (daysUntil < 0) return { type: 'danger', label: '保养超期' }
  if (daysUntil <= 3) return { type: 'warning', label: '即将保养' }
  return { type: 'success', label: '运行正常' }
})

// 工作日名称
const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']

// 计划管理相关状态
const showPlanDialog = ref(false)
const planFormRef = ref()
const editPlanId = ref(null)
const planForm = reactive({
  name: '',
  category: '',
  executor: '',
  repeat_type: 'none',
  end_type: 'never',
  end_value: null,
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

// 各种重复类型的配置
const weeklyConfig = reactive({ days: [] })
const monthlyDateConfig = reactive({ day: 1 })
const monthlyWeekConfig = reactive({ week: '1', day: 1 })
const yearlyConfig = reactive({ month: 1, day: 1 })
const customConfig = reactive({
  unit: 'day',
  interval: 1,
  days: []
})

// 打开保养计划对话框
const openPlanDialog = (plan) => {
  resetPlanForm()
  resetRepeatConfig()

  if (plan) {
    // 编辑模式
    editPlanId.value = plan.id
    planForm.name = plan.name
    planForm.category = plan.category
    planForm.executor = plan.executor
    planForm.repeat_type = plan.repeat_type || 'none'
    planForm.end_type = plan.end_type || 'never'
    planForm.end_value = plan.end_value || null

    // 加载重复配置
    if (plan.repeat_config) {
      const config = JSON.parse(plan.repeat_config)
      switch (planForm.repeat_type) {
        case 'weekly':
          weeklyConfig.days = config.days || []
          break
        case 'monthly_date':
          monthlyDateConfig.day = config.day || 1
          break
        case 'monthly_week':
          monthlyWeekConfig.week = config.week || '1'
          monthlyWeekConfig.day = config.day || 1
          break
        case 'yearly':
          yearlyConfig.month = config.month || 1
          yearlyConfig.day = config.day || 1
          break
        case 'custom':
          customConfig.unit = config.unit || 'day'
          customConfig.interval = config.interval || 1
          customConfig.days = config.days || []
          break
      }
    }

    // 如果有保养项数据则加载
    if (plan.items && plan.items.length > 0) {
      planForm.items = plan.items.map(item => ({ ...item }))
    } else {
      planForm.items = [{ ...defaultItem }]
    }
  } else {
    // 新增模式
    editPlanId.value = null
    planForm.items = [{ ...defaultItem }]
  }

  showPlanDialog.value = true
}

// 重置计划表单
const resetPlanForm = () => {
  planForm.name = ''
  planForm.category = ''
  planForm.executor = ''
  planForm.repeat_type = 'none'
  planForm.end_type = 'never'
  planForm.end_value = null
  planForm.items = []
}

// 默认保养项模板
const defaultItem = {
  name: '',
  category: '',
  standard: '',
  method: '',
  problemHandling: '',
  handlingMethod: '',
  tools: '',
  remark: ''
}

// 添加保养项
const addMaintenanceItem = () => {
  planForm.items.push({ ...defaultItem })
}

// 删除保养项
const removeItem = (index) => {
  if (planForm.items.length > 1) {
    planForm.items.splice(index, 1)
  } else {
    ElMessage.warning('至少保留一个保养项')
  }
}

// 切换星期选择
const toggleWeekday = (index) => {
  const idx = weeklyConfig.days.indexOf(index)
  if (idx > -1) {
    weeklyConfig.days.splice(idx, 1)
  } else {
    weeklyConfig.days.push(index)
    weeklyConfig.days.sort()
  }
}

// 切换自定义重复的星期选择
const toggleCustomWeekday = (index) => {
  const idx = customConfig.days.indexOf(index)
  if (idx > -1) {
    customConfig.days.splice(idx, 1)
  } else {
    customConfig.days.push(index)
    customConfig.days.sort()
  }
}

// 重置重复配置
const resetRepeatConfig = () => {
  weeklyConfig.days = []
  monthlyDateConfig.day = 1
  monthlyWeekConfig.week = '1'
  monthlyWeekConfig.day = 1
  yearlyConfig.month = 1
  yearlyConfig.day = 1
  customConfig.unit = 'day'
  customConfig.interval = 1
  customConfig.days = []
}

// 生成重复配置
const generateRepeatConfig = () => {
  switch (planForm.repeat_type) {
    case 'weekly':
      return { days: [...weeklyConfig.days] }
    case 'monthly_date':
      return { day: monthlyDateConfig.day }
    case 'monthly_week':
      return { week: monthlyWeekConfig.week, day: monthlyWeekConfig.day }
    case 'yearly':
      return { month: yearlyConfig.month, day: yearlyConfig.day }
    case 'custom':
      const config = { unit: customConfig.unit, interval: customConfig.interval }
      if (customConfig.unit === 'week' && customConfig.days.length > 0) {
        config.days = [...customConfig.days]
      }
      return config
    default:
      return {}
  }
}

// 保存保养计划
const savePlan = async () => {
  try {
    await planFormRef.value.validate()

    const repeat_config = generateRepeatConfig()

    // 准备周期数据（兼容旧API）
    let cycleValue = 1
    let cycleUnit = 'days'

    if (planForm.repeat_type === 'daily') {
      cycleUnit = 'days'
      cycleValue = 1
    } else if (planForm.repeat_type === 'weekly') {
      cycleUnit = 'weeks'
      cycleValue = 1
    } else if (planForm.repeat_type === 'monthly_date' ||
        planForm.repeat_type === 'monthly_week') {
      cycleUnit = 'months'
      cycleValue = 1
    } else if (planForm.repeat_type === 'yearly') {
      cycleUnit = 'months'
      cycleValue = 12
    } else if (planForm.repeat_type === 'custom') {
      cycleUnit = customConfig.unit
      cycleValue = customConfig.interval
    }

    const planData = {
      ...planForm,
      equipmentId: equipmentId.value,
      cycleValue,
      cycleUnit,
      repeat_config: JSON.stringify(repeat_config),
      end_value: planForm.end_type === 'never' ? null : planForm.end_value
    }

    if (editPlanId.value) {
      // 更新计划
      await maintenanceAPI.updateMaintenancePlan(editPlanId.value, planData)
      ElMessage.success('保养计划更新成功')
    } else {
      // 创建计划
      await maintenanceAPI.createMaintenancePlan(planData)
      ElMessage.success('保养计划创建成功')
    }

    showPlanDialog.value = false
    loadData()
  } catch (error) {
    if (!error) {
      ElMessage.error('请填写完整信息')
    }
  }
}

// 删除保养计划
const deletePlan = async (id) => {
  try {
    await ElMessageBox.confirm(
        '确定要删除该保养计划吗？此操作不可恢复',
        '警告',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
    )

    await maintenanceAPI.deleteMaintenancePlan(id)
    ElMessage.success('保养计划已删除')
    loadData()
  } catch (error) {
    // 用户取消删除
  }
}

// 数据
const maintenancePlans = ref([])
const maintenanceRecords = ref([])

// 表单状态
const showHistory = ref(false)

// 方法
const loadData = async () => {
  try {
    // 加载保养计划
    const plansRes = await maintenanceAPI.getMaintenanceCycles({
      equipmentId: equipmentId.value
    })

    maintenancePlans.value = plansRes.data.content.map(plan => {
      return {
        ...plan,
        cycleTypeLabel: getCycleTypeLabel(plan.cycleType),
        cycleUnitLabel: getCycleUnitLabel(plan.cycleUnit),
        statusLabel: getStatusLabel(plan.status)
      }
    })

    // 加载保养记录
    const recordsRes = await maintenanceAPI.getMaintenanceRecords({
      equipmentId: equipmentId.value
    })
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

const getCycleUnitLabel = (unit) => {
  switch(unit) {
    case 'days': return '天'
    case 'weeks': return '周'
    case 'months': return '月'
    default: return unit
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
const startMaintenance = (plan) => {
  router.push({
    path: '/maintenance/action',
    query: {
      id: equipmentId.value,
      name: equipmentName.value,
      planId: plan.id,
      planName: plan.name
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

.equipment-card,
.plan-list-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* 保养项卡片样式 */
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

.add-item-btn {
  margin-bottom: 20px;
}

/* 周期设置样式 */
.cycle-section, .end-condition {
  padding: 15px;
  background-color: #f9fafb;
  border-radius: 8px;
  margin-bottom: 15px;
}

.form-group {
  margin-bottom: 15px;
}

.form-row {
  display: flex;
  gap: 15px;
}

.form-row .form-group {
  flex: 1;
}

.weekdays {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 10px;
}

.weekdays button {
  flex: 1;
  min-width: 60px;
  padding: 8px 5px;
  background-color: #edf2f7;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.weekdays button:hover {
  background-color: #e2e8f0;
}

.weekdays button.active {
  background-color: #3498db;
  color: white;
  font-weight: bold;
  border-color: #3498db;
}
</style>
