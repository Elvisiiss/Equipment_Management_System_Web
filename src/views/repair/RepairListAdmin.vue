<template>
  <div class="repair-list-container">
    <div class="page-header">
      <h2>待维修设备管理</h2>
      <el-button type="primary" @click="refreshList">
        <el-icon><Refresh /></el-icon> 刷新
      </el-button>
    </div>

    <el-table :data="repairList" v-loading="loading" border stripe height="calc(100vh - 200px)">
      <el-table-column prop="equipmentName" label="设备名称" width="180" />
      <el-table-column prop="equipmentNumber" label="设备编号" width="150" />
      <el-table-column prop="faultType" label="故障类型" width="120">
        <template #default="{ row }">
          <el-tag :type="getFaultTypeTag(row.faultType)">
            {{ getFaultTypeLabel(row.faultType) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="faultDescription" label="故障描述" min-width="200" />
      <el-table-column prop="reporter" label="报修人" width="120" />
      <el-table-column prop="reportTime" label="报修时间" width="180" />
      <el-table-column label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="row.status === 'pending' ? 'warning' : 'success'">
            {{ row.status === 'pending' ? '待处理' : '已派单' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200" fixed="right">
        <template #default="{ row }">
          <el-button
              type="primary"
              size="small"
              @click="viewRepairDetail(row)"
              v-if="row.status === 'pending'"
          >
            查看详情
          </el-button>
          <el-button
              type="success"
              size="small"
              @click="assignRepairTask(row)"
              v-if="row.status === 'pending'"
          >
            派单
          </el-button>
          <el-button
              type="info"
              size="small"
              @click="viewRepairDetail(row)"
              v-if="row.status !== 'pending'"
          >
            已派单
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 派单对话框 -->
    <el-dialog v-model="assignDialogVisible" title="维修任务派单" width="500px">
      <el-form :model="assignForm" label-width="100px">
        <el-form-item label="设备名称">
          <el-input v-model="assignForm.equipmentName" disabled />
        </el-form-item>
        <el-form-item label="故障类型">
          <el-input v-model="assignForm.faultTypeLabel" disabled />
        </el-form-item>
        <el-form-item label="维修师傅" prop="workerId" required>
          <el-select v-model="assignForm.workerId" placeholder="请选择维修师傅" style="width: 100%">
            <el-option
                v-for="worker in workers"
                :key="worker.id"
                :label="worker.name"
                :value="worker.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="要求完成">
          <el-date-picker
              v-model="assignForm.deadline"
              type="datetime"
              placeholder="选择日期时间"
              style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="派单备注">
          <el-input v-model="assignForm.remark" type="textarea" :rows="3" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="assignDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmAssign">确认派单</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import repairAPI from '@/api/repair'

const loading = ref(false)
const repairList = ref([])
const assignDialogVisible = ref(false)
const currentRepairId = ref(null)

// 维修师傅列表
const workers = ref([
  { id: 1, name: '张师傅', phone: '13800138001' },
  { id: 2, name: '李师傅', phone: '13800138002' },
  { id: 3, name: '王师傅', phone: '13800138003' }
])

// 派单表单
const assignForm = reactive({
  equipmentName: '',
  faultTypeLabel: '',
  workerId: '',
  deadline: '',
  remark: ''
})

// 故障类型标签
const getFaultTypeTag = (type) => {
  const types = {
    mechanical: '',
    electrical: 'warning',
    control: 'danger',
    software: 'info',
    other: 'success'
  }
  return types[type] || ''
}

// 故障类型文本
const getFaultTypeLabel = (type) => {
  const labels = {
    mechanical: '机械故障',
    electrical: '电气故障',
    control: '控制系统故障',
    software: '软件故障',
    other: '其他故障'
  }
  return labels[type] || '未知故障'
}

// 加载待维修列表
const loadRepairList = async () => {
  loading.value = true
  try {
    const res = await repairAPI.getPendingRepairs()
    repairList.value = res.data
  } catch (error) {
    ElMessage.error('加载数据失败: ' + error.message)
  } finally {
    loading.value = false
  }
}

// 刷新列表
const refreshList = () => {
  loadRepairList()
}

// 查看维修详情
const viewRepairDetail = (row) => {
  // 实际项目中应跳转到详情页
  ElMessage.info(`查看维修详情: ${row.id}`)
}

// 派单操作
const assignRepairTask = (row) => {
  currentRepairId.value = row.id
  assignForm.equipmentName = row.equipmentName
  assignForm.faultTypeLabel = getFaultTypeLabel(row.faultType)
  assignForm.workerId = ''
  assignForm.deadline = ''
  assignForm.remark = ''
  assignDialogVisible.value = true
}

// 确认派单
const confirmAssign = async () => {
  if (!assignForm.workerId) {
    ElMessage.warning('请选择维修师傅')
    return
  }

  try {
    await repairAPI.assignRepairTask(currentRepairId.value, {
      workerId: assignForm.workerId,
      deadline: assignForm.deadline,
      remark: assignForm.remark
    })

    ElMessage.success('派单成功')
    assignDialogVisible.value = false
    loadRepairList()
  } catch (error) {
    ElMessage.error('派单失败: ' + error.message)
  }
}

onMounted(() => {
  loadRepairList()
})
</script>

<style scoped>
.repair-list-container {
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
</style>
