<template>
  <div class="spc-container">
    <!-- 顶部查询区域 -->
    <div class="filter-container">
      <el-form :inline="true" :model="filterForm" class="filter-form">
        <el-form-item label="车间">
          <el-select v-model="filterForm.workshop" placeholder="请选择车间" clearable style="width: 200px">
            <el-option
                v-for="ws in workshopOptions"
                :key="ws"
                :label="`${ws}车间`"
                :value="ws"
            ></el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="设备型号">
          <el-input
              v-model="filterForm.model"
              placeholder="请输入设备型号"
              clearable
          ></el-input>
        </el-form-item>

        <el-form-item label="设备名称">
          <el-input
              v-model="filterForm.name"
              placeholder="请输入设备名称"
              clearable
          ></el-input>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" icon="search" @click="handleSearch">查询</el-button>
          <el-button icon="refresh" @click="resetFilter">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 设备便签展示区域 -->
    <div class="device-container">
      <div class="device-cards">
        <div
            v-for="device in deviceList"
            :key="device.id"
            class="device-card"
            @click="showDeviceDetail(device)"
        >
          <div class="device-header">
            <div class="device-name">{{ device.name }}</div>
            <div class="device-status" :class="getStatusClass(device.status)">
              {{ device.status }}
            </div>
          </div>

          <div class="device-info">
            <div class="info-item">
              <i class="el-icon-office-building"></i>
              <span>{{ device.workshop }}车间</span>
            </div>
            <div class="info-item">
              <i class="el-icon-set-up"></i>
              <span>{{ device.line }}产线</span>
            </div>
            <div class="info-item">
              <i class="el-icon-s-operation"></i>
              <span>{{ device.segment }}</span>
            </div>
            <div class="info-item">
              <i class="el-icon-cpu"></i>
              <span>{{ device.deviceCode }}</span>
            </div>
          </div>

          <div class="device-metrics">
            <div class="metric-item">
              <div class="metric-label">产量</div>
              <div class="metric-value">{{ device.output }} pcs</div>
            </div>
            <div class="metric-item">
              <div class="metric-label">良率</div>
              <div class="metric-value">{{ device.yieldRate }}%</div>
            </div>
            <div class="metric-item">
              <div class="metric-label">报警</div>
              <div class="metric-value" :class="{ 'alarm-active': device.alarmCount > 0 }">
                {{ device.alarmCount }}
              </div>
            </div>
          </div>

          <div class="device-last-update">
            <i class="el-icon-time"></i>
            最后更新: {{ device.lastUpdate }}
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-if="deviceList.length === 0" class="empty-container">
        <el-empty description="暂无设备数据"></el-empty>
      </div>

      <!-- 分页控件 -->
      <div class="pagination-container" v-if="total > 0">
        <el-pagination
            background
            layout="prev, pager, next"
            :page-size="pageSize"
            :total="total"
            :current-page="currentPage"
            @current-change="handlePageChange"
        ></el-pagination>
      </div>
    </div>

    <!-- 设备详情弹窗 -->
    <el-dialog
        v-model="detailVisible"
        :title="currentDevice.name"
        width="90%"
        top="5vh"
        custom-class="spc-detail-dialog"
    >
      <el-tabs v-model="activeTab" type="border-card">
        <!-- 产量及状态 -->
        <el-tab-pane label="产量及状态" name="output">
          <div class="output-metrics">
            <el-row :gutter="20">
              <el-col :span="6">
                <div class="metric-card">
                  <div class="metric-title">今日产量</div>
                  <div class="metric-value">{{ currentDevice.outputMetrics.todayOutput }} pcs</div>
                  <div class="metric-change">
                    <span :class="currentDevice.outputMetrics.todayChange >= 0 ? 'increase' : 'decrease'">
                      <i :class="currentDevice.outputMetrics.todayChange >= 0 ? 'el-icon-top' : 'el-icon-bottom'"></i>
                      {{ Math.abs(currentDevice.outputMetrics.todayChange) }}%
                    </span>
                    较昨日
                  </div>
                </div>
              </el-col>
              <el-col :span="6">
                <div class="metric-card">
                  <div class="metric-title">良率</div>
                  <div class="metric-value">{{ currentDevice.outputMetrics.yieldRate }}%</div>
                  <div class="metric-change">
                    <span :class="currentDevice.outputMetrics.yieldChange >= 0 ? 'increase' : 'decrease'">
                      <i :class="currentDevice.outputMetrics.yieldChange >= 0 ? 'el-icon-top' : 'el-icon-bottom'"></i>
                      {{ Math.abs(currentDevice.outputMetrics.yieldChange) }}%
                    </span>
                    较昨日
                  </div>
                </div>
              </el-col>
              <el-col :span="6">
                <div class="metric-card">
                  <div class="metric-title">设备状态</div>
                  <div class="metric-value">
                    <el-tag :type="currentDevice.status === '运行中' ? 'success' : 'danger'">
                      {{ currentDevice.status }}
                    </el-tag>
                  </div>
                  <div class="metric-duration">
                    已运行: {{ currentDevice.outputMetrics.runningHours }} 小时
                  </div>
                </div>
              </el-col>
              <el-col :span="6">
                <div class="metric-card">
                  <div class="metric-title">OEE</div>
                  <div class="metric-value">{{ currentDevice.outputMetrics.oee }}%</div>
                  <div class="metric-progress">
                    <el-progress :percentage="currentDevice.outputMetrics.oee" :color="customColors"></el-progress>
                  </div>
                </div>
              </el-col>
            </el-row>
          </div>

          <div class="output-charts">
            <el-row :gutter="20">
              <el-col :span="12">
                <div class="chart-container">
                  <h3>产量趋势 (最近7天)</h3>
                  <div id="outputChart" style="height: 300px;"></div>
                </div>
              </el-col>
              <el-col :span="12">
                <div class="chart-container">
                  <h3>良率分布</h3>
                  <div id="yieldChart" style="height: 300px;"></div>
                </div>
              </el-col>
            </el-row>
          </div>
        </el-tab-pane>

        <!-- 报警参数 -->
        <el-tab-pane label="报警参数" name="alarm">
          <el-table :data="currentDevice.alarmParams" height="500" border>
            <el-table-column type="index" label="序号" width="60" align="center"></el-table-column>
            <el-table-column prop="param" label="参数" width="150"></el-table-column>
            <el-table-column label="描述">
              <template #default="{ row }">
                <el-tooltip :content="row.description" placement="top">
                  <el-link type="primary" :underline="false">{{ row.description.substring(0, 20) }}...</el-link>
                </el-tooltip>
              </template>
            </el-table-column>
            <el-table-column prop="value" label="实时数据" width="120">
              <template #default="{ row }">
                <span :class="{'alarm-value': row.isAlarm}">{{ row.value }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="unit" label="单位" width="80"></el-table-column>
            <el-table-column prop="updateTime" label="更新时间" width="180"></el-table-column>
            <el-table-column label="操作" width="200" align="center">
              <template #default="{ row }">
                <el-button size="small" type="primary" @click="showRealTimeChart(row)">实时曲线</el-button>
                <el-button size="small" @click="showHistoryQuery(row)">历史查询</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <!-- SOP看板 -->
        <el-tab-pane label="SOP看板" name="sop">
          <div class="sop-container">
            <div class="sop-content">
              <h3>{{ currentDevice.name }} 标准操作流程</h3>
              <div class="sop-steps">
                <el-steps direction="vertical" :active="currentDevice.sop.activeStep">
                  <el-step
                      v-for="(step, index) in currentDevice.sop.steps"
                      :key="index"
                      :title="step.title"
                      :description="step.description"
                  ></el-step>
                </el-steps>
              </div>
            </div>

            <div class="sop-attachments">
              <h3>相关文档</h3>
              <div class="attachment-list">
                <div v-for="(file, index) in currentDevice.sop.attachments" :key="index" class="attachment-item">
                  <i class="el-icon-document"></i>
                  <span class="file-name">{{ file.name }}</span>
                  <el-button type="text" size="small">下载</el-button>
                </div>
              </div>
            </div>
          </div>
        </el-tab-pane>

        <!-- 关键参数 -->
        <el-tab-pane label="关键参数" name="keyParams">
          <el-table :data="currentDevice.keyParams" height="500" border>
            <el-table-column type="index" label="序号" width="60" align="center"></el-table-column>
            <el-table-column prop="param" label="参数" width="150"></el-table-column>
            <el-table-column prop="description" label="描述"></el-table-column>
            <el-table-column prop="value" label="实时数据" width="120">
              <template #default="{ row }">
                <span :class="{'warning-value': row.isWarning}">{{ row.value }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="unit" label="单位" width="80"></el-table-column>
            <el-table-column prop="standard" label="标准值" width="120"></el-table-column>
            <el-table-column prop="range" label="允许范围" width="150"></el-table-column>
            <el-table-column prop="updateTime" label="更新时间" width="180"></el-table-column>
          </el-table>
        </el-tab-pane>

        <!-- 非关键参数 -->
        <el-tab-pane label="非关键参数" name="nonKeyParams">
          <el-table :data="currentDevice.nonKeyParams" height="500" border>
            <el-table-column type="index" label="序号" width="60" align="center"></el-table-column>
            <el-table-column prop="param" label="参数" width="150"></el-table-column>
            <el-table-column prop="description" label="描述"></el-table-column>
            <el-table-column prop="value" label="实时数据" width="120"></el-table-column>
            <el-table-column prop="unit" label="单位" width="80"></el-table-column>
            <el-table-column prop="updateTime" label="更新时间" width="180"></el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>

      <template #footer>
        <el-button @click="detailVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import * as echarts from 'echarts'
import { getSPCDeviceList, getSPCDeviceDetail } from '@/api/equipment/spcAPI'

// 查询表单
const filterForm = reactive({
  workshop: '',
  model: '',
  name: ''
})

// 车间选项
const workshopOptions = ['C2', 'C3', 'C4', 'C5', 'C6']

// 设备列表
const deviceList = ref([])
const currentPage = ref(1)
const pageSize = ref(8)
const total = ref(0)

// 设备详情
const detailVisible = ref(false)
const currentDevice = ref({})
const activeTab = ref('output')

// 状态样式映射
const getStatusClass = (status) => {
  switch (status) {
    case '运行中': return 'status-running'
    case '待机中': return 'status-standby'
    case '故障中': return 'status-fault'
    case '维护中': return 'status-maintenance'
    default: return ''
  }
}

// 自定义进度条颜色
const customColors = [
  { color: '#f56c6c', percentage: 20 },
  { color: '#e6a23c', percentage: 40 },
  { color: '#5cb87a', percentage: 60 },
  { color: '#1989fa', percentage: 80 },
  { color: '#6f7ad3', percentage: 100 }
]

// 加载设备列表
const loadDeviceList = async () => {
  try {
    const params = {
      page: currentPage.value,
      size: pageSize.value,
      workshop: filterForm.workshop,
      model: filterForm.model,
      name: filterForm.name
    }

    const result = await getSPCDeviceList(params)
    deviceList.value = result.list
    total.value = result.total
  } catch (error) {
    ElMessage.error('加载设备列表失败')
  }
}

// 查询处理
const handleSearch = () => {
  currentPage.value = 1
  loadDeviceList()
}

// 重置查询条件
const resetFilter = () => {
  filterForm.workshop = ''
  filterForm.model = ''
  filterForm.name = ''
  handleSearch()
}

// 分页变化
const handlePageChange = (page) => {
  currentPage.value = page
  loadDeviceList()
}

// 显示设备详情
const showDeviceDetail = async (device) => {
  try {
    const detail = await getSPCDeviceDetail(device.id)
    currentDevice.value = detail
    detailVisible.value = true

    // 确保DOM更新后初始化图表
    nextTick(() => {
      initOutputChart()
      initYieldChart()
    })
  } catch (error) {
    ElMessage.error('加载设备详情失败')
  }
}

// 初始化产量图表
const initOutputChart = () => {
  const chartDom = document.getElementById('outputChart')
  if (!chartDom) return

  const chart = echarts.init(chartDom)
  const option = {
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: ['计划产量', '实际产量']
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: '计划产量',
        type: 'line',
        data: [12000, 12500, 13000, 13200, 13500, 12800, 14000]
      },
      {
        name: '实际产量',
        type: 'line',
        data: [11800, 12300, 12800, 13000, 13250, 12500, 13800],
        lineStyle: {
          width: 4
        }
      }
    ]
  }

  chart.setOption(option)

  // 响应窗口大小变化
  window.addEventListener('resize', () => {
    chart.resize()
  })
}

