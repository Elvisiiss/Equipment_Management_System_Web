<!-- RealtimeMonitor.vue -->
<template>
  <!-- 实时状态监控平台 - 科技风 -->
  <div class="monitor-screen">
    <!-- 顶部导航栏 -->
    <div class="navbar">
      <div class="nav-item">时间 {{ currentTime }}</div>
      <h1 class="title">实时状态监控平台</h1>
      <div class="nav-item">
        <!-- 全屏按钮 -->
        <el-button type="text" @click="handleFullScreenChange" :icon="FullScreen" class="fullscreen-btn" />
      </div>
    </div>

    <!-- 状态卡片 -->
    <div class="status-cards">
      <div class="card" style="background-color: #4F52D7FF;">设备总数 {{ deviceCount }}</div>
      <div class="card" style="background-color: #4CAF50;">运行中 {{ runningCount }}</div>
      <div class="card" style="background-color: #E6A23C;">警告 {{ warningCount }}</div>
      <div class="card" style="background-color: #D32F2F;">离线 {{ offlineCount }}</div>
    </div>

    <!-- 设备运行看板 -->
    <el-card class="section chart-card">
      <template #header>
        <div class="chart-header">
          <span class="section-title">
            <el-icon><Monitor /></el-icon>
            设备运行看板
          </span>
          <el-button type="text" @click="goManage">详情</el-button>
        </div>
      </template>
      <el-row :gutter="20">
        <el-col :span="12">
          <h3>车间设备实时监控</h3>
          <el-scrollbar height="320px">
            <div
                v-for="d in devices"
                :key="d.id"
                class="device-item"
            >
              <div>
                <div class="device-name">{{ d.name }}</div>
                <div class="device-location">
                  <el-icon><Location /></el-icon>
                  {{ d.location }}
                </div>
              </div>
              <el-tag
                  :type="
                  d.status === '运行中'
                    ? 'success'
                    : d.status === '离线'
                    ? 'danger'
                    : 'warning'
                "
              >{{ d.status }}</el-tag
              >
            </div>
          </el-scrollbar>
        </el-col>
        <el-col :span="12">
          <h3>资产位置图</h3>
          <div class="map-container">
            <div
                v-for="d in devices"
                :key="'map-' + d.id"
                class="device-marker"
                :class="{
                'marker-online': d.status === '运行中',
                'marker-offline': d.status === '离线',
                'marker-warning': d.status === '警告'
              }"
                :style="{ left: d.position.x + '%', top: d.position.y + '%' }"
                :title="d.name"
            ></div>
          </div>
        </el-col>
      </el-row>
    </el-card>

    <!-- 状态趋势分析 -->
    <el-card class="section chart-card">
      <template #header>
        <div class="chart-header">
          <span class="section-title">
            <el-icon><TrendCharts /></el-icon>
            状态趋势分析
          </span>
          <el-button type="text" @click="goManage">详情</el-button>
        </div>
      </template>
      <el-row :gutter="20">
        <el-col
            v-for="(item, key) in trendCards"
            :key="key"
            :span="6"
        >
          <div class="trend-card">
            <div class="icon-wrapper" :style="{ color: item.color }">
              <el-icon :size="36"><component :is="item.icon" /></el-icon>
            </div>
            <div class="data-wrapper">
              <div class="data-value">
                {{ item.value
                }}<span class="unit">{{ item.unit }}</span>
              </div>
              <div class="data-label">{{ item.label }}</div>
              <div
                  class="trend"
                  :class="item.trend > 0 ? 'up' : 'down'"
              >
                {{ item.trend > 0 ? '↑' : '↓' }}
                {{ Math.abs(item.trend) }}%
              </div>
            </div>
          </div>
        </el-col>
      </el-row>
    </el-card>

    <!-- 实时数据查看 -->
    <el-card class="section chart-card">
      <template #header>
        <div class="chart-header">
          <div class="table-header">
            <span class="section-title">
              <el-icon><DataAnalysis /></el-icon>
              实时数据查看
            </span>
            <el-button type="primary" @click="drawer = true" size="small">
              自定义字段
            </el-button>
          </div>
          <el-button type="text" @click="goManage">详情</el-button>
        </div>
      </template>

      <el-table
          :data="realtimeData"
          style="width: 100%"
          max-height="400"
          stripe
          class="data-table"
      >
        <el-table-column
            v-for="col in selectedColumns"
            :key="col.prop"
            :prop="col.prop"
            :label="col.label"
        >
          <template v-if="col.prop === 'status'" #default="scope">
            <el-tag
                :type="
                scope.row.status === '正常'
                  ? 'success'
                  : scope.row.status === '警告'
                  ? 'warning'
                  : 'danger'
              "
            >{{ scope.row.status }}</el-tag
            >
          </template>
          <template v-else-if="col.prop === 'value'" #default="scope">
            {{ scope.row.value }} {{ scope.row.unit }}
          </template>
        </el-table-column>
      </el-table>

      <div class="update-time">
        最后更新时间：{{ lastUpdateTime }}
      </div>
    </el-card>

    <!-- 自定义字段抽屉 -->
    <el-drawer
        v-model="drawer"
        title="自定义字段"
        direction="rtl"
        size="300"
        class="custom-drawer"
    >
      <el-checkbox-group v-model="checkedColumns">
        <el-checkbox
            v-for="col in allColumns"
            :key="col.prop"
            :label="col.prop"
        >{{ col.label }}</el-checkbox
        >
      </el-checkbox-group>
    </el-drawer>
  </div>
