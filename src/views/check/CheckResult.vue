<template>
  <div class="approval-config-container">
    <div class="header">
      <h2>设备审批流程管理</h2>
      <el-button type="primary" @click="openDialog()" icon="plus">新增审批流程</el-button>
    </div>

    <!-- 筛选条件 -->
    <div class="filter-container">
      <el-form :inline="true" :model="filterForm" class="filter-form">
        <el-form-item label="任务类型">
          <el-select v-model="filterForm.taskType" placeholder="请选择任务类型" clearable @change="handleSearch" style="width: 200px">
            <el-option v-for="type in taskTypeOptions" :key="type.value" :label="type.label" :value="type.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="设备车间">
          <el-select v-model="filterForm.workshop" placeholder="请选择车间" clearable @change="handleWorkshopChange" style="width: 200px">
            <el-option v-for="ws in workshopOptions" :key="ws" :label="`${ws}车间`" :value="ws" />
          </el-select>
        </el-form-item>
        <el-form-item label="设备产线">
          <el-select v-model="filterForm.line" placeholder="请选择产线" clearable :disabled="!filterForm.workshop" @change="handleSearch" style="width: 200px">
            <el-option v-for="line in lineOptions" :key="line" :label="`${line}产线`" :value="line" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="resetFilter">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 流程列表 -->
    <el-table :data="tableData" style="width: 100%" v-loading="loading">
      <el-table-column prop="taskId" label="流程ID" width="120" />
      <el-table-column prop="taskName" label="流程名称" width="180" />
      <el-table-column prop="taskType" label="任务类型" width="120">
        <template #default="{row}">
          <el-tag :type="getTaskTypeTag(row.taskType)">{{ row.taskType }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="适用设备" min-width="200">
        <template #default="{row}">
          <div v-if="row.applyType === 'all'">所有设备</div>
          <div v-else-if="row.applyType === 'workshop'">{{ row.workshop }}车间</div>
          <div v-else-if="row.applyType === 'line'">{{ row.workshop }}车间-{{ row.line }}产线</div>
          <div v-else-if="row.applyType === 'segment'">{{ row.workshop }}车间-{{ row.line }}产线-{{ row.segment }}</div>
          <div v-else-if="row.applyType === 'device'">设备: {{ row.deviceName }} ({{ row.deviceCode }})</div>
        </template>
      </el-table-column>
      <el-table-column label="审批人" min-width="200">
        <template #default="{row}">
          <el-tag v-for="approver in row.approvers" :key="approver.userId" style="margin-right: 5px;">
            {{ approver.userName }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" width="180">
        <template #default="{row}">
          {{ formatTime(row.createTime) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="180" fixed="right">
        <template #default="{row}">
          <el-button size="small" @click="openDialog(row)" icon="edit">编辑</el-button>
          <el-popconfirm title="确定删除此流程吗？" @confirm="handleDelete(row.taskId)">
            <template #reference>
              <el-button size="small" type="danger" icon="delete">删除</el-button>
            </template>
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div class="pagination">
      <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.size"
          :total="pagination.total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
      />
    </div>

    <!-- 新增/编辑弹窗 -->
    <el-dialog
        v-model="dialogVisible"
        :title="isEdit ? '编辑审批流程' : '新增审批流程'"
        width="700px"
        @close="resetForm"
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="120px">
        <el-form-item label="流程名称" prop="taskName">
          <el-input v-model="form.taskName" placeholder="请输入流程名称" />
        </el-form-item>

        <el-form-item label="任务类型" prop="taskType">
          <el-select v-model="form.taskType" placeholder="请选择任务类型" @change="handleTaskTypeChange">
            <el-option v-for="type in taskTypeOptions" :key="type.value" :label="type.label" :value="type.value" />
          </el-select>
        </el-form-item>

        <el-form-item label="适用范围" prop="applyType">
          <el-radio-group v-model="form.applyType" @change="handleApplyTypeChange">
            <el-radio label="all">所有设备</el-radio>
            <el-radio label="workshop">按车间</el-radio>
            <el-radio label="line">按产线</el-radio>
            <el-radio label="segment">按工段</el-radio>
            <el-radio label="device">按具体设备</el-radio>
          </el-radio-group>
        </el-form-item>

        <!-- 根据适用范围显示不同的选择器 -->
        <el-form-item v-if="form.applyType === 'workshop'" label="选择车间" prop="workshop">
          <el-select v-model="form.workshop" placeholder="请选择车间">
            <el-option v-for="ws in workshopOptions" :key="ws" :label="`${ws}车间`" :value="ws" />
          </el-select>
        </el-form-item>

        <el-form-item v-if="form.applyType === 'line'" label="选择车间" prop="workshop">
          <el-select v-model="form.workshop" placeholder="请选择车间" @change="handleDialogWorkshopChange">
            <el-option v-for="ws in workshopOptions" :key="ws" :label="`${ws}车间`" :value="ws" />
          </el-select>
        </el-form-item>

        <el-form-item v-if="form.applyType === 'line'" label="选择产线" prop="line">
          <el-select v-model="form.line" placeholder="请选择产线">
            <el-option v-for="line in dialogLineOptions" :key="line" :label="`${line}产线`" :value="line" />
          </el-select>
        </el-form-item>

        <el-form-item v-if="form.applyType === 'segment'" label="选择车间" prop="workshop">
          <el-select v-model="form.workshop" placeholder="请选择车间" @change="handleDialogWorkshopChange">
            <el-option v-for="ws in workshopOptions" :key="ws" :label="`${ws}车间`" :value="ws" />
          </el-select>
        </el-form-item>

        <el-form-item v-if="form.applyType === 'segment'" label="选择产线" prop="line">
          <el-select v-model="form.line" placeholder="请选择产线" @change="handleDialogLineChange">
            <el-option v-for="line in dialogLineOptions" :key="line" :label="`${line}产线`" :value="line" />
          </el-select>
        </el-form-item>

        <el-form-item v-if="form.applyType === 'segment'" label="选择工段" prop="segment">
          <el-select v-model="form.segment" placeholder="请选择工段">
            <el-option v-for="segment in segmentOptions" :key="segment" :label="segment" :value="segment" />
          </el-select>
        </el-form-item>

        <el-form-item v-if="form.applyType === 'device'" label="选择设备" prop="deviceCode">
          <el-select
              v-model="form.deviceCode"
              placeholder="请选择设备"
              filterable
              remote
              :remote-method="searchDevices"
              :loading="deviceSearchLoading"
          >
            <el-option
                v-for="device in deviceOptions"
                :key="device.deviceCode"
                :label="`${device.name} (${device.deviceCode}) - ${device.workshop}车间${device.line ? `-${device.line}产线` : ''}${device.segment ? `-${device.segment}` : ''}`"
                :value="device.deviceCode"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="审批人" prop="approvers">
          <el-select
              v-model="form.approvers"
              multiple
              filterable
              placeholder="请选择审批人"
              style="width: 100%"
          >
            <el-option
                v-for="user in allUsers"
                :key="user.userId"
                :label="user.userName"
                :value="user.userId"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="审批顺序">
          <el-radio-group v-model="form.approveOrder">
            <el-radio label="parallel">并行审批(任意一人通过即可)</el-radio>
            <el-radio label="sequential">顺序审批(按顺序依次审批)</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import {ref, reactive, onMounted} from 'vue'
import {ElMessage} from 'element-plus'
import {getWorkshopOptions, getLineOptionsByWorkshop, getSegmentOptions, getDevicesByPage} from '@/api/eqAPI'

// 用户数据
const allUsers = ref([
  {userId: 1, userName: '张三', role: 'manager'},
  {userId: 2, userName: '李四', role: 'engineer'},
  {userId: 3, userName: '王五', role: 'supervisor'},
  {userId: 4, userName: '赵六', role: 'technician'},
  {userId: 5, userName: '钱七', role: 'quality'},
  {userId: 6, userName: '孙八', role: 'maintenance'}
])

// 任务类型选项
const taskTypeOptions = ref([
  {value: 'idle', label: '设备闲置'},
  {value: 'scrap', label: '设备报废'},
  {value: 'transfer', label: '设备转移'},
  {value: 'maintenance', label: '设备维修'},
  {value: 'purchase', label: '设备采购'},
  {value: 'acceptance', label: '设备验收'}
])

// 车间、产线、工段选项
const workshopOptions = ref([])
const lineOptions = ref([])
const segmentOptions = ref([])
const dialogLineOptions = ref([])
const dialogSegmentOptions = ref([])

// 设备搜索相关
const deviceOptions = ref([])
const deviceSearchLoading = ref(false)

// 表格数据
const tableData = ref([
  {
    taskId: 'T20230001',
    taskName: 'C2车间设备报废流程',
    taskType: 'scrap',
    applyType: 'workshop',
    workshop: 'C2',
    approvers: [1, 3],
    approveOrder: 'parallel',
    createTime: '2023-06-15T09:30:00'
  },
  {
    taskId: 'T20230002',
    taskName: '31产线设备转移流程',
    taskType: 'transfer',
    applyType: 'line',
    workshop: 'C2',
    line: '31',
    approvers: [2, 4],
    approveOrder: 'sequential',
    createTime: '2023-06-18T14:20:00'
  },
  {
    taskId: 'T20230003',
    taskName: 'CFOG段设备维修流程',
    taskType: 'maintenance',
    applyType: 'segment',
    workshop: 'C2',
    line: '31',
    segment: 'CFOG段',
    approvers: [5, 6],
    approveOrder: 'parallel',
    createTime: '2023-06-20T11:15:00'
  }
])

// 筛选表单
const filterForm = reactive({
  taskType: '',
  workshop: '',
  line: ''
})

// 分页
const pagination = reactive({
  page: 1,
  size: 10,
  total: 0
})

const loading = ref(false)

// 弹窗相关
const dialogVisible = ref(false)
const isEdit = ref(false)
const formRef = ref()
const form = reactive({
  taskId: '',
  taskName: '',
  taskType: '',
  applyType: 'all',
  workshop: '',
  line: '',
  segment: '',
  deviceCode: '',
  deviceName: '',
  approvers: [],
  approveOrder: 'parallel'
})

// 表单验证规则
const rules = reactive({
  taskName: [{required: true, message: '请输入流程名称', trigger: 'blur'}],
  taskType: [{required: true, message: '请选择任务类型', trigger: 'change'}],
  applyType: [{required: true, message: '请选择适用范围', trigger: 'change'}],
  workshop: [{required: true, message: '请选择车间', trigger: 'change'}],
  line: [{required: true, message: '请选择产线', trigger: 'change'}],
  segment: [{required: true, message: '请选择工段', trigger: 'change'}],
  deviceCode: [{required: true, message: '请选择设备', trigger: 'change'}],
  approvers: [{required: true, message: '请选择至少一个审批人', trigger: 'change'}]
})

// 初始化加载选项数据
onMounted(async () => {
  try {
    workshopOptions.value = await getWorkshopOptions()
    segmentOptions.value = await getSegmentOptions()
    // 模拟加载表格数据
    loadTableData()
  } catch (error) {
    ElMessage.error('加载选项数据失败')
  }
})

// 加载表格数据
const loadTableData = () => {
  loading.value = true
  // 模拟API请求
  setTimeout(() => {
    // 实际项目中这里应该是API调用
    const filteredData = tableData.value.filter(item => {
      return (
          (!filterForm.taskType || item.taskType === filterForm.taskType) &&
          (!filterForm.workshop || item.workshop === filterForm.workshop) &&
          (!filterForm.line || item.line === filterForm.line)
      )
    })

    const start = (pagination.page - 1) * pagination.size
    const end = start + pagination.size
    tableData.value = filteredData.slice(start, end)
    pagination.total = filteredData.length
    loading.value = false
  }, 500)
}

// 车间变化处理
const handleWorkshopChange = async () => {
  filterForm.line = ''
  if (filterForm.workshop) {
    try {
      lineOptions.value = await getLineOptionsByWorkshop(filterForm.workshop)
    } catch (error) {
      ElMessage.error('加载产线数据失败')
    }
  } else {
    lineOptions.value = []
  }
}

// 弹窗内车间变化处理
const handleDialogWorkshopChange = async () => {
  if (form.workshop) {
    try {
      dialogLineOptions.value = await getLineOptionsByWorkshop(form.workshop)
    } catch (error) {
      ElMessage.error('加载产线数据失败')
    }
  } else {
    dialogLineOptions.value = []
    form.line = ''
    form.segment = ''
  }
}

// 弹窗内产线变化处理
const handleDialogLineChange = () => {
  // 这里可以加载工段下的设备等
  form.segment = ''
}

// 任务类型变化处理
const handleTaskTypeChange = (type) => {
  // 可以根据不同的任务类型设置默认审批人
  if (type === 'scrap') {
    // 报废流程默认添加质量管理人员
    form.approvers = allUsers.value.filter(u => u.role === 'quality').map(u => u.userId)
  } else if (type === 'maintenance') {
    // 维修流程默认添加维修人员
    form.approvers = allUsers.value.filter(u => u.role === 'maintenance').map(u => u.userId)
  }
}

// 适用范围变化处理
const handleApplyTypeChange = (type) => {
  // 重置相关字段
  form.workshop = ''
  form.line = ''
  form.segment = ''
  form.deviceCode = ''
  form.deviceName = ''
}

// 搜索设备
const searchDevices = async (query) => {
  if (!query) {
    deviceOptions.value = []
    return
  }

  deviceSearchLoading.value = true
  try {
    // 模拟设备搜索
    const result = await getDevicesByPage({
      page: 1,
      size: 10,
      filterForm: {
        deviceCode: query,
        name: query
      }
    })

    // 提取设备列表
    const extractDevices = (nodes) => {
      let devices = []
      nodes.forEach(node => {
        if (node.type === 'device') {
          devices.push(node)
        } else if (node.children && node.children.length > 0) {
          devices = devices.concat(extractDevices(node.children))
        }
      })
      return devices
    }

    deviceOptions.value = extractDevices(result.list)
  } catch (error) {
    ElMessage.error('搜索设备失败')
  } finally {
    deviceSearchLoading.value = false
  }
}

// 打开弹窗
const openDialog = (row) => {
  if (row) {
    // 编辑模式
    isEdit.value = true
    Object.assign(form, {
      taskId: row.taskId,
      taskName: row.taskName,
      taskType: row.taskType,
      applyType: row.applyType,
      workshop: row.workshop || '',
      line: row.line || '',
      segment: row.segment || '',
      deviceCode: row.deviceCode || '',
      deviceName: row.deviceName || '',
      approvers: row.approvers,
      approveOrder: row.approveOrder
    })

    // 加载相关选项
    if (row.workshop) {
      handleDialogWorkshopChange()
    }
  } else {
    // 新增模式
    isEdit.value = false
    resetForm()
  }
  dialogVisible.value = true
}

// 提交表单
const handleSubmit = () => {
  formRef.value.validate(async (valid) => {
    if (!valid) return

    // 如果是设备级别的流程，获取设备名称
    if (form.applyType === 'device' && form.deviceCode) {
      const device = deviceOptions.value.find(d => d.deviceCode === form.deviceCode)
      if (device) {
        form.deviceName = device.name
      }
    }

    // 模拟API请求
    try {
      if (isEdit.value) {
        // 更新
        const index = tableData.value.findIndex(item => item.taskId === form.taskId)
        if (index !== -1) {
          tableData.value.splice(index, 1, {...form})
        }
      } else {
        // 新增
        const newTask = {
          ...form,
          taskId: `T${new Date().getTime()}`,
          createTime: new Date().toISOString()
        }
        tableData.value.unshift(newTask)
      }

      ElMessage.success(isEdit.value ? '更新成功' : '新增成功')
      dialogVisible.value = false
      loadTableData()
    } catch (error) {
      ElMessage.error(isEdit.value ? '更新失败' : '新增失败')
    }
  })
}

// 删除流程
const handleDelete = (taskId) => {
  // 模拟API请求
  try {
    tableData.value = tableData.value.filter(item => item.taskId !== taskId)
    ElMessage.success('删除成功')
    loadTableData()
  } catch (error) {
    ElMessage.error('删除失败')
  }
}

// 重置表单
const resetForm = () => {
  formRef.value?.resetFields()
  Object.assign(form, {
    taskId: '',
    taskName: '',
    taskType: '',
    applyType: 'all',
    workshop: '',
    line: '',
    segment: '',
    deviceCode: '',
    deviceName: '',
    approvers: [],
    approveOrder: 'parallel'
  })
}

// 搜索
const handleSearch = () => {
  pagination.page = 1
  loadTableData()
}

// 重置筛选
const resetFilter = () => {
  filterForm.taskType = ''
  filterForm.workshop = ''
  filterForm.line = ''
  lineOptions.value = []
  handleSearch()
}

// 分页变化
const handleSizeChange = (size) => {
  pagination.size = size
  pagination.page = 1
  loadTableData()
}

const handleCurrentChange = (page) => {
  pagination.page = page
  loadTableData()
}

// 格式化时间
const formatTime = (timeStr) => {
  if (!timeStr) return ''
  const date = new Date(timeStr)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

// 获取任务类型标签样式
const getTaskTypeTag = (type) => {
  switch (type) {
    case 'idle':
      return 'warning'
    case 'scrap':
      return 'danger'
    case 'transfer':
      return 'primary'
    case 'maintenance':
      return 'info'
    case 'purchase':
      return 'success'
    case 'acceptance':
      return ''
    default:
      return ''
  }
}
</script>

<style scoped>
.approval-config-container {
  padding: 20px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.header h2 {
  font-size: 20px;
  font-weight: 600;
  color: #333;
}

.filter-container {
  margin-bottom: 20px;
  padding: 15px;
  background-color: #f8f9fc;
  border-radius: 4px;
}

.filter-form {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.el-tag {
  margin-right: 5px;
}

.el-table {
  margin-top: 20px;
}

.el-dialog .el-form-item {
  margin-bottom: 20px;
}

.el-radio-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
</style>
