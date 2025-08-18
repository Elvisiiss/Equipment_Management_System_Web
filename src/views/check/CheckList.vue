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
                @click.stop="openAuditDialog(row)"
            >
              审核
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
          <el-descriptions-item label="审核人">{{ currentTask.approver || '管理员' }}</el-descriptions-item>
          <el-descriptions-item label="审核时间">{{ formatDate(currentTask.approveTime) }}</el-descriptions-item>
          <el-descriptions-item label="审核意见">{{ currentTask.remark || '无' }}</el-descriptions-item>
        </template>
      </el-descriptions>

      <!-- 附件列表 -->
      <template v-if="currentTask.attachments && currentTask.attachments.length">
        <div style="margin-top: 16px;">
          <h4>附件列表：</h4>
          <div class="attachment-container">
            <div v-for="(file, index) in currentTask.attachments" :key="index" class="attachment-item">
              <div v-if="isImage(file.name)" class="image-preview">
                <el-image
                    :src="file.url"
                    :preview-src-list="[file.url]"
                    fit="cover"
                    :initial-index="0"
                    hide-on-click-modal
                />
                <span class="file-name">{{ file.name }}</span>
              </div>
              <div v-else class="file-item">
                <el-icon class="file-icon"><Document /></el-icon>
                <el-link :href="file.url" target="_blank">{{ file.name }}</el-link>
              </div>
            </div>
          </div>
        </div>
      </template>
    </el-dialog>

    <!-- 审核弹窗 -->
    <el-dialog
        v-model="auditDialogVisible"
        title="审核任务"
        width="600px"
    >
      <div class="audit-dialog-content">
        <!-- 第一行：发起人提交意见 -->
        <div class="submit-info">
          <h4>发起人提交意见：</h4>
          <div class="submit-content">
            <template v-if="currentAuditTask.taskType === '验收'">
              <p><strong>验收意见：</strong>{{ currentAuditTask.opinion || '无' }}</p>
            </template>
            <template v-else-if="currentAuditTask.taskType === '转移'">
              <p><strong>转移原因：</strong>{{ currentAuditTask.reason || '无' }}</p>
            </template>
            <template v-else>
              <p><strong>申请说明：</strong>{{ currentAuditTask.description || '无' }}</p>
            </template>
          </div>
        </div>

        <!-- 第二行：附件预览 -->
        <div class="attachment-preview" v-if="currentAuditTask.attachments && currentAuditTask.attachments.length">
          <h4>附件：</h4>
          <div class="attachment-list">
            <div v-for="(file, index) in currentAuditTask.attachments" :key="index" class="attachment-item">
              <div v-if="isImage(file.name)" class="image-preview">
                <el-image
                    :src="file.url"
                    :preview-src-list="[file.url]"
                    fit="cover"
                    :initial-index="0"
                    hide-on-click-modal
                />
                <span class="file-name">{{ file.name }}</span>
              </div>
              <div v-else class="file-item">
                <el-icon class="file-icon"><Document /></el-icon>
                <el-link :href="file.url" target="_blank">{{ file.name }}</el-link>
              </div>
            </div>
          </div>
        </div>

        <!-- 第三行：审核意见 -->
        <div class="audit-opinion">
          <h4>审核意见：</h4>
          <el-input
              type="textarea"
              v-model="auditRemark"
              rows="4"
              placeholder="请输入审核意见"
          />
        </div>

        <!-- 第四行：操作按钮 -->
        <div class="audit-actions">
          <el-button type="success" @click="confirmAudit(true)">通过</el-button>
          <el-button type="danger" @click="confirmAudit(false)">驳回</el-button>
          <el-button @click="auditDialogVisible = false">取消</el-button>
        </div>
      </div>
    </el-dialog>

    <!-- 重新提交弹窗 - 验收 -->
    <el-dialog
        v-model="resubmitDialogVisible.acceptance"
        title="重新提交 - 设备验收"
        width="700px"
    >
      <el-form ref="acceptanceForm" :model="resubmitForm" label-width="120px">
        <el-form-item label="设备编码">
          <el-input v-model="resubmitForm.deviceCode" disabled />
        </el-form-item>
        <el-form-item label="设备名称">
          <el-input v-model="resubmitForm.deviceName" disabled />
        </el-form-item>
        <el-form-item label="验收日期" required>
          <el-date-picker
              v-model="resubmitForm.date"
              type="date"
              placeholder="选择日期"
              style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="验收结果" required>
          <el-select v-model="resubmitForm.result" placeholder="请选择验收结果">
            <el-option label="合格" value="合格" />
            <el-option label="不合格" value="不合格" />
            <el-option label="部分合格" value="部分合格" />
          </el-select>
        </el-form-item>
        <el-form-item label="验收意见" required>
          <el-input
              type="textarea"
              v-model="resubmitForm.opinion"
              placeholder="请输入验收意见"
              :autosize="{ minRows: 3, maxRows: 6 }"
          />
        </el-form-item>
        <el-form-item label="上传附件">
          <el-upload
              action="#"
              multiple
              :on-change="handleFileChange"
              :auto-upload="false"
              :file-list="fileList"
          >
            <el-button type="primary">选择文件</el-button>
            <template #tip>
              <div class="el-upload__tip">支持图片、文档等格式文件</div>
            </template>
          </el-upload>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="submitResubmit('acceptance')">提交</el-button>
          <el-button @click="resubmitDialogVisible.acceptance = false">取消</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>

    <!-- 重新提交弹窗 - 转移 -->
    <el-dialog
        v-model="resubmitDialogVisible.transfer"
        title="重新提交 - 设备转移"
        width="700px"
    >
      <el-form ref="transferForm" :model="resubmitForm" label-width="120px">
        <el-form-item label="设备编码">
          <el-input v-model="resubmitForm.deviceCode" disabled />
        </el-form-item>
        <el-form-item label="设备名称">
          <el-input v-model="resubmitForm.deviceName" disabled />
        </el-form-item>
        <el-form-item label="目标区域" required>
          <el-input v-model="resubmitForm.targetArea" placeholder="请输入目标区域" />
        </el-form-item>
        <el-form-item label="转移原因" required>
          <el-input
              type="textarea"
              v-model="resubmitForm.reason"
              placeholder="请输入转移原因"
              :autosize="{ minRows: 3, maxRows: 6 }"
          />
        </el-form-item>
        <el-form-item label="预计转移日期" required>
          <el-date-picker
              v-model="resubmitForm.transferDate"
              type="date"
              placeholder="选择日期"
              style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="上传附件">
          <el-upload
              action="#"
              multiple
              :on-change="handleFileChange"
              :auto-upload="false"
              :file-list="fileList"
          >
            <el-button type="primary">选择文件</el-button>
            <template #tip>
              <div class="el-upload__tip">支持图片、文档等格式文件</div>
            </template>
          </el-upload>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="submitResubmit('transfer')">提交</el-button>
          <el-button @click="resubmitDialogVisible.transfer = false">取消</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>

    <!-- 重新提交弹窗 - 闲置 -->
    <el-dialog
        v-model="resubmitDialogVisible.idle"
        title="重新提交 - 设备闲置"
        width="700px"
    >
      <el-form ref="idleForm" :model="resubmitForm" label-width="120px">
        <el-form-item label="设备编码">
          <el-input v-model="resubmitForm.deviceCode" disabled />
        </el-form-item>
        <el-form-item label="设备名称">
          <el-input v-model="resubmitForm.deviceName" disabled />
        </el-form-item>
        <el-form-item label="闲置原因" required>
          <el-input
              type="textarea"
              v-model="resubmitForm.description"
              placeholder="请输入闲置原因"
              :autosize="{ minRows: 3, maxRows: 6 }"
          />
        </el-form-item>
        <el-form-item label="预计闲置时长" required>
          <el-input-number v-model="resubmitForm.duration" :min="1" :max="36" />
          <span style="margin-left: 10px">个月</span>
        </el-form-item>
        <el-form-item label="设备状态">
          <el-radio-group v-model="resubmitForm.status">
            <el-radio label="良好">良好</el-radio>
            <el-radio label="一般">一般</el-radio>
            <el-radio label="较差">较差</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="上传附件">
          <el-upload
              action="#"
              multiple
              :on-change="handleFileChange"
              :auto-upload="false"
              :file-list="fileList"
          >
            <el-button type="primary">选择文件</el-button>
            <template #tip>
              <div class="el-upload__tip">支持图片、文档等格式文件</div>
            </template>
          </el-upload>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="submitResubmit('idle')">提交</el-button>
          <el-button @click="resubmitDialogVisible.idle = false">取消</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>

    <!-- 重新提交弹窗 - 报废 -->
    <el-dialog
        v-model="resubmitDialogVisible.scrap"
        title="重新提交 - 设备报废"
        width="700px"
    >
      <el-form ref="scrapForm" :model="resubmitForm" label-width="120px">
        <el-form-item label="设备编码">
          <el-input v-model="resubmitForm.deviceCode" disabled />
        </el-form-item>
        <el-form-item label="设备名称">
          <el-input v-model="resubmitForm.deviceName" disabled />
        </el-form-item>
        <el-form-item label="报废原因" required>
          <el-input
              type="textarea"
              v-model="resubmitForm.description"
              placeholder="请输入报废原因"
              :autosize="{ minRows: 3, maxRows: 6 }"
          />
        </el-form-item>
        <el-form-item label="设备使用年限" required>
          <el-input-number v-model="resubmitForm.years" :min="1" :max="30" />
          <span style="margin-left: 10px">年</span>
        </el-form-item>
        <el-form-item label="设备状态">
          <el-radio-group v-model="resubmitForm.status">
            <el-radio label="无法修复">无法修复</el-radio>
            <el-radio label="维修成本高">维修成本高</el-radio>
            <el-radio label="技术淘汰">技术淘汰</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="上传附件">
          <el-upload
              action="#"
              multiple
              :on-change="handleFileChange"
              :auto-upload="false"
              :file-list="fileList"
          >
            <el-button type="primary">选择文件</el-button>
            <template #tip>
              <div class="el-upload__tip">支持图片、文档等格式文件</div>
            </template>
          </el-upload>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="submitResubmit('scrap')">提交</el-button>
          <el-button @click="resubmitDialogVisible.scrap = false">取消</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Document } from '@element-plus/icons-vue'

