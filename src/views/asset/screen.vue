<template>
  <!-- 资产看板 - 科技风 -->
  <div class="asset-screen" ref="screenContainer">
    <!-- 顶部导航栏 -->
    <div class="navbar">
      <div class="nav-item">时间{{ currentTime }}</div>
      <h1 class="title">资产管理中心</h1>
      <div class="nav-item">
        <el-button type="text" @click="handleFullScreenChange">
          <el-icon :size="20">
            <FullScreen />
          </el-icon>
        </el-button>
      </div>
    </div>

    <!-- 第一行：5 张统计卡片（占满一行） -->
    <div class="status-cards">
      <div
          v-for="(c, i) in statCards"
          :key="i"
          class="card"
          :style="{ backgroundColor: c.color }"
          @click="goToAssetList"
      >
        <div class="stat-title">{{ c.title }}</div>
        <div class="stat-value">{{ c.value }}</div>
      </div>
    </div>

    <!-- 第二行：饼图 -->
    <el-row :gutter="16" class="chart-row">
      <el-col :span="12">
        <div class="chart-card">
          <div class="chart-header">
            <h3><i class="el-icon-pie-chart"></i> 台账类型分布</h3>
            <el-button type="text" @click="goToAssetList">详情</el-button>
          </div>
          <div class="chart-container">
            <div ref="typeChartRef" style="height: 100%;" />
          </div>
        </div>
      </el-col>
      <el-col :span="12">
        <div class="chart-card">
          <div class="chart-header">
            <h3><i class="el-icon-data-line"></i> 寿命上限分布</h3>
            <el-button type="text" @click="goToAssetList">详情</el-button>
          </div>
          <div class="chart-container">
            <div ref="lifeChartRef" style="height: 100%;" />
          </div>
        </div>
      </el-col>
    </el-row>

    <!-- 第三行：折线图 & 消息卡片（各占 50%） -->
    <el-row :gutter="16" class="chart-row">
      <el-col :span="12">
        <div class="chart-card">
          <div class="chart-header">
            <h3><i class="el-icon-trend-charts"></i> 资产新增/报废趋势（近 6 个月）</h3>
            <el-button type="text" @click="goToAssetList">详情</el-button>
          </div>
          <div class="chart-container">
            <div ref="trendChartRef" style="height: 100%;" />
          </div>
        </div>
      </el-col>

      <el-col :span="12">
        <div class="chart-card">
          <div class="chart-header">
            <h3><i class="el-icon-warning-outline"></i> 消息通知</h3>
            <el-button type="text" @click="handleDetailClick">详情</el-button>
          </div>
          <div class="msg-container">
            <el-tabs v-model="activeMsgTab" class="msg-tabs">
              <el-tab-pane label="审核" name="audit" />
              <el-tab-pane label="寿命" name="life" />
            </el-tabs>
            <div class="msg-list">
              <div
                  v-for="(msg, i) in currentMsgs"
                  :key="i"
                  class="msg-item"
                  @click="handleDetailClick"
              >
                <span class="msg-text">{{ msg }}</span>
              </div>
            </div>
          </div>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { FullScreen, CloseBold } from '@element-plus/icons-vue'
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import * as echarts from 'echarts'
import screenfull from 'screenfull'

const router = useRouter()

/* ------------------ 路由 ------------------ */
const goToAssetList = () => router.push('/asset/manage/list')
const handleDetailClick = () => router.push('/check/list')

/* ------------------ 实时时钟 ------------------ */
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

/* ------------------ 全屏相关逻辑 ------------------ */
const screenContainer = ref()
const isFullScreen = ref(false)

const handleFullScreenChange = () => {
  if (!screenfull.isEnabled) {
    console.warn('您的浏览器不支持全屏功能')
    return
  }

  if (screenfull.isFullscreen) {
    screenfull.exit()
    isFullScreen.value = false
  } else {
    screenfull.request(screenContainer.value)
    isFullScreen.value = true
  }
}

