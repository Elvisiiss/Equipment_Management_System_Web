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
          <!-- 移除"新增型号"按钮 -->
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
              <el-table-column prop="modelName" label="型号名称" width="240" sortable></el-table-column>
              <el-table-column label="点检计划" min-width="120">
                <template #default="{ row }">
                  <el-tag :type="row.inspectionPlan ? 'success' : 'warning'">
                    {{ row.inspectionPlan ? '已配置' : '未配置' }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="120" fixed="right">
                <template #default="{ row }">
                  <!-- 只保留"点检计划"按钮，移除其他按钮 -->
                  <el-button type="text" size="small" @click.stop="showInspectionPlanDialog(row)">点检计划</el-button>
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

    <!-- 点检计划配置弹窗 -->
    <el-dialog
        v-model="inspectionPlanDialogVisible"
        :title="`${currentModel?.modelCode || ''} 点检计划配置`"
        width="90%"
        top="5vh"
        :close-on-click-modal="false"
    >
      <div class="inspection-plan-container">
        <el-form :model="inspectionPlanForm" label-width="120px">
          <el-form-item label="计划名称" required>
            <el-input v-model="inspectionPlanForm.name" placeholder="请输入点检计划名称" />
          </el-form-item>

          <el-form-item label="巡检人" required>
            <el-select
                v-model="inspectionPlanForm.inspector"
                multiple
                filterable
                allow-create
                default-first-option
                placeholder="请选择或输入巡检人"
                style="width: 100%"
            >
              <el-option
                  v-for="person in inspectorOptions"
                  :key="person"
                  :label="person"
                  :value="person"
              />
            </el-select>
          </el-form-item>

          <el-form-item label="执行频率" required>
            <el-radio-group v-model="inspectionPlanForm.frequencyType">
              <el-radio label="daily">每天一次</el-radio>
              <el-radio label="multiple">一天多次</el-radio>
            </el-radio-group>
          </el-form-item>

          <el-form-item
              label="执行时间"
              required
              v-if="inspectionPlanForm.frequencyType === 'daily'"
          >
            <el-time-picker
                v-model="inspectionPlanForm.singleTime"
                format="HH:mm"
                value-format="HH:mm"
                placeholder="选择时间"
            />
          </el-form-item>

          <el-form-item
              label="执行时间点"
              required
              v-if="inspectionPlanForm.frequencyType === 'multiple'"
          >
            <el-time-select
                v-model="inspectionPlanForm.multipleTimes"
                multiple
                placeholder="选择多个时间点"
                start="08:00"
                end="22:00"
                step="00:30"
                format="HH:mm"
            />
          </el-form-item>

          <el-form-item label="循环周期（天）" required>
            <el-input-number
                v-model="inspectionPlanForm.cycle"
                :min="1"
                :step="1"
                style="width: 100%"
                placeholder="输入循环周期"
            />
          </el-form-item>

          <el-form-item label="启用状态">
            <el-switch v-model="inspectionPlanForm.enabled" />
          </el-form-item>
        </el-form>

        <div style="margin-top: 20px;">
          <el-tabs v-model="inspectionTab">
            <el-tab-pane label="自动点检项" name="auto">
              <!-- 移除添加按钮，自动点检项不可新增 -->
              <el-table
                  :data="inspectionPlanForm.autoItems"
                  border
                  style="width: 100%;"
              >
                <el-table-column label="序号" type="index" width="60"></el-table-column>
                <el-table-column label="参数选择" width="200">
                  <template #default="{ row }">
                    <!-- 设置为禁用状态，不可修改 -->
                    <el-select v-model="row.paramId" disabled>
                      <el-option
                          v-for="param in paramTable"
                          :key="param.id"
                          :label="param.name"
                          :value="param.id"
                      />
                    </el-select>
                  </template>
                </el-table-column>
                <el-table-column label="检查条件" width="200">
                  <template #default="{ row }">
                    <!-- 设置为禁用状态，不可修改 -->
                    <el-select v-model="row.condition" disabled>
                      <el-option label="等于" value="eq" />
                      <el-option label="大于" value="gt" />
                      <el-option label="小于" value="lt" />
                      <el-option label="大于等于" value="gte" />
                      <el-option label="小于等于" value="lte" />
                      <el-option label="在范围内" value="between" />
                    </el-select>
                  </template>
                </el-table-column>
                <el-table-column label="目标值" width="150">
                  <template #default="{ row }">
                    <!-- 设置为禁用状态，不可修改 -->
                    <el-input v-model="row.targetValue" placeholder="输入目标值" disabled />
                  </template>
                </el-table-column>
                <el-table-column label="操作" width="100">
                  <!-- 移除删除按钮，自动点检项不可删除 -->
                </el-table-column>
              </el-table>
            </el-tab-pane>

            <el-tab-pane label="手动点检项" name="manual">
              <el-button
                  type="primary"
                  size="small"
                  @click="addManualInspectionItem"
                  style="margin-bottom: 10px;"
              >
                添加手动点检项
              </el-button>
              <el-table
                  :data="inspectionPlanForm.manualItems"
                  border
                  style="width: 100%;"
              >
                <el-table-column label="序号" type="index" width="60"></el-table-column>
                <el-table-column label="点检项名称" width="200">
                  <template #default="{ row }">
                    <el-input v-model="row.name" placeholder="输入点检项名称" />
                  </template>
                </el-table-column>
                <el-table-column label="点检内容" width="250">
                  <template #default="{ row }">
                    <el-input
                        v-model="row.content"
                        placeholder="输入点检内容"
                        type="textarea"
                        :rows="2"
                    />
                  </template>
                </el-table-column>
                <el-table-column label="值类型" width="120">
                  <template #default="{ row }">
                    <el-select v-model="row.valueType" size="small" @change="handleValueTypeChange(row)">
                      <el-option label="文本" value="text" />
                      <el-option label="数值" value="number" />
                    </el-select>
                  </template>
                </el-table-column>
                <el-table-column label="下限" width="120">
                  <template #default="{ row }">
                    <el-input-number
                        v-if="row.valueType === 'number'"
                        v-model="row.minValue"
                        :precision="2"
                        size="small"
                        style="width: 100%"
                    />
                    <span v-else>-</span>
                  </template>
                </el-table-column>
                <el-table-column label="上限" width="120">
                  <template #default="{ row }">
                    <el-input-number
                        v-if="row.valueType === 'number'"
                        v-model="row.maxValue"
                        :precision="2"
                        size="small"
                        style="width: 100%"
                    />
                    <span v-else>-</span>
                  </template>
                </el-table-column>
                <el-table-column label="必须拍照" width="100" align="center">
                  <template #default="{ row }">
                    <el-checkbox v-model="row.requireImage" />
                  </template>
                </el-table-column>
                <el-table-column label="操作" width="100">
                  <template #default="{ $index }">
                    <el-button
                        type="danger"
                        size="small"
                        icon="delete"
                        @click="removeManualInspectionItem($index)"
                    />
                  </template>
                </el-table-column>
              </el-table>
            </el-tab-pane>
          </el-tabs>
        </div>

        <div style="margin-top: 20px; display: flex; justify-content: flex-end; gap: 10px;">
          <el-button @click="exportInspectionPlan">导出计划</el-button>
          <el-button type="warning" @click="importInspectionPlan">导入计划</el-button>
        </div>
      </div>

      <template #footer>
        <el-button @click="inspectionPlanDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveInspectionPlan">保存计划</el-button>
      </template>
    </el-dialog>

    <!-- 导入点检计划弹窗 -->
    <el-dialog
        v-model="importInspectionDialogVisible"
        title="导入点检计划"
        width="500px"
    >
      <el-input
          type="textarea"
          :rows="10"
          v-model="importInspectionJson"
          placeholder="请粘贴JSON格式的点检计划配置"
      />
      <template #footer>
        <el-button @click="importInspectionDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmImportInspection">确认导入</el-button>
      </template>
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
  ElButtonGroup,
  ElTimePicker,
  ElTimeSelect,
  ElTabs,
  ElTabPane
} from 'element-plus'
import Sortable from 'sortablejs' // 需安装：npm install sortablejs

