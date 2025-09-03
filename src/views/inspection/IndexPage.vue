<template>
  <!-- 设备点检管理看板 - 科技风 -->
  <div class="equipment-screen">
    <!-- 顶部导航栏 -->
    <div class="navbar">
      <div class="nav-item">时间{{ currentTime }}</div>
      <h1 class="title">设备点检管理看板</h1>
      <div class="nav-item">
        <!-- 车间下拉框 -->
        <el-select
            v-model="filterForm.workshop"
            multiple
            collapse-tags
            collapse-tags-tooltip
            placeholder="车间"
            clearable
            @change="handleWorkshopChange"
            class="nav-select"
            style="width: 120px; margin-right: 10px;"
        >
          <el-option
              v-for="ws in workshopOptions"
              :key="ws.value"
              :label="ws.label"
              :value="ws.value"
          ></el-option>
        </el-select>

        <!-- 产线下拉框 -->
        <el-select
            v-model="filterForm.line"
            multiple
            collapse-tags
            collapse-tags-tooltip
            placeholder="产线"
            clearable
            :disabled="filterForm.workshop.length === 0"
            @change="handleLineChange"
            class="nav-select"
            style="width: 120px; margin-right: 10px;"
        >
          <el-option
              v-for="line in lineOptions"
              :key="line.value"
              :label="line.label"
              :value="line.value"
          ></el-option>
        </el-select>

        <!-- 修改这里：将文字按钮改为图标按钮 -->
        <el-button type="text" @click="handleFullScreenChange" :icon="FullScreen" class="fullscreen-btn" />
      </div>
    </div>

    <!-- 状态卡片 -->
    <div class="status-cards">
      <div class="card" style="background-color: #4F52D7FF;">总点检任务 285</div>
      <div class="card" style="background-color: #4CAF50;">已完成 245</div>
      <div class="card" style="background-color: #E6A23C;">进行中 25</div>
      <div class="card" style="background-color: #D32F2F;">超时未检 15</div>
      <div class="card" style="background-color: #5B8FF9;">点检完成率 86%</div>
      <div class="card" style="background-color: #13C2C2;">准时率 92%</div>
      <div class="card" style="background-color: #F56C6C;">异常率 7.3%</div>
    </div>

    <!-- 第二行：饼图 -->
    <el-row :gutter="16" class="chart-row">
      <el-col :span="8">
        <div class="chart-card">
          <div class="chart-header">
            <h3><i class="el-icon-pie-chart"></i> 点检完成情况</h3>
            <el-button type="text" @click="goManage">详情</el-button>
          </div>
          <div class="chart-container">
            <v-chart :option="completionPieOption" autoresize style="height: 100%;" />
          </div>
        </div>
      </el-col>
      <el-col :span="8">
        <div class="chart-card">
          <div class="chart-header">
            <h3><i class="el-icon-data-line"></i> 点检结果分布</h3>
            <el-button type="text" @click="goManage">详情</el-button>
          </div>
          <div class="chart-container">
            <v-chart :option="resultPieOption" autoresize style="height: 100%;" />
          </div>
        </div>
      </el-col>
      <el-col :span="8">
        <div class="chart-card">
          <div class="chart-header">
            <h3><i class="el-icon-alarm-clock"></i> 点检准时率</h3>
            <el-button type="text" @click="goManage">详情</el-button>
          </div>
          <div class="chart-container">
            <v-chart :option="punctualityGaugeOption" autoresize style="height: 100%;" />
          </div>
        </div>
      </el-col>
    </el-row>

    <!-- 第三行：点检趋势 + 异常排名 -->
    <el-row :gutter="16" class="chart-row">
      <el-col :span="12">
        <div class="chart-card">
          <div class="chart-header">
            <h3><i class="el-icon-trend-charts"></i> 本周点检完成趋势</h3>
            <el-button type="text" @click="goManage">详情</el-button>
          </div>
          <div class="chart-container">
            <v-chart :option="trendLineOption" autoresize style="height: 100%;" />
          </div>
        </div>
      </el-col>
      <el-col :span="12">
        <div class="chart-card">
          <div class="chart-header">
            <h3><i class="el-icon-warning-outline"></i> 异常点检排名</h3>
            <el-button type="text" @click="goManage">详情</el-button>
          </div>
          <div class="table-container">
            <el-table :data="abnormalRank" size="small" style="width: 100%; height: 100%;" @row-click="() => goManage()">
              <el-table-column type="index" width="50" align="center" />
              <el-table-column prop="equipment" label="设备名称" show-overflow-tooltip min-width="120" />
              <el-table-column prop="item" label="点检项目" show-overflow-tooltip min-width="120" />
              <el-table-column prop="abnormalType" label="异常类型" width="100" align="center" />
              <el-table-column prop="time" label="发现时间" width="140" align="center" />
              <el-table-column prop="status" label="处理状态" width="100" align="center">
                <template #default="scope">
                  <el-tag :type="scope.row.status === '已处理' ? 'success' : 'danger'" size="small">
                    {{ scope.row.status }}
                  </el-tag>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </div>
      </el-col>
    </el-row>

    <!-- 第四行：点检计划 + 人员绩效 -->
    <el-row :gutter="16" class="chart-row">
      <el-col :span="12">
        <div class="chart-card">
          <div class="chart-header">
            <h3><i class="el-icon-date"></i> 今日点检计划</h3>
            <el-button type="text" @click="goManage">详情</el-button>
          </div>
          <div class="table-container">
            <el-table :data="todayPlan" size="small" style="width: 100%; height: 100%;" @row-click="() => goManage()">
              <el-table-column type="index" width="50" align="center" />
              <el-table-column prop="equipment" label="设备名称" show-overflow-tooltip min-width="120" />
              <el-table-column prop="planTime" label="计划时间" width="100" align="center" />
              <el-table-column prop="inspector" label="负责人" width="100" align="center" />
              <el-table-column prop="status" label="状态" width="100" align="center">
                <template #default="scope">
                  <el-tag
                      :type="scope.row.status === '已完成' ? 'success' :
                           (scope.row.status === '进行中' ? 'warning' : 'info')"
                      size="small">
                    {{ scope.row.status }}
                  </el-tag>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </div>
      </el-col>
      <el-col :span="12">
        <div class="chart-card">
          <div class="chart-header">
            <h3><i class="el-icon-user-solid"></i> 点检人员绩效</h3>
            <el-button type="text" @click="goManage">详情</el-button>
          </div>
          <div class="chart-container">
            <v-chart :option="performanceBarOption" autoresize style="height: 100%;" />
          </div>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { ref, onMounted, reactive, inject, watch, onBeforeUnmount } from 'vue'
