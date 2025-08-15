<template>
  <div class="app-container">
    <!-- 页面标题区 -->
    <div class="header-title">
      <h1>设备台账管理系统</h1>
      <p>全面管理设备信息，实现设备全生命周期管理</p>
    </div>

    <!-- 过滤条件区 -->
    <div class="filter-container">
      <el-form :model="filterForm" class="filter-form">
        <!-- 基础筛选项 -->
        <el-form-item label="设备编码">
          <el-input
              v-model="filterForm.deviceCode"
              placeholder="请输入设备编码"
              clearable
          ></el-input>
        </el-form-item>
        <el-form-item label="状态">
          <el-select
              v-model="filterForm.status"
              multiple
              placeholder="请选择状态"
              clearable
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
          ></el-input>
        </el-form-item>
        <el-form-item label="入库负责人">
          <el-input
              v-model="filterForm.inCharge"
              placeholder="请输入入库负责人"
              clearable
          ></el-input>
        </el-form-item>
        <el-form-item label="寿命上限">
          <el-select
              v-model="filterForm.lifespan"
              placeholder="请选择寿命上限"
              clearable
          >
            <el-option label="1年" value="1"></el-option>
            <el-option label="2年" value="2"></el-option>
            <el-option label="3年" value="3"></el-option>
            <el-option label="4年" value="4"></el-option>
            <el-option label="5年及以上" value="5"></el-option>
          </el-select>
        </el-form-item>

        <!-- 三级级联筛选（车间/产线/工段） -->
        <el-form-item label="车间/产线/工段" class="cascader-container">
          <div class="cascader-item">
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
          </div>
          <div class="cascader-item">
            <el-select
                v-model="filterForm.line"
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
          </div>
          <div class="cascader-item">
            <el-select
                v-model="filterForm.segment"
                placeholder="请选择工段"
                clearable
                :disabled="!filterForm.line"
            >
              <el-option
                  v-for="segment in segmentOptions"
                  :key="segment"
                  :label="segment"
                  :value="segment"
              ></el-option>
            </el-select>
          </div>
        </el-form-item>
      </el-form>

      <!-- 已选筛选条件标签 -->
      <div class="filter-tags" v-if="activeFilters.length > 0">
        <el-tag
            v-for="filter in activeFilters"
            :key="filter.key"
            class="filter-tag"
            closable
            @close="removeFilter(filter)"
        >
          {{ filter.label }}: {{ filter.value }}
        </el-tag>
      </div>

      <!-- 操作按钮区 -->
      <div class="operation-buttons">
        <el-button type="primary" icon="el-icon-search" @click="handleSearch">查询</el-button>
        <el-button icon="el-icon-refresh" @click="resetFilter">重置</el-button>
        <el-button type="success" icon="el-icon-download" @click="downloadTemplate">下载模板</el-button>

        <!-- 导入数据 -->
        <el-upload
            class="upload-demo"
            action=""
            :auto-upload="false"
            :show-file-list="false"
            :on-change="handleImport"
            accept=".xlsx,.xls"
        >
          <el-button type="warning" icon="el-icon-upload2">导入数据</el-button>
        </el-upload>

        <el-button type="info" icon="el-icon-upload" @click="exportData">导出数据</el-button>
        <el-button type="primary" icon="el-icon-plus" @click="handleAdd">新增设备</el-button>
      </div>
    </div>

    <!-- 设备表格区 -->
    <div class="table-container">
      <div class="table-header">
        <div class="total-text">共 {{ totalDevices }} 台设备</div>
        <el-button type="text" icon="el-icon-refresh" @click="refreshData">刷新</el-button>
      </div>

      <!-- 树形表格 -->
      <el-table
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
        <el-table-column prop="workshop" label="车间" width="100">
          <template #default="{ row }">
            <span v-if="row.type === 'device'">{{ row.workshop || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="line" label="产线" width="100">
          <template #default="{ row }">
            <span v-if="row.type === 'device'">{{ row.line || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="segment" label="工段" width="120">
          <template #default="{ row }">
            <span v-if="row.type === 'device'">{{ row.segment || '-' }}</span>
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
      <div class="pagination">
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
              <!-- 弹窗内三级级联 -->
              <el-form-item label="车间/产线/工段" required>
                <div class="cascader-container">
                  <div class="cascader-item">
                    <el-select
                        v-model="deviceForm.workshop"
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
                  </div>
                  <div class="cascader-item">
                    <el-select
                        v-model="deviceForm.line"
                        placeholder="请选择产线"
                        clearable
                        :disabled="!deviceForm.workshop"
                        @change="handleLineChange"
                    >
                      <el-option
                          v-for="line in lineOptions"
                          :key="line"
                          :label="`${line}产线`"
                          :value="line"
                      ></el-option>
                    </el-select>
                  </div>
                  <div class="cascader-item">
                    <el-select
                        v-model="deviceForm.segment"
                        placeholder="请选择工段"
                        clearable
                        :disabled="!deviceForm.line"
                    >
                      <el-option
                          v-for="segment in segmentOptions"
                          :key="segment"
                          :label="segment"
                          :value="segment"
                      ></el-option>
                    </el-select>
                  </div>
                </div>
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
import { ElMessage, ElMessageBox } from 'element-plus'
import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'
// 若使用Vue Router，取消注释下方代码（替换模拟路由）
// import { useRouter } from 'vue-router'
// const router = useRouter()

// 1. 核心状态管理
// 弹窗控制
const dialogVisible = ref(false)
const isEditMode = ref(false) // 区分新增/编辑模式
const currentEditId = ref(null) // 当前编辑设备ID

// 筛选表单
const filterForm = reactive({
  deviceCode: '',
  status: [],
  inCharge: '',
  manufacturer: '',
  lifespan: '',
  workshop: '', // 车间
  line: '',     // 产线
  segment: ''   // 工段
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
  inCharge: '',
  acceptTime: '',
  acceptor: '',
  workshop: '',
  line: '',
  segment: ''
})

// 选项数据
const workshopOptions = ref(['C2', 'C3', 'C4', 'C5', 'C6']) // 车间选项
const segmentOptions = ref(['CFOG段', '贴合段', '组装段', '30米线段']) // 工段选项
const lineOptions = computed(() => {
  // 根据选中的车间动态生成产线选项
  if (!filterForm.workshop && !deviceForm.workshop) return []
  const workshop = filterForm.workshop || deviceForm.workshop
  const lineMap = {
    'C2': ['31', '32', '33', '34', '35', '36'],
    'C3': ['41', '42', '43', '44', '45', '46'],
    'C4': ['51', '52', '53', '54', '55', '56'],
    'C5': ['61', '62', '63', '64', '65', '66'],
    'C6': ['71', '72', '73', '74', '75', '76']
  }
  return lineMap[workshop] || []
})

// 分页配置
const pagination = reactive({
  page: 1,
  size: 20,
  total: 0
})

// 数据存储
const deviceList = ref([]) // 原始设备列表
const tableData = ref([]) // 树形表格数据
const instructionManualList = ref([]) // 说明书文件列表
const drawingList = ref([]) // 图纸文件列表
let fileIdCounter = 1 // 文件ID计数器（确保唯一）


// 2. 计算属性
// 已选筛选条件（用于标签显示）
const activeFilters = computed(() => {
  const filters = []
  // 基础筛选
  if (filterForm.deviceCode) filters.push({ label: '设备编码', value: filterForm.deviceCode, key: 'deviceCode' })
  if (filterForm.status.length > 0) filters.push({ label: '状态', value: filterForm.status.join(', '), key: 'status' })
  if (filterForm.manufacturer) filters.push({ label: '厂商', value: filterForm.manufacturer, key: 'manufacturer' })
  if (filterForm.inCharge) filters.push({ label: '入库负责人', value: filterForm.inCharge, key: 'inCharge' })
  if (filterForm.lifespan) filters.push({ label: '寿命上限', value: `${filterForm.lifespan}年`, key: 'lifespan' })
  // 三级筛选
  if (filterForm.workshop) filters.push({ label: '车间', value: `${filterForm.workshop}车间`, key: 'workshop' })
  if (filterForm.line) filters.push({ label: '产线', value: `${filterForm.line}产线`, key: 'line' })
  if (filterForm.segment) filters.push({ label: '工段', value: filterForm.segment, key: 'segment' })
  return filters
})

// 总设备数
const totalDevices = computed(() => deviceList.value.length)

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


// 3. 事件处理函数
// 三级筛选联动
const handleWorkshopChange = () => {
  // 切换车间时清空产线和工段
  filterForm.line = ''
  filterForm.segment = ''
  deviceForm.line = ''
  deviceForm.segment = ''
}

const handleLineChange = () => {
  // 切换产线时清空工段
  filterForm.segment = ''
  deviceForm.segment = ''
}

// 移除单个筛选条件
const removeFilter = (filter) => {
  filterForm[filter.key] = filter.key === 'status' ? [] : ''
  handleSearch() // 重新筛选
}

// 生成模拟设备数据
const generateMockData = () => {
  const categories = ['清洗机', 'COG机', 'FOG机', 'AOI机', '组装机']
  const statuses = ['已验收', '待验收', '样机', '闲置']
  const manufacturers = ['三星电子', '索尼', '松下', '西门子', '华为', '中兴', '京东方', '天马微电子']
  const models = ['X-2000', 'ProMax 3000', 'Ultra 5', 'SuperClean', 'Fusion-X', 'Quantum']
  const names = ['精密清洗设备', '全自动COG机', '高精度FOG机', '视觉检测设备', '智能组装机', '高速贴片机']
  const people = ['张三', '李四', '王五', '赵六', '钱七', '孙八']
  const lifespans = [1, 2, 3, 4, 5]

  const devices = []
  let idCounter = 1
  const workshops = ['C2', 'C3', 'C4', 'C5', 'C6']
  const lineMap = {
    'C2': ['31', '32', '33', '34', '35', '36'],
    'C3': ['41', '42', '43', '44', '45', '46'],
    'C4': ['51', '52', '53', '54', '55', '56'],
    'C5': ['61', '62', '63', '64', '65', '66'],
    'C6': ['71', '72', '73', '74', '75', '76']
  }
  const segments = ['CFOG段', '贴合段', '组装段', '30米线段']

  // 生成车间/产线/工段关联数据
  workshops.forEach(workshop => {
    // 车间直属设备
    const workshopDevCount = Math.floor(Math.random() * 3) + 1
    for (let i = 0; i < workshopDevCount; i++) {
      devices.push({
        id: idCounter++,
        workshop,
        line: null,
        segment: null,
        name: names[Math.floor(Math.random() * names.length)],
        deviceCode: `DEV-${workshop}-${1000 + i}`,
        assetCode: `AST-${Math.floor(Math.random() * 10000)}`,
        manufacturer: manufacturers[Math.floor(Math.random() * manufacturers.length)],
        category: categories[Math.floor(Math.random() * categories.length)],
        model: models[Math.floor(Math.random() * models.length)],
        status: statuses[Math.floor(Math.random() * statuses.length)],
        lifespan: lifespans[Math.floor(Math.random() * lifespans.length)],
        inTime: `2023-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
        inCharge: people[Math.floor(Math.random() * people.length)],
        acceptTime: Math.random() > 0.3 ? `2023-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}` : '',
        acceptor: Math.random() > 0.3 ? people[Math.floor(Math.random() * people.length)] : '',
        type: 'device'
      })
    }

    // 产线-工段关联设备
    lineMap[workshop].forEach(line => {
      segments.forEach(segment => {
        const segDevCount = 1 + Math.floor(Math.random() * 3)
        for (let i = 0; i < segDevCount; i++) {
          devices.push({
            id: idCounter++,
            workshop,
            line,
            segment,
            name: names[Math.floor(Math.random() * names.length)],
            deviceCode: `DEV-${workshop}-${line}-${segment.substring(0, 2)}-${100 + i}`,
            assetCode: `AST-${Math.floor(Math.random() * 10000)}`,
            manufacturer: manufacturers[Math.floor(Math.random() * manufacturers.length)],
            category: categories[Math.floor(Math.random() * categories.length)],
            model: models[Math.floor(Math.random() * models.length)],
            status: statuses[Math.floor(Math.random() * statuses.length)],
            lifespan: lifespans[Math.floor(Math.random() * lifespans.length)],
            inTime: `2023-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
            inCharge: people[Math.floor(Math.random() * people.length)],
            acceptTime: Math.random() > 0.3 ? `2023-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}` : '',
            acceptor: Math.random() > 0.3 ? people[Math.floor(Math.random() * people.length)] : '',
            type: 'device'
          })
        }
      })
    })
  })

  return devices
}

