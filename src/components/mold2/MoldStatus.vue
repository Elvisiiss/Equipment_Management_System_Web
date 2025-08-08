<template>
  <div>
    <h3>2. 模具状态</h3>
    <el-card shadow="never">
      <el-table :data="statusData" border style="width: 100%">
        <el-table-column prop="moldName" label="模具名称" />
        <el-table-column prop="deviceName" label="设备名称" />
        <el-table-column prop="status" label="当前状态">
          <template #default="{row}">
            <el-tag :type="getStatusType(row.status)">
              {{ row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="runTime" label="运行时间" />
        <el-table-column prop="output" label="产量" />
        <el-table-column prop="lastMaintenance" label="上次保养时间" />
        <el-table-column prop="nextMaintenance" label="下次保养时间" />
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

const emit = defineEmits(['prev', 'next'])

const statusData = ref([
  {
    moldName: 'CX2030',
    deviceName: 'C4-51-01',
    status: '运行中',
    runTime: '120小时',
    output: '5000',
    lastMaintenance: '2025-08-01',
    nextMaintenance: '2025-09-01'
  },
  {
    moldName: 'CX2031',
    deviceName: 'C4-51-02',
    status: '待机中',
    runTime: '80小时',
    output: '3000',
    lastMaintenance: '2025-07-25',
    nextMaintenance: '2025-08-25'
  },
  {
    moldName: 'CX2032',
    deviceName: 'C4-51-03',
    status: '维修中',
    runTime: '200小时',
    output: '8000',
    lastMaintenance: '2025-07-20',
    nextMaintenance: '2025-08-20'
  }
])

const getStatusType = (status) => {
  switch(status) {
    case '运行中': return 'success'
    case '待机中': return 'info'
    case '维修中': return 'danger'
    default: return ''
  }
}
</script>