import * as echarts from 'echarts/core'
import { PieChart, LineChart, BarChart, GaugeChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent
} from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import VChart from 'vue-echarts'
import { FullScreen } from '@element-plus/icons-vue'

// 注册图表
echarts.use([
  PieChart,
  LineChart,
  BarChart,
  GaugeChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  CanvasRenderer
])

const router = useRouter()
const goManage = () => {
  router.push('/equipment/inspection/manage')
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

// 全屏相关逻辑
const route = useRouter()
const fullScreen = ref(false)

watch(() => route.currentRoute.value.path, (newPath) => {
  if (newPath !== '/equipment/inspection/screen') {
    fullScreen.value = false
  }
})

// 注入全局全屏状态和方法
const isFullScreen = inject('isFullScreen')
const toggleFullScreen = inject('toggleFullScreen')

// 移除原有的fullScreen变量和本地切换逻辑
const handleFullScreenChange = () => {
  toggleFullScreen() // 使用全局切换方法
}

// 筛选表单
const filterForm = reactive({
  workshop: [],
  line: [],
})

const workshopOptions = ref([
  { value: 'all', label: '全部车间' },
  { value: 'C2', label: 'C2车间' },
  { value: 'C3', label: 'C3车间' },
  { value: 'C4', label: 'C4车间' },
  { value: 'C5', label: 'C5车间' },
  { value: 'C6', label: 'C6车间' }
])

const lineOptions = ref([])

const workshopLineMap = {
  C2: ['31', '32', '33', '34', '35', '36'],
  C3: ['41', '42', '43', '44', '45', '46'],
  C4: ['51', '52', '53', '54', '55', '56'],
  C5: ['61', '62', '63', '64', '65', '66'],
  C6: ['71', '72', '73', '74', '75', '76']
}

const handleWorkshopChange = () => {
  if (filterForm.workshop.includes('all')) {
    filterForm.workshop = ['all']
  } else if (filterForm.workshop.length === 0) {
    filterForm.line = []
    lineOptions.value = []
    return
  }

  filterForm.line = []
  const lines = []

  if (filterForm.workshop.includes('all')) {
    lineOptions.value = [{ value: 'all', label: '全部产线' }]
    for (const workshop in workshopLineMap) {
      lineOptions.value.push({
        value: `${workshop}-all`,
        label: `${workshop}车间全部产线`
      })
      lines.push(...workshopLineMap[workshop])
    }
  } else {
    lineOptions.value = [{ value: 'all', label: '全部产线' }]
    filterForm.workshop.forEach(ws => {
      lineOptions.value.push({
        value: `${ws}-all`,
        label: `${ws}车间全部产线`
      })
      if (workshopLineMap[ws]) {
        lines.push(...workshopLineMap[ws])
      }
    })
  }

  const uniqueLines = [...new Set(lines)]
  uniqueLines.forEach(line => {
    lineOptions.value.push({
      value: line,
      label: `${line}产线`
    })
  })

  handleFilter()
}

const handleLineChange = () => {
  if (filterForm.line.includes('all')) {
    filterForm.line = ['all']
  } else if (filterForm.line.some(item => item.includes('-all'))) {
    const workshopAlls = filterForm.line.filter(item => item.includes('-all'))
    filterForm.line = workshopAlls
  }

  handleFilter()
}

const handleFilter = () => {
  console.log('筛选条件:', filterForm)
}

// 点检完成情况饼图
const completionPieOption = ref({
  tooltip: {trigger: 'item'},
  legend: {
    orient: 'vertical',
    right: 10,
    top: 'center',
    textStyle: {color: '#fff'}
  },
  series: [
    {
      name: '点检完成情况',
      type: 'pie',
      radius: ['40%', '70%'],
      label: {show: false, position: 'center'},
      emphasis: {
        label: {
          show: true,
          fontSize: 18,
          fontWeight: 'bold',
          color: '#fff'
        }
      },
      labelLine: {show: false},
      data: [
        {value: 245, name: '已完成', itemStyle: {color: '#67C23A'}},
        {value: 25, name: '进行中', itemStyle: {color: '#E6A23C'}},
        {value: 15, name: '未完成', itemStyle: {color: '#F56C6C'}}
      ]
    }
  ]
})

// 点检结果分布饼图
const resultPieOption = ref({
  tooltip: {trigger: 'item'},
  legend: {
    orient: 'vertical',
    right: 10,
    top: 'center',
    textStyle: {color: '#fff'}
  },
  series: [
    {
      name: '点检结果',
      type: 'pie',
      radius: ['40%', '70%'],
      label: {show: false, position: 'center'},
      emphasis: {
        label: {
          show: true,
          fontSize: 18,
          fontWeight: 'bold',
          color: '#fff'
        }
      },
      labelLine: {show: false},
      data: [
        {value: 227, name: '正常', itemStyle: {color: '#67C23A'}},
        {value: 18, name: '异常', itemStyle: {color: '#F56C6C'}},
        {value: 15, name: '未点检', itemStyle: {color: '#909399'}}
      ]
    }
  ]
})

// 点检准时率仪表盘
const punctualityGaugeOption = ref({
  series: [
    {
      type: 'gauge',
      radius: '90%',
      center: ['50%', '60%'],
      startAngle: 180,
      endAngle: 0,
      min: 0,
      max: 100,
      splitNumber: 10,
      axisLine: {
        lineStyle: {
          width: 15,
          color: [
            [0.92, '#FF6E76'],
            [0.95, '#FDDD60'],
            [1, '#67C23A']
          ]
        }
      },
      pointer: {
        icon: 'path://M12.8,0.7l12,40.1H0.7L12.8,0.7z',
        length: '12%',
        width: 10,
        offsetCenter: [0, '-60%'],
        itemStyle: {
          color: 'auto'
        }
      },
      axisTick: {
        length: 8,
        lineStyle: {
          color: 'auto',
          width: 2
        }
      },
      splitLine: {
        length: 15,
        lineStyle: {
          color: 'auto',
          width: 3
        }
      },
      axisLabel: {
        color: '#fff',
        fontSize: 12,
        distance: -40
      },
      detail: {
        valueAnimation: true,
        formatter: '{value}%',
        color: '#fff',
        fontSize: 20,
        offsetCenter: [0, '0%']
      },
      data: [
        {
          value: 92,
          name: '准时率'
        }
      ]
    }
  ]
})

// 点检完成趋势折线图
const trendLineOption = ref({
  tooltip: {
    trigger: 'axis',
    axisPointer: {type: 'shadow'}
  },
  grid: {
    left: '3%',
    right: '4%',
    bottom: '3%',
    containLabel: true
  },
  xAxis: {
    type: 'category',
    data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
    axisLine: {
      lineStyle: {color: '#5B8FF9'}
    },
    axisLabel: {color: '#fff'}
  },
  yAxis: {
    type: 'value',
    axisLabel: {
      formatter: '{value}%',
      color: '#fff'
    },
    splitLine: {
      lineStyle: {color: 'rgba(255, 255, 255, 0.1)'}
    }
  },
  series: [
    {
      name: '完成率',
      data: [85, 88, 92, 90, 86, 83, 89],
      type: 'line',
      smooth: true,
      symbol: 'circle',
      symbolSize: 8,
      itemStyle: {
        color: '#5B8FF9',
        borderColor: '#fff',
        borderWidth: 2
      },
      lineStyle: {
        width: 3,
        color: '#5B8FF9'
      },
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          {offset: 0, color: 'rgba(91, 143, 249, 0.6)'},
          {offset: 1, color: 'rgba(91, 143, 249, 0.1)'}
        ])
      }
    },
    {
      name: '准时率',
      data: [90, 93, 95, 92, 88, 85, 91],
      type: 'line',
      smooth: true,
      symbol: 'circle',
      symbolSize: 8,
      itemStyle: {
        color: '#13C2C2',
        borderColor: '#fff',
        borderWidth: 2
      },
      lineStyle: {
        width: 3,
        color: '#13C2C2'
      }
    }
  ]
})