// 构建树形表格数据（车间→产线→工段→设备）
const buildTreeData = (devices) => {
  const tree = []
  let nodeIdCounter = 10000 // 非设备节点ID（避免与设备ID冲突）
  const workshops = ['C2', 'C3', 'C4', 'C5', 'C6']
  const lineMap = {
    'C2': ['31', '32', '33', '34', '35', '36'],
    'C3': ['41', '42', '43', '44', '45', '46'],
    'C4': ['51', '52', '53', '54', '55', '56'],
    'C5': ['61', '62', '63', '64', '65', '66'],
    'C6': ['71', '72', '73', '74', '75', '76']
  }
  const segments = ['CFOG段', '贴合段', '组装段', '30米线段']

  workshops.forEach(workshop => {
    // 车间节点
    const workshopNode = {
      id: nodeIdCounter++,
      name: workshop,
      type: 'workshop',
      children: []
    }

    // 车间直属设备
    const workshopDevs = devices.filter(d => d.workshop === workshop && !d.line && !d.segment)
    if (workshopDevs.length > 0) workshopNode.children.push(...workshopDevs)

    // 产线节点
    lineMap[workshop].forEach(line => {
      const lineDevs = devices.filter(d => d.workshop === workshop && d.line === line)
      if (lineDevs.length === 0) return

      const lineNode = {
        id: nodeIdCounter++,
        name: line,
        type: 'line',
        children: []
      }

      // 工段节点
      segments.forEach(segment => {
        const segDevs = lineDevs.filter(d => d.segment === segment)
        if (segDevs.length === 0) return

        lineNode.children.push({
          id: nodeIdCounter++,
          name: segment,
          type: 'segment',
          children: segDevs
        })
      })

      workshopNode.children.push(lineNode)
    })

    tree.push(workshopNode)
  })

  return tree
}

