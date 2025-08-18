<template>
  <!-- 设备监控看板 - 科技风 -->
  <div class="equipment-screen">
    <!-- 大标题 -->
    <div class="screen-header">
      <h1>设备监控中心</h1>
      <!-- 新增全屏开关 -->
      <div class="fullscreen-switch">
        <el-switch
            v-model="fullScreen"
            active-text="全屏"
            inactive-text="退出"
            @change="handleFullScreenChange"
        />
      </div>
      <div class="header-decoration"></div>
    </div>

    <!-- 筛选区域 -->
    <div class="filter-section">
      <el-form :inline="true" :model="filterForm" class="filter-form">
        <el-form-item label="车间">
          <el-select
              v-model="filterForm.workshop"
              multiple
              placeholder="请选择车间"
              clearable
              @change="handleWorkshopChange"
          >
            <el-option
                v-for="ws in workshopOptions"
                :key="ws"
                :label="`${ws}车间`"
                :value="ws"
            ></el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="产线">
          <el-select
              v-model="filterForm.line"
              multiple
              placeholder="请选择产线"
              clearable
              :disabled="filterForm.workshop.length === 0"
          >
            <el-option
                v-for="line in lineOptions"
                :key="line"
                :label="`${line}产线`"
                :value="line"
            ></el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="工段">
          <el-select
              v-model="filterForm.segment"
              multiple
              placeholder="请选择工段"
              clearable
              :disabled="filterForm.workshop.length === 0"
          >
            <el-option
                v-for="segment in segmentOptions"
                :key="segment"
                :label="segment"
                :value="segment"
            ></el-option>
          </el-select>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="handleFilter">筛选</el-button>
          <el-button @click="resetFilter">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 第一行：统计卡片 -->
    <el-row :gutter="16" class="stat-row">
      <el-col v-for="(card, idx) in statCards" :key="idx" :span="24/statCards.length">
        <div
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
      </el-col>
    </el-row>

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
                stripe
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
                  width="100"
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
import {ref, onMounted, reactive, inject, watch} from 'vue'
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

// 全屏相关逻辑
const route = useRouter()
const toggleFullScreen = inject('toggleFullScreen')
const fullScreen = ref(false)

// 监听路由变化重置全屏状态
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
  segment: []
})

// 选项数据
const workshopOptions = ref(['C2', 'C3', 'C4', 'C5', 'C6'])
const lineOptions = ref([])
const segmentOptions = ref(['CFOG段', '贴合段', '组装段', '30米线段'])

// 车间变化处理
const handleWorkshopChange = () => {
  // 清空已选的产线和工段
  filterForm.line = []
  filterForm.segment = []

  // 根据选中的车间加载产线选项
  lineOptions.value = []
  if (filterForm.workshop.includes('C2')) {
    lineOptions.value.push(...['31', '32', '33', '34', '35', '36'])
  }
  if (filterForm.workshop.includes('C3')) {
    lineOptions.value.push(...['41', '42', '43', '44', '45', '46'])
  }
  if (filterForm.workshop.includes('C4')) {
    lineOptions.value.push(...['51', '52', '53', '54', '55', '56'])
  }
  if (filterForm.workshop.includes('C5')) {
    lineOptions.value.push(...['61', '62', '63', '64', '65', '66'])
  }
  if (filterForm.workshop.includes('C6')) {
    lineOptions.value.push(...['71', '72', '73', '74', '75', '76'])
  }
}

// 筛选处理
const handleFilter = () => {
  // 这里实际应该调用API获取筛选后的数据
  // 现在只是模拟
  console.log('筛选条件:', filterForm)
}

// 重置筛选
const resetFilter = () => {
  filterForm.workshop = []
  filterForm.line = []
  filterForm.segment = []
  lineOptions.value = []
}

// 第一行卡片数据
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

// 设备类型饼图
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

// 稼动率分布饼图
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

