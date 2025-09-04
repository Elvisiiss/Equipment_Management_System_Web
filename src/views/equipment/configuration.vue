<template>
  <div class="app-container">
    <!-- 主内容区（两列布局） -->
    <div class="main-content">
      <!-- 第一列：设备组织结构 -->
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
          <span v-if="currentDevice.workshopName"> · {{ currentDevice.workshopName }}车间</span>
          <span v-if="currentDevice.lineName"> · {{ currentDevice.lineName }}产线</span>
          <span v-if="currentDevice.sectionName"> · {{ currentDevice.sectionName }}</span>
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

      <!-- 第二列：产品型号管理 -->
      <div class="panel model-panel">
        <div class="panel-header">
          <div class="panel-title">
            <i class="el-icon-s-grid"></i>
            产品型号管理
          </div>
          <el-button
              type="primary"
              icon="plus"
              @click="addProductModel"
              :disabled="!currentDevice"
          >
            新增型号
          </el-button>
        </div>

        <div class="panel-content">
          <div class="table-container">
            <el-table
                :data="productModels"
                border
                highlight-current-row
                @row-click="selectProductModel"
                v-loading="productLoading"
                style="width: 100%"
            >
              <el-table-column prop="modelCode" label="型号编码" width="180" sortable></el-table-column>
              <el-table-column prop="createTime" label="创建时间" width="180" sortable></el-table-column>
              <el-table-column label="操作" width="180" fixed="right">
                <template #default="{ row }">
                  <el-button type="text" size="small" @click.stop="showParamConfigDialog(row)">参数配置</el-button>
                  <el-button type="text" size="small" @click.stop="editProductModel(row)">编辑</el-button>
                  <el-button type="text" size="small" @click.stop="deleteProductModel(row)" style="color: #F56C6C">删除</el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </div>
      </div>
    </div>

    <!-- 页脚 -->
    <div class="footer">
      © 2023 设备配置管理系统 | Vue3 + Element Plus 实现
    </div>

    <!-- 新增/编辑产品型号弹窗 -->
    <el-dialog
        v-model="productDialogVisible"
        :title="isEditProduct ? '编辑产品型号' : '新增产品型号'"
        width="500px"
        :close-on-click-modal="false"
    >
      <el-form :model="productForm" label-width="100px" ref="productFormRef">
        <el-form-item label="型号编码" prop="modelCode" required>
          <el-input v-model="productForm.modelCode" placeholder="请输入型号编码" />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="productDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitProductModel">确定</el-button>
      </template>
    </el-dialog>

    <!-- 参数配置弹窗 -->
    <el-dialog
        v-model="paramDialogVisible"
        :title="`${currentModel?.modelCode || ''} 重要参数配置`"
        width="80%"
        top="5vh"
        :close-on-click-modal="false"
    >
      <div class="param-config-container">
        <div class="param-tabs">
          <el-button-group>
            <el-button
                :type="paramViewMode === 'list' ? 'primary' : ''"
                @click="paramViewMode = 'list'"
            >
              列表视图
            </el-button>
            <el-button
                :type="paramViewMode === 'json' ? 'primary' : ''"
                @click="paramViewMode = 'json'"
            >
              JSON视图
            </el-button>
          </el-button-group>

          <div class="param-actions">
            <el-button type="primary" @click="addParam" :disabled="paramViewMode !== 'list'">
              新增参数
            </el-button>
            <el-button
                type="success"
                @click="copyParamsToClipboard"
                :disabled="!paramTable.length"
            >
              复制参数
            </el-button>
            <el-button
                type="warning"
                @click="pasteParamsFromClipboard"
                :disabled="paramViewMode !== 'json'"
            >
              粘贴参数
            </el-button>
            <el-button type="danger" @click="save">保存配置</el-button>
          </div>
        </div>

        <!-- 列表视图 -->
        <div v-show="paramViewMode === 'list'" class="param-list-view">
          <el-table
              ref="tableRef"
              :data="paramTable"
              row-key="id"
              border
              v-loading="paramLoading"
              style="width: 100%"
          >
            <!-- 拖拽手柄 -->
            <el-table-column width="50" align="center">
              <template #default>
                <i class="drag-handle">⋮⋮</i>
              </template>
            </el-table-column>

            <el-table-column label="序号" width="60" type="index" align="center"></el-table-column>

            <el-table-column label="参数名称" width="180">
              <template #default="{ row }">
                <el-input v-model="row.name" placeholder="请输入名称" />
              </template>
            </el-table-column>

            <el-table-column label="参数类型" width="120">
              <template #default="{ row }">
                <el-select v-model="row.type">
                  <el-option label="数值" value="number" />
                  <el-option label="文本" value="text" />
                  <el-option label="布尔" value="boolean" />
                </el-select>
              </template>
            </el-table-column>

            <el-table-column label="寄存器地址" width="180">
              <template #default="{ row }">
                <el-input v-model="row.registerAddress" placeholder="0x0000" />
              </template>
            </el-table-column>

            <el-table-column label="默认值" width="150">
              <template #default="{ row }">
                <el-input
                    v-if="row.type === 'text'"
                    v-model="row.default"
                    placeholder="默认值"
                />
                <el-input-number
                    v-else-if="row.type === 'number'"
                    v-model="row.default"
                    :min="0"
                    :precision="2"
                    style="width: 100%"
                />
                <el-switch v-else v-model="row.default" />
              </template>
            </el-table-column>

            <el-table-column label="下限" width="120">
              <template #default="{ row }">
                <el-input-number
                    v-if="row.type === 'number'"
                    v-model="row.minValue"
                    :min="0"
                    :precision="2"
                    style="width: 100%"
                />
                <span v-else>-</span>
              </template>
            </el-table-column>

            <el-table-column label="上限" width="120">
              <template #default="{ row }">
                <el-input-number
                    v-if="row.type === 'number'"
                    v-model="row.maxValue"
                    :min="0"
                    :precision="2"
                    style="width: 100%"
                />
                <span v-else>-</span>
              </template>
            </el-table-column>

            <el-table-column label="单位" width="100">
              <template #default="{ row }">
                <el-input v-model="row.unit" placeholder="单位" />
              </template>
            </el-table-column>

            <el-table-column label="是否必填" width="90" align="center">
              <template #default="{ row }">
                <el-checkbox v-model="row.required" />
              </template>
            </el-table-column>

            <el-table-column label="操作" width="90" align="center">
              <template #default="{ $index }">
                <el-button type="danger, link" @click="removeParam($index)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <!-- JSON视图 -->
        <div v-show="paramViewMode === 'json'" class="param-json-view">
          <el-input
              type="textarea"
              :rows="20"
              placeholder="请输入JSON格式的参数配置"
              v-model="paramJson"
          ></el-input>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, nextTick, onMounted, watch } from 'vue'
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
  ElButtonGroup
} from 'element-plus'
import Sortable from 'sortablejs'