// 初始化数据
const initData = () => {
  const mockDevs = generateMockData()
  deviceList.value = mockDevs
  tableData.value = buildTreeData(mockDevs)
  pagination.total = mockDevs.length
}

// 筛选查询
const handleSearch = () => {
  const { deviceCode, status, inCharge, manufacturer, lifespan, workshop, line, segment } = filterForm
  let filteredDevs = [...deviceList.value]

  // 多条件过滤
  if (deviceCode) filteredDevs = filteredDevs.filter(d => d.deviceCode.includes(deviceCode))
  if (status.length > 0) filteredDevs = filteredDevs.filter(d => status.includes(d.status))
  if (inCharge) filteredDevs = filteredDevs.filter(d => d.inCharge.includes(inCharge))
  if (manufacturer) filteredDevs = filteredDevs.filter(d => d.manufacturer.includes(manufacturer))
  if (lifespan) filteredDevs = filteredDevs.filter(d => String(d.lifespan) === lifespan)
  if (workshop) filteredDevs = filteredDevs.filter(d => d.workshop === workshop)
  if (line) filteredDevs = filteredDevs.filter(d => d.line === line)
  if (segment) filteredDevs = filteredDevs.filter(d => d.segment === segment)

  tableData.value = buildTreeData(filteredDevs)
  pagination.total = filteredDevs.length
}

