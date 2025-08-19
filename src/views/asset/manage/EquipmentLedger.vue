<template>
  <div class="app-container">
    <!-- 过滤条件区 -->
    <div class="filter-container">
      <el-form :model="filterForm" class="filter-form">
        <!-- 基础筛选项 -->
        <el-form-item label="设备编码">
          <el-input
              v-model="filterForm.deviceCode"
              placeholder="请输入设备编码"
              clearable
              @input="handleSearch"
          ></el-input>
        </el-form-item>
        <el-form-item label="状态">
          <el-select
              v-model="filterForm.status"
              multiple
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
        <el-form-item label="设备名称">
          <el-input
              v-model="filterForm.name"
              placeholder="请输入设备名称"
              clearable
              @input="handleSearch"
          ></el-input>
        </el-form-item>
        <el-form-item label="寿命上限">
          <el-select
              v-model="filterForm.lifespan"
              placeholder="请选择寿命上限"
              clearable
              @change="handleSearch"
          >
            <el-option label="1年" value="1"></el-option>
            <el-option label="2年" value="2"></el-option>
            <el-option label="3年" value="3"></el-option>
            <el-option label="4年" value="4"></el-option>
            <el-option label="5年及以上" value="5"></el-option>
          </el-select>
        </el-form-item>

        <!-- 三级筛选（车间/产线/工段）- 搜索部分保持原样 -->
        <el-form-item label="车间">
          <el-select
              v-model="filterForm.workshop"
              placeholder="请选择车间"
              clearable
              @change="handleWorkshopChange"
          >
            <el-option
                v-for="ws in workshopOptions"
                :key="ws"
                :label="`${ws}车间`"
                :value="ws"
            ></el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="产线">
          <el-select
              v-model="filterForm.line"
              multiple
              placeholder="请选择产线"
              clearable
              :disabled="!filterForm.workshop"
              @change="handleLineChange"
          >
            <el-option
                v-for="line in lineOptions"
                :key="line"
                :label="`${line}产线`"
                :value="line"
            ></el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="工段">
          <el-select
              v-model="filterForm.segment"
              multiple
              placeholder="请选择工段"
              clearable
              :disabled="!filterForm.workshop"
              @change="handleSearch"
          >
            <el-option
                v-for="segment in segmentOptions"
                :key="segment"
                :label="segment"
                :value="segment"
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
        <div class="total-text">共 {{ pagination.total }} 台设备</div>
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
      >
        <el-table-column prop="name" label="设备/段/产线/车间" min-width="200">
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
              {{ row.lifespan ? `${row.lifespan}年` : '-' }}
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

      <!-- 分页控件 -->
      <div class="pagination" v-if="pagination.total > 0">
        <el-pagination
            :current-page="pagination.page"
            :page-size="pagination.size"
            :total="pagination.total"
            layout="total, sizes, prev, pager, next, jumper"
            :page-sizes="[10, 20, 50, 100]"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
        ></el-pagination>
      </div>
    </div>

    <!-- 新增/编辑设备弹窗 -->
    <el-dialog
        v-model="dialogVisible"
        :title="isEditMode ? '编辑设备' : '新增设备'"
        width="900px"
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
          <div class="form-grid">
            <el-form :model="deviceForm" label-width="100px" label-position="top">
              <!-- 弹窗内三级选择器保留 -->
              <el-form-item label="车间" required>
                <el-select
                    v-model="deviceForm.workshop"
                    placeholder="请选择车间"
                    clearable
                    @change="handleDialogWorkshopChange"
                    :disabled="isEditMode"
                >
                  <el-option
                      v-for="ws in workshopOptions"
                      :key="ws"
                      :label="`${ws}车间`"
                      :value="ws"
                  ></el-option>
                </el-select>
              </el-form-item>

              <el-form-item label="产线" required>
                <el-select
                    v-model="deviceForm.line"
                    placeholder="请选择产线"
                    clearable
                    :disabled="!deviceForm.workshop || isEditMode"
                >
                  <el-option
                      v-for="line in dialogLineOptions"
                      :key="line"
                      :label="`${line}产线`"
                      :value="line"
                  ></el-option>
                </el-select>
              </el-form-item>

              <el-form-item label="工段" required>
                <el-select
                    v-model="deviceForm.segment"
                    placeholder="请选择工段"
                    clearable
                    :disabled="!deviceForm.workshop || isEditMode"
                >
                  <el-option
                      v-for="segment in segmentOptions"
                      :key="segment"
                      :label="segment"
                      :value="segment"
                  ></el-option>
                </el-select>
              </el-form-item>

              <!-- 显示合并后的区域名称 -->
              <el-form-item label="区域名称" v-if="deviceForm.workshop || deviceForm.line || deviceForm.segment">
                <el-input
                    v-model="computedAreaName"
                    placeholder="区域名称"
                    disabled
                ></el-input>
              </el-form-item>

              <el-form-item label="设备名称" required>
                <el-input v-model="deviceForm.name" placeholder="请输入设备名称"></el-input>
              </el-form-item>
              <el-form-item label="设备编码" required>
                <el-input v-model="deviceForm.deviceCode" placeholder="请输入设备唯一编码"></el-input>
              </el-form-item>
              <el-form-item label="资产编码">
                <el-input v-model="deviceForm.assetCode" placeholder="请输入资产编码"></el-input>
              </el-form-item>
            </el-form>

            <el-form :model="deviceForm" label-width="100px" label-position="top">
              <el-form-item label="厂商" required>
                <el-input v-model="deviceForm.manufacturer" placeholder="请输入厂商名称"></el-input>
              </el-form-item>
              <el-form-item label="类别">
                <el-select v-model="deviceForm.category" placeholder="请选择设备类别">
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
            </el-form>

            <el-form :model="deviceForm" label-width="100px" label-position="top">
              <el-form-item label="寿命上限">
                <el-select v-model="deviceForm.lifespan" placeholder="请选择寿命上限">
                  <el-option label="1年" value="1"></el-option>
                  <el-option label="2年" value="2"></el-option>
                  <el-option label="3年" value="3"></el-option>
                  <el-option label="4年" value="4"></el-option>
                  <el-option label="5年及以上" value="5"></el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="入库时间">
                <el-date-picker
                    v-model="deviceForm.inTime"
                    type="date"
                    placeholder="选择日期"
                    value-format="YYYY-MM-DD"
                ></el-date-picker>
              </el-form-item>
              <el-form-item label="入库负责人">
                <el-input v-model="deviceForm.inCharge" placeholder="请输入负责人姓名"></el-input>
              </el-form-item>
              <el-form-item label="验收时间">
                <el-date-picker
                    v-model="deviceForm.acceptTime"
                    type="date"
                    placeholder="选择日期"
                    value-format="YYYY-MM-DD"
                ></el-date-picker>
              </el-form-item>
              <el-form-item label="验收人">
                <el-input v-model="deviceForm.acceptor" placeholder="请输入验收人姓名"></el-input>
              </el-form-item>
            </el-form>
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
                      <el-button type="text" @click="editFile(file, 'manual', index)">编辑</el-button>
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
                      <el-button type="text" @click="editFile(file, 'drawing', index)">编辑</el-button>
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
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox, ElEmpty } from 'element-plus'
import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'
// 导入API
import {
  getDevicesByPage,
  getDeviceDetail,
  addDevice,
  updateDevice,
  removeDevice,
  getWorkshopOptions,
  getLineOptionsByWorkshop,
  getSegmentOptions
} from '@/api/eqAPI'

