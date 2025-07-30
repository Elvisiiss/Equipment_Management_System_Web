<!-- panels/AlarmPanel.vue -->
<template>
  <div>
    <el-table :data="alarms" border>
      <el-table-column prop="time" label="时间" width="160" />
      <el-table-column prop="level" label="等级" width="80" />
      <el-table-column prop="msg" label="描述" />
    </el-table>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  device: Object
})

const alarms = computed(() => {
  // 此处使用 mock 数据，实际可换成接口
  return [
    { time: '2025-07-30 09:12:33', level: '高', msg: '温度过高' },
    { time: '2025-07-29 18:05:21', level: '中', msg: '电机电流异常' }
  ]
})
</script>
