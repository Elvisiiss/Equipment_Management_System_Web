<template>
  <div class="dashboard">
    <el-row :gutter="20">
      <el-col :span="24">
        <el-page-header @back="goBack" content="备件管理数据大屏" />
      </el-col>
    </el-row>

    <el-row :gutter="20" class="mt-20">
      <!-- 库存概览卡片 -->
      <el-col :span="6">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>库存概览</span>
            </div>
          </template>
          <div class="summary-item">
            <div class="summary-label">总库存价值</div>
            <div class="summary-value">¥1,245,680</div>
          </div>
          <div class="summary-item">
            <div class="summary-label">库存种类</div>
            <div class="summary-value">86种</div>
          </div>
          <div class="summary-item">
            <div class="summary-label">周转率</div>
            <div class="summary-value">78%</div>
          </div>
        </el-card>
      </el-col>

      <!-- 待入库概览 -->
      <el-col :span="6">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>待入库管理</span>
              <el-tag type="warning">待处理: 8</el-tag>
            </div>
          </template>
          <div class="summary-item">
            <div class="summary-label">待入库批次</div>
            <div class="summary-value">5批</div>
          </div>
          <div class="summary-item">
            <div class="summary-label">待验货物</div>
            <div class="summary-value">328件</div>
          </div>
          <el-progress :percentage="60" status="warning" />
        </el-card>
      </el-col>

      <!-- 出库审核概览 -->
      <el-col :span="6">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>出库审核</span>
              <el-tag type="danger">待审核: 6</el-tag>
            </div>
          </template>
          <div class="summary-item">
            <div class="summary-label">今日申请</div>
            <div class="summary-value">12单</div>
          </div>
          <div class="summary-item">
            <div class="summary-label">待出库量</div>
            <div class="summary-value">156件</div>
          </div>
          <el-progress :percentage="30" status="exception" />
        </el-card>
      </el-col>

      <!-- 库存健康度 -->
      <el-col :span="6">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>库存健康度</span>
            </div>
          </template>
          <div class="summary-item">
            <div class="summary-label">呆滞库存</div>
            <div class="summary-value">12.5%</div>
          </div>
          <div class="summary-item">
            <div class="summary-label">缺货率</div>
            <div class="summary-value">3.2%</div>
          </div>
          <el-progress :percentage="88" status="success" />
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="mt-20">
      <!-- 库存分类统计 -->
      <el-col :span="12">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>库存分类统计</span>
            </div>
          </template>
          <div class="chart-container">
            <div ref="categoryChart" style="height: 300px;"></div>
          </div>
        </el-card>
      </el-col>

      <!-- 出入库趋势 -->
      <el-col :span="12">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>出入库趋势</span>
            </div>
          </template>
          <div class="chart-container">
            <div ref="trendChart" style="height: 300px;"></div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="mt-20">
      <!-- 最近操作记录 -->
      <el-col :span="24">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>最近操作记录</span>
            </div>
          </template>
          <el-table :data="recentOperations" style="width: 100%">
            <el-table-column prop="time" label="时间" width="180" />
            <el-table-column prop="type" label="类型" width="120">
              <template #default="scope">
                <el-tag :type="scope.row.type === '入库' ? 'success' : 'primary'">
                  {{ scope.row.type }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="operator" label="操作人" width="120" />
            <el-table-column prop="details" label="详情" />
            <el-table-column prop="status" label="状态" width="100">
              <template #default="scope">
                <el-tag :type="scope.row.status === '已完成' ? 'success' : 'warning'">
                  {{ scope.row.status }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import * as echarts from 'echarts'

// 模拟数据
const recentOperations = ref([
  { time: '2023-07-25 10:30', type: '入库', operator: '张工', details: '服务器备件批次#IN23072501', status: '已完成' },
  { time: '2023-07-25 09:15', type: '出库', operator: '李工', details: '项目A领用备件申请#OUT23072503', status: '已完成' },
  { time: '2023-07-24 16:20', type: '入库', operator: '王工', details: '网络设备备件批次#IN23072402', status: '已完成' },
  { time: '2023-07-24 14:45', type: '出库', operator: '赵工', details: '紧急维修领用申请#OUT23072405', status: '已完成' },
  { time: '2023-07-24 11:10', type: '入库', operator: '张工', details: '存储设备备件批次#IN23072401', status: '已完成' }
])

const categoryChart = ref(null)
const trendChart = ref(null)

onMounted(() => {
  // 初始化库存分类图表
  const categoryChartInstance = echarts.init(categoryChart.value)
  categoryChartInstance.setOption({
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      right: 10,
      top: 'center',
      data: ['服务器备件', '网络设备', '存储设备', '安全设备', '其他']
    },
    series: [
      {
        name: '库存分类',
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
          { value: 35, name: '服务器备件' },
          { value: 25, name: '网络设备' },
          { value: 20, name: '存储设备' },
          { value: 15, name: '安全设备' },
          { value: 5, name: '其他' }
        ]
      }
    ]
  })

  // 初始化出入库趋势图表
  const trendChartInstance = echarts.init(trendChart.value)
  trendChartInstance.setOption({
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: ['入库量', '出库量']
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
      data: ['7/19', '7/20', '7/21', '7/22', '7/23', '7/24', '7/25']
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: '入库量',
        type: 'line',
        smooth: true,
        data: [120, 132, 101, 134, 90, 230, 210]
      },
      {
        name: '出库量',
        type: 'line',
        smooth: true,
        data: [220, 182, 191, 234, 290, 330, 310]
      }
    ]
  })

  // 响应窗口变化
  window.addEventListener('resize', () => {
    categoryChartInstance.resize()
    trendChartInstance.resize()
  })
})

const goBack = () => {
  console.log('返回操作')
}
</script>

<style scoped>
.dashboard {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: 100vh;
}

.mt-20 {
  margin-top: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.summary-item {
  margin-bottom: 15px;
}

.summary-label {
  font-size: 14px;
  color: #909399;
}

.summary-value {
  font-size: 24px;
  font-weight: bold;
  margin-top: 5px;
}

.chart-container {
  width: 100%;
}
</style>
