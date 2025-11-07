<template>
  <div class="app-container">
    <!-- 过滤条件区 -->
    <div class="filter-container">
      <el-form :model="filterForm" class="filter-form">
        <!-- 基础筛选项 -->
        <el-form-item label="设备编码">
          <el-input
              v-model="filterForm.mcNumber"
              placeholder="请输入设备编码"
              clearable
              @input="handleSearch"
          ></el-input>
        </el-form-item>
        <el-form-item label="设备名称">
          <el-input
              v-model="filterForm.mcName"
              placeholder="请输入设备名称"
              clearable
              @input="handleSearch"
          ></el-input>
        </el-form-item>
        <el-form-item label="状态">
          <el-select
              v-model="filterForm.status"
              placeholder="请选择状态"
              clearable
              @change="handleSearch"
          >
            <el-option label="已验收" value="已验收"></el-option>
            <el-option label="待验收" value="待验收"></el-option>
            <el-option label="样机" value="样机"></el-option>
            <el-option label="闲置" value="闲置"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="厂商">
          <el-input
              v-model="filterForm.manufacturer"
              placeholder="请输入厂商"
              clearable
              @input="handleSearch"
          ></el-input>
        </el-form-item>
        <el-form-item label="寿命上限(年)">
          <el-input
              v-model="filterForm.maxDayDuration"
              type="number"
              min="0"
              placeholder="请输入寿命上限(年)"
              clearable
              @input="handleSearch"
          ></el-input>
        </el-form-item>

        <!-- 三级筛选（车间/产线/工段） -->
        <el-form-item label="车间">
          <el-select
              v-model="filterForm.workshopId"
              placeholder="请选择车间"
              clearable
              @change="handleWorkshopChange"
          >
            <el-option
                v-for="ws in workshopOptions"
                :key="ws.id"
                :label="ws.areaName"
                :value="ws.id"
            ></el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="产线">
          <el-select
              v-model="filterForm.lineId"
              placeholder="请选择产线"
              clearable
              :disabled="!filterForm.workshopId"
              @change="handleLineChange"
          >
            <el-option
                v-for="line in lineOptions"
                :key="line.id"
                :label="line.areaName"
                :value="line.id"
            ></el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="工段">
          <el-select
              v-model="filterForm.sectionId"
              placeholder="请选择工段"
              clearable
              :disabled="!filterForm.lineId"
              @change="handleSearch"
          >
            <el-option
                v-for="section in sectionOptions"
                :key="section.id"
                :label="section.areaName"
                :value="section.id"
            ></el-option>
          </el-select>
        </el-form-item>
      </el-form>

      <!-- 操作按钮区 -->
      <div class="operation-buttons">
        <el-button type="primary" icon="search" @click="handleSearch">查询</el-button>
        <el-button icon="refresh" @click="resetFilter">重置</el-button>
        <el-button type="success" icon="download" @click="downloadTemplate">下载模板</el-button>

        <!-- 导入数据 -->
        <el-upload
            class="upload-demo"
            action=""
            :auto-upload="false"
            :show-file-list="false"
            :on-change="handleImport"
            accept=".xlsx,.xls"
        >
          <el-button type="warning" icon="download">导入数据</el-button>
        </el-upload>

        <el-button type="info" icon="upload" @click="exportData">导出数据</el-button>
        <el-button type="primary" icon="plus" @click="handleAdd">新增设备</el-button>
      </div>
    </div>

    <!-- 设备表格区 -->
    <div class="table-container">
      <div class="table-header">
        <div class="total-text">共 {{ tableData.length }} 台设备</div>
        <el-button type="text" icon="el-icon-refresh" @click="refreshData">刷新</el-button>
      </div>

      <!-- 空数据提示 -->
      <div v-if="tableData.length === 0 && isSearched" class="empty-data-hint">
        <el-empty description="暂无符合条件的数据，请尝试调整搜索条件"></el-empty>
      </div>

      <!-- 未搜索提示 -->
      <div v-if="tableData.length === 0 && !isSearched" class="empty-data-hint">
        <el-empty description="请使用上方搜索条件进行查询"></el-empty>
      </div>

      <!-- 树形表格 -->
      <el-table
          v-if="tableData.length > 0"
          :data="tableData"
          row-key="id"
          border
          :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
          :default-expand-all="true"
          style="width: 100%"
          :row-class-name="setTableRowClass"
      >
        <el-table-column prop="name" label="设备/段/产线/车间" min-width="200">
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
              <span>{{ row.name }}</span>
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="deviceCode" label="设备编码" width="150"></el-table-column>
        <el-table-column prop="assetCode" label="资产编码" width="150"></el-table-column>
        <el-table-column prop="manufacturer" label="厂商" width="150"></el-table-column>
        <el-table-column prop="category" label="类别" width="120">
          <template #default="{ row }">
            <el-tag v-if="row.category" effect="plain">{{ row.category }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="model" label="型号" width="150"></el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <span v-if="row.status" :class="['status-tag', getStatusClass(row.status)]">
              {{ row.status }}
            </span>
          </template>
        </el-table-column>

        <!-- 合并为区域名称 -->
        <el-table-column label="区域名称" width="200">
          <template #default="{ row }">
            <span v-if="row.type === 'device'">
              {{ getAreaName(row) }}
            </span>
          </template>
        </el-table-column>

        <el-table-column prop="lifespan" label="寿命上限" width="120">
          <template #default="{ row }">
            <span v-if="row.type === 'device'">
              {{ row.lifespan ? `${Math.round(row.lifespan/365)}年` : '-' }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="maintainer" label="维修工" width="120">
          <template #default="{ row }">
            <span v-if="row.type === 'device'">
              {{ row.maintainer || '-' }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="inTime" label="入库时间" width="120" sortable></el-table-column>
        <el-table-column prop="inCharge" label="入库负责人" width="120"></el-table-column>
        <el-table-column prop="acceptTime" label="验收时间" width="120" sortable></el-table-column>
        <el-table-column prop="acceptor" label="验收人" width="120"></el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button v-if="row.type === 'device'" type="text" size="small" @click="handleEdit(row)">编辑</el-button>
            <el-button v-if="row.type === 'device'" type="text" size="small" @click="handleDetail(row)">详情</el-button>
            <el-button v-if="row.type === 'device'" type="text" size="small" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 新增/编辑设备弹窗 -->
    <el-dialog
        v-model="dialogVisible"
        :title="isEditMode ? '编辑设备' : '新增设备'"
        width="1000px"
        class="add-device-dialog"
        :close-on-click-modal="false"
    >
      <div class="dialog-header">
        <i class="el-icon-cpu"></i>
        <h2>{{ isEditMode ? '编辑设备信息' : '新增设备信息' }}</h2>
      </div>

      <div class="dialog-body">
        <!-- 设备基本信息 -->
        <div class="form-section">
          <div class="section-title">
            <i class="el-icon-document"></i>
            <span>设备基本信息</span>
          </div>

          <el-form :model="deviceForm" label-width="100px" label-position="top" class="multi-column-form">
            <el-row :gutter="20">
              <!-- 第一列 -->
              <el-col :span="12">
                <el-form-item label="车间" required>
                  <el-select
                      v-model="deviceForm.workshopId"
                      placeholder="请选择车间"
                      clearable
                      @change="handleDialogWorkshopChange"
                      :disabled="isEditMode"
                  >
                    <el-option
                        v-for="ws in workshopOptions"
                        :key="ws.id"
                        :label="ws.areaName"
                        :value="ws.id"
                    ></el-option>
                  </el-select>
                </el-form-item>

                <el-form-item label="产线" required>
                  <el-select
                      v-model="deviceForm.lineId"
                      placeholder="请选择产线"
                      clearable
                      :disabled="!deviceForm.workshopId || isEditMode"
                  >
                    <el-option
                        v-for="line in dialogLineOptions"
                        :key="line.id"
                        :label="line.areaName"
                        :value="line.id"
                    ></el-option>
                  </el-select>
                </el-form-item>

                <el-form-item label="工段" required>
                  <el-select
                      v-model="deviceForm.sectionId"
                      placeholder="请选择工段"
                      clearable
                      :disabled="!deviceForm.workshopId || isEditMode"
                  >
                    <el-option
                        v-for="section in dialogSectionOptions"
                        :key="section.id"
                        :label="section.areaName"
                        :value="section.id"
                    ></el-option>
                  </el-select>
                </el-form-item>

                <el-form-item label="区域名称" v-if="deviceForm.workshopId || deviceForm.lineId || deviceForm.sectionId">
                  <el-input
                      v-model="computedAreaName"
                      placeholder="区域名称"
                      disabled
                  ></el-input>
                </el-form-item>

                <el-form-item label="设备名称" required>
                  <el-input v-model="deviceForm.mcName" placeholder="请输入设备名称"></el-input>
                </el-form-item>

                <el-form-item label="设备编码" required>
                  <el-input v-model="deviceForm.mcNumber" placeholder="请输入设备唯一编码"></el-input>
                </el-form-item>

                <el-form-item label="资产编码">
                  <el-input v-model="deviceForm.assetNumber" placeholder="请输入资产编码"></el-input>
                </el-form-item>
              </el-col>

              <!-- 第二列 -->
              <el-col :span="12">
                <el-form-item label="厂商" required>
                  <el-input v-model="deviceForm.manufacturer" placeholder="请输入厂商名称"></el-input>
                </el-form-item>

                <el-form-item label="类别">
                  <el-select v-model="deviceForm.deviceCategory" placeholder="请选择设备类别">
                    <el-option label="清洗机" value="清洗机"></el-option>
                    <el-option label="COG机" value="COG机"></el-option>
                    <el-option label="FOG机" value="FOG机"></el-option>
                    <el-option label="AOI机" value="AOI机"></el-option>
                    <el-option label="组装机" value="组装机"></el-option>
                  </el-select>
                </el-form-item>

                <el-form-item label="型号">
                  <el-input v-model="deviceForm.model" placeholder="请输入设备型号"></el-input>
                </el-form-item>

                <el-form-item label="状态">
                  <el-select v-model="deviceForm.status" placeholder="请选择状态">
                    <el-option label="已验收" value="已验收"></el-option>
                    <el-option label="待验收" value="待验收"></el-option>
                    <el-option label="样机" value="样机"></el-option>
                    <el-option label="闲置" value="闲置"></el-option>
                  </el-select>
                </el-form-item>

                <el-form-item label="寿命上限(年)">
                  <el-input
                      v-model="deviceForm.lifespan"
                      type="number"
                      min="0"
                      placeholder="请输入寿命上限(年)"
                  ></el-input>
                </el-form-item>

                <el-form-item label="维修工">
                  <el-input v-model="deviceForm.maintainer" placeholder="请输入维修工姓名"></el-input>
                </el-form-item>
              </el-col>
            </el-row>

            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="入库时间">
                  <el-date-picker
                      v-model="deviceForm.enterFactoryTime"
                      type="date"
                      placeholder="选择日期"
                      value-format="YYYY-MM-DD"
                  ></el-date-picker>
                </el-form-item>
              </el-col>

              <el-col :span="12">
                <el-form-item label="入库负责人">
                  <el-input v-model="deviceForm.inCharge" placeholder="请输入负责人姓名"></el-input>
                </el-form-item>
              </el-col>
            </el-row>

            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="验收时间">
                  <el-date-picker
                      v-model="deviceForm.acceptTime"
                      type="date"
                      placeholder="选择日期"
                      value-format="YYYY-MM-DD"
                  ></el-date-picker>
                </el-form-item>
              </el-col>

              <el-col :span="12">
                <el-form-item label="验收人">
                  <el-input v-model="deviceForm.acceptor" placeholder="请输入验收人姓名"></el-input>
                </el-form-item>
              </el-col>
            </el-row>

            <el-row :gutter="20">
              <el-col :span="24">
                <el-form-item label="序列号">
                  <el-input v-model="deviceForm.serialNumber" placeholder="请输入设备序列号"></el-input>
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>
        </div>

        <!-- 设备图片上传 -->
        <div class="form-section">
          <div class="section-title">
            <i class="el-icon-picture"></i>
            <span>设备图片</span>
          </div>
          <div class="file-manager">
            <div class="file-section">
              <el-upload
                  action=""
                  :auto-upload="false"
                  :show-file-list="false"
                  :on-change="handleDeviceImageUpload"
                  accept=".jpg,.jpeg,.png,.gif"
              >
                <div class="upload-area">
                  <i class="el-icon-upload upload-icon"></i>
                  <div class="upload-text">点击上传设备图片</div>
                  <div class="upload-hint">支持JPG、PNG、GIF格式</div>
                </div>
              </el-upload>
            </div>
            <div v-if="deviceImageList.length > 0">
              <div class="file-list">
                <div v-for="(file, index) in deviceImageList" :key="file.id" class="file-card">
                  <div class="file-preview">
                    <img :src="file.preview" alt="设备图片预览">
                  </div>
                  <div class="file-info">
                    <div class="file-name">{{ file.name }}</div>
                    <div class="file-meta">{{ file.size }} KB</div>
                    <div class="file-actions">
                      <el-button type="text" @click="downloadFile(file)">下载</el-button>
                      <el-button type="text" @click="deleteFile(file, 'deviceImage', index)">删除</el-button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 设备说明书上传 -->
        <div class="form-section">
          <div class="section-title">
            <i class="el-icon-document-copy"></i>
            <span>设备说明书</span>
          </div>
          <div class="file-manager">
            <div class="file-section">
              <el-upload
                  action=""
                  :auto-upload="false"
                  :show-file-list="false"
                  :on-change="handleManualUpload"
                  accept=".pdf,.doc,.docx"
              >
                <div class="upload-area">
                  <i class="el-icon-upload upload-icon"></i>
                  <div class="upload-text">点击上传设备说明书</div>
                  <div class="upload-hint">支持PDF、Word文档格式</div>
                </div>
              </el-upload>
            </div>
            <div v-if="instructionManualList.length > 0">
              <div class="file-list">
                <div v-for="(file, index) in instructionManualList" :key="file.id" class="file-card">
                  <div class="file-preview">
                    <i v-if="file.type === 'pdf'" class="el-icon-document pdf-icon"></i>
                    <i v-else class="el-icon-document word-icon"></i>
                  </div>
                  <div class="file-info">
                    <div class="file-name">{{ file.name }}</div>
                    <div class="file-meta">{{ file.size }} KB</div>
                    <div class="file-actions">
                      <el-button type="text" @click="downloadFile(file)">下载</el-button>
                      <el-button type="text" @click="deleteFile(file, 'manual', index)">删除</el-button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 设备图纸上传 -->
        <div class="form-section">
          <div class="section-title">
            <i class="el-icon-picture-outline"></i>
            <span>设备图纸</span>
          </div>
          <div class="file-manager">
            <div class="file-section">
              <el-upload
                  action=""
                  :auto-upload="false"
                  :show-file-list="false"
                  :on-change="handleDrawingUpload"
                  accept=".jpg,.jpeg,.png,.gif"
              >
                <div class="upload-area">
                  <i class="el-icon-upload upload-icon"></i>
                  <div class="upload-text">点击上传设备图纸</div>
                  <div class="upload-hint">支持JPG、PNG、GIF格式</div>
                </div>
              </el-upload>
            </div>
            <div v-if="drawingList.length > 0">
              <div class="file-list">
                <div v-for="(file, index) in drawingList" :key="file.id" class="file-card">
                  <div class="file-preview">
                    <img :src="file.preview" alt="设备图纸预览">
                  </div>
                  <div class="file-info">
                    <div class="file-name">{{ file.name }}</div>
                    <div class="file-meta">{{ file.size }} KB</div>
                    <div class="file-actions">
                      <el-button type="text" @click="downloadFile(file)">下载</el-button>
                      <el-button type="text" @click="deleteFile(file, 'drawing', index)">删除</el-button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 弹窗底部按钮 -->
      <div class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitDevice">{{ isEditMode ? '更新设备' : '确认添加' }}</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import {ref, reactive, computed, onMounted} from 'vue'
import {ElMessage, ElMessageBox, ElEmpty} from 'element-plus'
import * as XLSX from 'xlsx'
import {saveAs} from 'file-saver'
import {useRouter} from 'vue-router'

// 导入API
import {
  getAreaTree,
  getChildAreas,
  getDeviceTree,
  updateDevice,
  deleteDevice,
  getDeviceDetail,
  addDeviceWithFiles,
  updateDeviceWithFiles
} from '@/api/equipment/EquipmentLedger'

// 在setup中获取路由实例
const router = useRouter()

// 1. 核心状态管理
// 弹窗控制
const dialogVisible = ref(false)
const isEditMode = ref(false) // 区分新增/编辑模式
const currentEditId = ref(null) // 当前编辑设备ID
const isSearched = ref(false) // 是否进行过搜索

// 筛选表单
const filterForm = reactive({
  mcNumber: '',
  mcName: '',
  status: '',
  manufacturer: '',
  maxDayDuration: '',
  workshopId: '',
  lineId: '',
  sectionId: ''
})

// 设备表单（新增/编辑共用）
const deviceForm = reactive({
  id: null,
  mcName: '',
  mcNumber: '',
  assetNumber: '',
  manufacturer: '',
  deviceCategory: '',
  model: '',
  status: '',
  lifespan: '',
  enterFactoryTime: '',
  inCharge: '',
  acceptTime: '',
  acceptor: '',
  workshopId: '',
  lineId: '',
  sectionId: '',
  maintainer: '', // 维修工字段
  serialNumber: '' // 序列号字段
})

// 计算属性：合并车间、产线、工段为区域名称
const computedAreaName = computed(() => {
  return getAreaName(deviceForm)
})

// 选项数据
const workshopOptions = ref([]) // 车间选项
const lineOptions = ref([]) // 产线选项
const sectionOptions = ref([]) // 工段选项
const dialogLineOptions = ref([]) // 弹窗中产线选项
const dialogSectionOptions = ref([]) // 弹窗中工段选项

// 数据存储
const tableData = ref([]) // 树形表格数据
const deviceImageList = ref([]) // 设备图片文件列表
const instructionManualList = ref([]) // 说明书文件列表
const drawingList = ref([]) // 图纸文件列表
let fileIdCounter = 1 // 文件ID计数器（确保唯一）

// 2. 计算属性
// 设备状态样式映射
const getStatusClass = (status) => {
  switch (status) {
    case '已验收':
      return 'status-accepted'
    case '待验收':
      return 'status-pending'
    case '样机':
      return 'status-sample'
    case '闲置':
      return 'status-idle'
    default:
      return ''
  }
}

// 新增辅助函数：从节点路径获取车间名称
const getWorkshopNameFromPath = (node) => {
  // 如果当前节点就是车间，直接返回
  if (node.areaType === 'WORKSHOP') {
    return node.areaName
  }
  // 递归向上查找车间节点
  let current = node
  while (current && current.areaType !== 'WORKSHOP') {
    // 在实际项目中，这里需要根据parentId向上查找
    // 由于API响应是树形结构，我们可以通过遍历整个树来找到对应的车间
    break // 简化实现
  }
  return node.areaName // 简化返回当前节点名称
}

// 新增辅助函数：从节点路径获取产线名称
const getLineNameFromPath = (node) => {
  if (node.areaType === 'LINE') {
    return node.areaName
  }
  // 如果是工段节点，其父节点就是产线
  if (node.areaType === 'SECTION') {
    // 这里需要根据实际情况获取产线名称
    // 简化实现
    return '对应产线'
  }
  return ''
}

// 合并车间、产线、工段为区域名称
const getAreaName = (row) => {
  if (row.type === 'device') {
    // 使用完整的区域路径
    return row.fullAreaPath || '-'
  }
  return '-'
}

// 3. 初始化
onMounted(() => {
  // 初始加载选项数据
  loadWorkshopOptions()
})

// 加载车间选项
const loadWorkshopOptions = async () => {
  try {
    const response = await getAreaTree()
    workshopOptions.value = response.data.data
  } catch (error) {
    ElMessage.error('加载车间数据失败: ' + error.message)
  }
}

// 加载产线选项
const loadLineOptions = async (workshopId) => {
  try {
    const response = await getChildAreas(workshopId)
    lineOptions.value = response.data.data
  } catch (error) {
    ElMessage.error('加载产线数据失败: ' + error.message)
  }
}

// 加载工段选项
const loadSectionOptions = async (lineId) => {
  try {
    const response = await getChildAreas(lineId)
    sectionOptions.value = response.data.data
  } catch (error) {
    ElMessage.error('加载工段数据失败: ' + error.message)
  }
}

// 4. 事件处理函数
// 三级筛选联动
const handleWorkshopChange = async () => {
  // 切换车间时清空产线和工段
  filterForm.lineId = ''
  filterForm.sectionId = ''
  lineOptions.value = []
  sectionOptions.value = []

  if (filterForm.workshopId) {
    await loadLineOptions(filterForm.workshopId)
  }

  // 触发搜索
  handleSearch()
}

const handleLineChange = async () => {
  // 切换产线时清空工段
  filterForm.sectionId = ''
  sectionOptions.value = []

  if (filterForm.lineId) {
    await loadSectionOptions(filterForm.lineId)
  }

  // 触发搜索
  handleSearch()
}

// 弹窗内车间变化处理
const handleDialogWorkshopChange = async () => {
  if (deviceForm.workshopId) {
    try {
      const response = await getChildAreas(deviceForm.workshopId)
      dialogLineOptions.value = response.data.data
    } catch (error) {
      ElMessage.error('加载产线数据失败: ' + error.message)
    }
  } else {
    dialogLineOptions.value = []
    deviceForm.lineId = ''
    deviceForm.sectionId = ''
  }
}

// 筛选查询
const handleSearch = async () => {
  try {
    isSearched.value = true

    // 构建请求参数
    const params = {
      currentNodeId: filterForm.workshopId || '',
      mcNumber: filterForm.mcNumber,
      mcName: filterForm.mcName,
      manufacturer: filterForm.manufacturer,
      status: filterForm.status
    }

    // 如果有寿命上限，转换为天数
    if (filterForm.maxDayDuration) {
      params.maxDayDuration = filterForm.maxDayDuration * 365
    }

    const response = await getDeviceTree(params)
    tableData.value = convertToTreeTableData(response.data.data)
  } catch (error) {
    ElMessage.error('查询数据失败: ' + error.message)
  }
}

// 将API返回的数据转换为树形表格数据
const convertToTreeTableData = (data) => {
  const convertNode = (node, parentPath = []) => {
    // 构建当前节点的路径
    const currentPath = [...parentPath, {
      id: node.id,
      name: node.areaName,
      type: node.areaType
    }]

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
        // 从路径中提取车间、产线、工段名称
        const workshop = currentPath.find(item => item.type === 'WORKSHOP')
        const line = currentPath.find(item => item.type === 'LINE')
        const section = currentPath.find(item => item.type === 'SECTION')

        tableNode.children.push({
          ...device,
          type: 'device',
          // 将设备字段映射到表格字段
          name: device.mcName,
          deviceCode: device.mcNumber,
          assetCode: device.assetNumber,
          manufacturer: device.manufacturer,
          category: device.deviceCategory,
          model: device.model,
          status: device.status,
          lifespan: device.dayDuration,
          inTime: device.enterFactoryTime,
          maintainer: device.maintainerName,
          // 完整的区域路径信息
          workshopName: workshop ? workshop.name : '',
          lineName: line ? line.name : '',
          sectionName: section ? section.name : '',
          // 完整的区域路径用于显示
          fullAreaPath: currentPath.map(item => item.name).join('-'),
          // 以下字段API未提供，暂时留空
          inCharge: '',
          acceptTime: '',
          acceptor: ''
        })
      })
    }

    // 递归处理子节点
    if (node.subNodes && node.subNodes.length > 0) {
      node.subNodes.forEach(subNode => {
        tableNode.children.push(convertNode(subNode, currentPath))
      })
    }

    return tableNode
  }

  return data.map(node => convertNode(node))
}

