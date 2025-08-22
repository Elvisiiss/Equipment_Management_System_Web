<template>
  <div class="report-container">
    <!-- 维度切换 -->
    <el-tabs v-model="activeName" @tab-change="handleTabChange">
      <el-tab-pane label="日"   name="daily"   />
      <el-tab-pane label="周"   name="weekly"  />
      <el-tab-pane label="月"   name="monthly" />
      <el-tab-pane label="总览" name="overall" />
    </el-tabs>

    <!-- 图表区域 -->
    <div ref="chartRef" class="chart-area"></div>

    <!-- 表格：日/周/月 -->
    <el-table
        v-if="activeName !== 'overall'"
        :data="tableData"
        border
        stripe
        fit
        style="width:100%; margin-top:16px"
    >
      <el-table-column prop="date"    label="日期"        min-width="120" />
      <el-table-column prop="powerOn" label="开机时间(h)" min-width="110" />
      <el-table-column prop="run"     label="运行时间(h)" min-width="110" />
      <el-table-column prop="wait"    label="待机时间(h)" min-width="110" />
      <el-table-column prop="down"    label="停机时间(h)" min-width="110" />
      <el-table-column prop="offline" label="离线时间(h)" min-width="110" />
      <el-table-column prop="stops"   label="停机次数"    min-width="100" />
      <el-table-column prop="rate"    label="稼动率(%)"   min-width="100" />
    </el-table>

    <!-- 表格：总览 -->
    <el-table
        v-else
        :data="tableData"
        border
        stripe
        fit
        style="width:100%; margin-top:16px"
    >
      <el-table-column prop="date"    label="日期"        min-width="120" />
      <el-table-column prop="run"     label="运行时间(h)" min-width="110" />
      <el-table-column prop="wait"    label="待机时间(h)" min-width="110" />
      <el-table-column prop="down"    label="停机时间(h)" min-width="110" />
      <el-table-column prop="offline" label="离线时间(h)" min-width="110" />
      <el-table-column prop="stops"   label="停机次数"    min-width="100" />
      <el-table-column prop="rate"    label="稼动率(%)"   min-width="100" />
    </el-table>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, computed } from 'vue'
import * as echarts from 'echarts'
import { ElMessage } from 'element-plus'

/* ---------- 响应式数据 ---------- */
const activeName = ref('daily')
const chartRef   = ref(null)
let   myChart    = null

/* ---------- 工具：保留两位小数 ---------- */
const to2 = n => Number(n).toFixed(2)

/* ---------- 工具：生成非负离线时间 ---------- */
function safeOffline (run, down, wait, totalCap) {
  let sum = run + down + wait
  if (sum > totalCap) {
    const ratio = totalCap / sum
    run  = +(run  * ratio)
    down = +(down * ratio)
    wait = +(wait * ratio)
    sum  = totalCap
  }
  return { run: +to2(run), down: +to2(down), wait: +to2(wait), offline: +to2(totalCap - sum) }
}