// 导入API
import {
  getAreaTree,
  getChildAreas,
  getDeviceTree
} from '@/api/equipment/EquipmentLedger'

// 1. 响应式变量定义
// 设备树数据
const tableData = ref([])
const currentDevice = ref(null)
const deviceLoading = ref(false)
// 产品型号数据
const productModels = ref([])
const currentModel = ref(null)
const productLoading = ref(false)
const paramLoading = ref(false)
// 弹窗相关
const productDialogVisible = ref(false)
const isEditProduct = ref(false)
const productForm = reactive({
  id: null,
  modelCode: ''
})
const productFormRef = ref(null)
// 参数配置弹窗
const paramDialogVisible = ref(false)
const paramViewMode = ref('list') // 'list' 或 'json'
const paramJson = ref('')
// 参数表格相关
const paramTable = ref([])
const tableRef = ref(null)
let sortable = null // 拖拽实例

// 监听JSON视图变化，同步到表格数据
watch(paramJson, (newVal) => {
  try {
    if (newVal) {
      const parsed = JSON.parse(newVal)
      if (Array.isArray(parsed)) {
        paramTable.value = parsed
      }
    }
  } catch (e) {
    // JSON解析错误时不处理
  }
})

// 监听表格数据变化，同步到JSON视图
watch(paramTable, (newVal) => {
  if (paramViewMode.value === 'json') {
    paramJson.value = JSON.stringify(newVal, null, 2)
  }
}, { deep: true })

