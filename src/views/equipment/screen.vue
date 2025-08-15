<template>
  <!-- 设备监控看板 -->
  <div class="equipment-screen">
    <!-- 第一行：统计卡片 -->
    <el-row :gutter="16">
      <el-col v-for="(card, idx) in statCards" :key="idx" :span="20 / statCards.length">
        <div
            class="stat-card"
            :style="{ backgroundColor: card.color }"
            @click="goManage"
        >
          <div class="stat-title">{{ card.title }}</div>
          <div class="stat-value">{{ card.number }}</div>
        </div>
      </el-col>
    </el-row>

    <!-- 第二行：饼图 -->
    <el-row :gutter="16" style="margin-top: 16px">
      <el-col :span="12">
        <el-card shadow="hover" class="pie-card" @click="goManage">
          <template #header>
            <span>设备类型分布</span>
          </template>
          <div class="pie-wrap">
            <v-chart
                :option="typePieOption"
                autoresize
                style="height: 300px"
            />
          </div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card shadow="hover" class="pie-card" @click="goManage">
          <template #header>
            <span>稼动率分布</span>
          </template>
          <div class="pie-wrap">
            <v-chart
                :option="utilPieOption"
                autoresize
                style="height: 300px"
            />
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 第三行：稼动率趋势 + 停机排名，各占 50% -->
    <el-row :gutter="16" style="margin-top: 16px">
      <el-col :span="12">
        <el-card shadow="hover" class="line-card" @click="goManage">
          <template #header>
            <span>本周稼动率趋势</span>
          </template>
          <div class="line-wrap">
            <v-chart
                :option="lineOption"
                autoresize
                style="height: 300px"
            />
          </div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card shadow="hover" class="msg-card">
          <template #header>
            <span>停机排名</span>
          </template>
          <el-table
              :data="stopRank"
              style="height: 300px"
              size="small"
              stripe
              @row-click="() => goManage()"
          >
            <el-table-column type="index" width="40" />
            <el-table-column
                prop="name"
                label="设备名称"
                show-overflow-tooltip
            />
            <el-table-column
                prop="duration"
                label="时长"
                width="100"
                align="center"
            />
            <el-table-column
                prop="start"
                label="开始时间"
                width="140"
                align="center"
            />
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { ref } from 'vue'
import * as echarts from 'echarts/core'
import { PieChart, LineChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent
} from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import VChart from 'vue-echarts'

// 注册图表
echarts.use([
  PieChart,
  LineChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  CanvasRenderer
])

const router = useRouter()
const goManage = () => {
  router.push('/equipment/monitoring/manage')
}

// 第一行卡片假数据
const statCards = ref([
  { title: '设备总数', number: 120, color: '#409EFF' },
  { title: '运行中', number: 82, color: '#67C23A' },
  { title: '待机', number: 20, color: '#909399' },
  { title: '报警 / 故障', number: 8, color: '#F56C6C' },
  { title: '脱机 / 离线', number: 10, color: '#E6A23C' }
])

// 设备类型饼图
const typePieOption = ref({
  tooltip: { trigger: 'item' },
  legend: { orient: 'vertical', right: 10, top: 'center' },
  series: [
    {
      name: '设备类型',
      type: 'pie',
      radius: ['40%', '70%'],
      label: { show: false, position: 'center' },
      emphasis: {
        label: { show: true, fontSize: 18, fontWeight: 'bold' }
      },
      labelLine: { show: false },
      data: [
        { value: 82, name: '运行中' },
        { value: 20, name: '待机' },
        { value: 8, name: '故障' },
        { value: 10, name: '离线' }
      ]
    }
  ]
})

// 稼动率分布饼图
const utilPieOption = ref({
  tooltip: { trigger: 'item' },
  legend: { orient: 'vertical', right: 10, top: 'center' },
  series: [
    {
      name: '稼动率',
      type: 'pie',
      radius: ['40%', '70%'],
      label: { show: false, position: 'center' },
      emphasis: {
        label: { show: true, fontSize: 18, fontWeight: 'bold' }
      },
      labelLine: { show: false },
      data: [
        { value: 60, name: '90% 以上' },
        { value: 25, name: '80-90%' },
        { value: 20, name: '70-80%' },
        { value: 15, name: '70% 以下' }
      ]
    }
  ]
})

// 本周稼动率折线图
const lineOption = ref({
  tooltip: { trigger: 'axis' },
  xAxis: {
    type: 'category',
    data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
  },
  yAxis: {
    type: 'value',
    axisLabel: { formatter: '{value} %' }
  },
  series: [
    {
      data: [92, 89, 94, 96, 90, 88, 93],
      type: 'line',
      smooth: true,
      symbol: 'circle',
      symbolSize: 8,
      itemStyle: { color: '#409EFF' },
      lineStyle: { width: 3 }
    }
  ]
})

// 停机排名假数据
const stopRank = ref([
  { name: 'C4-51-16', duration: '15小时29分38秒', start: '2025-07-21 23:24:52' },
  { name: 'C4-51-23', duration: '15小时29分38秒', start: '2025-07-21 23:24:52' },
  { name: 'C4-51-24', duration: '15小时29分38秒', start: '2025-07-21 23:24:52' },
  { name: 'C4-51-21', duration: '59分33秒', start: '2025-07-22 13:54:52' },
  { name: 'C4-51-19', duration: '4分38秒', start: '2025-07-22 14:49:52' },
  { name: 'C4-51-26', duration: '48秒', start: '2025-07-22 14:53:42' },
  { name: 'C4-51-22', duration: '36秒', start: '2025-07-22 14:53:52' },
  { name: 'C4-51-31', duration: '36秒', start: '2025-07-22 14:53:54' }
])
</script>

<style scoped>
.equipment-screen {
  height: 100vh;
  padding: 16px;
  background: #f5f7fa;
  display: flex;
  flex-direction: column;
}

/* 统计卡片样式 */
.stat-card {
  height: 100px;
  border-radius: 8px;
  color: #fff;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  cursor: pointer;
}
.stat-title {
  font-size: 14px;
}
.stat-value {
  font-size: 28px;
  font-weight: 600;
  margin-top: 4px;
}

/* 图表卡片 */
.pie-card,
.line-card,
.msg-card {
  height: 100%;
  display: flex;
  flex-direction: column;
}

/* 消息卡片（表格容器） */
.msg-card {
  display: flex;
  flex-direction: column;
}
.msg-card :deep(.el-card__body) {
  flex: 1;
  padding: 0;
}
</style>
