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
          <el-select v-model="filterForm.workshopId" placeholder="请选择车间" clearable @change="handleWorkshopChange" style="width: 200px">
            <el-option v-for="ws in workshopOptions" :key="ws.id" :label="ws.name" :value="ws.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="设备产线">
          <el-select v-model="filterForm.lineId" placeholder="请选择产线" clearable :disabled="!filterForm.workshopId" @change="handleSearch" style="width: 200px">
            <el-option v-for="line in lineOptions" :key="line.id" :label="line.name" :value="line.id" />
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
      <el-table-column prop="id" label="流程ID" width="120" />
      <el-table-column prop="processName" label="流程名称" width="180" />
      <el-table-column prop="taskType" label="任务类型" width="120">
        <template #default="{row}">
          <el-tag :type="getTaskTypeTag(row.taskType)">{{ getTaskTypeLabel(row.taskType) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="适用设备" min-width="200">
        <template #default="{row}">
          <div v-if="row.scope === 0">所有设备</div>
          <div v-else-if="row.scope === 1">{{ row.workshop?.name }}车间</div>
          <div v-else-if="row.scope === 2">{{ row.workshop?.name }}车间-{{ row.line?.name }}产线</div>
          <div v-else-if="row.scope === 3">{{ row.workshop?.name }}车间-{{ row.line?.name }}产线-{{ row.segment?.name }}</div>
          <div v-else-if="row.scope === 4">设备: {{ row.deviceName }} ({{ row.deviceCode }})</div>
        </template>
      </el-table-column>
      <el-table-column label="审批人" min-width="200">
        <template #default="{row}">
          <el-tag v-for="approver in row.approvers" :key="approver.id" style="margin-right: 5px;">
            {{ approver.realName || approver.userName }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="审批规则" width="120">
        <template #default="{row}">
          {{ row.approvalRule === 0 ? '并行审批' : '顺序审批' }}
        </template>
      </el-table-column>
      <el-table-column label="状态" width="80">
        <template #default="{row}">
          <el-tag :type="row.enabled ? 'success' : 'danger'">
            {{ row.enabled ? '启用' : '禁用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" width="180">
        <template #default="{row}">
          {{ formatTime(row.createtime) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="220" fixed="right">
        <template #default="{row}">
          <el-button size="small" @click="openDialog(row)" icon="edit">编辑</el-button>
          <el-button size="small" :type="row.enabled ? 'warning' : 'success'" @click="toggleStatus(row)" icon="check">
            {{ row.enabled ? '禁用' : '启用' }}
          </el-button>
          <el-popconfirm title="确定删除此流程吗？" @confirm="handleDelete(row.id)">
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
          v-model:current-page="pagination.pageNum"
          v-model:page-size="pagination.pageSize"
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
        <el-form-item label="流程名称" prop="processName">
          <el-input v-model="form.processName" placeholder="请输入流程名称" />
        </el-form-item>

        <el-form-item label="任务类型" prop="taskType">
          <el-select v-model="form.taskType" placeholder="请选择任务类型" @change="handleTaskTypeChange">
            <el-option v-for="type in taskTypeOptions" :key="type.value" :label="type.label" :value="type.value" />
          </el-select>
        </el-form-item>

        <el-form-item label="适用范围" prop="scope">
          <el-radio-group v-model="form.scope" @change="handleApplyTypeChange">
            <el-radio :label="0">所有设备</el-radio>
            <el-radio :label="1">按车间</el-radio>
            <el-radio :label="2">按产线</el-radio>
            <el-radio :label="3">按工段</el-radio>
            <el-radio :label="4">按具体设备</el-radio>
          </el-radio-group>
        </el-form-item>

        <!-- 根据适用范围显示不同的选择器 -->
        <el-form-item v-if="form.scope === 1" label="选择车间" prop="workshopId">
          <el-select v-model="form.workshopId" placeholder="请选择车间">
            <el-option v-for="ws in workshopOptions" :key="ws.id" :label="ws.name" :value="ws.id" />
          </el-select>
        </el-form-item>

        <el-form-item v-if="form.scope === 2" label="选择车间" prop="workshopId">
          <el-select v-model="form.workshopId" placeholder="请选择车间" @change="handleDialogWorkshopChange">
            <el-option v-for="ws in workshopOptions" :key="ws.id" :label="ws.name" :value="ws.id" />
          </el-select>
        </el-form-item>

        <el-form-item v-if="form.scope === 2" label="选择产线" prop="lineId">
          <el-select v-model="form.lineId" placeholder="请选择产线">
            <el-option v-for="line in dialogLineOptions" :key="line.id" :label="line.name" :value="line.id" />
          </el-select>
        </el-form-item>

        <el-form-item v-if="form.scope === 3" label="选择车间" prop="workshopId">
          <el-select v-model="form.workshopId" placeholder="请选择车间" @change="handleDialogWorkshopChange">
            <el-option v-for="ws in workshopOptions" :key="ws.id" :label="ws.name" :value="ws.id" />
          </el-select>
        </el-form-item>

        <el-form-item v-if="form.scope === 3" label="选择产线" prop="lineId">
          <el-select v-model="form.lineId" placeholder="请选择产线" @change="handleDialogLineChange">
            <el-option v-for="line in dialogLineOptions" :key="line.id" :label="line.name" :value="line.id" />
          </el-select>
        </el-form-item>

        <el-form-item v-if="form.scope === 3" label="选择工段" prop="segmentId">
          <el-select v-model="form.segmentId" placeholder="请选择工段">
            <el-option v-for="segment in segmentOptions" :key="segment.id" :label="segment.name" :value="segment.id" />
          </el-select>
        </el-form-item>

        <el-form-item v-if="form.scope === 4" label="选择设备" prop="deviceCode">
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
                :label="`${device.deviceName} (${device.deviceCode}) - ${device.workshopName || ''}${device.lineName ? `-${device.lineName}` : ''}${device.segmentName ? `-${device.segmentName}` : ''}`"
                :value="device.deviceCode"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="审批人" prop="approverIds">
          <el-select
              v-model="form.approverIds"
              multiple
              filterable
              placeholder="请选择审批人"
              style="width: 100%"
          >
            <el-option
                v-for="user in allUsers"
                :key="user.id"
                :label="user.realName || user.userName"
                :value="user.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="审批顺序" prop="approvalRule">
          <el-radio-group v-model="form.approvalRule">
            <el-radio :label="0">并行审批(任意一人通过即可)</el-radio>
            <el-radio :label="1">顺序审批(按顺序依次审批)</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="状态" prop="enabled">
          <el-switch v-model="form.enabled" active-text="启用" inactive-text="禁用" />
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

import {
  getAreaTree,
  getChildAreas
} from '@/api/equipment/EquipmentLedger'

// 保留其他需要的导入
import {
  getDevicesByPage,
  getApprovalProcesses,
  createApprovalProcess,
  updateApprovalProcess,
  deleteApprovalProcess,
  getAllUsers,
  getWorkshopList,
  getLineListByWorkshop,
  getSegmentListByLine,
  searchDevicesApi
} from '@/api/eqAPI'

// 用户数据
const allUsers = ref([])

// 任务类型选项
const taskTypeOptions = ref([
  {value: 0, label: '设备闲置'},
  {value: 1, label: '设备报废'},
  {value: 2, label: '设备转移'},
  {value: 3, label: '设备维修'},
  {value: 4, label: '设备采购'}
])

// 车间、产线、工段选项
const workshopOptions = ref([])
const lineOptions = ref([])
const segmentOptions = ref([])
const dialogLineOptions = ref([])

// 设备搜索相关
const deviceOptions = ref([])
const deviceSearchLoading = ref(false)

// 表格数据
const tableData = ref([])

// 筛选表单
const filterForm = reactive({
  taskType: '',
  workshopId: '',
  lineId: ''
})

// 分页
const pagination = reactive({
  pageNum: 1,
  pageSize: 10,
  total: 0
})

const loading = ref(false)

// 弹窗相关
const dialogVisible = ref(false)
const isEdit = ref(false)
const formRef = ref()
const form = reactive({
  id: '',
  processName: '',
  taskType: '',
  scope: 0,
  workshopId: '',
  lineId: '',
  segmentId: '',
  deviceCode: '',
  deviceName: '',
  approverIds: [],
  approvalRule: 0,
  enabled: true
})

// 表单验证规则
const rules = reactive({
  processName: [{required: true, message: '请输入流程名称', trigger: 'blur'}],
  taskType: [{required: true, message: '请选择任务类型', trigger: 'change'}],
  scope: [{required: true, message: '请选择适用范围', trigger: 'change'}],
  workshopId: [{required: true, message: '请选择车间', trigger: 'change'}],
  lineId: [{required: true, message: '请选择产线', trigger: 'change'}],
  segmentId: [{required: true, message: '请选择工段', trigger: 'change'}],
  deviceCode: [{required: true, message: '请选择设备', trigger: 'change'}],
  approverIds: [{required: true, message: '请选择至少一个审批人', trigger: 'change'}],
  approvalRule: [{required: true, message: '请选择审批规则', trigger: 'change'}]
})

// 初始化加载选项数据
onMounted(async () => {
  try {
    await loadWorkshopOptions()
    await loadAllUsers()
    loadTableData()
  } catch (error) {
    ElMessage.error('加载选项数据失败')
  }
})

// 加载车间选项
const loadWorkshopOptions = async () => {
  try {
    const response = await getAreaTree()
    workshopOptions.value = response.data.data.map(item => ({
      id: item.id,
      name: item.areaName
    }))
  } catch (error) {
    console.error('获取车间列表失败:', error)
    workshopOptions.value = [
      {id: 1, name: 'errorC1'},
      {id: 2, name: 'errorC2'},
      {id: 3, name: 'errorC3'},
      {id: 4, name: 'errorC4'},
      {id: 5, name: 'errorC5'}
    ]
  }
}

// 加载所有用户
const loadAllUsers = async () => {
  try {
    const response = await getAllUsers()
    allUsers.value = response.data
  } catch (error) {
    console.error('获取用户列表失败:', error)
    // 使用模拟数据作为备选
    allUsers.value = [
      {id: 1, userName: '张三', realName: '张三', role: 'manager'},
      {id: 2, userName: '李四', realName: '李四', role: 'engineer'},
      {id: 3, userName: '王五', realName: '王五', role: 'supervisor'},
      {id: 4, userName: '赵六', realName: '赵六', role: 'technician'},
      {id: 5, userName: '钱七', realName: '钱七', role: 'quality'},
      {id: 6, userName: '孙八', realName: '孙八', role: 'maintenance'}
    ]
  }
}

// 加载表格数据
const loadTableData = async () => {
  loading.value = true
  try {
    const params = {
      pageNum: pagination.pageNum,
      pageSize: pagination.pageSize,
      taskType: filterForm.taskType,
      workshopId: filterForm.workshopId,
      lineId: filterForm.lineId
    }

    const response = await getApprovalProcesses(params)
    tableData.value = response.data.data.records
    pagination.total = response.data.data.total
  } catch (error) {
    console.error('获取审批流程列表失败:', error)
    ElMessage.error('获取审批流程列表失败')
  } finally {
    loading.value = false
  }
}

// 车间变化处理
const handleWorkshopChange = async () => {
  filterForm.lineId = ''
  if (filterForm.workshopId) {
    try {
      const response = await getChildAreas(filterForm.workshopId)
      lineOptions.value = response.data.data.map(item => ({
        id: item.id,
        name: item.areaName
      }))
    } catch (error) {
      console.error('加载产线数据失败:', error)
      ElMessage.error('加载产线数据失败')
    }
  } else {
    lineOptions.value = []
  }
}

// 弹窗内车间变化处理
const handleDialogWorkshopChange = async () => {
  if (form.workshopId) {
    try {
      const response = await getChildAreas(form.workshopId)
      dialogLineOptions.value = response.data.data.map(item => ({
        id: item.id,
        name: item.areaName
      }))
    } catch (error) {
      console.error('加载产线数据失败:', error)
      ElMessage.error('加载产线数据失败')
    }
  } else {
    dialogLineOptions.value = []
    form.lineId = ''
    form.segmentId = ''
  }
}

// 弹窗内产线变化处理
const handleDialogLineChange = async () => {
  if (form.lineId) {
    try {
      const response = await getChildAreas(form.lineId)
      segmentOptions.value = response.data.data.map(item => ({
        id: item.id,
        name: item.areaName
      }))
      console.log(segmentOptions.value)
    } catch (error) {
      console.error('加载工段数据失败:', error)
      ElMessage.error('加载工段数据失败')
    }
  } else {
    segmentOptions.value = []
    form.segmentId = ''
  }
}

// 任务类型变化处理
const handleTaskTypeChange = (type) => {
  // 可以根据不同的任务类型设置默认审批人
  if (type === 1) {
    // 报废流程默认添加质量管理人员
    form.approverIds = allUsers.value.filter(u => u.role === 'quality').map(u => u.id)
  } else if (type === 3) {
    // 维修流程默认添加维修人员
    form.approverIds = allUsers.value.filter(u => u.role === 'maintenance').map(u => u.id)
  }
}

// 适用范围变化处理
const handleApplyTypeChange = (type) => {
  // 重置相关字段
  form.workshopId = ''
  form.lineId = ''
  form.segmentId = ''
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
    const response = await searchDevicesApi({ keyword: query })
    deviceOptions.value = response.data
  } catch (error) {
    console.error('搜索设备失败:', error)
    ElMessage.error('搜索设备失败')
  } finally {
    deviceSearchLoading.value = false
  }
}

// 打开弹窗
const openDialog = async (row) => {
  if (row) {
    // 编辑模式
    isEdit.value = true
    Object.assign(form, {
      id: row.id,
      processName: row.processName,
      taskType: row.taskType,
      scope: row.scope,
      workshopId: row.workshop?.id || '',
      lineId: row.line?.id || '',
      segmentId: row.segment?.id || '',
      deviceCode: row.deviceCode || '',
      deviceName: row.deviceName || '',
      approverIds: row.approvers.map(a => a.id),
      approvalRule: row.approvalRule,
      enabled: row.enabled
    })

    // 加载相关选项
    if (row.workshop?.id) {
      await handleDialogWorkshopChange()
    }
    if (row.line?.id) {
      await handleDialogLineChange()
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

    try {
      // 准备提交数据
      const submitData = {
        processName: form.processName,
        taskType: form.taskType,
        scope: form.scope,
        workshopId: form.scope === 1 || form.scope === 2 || form.scope === 3 ? form.workshopId : null,
        lineId: form.scope === 2 || form.scope === 3 ? form.lineId : null,
        segmentId: form.scope === 3 ? form.segmentId : null,
        deviceCode: form.scope === 4 ? form.deviceCode : null,
        approverIds: form.approverIds,
        approvalRule: form.approvalRule,
        enabled: form.enabled
      }

      if (isEdit.value) {
        // 更新
        await updateApprovalProcess(form.id, submitData)
        ElMessage.success('更新成功')
      } else {
        // 新增
        const a = await createApprovalProcess(submitData)
        console.log(a.data)
        if(a.data.code === 'Error'){
          ElMessage.error(a.data.msg)
        }else{
          ElMessage.success(a.data.msg)
        }
      }

      dialogVisible.value = false
      loadTableData()
    } catch (error) {
      console.error('保存失败:', error)
      ElMessage.error(isEdit.value ? '更新失败' : '新增失败')
    }
  })
}

// 删除流程
const handleDelete = async (id) => {
  try {
    await deleteApprovalProcess(id)
    ElMessage.success('删除成功')
    loadTableData()
  } catch (error) {
    console.error('删除失败:', error)
    ElMessage.error('删除失败')
  }
}

// 启用/禁用流程
const toggleStatus = async (row) => {
  try {
    await updateApprovalProcess(row.id, { enabled: !row.enabled })
    ElMessage.success(row.enabled ? '已禁用' : '已启用')
    loadTableData()
  } catch (error) {
    console.error('状态切换失败:', error)
    ElMessage.error('状态切换失败')
  }
}

// 重置表单
const resetForm = () => {
  formRef.value?.resetFields()
  Object.assign(form, {
    id: '',
    processName: '',
    taskType: '',
    scope: 0,
    workshopId: '',
    lineId: '',
    segmentId: '',
    deviceCode: '',
    deviceName: '',
    approverIds: [],
    approvalRule: 0,
    enabled: true
  })
}

// 搜索
const handleSearch = () => {
  pagination.pageNum = 1
  loadTableData()
}

// 重置筛选
const resetFilter = () => {
  filterForm.taskType = ''
  filterForm.workshopId = ''
  filterForm.lineId = ''
  lineOptions.value = []
  handleSearch()
}

// 分页变化
const handleSizeChange = (size) => {
  pagination.pageSize = size
  pagination.pageNum = 1
  loadTableData()
}

const handleCurrentChange = (page) => {
  pagination.pageNum = page
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
    case 0:
      return 'warning'
    case 1:
      return 'danger'
    case 2:
      return 'primary'
    case 3:
      return 'info'
    case 4:
      return 'success'
    default:
      return ''
  }
}

// 获取任务类型标签文本
const getTaskTypeLabel = (type) => {
  const typeObj = taskTypeOptions.value.find(t => t.value === type)
  return typeObj ? typeObj.label : '未知'
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