// 2. 核心方法
// 将API返回的数据转换为树形表格数据
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

// 设置表格行类名
const setTableRowClass = ({row}) => {
  if (row.type === 'device') {
    return 'device-row'
  }
  return `${row.type}-row`
}

// 根据区域ID查找区域名称
const findAreaNameById = (areaId, areaType) => {
  // 这里需要根据实际情况实现，可能需要额外的API调用或数据结构
  return ''
}

// 初始化设备树
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

// 刷新数据
const refreshData = () => {
  initDeviceTree()
  ElMessage.success('设备数据已刷新')
}

// 选择设备（仅设备类型有效）
const handleDeviceChange = (device) => {
  if (!device || device.type !== 'device') return
  currentDevice.value = device
  currentModel.value = null
  paramTable.value = []
  loadProductModels(device.id) // 加载该设备的产品型号
}

// 加载产品型号（模拟接口）
const loadProductModels = (deviceId) => {
  productLoading.value = true
  setTimeout(() => {
    productModels.value = [
      { id: 'PM001', modelCode: 'MOD-001', createTime: '2023-06-01', updateTime: '2023-08-15' },
      { id: 'PM002', modelCode: 'MOD-002', createTime: '2023-07-10', updateTime: '2023-08-10' },
      { id: 'PM003', modelCode: 'MOD-003', createTime: '2023-07-15', updateTime: '2023-08-12' }
    ]
    productLoading.value = false
  }, 500)
}

// 选择产品型号（不再直接加载参数，改为点击按钮触发）
const selectProductModel = (model) => {
  currentModel.value = model
}

// 显示参数配置弹窗
const showParamConfigDialog = (model) => {
  currentModel.value = model
  paramLoading.value = true
  paramDialogVisible.value = true

  // 默认空参数
  setTimeout(() => {
    paramTable.value = []
    paramJson.value = JSON.stringify([], null, 2)
    paramLoading.value = false
    nextTick(initDrag) // 初始化拖拽
  }, 800)
}

// 新增产品型号
const addProductModel = () => {
  isEditProduct.value = false
  productForm.id = null
  productForm.modelCode = ''
  productDialogVisible.value = true
}

// 编辑产品型号
const editProductModel = (model) => {
  isEditProduct.value = true
  productForm.id = model.id
  productForm.modelCode = model.modelCode
  productDialogVisible.value = true
}

// 删除产品型号
const deleteProductModel = (model) => {
  ElMessageBox.confirm(
      `确定删除产品型号【${model.modelCode}】? 此操作不可恢复。`,
      '删除确认',
      { confirmButtonText: '确定删除', cancelButtonText: '取消', type: 'warning', confirmButtonClass: 'el-button--danger' }
  ).then(() => {
    productModels.value = productModels.value.filter(p => p.id !== model.id)
    if (currentModel.value?.id === model.id) {
      currentModel.value = null
      paramTable.value = []
    }
    ElMessage.success('产品型号删除成功')
  }).catch(() => {
    ElMessage.info('已取消删除')
  })
}

// 提交产品型号（新增/编辑）
const submitProductModel = () => {
  if (!productForm.modelCode) {
    ElMessage.error('请填写型号编码')
    return
  }

  if (isEditProduct.value) {
    // 编辑：更新现有数据
    const index = productModels.value.findIndex(p => p.id === productForm.id)
    if (index !== -1) {
      productModels.value[index] = {
        ...productModels.value[index],
        modelCode: productForm.modelCode,
        updateTime: new Date().toISOString().split('T')[0]
      }
    }
  } else {
    // 新增：添加新数据
    productModels.value.push({
      id: `PM${Date.now()}`,
      modelCode: productForm.modelCode,
      createTime: new Date().toISOString().split('T')[0],
      updateTime: new Date().toISOString().split('T')[0]
    })
  }

  productDialogVisible.value = false
  ElMessage.success(`产品型号${isEditProduct.value ? '更新' : '添加'}成功`)
}

// 新增参数
const addParam = () => {
  paramTable.value.push({
    id: Date.now(),
    name: '',
    type: 'text',
    registerAddress: '',
    default: '',
    minValue: null,
    maxValue: null,
    unit: '',
    required: false
  })
  nextTick(initDrag)
}