// 初始化良率图表
const initYieldChart = () => {
  const chartDom = document.getElementById('yieldChart')
  if (!chartDom) return

  const chart = echarts.init(chartDom)
  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      right: 10,
      top: 'center',
      data: ['良品', '一般不良', '严重不良', '其他']
    },
    series: [
      {
        name: '良率分布',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: '18',
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: false
        },
        data: [
          { value: 98.5, name: '良品' },
          { value: 0.8, name: '一般不良' },
          { value: 0.5, name: '严重不良' },
          { value: 0.2, name: '其他' }
        ]
      }
    ]
  }

  chart.setOption(option)

  // 响应窗口大小变化
  window.addEventListener('resize', () => {
    chart.resize()
  })
}

// 实时曲线按钮
const showRealTimeChart = (param) => {
  ElMessage.info(`显示 ${param.param} 的实时曲线`)
}

// 历史查询按钮
const showHistoryQuery = (param) => {
  ElMessage.info(`查询 ${param.param} 的历史数据`)
}

// 初始化加载设备列表
onMounted(() => {
  loadDeviceList()
})
</script>

<style scoped>
.spc-container {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: calc(100vh - 40px);
}

.filter-container {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  margin-bottom: 20px;
}

.filter-form {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
}

.device-container {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
}

.device-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.device-card {
  border: 1px solid #ebeef5;
  border-radius: 8px;
  padding: 15px;
  background-color: #fff;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  cursor: pointer;
  transition: all 0.3s ease;
  height: 300px;
  display: flex;
  flex-direction: column;
}

