<template>
  <div class="equipment-dashboard">
    <header class="dashboard-header">
      <h1>设备状态监控看板</h1>
      <div class="header-controls">
        <el-button type="primary" @click="refreshData">刷新数据</el-button>
      </div>
    </header>

    <main class="dashboard-content">
      <!-- 设备状态看板 -->
      <section class="dashboard-section">
        <div class="section-header">
          <h2>设备状态看板</h2>
          <div class="status-filters">
            <el-select
                v-model="statusFilters.workshop"
                placeholder="车间"
                clearable
                style="width: 150px; margin-right: 10px"
            >
              <el-option label="全部" value="all" />
              <el-option label="C4车间" value="c4" />
              <el-option label="C4前段01-11" value="c4_front" />
            </el-select>
            <el-button type="text" @click="showFieldConfig = true">自定义字段</el-button>
          </div>
        </div>

        <div class="status-summary">
          <div class="summary-card running">
            <div class="summary-value">{{ filteredEquipmentStatus.running }}</div>
            <div class="summary-label">运行</div>
          </div>
          <div class="summary-card idle">
            <div class="summary-value">{{ filteredEquipmentStatus.idle }}</div>
            <div class="summary-label">待机</div>
          </div>
          <div class="summary-card alert">
            <div class="summary-value">{{ filteredEquipmentStatus.alert }}</div>
            <div class="summary-label">报警</div>
          </div>
          <div class="summary-card offline">
            <div class="summary-value">{{ filteredEquipmentStatus.offline }}</div>
            <div class="summary-label">离线</div>
          </div>
        </div>

        <div class="equipment-grid">
          <div
              v-for="equip in filteredEquipmentStatus.list"
              :key="equip.id"
              class="equipment-card"
              :class="equip.status"
          >
            <div class="status-light" :class="equip.status"></div>
            <div class="equip-id">{{ equip.id }}</div>
            <div class="equip-name">{{ equip.name }}</div>
            <div v-if="selectedFields.includes('movementRate')" class="equip-field">
              设备移动率: {{ equip.movementRate }}%
            </div>
            <div v-if="selectedFields.includes('output')" class="equip-field">
              当班产量: {{ equip.output }}
            </div>
            <div v-if="selectedFields.includes('runtime')" class="equip-field">
              运行时长: {{ equip.runtime }}
            </div>
          </div>
        </div>
      </section>

      <!-- 设备参数看板 -->
      <section class="dashboard-section">
        <div class="param-header">
          <h2>设备参数看板 (实时)</h2>
          <div class="param-controls">
            <el-select
                v-model="paramQuery.model"
                placeholder="设备型号"
                clearable
                filterable
                style="width: 200px; margin-right: 10px"
            >
              <el-option
                  v-for="model in equipmentModels"
                  :key="model"
                  :label="model"
                  :value="model"
              />
            </el-select>
            <el-select
                v-model="paramQuery.name"
                placeholder="设备名称"
                clearable
                filterable
                style="width: 200px; margin-right: 10px"
            >
              <el-option
                  v-for="name in equipmentNames"
                  :key="name"
                  :label="name"
                  :value="name"
              />
            </el-select>
            <el-button type="primary" @click="queryEquipmentParams">查询</el-button>
          </div>
        </div>

        <div v-if="queriedEquipment" class="param-result">
          <div class="equip-info">
            <span>设备型号: {{ queriedEquipment.model }}</span>
            <span>设备名称: {{ queriedEquipment.name }}</span>
            <span>设备状态: {{ queriedEquipment.status }}</span>
          </div>
          <div class="param-details">
            <div>右侧当前取料层数: {{ queriedEquipment.rightLayer }}</div>
            <div>左侧当前取料层数: {{ queriedEquipment.leftLayer }}</div>
            <div>右侧当前取料列数: {{ queriedEquipment.rightColumn }}</div>
            <div>左侧当前取料列数: {{ queriedEquipment.leftColumn }}</div>
            <div>右侧当前取料框号: {{ queriedEquipment.rightFrame }}</div>
          </div>
        </div>
        <div v-else class="no-params">
          请查询设备型号和设备名称以显示参数
        </div>
      </section>

      <!-- 稼动率总览 -->
      <section class="dashboard-section">
        <div class="section-header">
          <h2>稼动率总览</h2>
          <div class="utilization-filters">
            <el-date-picker
                v-model="utilizationQuery.date"
                type="date"
                placeholder="选择日期"
                style="width: 150px; margin-right: 10px"
            />
            <el-select
                v-model="utilizationQuery.workshop"
                placeholder="车间"
                clearable
                style="width: 150px; margin-right: 10px"
            >
              <el-option label="全部" value="all" />
              <el-option label="C4车间" value="c4" />
              <el-option label="C4前段01-11" value="c4_front" />
            </el-select>
            <el-select
                v-model="utilizationQuery.process"
                placeholder="工序"
                clearable
                style="width: 150px; margin-right: 10px"
            >
              <el-option label="全部" value="all" />
              <el-option label="贴片研磨" value="grinding" />
              <el-option label="绑定段" value="binding" />
              <el-option label="贴合段" value="laminating" />
              <el-option label="组装段" value="assembly" />
              <el-option label="30米线" value="30m_line" />
            </el-select>
            <el-select
                v-model="utilizationQuery.vendor"
                placeholder="设备厂商"
                clearable
                style="width: 150px; margin-right: 10px"
            >
              <el-option label="全部" value="all" />
              <el-option label="石山" value="shishan" />
              <el-option label="汇义" value="huiyi" />
              <el-option label="深眼科技" value="shenyan" />
              <el-option label="红土" value="hongtu" />
              <el-option label="太原风华" value="taiyuan" />
              <el-option label="集银" value="jiyin" />
              <el-option label="序佑" value="xuyou" />
              <el-option label="众志" value="zhongzhi" />
              <el-option label="景泰鑫三力" value="jingtaixin" />
              <el-option label="元硕" value="yuanshuo" />
            </el-select>
            <el-select
                v-model="utilizationQuery.shift"
                placeholder="班次"
                clearable
                style="width: 120px; margin-right: 10px"
            >
              <el-option label="全部" value="all" />
              <el-option label="白班" value="day" />
              <el-option label="晚班" value="night" />
            </el-select>
            <el-button type="primary" @click="queryUtilizationData">查询</el-button>
          </div>
        </div>

        <div class="utilization-dashboard">
          <div
              v-for="equip in filteredEquipmentUtilization"
              :key="equip.id"
              class="gauge-container"
              @click="goToEquipmentDetail(equip.id)"
          >
            <div :id="'gauge-' + equip.id" class="gauge-chart"></div>
            <div class="gauge-label">{{ equip.name }}</div>
            <div class="shift-label">{{ equip.shift === 'day' ? '白班' : '晚班' }}</div>
          </div>
        </div>
      </section>

      <!-- 车间设备总览 -->
      <section class="dashboard-section">
        <h2>车间设备总览</h2>

        <div class="workshop-summary">
          <div class="summary-card total">
            <div class="summary-value">{{ workshopStats.total }}</div>
            <div class="summary-label">设备总数</div>
          </div>
          <div class="summary-card running">
            <div class="summary-value">{{ workshopStats.running }}</div>
            <div class="summary-label">正常运行</div>
          </div>
          <div class="summary-card alert">
            <div class="summary-value">{{ workshopStats.alert }}</div>
            <div class="summary-label">报警</div>
          </div>
          <div class="summary-card idle">
            <div class="summary-value">{{ workshopStats.idle }}</div>
            <div class="summary-label">待机</div>
          </div>
          <div class="summary-card offline">
            <div class="summary-value">{{ workshopStats.offline }}</div>
            <div class="summary-label">离线</div>
          </div>
        </div>

        <div class="workshop-charts">
          <div class="chart-container">
            <h3>当天设备实时移动率</h3>
            <el-progress
                type="circle"
                :percentage="workshopStats.movementRate"
                :color="getUtilizationColor(workshopStats.movementRate)"
                :width="150"
            >
              <template #default="{ percentage }">
                <div class="chart-value">{{ percentage }}%</div>
              </template>
            </el-progress>
          </div>
          <div class="chart-container">
            <h3>当天设备状态分布</h3>
            <el-progress
                type="circle"
                :percentage="workshopStats.normalRate"
                :color="getUtilizationColor(workshopStats.normalRate)"
                :width="150"
            >
              <template #default="{ percentage }">
                <div class="chart-value">{{ percentage }}%</div>
              </template>
            </el-progress>
          </div>
        </div>

        <div class="workshop-equipment">
          <div
              v-for="equip in workshopEquipment"
              :key="equip.id"
              class="workshop-card"
              :class="equip.status"
          >
            <div class="status-light" :class="equip.status"></div>
            <div class="equip-id">{{ equip.id }}</div>
            <div class="equip-name">{{ equip.name }}</div>
          </div>
        </div>
      </section>

      <!-- 自定义字段对话框 -->
      <el-dialog v-model="showFieldConfig" title="自定义显示字段" width="600px">
        <el-checkbox-group v-model="selectedFields">
          <el-checkbox v-for="field in availableFields" :key="field.value" :label="field.value">
            {{ field.label }}
          </el-checkbox>
        </el-checkbox-group>
        <template #footer>
          <el-button @click="showFieldConfig = false">取消</el-button>
          <el-button type="primary" @click="saveFieldConfig">保存</el-button>
        </template>
      </el-dialog>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import { useRouter } from 'vue-router'
