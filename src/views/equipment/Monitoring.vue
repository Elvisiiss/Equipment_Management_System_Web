<!-- RealtimeMonitor.vue -->
<template>
  <div class="monitor-container">
    <!-- 页面标题 -->
    <div class="header">
      <h1>实时状态监控平台</h1>
    </div>

    <!-- 设备运行看板 -->
    <el-card class="section">
      <template #header>
        <span class="section-title">
          <el-icon><Monitor /></el-icon>
          设备运行看板
        </span>
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
    <el-card class="section">
      <template #header>
        <span class="section-title">
          <el-icon><TrendCharts /></el-icon>
          状态趋势分析
        </span>
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
    <el-card class="section">
      <template #header>
        <div class="table-header">
          <span class="section-title">
            <el-icon><DataAnalysis /></el-icon>
            实时数据查看
          </span>
          <el-button type="primary" @click="drawer = true">
            自定义字段
          </el-button>
        </div>
      </template>

      <el-table
          :data="realtimeData"
          style="width: 100%"
          max-height="400"
          stripe
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
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import {
  Monitor,
  Location,
  TrendCharts,
  DataAnalysis,
  Sunny,
  Cpu,
  PieChart,
  WindPower
} from '@element-plus/icons-vue'

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

let timer = null
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
  timer = setInterval(updateData, 3000)
})

onBeforeUnmount(() => {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
})
</script>

<style scoped>
.monitor-container {
  padding: 20px;
  background: #f5f6fa;
  min-height: 100vh;
}
.header h1 {
  margin: 0 0 16px;
  font-size: 24px;
}
.section {
  margin-bottom: 20px;
}
.section-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 18px;
  font-weight: 600;
}
.device-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #ebeef5;
}
.device-name {
  font-weight: 600;
}
.device-location {
  font-size: 14px;
  color: #909399;
}
.map-container {
  position: relative;
  height: 320px;
  background: #fafafa;
  border-radius: 4px;
  overflow: hidden;
}
.device-marker {
  position: absolute;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  cursor: pointer;
  transition: transform 0.3s;
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
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.06);
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
  color: #606266;
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
}
.update-time {
  margin-top: 10px;
  text-align: right;
  font-size: 12px;
  color: #909399;
}
</style>
