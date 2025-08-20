<template>
  <!-- 设备监控看板 - 科技风 -->
  <div class="equipment-screen">
    <!-- 大标题 -->
    <div class="screen-header">
      <div class="header-left"></div>

      <h1>设备监控中心</h1>

      <!-- 实时时钟 -->
      <div class="real-time-clock">
        {{ currentTime }}
      </div>

      <!-- 筛选区域 -->
      <div class="filter-area">
        <el-form :inline="true" :model="filterForm" class="filter-form">
          <el-form-item>
            <el-select
                v-model="filterForm.workshop"
                multiple
                collapse-tags
                collapse-tags-tooltip
                placeholder="车间"
                clearable
                @change="handleWorkshopChange"
                class="tech-select"
            >
              <el-option
                  v-for="ws in workshopOptions"
                  :key="ws.value"
                  :label="ws.label"
                  :value="ws.value"
              ></el-option>
            </el-select>
          </el-form-item>

          <el-form-item>
            <el-select
                v-model="filterForm.line"
                multiple
                collapse-tags
                collapse-tags-tooltip
                placeholder="产线"
                clearable
                :disabled="filterForm.workshop.length === 0"
                @change="handleLineChange"
                class="tech-select"
            >
              <el-option
                  v-for="line in lineOptions"
                  :key="line.value"
                  :label="line.label"
                  :value="line.value"
              ></el-option>
            </el-select>
          </el-form-item>
        </el-form>
      </div>

      <!-- 全屏开关 -->
      <div class="fullscreen-switch">
        <el-switch
            v-model="fullScreen"
            inline-prompt
            active-text="全屏"
            inactive-text="退出"
            active-color="#13ce66"
            @change="handleFullScreenChange"
        />
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="stat-container">
      <div
          v-for="(card, idx) in statCards"
          :key="idx"
          class="stat-card"
          :style="{
          backgroundColor: card.color,
          borderLeft: `4px solid ${card.borderColor}`
        }"
          @click="goManage"
      >
        <div class="stat-title">{{ card.title }}</div>
        <div class="stat-value">{{ card.number }}</div>
        <div class="stat-icon">
          <i :class="card.icon"></i>
        </div>
      </div>
    </div>

    <!-- 第二行：饼图 -->
    <el-row :gutter="16" class="chart-row">
      <el-col :span="12">
        <div class="chart-card">
          <div class="chart-header">
            <h3><i class="el-icon-pie-chart"></i> 设备类型分布</h3>
            <el-button type="text" @click="goManage">详情</el-button>
          </div>
          <div class="chart-container">
            <v-chart
                :option="typePieOption"
                autoresize
                style="height: 100%"
            />
          </div>
          <div class="data-display">
            <div v-for="(item, index) in typePieOption.series[0].data" :key="index" class="data-item">
              <div class="data-label">{{ item.name }}：</div>
              <div class="data-value">{{ item.value }}</div>
            </div>
          </div>
        </div>
      </el-col>
      <el-col :span="12">
        <div class="chart-card">
          <div class="chart-header">
            <h3><i class="el-icon-data-line"></i> 稼动率分布</h3>
            <el-button type="text" @click="goManage">详情</el-button>
          </div>
          <div class="chart-container">
            <v-chart
                :option="utilPieOption"
                autoresize
                style="height: 100%"
            />
          </div>
          <div class="data-display">
            <div v-for="(item, index) in utilPieOption.series[0].data" :key="index" class="data-item">
              <div class="data-label">{{ item.name }}：</div>
              <div class="data-value">{{ item.value }}</div>
            </div>
          </div>
        </div>
      </el-col>
    </el-row>

    <!-- 第三行：稼动率趋势 + 停机排名 -->
    <el-row :gutter="16" class="chart-row">
      <el-col :span="12">
        <div class="chart-card">
          <div class="chart-header">
            <h3><i class="el-icon-trend-charts"></i> 本周稼动率趋势</h3>
            <el-button type="text" @click="goManage">详情</el-button>
          </div>
          <div class="trend-data-display">
            <div v-for="(day, index) in lineOption.xAxis.data" :key="index" class="trend-item">
              <div class="trend-day">{{ day }}：</div>
              <div class="trend-value">{{ lineOption.series[0].data[index] }}%</div>
            </div>
          </div>
          <div class="chart-container">
            <v-chart
                :option="lineOption"
                autoresize
                style="height: 100%"
            />
          </div>
        </div>
      </el-col>
      <el-col :span="12">
        <div class="chart-card">
          <div class="chart-header">
            <h3><i class="el-icon-warning-outline"></i> 停机排名</h3>
            <el-button type="text" @click="goManage">详情</el-button>
          </div>
          <div class="table-container">
            <el-table
                :data="stopRank"
                size="small"
                style="width: 100%"
                height="100%"
                @row-click="() => goManage()"
            >
              <el-table-column type="index" width="50" align="center" />
              <el-table-column
                  prop="name"
                  label="设备名称"
                  show-overflow-tooltip
                  min-width="120"
              />
              <el-table-column
                  prop="duration"
                  label="时长"
                  width="150"
                  align="center"
              />
              <el-table-column
                  prop="start"
                  label="开始时间"
                  width="140"
                  align="center"
              />
            </el-table>
          </div>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import {useRouter} from 'vue-router'