// 在script setup中添加（可放在"事件处理函数"区域附近）
/**
 * 为表格行添加类名：设备节点添加"device-row"，区域节点添加对应类型类名
 * @param {Object} param0 - 行数据对象
 * @returns {string} 行类名字符串
 */
const setTableRowClass = ({row}) => {
  // 设备节点添加"device-row"类
  if (row.type === 'device') {
    return 'device-row';
  }
  // 区域节点添加对应类型类名（可选，用于后续扩展）
  return `${row.type}-row`;
};

// 根据区域ID查找区域名称（简化实现，实际应根据API响应数据结构调整）
const findAreaNameById = (areaId, areaType) => {
  // 这里需要根据实际情况实现，可能需要额外的API调用或数据结构
  return ''
}

// 重置筛选条件
const resetFilter = () => {
  Object.keys(filterForm).forEach(key => {
    filterForm[key] = ''
  })
  lineOptions.value = []
  sectionOptions.value = []
  isSearched.value = false
  tableData.value = []
}

// 刷新数据
const refreshData = () => {
  handleSearch()
  ElMessage.success('数据刷新成功')
}

// 设备操作（新增/编辑/删除/详情）
const handleAdd = () => {
  // 重置表单，进入新增模式
  isEditMode.value = false
  currentEditId.value = null
  Object.keys(deviceForm).forEach(key => {
    deviceForm[key] = ''
  })
  dialogLineOptions.value = []
  dialogSectionOptions.value = []
  deviceImageList.value = []
  instructionManualList.value = []
  drawingList.value = []
  dialogVisible.value = true
}

