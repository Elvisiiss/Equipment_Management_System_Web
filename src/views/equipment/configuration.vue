<template>
  <div class="app-container">

    <!-- 主内容区（三列布局） -->
    <div class="main-content">
      <!-- 第一列：设备组织结构 -->
      <div class="panel device-panel">
        <div class="panel-header">
          <div class="panel-title">
            <i class="el-icon-menu"></i>
            设备组织结构
          </div>
          <el-button type="primary" icon="el-icon-refresh" circle @click="refreshData"></el-button>
        </div>

        <div class="selected-device" v-if="currentDevice">
          当前设备: <strong>{{ currentDevice.name }}</strong>
          <span v-if="currentDevice.workshop"> · {{ currentDevice.workshop }}车间</span>
          <span v-if="currentDevice.line"> · {{ currentDevice.line }}产线</span>
          <span v-if="currentDevice.segment"> · {{ currentDevice.segment }}</span>
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
            >
              <el-table-column prop="name" label="设备/段/产线/车间" min-width="300">
                <template #default="{ row }">
                  <span v-if="row.type === 'workshop'">
                    <i class="el-icon-office-building workshop-icon"></i>
                    <span>{{ row.name }}车间</span>
                  </span>
                  <span v-else-if="row.type === 'line'">
                    <i class="el-icon-set-up line-icon"></i>
                    <span>{{ row.name }}产线</span>
                  </span>
                  <span v-else-if="row.type === 'segment'">
                    <i class="el-icon-s-operation segment-icon"></i>
                    <span>{{ row.name }}</span>
                  </span>
                  <span v-else>
                    <i class="el-icon-cpu device-icon"></i>
                    <span>{{ row.name }}</span>
                    <span class="status-indicator" :class="row.status ? 'status-active' : 'status-inactive'"></span>
                  </span>
                </template>
              </el-table-column>
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
              icon="el-icon-plus"
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
              <el-table-column prop="templateName" label="关联参数模板" min-width="200">
                <template #default="{ row }">
                  <el-tag type="info">{{ row.templateName }}</el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="createTime" label="创建时间" width="180" sortable></el-table-column>
              <el-table-column label="操作" width="100" fixed="right">
                <template #default="{ row }">
                  <el-button type="text" size="small" @click.stop="editProductModel(row)">编辑</el-button>
                  <el-button type="text" size="small" @click.stop="deleteProductModel(row)" style="color: #F56C6C">删除</el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </div>
      </div>

      <!-- 第三列：重要参数配置 -->
      <div class="panel param-panel">
        <div class="panel-header">
          <div class="panel-title">
            <i class="el-icon-setting"></i>
            {{ currentModel ? currentModel.modelCode : '未选择型号' }} 重要参数配置
          </div>
          <div>
            <el-button type="primary" @click="addParam" :disabled="!currentModel">新增参数</el-button>
            <el-button type="success" @click="save" :disabled="!currentModel">保存配置</el-button>
          </div>
        </div>

        <div class="panel-content">
          <div class="table-container">
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
                  <el-button type="danger" link @click="removeParam($index)">删除</el-button>
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
        <el-form-item label="参数模板" prop="templateId" required>
          <el-cascader
              v-model="productForm.templateId"
              :options="templateOptions"
              :props="cascaderProps"
              placeholder="请选择参数模板"
              filterable
              clearable
              style="width: 100%"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="productDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitProductModel">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, nextTick, onMounted } from 'vue'
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
  ElButton
} from 'element-plus'
import Sortable from 'sortablejs' // 需安装：npm install sortablejs

