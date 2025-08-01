<template>
  <div class="repair-list-worker">
    <div class="page-header">
      <h2>我的维修工单</h2>
      <el-button type="primary" @click="refreshList">
        <el-icon><Refresh /></el-icon> 刷新
      </el-button>
    </div>

    <el-tabs v-model="activeStatus" @tab-change="loadRepairList">
      <el-tab-pane label="待处理" name="assigned"></el-tab-pane>
      <el-tab-pane label="维修中" name="repairing"></el-tab-pane>
      <el-tab-pane label="已完成" name="completed"></el-tab-pane>
    </el-tabs>

    <el-table :data="repairList" v-loading="loading" border stripe height="calc(100vh - 220px)">
      <el-table-column prop="id" label="工单号" width="100" />
      <el-table-column prop="equipmentName" label="设备名称" width="180" />
      <el-table-column prop="equipmentNumber" label="设备编号" width="150" />
      <el-table-column prop="faultType" label="故障类型" width="120">
        <template #default="{ row }">
          <el-tag :type="getFaultTypeTag(row.faultType)">
            {{ getFaultTypeLabel(row.faultType) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="reportTime" label="报修时间" width="180" />
      <el-table-column prop="deadline" label="要求完成" width="180" />
      <el-table-column label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="getStatusTag(row.status)">
            {{ getStatusLabel(row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="180" fixed="right">
        <template #default="{ row }">
          <el-button
              type="primary"
              size="small"
              @click="viewRepairDetail(row)"
          >
            详情
          </el-button>
          <el-button
              type="success"
              size="small"
              @click="startRepair(row)"
              v-if="row.status === 'assigned'"
          >
            开始维修
          </el-button>
          <el-button
              type="warning"
              size="small"
              @click="viewRepairDetail(row)"
              v-if="row.status === 'repairing'"
          >
            继续维修
          </el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import repairAPI from '@/api/repair'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()
const loading = ref(false)
const activeStatus = ref('assigned')
const repairList = ref([])

// 加载维修工单
const loadRepairList = async () => {
  loading.value = true
  try {
    const workerId = authStore.user?.id || 1 // 实际项目中从登录信息获取
    const res = await repairAPI.getWorkerRepairs(workerId, activeStatus.value)
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

// 状态标签
const getStatusTag = (status) => {
  const tags = {
    assigned: 'primary',
    repairing: 'warning',
    completed: 'success'
  }
  return tags[status] || 'info'
}

// 状态文本
const getStatusLabel = (status) => {
  const labels = {
    assigned: '已派单',
    repairing: '维修中',
    completed: '已完成'
  }
  return labels[status] || '未知状态'
}

// 查看维修详情
const viewRepairDetail = (row) => {
  router.push(`/repair/detail/${row.id}`)
}

// 开始维修
const startRepair = async (row) => {
  try {
    await repairAPI.startRepair(row.id)
    ElMessage.success('维修已开始')
    loadRepairList()
  } catch (error) {
    ElMessage.error('开始维修失败: ' + error.message)
  }
}

onMounted(() => {
  loadRepairList()
})
</script>

<style scoped>
.repair-list-worker {
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

.el-tabs {
  margin-bottom: 20px;
}
</style>
