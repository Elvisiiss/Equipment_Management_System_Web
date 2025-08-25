<template>
  <div class="report-container">
    <!-- 维度切换 -->
    <el-tabs v-model="activeName" @tab-change="handleTabChange">
      <el-tab-pane label="日" name="day" />
      <el-tab-pane label="周" name="week" />
      <el-tab-pane label="月" name="month" />
      <el-tab-pane label="年" name="year" />
    </el-tabs>

    <!-- 查询条件区域 -->
    <div class="query-conditions">
      <!-- 日维度查询条件 -->
      <div v-if="activeName === 'day'" class="condition-group">
        <el-form :inline="true" :model="dayQuery" class="demo-form-inline">
          <el-form-item label="开始时间">
            <el-date-picker
                v-model="dayQuery.startDate"
                type="date"
                placeholder="选择开始日期"
                value-format="YYYY-MM-DD"
            />
          </el-form-item>
          <el-form-item label="结束时间">
            <el-date-picker
                v-model="dayQuery.endDate"
                type="date"
                placeholder="选择结束日期"
                value-format="YYYY-MM-DD"
            />
          </el-form-item>
          <el-form-item label="车间">
            <el-select v-model="dayQuery.workshop" placeholder="请选择车间">
              <el-option label="车间一" value="1" />
              <el-option label="车间二" value="2" />
            </el-select>
          </el-form-item>
          <el-form-item label="产线">
            <el-select v-model="dayQuery.productionLine" placeholder="请选择产线">
              <el-option label="产线A" value="A" />
              <el-option label="产线B" value="B" />
            </el-select>
          </el-form-item>
          <el-form-item label="工段">
            <el-select v-model="dayQuery.section" placeholder="请选择工段">
              <el-option label="工段1" value="1" />
              <el-option label="工段2" value="2" />
            </el-select>
          </el-form-item>
          <el-form-item label="设备编码">
            <el-input v-model="dayQuery.deviceCode" placeholder="请输入设备编码" />
          </el-form-item>
          <el-form-item label="设备名称">
            <el-input v-model="dayQuery.deviceName" placeholder="请输入设备名称" />
          </el-form-item>
          <el-form-item label="厂商">
            <el-select v-model="dayQuery.vendor" placeholder="请选择厂商">
              <el-option label="厂商A" value="A" />
              <el-option label="厂商B" value="B" />
            </el-select>
          </el-form-item>
          <el-form-item label="班次">
            <el-select v-model="dayQuery.shift" placeholder="请选择班次">
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
      <div v-if="activeName === 'week'" class="condition-group">
        <el-form :inline="true" :model="weekQuery" class="demo-form-inline">
          <el-form-item label="年份">
            <el-date-picker
                v-model="weekQuery.year"
                type="year"
                placeholder="选择年份"
                value-format="YYYY"
            />
          </el-form-item>
          <el-form-item label="开始周">
            <el-select v-model="weekQuery.startWeek" placeholder="请选择开始周">
              <el-option v-for="w in 52" :key="w" :label="`第${w}周`" :value="w" />
            </el-select>
          </el-form-item>
          <el-form-item label="结束周">
            <el-select v-model="weekQuery.endWeek" placeholder="请选择结束周">
              <el-option v-for="w in 52" :key="w" :label="`第${w}周`" :value="w" />
            </el-select>
          </el-form-item>
          <el-form-item label="车间">
            <el-select v-model="weekQuery.workshop" placeholder="请选择车间">
              <el-option label="车间一" value="1" />
              <el-option label="车间二" value="2" />
            </el-select>
          </el-form-item>
          <el-form-item label="产线">
            <el-select v-model="weekQuery.productionLine" placeholder="请选择产线">
              <el-option label="产线A" value="A" />
              <el-option label="产线B" value="B" />
            </el-select>
          </el-form-item>
          <el-form-item label="工段">
            <el-select v-model="weekQuery.section" placeholder="请选择工段">
              <el-option label="工段1" value="1" />
              <el-option label="工段2" value="2" />
              <el-option label="工段3" value="3" />
            </el-select>
          </el-form-item>
          <el-form-item label="设备编码">
            <el-input v-model="weekQuery.deviceCode" placeholder="请输入设备编码" />
          </el-form-item>
          <el-form-item label="设备名称">
            <el-input v-model="weekQuery.deviceName" placeholder="请输入设备名称" />
          </el-form-item>
          <el-form-item label="厂商">
            <el-select v-model="weekQuery.vendor" placeholder="请选择厂商">
              <el-option label="厂商A" value="A" />
              <el-option label="厂商B" value="B" />
              <el-option label="厂商C" value="C" />
            </el-select>
          </el-form-item>
          <el-form-item label="班次">
            <el-select v-model="weekQuery.shift" placeholder="请选择班次">
              <el-option label="白班" value="day" />
              <el-option label="夜班" value="night" />
              <el-option label="全天" value="all" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleQuery">查询</el-button>
            <el-button @click="resetQuery">重置</el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- 月维度查询条件 -->
      <div v-if="activeName === 'month'" class="condition-group">
        <el-form :inline="true" :model="monthQuery" class="demo-form-inline">
          <el-form-item label="起始月">
            <el-date-picker
                v-model="monthQuery.startMonth"
                type="month"
                placeholder="选择起始月"
                value-format="YYYY-MM"
            />
          </el-form-item>
          <el-form-item label="结束月">
            <el-date-picker
                v-model="monthQuery.endMonth"
                type="month"
                placeholder="选择结束月"
                value-format="YYYY-MM"
            />
          </el-form-item>
          <el-form-item label="车间">
            <el-select v-model="monthQuery.workshop" placeholder="请选择车间">
              <el-option label="车间一" value="1" />
              <el-option label="车间二" value="2" />
              <el-option label="车间三" value="3" />
            </el-select>
          </el-form-item>
          <el-form-item label="产线">
            <el-select v-model="monthQuery.productionLine" placeholder="请选择产线">
              <el-option label="产线A" value="A" />
              <el-option label="产线B" value="B" />
              <el-option label="产线C" value="C" />
            </el-select>
          </el-form-item>
          <el-form-item label="工段">
            <el-select v-model="monthQuery.section" placeholder="请选择工段">
              <el-option label="工段1" value="1" />
              <el-option label="工段2" value="2" />
              <el-option label="工段3" value="3" />
            </el-select>
          </el-form-item>
          <el-form-item label="设备编码">
            <el-input v-model="monthQuery.deviceCode" placeholder="请输入设备编码" />
          </el-form-item>
          <el-form-item label="设备名称">
            <el-input v-model="monthQuery.deviceName" placeholder="请输入设备名称" />
          </el-form-item>
          <el-form-item label="厂商">
            <el-select v-model="monthQuery.vendor" placeholder="请选择厂商">
              <el-option label="厂商A" value="A" />
              <el-option label="厂商B" value="B" />
              <el-option label="厂商C" value="C" />
            </el-select>
          </el-form-item>
          <el-form-item label="班次">
            <el-select v-model="monthQuery.shift" placeholder="请选择班次">
              <el-option label="白班" value="day" />
              <el-option label="夜班" value="night" />
              <el-option label="全天" value="all" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleQuery">查询</el-button>
            <el-button @click="resetQuery">重置</el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- 年维度查询条件 -->
      <div v-if="activeName === 'year'" class="condition-group">
        <el-form :inline="true" :model="yearQuery" class="demo-form-inline">
          <el-form-item label="起始年份">
            <el-date-picker
                v-model="yearQuery.startYear"
                type="year"
                placeholder="选择起始年份"
                value-format="YYYY"
            />
          </el-form-item>
          <el-form-item label="结束年份">
            <el-date-picker
                v-model="yearQuery.endYear"
                type="year"
                placeholder="选择结束年份"
                value-format="YYYY"
            />
          </el-form-item>
          <el-form-item label="车间">
            <el-select v-model="yearQuery.workshop" placeholder="请选择车间">
              <el-option label="车间一" value="1" />
              <el-option label="车间二" value="2" />
              <el-option label="车间三" value="3" />
            </el-select>
          </el-form-item>
          <el-form-item label="产线">
            <el-select v-model="yearQuery.productionLine" placeholder="请选择产线">
              <el-option label="产线A" value="A" />
              <el-option label="产线B" value="B" />
              <el-option label="产线C" value="C" />
            </el-select>
          </el-form-item>
          <el-form-item label="工段">
            <el-select v-model="yearQuery.section" placeholder="请选择工段">
              <el-option label="工段1" value="1" />
              <el-option label="工段2" value="2" />
              <el-option label="工段3" value="3" />
            </el-select>
          </el-form-item>
          <el-form-item label="设备编码">
            <el-input v-model="yearQuery.deviceCode" placeholder="请输入设备编码" />
          </el-form-item>
          <el-form-item label="设备名称">
            <el-input v-model="yearQuery.deviceName" placeholder="请输入设备名称" />
          </el-form-item>
          <el-form-item label="厂商">
            <el-select v-model="yearQuery.vendor" placeholder="请选择厂商">
              <el-option label="厂商A" value="A" />
              <el-option label="厂商B" value="B" />
              <el-option label="厂商C" value="C" />
            </el-select>
          </el-form-item>
          <el-form-item label="班次">
            <el-select v-model="yearQuery.shift" placeholder="请选择班次">
              <el-option label="白班" value="day" />
              <el-option label="夜班" value="night" />
              <el-option label="全天" value="all" />
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
      <el-table-column prop="expected" label="预计运行时间" min-width="120" />
      <el-table-column prop="actual" label="实际运行时间" min-width="120" />
      <el-table-column prop="output" label="产量" min-width="100" />
      <el-table-column prop="rate" label="稼动率(%)" min-width="100" />
    </el-table>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, nextTick, computed } from 'vue'