import * as echarts from 'echarts'

const router = useRouter()

// 设备状态看板
const statusFilters = ref({
  workshop: 'all'
})

const availableFields = ref([
  { value: 'movementRate', label: '设备移动率' },
  { value: 'output', label: '当班产量' },
  { value: 'runtime', label: '运行时长' }
])

const selectedFields = ref(['movementRate'])
const showFieldConfig = ref(false)

const equipmentStatus = ref([
  { id: 'C4-51-01', name: '石山上料机', status: 'running', movementRate: 97.48, output: 2412, runtime: '03时13分', workshop: 'c4' },
  { id: 'C4-51-02', name: '高精度激光片混合机', status: 'running', movementRate: 85.32, output: 1987, runtime: '02时45分', workshop: 'c4' },
  { id: 'C4-51-03', name: '高精度激光片混合机', status: 'idle', movementRate: 0, output: 0, runtime: '00时00分', workshop: 'c4' },
  { id: 'C4-51-04', name: '清流机EC-0001TXD', status: 'alert', movementRate: 42.15, output: 876, runtime: '01时22分', workshop: 'c4_front' },
  { id: 'C4-51-05', name: '全自动COB/SCL-200032', status: 'running', movementRate: 91.76, output: 2654, runtime: '03时45分', workshop: 'c4' },
  { id: 'C4-51-06', name: 'FPC上科机BL-1603', status: 'offline', movementRate: 0, output: 0, runtime: '00时00分', workshop: 'c4_front' },
  { id: 'C4-51-07', name: '全自动FOB/SFB-200053', status: 'running', movementRate: 88.43, output: 2312, runtime: '03时12分', workshop: 'c4' },
  { id: 'C4-51-08', name: 'AD-HP-801A', status: 'idle', movementRate: 0, output: 0, runtime: '00时00分', workshop: 'c4_front' }
])