// 1. 核心状态管理
// 弹窗控制
const dialogVisible = ref(false)
const isEditMode = ref(false) // 区分新增/编辑模式
const currentEditId = ref(null) // 当前编辑设备ID
const isSearched = ref(false) // 是否进行过搜索

// 筛选表单
const filterForm = reactive({
  deviceCode: '',
  name: '', // Add name search field
  status: [],
  manufacturer: '',
  lifespan: '',
  workshop: '',
  line: [],
  segment: []
})

// 设备表单（新增/编辑共用）
const deviceForm = reactive({
  id: null,
  name: '',
  deviceCode: '',
  assetCode: '',
  manufacturer: '',
  category: '',
  model: '',
  status: '',
  lifespan: '',
  inTime: '',
  acceptTime: '',
  acceptor: '',
  workshop: '',
  line: '',
  segment: ''
})

// 计算属性：合并车间、产线、工段为区域名称
const computedAreaName = computed(() => {
  return getAreaName(deviceForm)
})

// 选项数据
const workshopOptions = ref([]) // 车间选项
const lineOptions = ref([]) // 产线选项
const segmentOptions = ref([]) // 工段选项
const dialogLineOptions = ref([]) // 弹窗中产线选项

// 分页配置
const pagination = reactive({
  page: 1,
  size: 20,
  total: 0
})

