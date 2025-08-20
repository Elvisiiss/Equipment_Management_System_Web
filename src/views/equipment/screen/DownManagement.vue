<template>
  <div class="mtbf-app">
    <!-- 查询面板 -->
    <el-card shadow="hover" class="filter-card">
      <el-form :model="query" inline size="small" label-width="90px">
        <!-- 时间维度 -->
        <el-form-item label="时间维度">
          <el-radio-group v-model="query.timeType" @change="handleTimeTypeChange">
            <el-radio-button label="day">日</el-radio-button>
            <el-radio-button label="week">周</el-radio-button>
            <el-radio-button label="month">月</el-radio-button>
            <el-radio-button label="year">年</el-radio-button>
          </el-radio-group>
        </el-form-item>

        <!-- 起止时间（并排） -->
        <el-form-item label="开始时间">
          <el-date-picker
              v-if="query.timeType==='day'"
              v-model="query.startDate"
              type="date"
              placeholder="开始日期"
              style="width:140px"
          />
          <el-date-picker
              v-if="query.timeType==='month'"
              v-model="query.startMonth"
              type="month"
              placeholder="开始月份"
              style="width:140px"
          />
          <el-date-picker
              v-if="query.timeType==='year'"
              v-model="query.startYear"
              type="year"
              placeholder="开始年份"
              style="width:140px"
          />
        </el-form-item>

        <el-form-item label="结束时间">
          <el-date-picker
              v-if="query.timeType==='day'"
              v-model="query.endDate"
              type="date"
              placeholder="结束日期"
              style="width:140px"
          />
          <el-date-picker
              v-if="query.timeType==='month'"
              v-model="query.endMonth"
              type="month"
              placeholder="结束月份"
              style="width:140px"
          />
          <el-date-picker
              v-if="query.timeType==='year'"
              v-model="query.endYear"
              type="year"
              placeholder="结束年份"
              style="width:140px"
          />
        </el-form-item>

        <!-- 车间 -->
        <el-form-item label="车间">
          <el-select v-model="query.workshop" clearable placeholder="全部车间" @change="changeWorkshop">
            <el-option v-for="w in dict.workshops" :key="w.id" :label="w.name" :value="w.id" />
          </el-select>
        </el-form-item>

        <!-- 产线 -->
        <el-form-item label="产线">
          <el-select v-model="query.productionLine" clearable placeholder="全部产线" @change="changeProductionLine">
            <el-option v-for="l in dict.productionLines" :key="l.id" :label="l.name" :value="l.id" />
          </el-select>
        </el-form-item>

        <!-- 工段 -->
        <el-form-item label="工段">
          <el-select v-model="query.workSection" clearable placeholder="全部工段" @change="changeWorkSection">
            <el-option v-for="s in dict.workSections" :key="s.id" :label="s.name" :value="s.id" />
          </el-select>
        </el-form-item>

        <!-- 设备设备（远程搜索） -->
        <el-form-item label="设备">
          <el-select
              v-model="query.machine"
              filterable
              remote
              clearable
              reserve-keyword
              placeholder="输入关键字搜索设备"
              :remote-method="remoteMachine"
              :loading="machineLoading"
          >
            <el-option v-for="m in dict.machines" :key="m.id" :label="m.name" :value="m.id" />
          </el-select>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="fetchData">查询</el-button>
          <el-button @click="reset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 图表 -->
    <el-card shadow="hover" class="chart-card">
      <div ref="chartRef" style="height:400px" />
    </el-card>

    <!-- 明细表 -->
    <el-card shadow="hover">
      <el-table :data="tableData" border stripe size="small" style="width:100%">
        <el-table-column prop="machineName" label="设备名称" width="180" fixed />
        <el-table-column prop="workshopName" label="车间" width="120" />
        <el-table-column prop="productionLineName" label="产线" width="120" />
        <el-table-column prop="mtbf" label="MTBF(h)" width="100" sortable />
        <el-table-column prop="mttrHuman" label="人员MTTR(h)" width="110" sortable />
        <el-table-column prop="mttrDevice" label="设备MTTR(h)" width="110" sortable />
        <el-table-column prop="failureCnt" label="故障次数" width="100" sortable />
        <el-table-column prop="totalRunTime" label="总运行时长(h)" width="120" sortable />
        <el-table-column prop="totalRepairTime" label="总修复时长(h)" width="120" sortable />
        <el-table-column fixed="right" label="操作" width="100">
          <template #default="{row}">
            <el-button type="text" @click="openDetail(row)">明细</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 故障明细抽屉 -->
    <el-drawer v-model="detailVisible" :title="detailTitle" direction="rtl" size="60%">
      <el-table :data="detailTable" border stripe size="small" max-height="calc(100vh - 120px)">
        <el-table-column prop="failureTime" label="故障时间" width="160" />
        <el-table-column prop="restoreTime" label="恢复时间" width="160" />
        <el-table-column prop="repairTime" label="修复时长(h)" width="110" />
        <el-table-column prop="description" label="故障描述" />
      </el-table>
    </el-drawer>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick } from 'vue'
import * as echarts from 'echarts'

/* -------------------- 查询条件 -------------------- */
const query = reactive({
  timeType: 'day',
  startDate: '',
  endDate: '',
  startMonth: '',
  endMonth: '',
  startYear: '',
  endYear: '',
  workshop: '',
  productionLine: '',
  workSection: '',
  machine: ''
})

/* 字典（下拉） */
const dict = reactive({
  workshops: [],
  productionLines: [],
  workSections: [],
  machines: []
})

/* 模拟接口：获取车间 */
function getWorkshops() {
  return Promise.resolve([
    { id: 'WS1', name: '冲压车间' },
    { id: 'WS2', name: '焊装车间' },
    { id: 'WS3', name: '涂装车间' }
  ])
}