// 本周稼动率折线图
const lineOption = ref({
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
    data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
    axisLine: {
      lineStyle: {
        color: '#5B8FF9'
      }
    },
    axisLabel: {
      color: '#fff'
    }
  },
  yAxis: {
    type: 'value',
    axisLabel: {
      formatter: '{value} %',
      color: '#fff'
    },
    splitLine: {
      lineStyle: {
        color: 'rgba(255, 255, 255, 0.1)'
      }
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

// 停机排名假数据
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

// 初始化
onMounted(() => {
  // 初始化图表主题
  echarts.registerTheme('dark', {
    backgroundColor: 'transparent',
    textStyle: {
      color: '#fff'
    }
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
    text-align: center;
    margin-bottom: 20px;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;

    h1 {
      font-size: 28px;
      font-weight: bold;
      margin-bottom: 10px;
      background: linear-gradient(90deg, #409EFF, #67C23A);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      text-shadow: 0 0 10px rgba(64, 158, 255, 0.3);
    }

    .header-decoration {
      height: 2px;
      background: linear-gradient(90deg, transparent, #409EFF, #67C23A, transparent);
      margin: 0 auto;
      width: 60%;
    }

    // 全屏开关样式
    .fullscreen-switch {
      position: absolute;
      right: 20px;
      top: 50%;
      transform: translateY(-50%);
      z-index: 10;
    }
  }

  .filter-section {
    background: rgba(16, 42, 87, 0.5);
    border-radius: 8px;
    padding: 15px;
    margin-bottom: 16px;
    border: 1px solid rgba(64, 158, 255, 0.3);
    box-shadow: 0 0 15px rgba(64, 158, 255, 0.1);

    .filter-form {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 10px;

      :deep(.el-form-item) {
        margin-bottom: 0;
      }

      :deep(.el-form-item__label) {
        color: #fff;
      }

      :deep(.el-select) {
        width: 180px;
      }
    }
  }

  .stat-row {
    margin-bottom: 16px;

    .stat-card {
      height: 100px;
      border-radius: 6px;
      color: #fff;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: flex-start;
      padding: 0 20px;
      cursor: pointer;
      transition: all 0.3s;
      position: relative;
      overflow: hidden;

      &:hover {
        transform: translateY(-5px);
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
      }

      .stat-title {
        font-size: 14px;
        opacity: 0.8;
      }

      .stat-value {
        font-size: 28px;
        font-weight: 600;
        margin: 5px 0;
      }

      .stat-icon {
        position: absolute;
        right: 20px;
        top: 50%;
        transform: translateY(-50%);
        font-size: 36px;
        opacity: 0.3;
      }
    }
  }

  .chart-row {
    flex: 1;
    min-height: 0;
    margin-bottom: 16px;

    .chart-card {
      height: 100%;
      background: rgba(16, 42, 87, 0.5);
      border-radius: 8px;
      border: 1px solid rgba(64, 158, 255, 0.3);
      box-shadow: 0 0 15px rgba(64, 158, 255, 0.1);
      display: flex;
      flex-direction: column;

      .chart-header {
        padding: 12px 16px;
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
            background-color: transparent;

            &:hover {
              background-color: rgba(64, 158, 255, 0.1) !important;
            }
          }

          td {
            border-bottom: 1px solid rgba(64, 158, 255, 0.1);
          }

          .el-table__row--striped {
            background-color: rgba(16, 42, 87, 0.3);
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
  --el-table-row-hover-bg-color: rgba(64, 158, 255, 0.1);
  --el-table-current-row-bg-color: rgba(64, 158, 255, 0.2);
  --el-table-header-bg-color: rgba(16, 42, 87, 0.7);
  --el-table-bg-color: transparent;
  --el-table-tr-bg-color: transparent;
  --el-table-expanded-cell-bg-color: transparent;
}

:deep(.el-table__empty-block) {
  background: rgba(16, 42, 87, 0.3);
}
</style>
