<template>
  <div class="report-container">
    <!-- 维度切换 -->
    <el-tabs v-model="activeName" @tab-change="handleTabChange">
      <el-tab-pane label="日"   name="daily"   />
      <el-tab-pane label="周"   name="weekly"  />
      <el-tab-pane label="月"   name="monthly" />
      <el-tab-pane label="总览" name="overall" />
    </el-tabs>

    <!-- 查询条件区域 -->
    <div class="query-conditions">
      <!-- 日维度查询条件 -->
      <div v-if="activeName === 'daily'" class="condition-group">
        <el-form :inline="true" :model="dailyQuery" class="demo-form-inline">
          <el-form-item label="开始时间">
            <el-date-picker
                v-model="dailyQuery.startDate"
                type="date"
                placeholder="选择开始日期"
                value-format="YYYY-MM-DD"
            />
          </el-form-item>
          <el-form-item label="结束时间">
            <el-date-picker
                v-model="dailyQuery.endDate"
                type="date"
                placeholder="选择结束日期"
                value-format="YYYY-MM-DD"
            />
          </el-form-item>
          <el-form-item label="车间">
            <el-select v-model="dailyQuery.workshop" placeholder="请选择车间">
              <el-option label="车间一" value="1" />
              <el-option label="车间二" value="2" />
            </el-select>
          </el-form-item>
          <el-form-item label="产线">
            <el-select v-model="dailyQuery.productionLine" placeholder="请选择产线">
              <el-option label="产线A" value="A" />
              <el-option label="产线B" value="B" />
            </el-select>
          </el-form-item>
          <el-form-item label="工段">
            <el-select v-model="dailyQuery.section" placeholder="请选择工段">
              <el-option label="工段1" value="1" />
              <el-option label="工段2" value="2" />
            </el-select>
          </el-form-item>
          <el-form-item label="设备编码">
            <el-input v-model="dailyQuery.deviceCode" placeholder="请输入设备编码" />
          </el-form-item>
          <el-form-item label="设备名称">
            <el-input v-model="dailyQuery.deviceName" placeholder="请输入设备名称" />
          </el-form-item>
          <el-form-item label="厂商">
            <el-select v-model="dailyQuery.vendor" placeholder="请选择厂商">
              <el-option label="厂商A" value="A" />
              <el-option label="厂商B" value="B" />
            </el-select>
          </el-form-item>
          <el-form-item label="班次">
            <el-select v-model="dailyQuery.shift" placeholder="请选择班次">
              <el-option label="白班" value="day" />
              <el-option label="夜班" value="night" />
            </el-select>
          </el-form-item>
          <el-form-item label="稼动率核算方式">
            <el-select v-model="dailyQuery.rateMethod" placeholder="请选择核算方式">
              <el-option label="标准核算" value="standard" />
              <el-option label="精确核算" value="accurate" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleQuery">查询</el-button>
            <el-button @click="resetQuery">重置</el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- 周维度查询条件 -->
      <div v-if="activeName === 'weekly'" class="condition-group">
        <el-form :inline="true" :model="weeklyQuery" class="demo-form-inline">
          <el-form-item label="年份">
            <el-date-picker
                v-model="weeklyQuery.year"
                type="year"
                placeholder="选择年份"
                value-format="YYYY"
            />
          </el-form-item>
          <el-form-item label="开始周">
            <el-select v-model="weeklyQuery.startWeek" placeholder="请选择开始周">
              <el-option v-for="w in 52" :key="w" :label="`第${w}周`" :value="w" />
            </el-select>
          </el-form-item>
          <el-form-item label="结束周">
            <el-select v-model="weeklyQuery.endWeek" placeholder="请选择结束周">
              <el-option v-for="w in 52" :key="w" :label="`第${w}周`" :value="w" />
            </el-select>
          </el-form-item>
          <el-form-item label="车间">
            <el-select v-model="weeklyQuery.workshop" placeholder="请选择车间">
              <el-option label="车间一" value="1" />
              <el-option label="车间二" value="2" />
            </el-select>
          </el-form-item>
          <el-form-item label="产线">
            <el-select v-model="weeklyQuery.productionLine" placeholder="请选择产线">
              <el-option label="产线A" value="A" />
              <el-option label="产线B" value="B" />
            </el-select>
          </el-form-item>
          <el-form-item label="工段">
            <el-select v-model="weeklyQuery.section" placeholder="请选择工段">
              <el-option label="工段1" value="1" />
              <el-option label="工段2" value="2" />
            </el-select>
          </el-form-item>
          <el-form-item label="设备编码">
            <el-input v-model="weeklyQuery.deviceCode" placeholder="请输入设备编码" />
          </el-form-item>
          <el-form-item label="设备名称">
            <el-input v-model="weeklyQuery.deviceName" placeholder="请输入设备名称" />
          </el-form-item>
          <el-form-item label="厂商">
            <el-select v-model="weeklyQuery.vendor" placeholder="请选择厂商">
              <el-option label="厂商A" value="A" />
              <el-option label="厂商B" value="B" />
            </el-select>
          </el-form-item>
          <el-form-item label="班次">
            <el-select v-model="weeklyQuery.shift" placeholder="请选择班次">
              <el-option label="白班" value="day" />
              <el-option label="夜班" value="night" />
            </el-select>
          </el-form-item>
          <el-form-item label="稼动率核算方式">
            <el-select v-model="weeklyQuery.rateMethod" placeholder="请选择核算方式">
              <el-option label="标准核算" value="standard" />
              <el-option label="精确核算" value="accurate" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleQuery">查询</el-button>
            <el-button @click="resetQuery">重置</el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- 月维度查询条件 -->
      <div v-if="activeName === 'monthly'" class="condition-group">
        <el-form :inline="true" :model="monthlyQuery" class="demo-form-inline">
          <el-form-item label="起始月">
            <el-date-picker
                v-model="monthlyQuery.startMonth"
                type="month"
                placeholder="选择起始月"
                value-format="YYYY-MM"
            />
          </el-form-item>
          <el-form-item label="结束月">
            <el-date-picker
                v-model="monthlyQuery.endMonth"
                type="month"
                placeholder="选择结束月"
                value-format="YYYY-MM"
            />
          </el-form-item>
          <el-form-item label="车间">
            <el-select v-model="monthlyQuery.workshop" placeholder="请选择车间">
              <el-option label="车间一" value="1" />
              <el-option label="车间二" value="2" />
            </el-select>
          </el-form-item>
          <el-form-item label="产线">
            <el-select v-model="monthlyQuery.productionLine" placeholder="请选择产线">
              <el-option label="产线A" value="A" />
              <el-option label="产线B" value="B" />
            </el-select>
          </el-form-item>
          <el-form-item label="工段">
            <el-select v-model="monthlyQuery.section" placeholder="请选择工段">
              <el-option label="工段1" value="1" />
              <el-option label="工段2" value="2" />
            </el-select>
          </el-form-item>
          <el-form-item label="设备编码">
            <el-input v-model="monthlyQuery.deviceCode" placeholder="请输入设备编码" />
          </el-form-item>
          <el-form-item label="设备名称">
            <el-input v-model="monthlyQuery.deviceName" placeholder="请输入设备名称" />
          </el-form-item>
          <el-form-item label="厂商">
            <el-select v-model="monthlyQuery.vendor" placeholder="请选择厂商">
              <el-option label="厂商A" value="A" />
              <el-option label="厂商B" value="B" />
            </el-select>
          </el-form-item>
          <el-form-item label="班次">
            <el-select v-model="monthlyQuery.shift" placeholder="请选择班次">
              <el-option label="白班" value="day" />
              <el-option label="夜班" value="night" />
            </el-select>
          </el-form-item>
          <el-form-item label="稼动率核算方式">
            <el-select v-model="monthlyQuery.rateMethod" placeholder="请选择核算方式">
              <el-option label="标准核算" value="standard" />
              <el-option label="精确核算" value="accurate" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleQuery">查询</el-button>
            <el-button @click="resetQuery">重置</el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- 总览维度查询条件 -->
      <div v-if="activeName === 'overall'" class="condition-group">
        <el-form :inline="true" :model="overallQuery" class="demo-form-inline">
          <el-form-item label="开始日期">
            <el-date-picker
                v-model="overallQuery.startDate"
                type="date"
                placeholder="选择开始日期"
                value-format="YYYY-MM-DD"
            />
          </el-form-item>
          <el-form-item label="结束日期">
            <el-date-picker
                v-model="overallQuery.endDate"
                type="date"
                placeholder="选择结束日期"
                value-format="YYYY-MM-DD"
            />
          </el-form-item>
          <el-form-item label="车间">
            <el-select v-model="overallQuery.workshop" placeholder="请选择车间">
              <el-option label="车间一" value="1" />
              <el-option label="车间二" value="2" />
            </el-select>
          </el-form-item>
          <el-form-item label="产线">
            <el-select v-model="overallQuery.productionLine" placeholder="请选择产线">
              <el-option label="产线A" value="A" />
              <el-option label="产线B" value="B" />
            </el-select>
          </el-form-item>
          <el-form-item label="工段">
            <el-select v-model="overallQuery.section" placeholder="请选择工段">
              <el-option label="工段1" value="1" />
              <el-option label="工段2" value="2" />
            </el-select>
          </el-form-item>
          <el-form-item label="设备编码">
            <el-input v-model="overallQuery.deviceCode" placeholder="请输入设备编码" />
          </el-form-item>
          <el-form-item label="设备名称">
            <el-input v-model="overallQuery.deviceName" placeholder="请输入设备名称" />
          </el-form-item>
          <el-form-item label="厂商">
            <el-select v-model="overallQuery.vendor" placeholder="请选择厂商">
              <el-option label="厂商A" value="A" />
              <el-option label="厂商B" value="B" />
            </el-select>
          </el-form-item>
          <el-form-item label="班次">
            <el-select v-model="overallQuery.shift" placeholder="请选择班次">
              <el-option label="白班" value="day" />
              <el-option label="夜班" value="night" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleQuery">查询</el-button>
            <el-button @click="resetQuery">重置</el-button>
          </el-form-item>
        </el-form>
      </div>
    </div>

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

