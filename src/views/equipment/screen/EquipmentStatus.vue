<!-- EquipmentDashboard.vue -->
<template>
  <div class="dashboard">
    <!-- 顶部标题 -->
    <h1 class="title">设备状态看板</h1>

    <!-- 第一行：实时监控 -->
    <el-row :gutter="16">
      <el-col :span="24">
        <el-card shadow="hover">
          <template #header>
            <span>实时监控</span>
          </template>
          <div class="realtime">
            <el-tag
                v-for="item in realtimeStatus"
                :key="item.deviceId"
                :type="item.status === 'RUN' ? 'success' : 'danger'"
                effect="dark"
                class="tag"
            >
              {{ item.deviceName }}: {{ item.status }}
            </el-tag>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 第二行：产出报表 & 故障分析报表 -->
    <el-row :gutter="16" style="margin-top: 16px">
      <el-col :span="12">
        <el-card shadow="hover">
          <template #header>设备分时产出报表</template>
          <div ref="outputChart" class="chart"></div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card shadow="hover">
          <template #header>设备维修故障分析报表</template>
          <div ref="faultChart" class="chart"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 第三行：机况看板 & 线况看板 -->
    <el-row :gutter="16" style="margin-top: 16px">
      <el-col :span="12">
        <el-card shadow="hover">
          <template #header>机况看板（设备维度）</template>
          <el-table :data="machineTable" height="300">
            <el-table-column prop="deviceName" label="设备" />
            <el-table-column prop="status" label="状态" />
            <el-table-column prop="output" label="当前产量" />
          </el-table>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card shadow="hover">
          <template #header>线况看板（线别维度）</template>
          <el-table :data="lineTable" height="300">
            <el-table-column prop="lineName" label="线别" />
            <el-table-column prop="status" label="状态" />
            <el-table-column prop="output" label="当前产量" />
          </el-table>
        </el-card>
      </el-col>
    </el-row>

    <!-- 第四行：参数监控 -->
    <el-row :gutter="16" style="margin-top: 16px">
      <el-col :span="24">
        <el-card shadow="hover">
          <template #header>参数监控报表</template>
          <div ref="paramChart" class="chart-lg"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 第五行：宕机分析 & MTBF -->
    <el-row :gutter="16" style="margin-top: 16px">
      <el-col :span="12">
        <el-card shadow="hover">
          <template #header>宕机分析报表</template>
          <div ref="downtimeChart" class="chart"></div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card shadow="hover">
          <template #header>MTBF</template>
          <div ref="mtbfChart" class="chart"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 第六行：MTTR（机台） & MTTR（人员） -->
    <el-row :gutter="16" style="margin-top: 16px">
      <el-col :span="12">
        <el-card shadow="hover">
          <template #header>MTTR（机台）</template>
          <div ref="mttrMachineChart" class="chart"></div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card shadow="hover">
          <template #header>MTTR（人员）</template>
          <div ref="mttrStaffChart" class="chart"></div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { onMounted, ref, nextTick } from 'vue'
import * as echarts from 'echarts'

/* ---------------------------- mock 数据 ---------------------------- */
const realtimeStatus = [
  { deviceId: 1, deviceName: '设备A', status: 'RUN' },
  { deviceId: 2, deviceName: '设备B', status: 'STOP' },
  { deviceId: 3, deviceName: '设备C', status: 'RUN' },
  { deviceId: 4, deviceName: '设备D', status: 'RUN' }
]

const machineTable = Array.from({ length: 6 }, (_, i) => ({
  deviceName: `设备${String.fromCharCode(65 + i)}`,
  status: Math.random() > 0.3 ? '运行中' : '停机',
  output: Math.floor(Math.random() * 200)
}))

const lineTable = Array.from({ length: 3 }, (_, i) => ({
  lineName: `线别${i + 1}`,
  status: Math.random() > 0.3 ? '运行中' : '停机',
  output: Math.floor(Math.random() * 500)
}))

/* ---------------------------- 图表挂载 ---------------------------- */
const outputChart   = ref(null)
const faultChart    = ref(null)
const paramChart    = ref(null)
const downtimeChart = ref(null)
const mtbfChart     = ref(null)
const mttrMachineChart = ref(null)
const mttrStaffChart   = ref(null)

function initBar(el, title, xData, seriesData) {
  const chart = echarts.init(el)
  chart.setOption({
    title: { text: title, left: 'center' },
    tooltip: {},
    xAxis: { type: 'category', data: xData },
    yAxis: { type: 'value' },
    series: [{ type: 'bar', data: seriesData }]
  })
  return chart
}

function initLine(el, title, xData, seriesData) {
  const chart = echarts.init(el)
  chart.setOption({
    title: { text: title, left: 'center' },
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', data: xData },
    yAxis: { type: 'value' },
    series: [{ type: 'line', data: seriesData, smooth: true }]
  })
  return chart
}

onMounted(async () => {
  await nextTick()

  /* 产出报表 */
  initBar(
      outputChart.value,
      '每小时产出',
      Array.from({ length: 24 }, (_, i) => `${i}:00`),
      Array.from({ length: 24 }, () => Math.floor(Math.random() * 100))
  )

  /* 故障分析报表 */
  initBar(
      faultChart.value,
      '故障次数',
      ['电气', '机械', '传感器', '软件', '其他'],
      Array.from({ length: 5 }, () => Math.floor(Math.random() * 20))
  )

  /* 参数监控趋势图 */
  initLine(
      paramChart.value,
      '参数趋势',
      Array.from({ length: 20 }, (_, i) => `T${i}`),
      Array.from({ length: 20 }, () => +(Math.random() * 100).toFixed(1))
  )

  /* 宕机分析 */
  initBar(
      downtimeChart.value,
      '宕机时长（分钟）',
      ['设备A', '设备B', '设备C', '设备D'],
      Array.from({ length: 4 }, () => Math.floor(Math.random() * 120))
  )

  /* MTBF */
  initLine(
      mtbfChart.value,
      'MTBF 趋势（小时）',
      Array.from({ length: 7 }, (_, i) => `第${i + 1}周`),
      Array.from({ length: 7 }, () => Math.floor(Math.random() * 100 + 100))
  )

  /* MTTR 机台 */
  initBar(
      mttrMachineChart.value,
      'MTTR（分钟）',
      ['设备A', '设备B', '设备C', '设备D'],
      Array.from({ length: 4 }, () => Math.floor(Math.random() * 60))
  )

  /* MTTR 人员 */
  initBar(
      mttrStaffChart.value,
      '人员 MTTR（分钟）',
      ['张三', '李四', '王五', '赵六'],
      Array.from({ length: 4 }, () => Math.floor(Math.random() * 60))
  )
})
</script>

<style scoped>
.dashboard {
  padding: 24px;
  background: #f5f7fa;
}
.title {
  text-align: center;
  margin-bottom: 24px;
  font-weight: 600;
  color: #303133;
}
.realtime {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.tag {
  min-width: 120px;
  text-align: center;
}
.chart,
.chart-lg {
  width: 100%;
  height: 300px;
}
.chart-lg {
  height: 400px;
}
</style>
