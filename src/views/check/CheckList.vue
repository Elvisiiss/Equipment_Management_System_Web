<template>
  <el-card>
    <template #header>审核任务列表</template>
    <el-table :data="list" stripe>
      <el-table-column prop="id" label="ID" />
      <el-table-column prop="deviceCode" label="设备编码" />
      <el-table-column prop="deviceName" label="设备名称" />
      <el-table-column prop="taskName" label="任务名称" />
      <el-table-column prop="auditor" label="审核人" />
      <el-table-column prop="auditTime" label="审核时间" />
      <el-table-column prop="status" label="状态">
        <template #default="{row}">
          <el-tag :type="row.status==='已审核'?'success':'warning'">
            {{ row.status }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作">
        <template #default="{row}">
          <el-button v-if="row.status==='待审核'" type="primary" @click="audit(row)">审核</el-button>
        </template>
      </el-table-column>
    </el-table>
  </el-card>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessageBox } from 'element-plus'

const list = ref([])

function load () {
  list.value = JSON.parse(localStorage.getItem('checkTask') || '[]')
}

function audit (row) {
  ElMessageBox.confirm('是否通过审核？', '审核', {
    confirmButtonText: '通过',
    cancelButtonText: '驳回',
    distinguishCancelAndClose: true
  }).then(() => finish(row, '已通过'))
      .catch(action => {
        if (action === 'cancel') finish(row, '已驳回')
      })
}

function finish (row, result) {
  // 更新任务状态
  const idx = list.value.findIndex(i => i.id === row.id)
  list.value[idx].status = '已审核'
  list.value[idx].auditTime = new Date().toLocaleString()
  list.value[idx].auditor = 'admin'
  localStorage.setItem('checkTask', JSON.stringify(list.value))

  // 写入审批结果
  const results = JSON.parse(localStorage.getItem('checkResult') || '[]')
  results.unshift({
    id: row.id,
    deviceCode: row.deviceCode,
    deviceName: row.deviceName,
    taskName: row.taskName,
    auditor: 'admin',
    auditTime: new Date().toLocaleString(),
    status: result
  })
  localStorage.setItem('checkResult', JSON.stringify(results))
}

onMounted(load)
</script>