const handleEdit = async (row) => {
  try {
    // 获取设备详情
    const response = await getDeviceDetail(row.id)
    const targetDev = response.data

    if (!targetDev) {
      ElMessage.error('设备数据不存在')
      return
    }

    isEditMode.value = true
    currentEditId.value = row.id
    Object.assign(deviceForm, {...targetDev})

    // 加载弹窗内产线选项
    if (deviceForm.workshopId) {
      const response = await getChildAreas(deviceForm.workshopId)
      dialogLineOptions.value = response.data.data
    }

    deviceImageList.value = []
    instructionManualList.value = []
    drawingList.value = []
    dialogVisible.value = true
  } catch (error) {
    ElMessage.error('加载设备详情失败: ' + error.message)
  }
}

const handleDetail = (row) => {
  // 跳转到设备详情页，传递设备编码作为参数
  router.push({
    path: '/asset/manage/index',
    query: {
      code: row.deviceCode
    }
  })
}

const handleDelete = async (row) => {
  ElMessageBox.confirm(`确定删除设备【${row.name}】?`, '删除确认', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      // 调用API删除设备
      await deleteDevice(row.id)
      // 删除成功后重新查询
      handleSearch()
      ElMessage.success('设备删除成功')
    } catch (error) {
      ElMessage.error('删除设备失败: ' + error.message)
    }
  }).catch(() => {
    ElMessage.info('已取消删除')
  })
}

