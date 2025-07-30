<template>
  <div class="edge-inventory">
    <div class="page-header">
      <h2>线边库存管理</h2>
      <el-button type="primary" @click="handleRefresh">刷新</el-button>
    </div>

    <!-- 搜索栏 -->
    <div class="search-bar">
      <el-row :gutter="20">
        <el-col :span="6">
          <el-select v-model="searchForm.barcodeType" placeholder="管控方式" clearable>
            <el-option label="有条码" value="BARCODE" />
            <el-option label="无条码" value="NO_BARCODE" />
          </el-select>
        </el-col>
        <el-col :span="6">
          <el-select v-model="searchForm.status" placeholder="上机状态" clearable>
            <el-option label="未上机" value="UNUSED" />
            <el-option label="已上机" value="USED" />
          </el-select>
        </el-col>
        <el-col :span="12">
          <el-date-picker
              v-model="searchForm.dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              style="width: 100%"
          />
        </el-col>
      </el-row>
    </div>

    <!-- 统计卡片 -->
    <el-row :gutter="20" class="statistics">
      <el-col :span="6">
        <el-card>
          <div class="stat-item">
            <div class="stat-value">{{ stats.total }}</div>
            <div class="stat-label">总备件数</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card>
          <div class="stat-item">
            <div class="stat-value">{{ stats.unused }}</div>
            <div class="stat-label">未上机</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card>
          <div class="stat-item">
            <div class="stat-value">{{ stats.used }}</div>
            <div class="stat-label">已上机</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card>
          <div class="stat-item">
            <div class="stat-value">{{ stats.expired }}</div>
            <div class="stat-label">超寿命</div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 数据表格 -->
    <el-table :data="tableData" v-loading="loading" border>
      <el-table-column prop="barcode" label="条码" width="180" />
      <el-table-column prop="partName" label="备件名称" />
      <el-table-column prop="equipment" label="所属设备" width="150" />
      <el-table-column prop="position" label="安装部位" width="120" />
      <el-table-column prop="status" label="上机状态" width="100">
        <template #default="{ row }">
          <el-tag :type="row.status === 'USED' ? 'success' : 'info'">
            {{ row.status === 'USED' ? '已上机' : '未上机' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="installDate" label="安装日期" width="120" />
      <el-table-column prop="lifeLeft" label="剩余寿命" width="120">
        <template #default="{ row }">
          <span :class="row.lifeLeft < 10 ? 'text-danger' : ''">
            {{ row.lifeLeft }} 天
          </span>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="120">
        <template #default="{ row }">
          <el-button type="primary" size="small" @click="handleDetail(row)">详情</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div class="pagination">
      <el-pagination
          v-model:current-page="currentPage"
          :page-size="pageSize"
          :total="total"
          layout="prev, pager, next"
          @current-change="loadData"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import locationAPI from '@/api/location'

const loading = ref(false)
const tableData = ref([])
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

const searchForm = reactive({
  barcodeType: '',
  status: '',
  dateRange: []
})

const stats = computed(() => {
  return {
    total: tableData.value.length,
    unused: tableData.value.filter(item => item.status === 'UNUSED').length,
    used: tableData.value.filter(item => item.status === 'USED').length,
    expired: tableData.value.filter(item => item.lifeLeft <= 0).length
  }
})

const loadData = async () => {
  loading.value = true
  try {
    const res = await locationAPI.getEdgeInventory({
      page: currentPage.value - 1,
      size: pageSize.value,
      ...searchForm
    })
    tableData.value = res.data.content
    total.value = res.data.totalElements
  } catch (error) {
    console.error('加载数据失败', error)
  } finally {
    loading.value = false
  }
}

const handleRefresh = () => {
  loadData()
}

const handleDetail = (row) => {
  console.log('查看详情:', row)
}

loadData()
</script>

<style scoped>
.edge-inventory {
  padding: 20px;
}
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
.search-bar {
  margin-bottom: 20px;
}
.statistics {
  margin-bottom: 20px;
}
.stat-item {
  text-align: center;
}
.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #409EFF;
}
.stat-label {
  font-size: 14px;
  color: #666;
  margin-top: 5px;
}
.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}
.text-danger {
  color: #F56C6C;
}
</style>
