<template>
  <div class="storage-detail">
    <el-page-header @back="goBack" content="入库明细" />

    <el-card class="mt-20">
      <template #header>
        <div class="card-header">
          <span>入库明细查询</span>
          <div>
            <el-date-picker
                v-model="dateRange"
                type="daterange"
                range-separator="至"
                start-placeholder="入库开始日期"
                end-placeholder="入库结束日期"
                class="mr-10"
            />
            <el-input v-model="searchKeyword" placeholder="搜索单号/物品/供应商" style="width: 250px;" clearable>
              <template #append>
                <el-button icon="el-icon-search" />
              </template>
            </el-input>
          </div>
        </div>
      </template>

      <!-- 入库明细列表 -->
      <el-table :data="filteredStorageDetails" style="width: 100%">
        <el-table-column prop="storageNumber" label="入库单号" width="180" />
        <el-table-column prop="storageDate" label="入库日期" width="120" />
        <el-table-column prop="supplier" label="供应商" width="180" />
        <el-table-column prop="operator" label="操作人" width="120" />
        <el-table-column prop="batchNumber" label="批次号" width="180" />
        <el-table-column label="入库状态" width="120">
          <template #default="scope">
            <el-tag :type="scope.row.status === '已完成' ? 'success' : 'warning'">
              {{ scope.row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100">
          <template #default="scope">
            <el-button type="text" @click="viewDetails(scope.row)">详情</el-button>
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

    <!-- 详情对话框 -->
    <el-dialog v-model="detailDialogVisible" title="入库单详情" width="800px">
      <div v-if="currentDetail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="入库单号">{{ currentDetail.storageNumber }}</el-descriptions-item>
          <el-descriptions-item label="入库日期">{{ currentDetail.storageDate }}</el-descriptions-item>
          <el-descriptions-item label="供应商">{{ currentDetail.supplier }}</el-descriptions-item>
          <el-descriptions-item label="操作人">{{ currentDetail.operator }}</el-descriptions-item>
          <el-descriptions-item label="批次号">{{ currentDetail.batchNumber }}</el-descriptions-item>
          <el-descriptions-item label="采购单号">{{ currentDetail.purchaseNumber }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="currentDetail.status === '已完成' ? 'success' : 'warning'">
              {{ currentDetail.status }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="备注" :span="2">{{ currentDetail.remark }}</el-descriptions-item>
        </el-descriptions>

        <el-divider>入库物品明细</el-divider>

        <el-table :data="currentDetail.items" style="width: 100%">
          <el-table-column prop="name" label="物品名称" />
          <el-table-column prop="spec" label="规格" width="150" />
          <el-table-column label="到货数量" width="120">
            <template #default="scope">
              {{ scope.row.receivedQuantity }} {{ scope.row.unit }}
            </template>
          </el-table-column>
          <el-table-column label="合格数量" width="120">
            <template #default="scope">
              {{ scope.row.qualifiedQuantity }} {{ scope.row.unit }}
            </template>
          </el-table-column>
          <el-table-column label="不合格原因" width="180">
            <template #default="scope">
              {{ scope.row.rejectReason || '-' }}
            </template>
          </el-table-column>
          <el-table-column prop="location" label="存放位置" width="150" />
        </el-table>

        <el-divider>验收记录</el-divider>

        <el-descriptions :column="1" border>
          <el-descriptions-item label="验收人">{{ currentDetail.checker }}</el-descriptions-item>
          <el-descriptions-item label="验收时间">{{ currentDetail.checkTime }}</el-descriptions-item>
          <el-descriptions-item label="验收结果">
            <el-tag :type="currentDetail.checkResult === '合格' ? 'success' : 'danger'">
              {{ currentDetail.checkResult }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="验收备注">{{ currentDetail.checkComment }}</el-descriptions-item>
        </el-descriptions>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

// 模拟入库明细数据
const storageDetails = ref([
  {
    id: 1,
    storageNumber: 'IND-20230725001',
    storageDate: '2023-07-25',
    supplier: '华为技术有限公司',
    operator: '张工',
    batchNumber: 'HW-MEM-23072501',
    purchaseNumber: 'PO-2023072001',
    status: '已完成',
    remark: '服务器内存条',
    checker: '王工',
    checkTime: '2023-07-25 10:30',
    checkResult: '合格',
    checkComment: '抽检5件，全部合格',
    items: [
      { name: '服务器内存条 DDR4 32G', spec: 'DDR4 2666MHz', receivedQuantity: 100, qualifiedQuantity: 100, unit: '条', location: 'A区-3排-2架' }
    ]
  },
  {
    id: 2,
    storageNumber: 'IND-20230724002',
    storageDate: '2023-07-24',
    supplier: '戴尔(中国)有限公司',
    operator: '李工',
    batchNumber: 'DELL-PWR-23072402',
    purchaseNumber: 'PO-2023071502',
    status: '已完成',
    remark: '服务器电源',
    checker: '赵工',
    checkTime: '2023-07-24 14:20',
    checkResult: '合格',
    checkComment: '抽检10件，全部合格',
    items: [
      { name: '服务器电源 750W', spec: '冗余电源', receivedQuantity: 50, qualifiedQuantity: 50, unit: '个', location: 'A区-3排-3架' }
    ]
  },
  {
    id: 3,
    storageNumber: 'IND-20230723003',
    storageDate: '2023-07-23',
    supplier: '思科系统公司',
    operator: '王工',
    batchNumber: 'CISCO-SW-23072301',
    purchaseNumber: 'PO-2023071003',
    status: '已完成',
    remark: '万兆交换机模块',
    checker: '钱工',
    checkTime: '2023-07-23 11:15',
    checkResult: '部分合格',
    checkComment: '30件中有2件存在外观损伤',
    items: [
      { name: '万兆交换机模块', spec: 'SFP+', receivedQuantity: 30, qualifiedQuantity: 28, rejectReason: '外观损伤', unit: '个', location: 'B区-1排-4架' }
    ]
  }
])

// 搜索和筛选相关
const searchKeyword = ref('')
const dateRange = ref([])

// 分页相关
const currentPage = ref(1)
const pageSize = 10
const total = computed(() => storageDetails.value.length)

// 过滤后的入库明细
const filteredStorageDetails = computed(() => {
  let result = [...storageDetails.value]

  // 根据关键词搜索
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    result = result.filter(item =>
        item.storageNumber.toLowerCase().includes(keyword) ||
        item.batchNumber.toLowerCase().includes(keyword) ||
        item.supplier.toLowerCase().includes(keyword) ||
        item.items.some(i => i.name.toLowerCase().includes(keyword))
    )
  }

  // 分页处理
  const start = (currentPage.value - 1) * pageSize
  const end = start + pageSize
  return result.slice(start, end)
})

// 分页变化
const handlePageChange = (page) => {
  currentPage.value = page
}

// 详情对话框相关
const detailDialogVisible = ref(false)
const currentDetail = ref(null)

// 查看详情
const viewDetails = (row) => {
  currentDetail.value = row
  detailDialogVisible.value = true
}

const goBack = () => {
  console.log('返回操作')
}
</script>

<style scoped>
.storage-detail {
  padding: 20px;
}

.mt-20 {
  margin-top: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.mr-10 {
  margin-right: 10px;
}

.pagination-container {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}
</style>
