<template>
  <div class="equipment-summary">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1>设备概况</h1>
    </div>

    <!-- 查询条件区域 -->
    <div class="query-container">
      <el-row :gutter="20">
        <el-col :span="5">
          <el-select v-model="query.workshop" placeholder="选择车间" clearable style="width:100%">
            <el-option label="车间A" value="A"/>
            <el-option label="车间B" value="B"/>
          </el-select>
        </el-col>
        <el-col :span="5">
          <el-select v-model="query.line" placeholder="选择产线" clearable style="width:100%">
            <el-option label="产线1" value="1"/>
            <el-option label="产线2" value="2"/>
          </el-select>
        </el-col>
        <el-col :span="5">
          <el-select v-model="query.section" placeholder="选择工段" clearable style="width:100%">
            <el-option label="贴片工段" value="smt"/>
            <el-option label="组装工段" value="assembly"/>
            <el-option label="测试工段" value="test"/>
          </el-select>
        </el-col>
        <el-col :span="4">
          <el-input v-model="query.deviceCode" placeholder="设备编码" clearable/>
        </el-col>
        <el-col :span="5">
          <el-input v-model="query.deviceName" placeholder="设备名称" clearable/>
        </el-col>
      </el-row>
    </div>

    <!-- 设备主信息卡片 -->
    <el-card class="main-card">
      <el-row :gutter="24">
        <!-- 设备图片与状态 -->
        <el-col :span="5" class="device-image-col">
          <div class="device-image-wrapper">
            <el-image
                src="https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
                fit="cover"
                class="device-image"
            />
            <div class="device-status" :class="device.status === '运行中' ? 'status-running' : 'status-stopped'">
              {{ device.status }}
            </div>
          </div>
        </el-col>

        <!-- 设备信息详情 -->
        <el-col :span="13" class="device-info-col">
          <div class="info-header">
            <h2 class="info-title">设备基本信息</h2>
            <span class="device-code">{{ device.code }}</span>
          </div>
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">设备名称：</span>
              <span class="info-value">{{ device.name }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">设备类别：</span>
              <span class="info-value">{{ device.type }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">型号：</span>
              <span class="info-value">{{ device.model }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">区域名称：</span>
              <span class="info-value">{{ device.area }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">厂商：</span>
              <span class="info-value">{{ device.vendor }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">责任人：</span>
              <span class="info-value">{{ device.owner }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">进场日期：</span>
              <span class="info-value">{{ device.inDate }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">资产编码：</span>
              <span class="info-value">ZC-2023-001</span>
            </div>
          </div>
        </el-col>

        <!-- 二维码区域 -->
        <el-col :span="6" class="qr-col">
          <div class="qr-container" ref="qrRef">
            <vue-qr :text="device.qrText" :size="160" class="qr-code"/>
            <div class="qr-code-text">{{ device.code }}</div>
          </div>
          <el-button @click="downloadQR" class="qr-download-btn">
            <el-icon><Download /></el-icon>
            导出二维码
          </el-button>
        </el-col>
      </el-row>
    </el-card>

    <!-- 稼动率统计卡片 -->
    <el-card class="stats-card">
      <div class="card-header">
        <h2>稼动率统计</h2>
      </div>

      <el-row :gutter="24" class="stats-content">
        <!-- 稼动率指标 -->
        <el-col :span="8" class="stats-indicators">
          <div class="date-filter">
            <el-date-picker v-model="rateDate" type="date" placeholder="选择日期" class="date-picker"/>
            <el-select v-model="rateShift" placeholder="班次" class="shift-select">
              <el-option label="全部" value="all"/>
              <el-option label="白班" value="day"/>
              <el-option label="晚班" value="night"/>
            </el-select>
          </div>

          <div class="indicators-grid">
            <!-- 总稼动率 -->
            <div class="indicator-card">
              <div class="indicator-title">总稼动率</div>
              <div class="gauge-container">
                <div class="gauge-ring" :style="ringStyle(63.64)">
                  <div class="gauge-center">
                    <div class="gauge-value">63.64%</div>
                    <div class="gauge-desc">运行时间/开机时间</div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 净稼动率 -->
            <div class="indicator-card">
              <div class="indicator-title">净稼动率</div>
              <div class="gauge-container">
                <div class="gauge-ring" :style="ringStyle(100)">
                  <div class="gauge-center">
                    <div class="gauge-value">100%</div>
                    <div class="gauge-desc">运行时间/有效时间</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </el-col>

        <!-- 状态环形图 -->
        <el-col :span="8" class="status-chart">
          <div class="chart-title">设备状态分布</div>
          <div class="ring-chart-container">
            <div class="multi-ring" :style="multiRingStyle">
              <div class="ring-center-content">
                <div class="total-label">状态占比</div>
                <div class="status-details">
                  <div class="status-item" :class="state.value" v-for="state in stateTypes" :key="state.value">
                    <span class="status-color" :style="{backgroundColor: state.color}"></span>
                    <span class="status-text">{{ state.label }}</span>
                    <span class="status-percent">{{ getStatePercent(state.value) }}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </el-col>

        <!-- 状态表格 -->
        <el-col :span="8" class="status-table">
          <div class="table-title">状态详情</div>
          <el-table :data="stateTable" border class="custom-table">
            <el-table-column prop="state" label="状态" align="center"/>
            <el-table-column prop="time" label="时长" align="center"/>
            <el-table-column prop="percent" label="占比(%)" align="center"/>
          </el-table>
        </el-col>
      </el-row>
    </el-card>

    <!-- 时间分布卡片 -->
    <el-card class="timeline-card">
      <div class="card-header">
        <h2>设备状态时间分布</h2>
        <div class="timeline-filter">
          <el-date-picker v-model="timelineDate" type="date" placeholder="选择日期"/>
          <el-select v-model="timelineStart" placeholder="开始时间">
            <el-option label="7:30" value="7:30"/>
            <el-option label="0:00" value="0:00"/>
          </el-select>
        </div>
      </div>

      <!-- 时间块图 -->
      <div class="time-block-container">
        <!-- 时间刻度 -->
        <div class="time-axis">
          <div v-for="time in timeScale" :key="time" class="time-mark">
            {{ time }}
          </div>
        </div>

        <!-- 状态图例 -->
        <div class="timeline-legend">
          <div v-for="state in stateTypes" :key="state.value" class="legend-item">
            <div class="legend-color" :style="{backgroundColor: state.color}"></div>
            <span class="legend-text">{{ state.label }}</span>
          </div>
        </div>

        <!-- 时间块主体 -->
        <div class="time-blocks">
          <div
              v-for="(block, index) in timeBlockData"
              :key="index"
              class="time-segment"
              :style="{
              left: block.startPercent + '%',
              width: block.widthPercent + '%',
              backgroundColor: block.color
            }"
              :title="`${block.stateLabel}: ${block.startTime} - ${block.endTime}`"
          ></div>
        </div>
      </div>
    </el-card>

    <!-- 预警与推送卡片 -->
    <el-card class="alerts-card">
      <div class="card-header">
        <h2>预警与推送信息</h2>
      </div>

      <el-tabs v-model="activeTable" class="info-tabs">
        <el-tab-pane label="预警信息" name="warning">
          <el-table :data="warningTable" border class="custom-table">
            <el-table-column prop="index" label="序号" width="60" align="center"/>
            <el-table-column prop="param" label="参数名称" align="center"/>
            <el-table-column prop="value" label="当前值" align="center"/>
            <el-table-column prop="status" label="状态" align="center">
              <template #default="scope">
                <el-tag :type="scope.row.statusType" class="status-tag">{{ scope.row.status }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="upper" label="上限" align="center"/>
            <el-table-column prop="lower" label="下限" align="center"/>
            <el-table-column prop="unit" label="单位" align="center"/>
            <el-table-column prop="updateTime" label="更新时间" align="center"/>
          </el-table>
        </el-tab-pane>

        <el-tab-pane label="推送记录" name="push">
          <el-table :data="pushTable" border class="custom-table">
            <el-table-column prop="index" label="序号" width="60" align="center"/>
            <el-table-column prop="param" label="参数名称" align="center"/>
            <el-table-column prop="status" label="状态" align="center">
              <template #default="scope">
                <el-tag :type="scope.row.statusType" class="status-tag">{{ scope.row.status }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="time" label="时间" align="center"/>
            <el-table-column prop="desc" label="事项" align="center"/>
            <el-table-column prop="sender" label="推送人" align="center"/>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import VueQr from 'vue-qr/src/packages/vue-qr.vue'
import { Download } from '@element-plus/icons-vue'

/* 查询条件 */
const query = ref({
  workshop: '',
  line: '',
  section: '',
  deviceCode: '',
  deviceName: ''
})

/* 设备主信息 */
const device = ref({
  status: '运行中',
  code: 'C4-51-12',
  name: '自动贴片机',
  type: '贴片设备',
  model: 'TPJ-5000',
  area: 'C4车间 / 51产线 / 贴片工段',
  vendor: '三星电子',
  owner: '张工',
  inDate: '2023-06-15',
  qrText: '设备编码：C4-51-12\n设备名称：自动贴片机'
})

/* 二维码导出 */
const qrRef = ref()
function downloadQR() {
  const canvas = qrRef.value.querySelector('canvas')
  const url = canvas.toDataURL('image/png')
  const a = document.createElement('a')
  a.href = url
  a.download = 'device-qr.png'
  a.click()
}

/* 稼动率统计 */
const rateDate = ref(new Date())
const rateShift = ref('all')
const stateTable = [
  { state: '运行', time: '27分41秒', percent: '31.22' },
  { state: '待机', time: '2小时19分49秒', percent: '27.78' },
  { state: '故障', time: '0', percent: '0' },
  { state: '离线', time: '0', percent: '0' }
]

// 获取状态百分比
function getStatePercent(stateValue) {
  const stateMap = {
    'running': '31.22',
    'standby': '27.78',
    'fault': '0',
    'offline': '0'
  }
  return stateMap[stateValue] || '0'
}

/* 环形进度条样式 */
function ringStyle(percent) {
  return {
    background: `conic-gradient(#409eff 0% ${percent}%, #e0e6ed ${percent}% 100%)`
  }
}

/* 多色状态环形图 */
const multiRingStyle = computed(() => {
  return {
    background: `conic-gradient(
      #67c23a 0% 31.22%,
      #e6a23c 31.22% 59%,
      #f56c6c 59% 59%,
      #909399 59% 100%
    )`
  }
})

/* 时间块图 */
const timelineDate = ref(new Date())
const timelineStart = ref('7:30')

// 定义状态类型和颜色
const stateTypes = ref([
  { value: 'running', label: '运行中', color: '#67c23a' },
  { value: 'standby', label: '待机', color: '#e6a23c' },
  { value: 'fault', label: '故障', color: '#f56c6c' },
  { value: 'offline', label: '离线', color: '#909399' }
])

// 时间刻度 (07:30 - 18:30)
const timeScale = computed(() => {
  const times = []
  for (let i = 7; i <= 18; i++) {
    if (i === 7) {
      times.push('07:30')
    } else {
      times.push(`${i.toString().padStart(2, '0')}:00`)
    }
  }
  times.push('18:30')
  return times
})

// 生成模拟的时间块数据
const timeBlockData = computed(() => {
  const blocks = []
  const startMinutes = 7 * 60 + 30 // 07:30
  const endMinutes = 18 * 60 + 30 // 18:30
  const totalMinutes = endMinutes - startMinutes

  // 生成随机状态块
  let currentTime = startMinutes
  while (currentTime < endMinutes) {
    const stateIndex = Math.floor(Math.random() * stateTypes.value.length)
    const state = stateTypes.value[stateIndex]

    // 随机生成本次状态的持续时间 (15-120分钟)
    const duration = Math.floor(Math.random() * 105) + 15
    const endTime = Math.min(currentTime + duration, endMinutes)

    const startPercent = ((currentTime - startMinutes) / totalMinutes) * 100
    const widthPercent = ((endTime - currentTime) / totalMinutes) * 100

    // 格式化时间显示
    const formatTime = (minutes) => {
      const hours = Math.floor(minutes / 60)
      const mins = minutes % 60
      return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`
    }

    blocks.push({
      state: state.value,
      stateLabel: state.label,
      color: state.color,
      startTime: formatTime(currentTime),
      endTime: formatTime(endTime),
      startPercent: startPercent,
      widthPercent: widthPercent
    })

    currentTime = endTime
  }

  return blocks
})

/* 预警与推送表格 */
const activeTable = ref('warning')
const warningTable = [
  { index:1, param:'温度', value:'85', status:'超上限', statusType:'danger', upper:80, lower:20, unit:'℃', updateTime:'2025-08-19 09:30' },
  { index:2, param:'压力', value:'0.2', status:'超下限', statusType:'warning', upper:1.0, lower:0.5, unit:'MPa', updateTime:'2025-08-19 09:32' }
]
const pushTable = [
  { index:1, param:'温度', status:'已推送', statusType:'success', time:'2025-08-19 09:31', desc:'温度超过上限，可能导致设备过热', sender:'系统' },
  { index:2, param:'压力', status:'未推送', statusType:'info', time:'2025-08-19 09:33', desc:'压力低于下限，可能影响产品质量', sender:'设备负责人' }
]
</script>

<style scoped>
.equipment-summary {
  padding: 20px;
  background-color: #f7f8fa;
  min-height: 100vh;
}

/* 页面标题 */
.page-header {
  margin-bottom: 24px;
}

.page-header h1 {
  font-size: 24px;
  color: #1d2129;
  margin: 0;
}

/* 查询条件区域 */
.query-container {
  background-color: #fff;
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

/* 通用卡片样式 */
.el-card {
  border-radius: 8px;
  margin-bottom: 20px;
  border: none;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #f2f3f5;
  margin-bottom: 16px;
}

.card-header h2 {
  font-size: 16px;
  color: #1d2129;
  margin: 0;
  font-weight: 500;
}

/* 设备主信息卡片 */
.main-card {
  padding: 20px;
}

.device-image-col {
  display: flex;
  align-items: center;
  justify-content: center;
}

.device-image-wrapper {
  position: relative;
  width: 100%;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transition: transform 0.3s ease;
}

.device-image-wrapper:hover {
  transform: translateY(-4px);
}

.device-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
}

.device-status {
  position: absolute;
  top: 12px;
  right: 12px;
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  color: #fff;
  z-index: 1;
}

.status-running {
  background-color: #67c23a;
}

.status-stopped {
  background-color: #f56c6c;
}

.device-info-col {
  padding: 10px 0;
}

.info-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.info-title {
  font-size: 18px;
  color: #1d2129;
  margin: 0;
  font-weight: 500;
}

.device-code {
  color: #409eff;
  font-size: 14px;
  font-weight: 500;
  padding: 4px 10px;
  background-color: #ecf5ff;
  border-radius: 4px;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.info-item {
  display: flex;
  padding: 8px 0;
  border-bottom: 1px dashed #f2f3f5;
}

.info-item:last-child {
  border-bottom: none;
}

.info-label {
  color: #86909c;
  min-width: 80px;
  font-size: 14px;
}

.info-value {
  color: #1d2129;
  font-size: 14px;
  flex: 1;
}

.qr-col {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 10px;
}

.qr-container {
  background-color: #fff;
  padding: 12px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  margin-bottom: 16px;
  text-align: center;
}

.qr-download-btn {
  width: 100%;
  background-color: #f2f3f5;
  color: #4e5969;
  border: none;
  transition: all 0.3s ease;
}

.qr-download-btn:hover {
  background-color: #e5e6eb;
  color: #1d2129;
}

/* 稼动率统计卡片 */
.stats-card {
  padding: 20px;
}

.stats-content {
  margin-top: 10px;
}

.date-filter {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
  padding: 0 10px;
}

.date-picker {
  width: 160px;
}

.shift-select {
  width: 100px;
}

.indicators-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  padding: 0 10px;
}

.indicator-card {
  background-color: #fff;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  text-align: center;
}

.indicator-title {
  font-size: 14px;
  color: #86909c;
  margin-bottom: 16px;
}

.gauge-container {
  position: relative;
  width: 100%;
  height: 140px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.gauge-ring {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  position: relative;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05) inset;
}

.gauge-center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  width: 80px;
  height: 80px;
  background-color: #fff;
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.gauge-value {
  font-size: 18px;
  font-weight: 600;
  color: #1d2129;
  line-height: 1;
}

.gauge-desc {
  font-size: 12px;
  color: #86909c;
  margin-top: 5px;
}

.status-chart {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.chart-title {
  font-size: 14px;
  color: #86909c;
  margin-bottom: 20px;
  text-align: center;
  width: 100%;
}

.ring-chart-container {
  width: 100%;
  display: flex;
  justify-content: center;
}

.multi-ring {
  width: 200px;
  height: 200px;
  border-radius: 50%;
  position: relative;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05) inset;
}

.ring-center-content {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  width: 140px;
  height: 140px;
  background-color: #fff;
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 10px;
}

.total-label {
  font-size: 16px;
  font-weight: 500;
  color: #1d2129;
  margin-bottom: 10px;
}

.status-details {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.status-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 12px;
}

.status-color {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  margin-right: 5px;
}

.status-text {
  flex: 1;
  text-align: left;
}

.status-percent {
  font-weight: 500;
}

.status-table {
  display: flex;
  flex-direction: column;
}

.table-title {
  font-size: 14px;
  color: #86909c;
  margin-bottom: 16px;
  padding-left: 10px;
}

.custom-table {
  background-color: #fff;
  border-radius: 8px;
  overflow: hidden;
}

.custom-table th {
  background-color: #f7f8fa;
  font-weight: 500;
  color: #4e5969;
}

/* 时间分布卡片 */
.timeline-card {
  padding: 20px;
}

.timeline-filter {
  display: flex;
  gap: 12px;
}

.time-block-container {
  padding: 10px 0;
}

.time-axis {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  padding: 0 10px;
}

.time-mark {
  flex: 1;
  text-align: center;
  font-size: 12px;
  color: #86909c;
  position: relative;
}

.time-mark::after {
  content: '';
  position: absolute;
  bottom: -5px;
  left: 50%;
  width: 1px;
  height: 5px;
  background-color: #dcdfe6;
}

.timeline-legend {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin: 15px 0;
}

.legend-item {
  display: flex;
  align-items: center;
  font-size: 12px;
  color: #4e5969;
}

.legend-color {
  width: 12px;
  height: 12px;
  border-radius: 3px;
  margin-right: 6px;
}

.time-blocks {
  position: relative;
  height: 50px;
  background-color: #f2f3f5;
  border-radius: 6px;
  overflow: hidden;
  margin-top: 10px;
}

.time-segment {
  position: absolute;
  height: 100%;
  transition: all 0.3s ease;
  cursor: pointer;
  border-radius: 2px;
}

.time-segment:hover {
  opacity: 0.9;
  transform: scaleY(0.9);
}

/* 预警与推送卡片 */
.alerts-card {
  padding: 20px;
}

.info-tabs {
  margin-top: 10px;
}

.el-tabs__header {
  margin-bottom: 16px;
}

.el-tabs__item {
  color: #86909c;
}

.el-tabs__item.is-active {
  color: #409eff;
}

.status-tag {
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
}

/* 响应式调整 */
@media (max-width: 1200px) {
  .info-grid {
    grid-template-columns: 1fr;
  }

  .indicators-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 992px) {
  .device-image-col,
  .device-info-col,
  .qr-col,
  .stats-indicators,
  .status-chart,
  .status-table {
    :span: 24 !important;
  }

  .card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .timeline-filter {
    width: 100%;
    justify-content: flex-start;
  }
}
</style>
