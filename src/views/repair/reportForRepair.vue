
这个合并后的Vue文件实现了以下功能：

1. 左侧保留了`configuration.vue`的设备组织结构树，包含设备层级展示、设备选择等功能
2. 右侧集成了`RepairForm.vue`的设备维修申请功能，包含完整的表单字段和验证
3. 实现了设备选择与表单联动 - 当在左侧选择设备时，右侧表单会自动填充该设备的信息
4. 保留了原有的样式和交互逻辑，同时确保布局协调
5. 添加了表单重置功能，优化了用户体验

代码结构清晰，保留了两个文件的核心功能，同时确保了左右两部分的协同工作。响应式设计确保在不同屏幕尺寸下都能正常显示。{insert\_element\_0\_}```vue
<template>
  <div class="app-container">
    <!-- 主内容区（两列布局） -->
    <div class="main-content">
      <!-- 第一列：设备组织结构（来自configuration.vue） -->
      <div class="panel device-panel">
        <div class="panel-header">
          <div class="panel-title">
            <i class="el-icon-menu"></i>
            设备组织结构
          </div>
          <el-button type="primary" icon="refresh" circle @click="refreshData"></el-button>
        </div>

        <div class="selected-device" v-if="currentDevice">
          当前设备: <strong>{{ currentDevice.mcName || currentDevice.name }}</strong>
        </div>

        <div class="panel-content">
          <div class="table-container">
            <el-table
                :data="tableData"
                row-key="id"
                border
                highlight-current-row
                :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
                :default-expand-all="true"
                @current-change="handleDeviceChange"
                style="width: 100%"
                v-loading="deviceLoading"
                :row-class-name="setTableRowClass"
            >
              <el-table-column prop="name" label="设备/段/产线/车间" min-width="300">
                <template #default="{ row }">
                  <span v-if="row.type === 'workshop'">
                    <i class="el-icon-office-building workshop-icon"></i>
                    <span>{{ row.name }}</span>
                  </span>
                  <span v-else-if="row.type === 'line'">
                    <i class="el-icon-set-up line-icon"></i>
                    <span>{{ row.name }}</span>
                  </span>
                  <span v-else-if="row.type === 'segment'">
                    <i class="el-icon-s-operation segment-icon"></i>
                    <span>{{ row.name }}</span>
                  </span>
                  <span v-else>
                    <i class="el-icon-cpu device-icon"></i>
                    <span>{{ row.mcName || row.name }}</span>
                  </span>
                </template>
              </el-table-column>
              <el-table-column prop="deviceCode" label="设备编码" width="150" v-if="false"></el-table-column>
            </el-table>
          </div>
        </div>
      </div>

      <!-- 第二列：设备维修申请表（来自RepairForm.vue） -->
      <div class="panel repair-form-panel">
        <div class="panel-header">
          <div class="panel-title">
            <i class="el-icon-wrench"></i>
            设备维修申请表
          </div>
        </div>

        <div class="panel-content">
          <el-form
              ref="formRef"
              :model="formData"
              :rules="formRules"
              label-width="120px"
              label-position="top"
              class="repair-form"
          >
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="报修设备" prop="equipmentName">
                  <el-input v-model="formData.equipmentName" disabled />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="设备编号" prop="equipmentNumber">
                  <el-input v-model="formData.equipmentNumber" disabled />
                </el-form-item>
              </el-col>
            </el-row>

            <el-form-item label="故障类型" prop="faultType">
              <el-select v-model="formData.faultType" placeholder="请选择故障类型" style="width: 100%">
                <el-option label="机械故障" value="mechanical" />
                <el-option label="电气故障" value="electrical" />
                <el-option label="控制系统故障" value="control" />
                <el-option label="软件故障" value="software" />
                <el-option label="其他" value="other" />
              </el-select>
            </el-form-item>

            <el-form-item label="严重程度" prop="priority">
              <el-select v-model="formData.priority" placeholder="请选择严重程度" style="width: 100%">
                <el-option label="紧急" value="URGENT" />
                <el-option label="高" value="HIGH" />
                <el-option label="中" value="MEDIUM" />
                <el-option label="低" value="LOW" />
              </el-select>
            </el-form-item>

            <el-form-item label="故障描述" prop="faultDescription">
              <el-input
                  v-model="formData.faultDescription"
                  type="textarea"
                  :rows="4"
                  placeholder="请详细描述故障现象"
              />
            </el-form-item>

            <el-form-item label="故障图片" prop="images">
              <el-upload
                  action="#"
                  list-type="picture-card"
                  :auto-upload="false"
                  :on-change="handleImageChange"
                  :on-remove="handleImageRemove"
                  :file-list="fileList"
                  :limit="3"
                  multiple
              >
                <el-icon><Plus /></el-icon>
              </el-upload>
              <div class="upload-tip">最多上传3张图片，每张不超过5MB</div>
            </el-form-item>

            <el-form-item>
              <el-button
                  type="primary"
                  @click="submitForm"
                  :loading="submitting"
                  :disabled="!formData.equipmentId"
              >
                提交申请
              </el-button>
              <el-button @click="resetForm">取消</el-button>
            </el-form-item>
          </el-form>
        </div>
      </div>
    </div>

    <!-- 页脚 -->
    <div class="footer">
      © 2023 设备配置管理系统 | Vue3 + Element Plus 实现
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, nextTick, onMounted, watch } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import {
  ElMessage,
  ElMessageBox,
  ElTable,
  ElTableColumn,
  ElDialog,
  ElForm,
  ElFormItem,
  ElInput,
  ElCascader,
  ElSelect,
  ElOption,
  ElInputNumber,
  ElSwitch,
  ElCheckbox,
  ElTag,
  ElButton,
  ElButtonGroup,
  ElUpload
} from 'element-plus'
import Sortable from 'sortablejs'
import { useRouter } from 'vue-router'

// 导入API
import { getDeviceTree } from '@/api/equipment/EquipmentLedger'
import equipmentAPI from '@/api/equipment'
import repairAPI from '@/api/repair/repairAPI'
import { useAuthStore } from '@/stores/auth'

// 设备树相关变量（来自configuration.vue）
const tableData = ref([])
const currentDevice = ref(null)
const deviceLoading = ref(false)

// 维修表单相关变量（来自RepairForm.vue）
const router = useRouter()
const authStore = useAuthStore()
const formRef = ref(null)
const submitting = ref(false)
const fileList = ref([])
const selectedFiles = ref([])

// 表单数据
const formData = reactive({
  equipmentId: '',
  equipmentName: '',
  equipmentNumber: '',
  faultType: '',
  priority: '',
  faultDescription: '',
  status: 5 // 待维修状态
})

// 表单验证规则
const formRules = {
  faultType: [{ required: true, message: '请选择故障类型', trigger: 'change' }],
  priority: [{ required: true, message: '请选择严重程度', trigger: 'change' }],
  faultDescription: [{ required: true, message: '请输入故障描述', trigger: 'blur' }]
}

// 设备树相关方法（来自configuration.vue）
const convertToTreeTableData = (data) => {
  const convertNode = (node) => {
    let type = ''
    if (node.areaType === 'WORKSHOP') {
      type = 'workshop'
    } else if (node.areaType === 'LINE') {
      type = 'line'
    } else if (node.areaType === 'SECTION') {
      type = 'segment'
    }

    const tableNode = {
      id: node.id,
      name: node.areaName,
      type: type,
      children: []
    }

    // 如果有设备，将设备添加到children中
    if (node.deviceVOS && node.deviceVOS.length > 0) {
      node.deviceVOS.forEach(device => {
        // 确保设备节点没有children属性
        const deviceNode = {
          ...device,
          type: 'device',
          name: device.mcName,
          deviceCode: device.mcNumber,
          workshopName: findAreaNameById(node.deviceVOS[0].areaId, 'WORKSHOP'),
          lineName: findAreaNameById(node.deviceVOS[0].areaId, 'LINE'),
          sectionName: findAreaNameById(node.deviceVOS[0].areaId, 'SECTION')
        }

        // 确保设备节点没有children属性
        delete deviceNode.subNodes;
        delete deviceNode.children;

        tableNode.children.push(deviceNode)
      })
    }

    // 递归处理子节点 - 只有组织节点可以有子节点
    if (node.subNodes && node.subNodes.length > 0) {
      node.subNodes.forEach(subNode => {
        // 确保子节点是组织节点（车间、产线、段），而不是设备
        if (subNode.areaType) {
          tableNode.children.push(convertNode(subNode))
        }
      })
    }

    return tableNode
  }

  return data.map(node => convertNode(node))
}

const setTableRowClass = ({row}) => {
  if (row.type === 'device') {
    return 'device-row'
  }
  return `${row.type}-row`
}

const findAreaNameById = (areaId, areaType) => {
  // 实现根据区域ID查找区域名称的逻辑
  return ''
}

const initDeviceTree = async () => {
  deviceLoading.value = true
  try {
    // 构建请求参数
    const params = {
      currentNodeId: '',
      mcNumber: '',
      mcName: '',
      manufacturer: '',
      status: ''
    }

    const response = await getDeviceTree(params)
    tableData.value = convertToTreeTableData(response.data.data)
  } catch (error) {
    ElMessage.error('加载设备数据失败: ' + error.message)
  } finally {
    deviceLoading.value = false
  }
}

const refreshData = () => {
  initDeviceTree()
  ElMessage.success('设备数据已刷新')
}

// 选择设备时更新表单数据
const handleDeviceChange = (device) => {
  if (!device || device.type !== 'device') return
  currentDevice.value = device

  // 更新表单数据
  formData.equipmentId = device.id
  formData.equipmentName = device.mcName || device.name
  formData.equipmentNumber = device.mcNumber || device.deviceCode
}

// 维修表单相关方法（来自RepairForm.vue）
const handleImageChange = (file, fileList) => {
  selectedFiles.value = fileList.map(f => f.raw)
}

const handleImageRemove = (file, fileList) => {
  selectedFiles.value = fileList.map(f => f.raw)
}

const submitForm = async () => {
  await formRef.value.validate()

  submitting.value = true
  try {
    // 1. 更新设备状态为待维修
    // await equipmentAPI.updateEquipmentStatus(formData.equipmentId, 5)

    // 2. 创建维修申请表单数据
    const repairWorkOrder = {
      repairDeviceNo: formData.equipmentNumber,
      repairName: formData.equipmentName,
      repairType: formData.faultType === 'mechanical' ? '机械故障' :
          formData.faultType === 'electrical' ? '电气故障' :
              formData.faultType === 'control' ? '控制系统故障' :
                  formData.faultType === 'software' ? '软件故障' : '其他',
      repairDesc: formData.faultDescription,
      priority: formData.priority
    }

    // 3. 提交维修申请
    const res = await repairAPI.createRepairWorkOrder(repairWorkOrder, selectedFiles.value)
    console.log(res)
    if(res.data.code==='Error'){
      ElMessage.error(res.data.msg)
    }else{
      ElMessage.success(res.data.msg)
    }
    resetForm()
  } catch (error) {
    ElMessage.error('提交失败: ' + (error.message || '未知错误'))
  } finally {
    submitting.value = false
  }
}

// 重置表单
const resetForm = () => {
  formRef.value.resetFields()
  fileList.value = []
  selectedFiles.value = []
}

// 生命周期钩子
onMounted(() => {
  initDeviceTree()
})
</script>

<style scoped>
/* 组件内部样式 */
.panel {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.device-panel {
  width: 350px;
  margin-right: 16px;
}

.repair-form-panel {
  flex: 1;
}

.panel-header {
  padding: 16px;
  border-bottom: 1px solid #ebeef5;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.panel-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.panel-title i {
  margin-right: 8px;
  color: #409EFF;
}

.panel-content {
  flex: 1;
  overflow: auto;
  padding: 16px;
}

.table-container {
  flex: 1;
  overflow: auto;
  padding: 0 16px 16px;
}

.el-table {
  border-radius: 6px;
  overflow: hidden;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
}

.workshop-icon {
  margin-right: 8px;
  color: #67c23a;
}

.line-icon {
  margin-right: 8px;
  color: #e6a23c;
}

.segment-icon {
  margin-right: 8px;
  color: #9c27b0;
}

.device-icon {
  margin-right: 8px;
  color: #409EFF;
}

.selected-device {
  padding: 8px 16px;
  background-color: #f5f7fa;
  border-bottom: 1px solid #ebeef5;
  font-size: 14px;
}

.selected-device strong {
  color: #409EFF;
}

/* 设备树表格层级样式（深度选择器） */
.el-table :deep(.el-table__row--level-0) {
  background-color: #f5f7fa !important;
  font-weight: 600;
}

.el-table :deep(.el-table__row--level-1) {
  background-color: #f0f9ff !important;
}

.el-table :deep(.el-table__row--level-2) {
  background-color: #fafafa !important;
}

.el-table :deep(.el-table__row--level-3) {
  background-color: #ffffff !important;
}

.el-table :deep(.el-table__row--current) > td {
  background-color: #ecf5ff !important;
}

/* 行样式控制 */
:deep(.device-row) {
  .el-table__expand-icon {
    display: none !important;
  }

  .el-table__cell:first-child {
    padding-left: 20px !important;
  }
}

:deep(.workshop-row, .line-row, .segment-row) {
  .el-table__expand-icon {
    display: inline-block !important;
  }
}

/* 维修表单样式 */
.repair-form {
  max-width: 800px;
  margin: 0 auto;
}

.upload-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 8px;
}

.el-form-item {
  margin-bottom: 22px;
}

/* 响应式调整 */
@media (max-width: 1200px) {
  .repair-form-panel {
    width: 380px;
  }
}

@media (max-width: 992px) {
  .main-content {
    flex-direction: column;
  }

  .device-panel, .repair-form-panel {
    width: 100%;
    margin-right: 0;
    margin-bottom: 16px;
    height: auto;
    min-height: 300px;
  }
}
</style>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: "Microsoft YaHei", "Segoe UI", sans-serif;
}

body {
  background-color: #f0f2f5;
  height: 100vh;
  overflow: hidden;
}

.app-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-content {
  flex: 1;
  display: flex;
  overflow: hidden;
  padding: 16px;
}

.footer {
  text-align: center;
  padding: 16px;
  color: #909399;
  font-size: 12px;
  border-top: 1px solid #ebeef5;
}
</style>
