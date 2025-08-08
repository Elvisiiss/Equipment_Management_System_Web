<template>
  <el-table :data="logs" style="width: 100%">
    <el-table-column prop="device" label="设备" />
    <el-table-column prop="from" label="原产品" />
    <el-table-column prop="to" label="新产品" />
    <el-table-column label="时间">
      <template #default="{ row }">{{ dayjs(row.createdAt).format('MM-DD HH:mm') }}</template>
    </el-table-column>
  </el-table>
</template>

<script setup>
import dayjs from 'dayjs'
defineProps({ logs: Array })
</script>
