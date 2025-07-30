<template>
  <div class="iot-dashboard">
    <h1 class="title">IoT 采集监控看板</h1>

    <el-row :gutter="16">
      <!-- 左侧实时数据，带单位与阈值状态颜色提示 -->
      <el-col :span="8">
        <el-card>
          <template #header>实时采集值</template>
          <div class="real-list">
            <div
                v-for="item in realtimeList"
                :key="item.key"
                class="real-item"
                :class="item.alarm ? 'alarm' : ''"
            >
              <span class="label">{{ item.label }}</span>
              <span class="value">{{ item.value }}</span>
              <span class="unit">{{ item.unit }}</span>
            </div>
          </div>
        </el-card>
      </el-col>

      <!-- 右侧趋势图 ，展示 24h 历史趋势-->
      <el-col :span="16">
        <el-card>
          <template #header>
            <span>参数趋势（24h）</span>
            <el-select
                v-model="activeTag"
                size="small"
                style="width: 120px; margin-left: 12px"
            >
              <el-option
                  v-for="p in paramOptions"
                  :key="p.key"
                  :label="p.label"
                  :value="p.key"
              />
            </el-select>
          </template>
          <div ref="trendChart" class="chart"></div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import * as echarts from 'echarts'

/* ----------- 实时数据 ：实时刷新最新采集值，每 3 秒自动更新实时值----------- */
const realtimeList = ref([
  { key: 'temp', label: '温度', value: 23.5, unit: '°C', alarm: false, max: 30 },
  { key: 'hum', label: '湿度', value: 55.2, unit: '%', alarm: false, max: 70 },
  { key: 'press', label: '压力', value: 0.42, unit: 'MPa', alarm: false, max: 0.5 },
  { key: 'current', label: '电流', value: 5.3, unit: 'A', alarm: false, max: 6 },
  { key: 'volt', label: '电压', value: 220.1, unit: 'V', alarm: false, max: 240 },
  { key: 'vib', label: '振动', value: 2.1, unit: 'mm/s', alarm: false, max: 4.5 }
])

/* ----------- 趋势图 ----------- */
const trendChart = ref(null)
const activeTag = ref('temp')
let chartInst = null

const paramOptions = realtimeList.value.map(i => ({ key: i.key, label: i.label }))

/* 生成 24h 模拟数据 */
function generate24h(base) {
  const arr = []
  for (let i = 0; i < 24; i++) {
    arr.push(+((base + (Math.random() - 0.5) * 5).toFixed(1)))
  }
  return arr
}

const historyMap = {
  temp: generate24h(25),
  hum: generate24h(60),
  press: generate24h(0.45),
  current: generate24h(5),
  volt: generate24h(220),
  vib: generate24h(2)
}

function drawLine() {
  const hours = Array.from({ length: 24 }, (_, i) => `${i}:00`)
  const data = historyMap[activeTag.value]

  chartInst.setOption({
    tooltip: { trigger: 'axis' },
    grid: { left: 50, right: 20, top: 30, bottom: 30 },
    xAxis: { type: 'category', data: hours },
    yAxis: { type: 'value' },
    series: [
      {
        data,
        type: 'line',
        smooth: true,
        lineStyle: { width: 3 },
        areaStyle: { opacity: 0.2 }
      }
    ]
  })
}

/* ----------- 定时刷新实时值 ----------- */
let timer = null
function startRealtime() {
  timer = setInterval(() => {
    realtimeList.value.forEach(item => {
      const offset = (Math.random() - 0.5) * 0.5
      item.value = +((item.value + offset).toFixed(1))
      item.alarm = item.value > item.max
    })
  }, 3000)
}

/* ----------- 生命周期 ----------- */
onMounted(async () => {
  await nextTick()
  chartInst = echarts.init(trendChart.value)
  drawLine()
  startRealtime()
})

watch(activeTag, drawLine)

onBeforeUnmount(() => {
  clearInterval(timer)
  chartInst?.dispose()
})
</script>

<style scoped>
.iot-dashboard {
  padding: 24px;
  background: #f5f7fa;
}
.title {
  text-align: center;
  margin-bottom: 20px;
  font-weight: 600;
}
.real-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.real-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-radius: 6px;
  background: #ecf5ff;
}
.real-item.alarm {
  background: #fef0f0;
  color: #f56c6c;
  font-weight: bold;
}
.label {
  font-weight: 500;
}
.value {
  font-size: 20px;
  font-weight: bold;
}
.unit {
  color: #909399;
  margin-left: 4px;
}
.chart {
  width: 100%;
  height: 360px;
}
</style>
