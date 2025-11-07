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
        <el-table-column prop="taskType" label="任务类型" width="100">
          <template #default="{ row }">
            {{ getTaskTypeText(row.taskType) }}
          </template>
        </el-table-column>
        <el-table-column prop="menuType" label="菜单类型" width="120">
          <template #default="{ row }">
            {{ row.menuType || '设备管理' }}
          </template>
        </el-table-column>
        <el-table-column prop="deviceCode" label="设备编码" width="120" />
        <el-table-column prop="deviceName" label="设备名称" />
        <el-table-column prop="taskName" label="任务名称" />
        <el-table-column
            prop="approvalStatus"
            label="状态"
            width="100"
        >
          <template #default="{ row }">
            <el-tag
                :type="row.approvalStatus === 0 ? 'warning' : (row.approvalStatus === 1 ? 'success' : 'danger')"
            >
              {{ getStatusText(row.approvalStatus) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
            prop="createtime"
            label="创建时间"
            width="180"
            sortable
        />
        <el-table-column
            prop="applicantName"
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
                v-if="row.approvalStatus === 0"
                size="small"
                type="primary"
                @click.stop="openAuditDialog(row)"
            >
              审核
            </el-button>
            <el-button
                v-if="row.approvalStatus === 2"
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
        width="700px"
    >
      <el-descriptions column="1" border>
        <el-descriptions-item label="任务ID">{{ currentTask.id }}</el-descriptions-item>
        <el-descriptions-item label="任务类型">{{ getTaskTypeText(currentTask.taskType) }}</el-descriptions-item>
        <el-descriptions-item label="菜单类型">{{ currentTask.menuType || '设备管理' }}</el-descriptions-item>
        <el-descriptions-item label="任务名称">{{ currentTask.taskName }}</el-descriptions-item>
        <el-descriptions-item label="设备编码">{{ currentTask.deviceCode }}</el-descriptions-item>
        <el-descriptions-item label="设备名称">{{ currentTask.deviceName }}</el-descriptions-item>
        <el-descriptions-item label="申请人">{{ currentTask.applicantName }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ formatDate(currentTask.createtime) }}</el-descriptions-item>
        <el-descriptions-item label="申请原因">{{ currentTask.applyReason }}</el-descriptions-item>

        <!-- 设备转移任务显示目标区域 -->
        <el-descriptions-item v-if="currentTask.taskType === 2" label="目标区域">
          {{ currentTask.targetArea }}
        </el-descriptions-item>

        <!-- 审批信息 -->
        <el-descriptions-item label="审批流程">{{ currentTask.processName }}</el-descriptions-item>
        <el-descriptions-item label="审批规则">{{ currentTask.approvalRuleDesc }}</el-descriptions-item>
        <el-descriptions-item label="审核状态">{{ getStatusText(currentTask.approvalStatus) }}</el-descriptions-item>

        <template v-if="currentTask.approvalStatus !== 0">
          <el-descriptions-item label="审核人">{{ currentTask.approverName }}</el-descriptions-item>
          <el-descriptions-item label="审核时间">{{ formatDate(currentTask.approvalTime) }}</el-descriptions-item>
          <el-descriptions-item label="审核意见">{{ currentTask.approvalComment || '无' }}</el-descriptions-item>
        </template>

        <!-- 审核人列表 -->
        <el-descriptions-item label="审核人列表">
          <div v-if="currentTask.approvers && currentTask.approvers.length">
            <el-tag
                v-for="approver in currentTask.approvers"
                :key="approver.id"
                size="small"
                style="margin-right: 8px; margin-bottom: 4px;"
            >
              {{ approver.realName }}
            </el-tag>
          </div>
          <span v-else>无</span>
        </el-descriptions-item>
      </el-descriptions>

      <!-- 附件列表 -->
      <template v-if="currentTask.attachments && currentTask.attachments.length">
        <div style="margin-top: 16px;">
          <h4>附件列表：</h4>
          <div class="attachment-container">
            <div v-for="(file, index) in currentTask.attachments" :key="index" class="attachment-item">
              <div v-if="isImage(file.fileName)" class="image-preview">
                <el-image
                    :src="getFileUrl(file.fileId)"
                    :preview-src-list="[getFileUrl(file.fileId)]"
                    fit="cover"
                    :initial-index="0"
                    hide-on-click-modal
                />
                <span class="file-name">{{ file.fileName }}</span>
              </div>
              <div v-else class="file-item">
                <el-icon class="file-icon"><Document /></el-icon>
                <el-link @click="downloadAttachment(file)">{{ file.fileName }}</el-link>
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
            <p><strong>申请原因：</strong>{{ currentAuditTask.applyReason || '无' }}</p>
            <template v-if="currentAuditTask.taskType === 2">
              <p><strong>目标区域：</strong>{{ currentAuditTask.targetArea || '无' }}</p>
            </template>
          </div>
        </div>

        <!-- 第二行：附件预览 -->
        <div class="attachment-preview" v-if="currentAuditTask.attachments && currentAuditTask.attachments.length">
          <h4>附件：</h4>
          <div class="attachment-list">
            <div v-for="(file, index) in currentAuditTask.attachments" :key="index" class="attachment-item">
              <div v-if="isImage(file.fileName)" class="image-preview">
                <el-image
                    :src="getFileUrl(file.fileId)"
                    :preview-src-list="[getFileUrl(file.fileId)]"
                    fit="cover"
                    :initial-index="0"
                    hide-on-click-modal
                />
                <span class="file-name">{{ file.fileName }}</span>
              </div>
              <div v-else class="file-item">
                <el-icon class="file-icon"><Document /></el-icon>
                <el-link @click="downloadAttachment(file)">{{ file.fileName }}</el-link>
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
import {ref, reactive, onMounted} from 'vue'
import {ElMessage} from 'element-plus'
import {Document} from '@element-plus/icons-vue'
import {
  getApprovalTasksPage,
  getApprovalTaskDetail,
  approveTask,
  getTaskAttachments,
  downloadTaskAttachment,
  createApprovalTaskWithAttachments,
  getCurrentUser,
  TASK_TYPE_MAP,
  STATUS_MAP,
  REVERSE_STATUS_MAP,
  REVERSE_TASK_TYPE_MAP
} from '@/api/asset/CheckList.js'

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

// 获取任务类型文本
const getTaskTypeText = (taskType) => {
  return REVERSE_TASK_TYPE_MAP[taskType] || '未知类型'
}

// 获取状态文本
const getStatusText = (status) => {
  return REVERSE_STATUS_MAP[status] || '未知状态'
}

// 获取审核任务列表
async function fetchAuditTasks() {
  try {
    loading.value = true

    const queryParams = {
      pageNum: pagination.page,
      pageSize: pagination.pageSize,
      keyword: filterForm.keyword || '',
      applicantId: filterForm.applicantId || '',
      status: filterForm.status ? STATUS_MAP[filterForm.status] : '',
      taskType: filterForm.taskType ? TASK_TYPE_MAP[filterForm.taskType] : ''
    }

    const response = await getApprovalTasksPage(queryParams)

    console.log(response.data)
    if (response.data.code === 'success') {
      taskList.value = response.data.data.records || []
      pagination.total = response.data.data.total || 0

      // 为每个任务加载附件信息
      for (let task of taskList.value) {
        await loadTaskAttachments(task)
      }
    } else {
      ElMessage.error(response.message || '获取审核任务失败')
    }
  } catch (error) {
    ElMessage.error('获取审核任务失败')
    console.error(error)
  } finally {
    loading.value = false
  }
}

// 加载任务附件
async function loadTaskAttachments(task) {
  try {
    const response = await getTaskAttachments(task.id)
    if (response.data.code === 'success') {
      task.attachments = response.data.data || []
    }
  } catch (error) {
    console.error('加载附件失败:', error)
    task.attachments = []
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
async function handleViewDetail(task) {
  try {
    loading.value = true
    const response = await getApprovalTaskDetail(task.id)
    if (response.data.code === 'success') {
      currentTask.value = response.data.data
      // 加载附件
      const attachmentResponse = await getTaskAttachments(task.id)
      if (attachmentResponse.data.code === 'success') {
        currentTask.value.attachments = attachmentResponse.data.data || []
      }
      detailVisible.value = true
    } else {
      ElMessage.error(response.data.message || '获取任务详情失败')
    }
  } catch (error) {
    ElMessage.error('获取任务详情失败')
    console.error(error)
  } finally {
    loading.value = false
  }
}

// 打开审核弹窗
async function openAuditDialog(task) {
  try {
    const response = await getApprovalTaskDetail(task.id)
    if (response.data.code === 'success') {
      currentAuditTask.value = response.data.data
      // 加载附件
      const attachmentResponse = await getTaskAttachments(task.id)
      if (attachmentResponse.data.code === 'success') {
        currentAuditTask.value.attachments = attachmentResponse.data.data || []
      }
      auditRemark.value = ''
      auditDialogVisible.value = true
    } else {
      ElMessage.error(response.message || '获取任务详情失败')
    }
  } catch (error) {
    ElMessage.error('获取任务详情失败')
    console.error(error)
  }
}

// 处理重新提交
function handleResubmit(task) {
  // 重置表单
  Object.assign(resubmitForm, {
    taskType: getTaskTypeText(task.taskType),
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
  const taskTypeText = getTaskTypeText(task.taskType)
  if (taskTypeText === '验收') {
    resubmitDialogVisible.acceptance = true
  } else if (taskTypeText === '转移') {
    resubmitDialogVisible.transfer = true
  } else if (taskTypeText === '闲置') {
    resubmitDialogVisible.idle = true
  } else if (taskTypeText === '报废') {
    resubmitDialogVisible.scrap = true
  }

  fileList.value = []
}

// 处理文件选择
function handleFileChange(file) {
  fileList.value.push(file)
}

// 提交重新提交的表单
async function submitResubmit(type) {
  try {
    const formData = new FormData()
    // const currentUser = await getCurrentUser()

    let taskData = {
      menuType: "设备管理",
      deviceCode: resubmitForm.deviceCode,
      deviceName: resubmitForm.deviceName,
      applicantId: 2
    }

    // 根据类型设置不同的任务数据
    if (type === 'acceptance') {
      taskData.taskType = 4 // 设备采购对应验收
      taskData.taskName = `设备验收申请 - ${resubmitForm.deviceCode}`
      taskData.applyReason = resubmitForm.opinion
    } else if (type === 'transfer') {
      taskData.taskType = 2 // 设备转移
      taskData.taskName = `设备转移申请 - ${resubmitForm.deviceCode}`
      taskData.applyReason = resubmitForm.reason
      taskData.targetArea = resubmitForm.targetArea
    } else if (type === 'idle') {
      taskData.taskType = 0 // 设备闲置
      taskData.taskName = `设备闲置申请 - ${resubmitForm.deviceCode}`
      taskData.applyReason = resubmitForm.description
    } else if (type === 'scrap') {
      taskData.taskType = 1 // 设备报废
      taskData.taskName = `设备报废申请 - ${resubmitForm.deviceCode}`
      taskData.applyReason = resubmitForm.description
    }

    formData.append('task', JSON.stringify(taskData))

    // 添加附件
    if (fileList.value.length > 0) {
      fileList.value.forEach(file => {
        formData.append('attachments', file.raw)
      })
    }

    const response = await createApprovalTaskWithAttachments(formData)

    if (response.data.code === 'success') {
      ElMessage.success('重新提交成功！')
      resubmitDialogVisible[type] = false
      fetchAuditTasks() // 刷新列表
    } else {
      ElMessage.error(response.data.message || '重新提交失败')
    }
  } catch (error) {
    ElMessage.error('重新提交失败')
    console.error(error)
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

    const params = {
      id: currentAuditTask.value.id,
      status: result ? 1 : 2, // 1: 已通过, 2: 已驳回
      comment: auditRemark.value
    }

    const response = await approveTask(params)

    if (response.data.code === 'success') {
      ElMessage.success(`审核${result ? '通过' : '驳回'}成功`)
      auditDialogVisible.value = false
      fetchAuditTasks() // 刷新列表
    } else {
      ElMessage.error(response.data.message || '审核操作失败')
    }
  } catch (error) {
    ElMessage.error('审核操作失败')
    console.error(error)
  } finally {
    loading.value = false
  }
}

// 下载附件
async function downloadAttachment(file) {
  try {
    const response = await downloadTaskAttachment({
      taskId: currentTask.value.id || currentAuditTask.value.id,
      fileId: file.fileId
    })

    // 创建下载链接
    const url = window.URL.createObjectURL(new Blob([response]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', file.fileName)
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
  } catch (error) {
    ElMessage.error('下载附件失败')
    console.error(error)
  }
}

// 获取文件URL
function getFileUrl(fileId) {
  // 这里需要根据实际的文件服务地址来构建URL
  return `/api/approval-tasks/${currentTask.value.id}/attachments/${fileId}/download`
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