import * as echarts from 'echarts'
import { ElMessage } from 'element-plus'

const activeName = ref('day')
const chartRef = ref()
let chartInstance = null

// 查询条件
const dayQuery = ref({
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

const weekQuery = ref({
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

const monthQuery = ref({
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

const yearQuery = ref({
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

// 模拟数据（小时为单位）
const mockData = {
  day: [
    { date: '08-16', expected: 24,    actual: 20.5, output: 122191, rate: 85.42 },
    { date: '08-17', expected: 24,    actual: 21.2, output: 175333, rate: 88.33 },
    { date: '08-18', expected: 24,    actual: 22.0, output: 211193, rate: 91.67 },
    { date: '08-19', expected: 24,    actual: 20.8, output: 190000, rate: 86.67 },
    { date: '08-20', expected: 24,    actual: 21.5, output: 200000, rate: 89.58 },
    { date: '08-21', expected: 24,    actual: 22.5, output: 210000, rate: 93.75 },
    { date: '08-22', expected: 24,    actual: 21.0, output: 195000, rate: 87.50 }
  ],
  week: [
    { date: '第34周', expected: 168,   actual: 150,  output: 1200000, rate: 89.29 },
    { date: '第33周', expected: 168,   actual: 145,  output: 1100000, rate: 86.31 },
    { date: '第32周', expected: 168,   actual: 160,  output: 1300000, rate: 95.24 }
  ],
  month: [
    { date: '2025-08', expected: 744,  actual: 680,  output: 5500000, rate: 91.40 },
    { date: '2025-07', expected: 744,  actual: 700,  output: 5800000, rate: 94.09 },
    { date: '2025-06', expected: 720,  actual: 650,  output: 5200000, rate: 90.28 }
  ],
  year: [
    { date: '2025', expected: 8760, actual: 8000, output: 65000000, rate: 91.32 },
    { date: '2024', expected: 8784, actual: 7900, output: 63000000, rate: 89.94 }
  ]
}

// 小时 → xx天xx时xx分
const formatTime = (hours) => {
  const d = Math.floor(hours / 24)
  const h = Math.floor(hours % 24)
  const m = Math.round((hours - Math.floor(hours)) * 60)
  return `${d}天${h.toString().padStart(2, '0')}时${m.toString().padStart(2, '0')}分`
}

// 计算当前表格数据
const tableData = computed(() => {
  const data = mockData[activeName.value] || []
  return data.map(item => ({
    date: item.date,
    expected: formatTime(item.expected),
    actual: formatTime(item.actual),
    output: item.output,
    rate: item.rate.toFixed(2)
  }))
})

// 查询处理
const handleQuery = () => {
  ElMessage.success('查询条件已提交')
  updateChart(mockData[activeName.value])
}

// 重置查询条件
const resetQuery = () => {
  if (activeName.value === 'day') {
    dayQuery.value = {
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
  } else if (activeName.value === 'week') {
    weekQuery.value = {
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
  } else if (activeName.value === 'month') {
    monthQuery.value = {
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
  } else if (activeName.value === 'year') {
    yearQuery.value = {
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

// 更新图表
const updateChart = (data) => {
  if (!chartInstance) return
  const option = {
    title: {
      text: `${activeName.value === 'day' ? '日' : activeName.value === 'week' ? '周' : activeName.value === 'month' ? '月' : '年'}维度稼动率`,
      left: 'center'
    },
    tooltip: { trigger: 'axis', axisPointer: { type: 'cross' } },
    legend: { data: ['预计运行时间', '实际运行时间', '稼动率'], top: 30 },
    grid: { left: 60, right: 60, bottom: 60, top: 80 },
    xAxis: { type: 'category', data: data.map(item => item.date) },
    yAxis: [
      {
        type: 'value',
        name: '小时',
        position: 'left',
        axisLine: { show: true, lineStyle: { color: '#5470c6' } },
        splitLine: { show: false }
      },
      {
        type: 'value',
        name: '稼动率(%)',
        position: 'right',
        axisLine: { show: true, lineStyle: { color: '#ee6666' } },
        splitLine: { show: false },
        min: 0,
        max: 100
      }
    ],
    series: [
      { name: '预计运行时间', type: 'bar', data: data.map(item => item.expected), itemStyle: { color: '#5470c6' } },
      { name: '实际运行时间', type: 'bar', data: data.map(item => item.actual), itemStyle: { color: '#91cc75' } },
      { name: '稼动率', type: 'line', yAxisIndex: 1, data: data.map(item => item.rate), symbol: 'circle', symbolSize: 6, lineStyle: { width: 3, color: '#ee6666' }, itemStyle: { color: '#ee6666' } }
    ]
  }
  chartInstance.setOption(option)
}

// Tab 切换
const handleTabChange = () => {
  nextTick(() => {
    updateChart(mockData[activeName.value])
  })
}

// 初始化图表
onMounted(() => {
  chartInstance = echarts.init(chartRef.value)
  window.addEventListener('resize', () => chartInstance?.resize())
  updateChart(mockData[activeName.value])
  ElMessage.success('性能稼动率报表已加载')
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