// 提交设备表单（新增或编辑）
const submitDevice = async () => {
  try {
    // 创建FormData对象
    const formData = new FormData()

    // 添加设备数据 - 指定为JSON类型
    const deviceData = {
      ...deviceForm,
      dayDuration: deviceForm.lifespan ? deviceForm.lifespan * 365 : null
    }

    // 创建一个Blob对象，指定内容类型为application/json
    const deviceBlob = new Blob(
        [JSON.stringify(deviceData)],
        {type: 'application/json'}
    )

    // 添加device字段，使用Blob对象并指定文件名（某些后端需要）
    formData.append('device', deviceBlob, 'device.json')

    // 添加设备图片
    if (deviceImageList.value.length > 0) {
      deviceImageList.value.forEach(file => {
        formData.append('deviceImage', file.raw)
      })
    }

    // 添加说明书文件
    if (instructionManualList.value.length > 0) {
      instructionManualList.value.forEach(file => {
        formData.append('manualFiles', file.raw)
      })
    }

    // 添加图纸文件
    if (drawingList.value.length > 0) {
      drawingList.value.forEach(file => {
        formData.append('drawingFiles', file.raw)
      })
    }

    if (isEditMode.value) {
      // 调用API更新设备（带文件）
      await updateDeviceWithFiles(currentEditId.value, formData)
      ElMessage.success('设备更新成功')
    } else {
      // 调用API新增设备（带文件）
      await addDeviceWithFiles(formData)
      ElMessage.success('设备添加成功')
    }

    dialogVisible.value = false
    handleSearch() // 提交后重新查询
  } catch (error) {
    ElMessage.error(isEditMode.value ? '更新设备失败' : '添加设备失败')
    console.error(error)
  }
}