// 1. 响应式变量定义
// 设备树数据
const tableData = ref([])
const currentDevice = ref(null)
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
  modelCode: '',
  templateId: null
})
const productFormRef = ref(null)
// 参数模板选项
const templateOptions = ref([
  {
    value: '1',
    label: '清洗机模板',
    children: [
      { value: '11', label: '标准清洗模板' },
      { value: '12', label: '快速清洗模板' }
    ]
  },
  {
    value: '2',
    label: 'COG机模板',
    children: [
      { value: '21', label: 'COG标准模板' },
      { value: '22', label: 'COG高精度模板' }
    ]
  },
  {
    value: '3',
    label: 'FOG机模板',
    children: [
      { value: '31', label: 'FOG通用模板' },
      { value: '32', label: 'FOG高速模板' }
    ]
  },
  {
    value: '4',
    label: 'AOI机模板',
    children: [
      { value: '41', label: 'AOI检测模板' },
      { value: '42', label: 'AOI高速模板' }
    ]
  },
  {
    value: '5',
    label: '组装机模板',
    children: [
      { value: '51', label: '组装标准模板' },
      { value: '52', label: '精密组装模板' }
    ]
  }
])
const cascaderProps = {
  expandTrigger: 'hover',
  value: 'value',
  label: 'label',
  children: 'children'
}
// 参数表格相关
const paramTable = ref([])
const tableRef = ref(null)
let sortable = null // 拖拽实例

// 2. 核心方法
// 初始化设备树
const initDeviceTree = () => {
  tableData.value = [
    {
      id: 1001,
      name: 'C2',
      type: 'workshop',
      children: [
        {
          id: 1002,
          name: '31',
          type: 'line',
          children: [
            {
              id: 1003,
              name: 'CFOG段',
              type: 'segment',
              children: [
                { id: 1, name: '精密清洗设备', type: 'device', deviceCode: 'DEV-C2-31-CFOG-101', status: true },
                { id: 2, name: '全自动COG机', type: 'device', deviceCode: 'DEV-C2-31-CFOG-102', status: true }
              ]
            }
          ]
        },
        {
          id: 1004,
          name: '32',
          type: 'line',
          children: [
            {
              id: 1005,
              name: '贴合段',
              type: 'segment',
              children: [
                { id: 3, name: '高精度FOG机', type: 'device', deviceCode: 'DEV-C2-32-TH-201', status: true }
              ]
            }
          ]
        },
        { id: 4, name: '车间监控设备', type: 'device', deviceCode: 'DEV-C2-MON-001', status: true }
      ]
    },
    {
      id: 2001,
      name: 'C3',
      type: 'workshop',
      children: [
        {
          id: 2002,
          name: '41',
          type: 'line',
          children: [
            {
              id: 2003,
              name: '组装段',
              type: 'segment',
              children: [
                { id: 5, name: '智能组装机', type: 'device', deviceCode: 'DEV-C3-41-ASM-301', status: true },
                { id: 6, name: '视觉检测设备', type: 'device', deviceCode: 'DEV-C3-41-ASM-302', status: false }
              ]
            }
          ]
        },
        { id: 7, name: '中央控制设备', type: 'device', deviceCode: 'DEV-C3-CTRL-001', status: true }
      ]
    },
    { id: 3001, name: '独立测试设备', type: 'device', deviceCode: 'DEV-IND-TEST-001', status: true }
  ]
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
      { id: 'PM001', modelCode: 'MOD-001', templateId: '11', templateName: '标准清洗模板', createTime: '2023-06-01', updateTime: '2023-08-15' },
      { id: 'PM002', modelCode: 'MOD-002', templateId: '12', templateName: '快速清洗模板', createTime: '2023-07-10', updateTime: '2023-08-10' },
      { id: 'PM003', modelCode: 'MOD-003', templateId: '21', templateName: 'COG标准模板', createTime: '2023-07-15', updateTime: '2023-08-12' }
    ]
    productLoading.value = false
  }, 500)
}

