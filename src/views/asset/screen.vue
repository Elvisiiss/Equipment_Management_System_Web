<template>
  <el-container>
    <el-header class="header">资产数字化运营看板</el-header>

    <el-main class="main">
      <!-- 第一行：资产新增 / 报废 -->
      <el-row :gutter="16">
        <el-col :span="24">
          <el-card shadow="hover">
            <template #header>
              <span>资产新增 / 报废情况</span>
            </template>
            <v-chart
                autoresize
                :option="addScrapOption"
                style="height: 300px"
            />
          </el-card>
        </el-col>
      </el-row>

      <!-- 第二行：台账类型 + 寿命分布 -->
      <el-row :gutter="16" style="margin-top: 16px">
        <el-col :span="12">
          <el-card shadow="hover">
            <template #header>
              <span>台账类型分布</span>
            </template>
            <v-chart :option="ledgerPieOption" autoresize style="height: 300px" />
          </el-card>
        </el-col>
        <el-col :span="12">
          <el-card shadow="hover">
            <template #header>
              <span>寿命分布</span>
            </template>
            <v-chart :option="lifeBarOption" autoresize style="height: 300px" />
          </el-card>
        </el-col>
      </el-row>

      <!-- 第三行：车间布局 -->
      <el-row :gutter="16" style="margin-top: 16px">
        <el-col :span="24">
          <el-card shadow="hover">
            <template #header>
              <span>车间布局</span>
            </template>
            <div class="workshop-wrapper">
              <!-- SVG 点位图示例 -->
              <svg viewBox="0 0 800 400" class="workshop-svg">
                <rect
                    v-for="r in workshopRects"
                    :key="r.id"
                    :x="r.x"
                    :y="r.y"
                    :width="r.w"
                    :height="r.h"
                    :class="{ active: r.id === activeRect }"
                    @click="onRectClick(r)"
                />
                <text
                    v-for="r in workshopRects"
                    :key="'t' + r.id"
                    :x="r.x + r.w / 2"
                    :y="r.y + r.h / 2"
                    text-anchor="middle"
                    dominant-baseline="middle"
                    class="rect-text"
                >
                  {{ r.name }}
                </text>
              </svg>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <!-- 第四行：业务模块使用统计 -->
      <el-row :gutter="16" style="margin-top: 16px">
        <el-col
            v-for="mod in moduleUsage"
            :key="mod.name"
            :span="6"
        >
          <el-card shadow="hover" class="module-card">
            <div class="module-title">{{ mod.name }}</div>
            <v-chart
                :option="getGaugeOption(mod.value)"
                autoresize
                style="height: 160px"
            />
            <div class="module-desc">日活：{{ mod.dau }}</div>
          </el-card>
        </el-col>
      </el-row>
    </el-main>
  </el-container>
</template>

<script setup>
/* ========= 依赖 ========= */
import { ref, reactive, onMounted } from 'vue'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import {
  LineChart,
  PieChart,
  BarChart,
  GaugeChart
} from 'echarts/charts'
import {
  GridComponent,
  TooltipComponent,
  LegendComponent,
  TitleComponent,
  ToolboxComponent
} from 'echarts/components'
import VChart from 'vue-echarts'

use([
  CanvasRenderer,
  LineChart,
  PieChart,
  BarChart,
  GaugeChart,
  GridComponent,
  TooltipComponent,
  LegendComponent,
  TitleComponent,
  ToolboxComponent
])

/* ========= 模拟接口 ========= */
const mockApi = () =>
    new Promise(resolve => {
      setTimeout(() => {
        resolve({
          addScrap: {
            months: ['1月', '2月', '3月', '4月', '5月', '6月'],
            add: [120, 132, 101, 134, 90, 230],
            scrap: [20, 32, 21, 54, 30, 80]
          },
          ledgerType: [
            { name: '生产设备', value: 45 },
            { name: '测试设备', value: 25 },
            { name: '办公设备', value: 15 },
            { name: 'IT 设备', value: 15 }
          ],
          lifeDist: {
            x: ['<1年', '1-3年', '3-5年', '5-10年', '>10年'],
            y: [40, 120, 90, 70, 60]
          },
          modules: [
            { name: '资产台账', value: 78, dau: 345 },
            { name: '维保管理', value: 65, dau: 210 },
            { name: '备件管理', value: 52, dau: 156 },
            { name: '报表中心', value: 88, dau: 421 }
          ]
        })
      }, 300)
    })

