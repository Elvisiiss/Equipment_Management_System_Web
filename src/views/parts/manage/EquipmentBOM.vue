<template>
  <div class="equipment-bom">
    <div class="page-header">
      <h2>设备BOM管理</h2>
      <el-button type="primary" @click="handleCreate">+ 新建设备</el-button>
    </div>

    <!-- 搜索栏 -->
    <div class="search-bar">
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input
              v-model="searchForm.keyword"
              placeholder="搜索设备名称或编码"
              clearable
          />
        </el-col>
        <el-col :span="8">
          <el-select v-model="searchForm.category" placeholder="设备类型" clearable>
            <el-option label="加工中心" value="MACHINE_CENTER" />
            <el-option label="车床" value="LATHE" />
            <el-option label="铣床" value="MILLING" />
          </el-select>
        </el-col>
        <el-col :span="8">
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-col>
      </el-row>
    </div>

    <!-- 设备卡片 -->
    <el-row :gutter="20">
      <el-col :span="6" v-for="item in tableData" :key="item.id">
        <el-card class="equipment-card" shadow="hover">
          <div class="card-header">
            <h3>{{ item.name }}</h3>
            <el-tag>{{ item.categoryLabel }}</el-tag>
          </div>
          <div class="card-content">
            <p><strong>编码：</strong>{{ item.code }}</p>
            <p><strong>型号：</strong>{{ item.model }}</p>
            <p><strong>部位数：</strong>{{ item.partsCount }} 个</p>
            <p><strong>维护标准：</strong>{{ item.hasStandard ? '已配置' : '未配置' }}</p>
          </div>
          <div class="card-actions">
            <el-button type="primary" size="small" @click="handleDetail(item)">详情</el-button>
            <el-button type="info" size="small" @click="handleEdit(item)">编辑</el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>

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
import { ref, reactive } from 'vue'
import locationAPI from '@/api/location'

const loading = ref(false)
const tableData = ref([])
const currentPage = ref(1)
const pageSize = ref(12)
const total = ref(0)

const searchForm = reactive({
  keyword: '',
  category: ''
})

const loadData = async () => {
  loading.value = true
  try {
    const res = await locationAPI.getEquipments({
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

const handleSearch = () => {
  currentPage.value = 1
  loadData()
}

const resetSearch = () => {
  Object.assign(searchForm, { keyword: '', category: '' })
  loadData()
}

const handleCreate = () => {
  console.log('新建设备')
}

const handleEdit = (row) => {
  console.log('编辑设备:', row)
}

const handleDetail = (row) => {
  console.log('查看详情:', row)
}

loadData()
</script>

<style scoped>
.equipment-bom {
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
.equipment-card {
  margin-bottom: 20px;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}
.card-content {
  margin-bottom: 15px;
  font-size: 14px;
}
.card-actions {
  text-align: right;
}
.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}
</style>
