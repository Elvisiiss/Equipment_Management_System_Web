<template>
  <div class="check-list-container">
    <el-card>
      <div slot="header" class="header-container">
        <h2>设备审核任务综合管理</h2>
        <el-form inline>
          <el-form-item label="任务类型">
            <el-select v-model="filterForm.taskType" placeholder="全部类型" clearable style="width: 200px">
              <el-option label="验收" value="验收" />
              <el-option label="转移" value="转移" />
              <el-option label="闲置" value="闲置" />
              <el-option label="报废" value="报废" />
            </el-select>
          </el-form-item>
          <el-form-item label="状态">
            <el-select v-model="filterForm.status" placeholder="全部状态" clearable style="width: 200px">
              <el-option label="待审核" value="待审核" />
              <el-option label="审核通过" value="审核通过" />
              <el-option label="审核拒绝" value="审核拒绝" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="fetchAuditTasks">查询</el-button>
            <el-button @click="resetFilter">重置</el-button>
          </el-form-item>
        </el-form>
      </div>

      <el-table
          :data="taskList"
          stripe
          style="width: 100%"
          v-loading="loading"
      >
        <el-table-column type="index" label="序号" width="60" />
        <el-table-column prop="taskType" label="任务类型" width="100" />
        <el-table-column prop="auditType" label="审核类型" width="120">
          <template #default="{ row }">
            {{ row.auditType || '设备审核' }}
          </template>
        </el-table-column>
        <el-table-column prop="deviceCode" label="设备编码" width="120" />
        <el-table-column prop="deviceName" label="设备名称" />
        <el-table-column prop="taskName" label="任务名称" />
        <el-table-column
            prop="status"
            label="状态"
            width="100"
        >
          <template #default="{ row }">
            <el-tag
                :type="row.status === '待审核' ? 'warning' : (row.status === '审核通过' ? 'success' : 'danger')"
            >
              {{ row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
            prop="createTime"
            label="创建时间"
            width="180"
            sortable
        />
        <el-table-column
            prop="initiator"
            label="申请人"
            width="100"
        />
        <el-table-column
            label="操作"
            width="300"
        >
          <template #default="{ row }">
            <el-button
                size="small"
                type="text"
                @click="handleViewDetail(row)"
            >
              查看详情
            </el-button>
            <el-button
                v-if="row.status === '待审核'"
                size="small"
                type="primary"
                @click.stop="handleAudit(row, true)"
            >
              通过
            </el-button>
            <el-button
                v-if="row.status === '待审核'"
                size="small"
                type="danger"
                @click.stop="handleAudit(row, false)"
            >
              拒绝
            </el-button>
            <el-button
                v-if="row.status === '审核拒绝'"
                size="small"
                type="warning"
                @click.stop="handleResubmit(row)"
            >
              重新提交
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-container">
        <el-pagination
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            :current-page="pagination.page"
            :page-sizes="[5, 10, 20, 50]"
            :page-size="pagination.pageSize"
            layout="total, sizes, prev, pager, next, jumper"
            :total="pagination.total"
        >
        </el-pagination>
      </div>
    </el-card>

    <!-- 任务详情弹窗 -->
    <el-dialog
        v-model="detailVisible"
        title="任务详情"
        width="600px"
    >
      <el-descriptions column="1" border>
        <el-descriptions-item label="任务ID">{{ currentTask.id }}</el-descriptions-item>
        <el-descriptions-item label="任务类型">{{ currentTask.taskType }}</el-descriptions-item>
        <el-descriptions-item label="审核类型">{{ currentTask.auditType || '设备审核' }}</el-descriptions-item>
        <el-descriptions-item label="任务名称">{{ currentTask.taskName }}</el-descriptions-item>
        <el-descriptions-item label="设备编码">{{ currentTask.deviceCode }}</el-descriptions-item>
        <el-descriptions-item label="设备名称">{{ currentTask.deviceName }}</el-descriptions-item>
        <el-descriptions-item label="申请人">{{ currentTask.initiator }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ formatDate(currentTask.createTime) }}</el-descriptions-item>

        <!-- 根据任务类型显示不同内容 -->
        <template v-if="currentTask.taskType === '验收'">
          <el-descriptions-item label="验收结果">{{ currentTask.result }}</el-descriptions-item>
          <el-descriptions-item label="验收意见">{{ currentTask.opinion }}</el-descriptions-item>
          <el-descriptions-item label="验收日期">{{ currentTask.date }}</el-descriptions-item>
        </template>

        <template v-if="currentTask.taskType === '转移'">
          <el-descriptions-item label="目标区域">{{ currentTask.targetArea }}</el-descriptions-item>
          <el-descriptions-item label="转移原因">{{ currentTask.reason }}</el-descriptions-item>
        </template>

        <template v-if="currentTask.taskType === '闲置' || currentTask.taskType === '报废'">
          <el-descriptions-item label="申请说明">{{ currentTask.description }}</el-descriptions-item>
        </template>

        <!-- 审核信息 -->
        <el-descriptions-item label="审核状态">{{ currentTask.status }}</el-descriptions-item>
        <template v-if="currentTask.status !== '待审核'">
          <el-descriptions-item label="审核人">{{ currentTask.approver }}</el-descriptions-item>
          <el-descriptions-item label="审核时间">{{ formatDate(currentTask.approveTime) }}</el-descriptions-item>
          <el-descriptions-item label="审核意见">{{ currentTask.remark || '无' }}</el-descriptions-item>
        </template>
      </el-descriptions>

      <!-- 附件列表 -->
      <template v-if="currentTask.attachments && currentTask.attachments.length">
        <div style="margin-top: 16px;">
          <h4>附件列表：</h4>
          <el-list>
            <el-list-item
                v-for="(file, index) in currentTask.attachments"
                :key="index"
            >
              <el-link :href="file.url" target="_blank">{{ file.name }}</el-link>
            </el-list-item>
          </el-list>
        </div>
      </template>
    </el-dialog>

    <!-- 审核弹窗 -->
    <el-dialog
        v-model="auditVisible"
        :title="`${auditResult ? '通过' : '拒绝'}审核`"
        width="500px"
    >
      <el-form>
        <el-form-item label="审核意见" required>
          <el-input
              type="textarea"
              v-model="auditRemark"
              rows="4"
              placeholder="请输入审核意见"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="auditVisible = false">取消</el-button>
        <el-button
            :type="auditResult ? 'success' : 'danger'"
            @click="confirmAudit"
        >
          确认{{ auditResult ? '通过' : '拒绝' }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { auditAPI } from '@/api/ckAPI'

// 筛选条件
const filterForm = reactive({
  taskType: '',
  status: ''
})

// 任务列表数据
const taskList = ref([])
const loading = ref(false)

// 分页信息
const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

// 详情弹窗
const detailVisible = ref(false)
const currentTask = ref({})

// 审核相关
const auditVisible = ref(false)
const auditResult = ref(true) // true:通过, false:拒绝
const auditRemark = ref('')
const currentAuditTaskId = ref('')

// 获取审核任务列表
async function fetchAuditTasks() {
  try {
    loading.value = true
    const status = filterForm.status || ''
    const res = await auditAPI.getAuditTasks(
        pagination.page,
        pagination.pageSize,
        status
    )

    if (res.success) {
      const { list, total, page, pageSize } = res.data
      taskList.value = list.filter(task => {
        // 过滤任务类型
        if (filterForm.taskType && task.taskType !== filterForm.taskType) {
          return false
        }
        return true
      })
      pagination.total = total
      pagination.page = page
      pagination.pageSize = pageSize
    }
  } catch (error) {
    ElMessage.error('获取审核任务失败')
    console.error(error)
  } finally {
    loading.value = false
  }
}

// 重置筛选条件
function resetFilter() {
  filterForm.taskType = ''
  filterForm.status = ''
  pagination.page = 1
  fetchAuditTasks()
}

// 分页处理
function handleSizeChange(size) {
  pagination.pageSize = size
  pagination.page = 1
  fetchAuditTasks()
}

function handleCurrentChange(page) {
  pagination.page = page
  fetchAuditTasks()
}

// 查看详情
function handleViewDetail(task) {
  currentTask.value = { ...task }
  detailVisible.value = true
}

// 行点击事件
function handleRowClick(row) {
  currentTask.value = { ...row }
  detailVisible.value = true
}

// 处理审核
function handleAudit(task, result) {
  currentAuditTaskId.value = task.id
  auditResult.value = result
  auditRemark.value = ''
  auditVisible.value = true
}

// 处理重新提交
async function handleResubmit(task) {
  try {
    const res = await auditAPI.resubmitTask(task.id)
    if (res.success) {
      ElMessage.success('任务已重新提交')
      fetchAuditTasks()
    }
  } catch (error) {
    ElMessage.error('重新提交失败')
    console.error(error)
  }
}

// 确认审核
async function confirmAudit() {
  if (!auditRemark.value) {
    ElMessage.warning('请输入审核意见')
    return
  }

  try {
    const res = await auditAPI.auditTask(
        currentAuditTaskId.value,
        auditResult.value,
        'admin', // 当前登录用户作为审核人
        auditRemark.value
    )

    if (res.success) {
      ElMessage.success(`审核${auditResult.value ? '通过' : '拒绝'}成功`)
      auditVisible.value = false
      detailVisible.value = false
      fetchAuditTasks() // 刷新列表
    }
  } catch (error) {
    ElMessage.error('审核操作失败')
    console.error(error)
  }
}

// 格式化日期
function formatDate(dateString) {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleString()
}

// 页面挂载时加载数据
onMounted(() => {
  fetchAuditTasks()
})
</script>

<style scoped>
.check-list-container {
  padding: 16px;
  background-color: #f5f5f5;
}

.header-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.pagination-container {
  margin-top: 16px;
  text-align: right;
}

.el-button + .el-button {
  margin-left: 8px;
}
</style>