/* ========= 资产新增 / 报废 ========= */
const addScrapOption = reactive({
  title: { text: '近 6 个月趋势', left: 'center' },
  tooltip: { trigger: 'axis' },
  legend: { data: ['新增', '报废'], bottom: 0 },
  xAxis: { type: 'category', data: [] },
  yAxis: { type: 'value' },
  series: [
    { name: '新增', type: 'line', smooth: true, data: [] },
    { name: '报废', type: 'line', smooth: true, data: [] }
  ]
})

/* ========= 台账类型饼图 ========= */
const ledgerPieOption = reactive({
  tooltip: { trigger: 'item' },
  legend: { orient: 'vertical', left: 'left' },
  series: [
    {
      type: 'pie',
      radius: '60%',
      center: ['50%', '50%'],
      data: [],
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 0, 0, 0.5)'
        }
      }
    }
  ]
})

/* ========= 寿命柱状图 ========= */
const lifeBarOption = reactive({
  tooltip: {},
  xAxis: { type: 'category', data: [] },
  yAxis: { type: 'value' },
  series: [{ type: 'bar', data: [], itemStyle: { color: '#91cc75' } }]
})

/* ========= 车间布局 ========= */
const workshopRects = ref([
  { id: 1, name: 'CNC 区', x: 50, y: 50, w: 160, h: 120 },
  { id: 2, name: '装配区', x: 250, y: 50, w: 160, h: 120 },
  { id: 3, name: '质检区', x: 450, y: 50, w: 160, h: 120 },
  { id: 4, name: '仓储区', x: 650, y: 50, w: 100, h: 120 },
  { id: 5, name: '办公区', x: 50, y: 200, w: 700, h: 100 }
])
const activeRect = ref(null)
const onRectClick = rect => (activeRect.value = rect.id)

/* ========= 业务模块使用 ========= */
const moduleUsage = ref([])
const getGaugeOption = value => ({
  series: [
    {
      type: 'gauge',
      radius: '100%',
      startAngle: 180,
      endAngle: 0,
      min: 0,
      max: 100,
      axisLine: {
        lineStyle: {
          width: 12,
          color: [[1, '#E6EBF8']]
        }
      },
      progress: {
        show: true,
        width: 12,
        itemStyle: { color: '#5470c6' }
      },
      pointer: { show: false },
      axisTick: { show: false },
      splitLine: { show: false },
      axisLabel: { show: false },
      detail: {
        valueAnimation: true,
        offsetCenter: [0, '70%'],
        fontSize: 20,
        formatter: '{value}%'
      },
      data: [{ value }]
    }
  ]
})

/* ========= 初始化 ========= */
onMounted(async () => {
  const data = await mockApi()

  // 新增 / 报废
  addScrapOption.xAxis.data = data.addScrap.months
  addScrapOption.series[0].data = data.addScrap.add
  addScrapOption.series[1].data = data.addScrap.scrap

  // 台账类型
  ledgerPieOption.series[0].data = data.ledgerType

  // 寿命分布
  lifeBarOption.xAxis.data = data.lifeDist.x
  lifeBarOption.series[0].data = data.lifeDist.y

  // 业务模块
  moduleUsage.value = data.modules
})
</script>

<style scoped>
.header {
  background: #001529;
  color: #fff;
  font-size: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.main {
  padding: 16px;
  background: #f0f2f5;
}

/* 车间布局 */
.workshop-wrapper {
  display: flex;
  justify-content: center;
  background: #fafafa;
}
.workshop-svg {
  width: 100%;
  max-width: 800px;
  height: 300px;
}
.workshop-svg rect {
  fill: #5470c6;
  stroke: #fff;
  stroke-width: 2;
  cursor: pointer;
  transition: fill 0.3s;
}
.workshop-svg rect.active,
.workshop-svg rect:hover {
  fill: #91cc75;
}
.rect-text {
  fill: #fff;
  font-size: 14px;
  pointer-events: none;
}

/* 业务模块卡片 */
.module-card {
  text-align: center;
}
.module-title {
  font-size: 16px;
  margin-bottom: 8px;
  font-weight: 600;
}
.module-desc {
  color: #666;
  font-size: 14px;
}
</style>
