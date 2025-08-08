<template>
  <div>
    <h3>4. 模具维修</h3>
    <el-card shadow="never">
      <el-table :data="repairData" border style="width: 100%">
        <el-table-column prop="moldName" label="模具名称" />
        <el-table-column prop="deviceName" label="设备名称" />
        <el-table-column prop="issue" label="问题描述" />
        <el-table-column prop="reportTime" label="报修时间" />
        <el-table-column prop="repairTime" label="维修时间" />
        <el-table-column prop="status" label="维修状态">
          <template #default="{row}">
            <el-tag :type="getStatusType(row.status)">
              {{ row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template #default="{row}">
            <el-button
                size="small"
                type="primary"
                :disabled="row.status !== '待维修'"
                @click="handleRepair(row)">
              维修
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <div style="text-align: right; margin-top: 20px;">
      <el-button @click="$emit('prev')">上一步</el-button>
      <el-button type="primary" @click="$emit('next')">下一步</el-button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'

const emit = defineEmits(['prev', 'next'])

const repairData = ref([
  {
    moldName: 'CX2030',
    deviceName: 'C4-51-01',
    issue: '模具磨损',
    reportTime: '2025-08-05 10:00',
    repairTime: '2025-08-05 14:30',
    status: '已维修'
  },
  {
    moldName: 'CX2031',
    deviceName: 'C4-51-02',
    issue: '零件松动',
    reportTime: '2025-08-06 09:00',
    repairTime: '',
    status: '待维修'
  },
  {
    moldName: 'CX2032',
    deviceName: 'C4-51-03',
    issue: '电气故障',
    reportTime: '2025-08-07 13:00',
    repairTime: '2025-08-07 15:45',
    status: '已维修'
  }
])

const getStatusType = (status) => {
  switch(status) {
    case '已维修': return 'success'
    case '维修中': return 'warning'
    case '待维修': return 'danger'
    default: return ''
  }
}

const handleRepair = (row) => {
  row.status = '维修中'
  row.repairTime = new Date().toLocaleString()
  ElMessage.success('已开始维修')
  // 模拟维修完成
  setTimeout(() => {
    row.status = '已维修'
    ElMessage.success('维修完成')
  }, 2000)
}
</script>