.device-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
  border-color: #409eff;
}

.device-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  padding-bottom: 10px;
  border-bottom: 1px solid #ebeef5;
}

.device-name {
  font-size: 18px;
  font-weight: bold;
  color: #303133;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.device-status {
  font-size: 12px;
  padding: 4px 8px;
  border-radius: 4px;
  color: #fff;
}

.status-running {
  background-color: #67c23a;
}

.status-standby {
  background-color: #909399;
}

.status-fault {
  background-color: #f56c6c;
}

.status-maintenance {
  background-color: #e6a23c;
}

.device-info {
  flex: 1;
}

.info-item {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  font-size: 14px;
  color: #606266;
}

.info-item i {
  margin-right: 8px;
  color: #409eff;
  width: 20px;
  text-align: center;
}

.device-metrics {
  display: flex;
  justify-content: space-between;
  margin: 15px 0;
}

.metric-item {
  text-align: center;
  flex: 1;
  padding: 5px;
}

.metric-label {
  font-size: 12px;
  color: #909399;
  margin-bottom: 4px;
}

.metric-value {
  font-size: 18px;
  font-weight: bold;
  color: #303133;
}

.alarm-active {
  color: #f56c6c;
  animation: blink 1s infinite;
}

@keyframes blink {
  0% { opacity: 1; }
  50% { opacity: 0.5; }
  100% { opacity: 1; }
}

