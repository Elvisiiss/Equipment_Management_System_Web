<template>
  <div class="pm-container">
    <h1>设备保养计划管理系统</h1>

    <el-tabs v-model="activeTab" type="card">
      <el-tab-pane label="PM计划设置" name="planSetting">
        <el-table :data="pmPlans" border style="width: 100%">
          <el-table-column prop="deviceName" label="设备名称" width="180" />
          <el-table-column prop="deviceType" label="设备类型" width="120" />
          <el-table-column label="保养周期">
            <template #default="{row}">
              <el-select v-model="row.frequency" placeholder="请选择">
                <el-option
                    v-for="item in frequencyOptions"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                />
              </el-select>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="120">
            <template #default="{row}">
              <el-button size="small" @click="savePlan(row)">保存</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>

      <el-tab-pane label="保养周期设置" name="cycleSetting">
        <el-form :model="cycleRule" label-width="180px">
          <el-form-item label="允许提前保养天数">
            <el-input-number v-model="cycleRule.allowBeforeDays" :min="1" :max="30" />
          </el-form-item>
          <el-form-item label="允许延后保养天数">
            <el-input-number v-model="cycleRule.allowAfterDays" :min="1" :max="30" />
          </el-form-item>
          <el-form-item label="提醒提前天数">
            <el-input-number v-model="cycleRule.remindBeforeDays" :min="1" :max="30" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="saveCycleRule">保存设置</el-button>
          </el-form-item>
        </el-form>
      </el-tab-pane>

      <el-tab-pane label="PM人员设置" name="staffSetting">
        <div class="staff-setting-container">
          <el-transfer
              v-model="selectedStaff"
              :data="allStaff"
              :titles="['所有人员', '保养人员']"
          />
          <div class="button-group">
            <el-button type="primary" @click="saveStaff">保存设置</el-button>
          </div>
        </div>
      </el-tab-pane>

      <el-tab-pane label="保养查看" name="pmView">
        <div class="filter-container">
          <el-date-picker
              v-model="queryDateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
          />
          <el-select v-model="queryDeviceType" placeholder="设备类型" clearable>
            <el-option
                v-for="item in deviceTypeOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
            />
          </el-select>
          <el-button type="primary" @click="queryPmRecords">查询</el-button>
        </div>

        <el-table :data="pmRecords" border style="width: 100%">
          <el-table-column prop="deviceName" label="设备名称" width="150" />
          <el-table-column prop="deviceType" label="设备类型" width="120" />
          <el-table-column prop="pmType" label="保养类型" width="120" />
          <el-table-column prop="planDate" label="计划日期" width="120" />
          <el-table-column prop="actualDate" label="实际日期" width="120" />
          <el-table-column prop="staffName" label="保养人员" width="120" />
          <el-table-column prop="status" label="状态" width="100">
            <template #default="{row}">
              <el-tag :type="statusTagType(row.status)">
                {{ row.status }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="180">
            <template #default="{row}">
              <el-button size="small" @click="showDetail(row)">详情</el-button>
              <el-button size="small" type="primary" v-if="row.status === '待保养'" @click="completePm(row)">
                完成
              </el-button>
            </template>
          </el-table-column>
        </el-table>

        <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :total="totalRecords"
            layout="total, prev, pager, next, jumper"
            @current-change="handlePageChange"
        />
      </el-tab-pane>
    </el-tabs>

    <!-- 保养记录详情对话框 -->
    <el-dialog v-model="detailDialogVisible" title="保养记录详情" width="50%">
      <div v-if="currentRecord">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="设备名称">{{ currentRecord.deviceName }}</el-descriptions-item>
          <el-descriptions-item label="设备类型">{{ currentRecord.deviceType }}</el-descriptions-item>
          <el-descriptions-item label="保养类型">{{ currentRecord.pmType }}</el-descriptions-item>
          <el-descriptions-item label="计划日期">{{ currentRecord.planDate }}</el-descriptions-item>
          <el-descriptions-item label="实际日期">{{ currentRecord.actualDate || '未完成' }}</el-descriptions-item>
          <el-descriptions-item label="保养人员">{{ currentRecord.staffName }}</el-descriptions-item>
          <el-descriptions-item label="状态">{{ currentRecord.status }}</el-descriptions-item>
          <el-descriptions-item label="备注" :span="2">{{ currentRecord.remark || '无' }}</el-descriptions-item>
        </el-descriptions>
      </div>
      <template #footer>
        <el-button @click="detailDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'

// 当前激活的标签页
const activeTab = ref('planSetting')

// PM计划设置相关数据
const frequencyOptions = [
  { value: 'weekly', label: '每周' },
  { value: 'monthly', label: '月度' },
  { value: 'quarterly', label: '季度' },
  { value: 'half-yearly', label: '半年' },
  { value: 'yearly', label: '年度' }
]

const pmPlans = ref([
  { id: 1, deviceName: 'CNC机床001', deviceType: 'CNC机床', frequency: 'weekly' },
  { id: 2, deviceName: '注塑机002', deviceType: '注塑机', frequency: 'monthly' },
  { id: 3, deviceName: '激光切割机003', deviceType: '激光设备', frequency: 'quarterly' },
  { id: 4, deviceName: '包装机004', deviceType: '包装设备', frequency: 'half-yearly' },
  { id: 5, deviceName: '空压机005', deviceType: '动力设备', frequency: 'yearly' }
])

// 保养周期设置相关数据
const cycleRule = ref({
  allowBeforeDays: 3,
  allowAfterDays: 2,
  remindBeforeDays: 5
})

// PM人员设置相关数据
const allStaff = ref([])
const selectedStaff = ref([])

// 保养查看相关数据
const deviceTypeOptions = [
  { value: 'CNC机床', label: 'CNC机床' },
  { value: '注塑机', label: '注塑机' },
  { value: '激光设备', label: '激光设备' },
  { value: '包装设备', label: '包装设备' },
  { value: '动力设备', label: '动力设备' }
]

const queryDateRange = ref([])
const queryDeviceType = ref('')
const pmRecords = ref([])
const currentPage = ref(1)
const pageSize = ref(10)
const totalRecords = ref(0)
const currentRecord = ref(null)
const detailDialogVisible = ref(false)

// 计算属性：根据状态返回不同的标签类型
const statusTagType = computed(() => (status) => {
  switch (status) {
    case '已完成': return 'success'
    case '待保养': return 'warning'
    case '已超期': return 'danger'
    default: return 'info'
  }
})

// 初始化数据
onMounted(() => {
  // 初始化人员数据
  for (let i = 1; i <= 15; i++) {
    allStaff.value.push({
      key: i,
      label: `员工${i}`,
      disabled: i % 4 === 0
    })

    if (i % 3 === 0) {
      selectedStaff.value.push(i)
    }
  }

  // 初始化保养记录数据
  generateMockRecords()
})

// 生成模拟保养记录数据
const generateMockRecords = () => {
  const records = []
  const statuses = ['已完成', '待保养', '已超期']
  const pmTypes = ['日常保养', '月度保养', '季度保养', '年度保养']
  const today = new Date()

  for (let i = 1; i <= 50; i++) {
    const deviceIndex = i % 5 + 1
    const daysOffset = Math.floor(Math.random() * 60) - 30
    const planDate = new Date(today)
    planDate.setDate(today.getDate() + daysOffset)

    records.push({
      id: i,
      deviceName: `设备${String(deviceIndex).padStart(3, '0')}`,
      deviceType: deviceTypeOptions[(deviceIndex - 1) % deviceTypeOptions.length].label,
      pmType: pmTypes[Math.floor(Math.random() * pmTypes.length)],
      planDate: formatDate(planDate),
      actualDate: Math.random() > 0.3 ? formatDate(new Date(planDate.getTime() + Math.floor(Math.random() * 5 - 2) * 24 * 3600 * 1000)) : null,
      staffName: `员工${Math.floor(Math.random() * 15) + 1}`,
      status: statuses[Math.floor(Math.random() * statuses.length)],
      remark: Math.random() > 0.7 ? '保养备注说明文本' + i : ''
    })
  }

  pmRecords.value = records.slice(0, 10)
  totalRecords.value = 50
}

// 格式化日期
const formatDate = (date) => {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

// 保存PM计划
const savePlan = (row) => {
  ElMessage.success(`设备 ${row.deviceName} 的保养计划已保存: ${row.frequency}`)
}

// 保存周期规则
const saveCycleRule = () => {
  ElMessage.success('保养周期规则已保存')
}

// 保存人员设置
const saveStaff = () => {
  ElMessage.success('保养人员设置已保存')
}

// 查询保养记录
const queryPmRecords = () => {
  ElMessage.success('查询条件已应用')
  // 实际应用中这里应该发送请求到后端
}

// 分页变化
const handlePageChange = (page) => {
  currentPage.value = page
  // 实际应用中这里应该发送请求到后端
}

// 显示详情
const showDetail = (record) => {
  currentRecord.value = record
  detailDialogVisible.value = true
}

// 完成保养
const completePm = (record) => {
  record.status = '已完成'
  record.actualDate = formatDate(new Date())
  ElMessage.success('保养已完成')
}
</script>

<style scoped>
.pm-container {
  padding: 20px;
}

.staff-setting-container {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.button-group {
  margin-top: 20px;
}

.filter-container {
  margin-bottom: 20px;
  display: flex;
  gap: 10px;
}
</style>
