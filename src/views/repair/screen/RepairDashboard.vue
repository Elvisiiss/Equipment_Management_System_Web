<template>
  <div class="repair-dashboard">
    <div class="header">
      <h1>设备维修管理大屏</h1>
      <div class="time">{{ currentTime }}</div>
    </div>

    <div class="dashboard-content">
      <div class="left-panel">
        <div class="stat-card">
          <h3>今日维修统计</h3>
          <div class="stat-grid">
            <div class="stat-item">
              <div class="stat-value">{{ todayStats.total }}</div>
              <div class="stat-label">总工单</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">{{ todayStats.completed }}</div>
              <div class="stat-label">已完成</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">{{ todayStats.pending }}</div>
              <div class="stat-label">待处理</div>
            </div>
          </div>
        </div>

        <div class="chart-card">
          <h3>MTBF/MTTR趋势</h3>
          <div class="chart-container">
            <v-chart :option="trendChart" style="height: 300px" />
          </div>
        </div>
      </div>

      <div class="center-panel">
        <div class="kanban-card">
          <h3>实时工单看板</h3>
          <RepairKanban :orders="pendingOrders" />
        </div>
      </div>

      <div class="right-panel">
        <div class="ranking-card">
          <h3>维修效率排行</h3>
          <div class="ranking-list">
            <div
                v-for="(item, index) in efficiencyRanking"
                :key="index"
                class="ranking-item"
            >
              <span class="rank">{{ index + 1 }}</span>
              <span class="name">{{ item.name }}</span>
              <span class="score">{{ item.avgTime }}h</span>
            </div>
          </div>
        </div>

        <div class="device-status">
          <h3>设备状态监控</h3>
          <div class="status-grid">
            <div
                v-for="device in deviceStatus"
                :key="device.code"
                class="status-item"
                :class="device.status"
            >
              <div class="device-name">{{ device.name }}</div>
              <div class="device-status">{{ statusText[device.status] }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { use } from 'echarts/core'
import VChart from 'vue-echarts'
import RepairKanban from '@/views/repair/components/RepairKanban.vue'
import repairAPI from '@/api/repairB.js'


use([
  // 引入需要的图表组件
])

const currentTime = ref('')
const todayStats = reactive({ total: 156, completed: 142, pending: 14 })
const pendingOrders = ref([])
const efficiencyRanking = ref([])
const deviceStatus = ref([])

const statusText = {
  normal: '正常',
  warning: '告警',
  error: '故障'
}

const trendChart = reactive({
  xAxis: {
    type: 'category',
    data: ['1月', '2月', '3月', '4月', '5月', '6月']
  },
  yAxis: [
    { type: 'value', name: 'MTBF(h)' },
    { type: 'value', name: 'MTTR(h)' }
  ],
  series: [
    {
      name: 'MTBF',
      type: 'line',
      data: [8760, 8900, 8500, 9200, 9100, 9400]
    },
    {
      name: 'MTTR',
      type: 'line',
      yAxisIndex: 1,
      data: [2.5, 2.3, 2.7, 2.1, 2.2, 2.0]
    }
  ]
})

let timer = null

const updateTime = () => {
  currentTime.value = new Date().toLocaleString('zh-CN')
}

const loadData = async () => {
  try {
    const res = await repairAPI.getRepairStats('today')
    if (res.success) {
      todayStats.total = res.data.totalOrders
      todayStats.completed = res.data.completedOrders
      todayStats.pending = res.data.pendingOrders

      efficiencyRanking.value = res.data.personLoading
      deviceStatus.value = res.data.deviceStats.map(d => ({
        name: d.deviceName,
        code: d.deviceCode,
        status: d.downtime > 5 ? 'error' : d.downtime > 2 ? 'warning' : 'normal'
      }))
    }
  } catch (error) {
    console.error('加载大屏数据失败', error)
  }
}

onMounted(() => {
  updateTime()
  timer = setInterval(updateTime, 1000)
  loadData()

  // 每30秒刷新一次数据
  setInterval(loadData, 30000)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>

<style scoped>
.repair-dashboard {
  height: 100vh;
  background: #0a0e27;
  color: #fff;
  overflow: hidden;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 40px;
  background: linear-gradient(90deg, #1a237e, #0d47a1);
}

.header h1 {
  font-size: 32px;
  font-weight: bold;
}

.time {
  font-size: 24px;
}

.dashboard-content {
  display: grid;
  grid-template-columns: 1fr 2fr 1fr;
  gap: 20px;
  padding: 20px;
  height: calc(100vh - 100px);
}

.left-panel,
.center-panel,
.right-panel {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.stat-card,
.chart-card,
.kanban-card,
.ranking-card,
.device-status {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 20px;
}

.stat-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-top: 20px;
}

.stat-item {
  text-align: center;
}

.stat-value {
  font-size: 36px;
  font-weight: bold;
  color: #4fc3f7;
}

.stat-label {
  font-size: 14px;
  color: #aaa;
  margin-top: 8px;
}

.ranking-item {
  display: flex;
  align-items: center;
  padding: 10px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.rank {
  width: 30px;
  text-align: center;
  font-weight: bold;
  color: #ffd54f;
}

.name {
  flex: 1;
  margin-left: 10px;
}

.score {
  color: #4fc3f7;
}

.status-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.status-item {
  padding: 10px;
  border-radius: 4px;
  text-align: center;
}

.status-item.normal {
  background: rgba(76, 175, 80, 0.2);
  border: 1px solid #4caf50;
}

.status-item.warning {
  background: rgba(255, 193, 7, 0.2);
  border: 1px solid #ffc107;
}

.status-item.error {
  background: rgba(244, 67, 54, 0.2);
  border: 1px solid #f44336;
}

.device-name {
  font-size: 14px;
}

.device-status {
  font-size: 12px;
  margin-top: 4px;
}
</style>
