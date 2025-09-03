<template>
  <!-- 设备维修管理看板 - 科技风 -->
  <div class="equipment-screen">
    <!-- 顶部导航栏 -->
    <div class="navbar">
      <div class="nav-item">时间{{ currentTime }}</div>
      <h1 class="title">设备维修管理中心</h1>
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

        <!-- 维修状态筛选 -->
        <el-select
            v-model="filterForm.status"
            multiple
            collapse-tags
            collapse-tags-tooltip
            placeholder="维修状态"
            clearable
            class="nav-select"
            style="width: 130px; margin-right: 10px;"
        >
          <el-option
              v-for="status in statusOptions"
              :key="status.value"
              :label="status.label"
              :value="status.value"
          ></el-option>
        </el-select>

        <!-- 优先级筛选 -->
        <el-select
            v-model="filterForm.priority"
            multiple
            collapse-tags
            collapse-tags-tooltip
            placeholder="优先级"
            clearable
            class="nav-select"
            style="width: 120px; margin-right: 10px;"
        >
          <el-option
              v-for="priority in priorityOptions"
              :key="priority.value"
              :label="priority.label"
              :value="priority.value"
          ></el-option>
        </el-select>

        <!-- 修改这里：将文字按钮改为图标按钮 -->
        <el-button type="text" @click="handleFullScreenChange" :icon="FullScreen" class="fullscreen-btn" />
      </div>
    </div>

    <!-- 状态卡片 -->
    <div class="status-cards">
      <div class="card" style="background-color: #4F52D7FF;">总维修单 75</div>
      <div class="card" style="background-color: #E6A23C;">待处理 12</div>
      <div class="card" style="background-color: #409EFF;">维修中 8</div>
      <div class="card" style="background-color: #67C23A;">待验收 5</div>
      <div class="card" style="background-color: #9E9E9E;">已完成 50</div>
    </div>

    <!-- 第二行：饼图 -->
    <el-row :gutter="16" class="chart-row">
      <el-col :span="12">
        <div class="chart-card">
          <div class="chart-header">
            <h3><i class="el-icon-pie-chart"></i> 维修状态分布</h3>
            <el-button type="text" @click="goManage">详情</el-button>
          </div>
          <div class="chart-container">
            <v-chart :option="statusPieOption" autoresize style="height: 100%;" />
          </div>
        </div>
      </el-col>
      <el-col :span="12">
        <div class="chart-card">
          <div class="chart-header">
            <h3><i class="el-icon-data-line"></i> 故障类型分布</h3>
            <el-button type="text" @click="goManage">详情</el-button>
          </div>
          <div class="chart-container">
            <v-chart :option="typePieOption" autoresize style="height: 100%;" />
          </div>
        </div>
      </el-col>
    </el-row>

    <!-- 第三行：维修趋势 + 维修工单 -->
    <el-row :gutter="16" class="chart-row">
      <el-col :span="12">
        <div class="chart-card">
          <div class="chart-header">
            <h3><i class="el-icon-trend-charts"></i> 本周维修数量趋势</h3>
            <el-button type="text" @click="goManage">详情</el-button>
          </div>
          <div class="trend-data-display">
            <div v-for="(day, index) in lineOption.xAxis.data" :key="index" class="trend-item">
              <div class="trend-day">{{ day }}：</div>
              <div class="trend-value">{{ lineOption.series[0].data[index] }}单</div>
            </div>
          </div>
          <div class="chart-container">
            <v-chart :option="lineOption" autoresize style="height: 100%;" />
          </div>
        </div>
      </el-col>
      <el-col :span="12">
        <div class="chart-card">
          <div class="chart-header">
            <h3><i class="el-icon-document"></i> 近期维修工单</h3>
            <el-button type="text" @click="goManage">详情</el-button>
          </div>
          <div class="table-container">
            <el-table :data="repairOrders" size="small" style="width: 100%; height: 100%;" @row-click="() => goManage()">
              <el-table-column type="index" width="50" align="center" />
              <el-table-column prop="code" label="工单号" width="120" align="center" />
              <el-table-column prop="equipment" label="设备名称" show-overflow-tooltip min-width="120" />
              <el-table-column prop="type" label="故障类型" width="100" align="center" />
              <el-table-column prop="priority" label="优先级" width="80" align="center">
                <template #default="{ row }">
                  <el-tag
                      :type="row.priority === '高' ? 'danger' : row.priority === '中' ? 'warning' : 'info'"
                      size="small"
                  >
                    {{ row.priority }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="status" label="状态" width="90" align="center">
                <template #default="{ row }">
                  <el-tag
                      :type="row.status === '待处理' ? 'warning' : row.status === '维修中' ? 'primary' : row.status === '待验收' ? 'success' : 'info'"
                      size="small"
                  >
                    {{ row.status }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="createTime" label="报修时间" width="140" align="center" />
            </el-table>
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
import { PieChart, LineChart } from 'echarts/charts'
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
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  CanvasRenderer
])