const filteredEquipmentStatus = computed(() => {
  const filtered = equipmentStatus.value.filter(equip => {
    return statusFilters.value.workshop === 'all' || equip.workshop === statusFilters.value.workshop
  })

  const counts = {
    running: filtered.filter(e => e.status === 'running').length,
    idle: filtered.filter(e => e.status === 'idle').length,
    alert: filtered.filter(e => e.status === 'alert').length,
    offline: filtered.filter(e => e.status === 'offline').length,
    list: filtered
  }

  return counts
})

// 设备参数看板
const paramQuery = ref({
  model: '',
  name: ''
})

const equipmentModels = ref([
  '石山上料机',
  '高精度激光片混合机',
  '清流机EC-0001TXD',
  '全自动COB/SCL-200032',
  'FPC上科机BL-1603'
])

const equipmentNames = ref([
  'C4-51-01',
  'C4-51-02',
  'C4-51-03',
  'C4-51-04',
  'C4-51-05'
])

const queriedEquipment = ref(null)

const queryEquipmentParams = () => {
  if (!paramQuery.value.model && !paramQuery.value.name) {
    queriedEquipment.value = null
    return
  }

  // 模拟查询结果
  queriedEquipment.value = {
    model: paramQuery.value.model || '未知型号',
    name: paramQuery.value.name || '未知设备',
    status: '正常',
    rightLayer: Math.floor(Math.random() * 30) + 1,
    leftLayer: Math.floor(Math.random() * 30) + 1,
    rightColumn: Math.floor(Math.random() * 5) + 1,
    leftColumn: Math.floor(Math.random() * 5) + 1,
    rightFrame: Math.floor(Math.random() * 3) + 1
  }
}