// 人员绩效柱状图
const performanceBarOption = ref({
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'shadow'
    }
  },
  grid: {
    left: '3%',
    right: '4%',
    bottom: '3%',
    containLabel: true
  },
  xAxis: {
    type: 'category',
    data: ['张三', '李四', '王五', '赵六', '钱七', '孙八'],
    axisLine: {
      lineStyle: {color: '#5B8FF9'}
    },
    axisLabel: {
      color: '#fff',
      interval: 0,
      rotate: 30
    }
  },
  yAxis: {
    type: 'value',
    axisLabel: {
      formatter: '{value}%',
      color: '#fff'
    },
    splitLine: {
      lineStyle: {color: 'rgba(255, 255, 255, 0.1)'}
    }
  },
  series: [
    {
      name: '完成率',
      type: 'bar',
      data: [95, 89, 92, 85, 78, 96],
      itemStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          {offset: 0, color: '#5B8FF9'},
          {offset: 1, color: '#3D5A9A'}
        ])
      }
    },
    {
      name: '准时率',
      type: 'bar',
      data: [98, 92, 95, 88, 82, 97],
      itemStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          {offset: 0, color: '#13C2C2'},
          {offset: 1, color: '#0E8E8E'}
        ])
      }
    }
  ]
})

// 异常点检排名数据
const abnormalRank = ref([
  {equipment: 'C4-51-16', item: '液压系统压力', abnormalType: '偏高', time: '2025-07-21 10:24', status: '已处理'},
  {equipment: 'C4-51-23', item: '电机温度', abnormalType: '过高', time: '2025-07-21 14:30', status: '未处理'},
  {equipment: 'C4-51-24', item: '润滑油位', abnormalType: '过低', time: '2025-07-21 16:45', status: '已处理'},
  {equipment: 'C4-51-21', item: '传送带张力', abnormalType: '异常', time: '2025-07-22 08:15', status: '处理中'},
  {equipment: 'C4-51-19', item: '安全防护装置', abnormalType: '失效', time: '2025-07-22 09:30', status: '未处理'},
  {equipment: 'C4-51-26', item: '控制系统', abnormalType: '通讯故障', time: '2025-07-22 11:20', status: '处理中'},
  {equipment: 'C4-51-22', item: '气动系统', abnormalType: '泄漏', time: '2025-07-22 13:45', status: '已处理'}
])