</template>

<script setup>
import {ref, computed, onMounted, onBeforeUnmount, inject} from 'vue'
import { useRouter } from 'vue-router'
import {
  Monitor,
  Location,
  TrendCharts,
  DataAnalysis,
  Sunny,
  Cpu,
  PieChart,
  WindPower,
  FullScreen
} from '@element-plus/icons-vue'

const router = useRouter()
const goManage = () => {
  router.push('/equipment/monitoring/manage')
}

// 实时时钟
const currentTime = ref('')
let timer = null

const updateTime = () => {
  const now = new Date()
  const year = now.getFullYear()
  const month = (now.getMonth() + 1).toString().padStart(2, '0')
  const day = now.getDate().toString().padStart(2, '0')
  const hours = now.getHours().toString().padStart(2, '0')
  const minutes = now.getMinutes().toString().padStart(2, '0')
  const seconds = now.getSeconds().toString().padStart(2, '0')
  currentTime.value = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

onMounted(() => {
  updateTime()
  timer = setInterval(updateTime, 1000)
})

onBeforeUnmount(() => {
  if (timer) clearInterval(timer)
})

// 注入全局全屏状态和方法
const isFullScreen = inject('isFullScreen')
const toggleFullScreen = inject('toggleFullScreen')

// 移除原有的fullScreen变量和本地切换逻辑
const handleFullScreenChange = () => {
  toggleFullScreen() // 使用全局切换方法
}

/* ---------- 设备看板 ---------- */
const devices = ref([
  {
    id: 1,
    name: '数控机床-1',
    location: 'A车间-工位1',
    status: '运行中',
    position: {
      x: Math.min(90, Math.max(10, 20)),
      y: Math.min(90, Math.max(10, 30))
    }
  },
  {
    id: 2,
    name: '冲压机-2',
    location: 'B车间-工位3',
    status: '运行中',
    position: {
      x: Math.min(90, Math.max(10, 40)),
      y: Math.min(90, Math.max(10, 50))
    }
  },
  {
    id: 3,
    name: '注塑机-3',
    location: 'C车间-工位2',
    status: '警告',
    position: {
      x: Math.min(90, Math.max(10, 60)),
      y: Math.min(90, Math.max(10, 25))
    }
  },
  {
    id: 4,
    name: '装配线-1',
    location: 'D车间-工位1',
    status: '离线',
    position: {
      x: Math.min(90, Math.max(10, 80)),
      y: Math.min(90, Math.max(10, 60))
    }
  },
  {
    id: 5,
    name: '检测设备-1',
    location: '质检区-工位1',
    status: '运行中',
    position: {
      x: Math.min(90, Math.max(10, 30)),
      y: Math.min(90, Math.max(10, 70))
    }
  }
])

// 设备状态统计
const deviceCount = computed(() => devices.value.length)
const runningCount = computed(() => devices.value.filter(d => d.status === '运行中').length)
const warningCount = computed(() => devices.value.filter(d => d.status === '警告').length)
const offlineCount = computed(() => devices.value.filter(d => d.status === '离线').length)

/* ---------- 趋势卡片 ---------- */
const trendCards = ref({
  vibration: {
    icon: Cpu,
    label: '振动值',
    value: '2.3',
    unit: ' mm/s',
    color: '#409eff',
    trend: 5.2
  },
  temperature: {
    icon: Sunny,
    label: '温度',
    value: '45',
    unit: ' °C',
    color: '#f56c6c',
    trend: -2.1
  },
  pressure: {
    icon: PieChart,
    label: '压力',
    value: '5.2',
    unit: ' bar',
    color: '#67c23a',
    trend: 1.5
  },
  flow: {
    icon: WindPower,
    label: '流量',
    value: '120',
    unit: ' L/min',
    color: '#e6a23c',
    trend: 0.8
  }
})

/* ---------- 实时表格 ---------- */
const allColumns = [
  { prop: 'time', label: '时间' },
  { prop: 'device', label: '设备名称' },
  { prop: 'parameter', label: '参数' },
  { prop: 'value', label: '数值' },
  { prop: 'status', label: '状态' }
]

const checkedColumns = ref(allColumns.map(c => c.prop))
const selectedColumns = computed(() =>
    allColumns.filter(col => checkedColumns.value.includes(col.prop))
)

const realtimeData = ref([])
const lastUpdateTime = ref('')
const drawer = ref(false)

let dataTimer = null
const updateData = () => {
  // 模拟数据
  const now = new Date()
  lastUpdateTime.value = now.toLocaleString('zh-CN')

  realtimeData.value.unshift({
    time: now.toLocaleTimeString('zh-CN'),
    device: devices.value[Math.floor(Math.random() * devices.value.length)].name,
    parameter: ['温度', '压力', '转速', '流量'][Math.floor(Math.random() * 4)],
    value: (Math.random() * 100).toFixed(1),
    unit: ['°C', 'bar', 'rpm', 'L/min'][Math.floor(Math.random() * 4)],
    status: ['正常', '正常', '正常', '警告', '异常'][Math.floor(Math.random() * 5)]
  })
  realtimeData.value = realtimeData.value.slice(0, 20)

  // 更新趋势卡片
  Object.keys(trendCards.value).forEach(key => {
    const delta = ((Math.random() - 0.5) * 2).toFixed(1)
    trendCards.value = {
      ...trendCards.value,
      [key]: {
        ...trendCards.value[key],
        value: (parseFloat(trendCards.value[key].value) + parseFloat(delta) * 0.1).toFixed(1),
        trend: (Math.random() * 10 - 5).toFixed(1)
      }
    }
  })
}

onMounted(() => {
  updateData()
  dataTimer = setInterval(updateData, 3000)
})

onBeforeUnmount(() => {
  if (dataTimer) {
    clearInterval(dataTimer)
    dataTimer = null
  }
  if (timer) clearInterval(timer)
})
</script>

<style scoped lang="scss">
.monitor-screen {
  height: 100vh;
  padding: 16px;
  background: linear-gradient(135deg, #0f0c29, #302b63, #24243e);
  display: flex;
  flex-direction: column;
  color: #fff;
  overflow: auto;

  .navbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 20px;
    padding: 0 50px;
    background-color: #1a2b40;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);

    .nav-item {
      font-size: 14px;
      color: #fff;
      margin-right: 20px;
      display: flex;
      align-items: center;
    }

    .title {
      font-size: 24px;
      font-weight: bold;
      margin: 0 20px;
    }
  }

  // 状态卡片
  .status-cards {
    display: flex;
    justify-content: space-between;
    margin-bottom: 20px;
    width: 100%;

    .card {
      flex: 1;
      margin: 0 5px;
      padding: 15px 10px;
      border-radius: 8px;
      color: #fff;
      text-align: center;
      transition: all 0.3s;
      font-size: 16px;
      font-weight: bold;
      min-width: 0;

      &:first-child {
        margin-left: 0;
      }

      &:last-child {
        margin-right: 0;
      }

      &:hover {
        transform: translateY(-3px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
      }
    }
  }

  .section {
    margin-bottom: 20px;
    background: rgba(16, 42, 87, 0.5);
    border: 1px solid rgba(64, 158, 255, 0.3);
    box-shadow: 0 0 10px rgba(64, 158, 255, 0.1);

    :deep(.el-card__header) {
      padding: 10px 16px;
      border-bottom: 1px solid rgba(64, 158, 255, 0.2);
      background: transparent;
    }
  }

  .chart-card {
    .chart-header {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .section-title {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 18px;
        font-weight: 600;
      }
    }
  }

  .device-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 0;
    border-bottom: 1px solid rgba(64, 158, 255, 0.1);
  }

  .device-name {
    font-weight: 600;
  }

  .device-location {
    font-size: 14px;
    color: #909399;
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .map-container {
    position: relative;
    height: 320px;
    background: rgba(16, 42, 87, 0.3);
    border-radius: 4px;
    overflow: hidden;
    border: 1px solid rgba(64, 158, 255, 0.2);
  }

  .device-marker {
    position: absolute;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    cursor: pointer;
    transition: transform 0.3s;
    box-shadow: 0 0 5px rgba(255, 255, 255, 0.5);
  }

  .device-marker:hover {
    transform: scale(1.5);
  }

  .marker-online {
    background: #67c23a;
  }

  .marker-offline {
    background: #f56c6c;
  }

  .marker-warning {
    background: #e6a23c;
  }

  .trend-card {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 20px;
    background: rgba(16, 42, 87, 0.3);
    border-radius: 8px;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
    border: 1px solid rgba(64, 158, 255, 0.2);
  }

  .icon-wrapper {
    flex-shrink: 0;
  }

  .data-wrapper {
    flex: 1;
  }

  .data-value {
    font-size: 28px;
    font-weight: bold;
  }

  .unit {
    font-size: 14px;
    color: #909399;
  }

  .data-label {
    font-size: 14px;
    color: #c0c4cc;
    margin-bottom: 4px;
  }

  .trend {
    font-size: 14px;
  }

  .trend.up {
    color: #f56c6c;
  }

  .trend.down {
    color: #67c23a;
  }

  .table-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
  }

  .update-time {
    margin-top: 10px;
    text-align: right;
    font-size: 12px;
    color: #909399;
  }

  // 全屏按钮样式
  .fullscreen-btn {
    font-size: 25px;
    color: #fff;
    margin-left: 10px;

    &:hover {
      color: #409EFF;
    }
  }
}

// 表格样式
:deep(.data-table) {
  --el-table-border-color: rgba(64, 158, 255, 0.1);
  --el-table-header-text-color: #fff;
  --el-table-text-color: #fff;
  --el-table-row-hover-bg-color: rgba(64, 158, 255, 0.2);
  --el-table-header-bg-color: rgba(16, 42, 87, 0.7);
  --el-table-bg-color: transparent;
  --el-table-tr-bg-color: transparent;

  background: transparent;

  th {
    background-color: rgba(16, 42, 87, 0.7) !important;
  }

  tr {
    background-color: rgba(16, 42, 87, 0.3);

    &:hover {
      background-color: rgba(64, 158, 255, 0.2) !important;
    }
  }

  td {
    border-bottom: 1px solid rgba(64, 158, 255, 0.1);
    background-color: transparent !important;
  }
}

:deep(.el-table__empty-block) {
  background: rgba(16, 42, 87, 0.3);
}

// 抽屉样式
:deep(.custom-drawer) {
  .el-drawer__header {
    margin-bottom: 20px;
    color: #fff;
    background: #1a2b40;
    padding: 16px;
  }

  .el-drawer__body {
    background: #1a2b40;
    color: #fff;
    padding: 20px;

    .el-checkbox-group {
      .el-checkbox {
        color: #fff;
        margin-bottom: 10px;

        .el-checkbox__label {
          color: #fff;
        }

        .el-checkbox__inner {
          background-color: rgba(16, 42, 87, 0.7);
          border-color: rgba(64, 158, 255, 0.3);
        }
      }
    }
  }
}
</style>
