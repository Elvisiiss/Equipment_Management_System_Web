<template>
  <div class="inventory">
    <el-page-header @back="goBack" content="库存管理" />

    <el-row :gutter="20" class="mt-20">
      <!-- 库存汇总卡片 -->
      <el-col :span="6">
        <el-card shadow="hover">
          <div class="summary-card">
            <div class="summary-icon" style="background-color: #409EFF;">
              <i class="el-icon-box"></i>
            </div>
            <div class="summary-content">
              <div class="summary-title">总库存价值</div>
              <div class="summary-value">¥1,245,680</div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="6">
        <el-card shadow="hover">
          <div class="summary-card">
            <div class="summary-icon" style="background-color: #67C23A;">
              <i class="el-icon-takeaway-box"></i>
            </div>
            <div class="summary-content">
              <div class="summary-title">库存种类</div>
              <div class="summary-value">86种</div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="6">
        <el-card shadow="hover">
          <div class="summary-card">
            <div class="summary-icon" style="background-color: #E6A23C;">
              <i class="el-icon-refresh"></i>
            </div>
            <div class="summary-content">
              <div class="summary-title">平均周转率</div>
              <div class="summary-value">78%</div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="6">
        <el-card shadow="hover">
          <div class="summary-card">
            <div class="summary-icon" style="background-color: #F56C6C;">
              <i class="el-icon-warning"></i>
            </div>
            <div class="summary-content">
              <div class="summary-title">缺货风险</div>
              <div class="summary-value">12项</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-card class="mt-20">
      <template #header>
        <div class="card-header">
          <span>库存列表</span>
          <div>
            <el-input v-model="searchKeyword" placeholder="搜索库存物品" style="width: 200px;" clearable>
              <template #append>
                <el-button icon="el-icon-search" />
              </template>
            </el-input>
            <el-button type="primary" icon="el-icon-download" class="ml-10">导出</el-button>
          </div>
        </div>
      </template>

      <!-- 库存列表 -->
      <el-table :data="filteredInventory" style="width: 100%">
        <el-table-column type="index" label="序号" width="60" />
        <el-table-column prop="itemCode" label="物品编码" width="150" />
        <el-table-column prop="name" label="物品名称" width="180" />
        <el-table-column prop="category" label="类别" width="120" />
        <el-table-column label="库存数量" width="120">
          <template #default="scope">
            {{ scope.row.quantity }} {{ scope.row.unit }}
          </template>
        </el-table-column>
        <el-table-column prop="location" label="存放位置" width="150" />
        <el-table-column label="库存状态" width="120">
          <template #default="scope">
            <el-tag :type="inventoryStatusTag(scope.row.status)" size="small">
              {{ scope.row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="lastUpdate" label="最后更新" width="150" />
        <el-table-column label="操作" width="120">
          <template #default="scope">
            <el-button type="text" @click="viewDetails(scope.row)">详情</el-button>
            <el-button type="text" @click="adjustInventory(scope.row)">调整</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container mt-20">
        <el-pagination
            :current-page="currentPage"
            :page-size="pageSize"
            :total="total"
            layout="total, prev, pager, next, jumper"
            @current-change="handlePageChange"
        />
      </div>
    </el-card>

    <!-- 库存分类统计 -->
    <el-row :gutter="20" class="mt-20">
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

      <el-col :span="12">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>库存周转分析</span>
            </div>
          </template>
          <div class="chart-container">
            <div ref="turnoverChart" style="height: 300px;"></div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import * as echarts from 'echarts'

// 模拟库存数据
const inventoryList = ref([
  { id: 1, itemCode: 'ITM-001', name: '服务器内存条 DDR4 32G', category: '服务器备件',
    quantity: 85, unit: '条', location: 'A区-3排-2架', status: '正常', lastUpdate: '2023-07-24' },
  { id: 2, itemCode: 'ITM-002', name: '服务器电源 750W', category: '服务器备件',
    quantity: 42, unit: '个', location: 'A区-3排-3架', status: '正常', lastUpdate: '2023-07-25' },
  { id: 3, itemCode: 'ITM-003', name: '万兆交换机模块', category: '网络设备',
    quantity: 25, unit: '个', location: 'B区-1排-4架', status: '预警', lastUpdate: '2023-07-22' },
  { id: 4, itemCode: 'ITM-004', name: '企业级硬盘 4TB', category: '存储设备',
    quantity: 65, unit: '块', location: 'C区-2排-1架', status: '正常', lastUpdate: '2023-07-23' },
  { id: 5, itemCode: 'ITM-005', name: 'SSD固态硬盘 1TB', category: '存储设备',
    quantity: 110, unit: '块', location: 'C区-2排-2架', status: '充足', lastUpdate: '2023-07-24' },
  { id: 6, itemCode: 'ITM-006', name: '防火墙备用电源', category: '安全设备',
    quantity: 8, unit: '个', location: 'D区-4排-1架', status: '短缺', lastUpdate: '2023-07-25' },
  { id: 7, itemCode: 'ITM-007', name: '路由器备用风扇', category: '网络设备',
    quantity: 15, unit: '个', location: 'B区-1排-2架', status: '预警', lastUpdate: '2023-07-23' }
])

// 搜索和分页相关
const searchKeyword = ref('')
const currentPage = ref(1)
const pageSize = 10

// 计算总记录数
const total = computed(() => inventoryList.value.length)

// 过滤后的库存列表
const filteredInventory = computed(() => {
  let result = [...inventoryList.value]

  // 根据关键词搜索
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    result = result.filter(item =>
        item.name.toLowerCase().includes(keyword) ||
        item.itemCode.toLowerCase().includes(keyword) ||
        item.category.toLowerCase().includes(keyword)
    )
  }

  // 分页处理
  const start = (currentPage.value - 1) * pageSize
  const end = start + pageSize
  return result.slice(start, end)
})

// 库存状态标签
const inventoryStatusTag = (status) => {
  switch(status) {
    case '充足': return 'success'
    case '正常': return ''
    case '预警': return 'warning'
    case '短缺': return 'danger'
    default: return 'info'
  }
}

// 分页变化
const handlePageChange = (page) => {
  currentPage.value = page
}

// 查看详情
const viewDetails = (row) => {
  console.log('查看库存详情:', row)
}

// 调整库存
const adjustInventory = (row) => {
  console.log('调整库存:', row)
}

const goBack = () => {
  console.log('返回操作')
}

// 图表相关
const categoryChart = ref(null)
const turnoverChart = ref(null)

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
        radius: '50%',
        data: [
          { value: 35, name: '服务器备件' },
          { value: 25, name: '网络设备' },
          { value: 20, name: '存储设备' },
          { value: 15, name: '安全设备' },
          { value: 5, name: '其他' }
        ],
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }
    ]
  })

  // 初始化库存周转分析图表
  const turnoverChartInstance = echarts.init(turnoverChart.value)
  turnoverChartInstance.setOption({
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    legend: {
      data: ['周转率', '呆滞率']
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: ['服务器备件', '网络设备', '存储设备', '安全设备', '其他']
    },
    yAxis: {
      type: 'value',
      name: '百分比(%)',
      max: 100
    },
    series: [
      {
        name: '周转率',
        type: 'bar',
        data: [85, 78, 92, 65, 70],
        itemStyle: {
          color: '#409EFF'
        }
      },
      {
        name: '呆滞率',
        type: 'bar',
        data: [5, 12, 3, 25, 18],
        itemStyle: {
          color: '#F56C6C'
        }
      }
    ]
  })

  // 响应窗口变化
  window.addEventListener('resize', () => {
    categoryChartInstance.resize()
    turnoverChartInstance.resize()
  })
})
</script>

<style scoped>
.inventory {
  padding: 20px;
}

.mt-20 {
  margin-top: 20px;
}

.summary-card {
  display: flex;
  align-items: center;
}

.summary-icon {
  width: 60px;
  height: 60px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 24px;
}

.summary-content {
  margin-left: 15px;
}

.summary-title {
  font-size: 14px;
  color: #909399;
}

.summary-value {
  font-size: 24px;
  font-weight: bold;
  margin-top: 5px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.pagination-container {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

.ml-10 {
  margin-left: 10px;
}

.chart-container {
  width: 100%;
}
</style>
