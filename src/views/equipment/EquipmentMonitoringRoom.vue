<template>
  <div class="equipment-dashboard">
    <header class="dashboard-header">
      <h1>设备状态监控看板</h1>
      <div class="header-controls">
        <el-select v-model="selectedWorkshop" placeholder="选择车间" style="width: 200px">
          <el-option
              v-for="workshop in workshops"
              :key="workshop.id"
              :label="workshop.name"
              :value="workshop.id"
          />
        </el-select>
        <el-button type="primary" @click="refreshData">刷新数据</el-button>
      </div>
    </header>

    <main class="dashboard-content">
      <!-- 设备状态看板 -->
      <section class="dashboard-section">
        <div class="section-header">
          <h2>设备状态看板</h2>
          <el-button type="text" @click="showFieldConfig = true">自定义字段</el-button>
        </div>
        <el-table :data="equipmentStatus" border style="width: 100%" height="300">
          <el-table-column
              v-for="field in displayFields"
              :key="field.prop"
              :prop="field.prop"
              :label="field.label"
              :width="field.width"
          />
          <el-table-column label="状态" width="100">
            <template #default="{ row }">
              <el-tag :type="getStatusTagType(row.status)">
                {{ row.status }}
              </el-tag>
            </template>
          </el-table-column>
        </el-table>
      </section>

      <div class="dashboard-row">
        <!-- 设备参数看板 -->
        <section class="dashboard-section half-width">
          <h2>设备参数看板 (实时)</h2>
          <div class="param-grid">
            <div v-for="param in realtimeParams" :key="param.name" class="param-card">
              <div class="param-name">{{ param.name }}</div>
              <div class="param-value">{{ param.value }} {{ param.unit }}</div>
              <div class="param-trend">
                <el-icon :color="param.trend === 'up' ? '#f56c6c' : '#67c23a'">
                  <CaretTop v-if="param.trend === 'up'" />
                  <CaretBottom v-else />
                </el-icon>
                <span>{{ param.change }}</span>
              </div>
            </div>
          </div>
        </section>

        <!-- 稼动率总览 -->
        <section class="dashboard-section half-width">
          <h2>稼动率总览</h2>
          <div class="utilization-dashboard">
            <div class="gauge-container">
              <h3>早班</h3>
              <el-progress type="dashboard" :percentage="shiftUtilization.morning" :color="getUtilizationColor(shiftUtilization.morning)" />
            </div>
            <div class="gauge-container">
              <h3>中班</h3>
              <el-progress type="dashboard" :percentage="shiftUtilization.afternoon" :color="getUtilizationColor(shiftUtilization.afternoon)" />
            </div>
            <div class="gauge-container">
              <h3>晚班</h3>
              <el-progress type="dashboard" :percentage="shiftUtilization.night" :color="getUtilizationColor(shiftUtilization.night)" />
            </div>
          </div>
        </section>
      </div>

      <!-- 车间设备总览 -->
      <section class="dashboard-section">
        <h2>车间设备总览</h2>
        <div class="workshop-overview">
          <div class="overview-stats">
            <div class="stat-card">
              <div class="stat-value">{{ workshopStats.totalEquipment }}</div>
              <div class="stat-label">设备总数</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">{{ workshopStats.running }} <span class="stat-unit">台</span></div>
              <div class="stat-label">运行中</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">{{ workshopStats.idle }} <span class="stat-unit">台</span></div>
              <div class="stat-label">待机中</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">{{ workshopStats.maintenance }} <span class="stat-unit">台</span></div>
              <div class="stat-label">维修中</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">{{ workshopStats.utilization }}%</div>
              <div class="stat-label">综合稼动率</div>
            </div>
          </div>
          <div class="overview-chart">
            <el-progress type="circle" :percentage="workshopStats.utilization" :color="getUtilizationColor(workshopStats.utilization)" />
          </div>
        </div>
      </section>
    </main>

    <!-- 自定义字段对话框 -->
    <el-dialog v-model="showFieldConfig" title="自定义显示字段" width="600px">
      <el-checkbox-group v-model="selectedFields">
        <el-checkbox v-for="field in allFields" :key="field.prop" :label="field.prop">
          {{ field.label }}
        </el-checkbox>
      </el-checkbox-group>
      <template #footer>
        <el-button @click="showFieldConfig = false">取消</el-button>
        <el-button type="primary" @click="saveFieldConfig">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { CaretTop, CaretBottom } from '@element-plus/icons-vue'

// 车间选择
const workshops = ref([
  { id: 1, name: '一车间' },
  { id: 2, name: '二车间' },
  { id: 3, name: '三车间' }
])
const selectedWorkshop = ref(1)

// 设备状态数据
const equipmentStatus = ref([
  { id: 1, name: 'CNC-001', type: '数控机床', status: '运行中', output: 120, speed: 1500, temperature: 45.2 },
  { id: 2, name: 'CNC-002', type: '数控机床', status: '待机', output: 0, speed: 0, temperature: 28.5 },
  { id: 3, name: 'M-003', type: '铣床', status: '运行中', output: 85, speed: 1200, temperature: 52.1 },
  { id: 4, name: 'L-004', type: '激光切割机', status: '维修中', output: 0, speed: 0, temperature: 25.0 },
  { id: 5, name: 'CNC-005', type: '数控机床', status: '运行中', output: 110, speed: 1450, temperature: 48.7 },
  { id: 6, name: 'M-006', type: '铣床', status: '运行中', output: 92, speed: 1250, temperature: 50.3 },
  { id: 7, name: 'L-007', type: '激光切割机', status: '待机', output: 0, speed: 0, temperature: 26.8 }
])