// 监听全屏变化
if (screenfull.isEnabled) {
  screenfull.on('change', () => {
    isFullScreen.value = screenfull.isFullscreen
  })
}

/* ------------------ 卡片 ------------------ */
const statCards = ref([
  { title: '设备总数', value: 521, color: '#4F52D7FF' },
  { title: '已验收设备', value: 432, color: '#67C23A' },
  { title: '待验收设备', value: 42, color: '#E6A23C' },
  { title: '设备样机', value: 15, color: '#909399' },
  { title: '设备闲置', value: 32, color: '#F56C6C' }
])

/* ------------------ 消息 ------------------ */
const activeMsgTab = ref('audit')
const auditMsgs = ref([
  '设备编号 EQ-20240512 从 A 车间转移到 B 车间未审批',
  '设备编号 EQ-20240601 从 C 产线转移到 D 产线未审批'
])
const lifeMsgs = ref([
  '设备编号 EQ-20230501 即将到达寿命上限',
  '设备编号 EQ-20230615 预计 30 天后到寿命上限'
])
const currentMsgs = computed(() =>
    activeMsgTab.value === 'audit' ? auditMsgs.value : lifeMsgs.value
)

/* ------------------ 图表 ------------------ */
const typeChartRef = ref()
const lifeChartRef = ref()
const trendChartRef = ref()

// 计算百分比
const calculatePercentages = (data) => {
  const total = data.reduce((sum, item) => sum + item.value, 0)
  return data.map(item => ({
    ...item,
    percentage: ((item.value / total) * 100).toFixed(1) + '%'
  }))
}

const initChart = (dom, option) => {
  const chart = echarts.init(dom)
  chart.setOption(option)
  chart.on('click', goToAssetList)
  return chart
}

onMounted(() => {
  // 设置echarts主题
  const darkTheme = {
    backgroundColor: 'transparent',
    textStyle: { color: '#fff' },
    legend: {
      textStyle: { color: '#fff' }
    },
    tooltip: {
      backgroundColor: 'rgba(50, 50, 74, 0.9)',
      borderColor: '#5B8FF9',
      textStyle: { color: '#fff' }
    }
  }

  // 类型分布饼图数据
  const typeData = [
    { name: '已验收', value: 432, itemStyle: { color: '#67C23A' } },
    { name: '待验收', value: 42, itemStyle: { color: '#E6A23C' } },
    { name: '样机', value: 15, itemStyle: { color: '#909399' } },
    { name: '闲置', value: 32, itemStyle: { color: '#F56C6C' } }
  ]

  const typeDataWithPercentage = calculatePercentages(typeData)

  // 类型分布饼图
  initChart(typeChartRef.value, {
    ...darkTheme,
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      right: 10,
      top: 'center',
      textStyle: {color: '#fff'},
      formatter: (name) => {
        const item = typeDataWithPercentage.find(d => d.name === name)
        return `${name}: ${item.percentage}`
      }
    },
    series: [
      {
        name: '台账类型',
        type: 'pie',
        radius: ['40%', '70%'],
        label: {show: false, position: 'center'},
        emphasis: {
          label: {
            show: true,
            fontSize: 18,
            fontWeight: 'bold',
            color: '#fff',
            formatter: '{b}\n{c} ({d}%)'
          }
        },
        labelLine: {show: false},
        data: typeData
      }
    ]
  })

  // 寿命分布饼图数据
  const lifeData = [
    { name: '1 年', value: 80, itemStyle: { color: '#5B8FF9' } },
    { name: '2 年', value: 150, itemStyle: { color: '#5AD8A6' } },
    { name: '3 年', value: 200, itemStyle: { color: '#5D7092' } },
    { name: '4 年', value: 70, itemStyle: { color: '#F6BD16' } },
    { name: '5 年及以上', value: 21, itemStyle: { color: '#E86452' } }
  ]

  const lifeDataWithPercentage = calculatePercentages(lifeData)

  // 寿命分布饼图
  initChart(lifeChartRef.value, {
    ...darkTheme,
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      right: 10,
      top: 'center',
      textStyle: {color: '#fff'},
      formatter: (name) => {
        const item = lifeDataWithPercentage.find(d => d.name === name)
        return `${name}: ${item.percentage}`
      }
    },
    series: [
      {
        name: '寿命上限',
        type: 'pie',
        radius: ['40%', '70%'],
        label: {show: false, position: 'center'},
        emphasis: {
          label: {
            show: true,
            fontSize: 18,
            fontWeight: 'bold',
            color: '#fff',
            formatter: '{b}\n{c} ({d}%)'
          }
        },
        labelLine: {show: false},
        data: lifeData
      }
    ]
  })

  // 趋势折线图
  initChart(trendChartRef.value, {
    ...darkTheme,
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(50, 50, 74, 0.9)',
      borderColor: '#5B8FF9'
    },
    legend: {
      data: ['新增', '报废'],
      textStyle: { color: '#fff' }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: ['1月', '2月', '3月', '4月', '5月', '6月'],
      axisLine: {
        lineStyle: {color: '#5B8FF9'}
      },
      axisLabel: {color: '#fff'}
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        color: '#fff'
      },
      splitLine: {
        lineStyle: {color: 'rgba(255, 255, 255, 0.1)'}
      }
    },
    series: [
      {
        name: '新增',
        type: 'line',
        smooth: true,
        data: [120, 200, 150, 80, 70, 110],
        itemStyle: {
          color: '#5B8FF9'
        },
        lineStyle: {
          width: 3,
          color: '#5B8FF9'
        }
      },
      {
        name: '报废',
        type: 'line',
        smooth: true,
        data: [30, 40, 50, 60, 70, 90],
        itemStyle: {
          color: '#E86452'
        },
        lineStyle: {
          width: 3,
          color: '#E86452'
        }
      }
    ]
  })
})
</script>