// 今日点检计划数据
const todayPlan = ref([
  {equipment: 'C4-51-16', planTime: '08:00', inspector: '张三', status: '已完成'},
  {equipment: 'C4-51-23', planTime: '09:30', inspector: '李四', status: '已完成'},
  {equipment: 'C4-51-24', planTime: '10:00', inspector: '王五', status: '已完成'},
  {equipment: 'C4-51-21', planTime: '11:00', inspector: '赵六', status: '进行中'},
  {equipment: 'C4-51-19', planTime: '13:30', inspector: '钱七', status: '未开始'},
  {equipment: 'C4-51-26', planTime: '14:00', inspector: '孙八', status: '未开始'},
  {equipment: 'C4-51-22', planTime: '15:30', inspector: '张三', status: '未开始'}
])

onMounted(() => {
  echarts.registerTheme('dark', {
    backgroundColor: 'transparent',
    textStyle: {color: '#fff'}
  })
})
</script>

<style scoped lang="scss">
// 添加全屏按钮样式
.fullscreen-btn {
  font-size: 25px;
  color: #fff;
  margin-left: 10px;

  &:hover {
    color: #409EFF;
  }
}

.equipment-screen {
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

  // 修改这里：调整状态卡片样式
  .status-cards {
    display: flex;
    justify-content: space-between;
    margin-bottom: 20px;
    width: 100%;
    flex-wrap: wrap;

    .card {
      flex: 1;
      min-width: 130px;
      margin: 0 5px 10px;
      padding: 15px 10px;
      border-radius: 8px;
      color: #fff;
      text-align: center;
      transition: all 0.3s;
      font-size: 16px;
      font-weight: bold;

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

  .chart-row {
    flex: 1;
    min-height: 0;
    margin-bottom: 10px;

    .chart-card {
      height: 100%;
      background: rgba(16, 42, 87, 0.5);
      border-radius: 8px;
      border: 1px solid rgba(64, 158, 255, 0.3);
      box-shadow: 0 0 10px rgba(64, 158, 255, 0.1);
      display: flex;
      flex-direction: column;

      .chart-header {
        padding: 10px 16px;
        border-bottom: 1px solid rgba(64, 158, 255, 0.2);
        display: flex;
        justify-content: space-between;
        align-items: center;

        h3 {
          font-size: 16px;
          font-weight: 500;
          margin: 0;
          display: flex;
          align-items: center;

          i {
            margin-right: 8px;
            color: #409EFF;
          }
        }
      }

      .chart-container {
        flex: 1;
        padding: 10px;
        min-height: 200px;
      }

      .table-container {
        flex: 1;
        padding: 10px;

        :deep(.el-table) {
          background: transparent;

          th {
            background-color: rgba(16, 42, 87, 0.7);
            color: #fff;
          }

          tr {
            background-color: rgba(16, 42, 87, 0.3);
            color: #fff;

            &:hover {
              background-color: rgba(64, 158, 255, 0.2) !important;
            }
          }

          td {
            border-bottom: 1px solid rgba(64, 158, 255, 0.1);
            background-color: transparent;
          }
        }
      }
    }
  }
}

// 导航栏下拉框样式
:deep(.nav-select) {
  .el-input__wrapper {
    background: rgba(16, 42, 87, 0.7);
    border: 1px solid rgba(64, 158, 255, 0.3);
    box-shadow: 0 0 8px rgba(64, 158, 255, 0.3);
    border-radius: 4px;
    transition: all 0.3s;

    &:hover {
      box-shadow: 0 0 12px rgba(64, 158, 255, 0.5);
    }
  }

  .el-input__inner {
    color: #fff;
    font-size: 14px;
    &::placeholder {
      color: rgba(255, 255, 255, 0.6);
    }
  }

  .el-select__tags {
    .el-tag {
      background: rgba(64, 158, 255, 0.3);
      border-color: rgba(64, 158, 255, 0.5);
      color: #fff;
      box-shadow: 0 0 5px rgba(64, 158, 255, 0.2);
    }
  }

  .el-tag__close {
    color: #fff;
    background: transparent;

    &:hover {
      background: rgba(255, 255, 255, 0.2);
    }
  }

  .el-icon {
    color: rgba(255, 255, 255, 0.7);
  }
}

:deep(.el-table) {
  --el-table-border-color: rgba(64, 158, 255, 0.1);
  --el-table-header-text-color: #fff;
  --el-table-text-color: #fff;
  --el-table-row-hover-bg-color: rgba(64, 158, 255, 0.2);
  --el-table-header-bg-color: rgba(16, 42, 87, 0.7);
  --el-table-bg-color: transparent;
  --el-table-tr-bg-color: transparent;
}

:deep(.el-table__empty-block) {
  background: rgba(16, 42, 87, 0.3);
}
</style>