// 导入/导出/模板下载
const downloadTemplate = () => {
  // 生成模板表头，添加维修工列
  const templateHeader = [
    ['车间', '产线', '段', '设备', '设备编码', '资产编码', '厂商', '类别', '型号', '状态', '区域ID', '寿命上限(年)', '维修工', '入库时间', '入库负责人', '验收时间', '验收人', '序列号']
  ]
  const ws = XLSX.utils.aoa_to_sheet(templateHeader)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, '设备清单模板')

  // 下载模板
  const buffer = XLSX.write(wb, {bookType: 'xlsx', type: 'array'})
  const blob = new Blob([buffer], {type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'})
  saveAs(blob, '设备清单导入模板.xlsx')
}

const handleImport = (file) => {
  if (!['.xlsx', '.xls'].some(ext => file.name.endsWith(ext))) {
    ElMessage.error('仅支持Excel文件（.xlsx/.xls）')
    return
  }

  ElMessageBox.confirm('确定导入此文件?', '提示', {type: 'warning'}).then(() => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result)
      const wb = XLSX.read(data, {type: 'array'})
      const ws = wb.Sheets[wb.SheetNames[0]]
      const excelData = XLSX.utils.sheet_to_json(ws, {header: 1})

      if (excelData.length < 2) {
        ElMessage.error('文件无有效数据')
        return
      }

      // 这里仅做演示，实际项目中应该调用API提交导入的数据
      ElMessage.success(`成功导入 ${excelData.length - 1} 条数据`)
      handleSearch() // 导入后重新查询
    }
    reader.readAsArrayBuffer(file.raw)
  })
}