const router = useRouter()
const goManage = () => {
  router.push('/equipment/repair/manage')
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
  if (newPath !== '/equipment/screen') {
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
  status: [],
  priority: []
})

// 筛选选项
const workshopOptions = ref([
  { value: 'all', label: '全部车间' },
  { value: 'C2', label: 'C2车间' },
  { value: 'C3', label: 'C3车间' },
  { value: 'C4', label: 'C4车间' },
  { value: 'C5', label: 'C5车间' },
  { value: 'C6', label: 'C6车间' }
])

const statusOptions = ref([
  { value: 'pending', label: '待处理' },
  { value: 'repairing', label: '维修中' },
  { value: 'accepting', label: '待验收' },
  { value: 'completed', label: '已完成' }
])

const priorityOptions = ref([
  { value: 'high', label: '高' },
  { value: 'medium', label: '中' },
  { value: 'low', label: '低' }
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

// 图表数据
const statusPieOption = ref({
  tooltip: {trigger: 'item'},
  legend: {
    orient: 'vertical',
    right: 10,
    top: 'center',
    textStyle: {color: '#fff'}
  },
  series: [
    {
      name: '维修状态',
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
        {value: 12, name: '待处理', itemStyle: {color: '#E6A23C'}},
        {value: 8, name: '维修中', itemStyle: {color: '#409EFF'}},
        {value: 5, name: '待验收', itemStyle: {color: '#67C23A'}},
        {value: 50, name: '已完成', itemStyle: {color: '#909399'}}
      ]
    }
  ]
})

const typePieOption = ref({
  tooltip: {trigger: 'item'},
  legend: {
    orient: 'vertical',
    right: 10,
    top: 'center',
    textStyle: {color: '#fff'}
  },
  series: [
    {
      name: '故障类型',
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
        {value: 25, name: '机械故障', itemStyle: {color: '#F56C6C'}},
        {value: 20, name: '电气故障', itemStyle: {color: '#E6A23C'}},
        {value: 15, name: '软件故障', itemStyle: {color: '#409EFF'}},
        {value: 10, name: '传感器故障', itemStyle: {color: '#67C23A'}},
        {value: 5, name: '其他', itemStyle: {color: '#909399'}}
      ]
    }
  ]
})

const lineOption = ref({
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
      formatter: '{value} 单',
      color: '#fff'
    },
    splitLine: {
      lineStyle: {color: 'rgba(255, 255, 255, 0.1)'}
    }
  },
  series: [
    {
      data: [8, 12, 10, 15, 13, 7, 10],
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
    }
  ]
})

// 维修工单数据
const repairOrders = ref([
  {code: 'WO-20240722-001', equipment: 'C4-51-16注塑机', type: '机械故障', priority: '高', status: '维修中', createTime: '2024-07-22 08:24:52'},
  {code: 'WO-20240722-002', equipment: 'C4-51-23成型机', type: '电气故障', priority: '中', status: '待处理', createTime: '2024-07-22 09:15:30'},
  {code: 'WO-20240722-003', equipment: 'C4-51-24包装机', type: '传感器故障', priority: '低', status: '待验收', createTime: '2024-07-22 10:42:18'},
  {code: 'WO-20240722-004', equipment: 'C4-51-21组装机', type: '软件故障', priority: '高', status: '维修中', createTime: '2024-07-22 11:30:45'},
  {code: 'WO-20240721-015', equipment: 'C4-51-19测试机', type: '机械故障', priority: '中', status: '已完成', createTime: '2024-07-21 14:49:52'},
  {code: 'WO-20240721-016', equipment: 'C4-51-26分拣机', type: '电气故障', priority: '低', status: '已完成', createTime: '2024-07-21 15:53:42'}
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
    justify-content: space-between; // 使卡片均匀分布
    margin-bottom: 20px;
    width: 100%; // 确保占满一行

    .card {
      flex: 1; // 每个卡片平均分配空间
      margin: 0 5px; // 卡片之间的间距
      padding: 15px 10px;
      border-radius: 8px;
      color: #fff;
      text-align: center;
      transition: all 0.3s;
      font-size: 16px;
      font-weight: bold;
      min-width: 0; // 防止内容溢出

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

      .trend-data-display {
        display: flex;
        justify-content: space-around;
        padding: 10px 5px;
        background: rgba(16, 42, 87, 0.3);
        border-bottom: 1px solid rgba(64, 158, 255, 0.2);

        .trend-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          font-size: 13px;

          .trend-day {
            opacity: 0.8;
          }

          .trend-value {
            font-weight: bold;
            margin-top: 3px;
            color: #5B8FF9;
          }
        }
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

:deep(.el-tag) {
  border: none;
  font-weight: bold;
}
</style>