// 筛选条件
const filterForm = reactive({
  taskType: '',
  status: ''
})

// 任务列表数据
const taskList = ref([
  {
    id: 'T20230818001',
    taskType: '验收',
    auditType: '设备验收',
    deviceCode: 'DEV2023001',
    deviceName: '高精度数控机床',
    taskName: '新设备验收申请',
    status: '待审核',
    createTime: '2023-08-18 10:30:25',
    initiator: '张工',
    opinion: '设备安装调试完成，各项参数符合要求，申请验收',
    attachments: [
      { name: '验收报告.pdf', url: '#' },
      { name: '设备照片.jpg', url: 'https://via.placeholder.com/150' }
    ]
  },
  {
    id: 'T20230818002',
    taskType: '转移',
    auditType: '设备转移',
    deviceCode: 'DEV2022012',
    deviceName: '激光切割机',
    taskName: '设备转移申请',
    status: '待审核',
    createTime: '2023-08-18 09:15:42',
    initiator: '李工',
    reason: '因生产车间调整，需将设备转移至B区',
    attachments: [
      { name: '转移方案.docx', url: '#' }
    ]
  },
  {
    id: 'T20230817005',
    taskType: '闲置',
    auditType: '设备管理',
    deviceCode: 'DEV2019056',
    deviceName: '注塑机',
    taskName: '闲置设备申请',
    status: '审核拒绝',
    createTime: '2023-08-17 14:20:33',
    initiator: '王工',
    description: '设备已超过3个月未使用，申请闲置处理',
    approver: '管理员',
    approveTime: '2023-08-18 11:05:17',
    remark: '请提供设备状态评估报告后再申请'
  },
  {
    id: 'T20230816003',
    taskType: '报废',
    auditType: '设备报废',
    deviceCode: 'DEV2018007',
    deviceName: '老化测试仪',
    taskName: '设备报废申请',
    status: '审核通过',
    createTime: '2023-08-16 16:45:12',
    initiator: '赵工',
    description: '设备已使用超过10年，维修成本过高，申请报废',
    approver: '管理员',
    approveTime: '2023-08-17 09:30:45',
    remark: '同意报废申请，请按流程处理',
    attachments: [
      { name: '设备评估报告.pdf', url: '#' },
      { name: '维修记录.xlsx', url: '#' }
    ]
  }
])