const exportData = () => {
  // 这里仅做演示，实际项目中应该调用API获取导出数据
  ElMessage.info('准备导出数据...')
  setTimeout(() => {
    ElMessage.success('数据导出成功')
  }, 1000)
}

// 文件上传处理
const handleDeviceImageUpload = (file) => {
  // 模拟上传处理
  const reader = new FileReader()
  reader.onload = (e) => {
    const fileInfo = {
      id: fileIdCounter++,
      name: file.name,
      size: Math.round(file.size / 1024),
      preview: e.target.result,
      raw: file.raw
    }
    deviceImageList.value = [fileInfo] // 设备图片只允许一张
    ElMessage.success('设备图片上传成功')
  }
  reader.readAsDataURL(file.raw)
}

const handleManualUpload = (file) => {
  // 模拟上传处理
  const fileInfo = {
    id: fileIdCounter++,
    name: file.name,
    size: Math.round(file.size / 1024),
    type: file.name.split('.').pop().toLowerCase(),
    raw: file.raw
  }
  instructionManualList.value.push(fileInfo)
  ElMessage.success('说明书上传成功')
}

const handleDrawingUpload = (file) => {
  // 模拟上传处理
  const reader = new FileReader()
  reader.onload = (e) => {
    const fileInfo = {
      id: fileIdCounter++,
      name: file.name,
      size: Math.round(file.size / 1024),
      preview: e.target.result,
      raw: file.raw
    }
    drawingList.value.push(fileInfo)
    ElMessage.success('图纸上传成功')
  }
  reader.readAsDataURL(file.raw)
}

