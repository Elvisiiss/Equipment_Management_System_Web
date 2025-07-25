<template>
  <div class="pending-storage">
    <el-page-header @back="goBack" content="待入库管理" />

    <el-card class="mt-20">
      <template #header>
        <div class="card-header">
          <span>待入库货物列表</span>
          <div>
            <el-button type="primary" icon="el-icon-circle-plus">新增待入库</el-button>
          </div>
        </div>
      </template>

      <!-- 搜索和筛选 -->
      <div class="filter-container">
        <el-input v-model="searchKeyword" placeholder="搜索货物名称/供应商" style="width: 300px;" clearable>
          <template #append>
            <el-button icon="el-icon-search" />
          </template>
        </el-input>

        <el-select v-model="filterStatus" placeholder="入库状态" clearable class="ml-10">
          <el-option label="待验收" value="pending" />
          <el-option label="部分验收" value="partial" />
          <el-option label="已验收" value="completed" />
        </el-select>

        <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="到达开始日期"
            end-placeholder="到达结束日期"
            class="ml-10"
        />
      </div>

      <!-- 待入库列表 -->
      <el-table :data="filteredPendingList" style="width: 100%" class="mt-20">
        <el-table-column type="index" label="序号" width="60" />
        <el-table-column prop="arrivalDate" label="到达日期" width="120" />
        <el-table-column prop="supplier" label="供应商" width="150" />
        <el-table-column prop="itemName" label="货物名称" />
        <el-table-column label="数量" width="120">
          <template #default="scope">
            {{ scope.row.quantity }} {{ scope.row.unit }}
          </template>
        </el-table-column>
        <el-table-column prop="batchNumber" label="批次号" width="180" />
        <el-table-column label="状态" width="120">
          <template #default="scope">
            <el-tag :type="statusTagType(scope.row.status)">
              {{ scope.row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="scope">
            <el-button type="primary" size="small" @click="handleCheck(scope.row)">验收</el-button>
            <el-button type="success" size="small" @click="handleStorage(scope.row)">入库</el-button>
            <el-button type="info" size="small" icon="el-icon-more" @click="viewDetails(scope.row)" />
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

    <!-- 验收对话框 -->
    <el-dialog v-model="checkDialogVisible" title="货物验收" width="600px">
      <el-form :model="checkForm" label-width="100px">
        <el-form-item label="货物名称">
          <el-input v-model="checkForm.itemName" disabled />
        </el-form-item>
        <el-form-item label="供应商">
          <el-input v-model="checkForm.supplier" disabled />
        </el-form-item>
        <el-form-item label="批次号">
          <el-input v-model="checkForm.batchNumber" disabled />
        </el-form-item>
        <el-form-item label="到货数量">
          <el-input v-model="checkForm.quantity" disabled />
        </el-form-item>
        <el-form-item label="合格数量" required>
          <el-input-number v-model="checkForm.qualifiedQuantity" :min="0" :max="checkForm.quantity" />
        </el-form-item>
        <el-form-item label="不合格原因">
          <el-input v-model="checkForm.reason" type="textarea" :rows="2" placeholder="如有不合格货物，请说明原因" />
        </el-form-item>
        <el-form-item label="验收人">
          <el-input v-model="checkForm.checker" placeholder="请输入验收人姓名" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="checkDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmCheck">确认验收</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

// 模拟待入库数据
const pendingList = ref([
  {
    id: 1,
    arrivalDate: '2023-07-25',
    supplier: '华为技术有限公司',
    itemName: '服务器内存条 DDR4 32G',
    quantity: 100,
    unit: '条',
    batchNumber: 'HW-MEM-23072501',
    status: '待验收'
  },
  {
    id: 2,
    arrivalDate: '2023-07-24',
    supplier: '戴尔(中国)有限公司',
    itemName: '服务器电源 750W',
    quantity: 50,
    unit: '个',
    batchNumber: 'DELL-PWR-23072402',
    status: '部分验收'
  },
  {
    id: 3,
    arrivalDate: '2023-07-23',
    supplier: '思科系统公司',
    itemName: '万兆交换机模块',
    quantity: 30,
    unit: '个',
    batchNumber: 'CISCO-SW-23072301',
    status: '待验收'
  },
  {
    id: 4,
    arrivalDate: '2023-07-22',
    supplier: '希捷科技',
    itemName: '企业级硬盘 4TB',
    quantity: 80,
    unit: '块',
    batchNumber: 'SEAGATE-HDD-23072201',
    status: '已验收'
  },
  {
    id: 5,
    arrivalDate: '2023-07-21',
    supplier: '三星电子',
    itemName: 'SSD固态硬盘 1TB',
    quantity: 120,
    unit: '块',
    batchNumber: 'SAMSUNG-SSD-23072101',
    status: '待验收'
  }
])

// 搜索和筛选相关
const searchKeyword = ref('')
const filterStatus = ref('')
const dateRange = ref([])

// 分页相关
const currentPage = ref(1)
const pageSize = 10
const total = computed(() => filteredPendingList.value.length)

// 过滤后的待入库列表
const filteredPendingList = computed(() => {
  let result = [...pendingList.value]

  // 根据状态筛选
  if (filterStatus.value) {
    const statusMap = {
      'pending': '待验收',
      'partial': '部分验收',
      'completed': '已验收'
    }
    result = result.filter(item => item.status === statusMap[filterStatus.value])
  }

  // 根据关键词搜索
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    result = result.filter(item =>
        item.itemName.toLowerCase().includes(keyword) ||
        item.supplier.toLowerCase().includes(keyword)
    )
  }

  // 分页处理
  const start = (currentPage.value - 1) * pageSize
  const end = start + pageSize
  return result.slice(start, end)
})

// 状态标签类型
const statusTagType = (status) => {
  switch(status) {
    case '待验收': return 'danger'
    case '部分验收': return 'warning'
    case '已验收': return 'success'
    default: return 'info'
  }
}

// 分页变化
const handlePageChange = (page) => {
  currentPage.value = page
}

// 验收对话框相关
const checkDialogVisible = ref(false)
const checkForm = ref({
  itemName: '',
  supplier: '',
  batchNumber: '',
  quantity: 0,
  qualifiedQuantity: 0,
  reason: '',
  checker: ''
})

// 处理验收操作
const handleCheck = (row) => {
  checkForm.value = {
    itemName: row.itemName,
    supplier: row.supplier,
    batchNumber: row.batchNumber,
    quantity: row.quantity,
    qualifiedQuantity: row.quantity,
    reason: '',
    checker: ''
  }
  checkDialogVisible.value = true
}

// 确认验收
const confirmCheck = () => {
  // 在实际应用中，这里会调用API
  console.log('验收信息:', checkForm.value)
  checkDialogVisible.value = false
  ElMessage.success('验收信息已提交')

  // 更新状态
  const item = pendingList.value.find(i => i.batchNumber === checkForm.value.batchNumber)
  if (item) {
    if (checkForm.value.qualifiedQuantity === item.quantity) {
      item.status = '已验收'
    } else if (checkForm.value.qualifiedQuantity > 0) {
      item.status = '部分验收'
    }
  }
}

// 处理入库操作
const handleStorage = (row) => {
  ElMessageBox.confirm(`确定要将批次 ${row.batchNumber} 的货物入库吗?`, '确认入库', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    // 在实际应用中，这里会调用API
    pendingList.value = pendingList.value.filter(item => item.id !== row.id)
    ElMessage.success('入库操作成功')
  }).catch(() => {
    // 取消操作
  })
}

// 查看详情
const viewDetails = (row) => {
  console.log('查看详情:', row)
}

const goBack = () => {
  console.log('返回操作')
}
</script>

<style scoped>
.pending-storage {
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

.filter-container {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.ml-10 {
  margin-left: 10px;
}

.pagination-container {
  display: flex;
  justify-content: flex-end;
}
</style>