// 数据存储
const tableData = ref([]) // 树形表格数据
const instructionManualList = ref([]) // 说明书文件列表
const drawingList = ref([]) // 图纸文件列表
let fileIdCounter = 1 // 文件ID计数器（确保唯一）


// 2. 计算属性
// 设备状态样式映射
const getStatusClass = (status) => {
  switch (status) {
    case '已验收': return 'status-accepted'
    case '待验收': return 'status-pending'
    case '样机': return 'status-sample'
    case '闲置': return 'status-idle'
    default: return ''
  }
}

// 合并车间、产线、工段为区域名称
const getAreaName = (row) => {
  const parts = []
  if (row.workshop) parts.push(`${row.workshop}车间`)
  if (row.line) parts.push(`${row.line}产线`)
  if (row.segment) parts.push(row.segment)
  return parts.length > 0 ? parts.join('/') : '-'
}


// 3. 初始化
onMounted(() => {
  // 初始加载选项数据，但不加载设备数据
  loadOptions()
})

// 加载选项数据
const loadOptions = async () => {
  try {
    workshopOptions.value = await getWorkshopOptions()
    segmentOptions.value = await getSegmentOptions()
  } catch (error) {
    ElMessage.error('加载选项数据失败')
  }
}


// 4. 事件处理函数
// 三级筛选联动
const handleWorkshopChange = async () => {
  // 切换车间时清空产线和工段
  filterForm.line = []
  filterForm.segment = []

  if (filterForm.workshop) {
    try {
      lineOptions.value = await getLineOptionsByWorkshop(filterForm.workshop)
    } catch (error) {
      ElMessage.error('加载产线数据失败')
    }
  } else {
    lineOptions.value = []
  }

  // 触发搜索
  handleSearch()
}

const handleLineChange = () => {
  // 产线变化时触发搜索
  handleSearch()
}

// 弹窗内车间变化处理
const handleDialogWorkshopChange = async () => {
  if (deviceForm.workshop) {
    try {
      dialogLineOptions.value = await getLineOptionsByWorkshop(deviceForm.workshop)
    } catch (error) {
      ElMessage.error('加载产线数据失败')
    }
  } else {
    dialogLineOptions.value = []
    deviceForm.line = []
    deviceForm.segment = []
  }
}

// 筛选查询
const handleSearch = async () => {
  try {
    isSearched.value = true
    const params = {
      page: pagination.page,
      size: pagination.size,
      filterForm: { ...filterForm }
    }

    const result = await getDevicesByPage(params)
    tableData.value = result.list
    pagination.total = result.total
  } catch (error) {
    ElMessage.error('查询数据失败')
  }
}

// 重置筛选条件
const resetFilter = () => {
  Object.keys(filterForm).forEach(key => {
    filterForm[key] = Array.isArray(filterForm[key]) ? [] : ''
  })
  lineOptions.value = []
  isSearched.value = false
  tableData.value = []
  pagination.total = 0
}