// 重置筛选条件
const resetFilter = () => {
  Object.keys(filterForm).forEach(key => {
    filterForm[key] = key === 'status' ? [] : ''
  })
  tableData.value = buildTreeData(deviceList.value)
  pagination.total = deviceList.value.length
}

// 刷新数据
const refreshData = () => {
  initData()
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
    deviceForm[key] = key === 'id' ? null : ''
  })
  instructionManualList.value = []
  drawingList.value = []
  dialogVisible.value = true
}

const handleEdit = (row) => {
  // 回显数据，进入编辑模式
  const targetDev = deviceList.value.find(d => d.id === row.id)
  if (!targetDev) {
    ElMessage.error('设备数据不存在')
    return
  }

  isEditMode.value = true
  currentEditId.value = row.id
  Object.assign(deviceForm, { ...targetDev }) // 表单赋值
  instructionManualList.value = []
  drawingList.value = []
  dialogVisible.value = true
}

const handleDetail = (row) => {
  // 模拟路由跳转（实际项目替换为下方注释代码）
  ElMessage.info(`跳转至设备详情页，编码：${row.deviceCode}`)
  // router.push({
  //   path: '/asset/manage/index',
  //   query: { deviceCode: row.deviceCode }
  // })
}

const handleDelete = (row) => {
  ElMessageBox.confirm(`确定删除设备【${row.name}】?`, '删除确认', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    deviceList.value = deviceList.value.filter(d => d.id !== row.id)
    tableData.value = buildTreeData(deviceList.value)
    pagination.total = deviceList.value.length
    ElMessage.success('设备删除成功')
  }).catch(() => {
    ElMessage.info('已取消删除')
  })
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

      // 解析Excel数据
      const importedDevs = []
      const maxId = deviceList.value.length ? Math.max(...deviceList.value.map(d => d.id)) + 1 : 1
      for (let i = 1; i < excelData.length; i++) {
        const row = excelData[i]
        if (row.length === 0) continue

        importedDevs.push({
          id: maxId + i - 1,
          workshop: row[0] || '',
          line: row[1] || null,
          segment: row[2] || null,
          name: row[3] || '',
          deviceCode: row[4] || '',
          assetCode: row[5] || '',
          manufacturer: row[6] || '',
          category: row[7] || '',
          model: row[8] || '',
          status: row[9] || '待验收',
          lifespan: row[11] || null,
          inTime: row[12] || '',
          inCharge: row[13] || '',
          acceptTime: row[14] || '',
          acceptor: row[15] || '',
          type: 'device'
        })
      }

      // 合并数据
      deviceList.value = [...deviceList.value, ...importedDevs]
      tableData.value = buildTreeData(deviceList.value)
      pagination.total = deviceList.value.length
      ElMessage.success(`成功导入 ${importedDevs.length} 条设备数据`)
    }
    reader.readAsArrayBuffer(file.raw)
  }).catch(() => {
    ElMessage.info('已取消导入')
  })
}

