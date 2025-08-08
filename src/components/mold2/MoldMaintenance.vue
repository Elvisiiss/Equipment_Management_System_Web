<template>
  <div>
    <h3>3. 模具保养</h3>
    <el-card shadow="never">
      <el-table :data="maintenanceData" border style="width: 100%">
        <el-table-column prop="moldName" label="模具名称" />
        <el-table-column prop="deviceName" label="设备名称" />
        <el-table-column prop="plan" label="保养计划" />
        <el-table-column prop="lastDate" label="上次保养日期" />
        <el-table-column prop="nextDate" label="下次保养日期" />
        <el-table-column prop="result" label="上次保养结果">
          <template #default="{row}">
            <el-tag :type="row.result === '合格' ? 'success' : 'danger'">
              {{ row.result }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template #default="{row}">
            <el-button size="small" type="primary" @click="handleMaintain(row)">
              保养记录
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

const maintenanceData = ref([
  {
    moldName: 'CX2030',
    deviceName: 'C4-51-01',
    plan: '一级保养',
    lastDate: '2025-08-01',
    nextDate: '2025-09-01',
    result: '合格'
  },
  {
    moldName: 'CX2031',
    deviceName: 'C4-51-02',
    plan: '二级保养',
    lastDate: '2025-07-25',
    nextDate: '2025-08-25',
    result: '合格'
  },
  {
    moldName: 'CX2032',
    deviceName: 'C4-51-03',
    plan: '三级保养',
    lastDate: '2025-07-20',
    nextDate: '2025-08-20',
    result: '不合格'
  }
])

const handleMaintain = (row) => {
  ElMessage.info(`查看${row.moldName}的保养记录`)
  // 实际应用中这里应该打开保养记录对话框或跳转到详情页
}
</script>