// 删除参数
const removeParam = (index) => {
  paramTable.value.splice(index, 1)
  nextTick(initDrag)
}

// 保存参数配置
const save = () => {
  console.log('保存配置：', currentModel.value.modelCode, paramTable.value)
  ElMessage.success('参数配置已保存！')
  paramDialogVisible.value = false
}

// 复制参数到剪贴板
const copyParamsToClipboard = async () => {
  try {
    const jsonStr = JSON.stringify(paramTable.value, null, 2)
    await navigator.clipboard.writeText(jsonStr)
    ElMessage.success('参数已复制到剪贴板')
  } catch (err) {
    ElMessage.error('复制失败: ' + err.message)
  }
}

// 从剪贴板粘贴参数
const pasteParamsFromClipboard = async () => {
  try {
    const text = await navigator.clipboard.readText()
    const parsed = JSON.parse(text)
    if (Array.isArray(parsed)) {
      paramTable.value = parsed
      paramJson.value = JSON.stringify(parsed, null, 2)
      ElMessage.success('参数已从剪贴板粘贴')
    } else {
      ElMessage.error('剪贴板内容不是有效的参数数组')
    }
  } catch (err) {
    ElMessage.error('粘贴失败: ' + err.message)
  }
}

// 初始化表格拖拽
const initDrag = () => {
  const tbody = tableRef.value?.$el.querySelector('.el-table__body tbody')
  if (!tbody) return
  if (sortable) sortable.destroy() // 销毁旧实例

  sortable = Sortable.create(tbody, {
    handle: '.drag-handle',
    animation: 150,
    onEnd: ({ newIndex, oldIndex }) => {
      // 调整参数数组顺序
      const [target] = paramTable.value.splice(oldIndex, 1)
      paramTable.value.splice(newIndex, 0, target)
    }
  })
}

// 3. 生命周期钩子
onMounted(() => {
  initDeviceTree()
  initDrag()
})
</script>

<style scoped>
/* 组件内部样式（scoped 隔离） */
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

.model-panel {
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
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.table-container {
  flex: 1;
  overflow: auto;
  padding: 0 16px 16px;
}

.action-buttons {
  padding: 16px;
  border-top: 1px solid #ebeef5;
  display: flex;
  justify-content: flex-end;
}

.el-table {
  border-radius: 6px;
  overflow: hidden;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
}

.drag-handle {
  cursor: move;
  font-size: 16px;
  color: #909399;
  user-select: none;
  padding: 0 8px;
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

/* 参数配置弹窗样式 */
.param-config-container {
  display: flex;
  flex-direction: column;
  height: 70vh;
}

.param-tabs {
  display: flex;
  justify-content: space-between;
  margin-bottom: 16px;
}

.param-actions {
  display: flex;
  gap: 8px;
}

.param-list-view, .param-json-view {
  flex: 1;
  overflow: auto;
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

/* 状态标签样式 */
.status-tag {
  border-radius: 4px;
  padding: 4px 8px;
  font-size: 12px;
  font-weight: 500;
}

.status-accepted {
  background: #e1f3d8;
  color: #67c23a;
}

.status-pending {
  background: #fff3cd;
  color: #e6a23c;
}

.status-sample {
  background: #d1ecf1;
  color: #409eff;
}

.status-idle {
  background: #f8d7da;
  color: #f56c6c;
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

/* 响应式调整 */
@media (max-width: 1200px) {
  .model-panel {
    width: 380px;
  }
}

@media (max-width: 992px) {
  .main-content {
    flex-direction: column;
  }

  .device-panel, .model-panel {
    width: 100%;
    margin-right: 0;
    margin-bottom: 16px;
    height: 300px;
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

.header {
  background: linear-gradient(135deg, #409EFF 0%, #1e88e5 100%);
  color: white;
  padding: 0 24px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  z-index: 10;
}

.logo {
  display: flex;
  align-items: center;
  font-size: 20px;
  font-weight: bold;
}

.logo i {
  margin-right: 12px;
  font-size: 28px;
}

.system-title {
  font-size: 18px;
  margin-left: 20px;
  opacity: 0.9;
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
