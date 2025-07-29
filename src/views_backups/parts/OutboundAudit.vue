<template>
  <div class="outbound-audit">
    <el-page-header @back="goBack" content="出库审核" />

    <el-card class="mt-20">
      <template #header>
        <div class="card-header">
          <span>待审核出库申请</span>
          <div>
            <el-input v-model="searchKeyword" placeholder="搜索申请单/申请人" style="width: 250px;" clearable>
              <template #append>
                <el-button icon="el-icon-search" />
              </template>
            </el-input>
          </div>
        </div>
      </template>

      <!-- 待审核列表 -->
      <el-table :data="pendingAuditList" style="width: 100%">
        <el-table-column type="index" label="序号" width="60" />
        <el-table-column prop="applyNumber" label="申请单号" width="180" />
        <el-table-column prop="applyDate" label="申请日期" width="120" />
        <el-table-column prop="applicant" label="申请人" width="120" />
        <el-table-column prop="department" label="申请部门" width="150" />
        <el-table-column prop="purpose" label="用途" />
        <el-table-column label="申请数量" width="120">
          <template #default="scope">
            {{ scope.row.quantity }} {{ scope.row.unit }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="scope">
            <el-button type="primary" size="small" @click="handleAudit(scope.row)">审核</el-button>
            <el-button type="info" size="small" @click="viewDetails(scope.row)">详情</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-card class="mt-20">
      <template #header>
        <div class="card-header">
          <span>已审核记录</span>
          <div>
            <el-date-picker
                v-model="auditDateRange"
                type="daterange"
                range-separator="至"
                start-placeholder="审核开始日期"
                end-placeholder="审核结束日期"
            />
          </div>
        </div>
      </template>

      <!-- 已审核记录 -->
      <el-table :data="auditedList" style="width: 100%">
        <el-table-column prop="applyNumber" label="申请单号" width="180" />
        <el-table-column prop="applyDate" label="申请日期" width="120" />
        <el-table-column prop="applicant" label="申请人" width="120" />
        <el-table-column prop="auditDate" label="审核日期" width="120" />
        <el-table-column prop="auditor" label="审核人" width="120" />
        <el-table-column label="状态" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.status === '通过' ? 'success' : 'danger'">
              {{ scope.row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120">
          <template #default="scope">
            <el-button type="text" @click="viewDetails(scope.row)">查看</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container mt-20">
        <el-pagination
            :current-page="auditCurrentPage"
            :page-size="auditPageSize"
            :total="auditTotal"
            layout="total, prev, pager, next, jumper"
            @current-change="handleAuditPageChange"
        />
      </div>
    </el-card>

    <!-- 审核对话框 -->
    <el-dialog v-model="auditDialogVisible" :title="`出库申请审核 - ${currentApply.applyNumber || ''}`" width="700px">
      <el-form :model="auditForm" label-width="100px">
        <el-row>
          <el-col :span="12">
            <el-form-item label="申请单号">
              <el-input v-model="currentApply.applyNumber" disabled />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="申请日期">
              <el-input v-model="currentApply.applyDate" disabled />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-col :span="12">
            <el-form-item label="申请人">
              <el-input v-model="currentApply.applicant" disabled />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="申请部门">
              <el-input v-model="currentApply.department" disabled />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="用途">
          <el-input v-model="currentApply.purpose" type="textarea" :rows="2" disabled />
        </el-form-item>

        <el-divider>申请物品</el-divider>

        <el-table :data="currentApply.items" style="width: 100%">
          <el-table-column prop="name" label="物品名称" />
          <el-table-column prop="spec" label="规格" width="150" />
          <el-table-column label="申请数量" width="120">
            <template #default="scope">
              {{ scope.row.quantity }} {{ scope.row.unit }}
            </template>
          </el-table-column>
          <el-table-column label="库存可用量" width="120">
            <template #default="scope">
              {{ scope.row.available }} {{ scope.row.unit }}
            </template>
          </el-table-column>
          <el-table-column label="状态" width="100">
            <template #default="scope">
              <el-tag :type="scope.row.available >= scope.row.quantity ? 'success' : 'danger'" size="small">
                {{ scope.row.available >= scope.row.quantity ? '充足' : '不足' }}
              </el-tag>
            </template>
          </el-table-column>
        </el-table>

        <el-divider>审核信息</el-divider>

        <el-form-item label="审核结果" required>
          <el-radio-group v-model="auditForm.result">
            <el-radio label="pass">通过</el-radio>
            <el-radio label="reject">拒绝</el-radio>
            <el-radio label="partial">部分通过</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item v-if="auditForm.result === 'reject' || auditForm.result === 'partial'" label="审核意见" required>
          <el-input v-model="auditForm.comment" type="textarea" :rows="3" placeholder="请输入审核意见" />
        </el-form-item>

        <el-form-item v-if="auditForm.result === 'partial'" label="批准数量">
          <el-table :data="currentApply.items" style="width: 100%">
            <el-table-column prop="name" label="物品名称" />
            <el-table-column label="批准数量">
              <template #default="scope">
                <el-input-number
                    v-model="scope.row.approvedQuantity"
                    :min="0"
                    :max="Math.min(scope.row.quantity, scope.row.available)"
                    size="small"
                />
              </template>
            </el-table-column>
          </el-table>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="auditDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitAudit">提交审核</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import {computed, ref} from 'vue'

// 待审核出库申请
const pendingAuditList = ref([
  {
    id: 1,
    applyNumber: 'OUT-20230725001',
    applyDate: '2023-07-25',
    applicant: '张工',
    department: 'IT运维部',
    purpose: '服务器维修更换备件',
    items: [
      { id: 101, name: '服务器内存条 DDR4 32G', spec: 'DDR4 2666MHz', quantity: 5, unit: '条', available: 85 },
      { id: 102, name: '服务器电源 750W', spec: '冗余电源', quantity: 2, unit: '个', available: 42 }
    ]
  },
  {
    id: 2,
    applyNumber: 'OUT-20230724003',
    applyDate: '2023-07-24',
    applicant: '李工',
    department: '网络部',
    purpose: '核心交换机模块更换',
    items: [
      { id: 201, name: '万兆交换机模块', spec: 'SFP+', quantity: 4, unit: '个', available: 25 }
    ]
  },
  {
    id: 3,
    applyNumber: 'OUT-20230723002',
    applyDate: '2023-07-23',
    applicant: '王工',
    department: '数据中心',
    purpose: '存储服务器扩容',
    items: [
      { id: 301, name: '企业级硬盘 4TB', spec: 'SAS 12Gbps', quantity: 10, unit: '块', available: 65 },
      { id: 302, name: 'SSD固态硬盘 1TB', spec: 'SATA', quantity: 4, unit: '块', available: 110 }
    ]
  }
])

// 已审核记录
const auditedList = ref([
  {
    id: 1001,
    applyNumber: 'OUT-20230722001',
    applyDate: '2023-07-22',
    applicant: '赵工',
    department: '安全部',
    auditDate: '2023-07-22',
    auditor: '管理员',
    status: '通过'
  },
  {
    id: 1002,
    applyNumber: 'OUT-20230721005',
    applyDate: '2023-07-21',
    applicant: '钱工',
    department: '研发部',
    auditDate: '2023-07-21',
    auditor: '管理员',
    status: '拒绝'
  },
  {
    id: 1003,
    applyNumber: 'OUT-20230720003',
    applyDate: '2023-07-20',
    applicant: '孙工',
    department: 'IT运维部',
    auditDate: '2023-07-20',
    auditor: '管理员',
    status: '通过'
  }
])

// 搜索相关
const searchKeyword = ref('')

// 已审核记录分页
const auditCurrentPage = ref(1)
const auditPageSize = 5
const auditTotal = computed(() => auditedList.value.length)

// 过滤后的待审核列表
const filteredPendingList = computed(() => {
  if (!searchKeyword.value) return pendingAuditList.value
  const keyword = searchKeyword.value.toLowerCase()
  return pendingAuditList.value.filter(item =>
      item.applyNumber.toLowerCase().includes(keyword) ||
      item.applicant.toLowerCase().includes(keyword)
  )
})

// 过滤后的已审核列表（分页）
const paginatedAuditedList = computed(() => {
  const start = (auditCurrentPage.value - 1) * auditPageSize
  const end = start + auditPageSize
  return auditedList.value.slice(start, end)
})

// 审核对话框相关
const auditDialogVisible = ref(false)
const currentApply = ref({})
const auditForm = ref({
  result: 'pass',
  comment: ''
})

// 处理审核操作
const handleAudit = (row) => {
  currentApply.value = { ...row }
  // 初始化批准数量
  currentApply.value.items.forEach(item => {
    item.approvedQuantity = item.quantity
  })
  auditForm.value = {
    result: 'pass',
    comment: ''
  }
  auditDialogVisible.value = true
}

// 提交审核
const submitAudit = () => {
  // 在实际应用中，这里会调用API
  console.log('审核结果:', auditForm.value)

  // 更新状态
  const statusMap = {
    'pass': '通过',
    'reject': '拒绝',
    'partial': '部分通过'
  }

  const newAuditedRecord = {
    ...currentApply.value,
    auditDate: new Date().toISOString().split('T')[0],
    auditor: '管理员',
    status: statusMap[auditForm.value.result]
  }

  // 添加到已审核列表
  auditedList.value.unshift(newAuditedRecord)

  // 从待审核列表中移除
  pendingAuditList.value = pendingAuditList.value.filter(item => item.id !== currentApply.value.id)

  auditDialogVisible.value = false
  ElMessage.success('审核结果已提交')
}

// 查看详情
const viewDetails = (row) => {
  console.log('查看申请详情:', row)
}

// 分页变化
const handleAuditPageChange = (page) => {
  auditCurrentPage.value = page
}

const goBack = () => {
  console.log('返回操作')
}
</script>

<style scoped>
.outbound-audit {
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

.pagination-container {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}
</style>