// 稼动率总览
const utilizationQuery = ref({
  date: new Date(),
  workshop: 'all',
  process: 'all',
  vendor: 'all',
  shift: 'all'
})

const equipmentUtilization = ref([
  { id: 'C4-51-01', name: '石山上料机', utilization: 97.48, shift: 'day', workshop: 'c4', process: 'grinding', vendor: 'shishan' },
  { id: 'C4-51-02', name: '高精度激光片混合机', utilization: 85.32, shift: 'day', workshop: 'c4', process: 'binding', vendor: 'huiyi' },
  { id: 'C4-51-03', name: '高精度激光片混合机', utilization: 0, shift: 'night', workshop: 'c4', process: 'binding', vendor: 'huiyi' },
  { id: 'C4-51-04', name: '清流机EC-0001TXD', utilization: 42.15, shift: 'day', workshop: 'c4_front', process: 'laminating', vendor: 'shenyan' },
  { id: 'C4-51-05', name: '全自动COB/SCL-200032', utilization: 91.76, shift: 'night', workshop: 'c4', process: 'assembly', vendor: 'hongtu' },
  { id: 'C4-51-06', name: 'FPC上科机BL-1603', utilization: 0, shift: 'day', workshop: 'c4_front', process: '30m_line', vendor: 'taiyuan' },
  { id: 'C4-51-07', name: '全自动FOB/SFB-200053', utilization: 78.23, shift: 'night', workshop: 'c4', process: 'assembly', vendor: 'jiyin' },
  { id: 'C4-51-08', name: 'AD-HP-801A', utilization: 65.41, shift: 'day', workshop: 'c4_front', process: 'laminating', vendor: 'xuyou' },
  { id: 'C4-51-09', name: '智能点线机JTA-03TXD4', utilization: 88.12, shift: 'night', workshop: 'c4', process: 'grinding', vendor: 'zhongzhi' },
  { id: 'C4-51-10', name: '自动站前机PTZ-0407MA', utilization: 55.67, shift: 'day', workshop: 'c4', process: '30m_line', vendor: 'jingtaixin' }
])

const filteredEquipmentUtilization = computed(() => {
  return equipmentUtilization.value.filter(equip => {
    return (
        (utilizationQuery.value.workshop === 'all' || equip.workshop === utilizationQuery.value.workshop) &&
        (utilizationQuery.value.process === 'all' || equip.process === utilizationQuery.value.process) &&
        (utilizationQuery.value.vendor === 'all' || equip.vendor === utilizationQuery.value.vendor) &&
        (utilizationQuery.value.shift === 'all' || equip.shift === utilizationQuery.value.shift)
    )
  })
})

const queryUtilizationData = () => {
  // 这里可以添加实际查询逻辑
  console.log('查询条件:', utilizationQuery.value)
  // 模拟数据刷新
  refreshData()
}