.device-last-update {
  font-size: 12px;
  color: #909399;
  text-align: right;
  padding-top: 10px;
  border-top: 1px solid #ebeef5;
}

.device-last-update i {
  margin-right: 5px;
}

.empty-container {
  padding: 50px 0;
  text-align: center;
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

/* 详情弹窗样式 */
.spc-detail-dialog {
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.output-metrics {
  margin-bottom: 20px;
}

.metric-card {
  background: #f8f9fc;
  border-radius: 8px;
  padding: 20px;
  height: 150px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.metric-title {
  font-size: 16px;
  color: #606266;
  margin-bottom: 10px;
}

.metric-value {
  font-size: 18px;
  font-weight: bold;
  color: #303133;
}

.metric-change {
  font-size: 14px;
  color: #909399;
}

.increase {
  color: #67c23a;
}

.decrease {
  color: #f56c6c;
}

.metric-duration {
  font-size: 14px;
  color: #909399;
}

.metric-progress {
  margin-top: 10px;
}

.chart-container {
  background: #fff;
  border-radius: 8px;
  padding: 15px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  margin-bottom: 20px;
}

.chart-container h3 {
  margin-top: 0;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid #ebeef5;
  color: #303133;
}

/* SOP看板样式 */
.sop-container {
  display: flex;
  height: 500px;
}

.sop-content {
  flex: 3;
  padding-right: 20px;
  border-right: 1px solid #ebeef5;
}

.sop-steps {
  padding: 20px;
}

.sop-attachments {
  flex: 1;
  padding-left: 20px;
}

.attachment-list {
  margin-top: 20px;
}

.attachment-item {
  display: flex;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #ebeef5;
}

.attachment-item i {
  margin-right: 10px;
  color: #409eff;
}

.file-name {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 报警值样式 */
.alarm-value {
  color: #f56c6c;
  font-weight: bold;
}

.warning-value {
  color: #e6a23c;
  font-weight: bold;
}
</style>