// 刷新数据
const refreshData = () => {
  handleSearch()
  ElMessage.success('数据刷新成功')
}

// 分页事件
const handleSizeChange = (size) => {
  pagination.size = size
  pagination.page = 1
  handleSearch()
}
const handleCurrentChange = (page) => {
  pagination.page = page
  handleSearch()
}

// 设备操作（新增/编辑/删除/详情）
const handleAdd = () => {
  // 重置表单，进入新增模式
  isEditMode.value = false
  currentEditId.value = null
  Object.keys(deviceForm).forEach(key => {
    deviceForm[key] = Array.isArray(deviceForm[key]) ? [] : (key === 'id' ? null : '')
  })
  dialogLineOptions.value = []
  instructionManualList.value = []
  drawingList.value = []
  dialogVisible.value = true
}

const handleEdit = async (row) => {
  try {
    // 回显数据，进入编辑模式
    const targetDev = await getDeviceDetail(row.id)
    if (!targetDev) {
      ElMessage.error('设备数据不存在')
      return
    }

    isEditMode.value = true
    currentEditId.value = row.id
    Object.assign(deviceForm, { ...targetDev }) // 表单赋值

    // 加载弹窗内产线选项
    if (deviceForm.workshop) {
      dialogLineOptions.value = await getLineOptionsByWorkshop(deviceForm.workshop)
    }

    instructionManualList.value = []
    drawingList.value = []
    dialogVisible.value = true
  } catch (error) {
    ElMessage.error('加载设备详情失败')
  }
}

import { useRouter } from 'vue-router'

// 在setup中获取路由实例
const router = useRouter()

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
      await removeDevice(row.id)
      // 删除成功后重新查询
      handleSearch()
      ElMessage.success('设备删除成功')
    } catch (error) {
      ElMessage.error('删除设备失败')
    }
  }).catch(() => {
    ElMessage.info('已取消删除')
  })
}

// 提交设备表单（新增或编辑）
const submitDevice = async () => {
  try {
    if (isEditMode.value) {
      await updateDevice(deviceForm)
      ElMessage.success('设备更新成功')
    } else {
      // 为新设备生成ID
      deviceForm.id = Date.now()
      await addDevice(deviceForm)
      ElMessage.success('设备添加成功')
    }
    dialogVisible.value = false
    handleSearch() // 提交后重新查询
  } catch (error) {
    ElMessage.error(isEditMode.value ? '更新设备失败' : '添加设备失败')
  }
}

// 导入/导出/模板下载
const downloadTemplate = () => {
  // 生成模板表头
  const templateHeader = [
    ['车间', '产线', '段', '设备', '设备编码', '资产编码', '厂商', '类别', '型号', '状态', '区域ID', '寿命上限(年)', '入库时间', '入库负责人', '验收时间', '验收人']
  ]
  const ws = XLSX.utils.aoa_to_sheet(templateHeader)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, '设备清单模板')

  // 下载模板
  const buffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
  saveAs(blob, '设备清单导入模板.xlsx')
}