/* ---------- 模拟数据 ---------- */
function genDaily () {
  const list = []
  for (let i = 1; i <= 31; i++) {
    let run  = 6  + Math.random() * 2
    let down = 0.1 + Math.random() * 0.9
    let wait = 0.1 + Math.random() * 0.5
    const safe   = safeOffline(run, down, wait, 8)
    const powerOn = safe.run + safe.wait + safe.down
    const stops = Math.floor(Math.random() * 5) + 1
    const rate  = +to2((safe.run / powerOn) * 100)
    list.push({
      date: `2025-08-${String(i).padStart(2,'0')}`,
      powerOn: +to2(powerOn),
      run: safe.run,
      wait: safe.wait,
      down: safe.down,
      offline: safe.offline,
      stops,
      rate
    })
  }
  return list
}
function genWeekly () {
  return Array.from({ length: 12 }, (_, i) => {
    let run  = 50 + Math.random() * 10
    let down = 1  + Math.random() * 4
    let wait = 1  + Math.random() * 3
    const safe   = safeOffline(run, down, wait, 60)
    const powerOn = safe.run + safe.wait + safe.down
    const stops = Math.floor(Math.random() * 10) + 5
    const rate  = +to2((safe.run / powerOn) * 100)
    return {
      date: `2025-W${String(i+1).padStart(2,'0')}`,
      powerOn: +to2(powerOn),
      run: safe.run,
      wait: safe.wait,
      down: safe.down,
      offline: safe.offline,
      stops,
      rate
    }
  })
}
function genMonthly () {
  return Array.from({ length: 12 }, (_, i) => {
    let run  = 220 + Math.random() * 40
    let down = 5  + Math.random() * 15
    let wait = 5  + Math.random() * 10
    const safe   = safeOffline(run, down, wait, 240)
    const powerOn = safe.run + safe.wait + safe.down
    const stops = Math.floor(Math.random() * 40) + 20
    const rate  = +to2((safe.run / powerOn) * 100)
    return {
      date: `2025-${String(i+1).padStart(2,'0')}`,
      powerOn: +to2(powerOn),
      run: safe.run,
      wait: safe.wait,
      down: safe.down,
      offline: safe.offline,
      stops,
      rate
    }
  })
}
function genOverall () {
  return [
    { date: '2025-Q1', run: 720, wait: 8.00,  down: 20.00, offline: 2.00,  stops: 90,  rate: 96.00 },
    { date: '2025-Q2', run: 710, wait: 10.00, down: 25.00, offline: 5.00,  stops: 110, rate: 94.70 },
    { date: '2025-Q3', run: 730, wait: 5.00,  down: 15.00, offline: 0.00,  stops: 80,  rate: 97.30 },
    { date: '2025-Q4', run: 725, wait: 7.00,  down: 18.00, offline: 0.00,  stops: 85,  rate: 96.60 }
  ].map(r => ({ ...r, run: +to2(r.run) }))
}
const mock = {
  daily:   genDaily(),
  weekly:  genWeekly(),
  monthly: genMonthly(),
  overall: genOverall()
}

/* ---------- 计算当前表格数据 ---------- */
const tableData = computed(() => mock[activeName.value] || [])

/* ---------- 图表渲染 ---------- */
function renderChart () {
  if (!myChart) {
    myChart = echarts.init(chartRef.value)
    window.addEventListener('resize', () => myChart.resize())
  }
  const rows = tableData.value
  const option = {
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    legend: { data: ['运行时间', '待机时间', '停机时间', '离线时间', '稼动率'] },
    grid: { left: 60, right: 60, bottom: 60, top: 40, containLabel: true },
    dataZoom: [{ type: 'inside', xAxisIndex: 0 }],
    xAxis: { type: 'category', data: rows.map(r => r.date) },
    yAxis: [
      { type: 'value', name: '小时(h)' },
      { type: 'value', name: '稼动率(%)', max: 100, position: 'right' }
    ],
    series: [
      {
        name: '运行时间',
        type: 'bar',
        stack: 'total',
        barWidth: '12.5%',
        data: rows.map(r => r.run || 0),
        itemStyle: { color: '#67C23A' }
      },
      {
        name: '待机时间',
        type: 'bar',
        stack: 'total',
        barWidth: '12.5%',
        data: rows.map(r => r.wait),
        itemStyle: { color: '#E6A23C' }
      },
      {
        name: '停机时间',
        type: 'bar',
        stack: 'total',
        barWidth: '12.5%',
        data: rows.map(r => r.down),
        itemStyle: { color: '#F56C6C' }
      },
      {
        name: '离线时间',
        type: 'bar',
        stack: 'total',
        barWidth: '12.5%',
        data: rows.map(r => r.offline),
        itemStyle: { color: '#909399' }
      },
      {
        name: '稼动率',
        type: 'line',
        yAxisIndex: 1,
        data: rows.map(r => r.rate),
        lineStyle: { color: '#409EFF', width: 3 },
        symbol: 'circle',
        symbolSize: 6
      }
    ]
  }
  myChart.setOption(option, true)
}

/* ---------- Tab 切换 ---------- */
function handleTabChange () {
  nextTick(renderChart)
}

/* ---------- 生命周期 ---------- */
onMounted(() => {
  handleTabChange()
  ElMessage.success('时间稼动率报表已加载')
})
</script>

<style scoped>
/* 占满整行，无留白 */
.report-container {
  width: 100%;
  padding: 0;
  margin: 0;
  background: #fff;
}
.chart-area {
  width: 100%;
  height: 380px;
  margin-top: 8px;
}
</style>
