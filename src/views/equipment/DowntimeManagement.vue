<template>
  <div class="equipment-stop-management">
    <div class="header">
      <h1>设备停机管理</h1>
      <div class="subtitle">
        <p>EQUIPMENT STOP MANAGEMENT</p>
      </div>
    </div>

    <div class="time-filter">
      <el-date-picker
          v-model="timeRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          @change="handleTimeChange"
      />
      <el-select v-model="selectedWorkshop" placeholder="选择车间" clearable>
        <el-option
            v-for="item in workshops"
            :key="item.value"
            :label="item.label"
            :value="item.value"
        />
      </el-select>
      <el-button type="primary" @click="fetchData">查询</el-button>
    </div>

    <div class="dashboard">
      <!-- 第一行：关键指标 -->
      <div class="row">
        <div class="col">
          <div class="card">
            <h3>年良品趋势报表</h3>
            <div class="chart-container">
              <line-chart :data="yieldTrendData" :options="yieldTrendOptions" />
            </div>
          </div>
        </div>
        <div class="col">
          <div class="card">
            <h3>MTBF 报表</h3>
            <div class="indicator">
              <span class="value">{{ mtbf }} <small>小时</small></span>
              <span class="description">即平均无故障工作时间，数值越高表示设备性能越稳定</span>
            </div>
            <div class="chart-container">
              <bar-chart :data="mtbfData" :options="mtbfOptions" />
            </div>
          </div>
        </div>
        <div class="col">
          <div class="card">
            <h3>MTTR 报表</h3>
            <div class="indicator">
              <span class="value">{{ mttr }} <small>小时</small></span>
              <span class="description">即平均故障修复时间，数值越低表示技术团队维护能力越强</span>
            </div>
            <div class="chart-container">
              <bar-chart :data="mttrData" :options="mttrOptions" />
            </div>
          </div>
        </div>
      </div>

      <!-- 第二行：停机密度和停机次数排名 -->
      <div class="row">
        <div class="col">
          <div class="card">
            <h3>MDF 停机密度</h3>
            <p>查看各班次停机次数、有效运行时间，计算停机密度：趋势图展示</p>
            <div class="chart-container">
              <line-chart :data="downtimeDensityData" :options="downtimeDensityOptions" />
            </div>
          </div>
        </div>
        <div class="col">
          <div class="card">
            <h3>设备停机 Down</h3>
            <p>停机次数排名前20次的设备</p>
            <el-table :data="top20DowntimeByCount" style="width: 100%" height="400">
              <el-table-column prop="rank" label="排名" width="80" />
              <el-table-column prop="equipmentName" label="设备名称" />
              <el-table-column prop="workshop" label="所属车间" />
              <el-table-column prop="manufacturer" label="设备厂商" />
              <el-table-column prop="station" label="工站" />
              <el-table-column prop="downtimeCount" label="停机次数" />
            </el-table>
          </div>
        </div>
      </div>

      <!-- 第三行：停机分析总表 -->
      <div class="row">
        <div class="col">
          <div class="card">
            <h3>停机分析总表(DOA)</h3>
            <el-table
                :data="downtimeAnalysis"
                style="width: 100%"
                height="500"
                @sort-change="handleSortChange"
            >
              <el-table-column prop="equipmentName" label="设备名称" sortable />
              <el-table-column prop="totalUptime" label="总开机时长(小时)" sortable />
              <el-table-column prop="totalRuntime" label="总运行时长(小时)" sortable />
              <el-table-column prop="downtimeFrequency" label="停机频率" sortable />
              <el-table-column prop="mtbf" label="MTBF(小时)" sortable />
              <el-table-column prop="mtba" label="MTBA(小时)" sortable />
              <el-table-column prop="maxRuntime" label="最大运行时长(小时)" sortable />
              <el-table-column prop="longestContinuousRuntime" label="最长连续运行时间(小时)" sortable />
              <el-table-column prop="downtimeCount" label="停机次数" sortable />
              <el-table-column prop="downtimeDuration" label="停机时间(小时)" sortable />
              <el-table-column prop="standbyCount" label="待机次数" sortable />
              <el-table-column prop="standbyDuration" label="待机时间(小时)" sortable />
              <el-table-column prop="utilizationRate" label="稼动率(%)" sortable />
            </el-table>
          </div>
        </div>
      </div>

      <!-- 第四行：停机/待机分析和排名 -->
      <div class="row">
        <div class="col">
          <div class="card">
            <h3>停机/待机分析 (RNSB)</h3>
            <div class="chart-container">
              <pie-chart :data="downtimeStandbyAnalysisData" :options="downtimeStandbyAnalysisOptions" />
            </div>
          </div>
        </div>
        <div class="col">
          <div class="card">
            <h3>停机排名按次数</h3>
            <el-table :data="downtimeRankByCount" style="width: 100%" height="400">
              <el-table-column prop="rank" label="排名" width="80" />
              <el-table-column prop="equipmentName" label="设备名称" />
              <el-table-column prop="downtimeCount" label="停机次数" />
            </el-table>
          </div>
        </div>
        <div class="col">
          <div class="card">
            <h3>停机排名按时间</h3>
            <el-table :data="downtimeRankByDuration" style="width: 100%" height="400">
              <el-table-column prop="rank" label="排名" width="80" />
              <el-table-column prop="equipmentName" label="设备名称" />
              <el-table-column prop="downtimeDuration" label="停机时间(小时)" />
            </el-table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import LineChart from '../../components/charts/LineChart.vue'
