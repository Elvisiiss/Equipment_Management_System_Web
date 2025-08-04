<template>
  <div class="asset-transfer">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>资产转移管理</span>
          <el-button type="primary" @click="scanOffline">模拟离线扫描盘点</el-button>
        </div>
      </template>

      <!-- 顶部操作区 -->
      <el-row :gutter="12" class="mb-12">
        <el-col :span="8">
          <el-input
              v-model="query.keyword"
              placeholder="资产编号 / 名称"
              clearable
              @clear="getList"
              @keyup.enter="getList"
          />
        </el-col>
        <el-col :span="4">
          <el-select v-model="query.workshop" clearable placeholder="所属车间" @change="getList">
            <el-option
                v-for="w in workshops"
                :key="w"
                :label="w"
                :value="w"
            />
          </el-select>
        </el-col>
        <el-col :span="6">
          <el-button type="primary" @click="getList">查询</el-button>
          <el-button @click="resetQuery">重置</el-button>
        </el-col>
      </el-row>

      <!-- 表格 -->
      <el-table v-loading="loading" :data="tableData" stripe>
        <el-table-column prop="code" label="资产编号" width="120" />
        <el-table-column prop="name" label="资产名称" show-overflow-tooltip />
        <el-table-column prop="workshop" label="当前车间" width="100" />
        <el-table-column label="实时位置" width="260">
          <template #default="{ row }">
            <el-tag size="small">{{ row.position }}</el-tag>
            <el-tooltip content="刷新定位" placement="top">
              <el-icon
                  class="cursor-pointer ml-4"
                  @click="refreshLocation(row)"
              ><Refresh /></el-icon>
            </el-tooltip>
          </template>
        </el-table-column>
        <el-table-column label="在线状态" width="90">
          <template #default="{ row }">
            <el-tag :type="row.online ? 'success' : 'info'">
              {{ row.online ? '在线' : '离线' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="openTransfer(row)">转移</el-button>
            <el-button link type="primary" @click="openDetail(row)">详情</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <el-pagination
          class="mt-12"
          background
          layout="prev, pager, next, jumper, total"
          :total="total"
          v-model:current-page="query.page"
          v-model:page-size="query.size"
          @current-change="getList"
      />
    </el-card>

    <!-- 资产转移弹窗 -->
    <el-dialog v-model="transferVisible" title="资产转移" width="420px">
      <el-form :model="transferForm" label-width="80">
        <el-form-item label="目标车间">
          <el-select v-model="transferForm.targetWorkshop" placeholder="请选择">
            <el-option
                v-for="w in workshops"
                :key="w"
                :label="w"
                :value="w"
                :disabled="w === transferForm.currentWorkshop"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="transferVisible = false">取消</el-button>
        <el-button type="primary" @click="submitTransfer">确定</el-button>
      </template>
    </el-dialog>

    <!-- 详情抽屉 -->
    <el-drawer v-model="detailVisible" :title="currentRow?.name" direction="rtl" size="420px">
      <div v-if="currentRow">
        <el-descriptions :column="1" border>
          <el-descriptions-item label="资产编号">{{ currentRow.code }}</el-descriptions-item>
          <el-descriptions-item label="当前车间">{{ currentRow.workshop }}</el-descriptions-item>
          <el-descriptions-item label="实时位置">{{ currentRow.position }}</el-descriptions-item>
          <el-descriptions-item label="在线状态">
            <el-tag :type="currentRow.online ? 'success' : 'info'">
              {{ currentRow.online ? '在线' : '离线' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="最近盘点时间">{{ currentRow.lastCheckTime }}</el-descriptions-item>
        </el-descriptions>
      </div>
    </el-drawer>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Refresh } from '@element-plus/icons-vue'

// 模拟数据
const workshops = ['冲压车间', '焊装车间', '涂装车间', '总装车间', '电池车间']

const mockAssets = Array.from({ length: 56 }, (_, i) => ({
  id: i + 1,
  code: `EQ-${1001 + i}`.padEnd(8, '0'),
  name: `设备型号-${String.fromCharCode(65 + (i % 26))}${i + 1}`,
  workshop: workshops[i % workshops.length],
  position: `工位-${(i % 20) + 1}`,
  online: Math.random() > 0.3,
  lastCheckTime: new Date(Date.now() - Math.floor(Math.random() * 86400000 * 7)).toLocaleString()
}))

// 查询参数
const query = reactive({
  keyword: '',
  workshop: '',
  page: 1,
  size: 10
})

// 表格
const loading = ref(false)
const tableData = ref([])
const total = ref(0)

// 获取列表
const getList = () => {
  loading.value = true
  setTimeout(() => {
    let list = mockAssets
    if (query.keyword) {
      const kw = query.keyword.toLowerCase()
      list = list.filter(
          (i) => i.code.toLowerCase().includes(kw) || i.name.toLowerCase().includes(kw)
      )
    }
    if (query.workshop) {
      list = list.filter((i) => i.workshop === query.workshop)
    }
    total.value = list.length
    const offset = (query.page - 1) * query.size
    tableData.value = list.slice(offset, offset + query.size)
    loading.value = false
  }, 300)
}

// 重置
const resetQuery = () => {
  query.keyword = ''
  query.workshop = ''
  query.page = 1
  getList()
}

// 刷新定位
const refreshLocation = (row) => {
  row.position = `工位-${Math.floor(Math.random() * 30) + 1}（已更新）`
  ElMessage.success('位置已刷新')
}

// 离线扫描盘点
const scanOffline = () => {
  loading.value = true
  setTimeout(() => {
    const offline = mockAssets.filter((i) => !i.online)
    offline.forEach((i) => {
      i.lastCheckTime = new Date().toLocaleString()
    })
    ElMessage.success(`离线扫描完成，共 ${offline.length} 台设备`)
    getList()
  }, 800)
}

// 资产转移
const transferVisible = ref(false)
const transferForm = reactive({
  id: null,
  currentWorkshop: '',
  targetWorkshop: ''
})

const openTransfer = (row) => {
  transferForm.id = row.id
  transferForm.currentWorkshop = row.workshop
  transferForm.targetWorkshop = ''
  transferVisible.value = true
}

const submitTransfer = () => {
  const item = mockAssets.find((i) => i.id === transferForm.id)
  if (item) {
    item.workshop = transferForm.targetWorkshop
    item.position = `${transferForm.targetWorkshop}-入口暂存区`
    ElMessage.success('转移成功')
  }
  transferVisible.value = false
  getList()
}

// 详情
const detailVisible = ref(false)
const currentRow = ref(null)
const openDetail = (row) => {
  currentRow.value = row
  detailVisible.value = true
}

onMounted(() => {
  getList()
})
</script>

<style scoped>
.asset-transfer {
  padding: 16px;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.mb-12 {
  margin-bottom: 12px;
}
.mt-12 {
  margin-top: 12px;
}
.cursor-pointer {
  cursor: pointer;
}
</style>
