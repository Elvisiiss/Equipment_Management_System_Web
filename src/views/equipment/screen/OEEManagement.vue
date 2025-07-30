<template>
  <div class="oee-dashboard">
    <!-- 标题 -->
    <h1 class="page-title">OEE 管理看板</h1>

    <!-- 实时关键指标卡片 -->
    <el-row :gutter="16">
      <el-col :span="6" v-for="k in realtimeCards" :key="k.label">
        <el-card shadow="hover" class="metric-card">
          <div class="metric-value" :style="{ color: k.color }">
            {{ k.value }}{{ k.unit }}
          </div>
          <div class="metric-label">{{ k.label }}</div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 机况 & 效率 趋势 -->
    <el-row :gutter="16" style="margin-top: 20px">
      <el-col :span="12">
        <el-card>
          <template #header>设备机况趋势</template>
          <div ref="availabilityChart" class="chart"></div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card>
          <template #header>生产效率趋势</template>
          <div ref="performanceChart" class="chart"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 达成率 & OEE 趋势 -->
    <el-row :gutter="16" style="margin-top: 20px">
      <el-col :span="12">
        <el-card>
          <template #header>达成率趋势</template>
          <div ref="achieveChart" class="chart"></div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card>
          <template #header>OEE 趋势</template>
          <div ref="oeeChart" class="chart"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 公式 & 基准 -->
<!--    <el-card style="margin-top: 20px">-->
<!--      <template #header>OEE 计算与行业基准</template>-->
<!--      <div class="formula">-->
<!--        <p><b>OEE = 可用性 × 性能效率 × 质量合格率</b></p>-->
<!--        <ul>-->
<!--          <li>可用性 = 实际运行时间 ÷ 计划运行时间</li>-->
<!--          <li>性能效率 =（实际产量 × 理论周期时间）÷ 实际运行时间</li>-->
<!--          <li>质量合格率 = 合格品 ÷ 总生产数量</li>-->
<!--        </ul>-->
<!--        <p>-->
<!--          <span style="color:#67c23a">世界级 ≥ 85%</span> |-->
<!--          <span style="color:#e6a23c">一般水平 ≈ 60%</span> |-->
<!--          <span style="color:#f56c6c">待改进 &lt; 40%</span>-->
<!--        </p>-->
<!--      </div>-->
<!--    </el-card>-->
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import * as echarts from 'echarts'

/* ------------------ 实时卡片 ------------------ */
const realtimeCards = ref([
  { label: '设备机况', value: 92.3, unit: '%', color: '#67c23a' },
  { label: '生产效率', value: 88.7, unit: '%', color: '#409eff' },
  { label: '达成率', value: 94.5, unit: '%', color: '#e6a23c' },
  { label: 'OEE', value: 77.2, unit: '%', color: '#f56c6c' }
])

/* ------------------ 图表 dom ------------------ */
const availabilityChart  = ref(null)
const performanceChart   = ref(null)
const achieveChart       = ref(null)
const oeeChart           = ref(null)

/* ------------------ 图表初始化 ------------------ */
function initLine(el, title, yLabel, data) {
  const chart = echarts.init(el)
  const days = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
  chart.setOption({
    title: { text: title, left: 'center' },
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', data: days },
    yAxis: { type: 'value', axisLabel: { formatter: '{value}%' } },
    series: [
      {
        data,
        type: 'line',
        smooth: true,
        areaStyle: {},
        markLine: {
          silent: true,
          data: [{ yAxis: yLabel === 'OEE' ? 85 : 90, lineStyle: { color: '#f56c6c' } }]
        }
      }
    ]
  })
  return chart
}

/* ------------------ 挂载 ------------------ */
onMounted(async () => {
  await nextTick()

  initLine(availabilityChart.value, '可用性趋势', '可用性',
      [90, 92, 91, 93, 94, 92, 92.3])
  initLine(performanceChart.value, '性能效率趋势', '效率',
      [85, 87, 86, 89, 90, 88, 88.7])
  initLine(achieveChart.value, '达成率趋势', '达成率',
      [93, 94, 92, 95, 96, 94, 94.5])
  initLine(oeeChart.value, 'OEE 趋势', 'OEE',
      [71, 73, 74, 76, 78, 77, 77.2])
})
</script>

<style scoped>
.oee-dashboard {
  padding: 24px;
  background: #f5f7fa;
}
.page-title {
  text-align: center;
  margin-bottom: 24px;
  font-weight: 600;
}
.metric-card {
  text-align: center;
}
.metric-value {
  font-size: 32px;
  font-weight: bold;
}
.metric-label {
  margin-top: 8px;
  color: #909399;
}
.chart {
  width: 100%;
  height: 300px;
}
.formula {
  line-height: 1.8;
}
</style>