<style scoped lang="scss">
.asset-screen {
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

  .status-cards {
    display: flex;
    justify-content: space-around;
    margin-bottom: 20px;

    .card {
      padding: 10px 20px;
      border-radius: 8px;
      color: #fff;
      text-align: center;
      transition: all 0.3s;
      cursor: pointer;
      flex: 1;
      margin: 0 8px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      min-height: 80px;

      &:hover {
        transform: translateY(-5px);
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
      }

      .stat-title {
        font-size: 14px;
        margin-bottom: 5px;
      }
      .stat-value {
        font-size: 24px;
        font-weight: 600;
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

      .msg-container {
        flex: 1;
        display: flex;
        flex-direction: column;

        .msg-tabs {
          padding: 0 16px;

          :deep(.el-tabs__header) {
            margin: 0;
          }

          :deep(.el-tabs__item) {
            color: rgba(255, 255, 255, 0.7);

            &.is-active {
              color: #409EFF;
            }
          }

          :deep(.el-tabs__nav-wrap::after) {
            background-color: rgba(64, 158, 255, 0.2);
          }
        }

        .msg-list {
          flex: 1;
          padding: 10px 16px;
          overflow-y: auto;

          .msg-item {
            padding: 10px 0;
            border-bottom: 1px solid rgba(64, 158, 255, 0.1);
            cursor: pointer;
            transition: background-color 0.3s;

            &:hover {
              background-color: rgba(64, 158, 255, 0.1);
            }

            &:last-child {
              border-bottom: none;
            }

            .msg-text {
              color: #fff;
              font-size: 14px;
              line-height: 1.5;
            }
          }
        }
      }
    }
  }
}

// 全局表格样式覆盖
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

// 全屏样式
:fullscreen {
  .asset-screen {
    padding: 20px;
    background: linear-gradient(135deg, #0f0c29, #302b63, #24243e);
  }
}
</style>