import {ref, onMounted, reactive, inject, watch, onBeforeUnmount} from 'vue'
import * as echarts from 'echarts/core'
import {PieChart, LineChart} from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent
} from 'echarts/components'
import {CanvasRenderer} from 'echarts/renderers'
import VChart from 'vue-echarts'

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

// 全屏相关逻辑
const route = useRouter()
const toggleFullScreen = inject('toggleFullScreen')
const fullScreen = ref(false)

watch(() => route.currentRoute.value.path, (newPath) => {
  if (newPath !== '/equipment/screen') {
    fullScreen.value = false
  }
})

const handleFullScreenChange = (value) => {
  toggleFullScreen()
  fullScreen.value = value
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

const statCards = ref([
  {
    title: '设备总数',
    number: 120,
    color: 'rgba(16, 42, 87, 0.7)',
    borderColor: '#409EFF',
    icon: 'el-icon-cpu'
  },
  {
    title: '运行中',
    number: 82,
    color: 'rgba(22, 80, 48, 0.7)',
    borderColor: '#67C23A',
    icon: 'el-icon-success'
  },
  {
    title: '报警/故障',
    number: 8,
    color: 'rgba(91, 29, 39, 0.7)',
    borderColor: '#F56C6C',
    icon: 'el-icon-warning'
  },
  {
    title: '脱机/离线',
    number: 10,
    color: 'rgba(102, 57, 0, 0.7)',
    borderColor: '#E6A23C',
    icon: 'el-icon-disconnect'
  },
  {
    title: '待机',
    number: 20,
    color: 'rgba(58, 58, 58, 0.7)',
    borderColor: '#909399',
    icon: 'el-icon-time'
  }
])

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
      name: '设备类型',
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
        {value: 82, name: '运行中', itemStyle: {color: '#67C23A'}},
        {value: 20, name: '待机', itemStyle: {color: '#909399'}},
        {value: 8, name: '故障', itemStyle: {color: '#F56C6C'}},
        {value: 10, name: '离线', itemStyle: {color: '#E6A23C'}}
      ]
    }
  ]
})