const loading = ref(false)

// 分页信息
const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 4
})

// 详情弹窗
const detailVisible = ref(false)
const currentTask = ref({})

// 审核相关
const auditDialogVisible = ref(false)
const currentAuditTask = ref({})
const auditRemark = ref('')

// 重新提交相关
const resubmitDialogVisible = reactive({
  acceptance: false,
  transfer: false,
  idle: false,
  scrap: false
})
const resubmitForm = reactive({
  taskType: '',
  deviceCode: '',
  deviceName: '',
  date: '',
  result: '',
  opinion: '',
  targetArea: '',
  reason: '',
  transferDate: '',
  description: '',
  duration: 3,
  years: 5,
  status: '',
  attachments: []
})
const fileList = ref([])

// 获取审核任务列表
async function fetchAuditTasks() {
  try {
    loading.value = true
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 800))
    loading.value = false
  } catch (error) {
    ElMessage.error('获取审核任务失败')
    console.error(error)
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

// 打开审核弹窗
function openAuditDialog(task) {
  currentAuditTask.value = { ...task }
  auditRemark.value = ''
  auditDialogVisible.value = true
}

// 处理重新提交
function handleResubmit(task) {
  // 重置表单
  Object.assign(resubmitForm, {
    taskType: task.taskType,
    deviceCode: task.deviceCode,
    deviceName: task.deviceName,
    date: task.date || '',
    result: task.result || '',
    opinion: task.opinion || '',
    targetArea: task.targetArea || '',
    reason: task.reason || '',
    transferDate: task.transferDate || '',
    description: task.description || '',
    duration: task.duration || 3,
    years: task.years || 5,
    status: task.status || '',
    attachments: task.attachments || []
  })

  // 根据任务类型打开对应的弹窗
  if (task.taskType === '验收') {
    resubmitDialogVisible.acceptance = true
  } else if (task.taskType === '转移') {
    resubmitDialogVisible.transfer = true
  } else if (task.taskType === '闲置') {
    resubmitDialogVisible.idle = true
  } else if (task.taskType === '报废') {
    resubmitDialogVisible.scrap = true
  }

  fileList.value = []
}

// 处理文件选择
function handleFileChange(file) {
  fileList.value.push(file)
}

// 提交重新提交的表单
function submitResubmit(type) {
  ElMessage.success('重新提交成功！')

  // 关闭对应的弹窗
  resubmitDialogVisible[type] = false

  // 更新任务状态为待审核
  const index = taskList.value.findIndex(t =>
      t.deviceCode === resubmitForm.deviceCode &&
      t.taskType === resubmitForm.taskType
  )

  if (index !== -1) {
    taskList.value[index].status = '待审核'
    taskList.value[index].approver = ''
    taskList.value[index].approveTime = ''
    taskList.value[index].remark = ''

    // 更新任务信息
    if (type === 'acceptance') {
      taskList.value[index].date = resubmitForm.date
      taskList.value[index].result = resubmitForm.result
      taskList.value[index].opinion = resubmitForm.opinion
    } else if (type === 'transfer') {
      taskList.value[index].targetArea = resubmitForm.targetArea
      taskList.value[index].reason = resubmitForm.reason
      taskList.value[index].transferDate = resubmitForm.transferDate
    } else {
      taskList.value[index].description = resubmitForm.description
      taskList.value[index].duration = resubmitForm.duration
      taskList.value[index].years = resubmitForm.years
      taskList.value[index].status = resubmitForm.status
    }

    // 更新附件
    if (fileList.value.length > 0) {
      taskList.value[index].attachments = fileList.value.map(file => ({
        name: file.name,
        url: URL.createObjectURL(file.raw)
      }))
    }
  }
}

// 确认审核
async function confirmAudit(result) {
  if (!auditRemark.value) {
    ElMessage.warning('请输入审核意见')
    return
  }

  try {
    loading.value = true
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 800))

    // 更新任务状态
    const index = taskList.value.findIndex(t => t.id === currentAuditTask.value.id)
    if (index !== -1) {
      const newStatus = result ? '审核通过' : '审核拒绝'
      taskList.value[index].status = newStatus
      taskList.value[index].approver = '管理员'
      taskList.value[index].approveTime = new Date().toISOString()
      taskList.value[index].remark = auditRemark.value

      ElMessage.success(`审核${result ? '通过' : '驳回'}成功`)
      auditDialogVisible.value = false
    }
  } catch (error) {
    ElMessage.error('审核操作失败')
    console.error(error)
  } finally {
    loading.value = false
  }
}