const exportData = () => {
  if (deviceList.value.length === 0) {
    ElMessage.warning('无数据可导出')
    return
  }

  // 格式化导出数据
  const exportDevs = deviceList.value.map(dev => ({
    车间: dev.workshop,
    产线: dev.line || '-',
    段: dev.segment || '-',
    设备: dev.name,
    设备编码: dev.deviceCode,
    资产编码: dev.assetCode || '-',
    厂商: dev.manufacturer,
    类别: dev.category || '-',
    型号: dev.model || '-',
    状态: dev.status,
    寿命上限: dev.lifespan ? `${dev.lifespan}年` : '-',
    入库时间: dev.inTime || '-',
    入库负责人: dev.inCharge || '-',
    验收时间: dev.acceptTime || '-',
    验收人: dev.acceptor || '-'
  }))

  const ws = XLSX.utils.json_to_sheet(exportDevs)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, '设备清单')

  // 下载文件
  const buffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
  saveAs(blob, `设备清单_${new Date().toLocaleDateString()}.xlsx`)
}

// 文件上传（说明书/图纸）
const handleManualUpload = (file) => {
  const fileExt = file.name.split('.').pop().toLowerCase()
  if (!['pdf', 'doc', 'docx'].includes(fileExt)) {
    ElMessage.error('仅支持PDF、Word格式文件')
    return
  }

  instructionManualList.value.push({
    id: fileIdCounter++,
    name: file.name,
    type: fileExt === 'pdf' ? 'pdf' : 'word',
    size: Math.round(file.size / 1024),
    file: file.raw,
    uploadTime: new Date().toLocaleString()
  })
  ElMessage.success('说明书上传成功')
}

const handleDrawingUpload = (file) => {
  const fileExt = file.name.split('.').pop().toLowerCase()
  if (!['jpg', 'jpeg', 'png', 'gif'].includes(fileExt)) {
    ElMessage.error('仅支持JPG、PNG、GIF格式图片')
    return
  }

  // 生成图片预览
  const reader = new FileReader()
  reader.onload = (e) => {
    drawingList.value.push({
      id: fileIdCounter++,
      name: file.name,
      type: 'image',
      size: Math.round(file.size / 1024),
      preview: e.target.result,
      file: file.raw,
      uploadTime: new Date().toLocaleString()
    })
    ElMessage.success('图纸上传成功')
  }
  reader.readAsDataURL(file.raw)
}