// 车间设备总览
const workshopStats = ref({
  total: 28,
  running: 18,
  alert: 3,
  idle: 5,
  offline: 2,
  movementRate: 21.72,
  normalRate: 18.75
})

const workshopEquipment = ref([
  { id: 'C4-51-01', name: '石山上料机', status: 'running' },
  { id: 'C4-51-02', name: '高精度激光片混合机', status: 'running' },
  { id: 'C4-51-03', name: '高精度激光片混合机', status: 'idle' },
  { id: 'C4-51-04', name: '清流机EC-0001TXD', status: 'alert' },
  { id: 'C4-51-05', name: '全自动COB/SCL-200032', status: 'running' },
  { id: 'C4-51-06', name: 'FPC上科机BL-1603', status: 'offline' },
  { id: 'C4-51-07', name: '全自动FOB/SFB-200053', status: 'running' },
  { id: 'C4-51-08', name: 'AD-HP-801A', status: 'idle' },
  { id: 'C4-51-09', name: '智能点线机JTA-03TXD4', status: 'running' },
  { id: 'C4-51-10', name: '自动站前机PTZ-0407MA', status: 'running' }
])

// 通用方法
const getUtilizationColor = (percentage) => {
  if (percentage >= 80) return '#67c23a'
  if (percentage >= 60) return '#e6a23c'
  return '#f56c6c'
}

const goToEquipmentDetail = (equipmentId) => {
  router.push(`/equipment/${equipmentId}`)
}

const refreshData = () => {
  // 模拟数据刷新
  workshopStats.value.movementRate = Math.min(100, Math.max(0, workshopStats.value.movementRate + (Math.random() * 5 - 2.5))).toFixed(2)
  workshopStats.value.normalRate = Math.min(100, Math.max(0, workshopStats.value.normalRate + (Math.random() * 5 - 2.5))).toFixed(2)

  equipmentUtilization.value.forEach(equip => {
    equip.utilization = Math.min(100, Math.max(0, equip.utilization + (Math.random() * 5 - 2.5)))
  })

  if (queriedEquipment.value) {
    queriedEquipment.value.rightLayer = Math.floor(Math.random() * 30) + 1
    queriedEquipment.value.leftLayer = Math.floor(Math.random() * 30) + 1
  }
}

const saveFieldConfig = () => {
  showFieldConfig.value = false
  // 这里可以添加保存到服务器的逻辑
}

// 初始化ECharts仪表盘
const initGaugeCharts = () => {
  nextTick(() => {
    filteredEquipmentUtilization.value.forEach(equip => {
      const chartDom = document.getElementById(`gauge-${equip.id}`)
      if (chartDom) {
        const myChart = echarts.init(chartDom)
        const option = {
          series: [
            {
              type: 'gauge',
              min: 0,
              max: 100,
              axisLine: {
                lineStyle: {
                  width: 20,
                  color: [
                    [0.2, '#F56C6C'],
                    [0.6, '#E6A23C'],
                    [1, '#67C23A']
                  ]
                }
              },
              pointer: {
                itemStyle: {
                  color: 'auto'
                }
              },
              axisTick: {
                distance: -15,
                length: 6,
                lineStyle: {
                  color: '#fff',
                  width: 1
                }
              },
              splitLine: {
                distance: -15,
                length: 15,
                lineStyle: {
                  color: '#fff',
                  width: 2
                }
              },
              axisLabel: {
                color: '#999',
                distance: 20,
                fontSize: 12
              },
              detail: {
                valueAnimation: true,
                formatter: '{value}%',
                color: '#333',
                fontSize: 16,
                fontWeight: 'bold',
                offsetCenter: [0, '60%']
              },
              data: [
                {
                  value: equip.utilization
                }
              ]
            }
          ]
        }
        myChart.setOption(option)

        // 监听窗口大小变化，重新调整图表大小
        window.addEventListener('resize', () => {
          myChart.resize()
        })
      }
    })
  })
}

// 监听过滤后的数据变化，重新渲染图表
watch(filteredEquipmentUtilization, () => {
  initGaugeCharts()
}, { deep: true })