const handleImport = (file) => {
  if (!['.xlsx', '.xls'].some(ext => file.name.endsWith(ext))) {
    ElMessage.error('仅支持Excel文件（.xlsx/.xls）')
    return
  }

  ElMessageBox.confirm('确定导入此文件?', '提示', { type: 'warning' }).then(() => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result)
      const wb = XLSX.read(data, { type: 'array' })
      const ws = wb.Sheets[wb.SheetNames[0]]
      const excelData = XLSX.utils.sheet_to_json(ws, { header: 1 })

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
  const blob = new Blob([file.raw], { type: file.type === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' })
  saveAs(blob, file.name)
}

const editFile = (file, type, index) => {
  ElMessage.info(`编辑${type === 'manual' ? '说明书' : '图纸'}: ${file.name}`)
  // 实际项目中实现编辑逻辑
}

const deleteFile = (file, type, index) => {
  if (type === 'manual') {
    instructionManualList.value.splice(index, 1)
  } else {
    drawingList.value.splice(index, 1)
  }
  ElMessage.success('文件已删除')
}
</script>

<style scoped>
/* 样式保持不变，省略 */
</style>

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

.status-pending {
  background: #fdf6ec;
  color: #e6a23c;
}

.status-sample {
  background: #f0f9eb;
  color: #909399;
}

.status-idle {
  background: #fef0f0;
  color: #f56c6c;
}

/* 图标样式 */
.device-icon {
  margin-right: 8px;
  color: #409EFF;
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

/* 分页控件 */
.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

/* 弹窗样式 */
.add-device-dialog {
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.dialog-header {
  display: flex;
  align-items: center;
  padding: 20px 20px 10px;
  border-bottom: 1px solid #eee;
}

.dialog-header i {
  margin-right: 10px;
  font-size: 24px;
  color: #409EFF;
}

.dialog-header h2 {
  font-size: 20px;
  font-weight: 600;
  color: #1f2f3d;
}

.dialog-body {
  padding: 20px;
  max-height: 70vh;
  overflow-y: auto;
}

.dialog-footer {
  padding: 15px 20px;
  border-top: 1px solid #eee;
  text-align: right;
}

/* 表单分区 */
.form-section {
  margin-bottom: 25px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #409EFF;
  margin-bottom: 15px;
  padding-bottom: 8px;
  border-bottom: 1px dashed #e4e7ed;
  display: flex;
  align-items: center;
}

.section-title i {
  margin-right: 8px;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

/* 文件管理区 */
.file-manager {
  background: #f8f9fc;
  border-radius: 8px;
  padding: 15px;
  margin-top: 10px;
}

.file-section {
  margin-bottom: 20px;
}

.upload-area {
  border: 1px dashed #dcdfe6;
  border-radius: 6px;
  padding: 20px;
  text-align: center;
  cursor: pointer;
  transition: border-color 0.3s;
  background: #fafafa;
}

.upload-area:hover {
  border-color: #409EFF;
}

.upload-icon {
  font-size: 40px;
  color: #c0c4cc;
  margin-bottom: 10px;
}

.upload-text {
  color: #606266;
}

.upload-hint {
  font-size: 12px;
  color: #909399;
  margin-top: 5px;
}

/* 文件列表 */
.file-list {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  margin-top: 10px;
}

.file-card {
  width: 200px;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  overflow: hidden;
  background: #fff;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.file-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1);
}

.file-preview {
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f7fa;
}

.file-preview img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.file-preview i {
  font-size: 48px;
  color: #409EFF;
}

.pdf-icon {
  color: #e74c3c;
}

.word-icon {
  color: #2b579a;
}

.file-info {
  padding: 12px;
}

.file-name {
  font-weight: 500;
  margin-bottom: 5px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.file-meta {
  font-size: 12px;
  color: #909399;
  margin-bottom: 8px;
}

.file-actions {
  display: flex;
  justify-content: space-between;
  border-top: 1px solid #ebeef5;
  padding-top: 8px;
}

/* 修改app-container高度 */
.app-container {
  min-height: 100vh; /* 改为最小高度为视口高度 */
  height: auto;      /* 高度自动扩展 */
}

/* 为表格容器设置固定高度和滚动 */
.table-container {
  height: calc(100vh - 300px); /* 根据你的布局调整这个值 */
  overflow: auto;              /* 启用滚动 */
  padding: 0 20px 20px;
}

/* 确保表格头部固定 */
:deep(.el-table) {
  overflow: visible; /* 防止表格内部出现双滚动条 */
}

/* 固定表头 */
:deep(.el-table__header-wrapper) {
  position: sticky;
  top: 0;
  z-index: 2;
  background: white;
}
</style>