// 实时参数数据
const realtimeParams = ref([
  { name: '主轴转速', value: 1500, unit: 'rpm', trend: 'up', change: '+50' },
  { name: '进给速度', value: 500, unit: 'mm/min', trend: 'down', change: '-20' },
  { name: '切削力', value: 1200, unit: 'N', trend: 'up', change: '+150' },
  { name: '温度', value: 45.2, unit: '°C', trend: 'up', change: '+1.2' },
  { name: '振动', value: 2.5, unit: 'mm/s', trend: 'down', change: '-0.3' },
  { name: '电流', value: 15.8, unit: 'A', trend: 'steady', change: '0' }
])

// 稼动率数据
const shiftUtilization = ref({
  morning: 78,
  afternoon: 85,
  night: 65
})

// 车间设备总览数据
const workshopStats = ref({
  totalEquipment: 25,
  running: 18,
  idle: 4,
  maintenance: 3,
  utilization: 82
})

// 自定义字段配置
const allFields = ref([
  { prop: 'name', label: '设备名称', width: 120 },
  { prop: 'type', label: '设备类型', width: 120 },
  { prop: 'output', label: '产量', width: 100 },
  { prop: 'speed', label: '转速', width: 100 },
  { prop: 'temperature', label: '温度', width: 100 }
])

const selectedFields = ref(['name', 'type', 'status'])
const showFieldConfig = ref(false)

// 计算显示的字段
const displayFields = computed(() => {
  return allFields.value.filter(field => selectedFields.value.includes(field.prop))
})

// 获取状态标签类型
const getStatusTagType = (status) => {
  switch (status) {
    case '运行中': return 'success'
    case '待机': return 'info'
    case '维修中': return 'danger'
    default: return 'warning'
  }
}

// 获取稼动率颜色
const getUtilizationColor = (percentage) => {
  if (percentage >= 80) return '#67c23a'
  if (percentage >= 60) return '#e6a23c'
  return '#f56c6c'
}

// 刷新数据
const refreshData = () => {
  // 模拟数据刷新
  workshopStats.value.utilization = Math.min(100, Math.max(0, workshopStats.value.utilization + (Math.random() * 10 - 5)))

  shiftUtilization.value = {
    morning: Math.min(100, Math.max(0, shiftUtilization.value.morning + (Math.random() * 5 - 2.5))),
    afternoon: Math.min(100, Math.max(0, shiftUtilization.value.afternoon + (Math.random() * 5 - 2.5))),
    night: Math.min(100, Math.max(0, shiftUtilization.value.night + (Math.random() * 5 - 2.5)))
  }

  // 更新实时参数
  realtimeParams.value.forEach(param => {
    if (param.trend !== 'steady') {
      const change = Math.random() * 10
      param.value = (param.trend === 'up' ? param.value + change : param.value - change).toFixed(1)
    }
  })
}

// 保存字段配置
const saveFieldConfig = () => {
  showFieldConfig.value = false
  // 这里可以添加保存到服务器的逻辑
}

onMounted(() => {
  // 模拟实时数据更新
  setInterval(refreshData, 5000)
})
</script>

<style scoped>
.equipment-dashboard {
  padding: 20px;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f5f7fa;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.header-controls {
  display: flex;
  gap: 10px;
}

.dashboard-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
  overflow-y: auto;
}

.dashboard-section {
  background-color: #fff;
  border-radius: 4px;
  padding: 20px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.dashboard-row {
  display: flex;
  gap: 20px;
}

.half-width {
  flex: 1;
}

.param-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;
}

.param-card {
  background-color: #f9f9f9;
  border-radius: 4px;
  padding: 15px;
  border-left: 4px solid #409eff;
}

.param-name {
  font-size: 14px;
  color: #909399;
  margin-bottom: 5px;
}

.param-value {
  font-size: 24px;
  font-weight: bold;
  color: #303133;
}

.param-trend {
  display: flex;
  align-items: center;
  font-size: 12px;
  color: #909399;
  margin-top: 5px;
}

.utilization-dashboard {
  display: flex;
  justify-content: space-around;
  align-items: center;
}

.gauge-container {
  text-align: center;
}

.gauge-container h3 {
  margin-bottom: 10px;
  color: #606266;
}

.workshop-overview {
  display: flex;
  gap: 30px;
}

.overview-stats {
  flex: 1;
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 15px;
}

.stat-card {
  background-color: #f9f9f9;
  border-radius: 4px;
  padding: 15px;
  text-align: center;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #409eff;
}

.stat-unit {
  font-size: 14px;
  color: #909399;
}

.stat-label {
  font-size: 14px;
  color: #909399;
  margin-top: 5px;
}

.overview-chart {
  width: 200px;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
