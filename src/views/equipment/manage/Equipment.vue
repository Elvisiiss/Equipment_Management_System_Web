<template>
  <div class="app-container">
    <!-- 页面标题 -->
    <div class="page-header">
      <div class="page-title">
        <el-icon :size="24" class="monitor-icon">
          <Monitor />
        </el-icon>
        <span>设备监控管理系统</span>
      </div>
      <div class="header-actions">
        <el-button type="primary" icon="Refresh" @click="refreshData">刷新数据</el-button>
      </div>
    </div>

    <!-- 过滤条件区 -->
    <div class="filter-container">
      <el-form :model="filterForm" class="filter-form">
        <!-- 车间、产线、工段三级筛选 -->
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

        <el-form-item label="设备状态">
          <el-select
              v-model="filterForm.status"
              multiple
              placeholder="请选择设备状态"
              clearable
              @change="handleSearch"
          >
            <el-option label="运行中" value="running"></el-option>
            <el-option label="待机" value="standby"></el-option>
            <el-option label="故障" value="fault"></el-option>
            <el-option label="离线" value="offline"></el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="点检状态">
          <el-select
              v-model="filterForm.inspectionStatus"
              placeholder="请选择点检状态"
              clearable
              @change="handleSearch"
          >
            <el-option label="已点检" value="done"></el-option>
            <el-option label="未点检" value="pending"></el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="设备编码">
          <el-input
              v-model="filterForm.deviceCode"
              placeholder="请输入设备编码"
              clearable
              @input="handleSearch"
          ></el-input>
        </el-form-item>
      </el-form>

      <!-- 操作按钮区 -->
      <div class="operation-buttons">
        <el-button type="primary" icon="Search" @click="handleSearch">查询</el-button>
        <el-button icon="Refresh" @click="resetFilter">重置</el-button>
        <el-button type="success" icon="Plus" @click="handleAdd">新增设备</el-button>
        <el-button type="warning" icon="Download" @click="downloadTemplate">下载模板</el-button>
        <el-upload
            class="upload-demo"
            action=""
            :auto-upload="false"
            :show-file-list="false"
            :on-change="handleImport"
            accept=".xlsx,.xls"
        >
          <el-button type="info" icon="Upload">导入数据</el-button>
        </el-upload>
        <el-button type="primary" icon="UploadFilled" @click="exportData">导出数据</el-button>
      </div>
    </div>

    <!-- 设备表格区 -->
    <div class="table-container">
      <div class="table-header">
        <div class="total-text">共 {{ pagination.total }} 台设备</div>
        <el-button type="text" icon="Refresh" @click="refreshData">刷新</el-button>
      </div>

      <!-- 空数据提示 -->
      <div v-if="tableData.length === 0" class="empty-data-hint">
        <el-empty :description="isSearched ? '暂无符合条件的数据，请尝试调整搜索条件' : '请使用上方搜索条件进行查询'" />
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
        <el-table-column prop="name" label="设备/段/产线/车间" min-width="240">
          <template #default="{ row }">
            <span v-if="row.type === 'workshop'">
              <el-icon class="workshop-icon">
                <OfficeBuilding />
              </el-icon>
              <span>{{ row.name }}车间</span>
            </span>
            <span v-else-if="row.type === 'line'">
              <el-icon class="line-icon">
                <SetUp />
              </el-icon>
              <span>{{ row.name }}产线</span>
            </span>
            <span v-else-if="row.type === 'segment'">
              <el-icon class="segment-icon">
                <Operation />
              </el-icon>
              <span>{{ row.name }}</span>
            </span>
            <span v-else>
              <el-icon class="device-icon">
                <Cpu />
              </el-icon>
              <span>{{ row.name }}</span>
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="deviceCode" label="设备编码" width="160" />
        <el-table-column prop="assetCode" label="资产编码" width="140" />
        <el-table-column prop="manufacturer" label="厂商" width="140" />
        <el-table-column prop="category" label="类别" width="120">
          <template #default="{ row }">
            <el-tag v-if="row.category" effect="plain">{{ row.category }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="model" label="型号" width="140" />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <span v-if="row.type === 'device'">
              <span class="status-indicator" :class="`indicator-${row.status}`"></span>
              <span>{{ statusLabels[row.status] }}</span>
            </span>
          </template>
        </el-table-column>
        <el-table-column label="产量" width="120">
          <template #default="{ row }">
            <span v-if="row.type === 'device'">{{ row.production || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="稼动率" width="140">
          <template #default="{ row }">
            <span v-if="row.type === 'device'">
              <div>{{ row.utilization || 0 }}%</div>
              <div class="utilization-bar">
                <div class="utilization-fill" :style="{ width: row.utilization + '%' }"></div>
              </div>
            </span>
          </template>
        </el-table-column>
        <el-table-column label="点检状态" width="120">
          <template #default="{ row }">
            <span v-if="row.type === 'device'">
              <span class="status-tag" :class="row.inspectionStatus === 'done' ? 'inspection-done' : 'inspection-pending'">
                {{ row.inspectionStatus === 'done' ? '已点检' : '未点检' }}
              </span>
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="areaName" label="区域名称" width="180">
          <template #default="{ row }">
            <span v-if="row.type === 'device'">{{ row.areaName || '-' }}</span>
          </template>
        </el-table-column>
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
        />
      </div>
    </div>
  </div>

  <!-- 新增/编辑设备弹窗 -->
  <el-dialog
      v-model="dialogVisible"
      :title="isEditMode ? '编辑设备' : '新增设备'"
      width="800px"
      class="add-device-dialog"
      :close-on-click-modal="false"
  >
    <div class="dialog-header">
      <el-icon class="dialog-icon">
        <Cpu />
      </el-icon>
      <h2>{{ isEditMode ? '编辑设备信息' : '新增设备信息' }}</h2>
    </div>

    <div class="dialog-body">
      <!-- 设备基本信息 -->
      <div class="form-section">
        <div class="section-title">
          <el-icon>
            <Document />
          </el-icon>
          <span>设备基本信息</span>
        </div>
        <div class="form-grid">
          <el-form :model="deviceForm" label-width="100px" label-position="top">
            <el-form-item label="车间" required>
              <el-select
                  v-model="deviceForm.workshop"
                  placeholder="请选择车间"
                  clearable
                  @change="handleDialogWorkshopChange"
              >
                <el-option
                    v-for="ws in workshopOptions"
                    :key="ws"
                    :label="`${ws}车间`"
                    :value="ws"
                />
              </el-select>
            </el-form-item>

            <el-form-item label="产线" required>
              <el-select
                  v-model="deviceForm.line"
                  placeholder="请选择产线"
                  clearable
                  :disabled="!deviceForm.workshop"
              >
                <el-option
                    v-for="line in dialogLineOptions"
                    :key="line"
                    :label="`${line}产线`"
                    :value="line"
                />
              </el-select>
            </el-form-item>

            <el-form-item label="工段" required>
              <el-select
                  v-model="deviceForm.segment"
                  placeholder="请选择工段"
                  clearable
                  :disabled="!deviceForm.workshop"
              >
                <el-option
                    v-for="segment in segmentOptions"
                    :key="segment"
                    :label="segment"
                    :value="segment"
                />
              </el-select>
            </el-form-item>
          </el-form>

          <el-form :model="deviceForm" label-width="100px" label-position="top">
            <el-form-item label="设备名称" required>
              <el-input v-model="deviceForm.name" placeholder="请输入设备名称" />
            </el-form-item>
            <el-form-item label="设备编码" required>
              <el-input v-model="deviceForm.deviceCode" placeholder="请输入设备唯一编码" />
            </el-form-item>
            <el-form-item label="资产编码">
              <el-input v-model="deviceForm.assetCode" placeholder="请输入资产编码" />
            </el-form-item>
            <el-form-item label="区域名称">
              <el-input v-model="deviceForm.areaName" placeholder="请输入区域名称" />
            </el-form-item>
          </el-form>

          <el-form :model="deviceForm" label-width="100px" label-position="top">
            <el-form-item label="厂商" required>
              <el-input v-model="deviceForm.manufacturer" placeholder="请输入厂商名称" />
            </el-form-item>
            <el-form-item label="类别">
              <el-select v-model="deviceForm.category" placeholder="请选择设备类别">
                <el-option label="清洗机" value="清洗机" />
                <el-option label="COG机" value="COG机" />
                <el-option label="FOG机" value="FOG机" />
                <el-option label="AOI机" value="AOI机" />
                <el-option label="组装机" value="组装机" />
              </el-select>
            </el-form-item>
            <el-form-item label="型号">
              <el-input v-model="deviceForm.model" placeholder="请输入设备型号" />
            </el-form-item>
            <el-form-item label="状态">
              <el-select v-model="deviceForm.status" placeholder="请选择状态">
                <el-option label="运行中" value="running" />
                <el-option label="待机" value="standby" />
                <el-option label="故障" value="fault" />
                <el-option label="离线" value="offline" />
              </el-select>
            </el-form-item>
            <el-form-item label="点检状态">
              <el-select v-model="deviceForm.inspectionStatus" placeholder="请选择点检状态">
                <el-option label="已点检" value="done" />
                <el-option label="未点检" value="pending" />
              </el-select>
            </el-form-item>
          </el-form>
        </div>
      </div>
    </div>

    <!-- 弹窗底部按钮 -->
    <template #footer>
      <el-button @click="dialogVisible = false">取消</el-button>
      <el-button type="primary" @click="submitDevice">{{ isEditMode ? '更新设备' : '确认添加' }}</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import {
  ElMessage,
  ElMessageBox,
  ElIcon
} from 'element-plus'
import {
  Monitor,
  OfficeBuilding,
  SetUp,
  Operation,
  Cpu,
  Document,
  Refresh,
  Search,
  Plus,
  Download,
  Upload,
  UploadFilled
} from '@element-plus/icons-vue'
import {
  getEquipmentList,
  addEquipment,
  updateEquipment,
  deleteEquipment,
  exportEquipmentData,
  importEquipmentData,
  downloadEquipmentTemplate
} from '@/api/EtAPI'

// 状态管理
const dialogVisible = ref(false)
const isEditMode = ref(false)
const currentEditId = ref(null)
const isSearched = ref(false)

// 状态标签映射
const statusLabels = {
  running: '运行中',
  standby: '待机',
  fault: '故障',
  offline: '离线'
}

// 筛选表单
const filterForm = reactive({
  deviceCode: '',
  status: [],
  inspectionStatus: '',
  workshop: '',
  line: [],
  segment: []
})

// 设备表单
const deviceForm = reactive({
  id: null,
  name: '',
  deviceCode: '',
  assetCode: '',
  manufacturer: '',
  category: '',
  model: '',
  status: '',
  inspectionStatus: 'pending',
  areaName: '',
  production: 0,
  utilization: 0,
  workshop: '',
  line: '',
  segment: ''
})

// 选项数据
const workshopOptions = ref(['C2', 'C3', 'C4', 'C5', 'C6'])
const lineOptions = ref([])
const segmentOptions = ref(['CFOG段', '贴合段', '组装段', '30米线段'])
const dialogLineOptions = ref([])

// 分页配置
const pagination = reactive({
  page: 1,
  size: 20,
  total: 0
})

// 表格数据
const tableData = ref([])

// 加载表格数据
const loadTableData = async () => {
  try {
    const params = {
      ...filterForm,
      page: pagination.page,
      size: pagination.size
    }
    const result = await getEquipmentList(params)
    tableData.value = result.data
    pagination.total = result.total
    isSearched.value = true
  } catch (error) {
    ElMessage.error('加载数据失败')
  }
}

// 车间变化处理
const handleWorkshopChange = () => {
  // 切换车间时清空产线和工段
  filterForm.line = []
  filterForm.segment = []

  if (filterForm.workshop) {
    // 模拟根据车间获取产线
    const startLine = parseInt(filterForm.workshop.substring(1)) * 10 + 1
    const lines = []
    for (let i = 1; i <= 6; i++) {
      lines.push(startLine + i - 1)
    }
    lineOptions.value = lines
  } else {
    lineOptions.value = []
  }

  handleSearch()
}

const handleLineChange = () => {
  handleSearch()
}

// 弹窗内车间变化处理
const handleDialogWorkshopChange = () => {
  if (deviceForm.workshop) {
    const startLine = parseInt(deviceForm.workshop.substring(1)) * 10 + 1
    const lines = []
    for (let i = 1; i <= 6; i++) {
      lines.push(startLine + i - 1)
    }
    dialogLineOptions.value = lines
  } else {
    dialogLineOptions.value = []
    deviceForm.line = ''
    deviceForm.segment = ''
  }
}

// 查询
const handleSearch = () => {
  loadTableData()
}

// 重置筛选条件
const resetFilter = () => {
  filterForm.deviceCode = ''
  filterForm.status = []
  filterForm.inspectionStatus = ''
  filterForm.workshop = ''
  filterForm.line = []
  filterForm.segment = []
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

// 设备操作
const handleAdd = () => {
  isEditMode.value = false
  currentEditId.value = null
  Object.keys(deviceForm).forEach(key => {
    deviceForm[key] = key === 'id' ? null :
        Array.isArray(deviceForm[key]) ? [] :
            (key === 'inspectionStatus' ? 'pending' : '')
  })
  dialogLineOptions.value = []
  dialogVisible.value = true
}

const handleEdit = (row) => {
  isEditMode.value = true
  currentEditId.value = row.id
  Object.assign(deviceForm, {...row})

  // 加载弹窗内产线选项
  if (deviceForm.workshop) {
    const startLine = parseInt(deviceForm.workshop.substring(1)) * 10 + 1
    const lines = []
    for (let i = 1; i <= 6; i++) {
      lines.push(startLine + i - 1)
    }
    dialogLineOptions.value = lines
  }

  dialogVisible.value = true
}

const handleDetail = (row) => {
  ElMessage.info(`查看设备详情：${row.name} (${row.deviceCode})`)
}

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(`确定删除设备【${row.name}】?`, '删除确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    await deleteEquipment(row.id)
    ElMessage.success('设备删除成功')
    handleSearch()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.info('已取消删除')
    }
  }
}

// 提交设备表单
const submitDevice = async () => {
  try {
    if (isEditMode.value) {
      await updateEquipment(deviceForm)
      ElMessage.success('设备更新成功')
    } else {
      // 为新设备生成ID
      deviceForm.id = Date.now()
      await addEquipment(deviceForm)
      ElMessage.success('设备添加成功')
    }
    dialogVisible.value = false
    handleSearch()
  } catch (error) {
    ElMessage.error(isEditMode.value ? '更新设备失败' : '添加设备失败')
  }
}

// 导入/导出
const downloadTemplate = () => {
  downloadEquipmentTemplate()
      .then(() => {
        ElMessage.success('模板下载成功')
      })
      .catch(() => {
        ElMessage.error('模板下载失败')
      })
}

const handleImport = (file) => {
  importEquipmentData(file)
      .then(() => {
        ElMessage.success('设备数据导入成功')
        handleSearch()
      })
      .catch(() => {
        ElMessage.error('设备数据导入失败')
      })
}

const exportData = () => {
  const params = { ...filterForm }
  exportEquipmentData(params)
      .then(() => {
        ElMessage.success('设备数据导出成功')
      })
      .catch(() => {
        ElMessage.error('设备数据导出失败')
      })
}

// 初始化
onMounted(() => {
  // 初始加载选项数据
  handleWorkshopChange()
})
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: "PingFang SC", "Microsoft YaHei", sans-serif;
}

.app-container {
  max-width: 1800px;
  margin: 0 auto;
  background-color: #fff;
  min-height: 100vh;
  padding: 20px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #ebeef5;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
  display: flex;
  align-items: center;
  gap: 10px;
}

/* 过滤条件区 */
.filter-container {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  margin-bottom: 20px;
}

.filter-form {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

/* 操作按钮区 */
.operation-buttons {
  display: flex;
  gap: 12px;
  margin-top: 20px;
  flex-wrap: wrap;
}

/* 表格区 */
.table-container {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  min-height: 500px;
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
  font-weight: 500;
}

/* 树形表格样式 */
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
  display: inline-block;
  min-width: 60px;
  text-align: center;
}

.status-running { background: #e1f3d8; color: #67c23a; }
.status-standby { background: #fdf6ec; color: #e6a23c; }
.status-fault { background: #fef0f0; color: #f56c6c; }
.status-offline { background: #f0f0f0; color: #909399; }

.inspection-done { background: #e1f3d8; color: #67c23a; }
.inspection-pending { background: #fdf6ec; color: #e6a23c; }

/* 图标样式 */
.workshop-icon { color: #67c23a; margin-right: 8px; }
.line-icon { color: #e6a23c; margin-right: 8px; }
.segment-icon { color: #9c27b0; margin-right: 8px; }
.device-icon { color: #409EFF; margin-right: 8px; }

/* 分页控件 */
.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

/* 弹窗样式 */
.dialog-header {
  display: flex;
  align-items: center;
  padding-bottom: 15px;
  border-bottom: 1px solid #eee;
  margin-bottom: 20px;
  gap: 10px;
}

.dialog-header h2 {
  font-size: 20px;
  font-weight: 600;
  color: #1f2f3d;
}

.dialog-icon {
  font-size: 24px;
  color: #409EFF;
}

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
  gap: 8px;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.dialog-footer {
  padding-top: 15px;
  border-top: 1px solid #eee;
  text-align: right;
}

/* 空数据提示 */
.empty-data-hint {
  height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.utilization-bar {
  height: 8px;
  background: #ebeef5;
  border-radius: 4px;
  overflow: hidden;
  margin-top: 4px;
}

.utilization-fill {
  height: 100%;
  border-radius: 4px;
  background: linear-gradient(90deg, #5cb87a, #67c23a);
}

.status-indicator {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-right: 6px;
}

.indicator-running { background: #67c23a; }
.indicator-standby { background: #e6a23c; }
.indicator-fault { background: #f56c6c; }
.indicator-offline { background: #909399; }
</style>
