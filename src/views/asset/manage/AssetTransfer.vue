<template>
  <div class="asset-transfer">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>资产转移管理（RFID 版）</span>
          <div>
            <el-button
                type="primary"
                @click="scanOffline"
                :loading="scanLoading"
            >远距离 RFID 扫描盘点</el-button>
            <el-button type="success" @click="refreshAllLocation">刷新全部定位</el-button>
          </div>
        </div>
      </template>

      <!-- 查询区 -->
      <el-row :gutter="12" class="mb-12">
        <el-col :span="6">
          <el-input
              v-model="query.keyword"
              placeholder="资产编号 / 名称 / RFID"
              clearable
              @clear="getList"
              @keyup.enter="getList"
          />
        </el-col>
        <el-col :span="4">
          <el-select v-model="query.workshop" clearable placeholder="当前车间" @change="getList">
            <el-option v-for="w in workshops" :key="w" :label="w" :value="w" />
          </el-select>
        </el-col>
        <el-col :span="4">
          <el-select v-model="query.reader" clearable placeholder="最近读取器" @change="getList">
            <el-option v-for="r in readers" :key="r" :label="r" :value="r" />
          </el-select>
        </el-col>
        <el-col :span="6">
          <el-button type="primary" @click="getList">查询</el-button>
          <el-button @click="resetQuery">重置</el-button>
        </el-col>
      </el-row>

      <!-- 表格 -->
      <el-table v-loading="loading" :data="tableData" stripe>
        <el-table-column prop="code" label="资产编号" width="110" />
        <el-table-column prop="name" label="资产名称" show-overflow-tooltip />
        <el-table-column prop="rfid" label="RFID (EPC)" width="180" />
        <el-table-column prop="workshop" label="当前车间" width="100" />
        <el-table-column label="实时位置" width="220">
          <template #default="{ row }">
            <el-tag size="small">
              {{ row.readerId }} @ {{ row.position }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="90">
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

    <!-- 转移弹窗 -->
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
      <el-descriptions :column="1" border v-if="currentRow">
        <el-descriptions-item label="资产编号">{{ currentRow.code }}</el-descriptions-item>
        <el-descriptions-item label="RFID">{{ currentRow.rfid }}</el-descriptions-item>
        <el-descriptions-item label="当前车间">{{ currentRow.workshop }}</el-descriptions-item>
        <el-descriptions-item label="最近读取器">{{ currentRow.readerId }}</el-descriptions-item>
        <el-descriptions-item label="实时位置">{{ currentRow.position }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="currentRow.online ? 'success' : 'info'">
            {{ currentRow.online ? '在线' : '离线' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="最近盘点时间">{{ currentRow.lastCheckTime }}</el-descriptions-item>
      </el-descriptions>
    </el-drawer>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'

/* ---------- 模拟数据 ---------- */
const workshops = ['冲压车间', '焊装车间', '涂装车间', '总装车间', '电池车间']
const readers = ['R-IN-01', 'R-OUT-02', 'R-WC-A', 'R-WC-B', '手持机-PDA']

const mockAssets = Array.from({ length: 66 }, (_, i) => {
  const reader = readers[i % readers.length]
  return {
    id: i + 1,
    code: `EQ-${(1001 + i).toString().padStart(4, '0')}`,
    name: `RFID设备-${String.fromCharCode(65 + (i % 26))}${i + 1}`,
    rfid: `EPC-${Math.random().toString(36).substring(2, 12).toUpperCase()}`,
    workshop: workshops[i % workshops.length],
    readerId: reader,
    position: `${reader}-${(i % 10) + 1}号位`,
    online: Math.random() > 0.35,
    lastCheckTime: new Date(Date.now() - Math.random() * 86400000 * 3).toLocaleString()
  }
})

/* ---------- 查询 & 分页 ---------- */
const query = reactive({
  keyword: '',
  workshop: '',
  reader: '',
  page: 1,
  size: 10
})
const loading = ref(false)
const tableData = ref([])
const total = ref(0)

const getList = () => {
  loading.value = true
  setTimeout(() => {
    let list = mockAssets
    if (query.keyword) {
      const kw = query.keyword.toLowerCase()
      list = list.filter(
          (i) =>
              i.code.toLowerCase().includes(kw) ||
              i.name.toLowerCase().includes(kw) ||
              i.rfid.toLowerCase().includes(kw)
      )
    }
    if (query.workshop) list = list.filter((i) => i.workshop === query.workshop)
    if (query.reader) list = list.filter((i) => i.readerId === query.reader)
    total.value = list.length
    const offset = (query.page - 1) * query.size
    tableData.value = list.slice(offset, offset + query.size)
    loading.value = false
  }, 400)
}
const resetQuery = () => {
  Object.assign(query, { keyword: '', workshop: '', reader: '', page: 1 })
  getList()
}

/* ---------- WebSocket：24h 自动监控 ---------- */
let ws
const connectWS = () => {
  // 生产环境换成 wss://your-domain.com/ws/rfid
  ws = new WebSocket('ws://localhost:8080/ws/rfid')
  ws.onopen = () => console.log('RFID监控通道已连接')
  ws.onmessage = (evt) => {
    const msg = JSON.parse(evt.data)
    if (msg.type === 'RFID_REPORT') {
      // 后端推送单条 RFID 实时数据
      const idx = mockAssets.findIndex((a) => a.rfid === msg.rfid)
      if (idx > -1) {
        mockAssets[idx].readerId = msg.readerId
        mockAssets[idx].position = msg.position
        mockAssets[idx].online = true
        mockAssets[idx].lastCheckTime = new Date().toLocaleString()
        getList() // 刷新当前分页
      }
    }
  }
  ws.onclose = () => setTimeout(connectWS, 3000)
}
onMounted(() => {
  getList()
  connectWS()
})
onUnmounted(() => ws?.close())

/* ---------- 离线 RFID 盘点 ---------- */
const scanLoading = ref(false)
const scanOffline = () => {
  scanLoading.value = true
  // 真实场景：调用后端 /api/rfid/scan-offline
  setTimeout(() => {
    const offline = mockAssets.filter((i) => !i.online)
    offline.forEach((i) => {
      i.lastCheckTime = new Date().toLocaleString()
      i.online = true // 模拟已读到
    })
    ElMessage.success(`离线 RFID 扫描完成，共 ${offline.length} 台`)
    scanLoading.value = false
    getList()
  }, 1200)
}

/* ---------- 刷新全部定位 ---------- */
const refreshAllLocation = () => {
  mockAssets.forEach((i) => {
    i.readerId = readers[Math.floor(Math.random() * readers.length)]
    i.position = `${i.readerId}-${Math.floor(Math.random() * 20) + 1}号位`
  })
  ElMessage.success('已模拟更新全部 RFID 位置')
  getList()
}

/* ---------- 资产转移 ---------- */
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
    item.position = `${item.readerId}-${transferForm.targetWorkshop}入口`
    ElMessage.success('转移成功')
  }
  transferVisible.value = false
  getList()
}

/* ---------- 详情 ---------- */
const detailVisible = ref(false)
const currentRow = ref(null)
const openDetail = (row) => {
  currentRow.value = row
  detailVisible.value = true
}
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
</style>
