<template>
  <div class="parts-management">
    <!-- 顶部标题 -->
    <div class="header">
      <h1>备品备件智能管理平台</h1>
      <el-button type="primary" @click="refreshData">
        <el-icon><Refresh /></el-icon>
        刷新数据
      </el-button>
    </div>

    <!-- 日期筛选 -->
    <div class="filter-section">
      <el-date-picker
          v-model="dateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          @change="handleDateChange"
      />
      <el-select v-model="selectedCategory" placeholder="选择分类" clearable @change="handleCategoryChange">
        <el-option label="电子元件" value="electronic" />
        <el-option label="机械零件" value="mechanical" />
        <el-option label="耗材" value="consumable" />
      </el-select>
    </div>

    <!-- 关键指标卡片 -->
    <div class="stats-cards">
      <el-card v-for="stat in statsData" :key="stat.title" class="stat-card">
        <div class="stat-content">
          <div class="stat-icon" :style="{ background: stat.gradient }">
            <el-icon :size="24"><component :is="stat.icon" /></el-icon>
          </div>
          <div class="stat-info">
            <h3>{{ stat.title }}</h3>
            <p class="stat-value">{{ stat.value }}</p>
            <p class="stat-trend" :class="stat.trend > 0 ? 'up' : 'down'">
              <el-icon><CaretTop v-if="stat.trend > 0" /><CaretBottom v-else /></el-icon>
              {{ Math.abs(stat.trend) }}% 同比
            </p>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 图表区域 -->
    <div class="charts-section">
      <el-card>
        <template #header>
          <span>分类占比</span>
        </template>
        <canvas ref="pieChart"></canvas>
      </el-card>
      <el-card>
        <template #header>
          <span>库存趋势</span>
        </template>
        <canvas ref="lineChart"></canvas>
      </el-card>
      <el-card>
        <template #header>
          <span>周转率</span>
        </template>
        <canvas ref="barChart"></canvas>
      </el-card>
    </div>

    <!-- 库存预警表格 -->
    <div class="warning-section">
      <el-card>
        <template #header>
          <span>低库存预警</span>
        </template>
        <el-table :data="warningData" style="width: 100%">
          <el-table-column prop="name" label="备件名称" />
          <el-table-column prop="category" label="分类">
            <template #default="{ row }">
              <el-tag :type="categoryMap[row.category].type">
                {{ categoryMap[row.category].label }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="currentStock" label="当前库存" />
          <el-table-column prop="safetyStock" label="安全库存" />
          <el-table-column label="操作">
            <template #default="{ row }">
              <el-button type="primary" size="small" @click="openReplenish(row)">
                补货
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </div>

    <!-- 新增备件按钮 -->
    <div class="action-section">
      <el-button type="primary" @click="openAddPart">
        <el-icon><Plus /></el-icon>
        新增备件
      </el-button>
    </div>

    <!-- 抽屉：新增/编辑备件 -->
    <el-drawer v-model="drawerVisible" :title="drawerTitle" size="50%">
      <el-form :model="partForm" label-width="100px">
        <el-form-item label="备件名称">
          <el-input v-model="partForm.name" />
        </el-form-item>
        <el-form-item label="分类">
          <el-select v-model="partForm.category">
            <el-option label="电子元件" value="electronic" />
            <el-option label="机械零件" value="mechanical" />
            <el-option label="耗材" value="consumable" />
          </el-select>
        </el-form-item>
        <el-form-item label="当前库存">
          <el-input-number v-model="partForm.currentStock" :min="0" />
        </el-form-item>
        <el-form-item label="安全库存">
          <el-input-number v-model="partForm.safetyStock" :min="0" />
        </el-form-item>
        <el-form-item label="仓库">
          <el-input v-model="partForm.warehouse" />
        </el-form-item>
        <el-form-item label="单价">
          <el-input-number v-model="partForm.price" :min="0" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="drawerVisible = false">取消</el-button>
        <el-button type="primary" @click="savePart">保存</el-button>
      </template>
    </el-drawer>

    <!-- 补货对话框 -->
    <el-dialog v-model="replenishVisible" title="补货" width="30%">
      <el-form :model="replenishForm" label-width="100px">
        <el-form-item label="补货数量">
          <el-input-number v-model="replenishForm.quantity" :min="1" />
        </el-form-item>
        <el-form-item label="预计到货日期">
          <el-date-picker v-model="replenishForm.arrivalDate" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="replenishVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmReplenish">确认补货</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue'
import { Chart, registerables } from 'chart.js'
import {
  Refresh,
  Plus,
  CaretTop,
  CaretBottom,
  Box,
  Coin,
  TrendCharts,
  List
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

Chart.register(...registerables)

// 数据存储
const partsData = ref([])
const dateRange = ref([])
const selectedCategory = ref('')

// 统计数据
const statsData = ref([
  { title: '总备件数量', value: 0, trend: 12.5, icon: Box, gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
  { title: '库存总价值', value: '¥0', trend: 8.3, icon: Coin, gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
  { title: '低库存项', value: 0, trend: -5.2, icon: TrendCharts, gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' },
  { title: '本月出库量', value: 0, trend: 15.7, icon: List, gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' }
])

// 预警数据
const warningData = ref([])

// 分类映射
const categoryMap = {
  electronic: { label: '电子元件', type: 'primary' },
  mechanical: { label: '机械零件', type: 'success' },
  consumable: { label: '耗材', type: 'warning' }
}

// 图表实例
let pieChart, lineChart, barChart

// 抽屉相关
const drawerVisible = ref(false)
const drawerTitle = ref('新增备件')
const partForm = reactive({
  id: null,
  name: '',
  category: '',
  currentStock: 0,
  safetyStock: 0,
  warehouse: '',
  price: 0
})

// 补货相关
const replenishVisible = ref(false)
const replenishForm = reactive({
  partId: null,
  quantity: 0,
  arrivalDate: new Date()
})

// 初始化数据
const initData = () => {
  // 从localStorage加载数据
  const savedData = localStorage.getItem('partsData')
  if (savedData) {
    partsData.value = JSON.parse(savedData)
  } else {
    // 生成模拟数据
    generateMockData()
  }
  updateAllData()
}

// 生成模拟数据
const generateMockData = () => {
  const categories = ['electronic', 'mechanical', 'consumable']
  const warehouses = ['仓库A', '仓库B', '仓库C']
  partsData.value = Array.from({ length: 50 }, (_, i) => ({
    id: i + 1,
    name: `备件${i + 1}`,
    category: categories[Math.floor(Math.random() * 3)],
    currentStock: Math.floor(Math.random() * 100),
    safetyStock: Math.floor(Math.random() * 20) + 5,
    warehouse: warehouses[Math.floor(Math.random() * 3)],
    price: Math.floor(Math.random() * 1000) + 100,
    lastUpdated: new Date().toISOString()
  }))
  localStorage.setItem('partsData', JSON.stringify(partsData.value))
}

// 更新所有数据
const updateAllData = () => {
  updateStats()
  updateWarningData()
  updateCharts()
}

// 更新统计数据
const updateStats = () => {
  const total = partsData.value.length
  const totalValue = partsData.value.reduce((sum, p) => sum + p.currentStock * p.price, 0)
  const lowStock = partsData.value.filter(p => p.currentStock < p.safetyStock).length
  const monthlyOut = Math.floor(Math.random() * 100) + 50

  statsData.value[0].value = total
  statsData.value[1].value = `¥${totalValue.toLocaleString()}`
  statsData.value[2].value = lowStock
  statsData.value[3].value = monthlyOut
}

// 更新预警数据
const updateWarningData = () => {
  warningData.value = partsData.value.filter(p => p.currentStock < p.safetyStock)
}

// 更新图表
const updateCharts = () => {
  updatePieChart()
  updateLineChart()
  updateBarChart()
}

// 饼图
const updatePieChart = () => {
  const ctx = pieChart?.canvas || document.querySelector('canvas').getContext('2d')
  if (pieChart) pieChart.destroy()

  const categories = ['electronic', 'mechanical', 'consumable']
  const counts = categories.map(c =>
      partsData.value.filter(p => selectedCategory.value ? p.category === selectedCategory.value : true)
          .filter(p => p.category === c).length
  )

  pieChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['电子元件', '机械零件', '耗材'],
      datasets: [{
        data: counts,
        backgroundColor: ['#667eea', '#764ba2', '#f093fb']
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false
    }
  })
}

// 折线图
const updateLineChart = () => {
  const ctx = lineChart?.canvas || document.querySelectorAll('canvas')[1].getContext('2d')
  if (lineChart) lineChart.destroy()

  // 生成模拟趋势数据
  const labels = Array.from({ length: 7 }, (_, i) => `第${i + 1}天`)
  const electronicData = labels.map(() => Math.floor(Math.random() * 50) + 20)
  const mechanicalData = labels.map(() => Math.floor(Math.random() * 40) + 15)

  lineChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: '电子元件',
          data: electronicData,
          borderColor: '#667eea',
          fill: false
        },
        {
          label: '机械零件',
          data: mechanicalData,
          borderColor: '#764ba2',
          fill: false
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false
    }
  })
}

// 柱状图
const updateBarChart = () => {
  const ctx = barChart?.canvas || document.querySelectorAll('canvas')[2].getContext('2d')
  if (barChart) barChart.destroy()

  const warehouses = ['仓库A', '仓库B', '仓库C']
  const turnover = warehouses.map(() => Math.floor(Math.random() * 100) + 50)

  barChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: warehouses,
      datasets: [{
        label: '周转率',
        data: turnover,
        backgroundColor: ['#667eea', '#764ba2', '#f093fb']
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false
    }
  })
}

// 事件处理
const handleDateChange = () => {
  updateAllData()
}

const handleCategoryChange = () => {
  updateCharts()
}

const refreshData = () => {
  updateAllData()
  ElMessage.success('数据已刷新')
}

const openAddPart = () => {
  drawerTitle.value = '新增备件'
  Object.assign(partForm, {
    id: null,
    name: '',
    category: '',
    currentStock: 0,
    safetyStock: 0,
    warehouse: '',
    price: 0
  })
  drawerVisible.value = true
}

const savePart = () => {
  if (partForm.id) {
    // 编辑
    const index = partsData.value.findIndex(p => p.id === partForm.id)
    partsData.value[index] = { ...partForm }
  } else {
    // 新增
    const newPart = {
      ...partForm,
      id: Date.now(),
      lastUpdated: new Date().toISOString()
    }
    partsData.value.push(newPart)
  }
  localStorage.setItem('partsData', JSON.stringify(partsData.value))
  drawerVisible.value = false
  updateAllData()
  ElMessage.success('保存成功')
}

const openReplenish = (row) => {
  replenishForm.partId = row.id
  replenishForm.quantity = row.safetyStock - row.currentStock
  replenishVisible.value = true
}

const confirmReplenish = () => {
  const part = partsData.value.find(p => p.id === replenishForm.partId)
  if (part) {
    part.currentStock += replenishForm.quantity
    part.lastUpdated = new Date().toISOString()
    localStorage.setItem('partsData', JSON.stringify(partsData.value))
    replenishVisible.value = false
    updateAllData()
    ElMessage.success('补货成功')
  }
}

// 生命周期
onMounted(() => {
  initData()
})
</script>

<style scoped>
.parts-management {
  padding: 20px;
  background: #0f1419;
  min-height: 100vh;
  color: #fff;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.filter-section {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}

.stats-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  background: rgba(255, 255, 255, 0.05);
  border: none;
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 15px;
}

.stat-icon {
  width: 50px;
  height: 50px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
}

.stat-info h3 {
  margin: 0;
  font-size: 14px;
  color: #8892b0;
}

.stat-value {
  margin: 5px 0;
  font-size: 24px;
  font-weight: bold;
  color: #fff;
}

.stat-trend {
  margin: 0;
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 5px;
}

.stat-trend.up {
  color: #00ff88;
}

.stat-trend.down {
  color: #ff4757;
}

.charts-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.charts-section canvas {
  max-height: 300px;
}

.warning-section {
  margin-bottom: 30px;
}

.action-section {
  text-align: center;
}

:deep(.el-card) {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #fff;
}

:deep(.el-table) {
  background: transparent;
  color: #fff;
}

:deep(.el-table th) {
  background: rgba(255, 255, 255, 0.05);
  color: #fff;
}

:deep(.el-table td) {
  background: transparent;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

:deep(.el-input__wrapper),
:deep(.el-input-number),
:deep(.el-select),
:deep(.el-date-editor) {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #fff;
}

:deep(.el-input__inner) {
  color: #fff;
}
</style>
