<template>
  <div class="plan-list-container">
    <div class="header">
      <h2>点检计划列表</h2>
      <div class="actions">
        <el-button type="primary" @click="openCreateDialog">
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
          <el-select v-model="filterForm.status" placeholder="请选择状态" style="width: 120px">
            <el-option
                v-for="item in statusOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="计划类型">
          <el-select v-model="filterForm.type" placeholder="请选择类型" style="width: 120px">
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
      <el-table-column prop="type" label="计划类型" width="120">
        <template #default="{row}">
          <el-tag>{{ formatType(row.type) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="frequency" label="执行频率" width="120">
        <template #default="{row}">
          {{ formatFrequency(row.frequency) }}
        </template>
      </el-table-column>
      <el-table-column prop="regionName" label="地区" width="120" />
      <el-table-column prop="executor" label="执行人" width="120" />
      <el-table-column prop="cycleType" label="循环方式" width="120">
        <template #default="{row}">
          {{ formatCycleType(row.cycleType) }}
        </template>
      </el-table-column>
      <el-table-column prop="startDate" label="开始日期" width="120" /> <!-- 仅日期 -->
      <el-table-column prop="endDate" label="结束日期" width="120" /> <!-- 仅日期 -->
      <el-table-column label="每日时段" width="120">
        <template #default="{row}">
          {{ row.dailyStartTime }} - {{ row.dailyEndTime }}
        </template>
      </el-table-column>
      <el-table-column prop="nextTime" label="下次执行时间" width="160" />
      <el-table-column prop="status" label="状态" width="120">
        <template #default="{row}">
          <el-switch
              v-model="row.status"
              :active-value="1"
              :inactive-value="0"
              @change="handleStatusChange(row)"
          />
        </template>
      </el-table-column>
      <el-table-column label="点检项目" width="120">
        <template #default="{row}">
          <el-button type="text" @click="viewPlanItems(row)">
            {{ row.items?.length || 0 }}项
          </el-button>
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
        <el-descriptions-item label="地区">
          {{ currentPlan.regionName }}
        </el-descriptions-item>
        <el-descriptions-item label="执行人">
          {{ currentPlan.executor }}
        </el-descriptions-item>
        <el-descriptions-item label="循环方式">
          {{ formatCycleType(currentPlan.cycleType) }}
        </el-descriptions-item>
        <el-descriptions-item label="开始日期">
          {{ currentPlan.startDate }} <!-- 仅日期 -->
        </el-descriptions-item>
        <el-descriptions-item label="结束日期">
          {{ currentPlan.endDate }} <!-- 仅日期 -->
        </el-descriptions-item>
        <el-descriptions-item label="每日时段">
          {{ currentPlan.dailyStartTime }} - {{ currentPlan.dailyEndTime }}
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

      <div class="plan-items" v-if="currentPlan.items?.length">
        <h3>点检项目 ({{ currentPlan.items.length }}项)</h3>
        <el-table :data="currentPlan.items" border style="width: 100%">
          <el-table-column prop="name" label="项目名称" width="150" />
          <el-table-column prop="category" label="类别" width="120" />
          <el-table-column prop="standard" label="执行标准" />
          <el-table-column prop="method" label="执行方法" />
          <el-table-column prop="problemHandling" label="问题处理" />
          <el-table-column prop="handlingMethod" label="处理方式" />
          <el-table-column prop="tools" label="处理工具" width="150" />
        </el-table>
      </div>

      <template #footer>
        <el-button @click="detailDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>

    <!-- 点检项目对话框 -->
    <el-dialog
        v-model="itemsDialogVisible"
        :title="`点检项目 - ${currentPlan.planName}`"
        width="70%"
    >
      <el-table :data="currentPlan.items" border style="width: 100%">
        <el-table-column prop="name" label="项目名称" width="150" />
        <el-table-column prop="category" label="类别" width="120" />
        <el-table-column prop="standard" label="执行标准" />
        <el-table-column prop="method" label="执行方法" />
        <el-table-column prop="problemHandling" label="问题处理" />
        <el-table-column prop="handlingMethod" label="处理方式" />
        <el-table-column prop="tools" label="处理工具" width="150" />
      </el-table>

      <template #footer>
        <el-button @click="itemsDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>

    <!-- 创建/编辑计划对话框 -->
    <el-dialog
        v-model="createDialogVisible"
        :title="isEditMode ? '编辑点检计划' : '创建点检计划'"
        width="900px"
        top="5vh"
    >
      <el-form :model="planForm" ref="planFormRef" label-width="120px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="计划编号" prop="planNo" required>
              <el-input v-model="planForm.planNo" placeholder="请输入计划编号" />
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="计划名称" prop="planName" required>
              <el-input v-model="planForm.planName" placeholder="请输入计划名称" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="计划类型" prop="type" required>
              <el-select v-model="planForm.type" placeholder="请选择计划类型">
                <el-option
                    v-for="item in typeOptions.filter(opt => opt.value)"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="关联策略" prop="policyName">
              <el-select v-model="planForm.policyName" placeholder="请选择关联策略">
                <el-option label="设备日常点检策略" value="设备日常点检策略" />
                <el-option label="开工检查策略" value="开工检查策略" />
                <el-option label="设备月度维护策略" value="设备月度维护策略" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="地区" prop="regionName" required>
              <el-select v-model="planForm.regionName" placeholder="请选择地区">
                <el-option label="华东区" value="华东区" />
                <el-option label="华南区" value="华南区" />
                <el-option label="华区" value="华区" />
                <el-option label="最北边" value="最北边" />
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

        <!-- 巡检周期设置 -->
        <el-form-item label="巡检周期">
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
                <button
                    v-for="(day, index) in weekdays"
                    :key="index"
                    type="button"
                    :class="{ 'active': weeklyConfig.days.includes(index) }"
                    @click="toggleWeekday(index)"
                >
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
                <button
                    v-for="(day, index) in weekdays"
                    :key="index"
                    type="button"
                    :class="{ 'active': customConfig.days.includes(index) }"
                    @click="toggleCustomWeekday(index)"
                >
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

        <!-- 开始时间和截止时间 -->
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="开始时间" prop="dailyStartTime" required>
              <el-time-picker
                  v-model="planForm.dailyStartTime"
                  format="HH:mm"
                  value-format="HH:mm"
                  placeholder="选择时间"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="截止时间" prop="dailyEndTime" required>
              <el-time-picker
                  v-model="planForm.dailyEndTime"
                  format="HH:mm"
                  value-format="HH:mm"
                  placeholder="选择时间"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="状态" prop="status">
          <el-switch
              v-model="planForm.status"
              :active-value="1"
              :inactive-value="0"
              active-text="启用"
              inactive-text="禁用"
          />
        </el-form-item>

        <el-form-item label="点检项目">
          <div class="add-item-btn">
            <el-button type="primary" @click="addInspectionItem" plain>
              <el-icon><Plus /></el-icon> 添加点检项
            </el-button>
          </div>

          <div
              v-for="(item, index) in planForm.items"
              :key="index"
              class="plan-item-card"
          >
            <div class="item-header">
              <span>点检项 {{ index + 1 }}</span>
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
                  <el-input v-model="item.name" placeholder="点检项名称" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item :label="'类别'">
                  <el-input v-model="item.category" placeholder="点检类别" />
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
          </div>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="createDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitPlanForm">
          {{ isEditMode ? '更新计划' : '创建计划' }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import {ref, onMounted, reactive} from 'vue'
import {Plus, Refresh, Delete} from '@element-plus/icons-vue'
import {getPlanList, updatePlanStatus, deletePlan, generateTasks} from '@/api/inspection'
import {ElMessage} from 'element-plus'

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
const itemsDialogVisible = ref(false)
const createDialogVisible = ref(false)
const isEditMode = ref(false)
const planFormRef = ref()

const currentPlan = ref({
  planNo: '',
  planName: '',
  policyName: '',
  type: '',
  frequency: '',
  regionName: '',
  executor: '',
  cycleType: '',
  startTime: '',
  endTime: '',
  nextTime: '',
  status: 0,
  createTime: '',
  updateTime: '',
  devices: [],
  items: []
})

// 状态选项
const statusOptions = [
  {label: '全部', value: ''},
  {label: '启用', value: '1'},
  {label: '禁用', value: '0'}
]

// 类型选项
const typeOptions = [
  {label: '全部', value: ''},
  {label: '日常点检', value: 'DAILY'},
  {label: '周检', value: 'WEEKLY'},
  {label: '月检', value: 'MONTHLY'},
  {label: '季度检', value: 'QUARTERLY'},
  {label: '年检', value: 'YEARLY'}
]

// 工作日名称
const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']

// 计划表单 - 新增字段
const planForm = reactive({
  planNo: '',
  planName: '',
  policyName: '设备日常点检策略',
  type: 'DAILY',
  regionName: '华东区',
  executor: '张三',
  status: 1,
  // 新增巡检周期相关字段
  repeat_type: 'daily',
  end_type: 'never',
  end_value: null,
  dailyStartTime: '08:00',
  dailyEndTime: '18:00',
  items: [] // 初始为空，在打开对话框时添加
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
    ElMessage.error('获取计划列表失败')
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

// 格式化循环方式
const formatCycleType = (cycleType) => {
  const cycleMap = {
    DAILY: '每天',
    WEEKLY: '每周',
    MONTHLY: '每月',
    QUARTERLY: '每季度',
    YEARLY: '每年',
    CUSTOM: '自定义'
  }
  return cycleMap[cycleType] || cycleType
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

// 打开创建对话框
const openCreateDialog = (plan) => {
  resetPlanForm() // 重置表单

  if (plan) {
    // 编辑模式
    isEditMode.value = true
    Object.assign(planForm, {
      ...plan,
      items: plan.items ? [...plan.items] : []
    })
  } else {
    // 创建模式
    isEditMode.value = false
    // 创建时自动添加一个点检项
    addInspectionItem()
  }
  createDialogVisible.value = true
}

// 重置计划表单
const resetPlanForm = () => {
  Object.assign(planForm, {
    planNo: '',
    planName: '',
    policyName: '设备日常点检策略',
    type: 'DAILY',
    regionName: '华东区',
    executor: '张三',
    status: 1,
    repeat_type: 'daily',
    end_type: 'never',
    end_value: null,
    dailyStartTime: '08:00',
    dailyEndTime: '18:00',
    items: [] // 初始为空
  })

  // 重置重复配置
  resetRepeatConfig()
}

// 添加点检项
const addInspectionItem = () => {
  planForm.items.push({
    name: '',
    category: '',
    standard: '',
    method: '',
    problemHandling: '',
    handlingMethod: '',
    tools: ''
  })
}

// 删除点检项
const removeItem = (index) => {
  if (planForm.items.length > 1) {
    planForm.items.splice(index, 1)
  } else {
    ElMessage.warning('至少保留一个点检项')
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

// 提交计划表单
const submitPlanForm = async () => {
  try {
    // 表单验证
    await planFormRef.value.validate()

    // 模拟API调用
    ElMessage.success(isEditMode.value ? '计划更新成功' : '计划创建成功')

    // 关闭对话框
    createDialogVisible.value = false

    // 刷新列表
    fetchPlanList()
  } catch (error) {
    console.error('表单验证失败', error)
  }
}

// 状态变更
const handleStatusChange = async (plan) => {
  try {
    await updatePlanStatus(plan.planNo, plan.status)
    ElMessage.success('状态更新成功')
  } catch (error) {
    console.error('更新计划状态失败:', error)
    // 恢复原状态
    plan.status = plan.status ? 0 : 1
    ElMessage.error('状态更新失败')
  }
}

// 查看详情
const handleViewDetail = (plan) => {
  currentPlan.value = {...plan}
  detailDialogVisible.value = true
}

// 查看点检项目
const viewPlanItems = (plan) => {
  currentPlan.value = {...plan}
  itemsDialogVisible.value = true
}

// 删除计划
const handleDelete = async (plan) => {
  try {
    await deletePlan(plan.planNo)
    ElMessage.success('计划删除成功')
    await fetchPlanList()
  } catch (error) {
    console.error('删除计划失败:', error)
    ElMessage.error('删除计划失败')
  }
}

// 生成所有计划任务
const handleGenerateTasks = async () => {
  try {
    await generateTasks()
    ElMessage.success('任务生成成功')
    await fetchPlanList()
  } catch (error) {
    console.error('生成任务失败:', error)
    ElMessage.error('生成任务失败')
  }
}

// 生成单个计划任务
const handleGeneratePlanTasks = async (plan) => {
  try {
    await generateTasks(plan.planNo)
    ElMessage.success('任务生成成功')
    await fetchPlanList()
  } catch (error) {
    console.error('生成任务失败:', error)
    ElMessage.error('生成任务失败')
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

  .plan-devices,
  .plan-items {
    margin-top: 20px;

    h3 {
      margin: 20px 0 10px;
      font-size: 16px;
      color: #333;
    }
  }

  .form-tip {
    font-size: 12px;
    color: #999;
    margin-top: 5px;
  }

  .add-item-btn {
    margin-bottom: 15px;
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

  /* 新增：周期设置样式 */
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
}
</style>
