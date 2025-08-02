<template>
  <div ref="chartRef" style="height:260px"></div>
</template>

<script setup>
import * as echarts from 'echarts'
import { onMounted, ref } from 'vue'
import { getModuleUsage } from '@/api/mock'

const chartRef = ref(null)
onMounted(() => {
  const list = getModuleUsage()
  const chart = echarts.init(chartRef.value)
  chart.setOption({
    title: { text: '业务模块使用统计', left: 'center' },
    tooltip: {},
    xAxis: { type: 'value' },
    yAxis: { type: 'category', data: list.map(i => i.module) },
    series: [{
      type: 'bar',
      data: list.map(i => i.pv),
      itemStyle: { color: '#67C23A' }
    }]
  })
})
</script>
