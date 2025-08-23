<template>
  <div class="report-container">
    <!-- 维度切换 -->
    <el-tabs v-model="activeName" @tab-change="handleTabChange">
      <el-tab-pane label="日" name="daily" />
      <el-tab-pane label="周" name="weekly" />
      <el-tab-pane label="月" name="monthly" />
      <el-tab-pane label="年" name="yearly" />
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
          <el-form-item>
            <el-button type="primary" @click="handleQuery">查询</el-button>
            <el-button @click="resetQuery">重置</el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- 年维度查询条件 -->
      <div v-if="activeName === 'yearly'" class="condition-group">
        <el-form :inline="true" :model="yearlyQuery" class="demo-form-inline">
          <el-form-item label="开始年份">
            <el-date-picker
                v-model="yearlyQuery.startYear"
                type="year"
                placeholder="选择开始年份"
                value-format="YYYY"
            />
          </el-form-item>
          <el-form-item label="结束年份">
            <el-date-picker
                v-model="yearlyQuery.endYear"
                type="year"
                placeholder="选择结束年份"
                value-format="YYYY"
            />
          </el-form-item>
          <el-form-item label="车间">
            <el-select v-model="yearlyQuery.workshop" placeholder="请选择车间">
              <el-option label="车间一" value="1" />
              <el-option label="车间二" value="2" />
            </el-select>
          </el-form-item>
          <el-form-item label="产线">
            <el-select v-model="yearlyQuery.productionLine" placeholder="请选择产线">
              <el-option label="产线A" value="A" />
              <el-option label="产线B" value="B" />
            </el-select>
          </el-form-item>
          <el-form-item label="工段">
            <el-select v-model="yearlyQuery.section" placeholder="请选择工段">
              <el-option label="工段1" value="1" />
              <el-option label="工段2" value="2" />
            </el-select>
          </el-form-item>
          <el-form-item label="设备编码">
            <el-input v-model="yearlyQuery.deviceCode" placeholder="请输入设备编码" />
          </el-form-item>
          <el-form-item label="设备名称">
            <el-input v-model="yearlyQuery.deviceName" placeholder="请输入设备名称" />
          </el-form-item>
          <el-form-item label="厂商">
            <el-select v-model="yearlyQuery.vendor" placeholder="请选择厂商">
              <el-option label="厂商A" value="A" />
              <el-option label="厂商B" value="B" />
            </el-select>
          </el-form-item>
          <el-form-item label="班次">
            <el-select v-model="yearlyQuery.shift" placeholder="请选择班次">
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

    <!-- 表格 -->
    <el-table
        :data="tableData"
        border
        stripe
        fit
        style="width:100%; margin-top:16px"
    >
      <el-table-column prop="date" label="日期" min-width="120" />
      <el-table-column prop="good" label="良品" min-width="100" />
      <el-table-column prop="bad" label="不良品" min-width="100" />
      <el-table-column prop="total" label="总数" min-width="100" />
      <el-table-column prop="rate" label="良率(%)" min-width="100" />
    </el-table>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, computed } from 'vue'
import { ElMessage } from 'element-plus'
import * as echarts from 'echarts'

/* ---------- 响应式数据 ---------- */
const activeName = ref('daily')
const chartRef = ref(null)
let myChart = null

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
  shift: ''
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
  shift: ''
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
  shift: ''
})

const yearlyQuery = ref({
  startYear: '',
  endYear: '',
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

/* ---------- 模拟数据 ---------- */
function genDaily() {
  const list = []
  for (let i = 1; i <= 31; i++) {
    const good = Math.floor(Math.random() * 1000) + 500
    const bad = Math.floor(Math.random() * 100)
    const total = good + bad
    const rate = +to2((good / total) * 100)
    list.push({
      date: `2025-08-${String(i).padStart(2, '0')}`,
      good,
      bad,
      total,
      rate
    })
  }
  return list
}

function genWeekly() {
  return Array.from({ length: 12 }, (_, i) => {
    const good = Math.floor(Math.random() * 6000) + 3000
    const bad = Math.floor(Math.random() * 300) + 100
    const total = good + bad
    const rate = +to2((good / total) * 100)
    return {
      date: `2025-W${String(i + 1).padStart(2, '0')}`,
      good,
      bad,
      total,
      rate
    }
  })
}

function genMonthly() {
  return Array.from({ length: 12 }, (_, i) => {
    const good = Math.floor(Math.random() * 24000) + 12000
    const bad = Math.floor(Math.random() * 1200) + 400
    const total = good + bad
    const rate = +to2((good / total) * 100)
    return {
      date: `2025-${String(i + 1).padStart(2, '0')}`,
      good,
      bad,
      total,
      rate
    }
  })
}

function genYearly() {
  return Array.from({ length: 5 }, (_, i) => {
    const year = 2021 + i
    const good = Math.floor(Math.random() * 280000) + 140000
    const bad = Math.floor(Math.random() * 14000) + 5000
    const total = good + bad
    const rate = +to2((good / total) * 100)
    return {
      date: `${year}`,
      good,
      bad,
      total,
      rate
    }
  })
}

const mock = {
  daily: genDaily(),
  weekly: genWeekly(),
  monthly: genMonthly(),
  yearly: genYearly()
}

/* ---------- 计算当前表格数据 ---------- */
const tableData = computed(() => mock[activeName.value] || [])

/* ---------- 查询处理 ---------- */
function handleQuery() {
  ElMessage.success('查询条件已提交')
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
      shift: ''
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
      shift: ''
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
      shift: ''
    }
  } else if (activeName.value === 'yearly') {
    yearlyQuery.value = {
      startYear: '',
      endYear: '',
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
function renderChart() {
  if (!chartRef.value) return

  if (!myChart) {
    myChart = echarts.init(chartRef.value)
    window.addEventListener('resize', () => myChart.resize())
  }

  const rows = tableData.value
  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' }
    },
    legend: {
      data: ['良品', '不良品', '良率']
    },
    grid: {
      left: 60,
      right: 60,
      bottom: 60,
      top: 40,
      containLabel: true
    },
    dataZoom: [{
      type: 'inside',
      xAxisIndex: 0
    }],
    xAxis: {
      type: 'category',
      data: rows.map(r => r.date)
    },
    yAxis: [
      {
        type: 'value',
        name: '数量'
      },
      {
        type: 'value',
        name: '良率(%)',
        max: 100,
        position: 'right'
      }
    ],
    series: [
      {
        name: '良品',
        type: 'bar',
        data: rows.map(r => r.good),
        itemStyle: { color: '#67C23A' }
      },
      {
        name: '不良品',
        type: 'bar',
        data: rows.map(r => r.bad),
        itemStyle: { color: '#F56C6C' }
      },
      {
        name: '良率',
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
function handleTabChange() {
  nextTick(renderChart)
}

/* ---------- 生命周期 ---------- */
onMounted(() => {
  handleTabChange()
  ElMessage.success('质量稼动率报表已加载')
})
</script>

<style scoped>
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
