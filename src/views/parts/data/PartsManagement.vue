<template>
  <div class="parts-management">
    <!-- 科技感背景 -->
    <div class="tech-background">
      <div class="grid-lines"></div>
      <div class="floating-particles">
        <div v-for="i in 20" :key="'particle-'+i" class="particle"></div>
      </div>
    </div>

    <!-- 主内容区域 -->
    <div class="container">
      <!-- 顶部标题和操作区 -->
      <div class="header">
        <h1>备品备件智能管理平台</h1>
        <div class="header-actions">
          <el-button type="primary" @click="showAddPartDrawer = true">
            <el-icon><Plus /></el-icon>新增备件
          </el-button>
          <el-button @click="refreshData">
            <el-icon><Refresh /></el-icon>刷新数据
          </el-button>
          <el-date-picker
              v-model="dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              @change="handleDateChange"
          />
        </div>
      </div>

      <!-- 关键指标卡片区域 -->
      <div class="metrics-cards">
        <el-row :gutter="20">
          <el-col :xs="24" :sm="12" :lg="6">
            <MetricCard
                title="总备件数量"
                :value="metrics.totalParts"
                :trend="metrics.totalPartsTrend"
                icon="Box"
                color="#409EFF"
            />
          </el-col>
          <el-col :xs="24" :sm="12" :lg="6">
            <MetricCard
                title="库存总价值"
                :value="`¥${metrics.totalValue.toLocaleString()}`"
                :trend="metrics.totalValueTrend"
                icon="Money"
                color="#67C23A"
            />
          </el-col>
          <el-col :xs="24" :sm="12" :lg="6">
            <MetricCard
                title="低库存项"
                :value="metrics.lowStockItems"
                :trend="metrics.lowStockTrend"
                icon="Warning"
                color="#E6A23C"
            />
          </el-col>
          <el-col :xs="24" :sm="12" :lg="6">
            <MetricCard
                title="本月出库量"
                :value="metrics.monthlyOutbound"
                :trend="metrics.monthlyOutboundTrend"
                icon="ShoppingCart"
                color="#F56C6C"
            />
          </el-col>
        </el-row>
      </div>

      <!-- 图表区域 -->
      <div class="charts-section">
        <el-row :gutter="20">
          <el-col :xs="24" :lg="8">
            <div class="chart-card">
              <div class="chart-header">
                <h3>分类占比</h3>
                <el-select v-model="categoryFilter" placeholder="选择分类" size="small">
                  <el-option label="全部" value="all" />
                  <el-option label="电子元件" value="electronic" />
                  <el-option label="机械零件" value="mechanical" />
                  <el-option label="耗材" value="consumable" />
                </el-select>
              </div>
              <DoughnutChart :data="categoryChartData" />
            </div>
          </el-col>
          <el-col :xs="24" :lg="16">
            <div class="chart-card">
              <div class="chart-header">
                <h3>库存趋势</h3>
                <el-select v-model="timeRange" placeholder="选择时间段" size="small">
                  <el-option label="近7天" value="7d" />
                  <el-option label="近30天" value="30d" />
                  <el-option label="近90天" value="90d" />
                </el-select>
              </div>
              <LineChart :data="trendChartData" />
            </div>
          </el-col>
        </el-row>

        <el-row :gutter="20" class="chart-row">
          <el-col :xs="24">
            <div class="chart-card">
              <div class="chart-header">
                <h3>库存周转率</h3>
                <el-radio-group v-model="turnoverView" size="small">
                  <el-radio-button label="按类别">按类别</el-radio-button>
                  <el-radio-button label="按仓库">按仓库</el-radio-button>
                </el-radio-group>
              </div>
              <BarChart :data="turnoverChartData" />
            </div>
          </el-col>
        </el-row>
      </div>

      <!-- 预警管理区域 -->
      <div class="warning-section">
        <div class="section-header">
          <h2>库存预警管理</h2>
          <span class="warning-count">共 {{ lowStockParts.length }} 项需要关注</span>
        </div>
        <el-table :data="lowStockParts" style="width: 100%">
          <el-table-column prop="name" label="备件名称" width="200" />
          <el-table-column prop="category" label="分类" width="120">
            <template #default="scope">
              <el-tag
                  :type="getCategoryTagType(scope.row.category)"
                  size="small"
              >
                {{ getCategoryName(scope.row.category) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="currentStock" label="当前库存" width="100" />
          <el-table-column prop="safetyStock" label="安全库存" width="100" />
          <el-table-column prop="warehouse" label="存放仓库" width="150" />
          <el-table-column prop="lastUpdated" label="最后更新" width="120">
            <template #default="scope">
              {{ formatDate(scope.row.lastUpdated) }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="120">
            <template #default="scope">
              <el-button
                  size="small"
                  type="primary"
                  @click="openReplenishDialog(scope.row)"
              >
                补货
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>

    <!-- 新增/编辑备件抽屉 -->
    <el-drawer
        v-model="showAddPartDrawer"
        :title="editingPart ? '编辑备件' : '新增备件'"
        direction="rtl"
        size="40%"
    >
      <PartForm
          v-if="showAddPartDrawer"
          :part="editingPart"
          @submit="handlePartSubmit"
          @cancel="showAddPartDrawer = false"
      />
    </el-drawer>

    <!-- 补货对话框 -->
    <el-dialog
        v-model="showReplenishDialog"
        :title="`补货 - ${selectedPart?.name}`"
        width="30%"
    >
      <ReplenishForm
          :part="selectedPart"
          @submit="handleReplenishSubmit"
          @cancel="showReplenishDialog = false"
      />
    </el-dialog>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus, Refresh, Box, Money, Warning, ShoppingCart } from '@element-plus/icons-vue'
import MetricCard from './components/MetricCard.vue'
import DoughnutChart from './components/DoughnutChart.vue'
import LineChart from './components/LineChart.vue'
import BarChart from './components/BarChart.vue'
import PartForm from './components/PartForm.vue'
import ReplenishForm from './components/ReplenishForm.vue'
import { generateMockData, savePartsData, loadPartsData } from './data/mockData'

export default {
  name: 'PartsManagement',
  components: {
    Plus,
    Refresh,
    Box,
    Money,
    Warning,
    ShoppingCart,
    MetricCard,
    DoughnutChart,
    LineChart,
    BarChart,
    PartForm,
    ReplenishForm
  },
  setup() {
    // 状态管理
    const parts = ref([])
    const dateRange = ref([])
    const categoryFilter = ref('all')
    const timeRange = ref('30d')
    const turnoverView = ref('按类别')
    const showAddPartDrawer = ref(false)
    const showReplenishDialog = ref(false)
    const editingPart = ref(null)
    const selectedPart = ref(null)

    // 加载数据
    const loadData = () => {
      const savedData = loadPartsData()
      if (savedData && savedData.length > 0) {
        parts.value = savedData
      } else {
        parts.value = generateMockData()
        savePartsData(parts.value)
      }
    }

    // 初始化加载数据
    onMounted(() => {
      loadData()
    })

    // 计算指标数据
    const metrics = computed(() => {
      const totalParts = parts.value.length
      const totalValue = parts.value.reduce((sum, part) => sum + (part.currentStock * part.price), 0)
      const lowStockItems = parts.value.filter(part => part.currentStock <= part.safetyStock).length
      const monthlyOutbound = parts.value.reduce((sum, part) => sum + (part.monthlyOutbound || 0), 0)

      // 简化处理趋势数据（实际应用中应从历史数据计算）
      return {
        totalParts,
        totalPartsTrend: 5.2,
        totalValue,
        totalValueTrend: 3.8,
        lowStockItems,
        lowStockTrend: -2.4,
        monthlyOutbound,
        monthlyOutboundTrend: 7.1
      }
    })

    // 低库存备件
    const lowStockParts = computed(() => {
      return parts.value
          .filter(part => part.currentStock <= part.safetyStock)
          .sort((a, b) => a.currentStock / a.safetyStock - b.currentStock / b.safetyStock)
    })

    // 分类图表数据
    const categoryChartData = computed(() => {
      const categories = {
        electronic: { name: '电子元件', count: 0, color: '#409EFF' },
        mechanical: { name: '机械零件', count: 0, color: '#67C23A' },
        consumable: { name: '耗材', count: 0, color: '#E6A23C' }
      }

      parts.value.forEach(part => {
        if (categories[part.category]) {
          categories[part.category].count++
        }
      })

      return {
        labels: Object.values(categories).map(c => c.name),
        datasets: [{
          data: Object.values(categories).map(c => c.count),
          backgroundColor: Object.values(categories).map(c => c.color)
        }]
      }
    })

    // 趋势图表数据
    const trendChartData = computed(() => {
      // 简化处理，实际应用中应从历史数据生成
      return {
        labels: ['1月', '2月', '3月', '4月', '5月', '6月'],
        datasets: [
          {
            label: '电子元件',
            data: [120, 150, 180, 90, 130, 160],
            borderColor: '#409EFF',
            tension: 0.1
          },
          {
            label: '机械零件',
            data: [80, 100, 120, 110, 95, 130],
            borderColor: '#67C23A',
            tension: 0.1
          }
        ]
      }
    })

    // 周转率图表数据
    const turnoverChartData = computed(() => {
      // 简化处理，实际应用中应计算真实周转率
      if (turnoverView.value === '按类别') {
        return {
          labels: ['电子元件', '机械零件', '耗材'],
          datasets: [{
            label: '周转率',
            data: [2.8, 1.5, 4.2],
            backgroundColor: '#409EFF'
          }]
        }
      } else {
        return {
          labels: ['主仓库', '东区仓库', '西区仓库', '备用仓库'],
          datasets: [{
            label: '周转率',
            data: [2.5, 3.1, 1.8, 2.2],
            backgroundColor: '#67C23A'
          }]
        }
      }
    })

    // 工具函数
    const getCategoryTagType = (category) => {
      const types = {
        electronic: 'primary',
        mechanical: 'success',
        consumable: 'warning'
      }
      return types[category] || 'info'
    }

    const getCategoryName = (category) => {
      const names = {
        electronic: '电子元件',
        mechanical: '机械零件',
        consumable: '耗材'
      }
      return names[category] || '其他'
    }

    const formatDate = (dateString) => {
      return new Date(dateString).toLocaleDateString()
    }

    // 事件处理
    const refreshData = () => {
      loadData()
      ElMessage.success('数据已刷新')
    }

    const handleDateChange = () => {
      // 在实际应用中，这里应该根据日期范围过滤数据
      ElMessage.info('日期范围已更改')
    }

    const openReplenishDialog = (part) => {
      selectedPart.value = part
      showReplenishDialog.value = true
    }

    const handleReplenishSubmit = (replenishData) => {
      const partIndex = parts.value.findIndex(p => p.id === replenishData.partId)
      if (partIndex !== -1) {
        parts.value[partIndex].currentStock += replenishData.quantity
        parts.value[partIndex].lastUpdated = new Date().toISOString()

        savePartsData(parts.value)
        ElMessage.success('补货成功')
        showReplenishDialog.value = false
      }
    }

    const handlePartSubmit = (partData) => {
      if (partData.id) {
        // 编辑现有备件
        const index = parts.value.findIndex(p => p.id === partData.id)
        if (index !== -1) {
          parts.value[index] = { ...partData }
        }
      } else {
        // 新增备件
        const newPart = {
          ...partData,
          id: Date.now().toString(),
          lastUpdated: new Date().toISOString()
        }
        parts.value.push(newPart)
      }

      savePartsData(parts.value)
      showAddPartDrawer.value = false
      editingPart.value = null
      ElMessage.success(partData.id ? '备件已更新' : '备件已添加')
    }

    return {
      // 状态
      parts,
      dateRange,
      categoryFilter,
      timeRange,
      turnoverView,
      showAddPartDrawer,
      showReplenishDialog,
      editingPart,
      selectedPart,

      // 计算属性
      metrics,
      lowStockParts,
      categoryChartData,
      trendChartData,
      turnoverChartData,

      // 方法
      refreshData,
      handleDateChange,
      openReplenishDialog,
      handleReplenishSubmit,
      handlePartSubmit,
      getCategoryTagType,
      getCategoryName,
      formatDate
    }
  }
}
</script>

<style scoped>
.parts-management {
  min-height: 100vh;
  background: linear-gradient(135deg, #0f1623 0%, #1c2539 100%);
  color: #fff;
  position: relative;
  overflow-x: hidden;
}

.tech-background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  overflow: hidden;
}

.grid-lines {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image:
      linear-gradient(rgba(66, 134, 244, 0.1) 1px, transparent 1px),
      linear-gradient(90deg, rgba(66, 134, 244, 0.1) 1px, transparent 1px);
  background-size: 20px 20px;
  opacity: 0.3;
}

.floating-particles {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.particle {
  position: absolute;
  background: rgba(66, 134, 244, 0.5);
  border-radius: 50%;
  animation: float 15s infinite linear;
}

.particle:nth-child(1) { top: 10%; left: 20%; width: 4px; height: 4px; animation-delay: 0s; }
.particle:nth-child(2) { top: 20%; left: 80%; width: 6px; height: 6px; animation-delay: 1s; }
/* 更多粒子样式... */

@keyframes float {
  0% { transform: translateY(0) translateX(0); opacity: 1; }
  100% { transform: translateY(-100px) translateX(50px); opacity: 0; }
}

.container {
  position: relative;
  z-index: 1;
  padding: 20px;
  max-width: 1600px;
  margin: 0 auto;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 16px;
}

.header h1 {
  margin: 0;
  font-size: 28px;
  font-weight: 700;
  background: linear-gradient(90deg, #4286f4, #7cb6ff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.header-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

.metrics-cards {
  margin-bottom: 24px;
}

.charts-section {
  margin-bottom: 32px;
}

.chart-card {
  background: rgba(30, 40, 60, 0.7);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 20px;
  border: 1px solid rgba(66, 134, 244, 0.2);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.chart-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.warning-section {
  background: rgba(30, 40, 60, 0.7);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 20px;
  border: 1px solid rgba(66, 134, 244, 0.2);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.section-header h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
}

.warning-count {
  color: #e6a23c;
  font-weight: 500;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .header {
    flex-direction: column;
    align-items: flex-start;
  }

  .header-actions {
    width: 100%;
    flex-wrap: wrap;
  }

  .chart-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
}
</style>