/* 模拟接口：根据车间查产线 */
function getProductionLines(workshopId) {
  const map = {
    WS1: [{ id: 'PL1-1', name: '冲压一线' }, { id: 'PL1-2', name: '冲压二线' }],
    WS2: [{ id: 'PL2-1', name: '焊装一线' }, { id: 'PL2-2', name: '焊装二线' }],
    WS3: [{ id: 'PL3-1', name: '涂装一线' }]
  }
  return Promise.resolve(map[workshopId] || [])
}

/* 模拟接口：根据产线查工段 */
function getWorkSections(lineId) {
  const map = {
    'PL1-1': [{ id: 'SEC1', name: '冲压A段' }],
    'PL2-1': [{ id: 'SEC2', name: '焊装A段' }]
  }
  return Promise.resolve(map[lineId] || [])
}

/* 模拟远程搜索设备 */
const machineLoading = ref(false)
function remoteMachine(keyword) {
  if (!keyword) {
    dict.machines = []
    return
  }
  machineLoading.value = true
  // 模拟后端分页搜索
  setTimeout(() => {
    dict.machines = Array.from({ length: 20 }).map((_, i) => ({
      id: `M${keyword}_${i}`,
      name: `设备-${keyword}_${i}`
    }))
    machineLoading.value = false
  }, 300)
}

/* 级联联动 */
async function changeWorkshop() {
  query.productionLine = ''
  query.workSection = ''
  query.machine = ''
  dict.productionLines = []
  dict.workSections = []
  dict.machines = []
  if (query.workshop) {
    dict.productionLines = await getProductionLines(query.workshop)
  }
}
async function changeProductionLine() {
  query.workSection = ''
  query.machine = ''
  dict.workSections = []
  dict.machines = []
  if (query.productionLine) {
    dict.workSections = await getWorkSections(query.productionLine)
  }
}
function changeWorkSection() {
  query.machine = ''
  dict.machines = []
}

/* -------------------- 图表&表格 -------------------- */
const chartRef = ref(null)
let chartIns = null
const tableData = ref([])

/* 模拟图表+表格数据 */
async function fetchData() {
  // 这里用 setTimeout 模拟接口
  await new Promise(r => setTimeout(r, 300))
  const mock = Array.from({ length: 15 }).map((_, i) => ({
    machineId: `M${i}`,
    machineName: `设备-${i}`,
    workshopName: '冲压车间',
    productionLineName: '冲压一线',
    mtbf: (Math.random() * 400 + 100).toFixed(2),
    mttrHuman: (Math.random() * 5 + 1).toFixed(2),    // 人员 MTTR
    mttrDevice: (Math.random() * 3 + 0.5).toFixed(2), // 设备 MTTR
    failureCnt: Math.floor(Math.random() * 10 + 1),
    totalRunTime: (Math.random() * 8000 + 2000).toFixed(2),
    totalRepairTime: (Math.random() * 30 + 5).toFixed(2)
  }))
  tableData.value = mock
  renderChart(mock)
}

function renderChart(data) {
  nextTick(() => {
    if (!chartIns) chartIns = echarts.init(chartRef.value)
    const x = data.map(d => d.machineName)
    const mtbf = data.map(d => +d.mtbf)
    const mttrHuman = data.map(d => +d.mttrHuman)
    const mttrDevice = data.map(d => +d.mttrDevice)
    chartIns.setOption({
      tooltip: { trigger: 'axis', axisPointer: { type: 'cross' } },
      legend: { data: ['MTBF', '人员MTTR', '设备MTTR'] },
      grid: { left: 40, right: 40, bottom: 60, top: 40, containLabel: true },
      xAxis: { type: 'category', data: x, axisLabel: { interval: 0, rotate: 45 } },
      yAxis: [
        { type: 'value', name: 'MTBF(h)', position: 'left' },
        { type: 'value', name: 'MTTR(h)', position: 'right' }
      ],
      series: [
        { name: 'MTBF', type: 'line', data: mtbf },
        { name: '人员MTTR', type: 'line', yAxisIndex: 1, data: mttrHuman },
        { name: '设备MTTR', type: 'line', yAxisIndex: 1, data: mttrDevice }
      ]
    })
  })
}

/* -------------------- 下钻 -------------------- */
const detailVisible = ref(false)
const detailTitle = ref('')
const detailTable = ref([])
function openDetail(row) {
  detailTitle.value = `${row.machineName} 故障明细`
  // 模拟明细
  detailTable.value = Array.from({ length: 5 }).map((_, i) => ({
    failureTime: `2025-07-0${i + 1} 09:00`,
    restoreTime: `2025-07-0${i + 1} 12:00`,
    repairTime: (Math.random() * 5 + 1).toFixed(2),
    description: `故障描述${i + 1}`
  }))
  detailVisible.value = true
}

/* -------------------- 初始化&重置 -------------------- */
onMounted(async () => {
  dict.workshops = await getWorkshops()
  fetchData()
})

function reset() {
  Object.assign(query, {
    timeType: 'day',
    startDate: '',
    endDate: '',
    startMonth: '',
    endMonth: '',
    startYear: '',
    endYear: '',
    workshop: '',
    productionLine: '',
    workSection: '',
    machine: ''
  })
  dict.productionLines = []
  dict.workSections = []
  dict.machines = []
  fetchData()
}
</script>

<style scoped>
.mtbf-app {
  padding: 20px;
  background: #f5f7fa;
  min-height: 100vh;
}
.filter-card {
  margin-bottom: 20px;
}
.chart-card {
  margin-bottom: 20px;
}
</style>