// 格式化日期
function formatDate(dateString) {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleString()
}

// 判断文件是否为图片
function isImage(fileName) {
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp']
  const ext = fileName.substring(fileName.lastIndexOf('.')).toLowerCase()
  return imageExtensions.includes(ext)
}

// 页面挂载时加载数据
onMounted(() => {
  fetchAuditTasks()
})
</script>

<style scoped>
.check-list-container {
  padding: 16px;
  background-color: #f5f7fa;
  min-height: 100vh;
}

.header-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
}

.pagination-container {
  margin-top: 16px;
  text-align: right;
}

.el-button + .el-button {
  margin-left: 8px;
}

.audit-dialog-content {
  padding: 0 15px;
}

.submit-info, .attachment-preview, .audit-opinion {
  margin-bottom: 20px;
}

.submit-content {
  background-color: #f9f9f9;
  padding: 15px;
  border-radius: 4px;
  border: 1px solid #ebeef5;
  margin-top: 10px;
}

.audit-actions {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 25px;
}

.attachment-container, .attachment-list {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  margin-top: 10px;
}

.attachment-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.image-preview {
  width: 120px;
  text-align: center;
}

.image-preview .el-image {
  width: 100px;
  height: 100px;
  border-radius: 4px;
  border: 1px solid #ebeef5;
  cursor: pointer;
  transition: transform 0.3s;
}

.image-preview .el-image:hover {
  transform: scale(1.05);
}

.file-item {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  background-color: #f5f7fa;
  border-radius: 4px;
  border: 1px solid #dcdfe6;
}

.file-icon {
  margin-right: 8px;
  color: #409eff;
}

.file-name {
  display: block;
  margin-top: 5px;
  font-size: 12px;
  color: #666;
  max-width: 100px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

h4 {
  margin: 0 0 10px 0;
  font-weight: 600;
  color: #333;
}

.resubmit-form-container {
  padding: 20px;
}

.form-section {
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid #eee;
}

.form-title {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 15px;
  color: #409eff;
}

.form-footer {
  display: flex;
  justify-content: center;
  margin-top: 30px;
  gap: 15px;
}
</style>
