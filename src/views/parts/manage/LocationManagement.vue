<template>
  <div class="location-management">
    <div class="page-header">
      <h2>库位管理</h2>
      <el-button type="primary" @click="handleCreate">+ 新建库位</el-button>
    </div>

    <!-- 搜索栏 -->
    <div class="search-bar">
      <el-row :gutter="20">
        <el-col :span="6">
          <el-select v-model="searchForm.type" placeholder="库位类型" clearable>
            <el-option label="立体库" value="STEREO" />
            <el-option label="平面库" value="FLAT" />
            <el-option label="线边库" value="EDGE" />
          </el-select>
        </el-col>
        <el-col :span="6">
          <el-select v-model="searchForm.area" placeholder="区域" clearable>
            <el-option label="A区" value="A" />
            <el-option label="B区" value="B" />
            <el-option label="C区" value="C" />
          </el-select>
        </el-col>
        <el-col :span="6">
          <el-select v-model="searchForm.status" placeholder="使用状态" clearable>
            <el-option label="空闲" value="FREE" />
            <el-option label="占用" value="OCCUPIED" />
            <el-option label="维修" value="MAINTAIN" />
          </el-select>
        </el-col>
        <el-col :span="6">
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-col>
      </el-row>
    </div>

    <!-- 数据表格 -->
    <el-table :data="tableData" v-loading="loading" border>
      <el-table-column prop="code" label="库位编码" width="120" />
      <el-table-column prop="name" label="库位名称" />
      <el-table-column prop="type" label="类型" width="100">
        <template #default="{ row }">
          <el-tag :type="getTypeTag(row.type)">{{ row.typeLabel }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="area" label="区域" width="80" />
      <el-table-column prop="status" label="使用状态" width="100">
        <template #default="{ row }">
          <el-tag :type="getStatusTag(row.status)">{{ row.statusLabel }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="resourceStatus" label="资源状态" width="100">
        <template #default="{ row }">
          <el-tag :type="getResourceTag(row.resourceStatus)">{{ row.resourceStatusLabel }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" size="small" @click="handleEdit(row)">编辑</el-button>
          <el-button type="info" size="small" @click="handleDetail(row)">详情</el-button>
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

    <!-- 新建/编辑弹窗 -->
    <LocationForm
        v-model="dialogVisible"
        :data="currentLocation"
        @success="loadData"
    />
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import LocationForm from './LocationForm.vue'
import locationAPI from '@/api/location'

const loading = ref(false)
const tableData = ref([])
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const dialogVisible = ref(false)
const currentLocation = ref(null)

const searchForm = reactive({
  type: '',
  area: '',
  status: ''
})

const loadData = async () => {
  loading.value = true
  try {
    const res = await locationAPI.getLocations({
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
  Object.assign(searchForm, { type: '', area: '', status: '' })
  loadData()
}

const handleCreate = () => {
  currentLocation.value = null
  dialogVisible.value = true
}

const handleEdit = (row) => {
  currentLocation.value = row
  dialogVisible.value = true
}

const handleDetail = (row) => {
  console.log('查看详情:', row)
}

const getTypeTag = (type) => {
  const map = { STEREO: 'success', FLAT: 'info', EDGE: 'warning' }
  return map[type] || 'info'
}

const getStatusTag = (status) => {
  const map = { FREE: 'success', OCCUPIED: 'danger', MAINTAIN: 'warning' }
  return map[status] || 'info'
}

const getResourceTag = (status) => {
  const map = { NORMAL: 'success', LOCKED: 'warning', DISABLED: 'danger' }
  return map[status] || 'info'
}

loadData()
</script>

<style scoped>
.location-management {
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
  background: white;
  padding: 15px;
  border-radius: 8px;
}
.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}
</style>