import BarChart from '../../components/charts/BarChart.vue'
import PieChart from '../../components/charts/PieChart.vue'

export default {
  name: 'EquipmentStopManagement',
  components: {
    LineChart,
    BarChart,
    PieChart
  },
  setup() {
    // 时间范围选择
    const timeRange = ref([new Date(new Date().getFullYear(), 0, 1), new Date()])
    const selectedWorkshop = ref('')

    // 车间选项
    const workshops = ref([
      { value: 'workshop1', label: '车间一' },
      { value: 'workshop2', label: '车间二' },
      { value: 'workshop3', label: '车间三' }
    ])

    // 关键指标
    const mtbf = ref(120.5)
    const mttr = ref(2.3)

    // 图表数据
    const yieldTrendData = ref({
      labels: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
      datasets: [
        {
          label: '良品率(%)',
          data: [95, 96, 97, 96.5, 97.2, 97.8, 98, 98.2, 98.5, 98.3, 98.6, 98.8],
          borderColor: '#36a2eb',
          backgroundColor: '#9bd0f5',
          tension: 0.1
        }
      ]
    })

    const yieldTrendOptions = ref({
      responsive: true,
      plugins: {
        legend: {
          position: 'top'
        },
        title: {
          display: true,
          text: '年良品趋势'
        }
      },
      scales: {
        y: {
          min: 90,
          max: 100
        }
      }
    })

    const mtbfData = ref({
      labels: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
      datasets: [
        {
          label: 'MTBF(小时)',
          data: [110, 115, 118, 120, 122, 121, 123, 125, 124, 126, 128, 130],
          backgroundColor: '#4bc0c0'
        }
      ]
    })

    const mtbfOptions = ref({
      responsive: true,
      plugins: {
        legend: {
          position: 'top'
        },
        title: {
          display: true,
          text: 'MTBF趋势'
        }
      }
    })

    const mttrData = ref({
      labels: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
      datasets: [
        {
          label: 'MTTR(小时)',
          data: [3.2, 3.0, 2.8, 2.7, 2.5, 2.4, 2.3, 2.2, 2.1, 2.0, 1.9, 1.8],
          backgroundColor: '#ff6384'
        }
      ]
    })

    const mttrOptions = ref({
      responsive: true,
      plugins: {
        legend: {
          position: 'top'
        },
        title: {
          display: true,
          text: 'MTTR趋势'
        }
      }
    })

    const downtimeDensityData = ref({
      labels: ['早班', '中班', '晚班'],
      datasets: [
        {
          label: '停机密度',
          data: [0.12, 0.08, 0.15],
          borderColor: '#ff9f40',
          backgroundColor: '#ffcd56',
          tension: 0.1
        }
      ]
    })

    const downtimeDensityOptions = ref({
      responsive: true,
      plugins: {
        legend: {
          position: 'top'
        },
        title: {
          display: true,
          text: '各班次停机密度'
        }
      }
    })

    // 停机次数排名前20的设备
    const top20DowntimeByCount = ref(Array.from({ length: 20 }, (_, i) => ({
      rank: i + 1,
      equipmentName: `设备${i + 1}`,
      workshop: `车间${(i % 3) + 1}`,
      manufacturer: ['厂商A', '厂商B', '厂商C'][i % 3],
      station: `工站${(i % 5) + 1}`,
      downtimeCount: Math.floor(Math.random() * 50) + 10
    })))

    // 停机分析总表数据
    const downtimeAnalysis = ref(Array.from({ length: 30 }, (_, i) => ({
      equipmentName: `设备${i + 1}`,
      totalUptime: (Math.random() * 1000 + 500).toFixed(1),
      totalRuntime: (Math.random() * 900 + 400).toFixed(1),
      downtimeFrequency: (Math.random() * 0.5 + 0.1).toFixed(3),
      mtbf: (Math.random() * 200 + 50).toFixed(1),
      mtba: (Math.random() * 150 + 40).toFixed(1),
      maxRuntime: (Math.random() * 300 + 100).toFixed(1),
      longestContinuousRuntime: (Math.random() * 250 + 80).toFixed(1),
      downtimeCount: Math.floor(Math.random() * 50) + 5,
      downtimeDuration: (Math.random() * 100 + 20).toFixed(1),
      standbyCount: Math.floor(Math.random() * 30) + 3,
      standbyDuration: (Math.random() * 80 + 15).toFixed(1),
      utilizationRate: (Math.random() * 20 + 75).toFixed(1)
    })))

    // 停机/待机分析数据
    const downtimeStandbyAnalysisData = ref({
      labels: ['计划停机', '故障停机', '待机'],
      datasets: [
        {
          data: [35, 45, 20],
          backgroundColor: ['#36a2eb', '#ff6384', '#ffcd56']
        }
      ]
    })

    const downtimeStandbyAnalysisOptions = ref({
      responsive: true,
      plugins: {
        legend: {
          position: 'right'
        },
        title: {
          display: true,
          text: '停机/待机分析'
        }
      }
    })

    // 停机排名按次数
    const downtimeRankByCount = ref(Array.from({ length: 15 }, (_, i) => ({
      rank: i + 1,
      equipmentName: `设备${i + 1}`,
      downtimeCount: Math.floor(Math.random() * 60) + 15
    })))

    // 停机排名按时间
    const downtimeRankByDuration = ref(Array.from({ length: 15 }, (_, i) => ({
      rank: i + 1,
      equipmentName: `设备${i + 1}`,
      downtimeDuration: (Math.random() * 120 + 30).toFixed(1)
    })))

    // 方法
    const handleTimeChange = (val) => {
      console.log('时间范围变更:', val)
      // 这里可以添加时间范围变更后的逻辑
    }

    const handleSortChange = ({ column, prop, order }) => {
      console.log('排序变更:', column, prop, order)
      // 这里可以添加排序变更后的逻辑
    }

    const fetchData = () => {
      console.log('查询数据:', timeRange.value, selectedWorkshop.value)
      // 这里可以添加数据获取逻辑
    }

    // 生命周期钩子
    onMounted(() => {
      fetchData()
    })

    return {
      timeRange,
      selectedWorkshop,
      workshops,
      mtbf,
      mttr,
      yieldTrendData,
      yieldTrendOptions,
      mtbfData,
      mtbfOptions,
      mttrData,
      mttrOptions,
      downtimeDensityData,
      downtimeDensityOptions,
      top20DowntimeByCount,
      downtimeAnalysis,
      downtimeStandbyAnalysisData,
      downtimeStandbyAnalysisOptions,
      downtimeRankByCount,
      downtimeRankByDuration,
      handleTimeChange,
      handleSortChange,
      fetchData
    }
  }
}
</script>

<style scoped>
.equipment-stop-management {
  padding: 20px;
  font-family: Arial, sans-serif;
}

.header {
  text-align: center;
  margin-bottom: 30px;
}

.header h1 {
  font-size: 28px;
  color: #333;
  margin-bottom: 5px;
}

.subtitle p {
  font-size: 16px;
  color: #666;
  letter-spacing: 2px;
}

.time-filter {
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
  align-items: center;
}

.dashboard {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.row {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}

.col {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.card {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  padding: 20px;
}

.card h3 {
  margin-top: 0;
  margin-bottom: 15px;
  color: #333;
  font-size: 18px;
}

.chart-container {
  height: 300px;
  position: relative;
}

.indicator {
  text-align: center;
  margin-bottom: 20px;
}

.indicator .value {
  font-size: 32px;
  font-weight: bold;
  color: #409eff;
  display: block;
}

.indicator .description {
  font-size: 14px;
  color: #666;
  display: block;
  margin-top: 10px;
}

.el-table {
  margin-top: 15px;
}
</style>
