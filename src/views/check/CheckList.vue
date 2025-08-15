<template>
  <div class="audit-task-container">
    <el-card class="main-card">
      <template #header>
        <div class="card-header">
          <h2>设备审核任务综合管理</h2>
          <div class="user-select">
            <span>当前身份：</span>
            <el-select v-model="currentRole" size="small" style="width: 120px">
              <el-option label="审核人(admin)" value="admin" />
              <el-option label="发起人(user)" value="user" />
            </el-select>
          </div>
        </div>
      </template>

      <el-table :data="mergedList" stripe style="width: 100%" v-loading="loading">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="deviceCode" label="设备编码" width="120" />
        <el-table-column prop="deviceName" label="设备名称" width="150" />
        <el-table-column prop="taskName" label="任务名称" width="180" />
        <el-table-column prop="auditor" label="审核人" width="120" />
        <el-table-column prop="auditTime" label="审核时间" width="180" />

        <el-table-column label="审核状态" width="120">
          <template #default="{ row }">
            <el-tag :type="row.auditStatus === '待审核' ? 'warning' : 'success'">
              {{ row.auditStatus }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="审批状态" width="120">
          <template #default="{ row }">
            <el-tag v-if="row.approvalStatus"
                    :type="row.approvalStatus === '已通过' ? 'success' : 'danger'">
              {{ row.approvalStatus }}
            </el-tag>
            <span v-else>-</span>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="260" fixed="right">
          <template #default="{ row }">
            <!-- 审核按钮 - 仅审核人可见且状态为待审核 -->
            <el-button v-if="currentRole === 'admin' && row.auditStatus === '待审核'"
                       type="primary" size="small"
                       @click="openAuditDialog(row)">
              审核
            </el-button>

            <!-- 查看详情按钮 - 所有状态可见 -->
            <el-button type="info" size="small"
                       @click="openDetailDialog(row)">
              查看详情
            </el-button>

            <!-- 重新提交按钮 - 仅发起人可见且状态为已驳回 -->
            <el-button v-if="currentRole === 'user' && row.approvalStatus === '已驳回'"
                       type="warning" size="small"
                       @click="openResubmitDialog(row)">
              重新提交
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 审核弹窗 -->
    <el-dialog v-model="auditDialogVisible" :title="`审核任务 - ${currentTask.taskName}`" width="900px">
      <div class="audit-dialog-content">
        <div class="task-info">
          <h3>任务信息</h3>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="任务名称">{{ currentTask.taskName }}</el-descriptions-item>
            <el-descriptions-item label="设备编码">{{ currentTask.deviceCode }}</el-descriptions-item>
            <el-descriptions-item label="设备名称">{{ currentTask.deviceName }}</el-descriptions-item>
            <el-descriptions-item label="任务类型">{{ currentTask.taskType }}</el-descriptions-item>
            <el-descriptions-item label="提交时间">{{ currentTask.submitTime }}</el-descriptions-item>
            <el-descriptions-item label="提交人">{{ currentTask.submitter }}</el-descriptions-item>
          </el-descriptions>
        </div>

        <div class="device-details">
          <h3>设备详情</h3>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="设备状态">{{ deviceDetails.status }}</el-descriptions-item>
            <el-descriptions-item label="厂商">{{ deviceDetails.manufacturer }}</el-descriptions-item>
            <el-descriptions-item label="类别">{{ deviceDetails.category }}</el-descriptions-item>
            <el-descriptions-item label="型号">{{ deviceDetails.model }}</el-descriptions-item>
            <el-descriptions-item label="车间">{{ deviceDetails.workshop }}</el-descriptions-item>
            <el-descriptions-item label="产线">{{ deviceDetails.line }}</el-descriptions-item>
            <el-descriptions-item label="工段">{{ deviceDetails.segment }}</el-descriptions-item>
            <el-descriptions-item label="寿命上限">{{ deviceDetails.lifespan }}年</el-descriptions-item>
          </el-descriptions>
        </div>

        <div class="task-content">
          <h3>任务内容</h3>
          <el-input
              type="textarea"
              :rows="4"
              placeholder="任务描述"
              v-model="currentTask.taskDescription"
              readonly
          ></el-input>
        </div>

        <div class="attachments">
          <h3>附件</h3>
          <div class="attachment-list">
            <div v-for="file in currentTask.attachments" :key="file.id" class="attachment-item">
              <div class="attachment-icon">
                <i v-if="file.type === 'pdf'" class="el-icon-document pdf-icon"></i>
                <i v-else-if="file.type === 'word'" class="el-icon-document word-icon"></i>
                <i v-else class="el-icon-picture image-icon"></i>
              </div>
              <div class="attachment-info">
                <div class="file-name">{{ file.name }}</div>
                <div class="file-size">{{ file.size }} KB</div>
              </div>
              <div class="attachment-actions">
                <!-- 修复：使用 handlePreviewFile 替代 previewFile -->
                <el-button type="text" @click="handlePreviewFile(file)">预览</el-button>
                <el-button type="text" @click="downloadFile(file)">下载</el-button>
              </div>
            </div>
          </div>
        </div>

        <div class="audit-form">
          <h3>审核意见</h3>
          <el-input
              type="textarea"
              :rows="4"
              placeholder="请输入审核意见"
              v-model="auditComment"
          ></el-input>
        </div>
      </div>

      <template #footer>
        <el-button @click="auditDialogVisible = false">取消</el-button>
        <el-button type="danger" @click="handleReject">驳回</el-button>
        <el-button type="primary" @click="handleApprove">通过</el-button>
      </template>
    </el-dialog>

    <!-- 查看详情弹窗 -->
    <el-dialog v-model="detailDialogVisible" :title="`任务详情 - ${currentTask.taskName}`" width="700px">
      <div class="detail-content">
        <el-descriptions title="任务信息" :column="1" border>
          <el-descriptions-item label="任务名称">{{ currentTask.taskName }}</el-descriptions-item>
          <el-descriptions-item label="设备名称">{{ currentTask.deviceName }}</el-descriptions-item>
          <el-descriptions-item label="设备编码">{{ currentTask.deviceCode }}</el-descriptions-item>
          <el-descriptions-item label="任务类型">{{ currentTask.taskType }}</el-descriptions-item>
          <el-descriptions-item label="提交时间">{{ currentTask.submitTime }}</el-descriptions-item>
          <el-descriptions-item label="提交人">{{ currentTask.submitter }}</el-descriptions-item>
          <el-descriptions-item label="审核人">{{ currentTask.auditor }}</el-descriptions-item>
          <el-descriptions-item label="审核时间">{{ currentTask.auditTime }}</el-descriptions-item>
          <el-descriptions-item label="审核状态">
            <el-tag :type="currentTask.auditStatus === '待审核' ? 'warning' : 'success'">
              {{ currentTask.auditStatus }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="审批状态">
            <el-tag v-if="currentTask.approvalStatus"
                    :type="currentTask.approvalStatus === '已通过' ? 'success' : 'danger'">
              {{ currentTask.approvalStatus }}
            </el-tag>
            <span v-else>-</span>
          </el-descriptions-item>
          <el-descriptions-item label="审核意见">{{ currentTask.auditComment || '无' }}</el-descriptions-item>
        </el-descriptions>
      </div>

      <template #footer>
        <el-button type="primary" @click="detailDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>

    <!-- 重新提交弹窗 -->
    <el-dialog v-model="resubmitDialogVisible" :title="`重新提交任务 - ${currentTask.taskName}`" width="700px">
      <div class="resubmit-content">
        <el-form :model="resubmitForm" label-width="100px">
          <el-form-item label="任务名称" required>
            <el-input v-model="resubmitForm.taskName" placeholder="请输入任务名称" />
          </el-form-item>

          <el-form-item label="设备名称">
            <el-input v-model="resubmitForm.deviceName" disabled />
          </el-form-item>

          <el-form-item label="设备编码">
            <el-input v-model="resubmitForm.deviceCode" disabled />
          </el-form-item>

          <el-form-item label="任务类型">
            <el-select v-model="resubmitForm.taskType" placeholder="请选择任务类型" style="width:100%">
              <el-option label="验收" value="验收" />
              <el-option label="转移" value="转移" />
              <el-option label="闲置" value="闲置" />
              <el-option label="报废" value="报废" />
            </el-select>
          </el-form-item>

          <el-form-item label="任务描述" required>
            <el-input
                type="textarea"
                :rows="4"
                placeholder="请输入任务描述"
                v-model="resubmitForm.taskDescription"
            ></el-input>
          </el-form-item>

          <el-form-item label="附件">
            <el-upload
                action="#"
                multiple
                :file-list="resubmitForm.attachments"
                :auto-upload="false"
                :on-change="handleFileChange"
                :on-remove="handleFileRemove"
            >
              <el-button type="primary">选择文件</el-button>
              <template #tip>
                <div class="el-upload__tip">支持上传PDF、Word、图片文件</div>
              </template>
            </el-upload>
          </el-form-item>
        </el-form>
      </div>

      <template #footer>
        <el-button @click="resubmitDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleResubmit">提交</el-button>
      </template>
    </el-dialog>

    <!-- 文件预览弹窗 -->
    <el-dialog v-model="previewDialogVisible" :title="previewFile.name" width="80%">
      <div class="preview-content">
        <img v-if="previewFile.type === 'image'" :src="previewFile.preview" alt="Preview" style="max-width: 100%;" />
        <div v-else class="unsupported-preview">
          <i class="el-icon-document" style="font-size: 48px;"></i>
          <p>该文件类型不支持预览，请下载查看</p>
        </div>
      </div>

      <template #footer>
        <el-button @click="previewDialogVisible = false">关闭</el-button>
        <el-button type="primary" @click="downloadFile(previewFile)">下载</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'

// 当前用户角色（admin:审核人, user:发起人）
const currentRole = ref('admin')

// 加载状态
const loading = ref(false)

// 合并后的审核任务列表
const mergedList = ref([])

// 弹窗控制
const auditDialogVisible = ref(false)
const detailDialogVisible = ref(false)
const resubmitDialogVisible = ref(false)
const previewDialogVisible = ref(false)

// 当前操作的任务
const currentTask = ref({
  id: '',
  deviceCode: '',
  deviceName: '',
  taskName: '',
  auditor: '',
  auditTime: '',
  auditStatus: '',
  approvalStatus: '',
  taskType: '',
  submitter: '',
  submitTime: '',
  taskDescription: '',
  attachments: []
})

// 设备详情信息
const deviceDetails = ref({
  status: '已验收',
  manufacturer: '三星电子',
  category: '清洗机',
  model: 'X-2000',
  workshop: 'C2',
  line: '31',
  segment: 'CFOG段',
  lifespan: 5
})

// 审核意见
const auditComment = ref('')

// 重新提交表单
const resubmitForm = reactive({
  taskName: '',
  deviceName: '',
  deviceCode: '',
  taskType: '',
  taskDescription: '',
  attachments: []
})

// 预览文件 - 响应式引用
const previewFile = ref({})

// 生成模拟数据
const generateMockData = () => {
  const tasks = []
  const taskTypes = ['验收', '转移', '闲置', '报废']
  const deviceNames = ['精密清洗设备', '全自动COG机', '高精度FOG机', '视觉检测设备']
  const submitters = ['user1', 'user2', 'user3']

  for (let i = 1; i <= 15; i++) {
    const taskType = taskTypes[Math.floor(Math.random() * taskTypes.length)]
    const deviceName = deviceNames[Math.floor(Math.random() * deviceNames.length)]

    const task = {
      id: `TASK${i}`,
      deviceCode: `DEV-${Math.floor(1000 + Math.random() * 9000)}`,
      deviceName,
      taskName: `${deviceName}${taskType}任务`,
      auditor: i % 3 === 0 ? '' : 'admin',
      auditTime: i % 3 === 0 ? '' : `2023-06-${10 + i % 20} 14:30`,
      auditStatus: i % 3 === 0 ? '待审核' : '已审核',
      approvalStatus: i % 3 === 0 ? '' : (i % 2 === 0 ? '已通过' : '已驳回'),
      taskType,
      submitter: submitters[Math.floor(Math.random() * submitters.length)],
      submitTime: `2023-06-${5 + i % 20} 09:15`,
      taskDescription: `这是关于${deviceName}的${taskType}任务描述，需要完成相关审核流程以确保设备状态变更符合公司规定。`,
      attachments: []
    }

    // 添加附件
    if (i % 4 !== 0) {
      task.attachments = [
        { id: `file${i}-1`, name: `设备说明书-${deviceName}.pdf`, type: 'pdf', size: Math.floor(500 + Math.random() * 1500) },
        { id: `file${i}-2`, name: `验收报告-${deviceName}.docx`, type: 'word', size: Math.floor(200 + Math.random() * 800) }
      ]

      if (i % 3 === 0) {
        task.attachments.push({
          id: `file${i}-3`,
          name: `设备照片-${deviceName}.jpg`,
          type: 'image',
          size: Math.floor(800 + Math.random() * 1200),
          preview: 'https://via.placeholder.com/600x400?text=Device+Image'
        })
      }
    }

    tasks.push(task)
  }

  return tasks
}

// 加载数据
const loadData = () => {
  loading.value = true
  setTimeout(() => {
    mergedList.value = generateMockData()
    loading.value = false
  }, 800)
}

// 打开审核对话框
const openAuditDialog = (task) => {
  currentTask.value = { ...task }
  auditComment.value = ''
  auditDialogVisible.value = true
}

// 打开详情对话框
const openDetailDialog = (task) => {
  currentTask.value = { ...task }
  detailDialogVisible.value = true
}

// 打开重新提交对话框
const openResubmitDialog = (task) => {
  currentTask.value = { ...task }

  // 初始化重新提交表单
  resubmitForm.taskName = task.taskName
  resubmitForm.deviceName = task.deviceName
  resubmitForm.deviceCode = task.deviceCode
  resubmitForm.taskType = task.taskType
  resubmitForm.taskDescription = task.taskDescription
  resubmitForm.attachments = [...task.attachments]

  resubmitDialogVisible.value = true
}

// 处理文件变更
const handleFileChange = (file, fileList) => {
  resubmitForm.attachments = fileList.map(f => ({
    id: f.uid,
    name: f.name,
    type: getFileType(f.name),
    size: Math.round(f.size / 1024),
    raw: f.raw
  }))
}

// 处理文件移除
const handleFileRemove = (file, fileList) => {
  resubmitForm.attachments = fileList
}

// 获取文件类型
const getFileType = (fileName) => {
  const ext = fileName.split('.').pop().toLowerCase()
  if (['pdf'].includes(ext)) return 'pdf'
  if (['doc', 'docx'].includes(ext)) return 'word'
  if (['jpg', 'jpeg', 'png', 'gif'].includes(ext)) return 'image'
  return 'other'
}

// 预览文件 - 修复：重命名函数为 handlePreviewFile
const handlePreviewFile = (file) => {
  previewFile.value = file
  previewDialogVisible.value = true
}

// 下载文件
const downloadFile = (file) => {
  ElMessage.success(`开始下载: ${file.name}`)
  // 实际项目中这里会有文件下载逻辑
}

// 处理审核通过
const handleApprove = () => {
  if (!auditComment.value.trim()) {
    ElMessage.warning('请填写审核意见')
    return
  }

  // 在实际应用中，这里会更新任务状态
  const index = mergedList.value.findIndex(item => item.id === currentTask.value.id)
  if (index !== -1) {
    mergedList.value[index].auditStatus = '已审核'
    mergedList.value[index].approvalStatus = '已通过'
    mergedList.value[index].auditor = 'admin'
    mergedList.value[index].auditTime = new Date().toLocaleString()
    mergedList.value[index].auditComment = auditComment.value
  }

  ElMessage.success('任务审核已通过')
  auditDialogVisible.value = false
}

// 处理审核驳回
const handleReject = () => {
  if (!auditComment.value.trim()) {
    ElMessage.warning('请填写审核意见')
    return
  }

  // 在实际应用中，这里会更新任务状态
  const index = mergedList.value.findIndex(item => item.id === currentTask.value.id)
  if (index !== -1) {
    mergedList.value[index].auditStatus = '已审核'
    mergedList.value[index].approvalStatus = '已驳回'
    mergedList.value[index].auditor = 'admin'
    mergedList.value[index].auditTime = new Date().toLocaleString()
    mergedList.value[index].auditComment = auditComment.value
  }

  ElMessage.warning('任务已驳回')
  auditDialogVisible.value = false
}

// 处理重新提交
const handleResubmit = () => {
  if (!resubmitForm.taskName.trim() || !resubmitForm.taskDescription.trim()) {
    ElMessage.warning('请填写任务名称和描述')
    return
  }

  // 在实际应用中，这里会更新任务状态
  const index = mergedList.value.findIndex(item => item.id === currentTask.value.id)
  if (index !== -1) {
    mergedList.value[index].taskName = resubmitForm.taskName
    mergedList.value[index].taskDescription = resubmitForm.taskDescription
    mergedList.value[index].taskType = resubmitForm.taskType
    mergedList.value[index].attachments = [...resubmitForm.attachments]
    mergedList.value[index].auditStatus = '待审核'
    mergedList.value[index].approvalStatus = ''
    mergedList.value[index].auditor = ''
    mergedList.value[index].auditTime = ''
  }

  ElMessage.success('任务已重新提交')
  resubmitDialogVisible.value = false
}

// 初始化加载数据
onMounted(() => {
  loadData()
})
</script>

<style scoped>
.audit-task-container {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: 100vh;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.main-card {
  border-radius: 10px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  border: none;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
}

.card-header h2 {
  color: #2c3e50;
  font-weight: 600;
  font-size: 1.5rem;
  margin: 0;
}

.user-select {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 0.9rem;
  color: #555;
}

.audit-dialog-content {
  padding: 10px;
}

.audit-dialog-content h3 {
  margin-top: 20px;
  margin-bottom: 15px;
  padding-bottom: 8px;
  border-bottom: 1px solid #eaeaea;
  color: #3498db;
  font-weight: 600;
}

.attachment-list {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  margin-top: 10px;
}

.attachment-item {
  display: flex;
  align-items: center;
  width: 100%;
  padding: 12px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background-color: #f9f9f9;
  transition: all 0.3s ease;
  box-shadow: 0 2px 5px rgba(0,0,0,0.05);
}

.attachment-item:hover {
  transform: translateY(-2px);
  border-color: #3498db;
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
}

.attachment-icon {
  margin-right: 15px;
  font-size: 32px;
  flex-shrink: 0;
}

.pdf-icon {
  color: #e74c3c;
}

.word-icon {
  color: #2980b9;
}

.image-icon {
  color: #3498db;
}

.attachment-info {
  flex: 1;
}

.file-name {
  font-weight: 500;
  margin-bottom: 5px;
  color: #2c3e50;
}

.file-size {
  font-size: 12px;
  color: #7f8c8d;
}

.attachment-actions {
  min-width: 100px;
  text-align: right;
}

.unsupported-preview {
  text-align: center;
  padding: 40px 0;
  color: #7f8c8d;
}

.unsupported-preview i {
  font-size: 48px;
  color: #95a5a6;
  margin-bottom: 15px;
}

.detail-content {
  padding: 10px;
}

.resubmit-content {
  padding: 10px;
}

.preview-content {
  min-height: 400px;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f8f9fa;
  border-radius: 8px;
}

.preview-content img {
  max-height: 70vh;
  max-width: 100%;
  object-fit: contain;
  border-radius: 4px;
}

/* 添加一些动画效果 */
.el-button {
  transition: all 0.3s ease;
}

.el-tag {
  font-weight: 500;
}

/* 响应式调整 */
@media (max-width: 992px) {
  .card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .user-select {
    align-self: flex-end;
  }
}

@media (max-width: 768px) {
  .audit-task-container {
    padding: 10px;
  }

  .main-card {
    border-radius: 8px;
  }
}
</style>