// 文件操作
const downloadFile = (file) => {
  // 模拟文件下载
  const blob = new Blob([file.raw], {type: file.type === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'})
  saveAs(blob, file.name)
}

const deleteFile = (file, type, index) => {
  if (type === 'deviceImage') {
    deviceImageList.value.splice(index, 1)
  } else if (type === 'manual') {
    instructionManualList.value.splice(index, 1)
  } else {
    drawingList.value.splice(index, 1)
  }
  ElMessage.success('文件已删除')
}
</script>

<style scoped>
/* 全局样式重置 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: "PingFang SC", "Microsoft YaHei", sans-serif;
}

body {
  background-color: #f5f7fa;
  color: #333;
  padding: 20px;
}

/* 容器样式 */
.app-container {
  max-width: 1600px;
  margin: 0 auto;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

/* 标题区 */
.header-title {
  text-align: center;
  padding: 20px;
  background: linear-gradient(135deg, #409EFF, #67c23a);
  color: white;
  border-radius: 8px 8px 0 0;
}

.header-title h1 {
  font-size: 28px;
  font-weight: 600;
  letter-spacing: 1px;
}

.header-title p {
  margin-top: 8px;
  opacity: 0.9;
}

/* 过滤条件区 */
.filter-container {
  background: #fff;
  padding: 20px;
  margin: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
}

.filter-form {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 15px;
}

/* 三级级联容器 */
.cascader-container {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.cascader-item {
  flex: 1;
  min-width: 200px;
}

/* 筛选标签区 */
.filter-tags {
  margin-top: 15px;
  padding: 10px;
  background: #f8f9fc;
  border-radius: 4px;
}

.filter-tag {
  margin-right: 10px;
  margin-bottom: 8px;
}

/* 操作按钮区 */
.operation-buttons {
  display: flex;
  gap: 10px;
  margin-top: 15px;
  flex-wrap: wrap;
  align-items: center;
}

.operation-buttons .el-button {
  height: 32px;
  line-height: 32px;
  padding: 0 15px;
  display: flex;
  align-items: center;
}

.operation-buttons .el-button i {
  margin-right: 5px;
}

.upload-demo {
  display: inline-flex;
}

/* 表格区 */
.table-container {
  padding: 0 20px 20px;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.total-text {
  font-size: 14px;
  color: #606266;
}

/* 树形表格行样式穿透 */
:deep(.el-table .el-table__row--level-0) {
  background-color: #f5f7fa !important;
  font-weight: 600;
}

:deep(.el-table .el-table__row--level-1) {
  background-color: #f0f9ff !important;
}

:deep(.el-table .el-table__row--level-2) {
  background-color: #fafafa !important;
}

/* 状态标签 */
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

/* 弹窗样式优化 */
.add-device-dialog .el-dialog__body {
  padding: 20px;
}

.dialog-header {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.dialog-header i {
  font-size: 24px;
  margin-right: 10px;
  color: #409EFF;
}

.dialog-header h2 {
  margin: 0;
  font-size: 18px;
  color: #303133;
}

.form-section {
  margin-bottom: 24px;
  border: 1px solid #EBEEF5;
  border-radius: 4px;
  padding: 16px;
}

.section-title {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
  font-weight: 600;
  color: #303133;
}

.section-title i {
  margin-right: 8px;
  color: #409EFF;
}

/* 多列表单样式 */
.multi-column-form .el-form-item {
  margin-bottom: 16px;
}

.multi-column-form .el-form-item__label {
  font-weight: 500;
  color: #606266;
}

/* 文件上传区域样式 */
.file-manager {
  margin-top: 16px;
}

.upload-area {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: border-color 0.2s;
  padding: 20px;
  text-align: center;
}

.upload-area:hover {
  border-color: #409EFF;
}

.upload-icon {
  font-size: 40px;
  color: #8c939d;
  margin-bottom: 10px;
}

.upload-text {
  color: #606266;
  font-size: 14px;
  margin-bottom: 5px;
}

.upload-hint {
  color: #8c939d;
  font-size: 12px;
}

.file-list {
  margin-top: 16px;
}

.file-card {
  display: flex;
  align-items: center;
  padding: 12px;
  border: 1px solid #EBEEF5;
  border-radius: 4px;
  margin-bottom: 8px;
  background-color: #fafafa;
}

.file-preview {
  width: 50px;
  height: 50px;
  margin-right: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.file-preview img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.file-preview i {
  font-size: 28px;
}

.file-preview .pdf-icon {
  color: #f56c6c;
}

.file-preview .word-icon {
  color: #409EFF;
}

.file-info {
  flex: 1;
}

.file-name {
  font-size: 14px;
  color: #303133;
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.file-meta {
  font-size: 12px;
  color: #909399;
  margin-bottom: 6px;
}

.file-actions {
  display: flex;
  gap: 12px;
}

.dialog-footer {
  text-align: right;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #EBEEF5;
}

/* 核心：隐藏设备节点的倒三角图标 */
/* 1. 样式穿透：突破scoped限制，修改表格内部元素样式 */
:deep(.el-table) {
  /* 2. 匹配设备节点行（device-row类） */

  .device-row {
    /* 3. 隐藏倒三角图标 */

    .el-table__expand-icon {
      display: none !important;
    }

    /* 4. 调整设备节点缩进（可选，避免图标隐藏后留白） */

    .el-table__cell:first-child {
      padding-left: 20px !important; /* 与区域节点子级缩进对齐，可根据实际UI调整 */
    }
  }

  /* 5. 确保区域节点倒三角正常显示（兜底，防止误隐藏） */

  .workshop-row, .line-row, .segment-row {
    .el-table__expand-icon {
      display: inline-block !important;
    }
  }
}
</style>
