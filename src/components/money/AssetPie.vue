<template>
  <div ref="chartRef" style="height:260px"></div>
</template>

<script setup>
import * as echarts from 'echarts'
import { onMounted, ref } from 'vue'
import { getAssetStats } from '@/api/mock'

const chartRef = ref(null)
onMounted(() => {
  const { types } = getAssetStats()
  const chart = echarts.init(chartRef.value)
  chart.setOption({
    title: { text: '台账类型及寿命分布', left: 'center' },
    tooltip: { trigger: 'item', formatter: '{b}: {c}台 ({d}%)<br/>平均寿命: {@life}年' },
    legend: { orient: 'vertical', left: 'left' },
    series: [{
      type: 'pie', radius: '60%', data: types.map(t => ({ name: t.name, value: t.value, life: t.life }))
    }]
  })
})
</script>