// 选择产品型号（加载对应参数）
const selectProductModel = (model) => {
  currentModel.value = model
  paramLoading.value = true
  setTimeout(() => {
    // 根据模板ID加载不同参数
    switch (model.templateId) {
      case '11':
        paramTable.value = [
          { id: 1, name: '清洗时间', type: 'number', registerAddress: '0x1001', default: 30, minValue: 10, maxValue: 60, unit: 's', required: true },
          { id: 2, name: '清洗温度', type: 'number', registerAddress: '0x1002', default: 60, minValue: 40, maxValue: 80, unit: '℃', required: true },
          { id: 3, name: '喷淋压力', type: 'number', registerAddress: '0x1003', default: 0.3, minValue: 0.1, maxValue: 0.5, unit: 'MPa', required: false }
        ]
        break
      case '12':
        paramTable.value = [
          { id: 4, name: '清洗时间', type: 'number', registerAddress: '0x1001', default: 15, minValue: 5, maxValue: 30, unit: 's', required: true },
          { id: 5, name: '清洗温度', type: 'number', registerAddress: '0x1002', default: 70, minValue: 50, maxValue: 85, unit: '℃', required: true },
          { id: 6, name: '喷淋压力', type: 'number', registerAddress: '0x1003', default: 0.4, minValue: 0.2, maxValue: 0.6, unit: 'MPa', required: false },
          { id: 7, name: '干燥时间', type: 'number', registerAddress: '0x1004', default: 10, minValue: 5, maxValue: 20, unit: 's', required: false }
        ]
        break
      default:
        paramTable.value = [
          { id: 8, name: '压力参数', type: 'number', registerAddress: '0x2001', default: 15, minValue: 5, maxValue: 30, unit: 'kg', required: true },
          { id: 9, name: '温度控制', type: 'number', registerAddress: '0x2002', default: 25, minValue: 15, maxValue: 35, unit: '℃', required: true },
          { id: 10, name: '速度设置', type: 'number', registerAddress: '0x2003', default: 100, minValue: 50, maxValue: 200, unit: 'rpm', required: false }
        ]
    }
    paramLoading.value = false
    nextTick(initDrag) // 初始化拖拽
  }, 800)
}

// 新增产品型号
const addProductModel = () => {
  isEditProduct.value = false
  productForm.id = null
  productForm.modelCode = ''
  productForm.templateId = null
  productDialogVisible.value = true
}

// 编辑产品型号
const editProductModel = (model) => {
  isEditProduct.value = true
  productForm.id = model.id
  productForm.modelCode = model.modelCode
  productForm.templateId = [model.templateId.substring(0, 1), model.templateId] // 级联选择器格式
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
  if (!productForm.modelCode || !productForm.templateId) {
    ElMessage.error('请填写完整信息')
    return
  }

  // 匹配模板名称
  let templateName = ''
  for (const group of templateOptions.value) {
    const match = group.children.find(t => t.value === productForm.templateId[1])
    if (match) {
      templateName = match.label
      break
    }
  }

  if (isEditProduct.value) {
    // 编辑：更新现有数据
    const index = productModels.value.findIndex(p => p.id === productForm.id)
    if (index !== -1) {
      productModels.value[index] = {
        ...productModels.value[index],
        modelCode: productForm.modelCode,
        templateId: productForm.templateId[1],
        templateName,
        updateTime: new Date().toISOString().split('T')[0]
      }
    }
  } else {
    // 新增：添加新数据
    productModels.value.push({
      id: `PM${Date.now()}`,
      modelCode: productForm.modelCode,
      templateId: productForm.templateId[1],
      templateName,
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
  initDeviceTree() // 初始化设备树数据
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
  width: 420px;
  margin-right: 16px;
}

.param-panel {
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

.status-indicator {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-right: 8px;
}

.status-active {
  background-color: #67c23a;
}

.status-inactive {
  background-color: #f56c6c;
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

  .device-panel,
  .model-panel,
  .param-panel {
    width: 100%;
    margin-right: 0;
    margin-bottom: 16px;
    height: 300px;
  }
}
</style>

<style>
/* 全局样式（无scoped，影响整个项目） */
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