// 文件操作（下载/编辑/删除）
const downloadFile = (file) => {
  if (!file.file) {
    ElMessage.warning('文件不可下载')
    return
  }

  const url = URL.createObjectURL(file.file)
  const aLink = document.createElement('a')
  aLink.href = url
  aLink.download = file.name
  document.body.appendChild(aLink)
  aLink.click()
  document.body.removeChild(aLink)
  URL.revokeObjectURL(url)
  ElMessage.success(`开始下载：${file.name}`)
}

const editFile = (file, type, index) => {
  ElMessageBox.confirm('确定替换此文件?', '编辑文件', { type: 'warning' }).then(() => {
    const fileInput = document.createElement('input')
    fileInput.type = 'file'
    fileInput.accept = type === 'manual' ? '.pdf,.doc,.docx' : '.jpg,.jpeg,.png,.gif'

    fileInput.onchange = (e) => {
      const newFile = e.target.files[0]
      if (!newFile) return

      if (type === 'manual') {
        // 替换说明书
        handleManualUpload({ raw: newFile, name: newFile.name })
        instructionManualList.value.splice(index, 1)
      } else {
        // 替换图纸（带预览）
        const reader = new FileReader()
        reader.onload = (e) => {
          drawingList.value[index] = {
            ...file,
            name: newFile.name,
            size: Math.round(newFile.size / 1024),
            preview: e.target.result,
            file: newFile
          }
          ElMessage.success('图纸更新成功')
        }
        reader.readAsDataURL(newFile)
      }
    }
    fileInput.click()
  })
}

const deleteFile = (file, type, index) => {
  ElMessageBox.confirm('确定删除此文件?', '删除文件', { type: 'warning' }).then(() => {
    if (type === 'manual') {
      instructionManualList.value.splice(index, 1)
    } else {
      drawingList.value.splice(index, 1)
    }
    ElMessage.success('文件删除成功')
  })
}

// 提交设备（新增/编辑共用）
const submitDevice = () => {
  // 表单验证
  if (!deviceForm.name || !deviceForm.deviceCode || !deviceForm.manufacturer) {
    ElMessage.error('请填写必填字段：设备名称、设备编码、厂商')
    return
  }

  if (isEditMode.value) {
    // 编辑模式：更新设备
    const devIndex = deviceList.value.findIndex(d => d.id === currentEditId.value)
    if (devIndex === -1) {
      ElMessage.error('设备不存在')
      return
    }

    // 设备编码唯一性校验（排除当前编辑设备）
    const isCodeDuplicate = deviceList.value.some(
        (d, i) => i !== devIndex && d.deviceCode === deviceForm.deviceCode
    )
    if (isCodeDuplicate) {
      ElMessage.error('设备编码已存在，请使用唯一编码')
      return
    }

    deviceList.value.splice(devIndex, 1, { ...deviceList.value[devIndex], ...deviceForm })
    tableData.value = buildTreeData(deviceList.value)
    ElMessage.success('设备更新成功')
  } else {
    // 新增模式：添加设备
    if (deviceList.value.some(d => d.deviceCode === deviceForm.deviceCode)) {
      ElMessage.error('设备编码已存在，请使用唯一编码')
      return
    }

    const newDev = {
      id: deviceList.value.length ? Math.max(...deviceList.value.map(d => d.id)) + 1 : 1,
      ...deviceForm,
      type: 'device',
      manuals: instructionManualList.value.map(f => f.name),
      drawings: drawingList.value.map(f => f.name)
    }

    deviceList.value.push(newDev)
    tableData.value = buildTreeData(deviceList.value)
    pagination.total = deviceList.value.length
    ElMessage.success('设备添加成功')
  }

  // 关闭弹窗
  dialogVisible.value = false
}

// 4. 生命周期钩子
onMounted(() => {
  initData() // 页面加载时初始化模拟数据
})
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
</style>
