<template>
  <div class="outbound-detail">
    <el-page-header @back="goBack" content="出库明细" />

    <el-card class="mt-20">
      <template #header>
        <div class="card-header">
          <span>出库明细查询</span>
          <div>
            <el-date-picker
                v-model="dateRange"
                type="daterange"
                range-separator="至"
                start-placeholder="出库开始日期"
                end-placeholder="出库结束日期"
                class="mr-10"
            />
            <el-input v-model="searchKeyword" placeholder="搜索单号/物品/接收方" style="width: 250px;" clearable>
              <template #append>
                <el-button icon="el-icon-search" />
              </template>
            </el-input>
          </div>
        </div>
      </template>

      <!-- 出库明细列表 -->
      <el-table :data="filteredOutboundDetails" style="width: 100%">
        <el-table-column prop="outboundNumber" label="出库单号" width="180" />
        <el-table-column prop="applyNumber" label="申请单号" width="180" />
        <el-table-column prop="outboundDate" label="出库日期" width="120" />
        <el-table-column prop="operator" label="操作人" width="120" />
        <el-table-column prop="receiver" label="接收方" width="150" />
        <el-table-column label="出库状态" width="120">
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
    <el-dialog v-model="detailDialogVisible" title="出库单详情" width="800px">
      <div v-if="currentDetail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="出库单号">{{ currentDetail.outboundNumber }}</el-descriptions-item>
          <el-descriptions-item label="申请单号">{{ currentDetail.applyNumber }}</el-descriptions-item>
          <el-descriptions-item label="出库日期">{{ currentDetail.outboundDate }}</el-descriptions-item>
          <el-descriptions-item label="操作人">{{ currentDetail.operator }}</el-descriptions-item>
          <el-descriptions-item label="接收方">{{ currentDetail.receiver }}</el-descriptions-item>
          <el-descriptions-item label="接收部门">{{ currentDetail.receiveDepartment }}</el-descriptions-item>
          <el-descriptions-item label="物流信息">{{ currentDetail.logistics }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="currentDetail.status === '已完成' ? 'success' : 'warning'">
              {{ currentDetail.status }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="备注" :span="2">{{ currentDetail.remark }}</el-descriptions-item>
        </el-descriptions>

        <el-divider>出库物品明细</el-divider>

        <el-table :data="currentDetail.items" style="width: 100%">
          <el-table-column prop="name" label="物品名称" />
          <el-table-column prop="spec" label="规格" width="150" />
          <el-table-column label="申请数量" width="120">
            <template #default="scope">
              {{ scope.row.applyQuantity }} {{ scope.row.unit }}
            </template>
          </el-table-column>
          <el-table-column label="实际出库" width="120">
            <template #default="scope">
              {{ scope.row.actualQuantity }} {{ scope.row.unit }}
            </template>
          </el-table-column>
          <el-table-column label="差异" width="100">
            <template #default="scope">
              <span :style="{ color: scope.row.applyQuantity - scope.row.actualQuantity !== 0 ? 'red' : 'green' }">
                {{ scope.row.applyQuantity - scope.row.actualQuantity }}
              </span>
            </template>
          </el-table-column>
          <el-table-column prop="batchNumber" label="批次号" width="180" />
          <el-table-column prop="location" label="库位" width="150" />
        </el-table>

        <el-divider>审批记录</el-divider>

        <el-timeline>
          <el-timeline-item
              v-for="(record, index) in currentDetail.auditRecords"
              :key="index"
              :timestamp="record.time"
              placement="top"
          >
            <el-card>
              <h4>{{ record.operator }} [{{ record.action }}]</h4>
              <p>{{ record.comment }}</p>
            </el-card>
          </el-timeline-item>
        </el-timeline>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

// 模拟出库明细数据
const outboundDetails = ref([
  {
    id: 1,
    outboundNumber: 'OUTD-20230725001',
    applyNumber: 'OUT-20230725001',
    outboundDate: '2023-07-25',
    operator: '张工',
    receiver: '李工',
    receiveDepartment: 'IT运维部',
    logistics: '顺丰快递 SF123456789',
    status: '已完成',
    remark: '紧急维修使用',
    items: [
      { name: '服务器内存条 DDR4 32G', spec: 'DDR4 2666MHz', applyQuantity: 5, actualQuantity: 5, unit: '条', batchNumber: 'HW-MEM-23072501', location: 'A区-3排-2架' },
      { name: '服务器电源 750W', spec: '冗余电源', applyQuantity: 2, actualQuantity: 2, unit: '个', batchNumber: 'DELL-PWR-23072402', location: 'A区-3排-3架' }
    ],
    auditRecords: [
      { time: '2023-07-25 10:30', operator: '管理员', action: '审核通过', comment: '符合出库条件，同意出库' },
      { time: '2023-07-25 11:15', operator: '张工', action: '拣货完成', comment: '所有物品已拣货完成' },
      { time: '2023-07-25 14:20', operator: '张工', action: '出库完成', comment: '物品已交付给接收方' }
    ]
  },
  {
    id: 2,
    outboundNumber: 'OUTD-20230724002',
    applyNumber: 'OUT-20230724003',
    outboundDate: '2023-07-24',
    operator: '王工',
    receiver: '赵工',
    receiveDepartment: '网络部',
    logistics: '内部交接',
    status: '已完成',
    remark: '核心交换机模块更换',
    items: [
      { name: '万兆交换机模块', spec: 'SFP+', applyQuantity: 4, actualQuantity: 4, unit: '个', batchNumber: 'CISCO-SW-23072301', location: 'B区-1排-4架' }
    ],
    auditRecords: [
      { time: '2023-07-24 09:15', operator: '管理员', action: '审核通过', comment: '同意出库' },
      { time: '2023-07-24 10:30', operator: '王工', action: '拣货完成', comment: '物品已准备就绪' },
      { time: '2023-07-24 11:45', operator: '王工', action: '出库完成', comment: '已交付给网络部赵工' }
    ]
  },
  {
    id: 3,
    outboundNumber: 'OUTD-20230723001',
    applyNumber: 'OUT-20230723002',
    outboundDate: '2023-07-23',
    operator: '李工',
    receiver: '钱工',
    receiveDepartment: '数据中心',
    logistics: '德邦快递 DPK123456',
    status: '运输中',
    remark: '存储服务器扩容项目',
    items: [
      { name: '企业级硬盘 4TB', spec: 'SAS 12Gbps', applyQuantity: 10, actualQuantity: 10, unit: '块', batchNumber: 'SEAGATE-HDD-23072201', location: 'C区-2排-1架' },
      { name: 'SSD固态硬盘 1TB', spec: 'SATA', applyQuantity: 4, actualQuantity: 4, unit: '块', batchNumber: 'SAMSUNG-SSD-23072101', location: 'C区-2排-2架' }
    ],
    auditRecords: [
      { time: '2023-07-23 08:45', operator: '管理员', action: '审核通过', comment: '项目使用，同意出库' },
      { time: '2023-07-23 10:20', operator: '李工', action: '拣货完成', comment: '所有物品已准备' },
      { time: '2023-07-23 14:30', operator: '李工', action: '已发货', comment: '物流单号: DPK123456' }
    ]
  }
])

// 搜索和筛选相关
const searchKeyword = ref('')
const dateRange = ref([])

// 分页相关
const currentPage = ref(1)
const pageSize = 10
const total = computed(() => outboundDetails.value.length)

// 过滤后的出库明细
const filteredOutboundDetails = computed(() => {
  let result = [...outboundDetails.value]

  // 根据关键词搜索
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    result = result.filter(item =>
        item.outboundNumber.toLowerCase().includes(keyword) ||
        item.applyNumber.toLowerCase().includes(keyword) ||
        item.receiver.toLowerCase().includes(keyword) ||
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
.outbound-detail {
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