onMounted(() => {
  initGaugeCharts()

  // 模拟实时数据更新
  setInterval(() => {
    equipmentUtilization.value.forEach(equip => {
      equip.utilization = Math.min(100, Math.max(0, equip.utilization + (Math.random() * 5 - 2.5)))
    })
  }, 5000)
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

.status-filters {
  display: flex;
  align-items: center;
}

.status-summary {
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
}

.summary-card {
  flex: 1;
  border-radius: 4px;
  padding: 15px;
  text-align: center;
  color: white;
}

.summary-card.running {
  background-color: #67c23a;
}

.summary-card.idle {
  background-color: #e6a23c;
}

.summary-card.alert {
  background-color: #f56c6c;
}

.summary-card.offline {
  background-color: #909399;
}

.summary-card.total {
  background-color: #409eff;
}

.summary-value {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 5px;
}

.summary-label {
  font-size: 14px;
}

.equipment-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 15px;
}

.equipment-card {
  border-radius: 4px;
  padding: 15px;
  border-left: 4px solid;
  position: relative;
  background-color: #f9f9f9;
}

.equipment-card.running {
  border-left-color: #67c23a;
}

.equipment-card.idle {
  border-left-color: #e6a23c;
}

.equipment-card.alert {
  border-left-color: #f56c6c;
}

.equipment-card.offline {
  border-left-color: #909399;
}

.status-light {
  position: absolute;
  top: 10px;
  right: 10px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.status-light.running {
  background-color: #67c23a;
  box-shadow: 0 0 5px #67c23a;
}

.status-light.idle {
  background-color: #e6a23c;
  box-shadow: 0 0 5px #e6a23c;
}

.status-light.alert {
  background-color: #f56c6c;
  box-shadow: 0 0 5px #f56c6c;
}

.status-light.offline {
  background-color: #909399;
  box-shadow: 0 0 5px #909399;
}

.equip-id {
  font-weight: bold;
  margin-bottom: 5px;
}

.equip-name {
  color: #606266;
  margin-bottom: 10px;
}

.equip-field {
  font-size: 13px;
  color: #909399;
  margin-top: 5px;
}

.param-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.param-controls {
  display: flex;
  align-items: center;
}

.param-result {
  background-color: #f9f9f9;
  border-radius: 4px;
  padding: 15px;
}

.equip-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  padding-bottom: 10px;
  border-bottom: 1px solid #ebeef5;
  font-size: 14px;
}

.equip-info span {
  margin-right: 15px;
}

.param-details div {
  margin: 8px 0;
  font-size: 15px;
}

.no-params {
  text-align: center;
  padding: 30px;
  color: #909399;
  font-size: 14px;
  background-color: #f9f9f9;
  border-radius: 4px;
}

.utilization-filters {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
}

.utilization-dashboard {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
}

.gauge-container {
  text-align: center;
  cursor: pointer;
  transition: transform 0.2s;
}

.gauge-container:hover {
  transform: scale(1.05);
}

.gauge-chart {
  width: 100%;
  height: 180px;
}

.gauge-label {
  margin-top: 5px;
  font-size: 14px;
  color: #606266;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.shift-label {
  font-size: 12px;
  color: #909399;
}

.workshop-summary {
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
}

.workshop-charts {
  display: flex;
  gap: 30px;
  margin-bottom: 20px;
}

.chart-container {
  flex: 1;
  text-align: center;
}

.chart-container h3 {
  margin-bottom: 15px;
  font-size: 14px;
  color: #606266;
}

.chart-value {
  font-size: 18px;
  font-weight: bold;
  color: #303133;
}

.workshop-equipment {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 15px;
}

.workshop-card {
  border-radius: 4px;
  padding: 15px;
  position: relative;
  background-color: #f9f9f9;
}

.workshop-card .status-light {
  position: absolute;
  top: 10px;
  right: 10px;
}

.workshop-card .equip-id {
  font-weight: bold;
  margin-bottom: 5px;
}

.workshop-card .equip-name {
  font-size: 13px;
  color: #606266;
}
</style>