const utilPieOption = ref({
  tooltip: {trigger: 'item'},
  legend: {
    orient: 'vertical',
    right: 10,
    top: 'center',
    textStyle: {color: '#fff'}
  },
  series: [
    {
      name: '稼动率',
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
        {value: 60, name: '90% 以上', itemStyle: {color: '#67C23A'}},
        {value: 25, name: '80-90%', itemStyle: {color: '#8FD460'}},
        {value: 20, name: '70-80%', itemStyle: {color: '#E6A23C'}},
        {value: 15, name: '70% 以下', itemStyle: {color: '#F56C6C'}}
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
      formatter: '{value} %',
      color: '#fff'
    },
    splitLine: {
      lineStyle: {color: 'rgba(255, 255, 255, 0.1)'}
    }
  },
  series: [
    {
      data: [92, 89, 94, 96, 90, 88, 93],
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

const stopRank = ref([
  {name: 'C4-51-16', duration: '15小时29分38秒', start: '2025-07-21 23:24:52'},
  {name: 'C4-51-23', duration: '15小时29分38秒', start: '2025-07-21 23:24:52'},
  {name: 'C4-51-24', duration: '15小时29分38秒', start: '2025-07-21 23:24:52'},
  {name: 'C4-51-21', duration: '59分33秒', start: '2025-07-22 13:54:52'},
  {name: 'C4-51-19', duration: '4分38秒', start: '2025-07-22 14:49:52'},
  {name: 'C4-51-26', duration: '48秒', start: '2025-07-22 14:53:42'},
  {name: 'C4-51-22', duration: '36秒', start: '2025-07-22 14:53:52'},
  {name: 'C4-51-31', duration: '36秒', start: '2025-07-22 14:53:54'}
])

onMounted(() => {
  echarts.registerTheme('dark', {
    backgroundColor: 'transparent',
    textStyle: {color: '#fff'}
  })
})
</script>

<style scoped lang="scss">
.equipment-screen {
  height: 100vh;
  padding: 16px;
  background: linear-gradient(135deg, #0f0c29, #302b63, #24243e);
  display: flex;
  flex-direction: column;
  color: #fff;
  overflow: auto;

  .screen-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 10px; // 减小头部和卡片之间的间距
    position: relative;
    padding: 0 50px;

    h1 {
      position: absolute;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
      font-size: 24px; // 减小标题字体大小
      font-weight: bold;
      background: linear-gradient(90deg, #409EFF, #67C23A);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      text-shadow: 0 0 10px rgba(64, 158, 255, 0.3);
    }

    .header-left {
      flex: 1;
    }

    // 实时时钟
    .real-time-clock {
      position: absolute;
      left: 20px;
      top: 50%;
      transform: translateY(-50%);
      font-size: 14px; // 减小时钟字体大小
      background: rgba(64, 158, 255, 0.2);
      padding: 4px 8px; // 减小时钟内边距
      border-radius: 4px;
      border: 1px solid rgba(64, 158, 255, 0.3);
      box-shadow: 0 0 10px rgba(64, 158, 255, 0.1);
    }

    // 筛选区域
    .filter-area {
      position: absolute;
      right: 100px;
      top: 50%;
      transform: translateY(-50%);
      display: flex;
      align-items: center;
      gap: 8px;
    }

    // 全屏开关
    .fullscreen-switch {
      position: absolute;
      right: 20px;
      top: 50%;
      transform: translateY(-50%);
      z-index: 10;

      :deep(.el-switch) {
        --el-switch-on-color: rgba(19, 206, 102, 0.3);
        --el-switch-off-color: rgba(255, 73, 73, 0.3);
        --el-switch-border-color: rgba(64, 158, 255, 0.3);
      }

      :deep(.el-switch__label) {
        color: #fff !important;
        font-weight: bold;
      }
    }

    // 下拉框样式（缩小）
    :deep(.tech-select) {
      width: 90px; // 减小下拉框宽度
      font-size: 12px;

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
        font-size: 12px;
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
  }

  .stat-container {
    display: flex;
    justify-content: space-between;
    margin-bottom: 10px; // 减小卡片之间的间距
    gap: 10px;

    .stat-card {
      flex: 1;
      height: 80px; // 减小卡片高度
      border-radius: 6px;
      color: #fff;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: flex-start;
      padding: 0 10px; // 减小卡片内边距
      cursor: pointer;
      transition: all 0.3s;
      position: relative;
      overflow: hidden;

      &:hover {
        transform: translateY(-3px); // 减小悬停时的位移
        box-shadow: 0 3px 10px rgba(0, 0, 0, 0.3);
      }

      .stat-title {
        font-size: 12px; // 减小标题字体大小
        opacity: 0.8;
      }

      .stat-value {
        font-size: 20px; // 减小数值字体大小
        font-weight: 600;
        margin: 5px 0;
      }

      .stat-icon {
        position: absolute;
        right: 10px; // 减小图标与边界的距离
        top: 50%;
        transform: translateY(-50%);
        font-size: 28px; // 减小图标大小
        opacity: 0.3;
      }
    }
  }

  .chart-row {
    flex: 1;
    min-height: 0;
    margin-bottom: 10px; // 减小行之间的间距

    .chart-card {
      height: 100%;
      background: rgba(16, 42, 87, 0.5);
      border-radius: 8px;
      border: 1px solid rgba(64, 158, 255, 0.3);
      box-shadow: 0 0 10px rgba(64, 158, 255, 0.1);
      display: flex;
      flex-direction: column;

      .chart-header {
        padding: 8px 12px; // 减小头部内边距
        border-bottom: 1px solid rgba(64, 158, 255, 0.2);
        display: flex;
        justify-content: space-between;
        align-items: center;

        h3 {
          font-size: 14px; // 减小标题字体大小
          font-weight: 500;
          margin: 0;
          display: flex;
          align-items: center;

          i {
            margin-right: 6px; // 减小图标与文字的间距
            color: #409EFF;
          }
        }
      }

      .chart-container {
        flex: 1;
        padding: 5px; // 减小容器内边距
        min-height: 150px; // 减小图表容器高度
      }

      .data-display {
        display: flex;
        justify-content: space-around;
        padding: 5px 0; // 减小数据展示区域的内边距
        background: rgba(16, 42, 87, 0.3);
        border-top: 1px solid rgba(64, 158, 255, 0.2);

        .data-item {
          display: flex;
          align-items: center;
          font-size: 12px; // 减小数据字体大小

          .data-label {
            opacity: 0.8;
          }

          .data-value {
            font-weight: bold;
            margin-left: 5px;
          }
        }
      }

      .trend-data-display {
        display: flex;
        justify-content: space-around;
        padding: 5px 5px; // 减小趋势数据展示区域的内边距
        background: rgba(16, 42, 87, 0.3);
        border-bottom: 1px solid rgba(64, 158, 255, 0.2);

        .trend-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          font-size: 12px; // 减小趋势数据字体大小

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
        padding: 5px; // 减小表格容器内边距

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