/* ---------- 查询条件 ---------- */
const dailyQuery = ref({
  startDate: '',
  endDate: '',
  workshop: '',
  productionLine: '',
  section: '',
  deviceCode: '',
  deviceName: '',
  vendor: '',
  shift: '',
  rateMethod: ''
})

const weeklyQuery = ref({
  year: '',
  startWeek: '',
  endWeek: '',
  workshop: '',
  productionLine: '',
  section: '',
  deviceCode: '',
  deviceName: '',
  vendor: '',
  shift: '',
  rateMethod: ''
})

const monthlyQuery = ref({
  startMonth: '',
  endMonth: '',
  workshop: '',
  productionLine: '',
  section: '',
  deviceCode: '',
  deviceName: '',
  vendor: '',
  shift: '',
  rateMethod: ''
})

const overallQuery = ref({
  startDate: '',
  endDate: '',
  workshop: '',
  productionLine: '',
  section: '',
  deviceCode: '',
  deviceName: '',
  vendor: '',
  shift: ''
})

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

/* ---------- 查询处理 ---------- */
function handleQuery() {
  ElMessage.success('查询条件已提交')
  // 这里应该根据查询条件重新获取数据
  // 由于是模拟数据，我们直接重新渲染图表
  renderChart()
}

function resetQuery() {
  if (activeName.value === 'daily') {
    dailyQuery.value = {
      startDate: '',
      endDate: '',
      workshop: '',
      productionLine: '',
      section: '',
      deviceCode: '',
      deviceName: '',
      vendor: '',
      shift: '',
      rateMethod: ''
    }
  } else if (activeName.value === 'weekly') {
    weeklyQuery.value = {
      year: '',
      startWeek: '',
      endWeek: '',
      workshop: '',
      productionLine: '',
      section: '',
      deviceCode: '',
      deviceName: '',
      vendor: '',
      shift: '',
      rateMethod: ''
    }
  } else if (activeName.value === 'monthly') {
    monthlyQuery.value = {
      startMonth: '',
      endMonth: '',
      workshop: '',
      productionLine: '',
      section: '',
      deviceCode: '',
      deviceName: '',
      vendor: '',
      shift: '',
      rateMethod: ''
    }
  } else if (activeName.value === 'overall') {
    overallQuery.value = {
      startDate: '',
      endDate: '',
      workshop: '',
      productionLine: '',
      section: '',
      deviceCode: '',
      deviceName: '',
      vendor: '',
      shift: ''
    }
  }
  ElMessage.info('查询条件已重置')
}

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
  padding: 16px;
  margin: 0;
  background: #fff;
}
.chart-area {
  width: 100%;
  height: 380px;
  margin-top: 16px;
}
.query-conditions {
  margin-top: 16px;
  padding: 16px;
  background: #f5f7fa;
  border-radius: 4px;
}
.condition-group {
  margin-bottom: 10px;
}
</style>