// 导入API
import {
  getDeviceTree
} from '@/api/equipment/EquipmentLedger'

// 导入API
import {
  getProductModelsByDevice
} from '@/api/equipment/equipmentConfig.js'

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
  modelCode: '',
  modelName: ''
})
const productFormRef = ref(null)
// 参数配置弹窗
const paramDialogVisible = ref(false)
const paramViewMode = ref('list') // 'list' 或 'json'
const paramJson = ref('')
// 参数模板选项
const templateOptions = ref([
  {
    value: '1',
    label: '产品型号1',
    children: [
      { value: '11', label: '模板1' },
      { value: '12', label: '模板2' }
    ]
  },
  {
    value: '2',
    label: '产品型号2',
    children: [
      { value: '21', label: '模板1' },
      { value: '22', label: '模板2' }
    ]
  },
  {
    value: '3',
    label: '产品型号3',
    children: [
      { value: '31', label: '模板1' },
      { value: '32', label: '模板2' }
    ]
  },
  {
    value: '4',
    label: '产品型号4',
    children: [
      { value: '41', label: '模板1' },
      { value: '42', label: '模板2' }
    ]
  },
  {
    value: '5',
    label: '产品型号5',
    children: [
      { value: '51', label: '模板1' },
      { value: '52', label: '模板2' }
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

// 点检计划相关
const inspectionPlanDialogVisible = ref(false)
const importInspectionDialogVisible = ref(false)
const importInspectionJson = ref('')
const inspectionTab = ref('auto')
// 巡检人选项
const inspectorOptions = ref(['张三', '李四', '王五', '赵六'])
// 点检计划表单
const inspectionPlanForm = reactive({
  name: '',
  inspector: [], // 巡检人
  frequencyType: 'daily', // daily: 每天一次, multiple: 一天多次
  singleTime: '10:00',
  multipleTimes: ['08:00', '12:00', '16:00'],
  cycle: 1,
  enabled: true,
  autoItems: [],
  manualItems: [] // 手动点检项
})

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
}

// 选择设备（仅设备类型有效）
const handleDeviceChange = (device) => {
  if (!device || device.type !== 'device') return
  currentDevice.value = device
  currentModel.value = null
  paramTable.value = []
  loadProductModels(device.id) // 加载该设备的产品型号
}

// 加载产品型号（真实API调用）
const loadProductModels = async (deviceId) => {
  productLoading.value = true
  try {
    const response = await getProductModelsByDevice(deviceId)
    if (response.data.code === 'success') {
      // 为每个产品型号添加点检计划状态（假数据）
      productModels.value = response.data.data.productModels.map(model => ({
        ...model,
        inspectionPlan: Math.random() > 0.5 // 随机生成点检计划状态
      }))
    } else {
      ElMessage.error('获取产品型号失败: ' + response.data.msg)
      productModels.value = []
    }
  } catch (error) {
    ElMessage.error('加载产品型号失败: ' + error.message)
    productModels.value = []
  } finally {
    productLoading.value = false
  }
}

// 选择产品型号
const selectProductModel = (model) => {
  currentModel.value = model
}

// 显示点检计划配置弹窗
const showInspectionPlanDialog = (model) => {
  currentModel.value = model
  inspectionPlanDialogVisible.value = true

  // 初始化点检计划表单
  Object.assign(inspectionPlanForm, {
    name: `${model.modelCode} 点检计划`,
    inspector: ['张三'], // 默认巡检人
    frequencyType: 'daily',
    singleTime: '10:00',
    multipleTimes: ['08:00', '12:00', '16:00'],
    cycle: 1,
    enabled: true,
    autoItems: [],
    manualItems: []
  })

  // 如果模型已有点检计划，加载它
  if (model.inspectionPlan) {
    // 这里模拟从后端加载数据
    inspectionPlanForm.autoItems = [
      {
        id: 1,
        paramId: 2,
        condition: 'between',
        targetValue: '40-80'
      },
      {
        id: 2,
        paramId: 3,
        condition: 'gte',
        targetValue: '0.3'
      }
    ]

    inspectionPlanForm.manualItems = [
      {
        id: 1,
        name: '设备外观检查',
        content: '检查设备表面是否有损伤、锈蚀等情况',
        valueType: 'text',
        requireImage: true
      },
      {
        id: 2,
        name: '温度检查',
        content: '检查设备运行温度是否正常',
        valueType: 'number',
        minValue: 20,
        maxValue: 80,
        requireImage: false
      }
    ]
  }

  // 加载当前模型的参数以便在自动点检项中选择
  loadModelParams(model)
}

// 加载模型参数（替代原showParamConfigDialog方法，仅加载不显示弹窗）
const loadModelParams = (model) => {
  paramLoading.value = true

  // 模拟参数数据
  setTimeout(() => {
    paramTable.value = [
      {
        id: 1,
        name: '清洗时间',
        type: 'number',
        registerAddress: '0x1001',
        default: 30,
        minValue: 10,
        maxValue: 60,
        unit: 's',
        required: true
      },
      {
        id: 2,
        name: '清洗温度',
        type: 'number',
        registerAddress: '0x1002',
        default: 60,
        minValue: 40,
        maxValue: 80,
        unit: '℃',
        required: true
      },
      {
        id: 3,
        name: '喷淋压力',
        type: 'number',
        registerAddress: '0x1003',
        default: 0.3,
        minValue: 0.1,
        maxValue: 0.5,
        unit: 'MPa',
        required: false
      }
    ]
    paramLoading.value = false
  }, 800)
}

// 处理手动点检项值类型变化
const handleValueTypeChange = (row) => {
  if (row.valueType === 'text') {
    // 文本类型不需要上下限
    row.minValue = null
    row.maxValue = null
  }
}

// 移除产品型号相关方法（新增、编辑、删除等）

// 点检计划相关方法 - 移除自动点检项相关操作方法
const addManualInspectionItem = () => {
  inspectionPlanForm.manualItems.push({
    id: Date.now(),
    name: '',
    content: '',
    valueType: 'text',
    minValue: null,
    maxValue: null,
    requireImage: false
  })
}

const removeManualInspectionItem = (index) => {
  inspectionPlanForm.manualItems.splice(index, 1)
}

const saveInspectionPlan = () => {
  console.log('保存点检计划：', inspectionPlanForm)
  // 更新模型的点检计划状态
  if (currentModel.value) {
    const index = productModels.value.findIndex(m => m.id === currentModel.value.id)
    if (index !== -1) {
      productModels.value[index].inspectionPlan = true
    }
  }
  ElMessage.success('点检计划已保存！')
  inspectionPlanDialogVisible.value = false
}

const exportInspectionPlan = () => {
  try {
    const jsonStr = JSON.stringify(inspectionPlanForm, null, 2)
    navigator.clipboard.writeText(jsonStr)
    ElMessage.success('点检计划已导出到剪贴板')
  } catch (err) {
    ElMessage.error('导出失败: ' + err.message)
  }
}

const importInspectionPlan = () => {
  importInspectionDialogVisible.value = true
  importInspectionJson.value = ''
}

const confirmImportInspection = () => {
  try {
    const planData = JSON.parse(importInspectionJson.value)
    Object.assign(inspectionPlanForm, planData)
    importInspectionDialogVisible.value = false
    ElMessage.success('点检计划导入成功')
  } catch (err) {
    ElMessage.error('导入失败: 无效的JSON格式')
  }
}

// 初始化
onMounted(() => {
  initDeviceTree()
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

.param-list-view,
.param-json-view {
  flex: 1;
  overflow: auto;
}

/* 点检计划弹窗样式 */
.inspection-plan-container {
  height: 70vh;
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

  .device-panel,
  .model-panel {
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
