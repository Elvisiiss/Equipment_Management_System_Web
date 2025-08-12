<template>
  <el-card>
    <template #header>审批结果列表</template>
    <el-table :data="list" stripe>
      <el-table-column prop="id" label="ID" />
      <el-table-column prop="deviceCode" label="设备编码" />
      <el-table-column prop="deviceName" label="设备名称" />
      <el-table-column prop="taskName" label="任务名称" />
      <el-table-column prop="auditor" label="审核人" />
      <el-table-column prop="auditTime" label="审核时间" />
      <el-table-column prop="status" label="审批状态">
        <template #default="{row}">
          <el-tag :type="row.status==='已通过'?'success':'danger'">
            {{ row.status }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作">
        <template #default="{row}">
          <el-button @click="view(row)">查看详情</el-button>
          <el-button v-if="row.status==='已驳回'" @click="resubmit(row)">重新提交</el-button>
        </template>
      </el-table-column>
    </el-table>
  </el-card>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const list = ref([])

function load () {
  list.value = JSON.parse(localStorage.getItem('checkResult') || '[]')
}
function view (row) {
  alert(JSON.stringify(row, null, 2))
}
function resubmit (row) {
  // 将驳回记录删除并重新提交任务
  const res = JSON.parse(localStorage.getItem('checkResult') || '[]')
  localStorage.setItem('checkResult', JSON.stringify(res.filter(i => i.id !== row.id)))

  const tasks = JSON.parse(localStorage.getItem('checkTask') || '[]')
  tasks.unshift({
    ...row,
    status: '待审核',
    auditTime: ''
  })
  localStorage.setItem('checkTask', JSON.stringify(tasks))
  alert('已重新提交，请前往审核任务列表查看')
}

onMounted(load)
</script>
