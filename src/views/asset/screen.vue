<template>
  <div class="asset-screen">
    <!-- 第一行：5 张统计卡片（占满一行） -->
    <el-row :gutter="16">
      <el-col v-for="(c, i) in statCards" :key="i" :span="20 / statCards.length">
        <div
            class="stat-card"
            :style="{ backgroundColor: c.color }"
            @click="goToAssetList"
        >
          <div class="stat-title">{{ c.title }}</div>
          <div class="stat-value">{{ c.value }}</div>
        </div>
      </el-col>
    </el-row>

    <!-- 第二行：饼图 -->
    <el-row :gutter="16" style="margin-top: 16px">
      <el-col :span="12">
        <el-card>
          <template #header> 台账类型分布 </template>
          <div ref="typeChartRef" style="height: 300px" />
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card>
          <template #header> 寿命上限分布 </template>
          <div ref="lifeChartRef" style="height: 300px" />
        </el-card>
      </el-col>
    </el-row>

    <!-- 第三行：折线图 & 消息卡片（各占 50%） -->
    <el-row :gutter="16" style="margin-top: 16px">
      <el-col :span="12">
        <el-card>
          <template #header> 资产新增/报废趋势（近 6 个月） </template>
          <div ref="trendChartRef" style="height: 300px" />
        </el-card>
      </el-col>

      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="msg-header">
              <el-tabs v-model="activeMsgTab" class="msg-tabs">
                <el-tab-pane label="审核" name="audit" />
                <el-tab-pane label="寿命" name="life" />
              </el-tabs>
              <el-link
                  type="primary"
                  :underline="false"
                  @click="handleDetailClick"
              >详情</el-link
              >
            </div>
          </template>

          <div class="msg-list">
            <div
                v-for="(msg, i) in currentMsgs"
                :key="i"
                class="msg-item"
                @click="handleDetailClick"
            >
              <span class="msg-text">{{ msg }}</span>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import * as echarts from 'echarts'

const router = useRouter()

/* ------------------ 路由 ------------------ */
const goToAssetList = () => router.push('/asset/manage/list')
const handleDetailClick = () => router.push('/check/list')

/* ------------------ 卡片 ------------------ */
const statCards = ref([
  { title: '设备总数', value: 521, color: '#409EFF' },
  { title: '已验收设备', value: 432, color: '#67C23A' },
  { title: '待验收设备', value: 42, color: '#E6A23C' },
  { title: '设备样机', value: 15, color: '#909399' },
  { title: '设备闲置', value: 32, color: '#F56C6C' }
])

/* ------------------ 消息 ------------------ */
const activeMsgTab = ref('audit')
const auditMsgs = ref([
  '设备编号 EQ-20240512 从 A 车间转移到 B 车间未审批',
  '设备编号 EQ-20240601 从 C 产线转移到 D 产线未审批'
])
const lifeMsgs = ref([
  '设备编号 EQ-20230501 即将到达寿命上限',
  '设备编号 EQ-20230615 预计 30 天后到寿命上限'
])
const currentMsgs = computed(() =>
    activeMsgTab.value === 'audit' ? auditMsgs.value : lifeMsgs.value
)

/* ------------------ 图表 ------------------ */
const typeChartRef = ref()
const lifeChartRef = ref()
const trendChartRef = ref()

const initChart = (dom, option) => {
  const chart = echarts.init(dom)
  chart.setOption(option)
  chart.on('click', goToAssetList)
  return chart
}

onMounted(() => {
  initChart(typeChartRef.value, {
    tooltip: { trigger: 'item' },
    series: [
      {
        type: 'pie',
        radius: '60%',
        data: [
          { name: '已验收', value: 432 },
          { name: '待验收', value: 42 },
          { name: '样机', value: 15 },
          { name: '闲置', value: 32 }
        ]
      }
    ]
  })

  initChart(lifeChartRef.value, {
    tooltip: { trigger: 'item' },
    series: [
      {
        type: 'pie',
        radius: '60%',
        data: [
          { name: '1 年', value: 80 },
          { name: '2 年', value: 150 },
          { name: '3 年', value: 200 },
          { name: '4 年', value: 70 },
          { name: '5 年及以上', value: 21 }
        ]
      }
    ]
  })

  initChart(trendChartRef.value, {
    tooltip: { trigger: 'axis' },
    legend: { data: ['新增', '报废'] },
    xAxis: { type: 'category', data: ['1月', '2月', '3月', '4月', '5月', '6月'] },
    yAxis: { type: 'value' },
    series: [
      { name: '新增', type: 'line', smooth: true, data: [120, 200, 150, 80, 70, 110] },
      { name: '报废', type: 'line', smooth: true, data: [30, 40, 50, 60, 70, 90] }
    ]
  })
})
</script>

<style scoped>
.asset-screen {
  padding: 16px;
}

/* 卡片占满一行 */
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

/* 消息卡片 */
.msg-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.msg-tabs {
  flex: 1;
}
.msg-list {
  max-height: 240px;
  overflow-y: auto;
}
.msg-item {
  padding: 8px 0;
  border-bottom: 1px solid #ebeef5;
  cursor: pointer;
}
.msg-item:last-child {
  border-bottom: none;
}
.msg-text {
  color: #606266;
  font-size: 14px;
}
</style>
