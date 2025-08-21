<template>
  <div class="spc-container">
    <!-- 顶部查询区域 -->
    <div class="filter-container">
      <div class="filter-header">
        <h2 v-if="!isStarredPage">SPC设备监控</h2>
        <h2 v-else>特别关注设备</h2>
        <div class="header-buttons">
          <el-button
              v-if="isStarredPage"
              type="primary"
              icon="arrow-left"
              @click="isStarredPage = false"
          >
            返回设备列表
          </el-button>
          <el-button
              v-if="!isStarredPage"
              type="warning"
              icon="star"
              @click="switchToStarredPage"
          >
            切换到特别关注页面
          </el-button>
        </div>
      </div>

      <el-form :inline="true" :model="filterForm" class="filter-form" v-if="!isStarredPage">
        <el-form-item label="车间">
          <el-select
              v-model="filterForm.workshop"
              placeholder="请选择车间"
              clearable
              style="width: 200px"
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
              placeholder="请选择产线"
              clearable
              style="width: 200px"
              :disabled="!filterForm.workshop"
              @change="handleLineChange"
          >
            <el-option
                v-for="line in lineOptions"
                :key="line"
                :label="line"
                :value="line"
            ></el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="工段">
          <el-select
              v-model="filterForm.segment"
              placeholder="请选择工段"
              clearable
              style="width: 200px"
              :disabled="!filterForm.line"
          >
            <el-option
                v-for="segment in segmentOptions"
                :key="segment"
                :label="segment"
                :value="segment"
            ></el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="设备型号">
          <el-input
              v-model="filterForm.model"
              placeholder="请输入设备型号"
              clearable
          ></el-input>
        </el-form-item>

        <el-form-item label="设备名称">
          <el-input
              v-model="filterForm.name"
              placeholder="请输入设备名称"
              clearable
          ></el-input>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" icon="search" @click="handleSearch">查询</el-button>
          <el-button icon="refresh" @click="resetFilter">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 设备便签展示区域 -->
    <div class="device-container">
      <div class="device-cards">
        <div
            v-for="device in displayedDeviceList"
            :key="device.id"
            class="device-card"
            @click="showDeviceDetail(device)"
        >
          <div class="device-header">
            <div class="device-name">
              {{ device.name }}
              <div class="device-code">{{ device.deviceCode }}</div>
            </div>
            <div class="device-status-area">
              <div class="device-status" :class="getStatusClass(device.status)">
                {{ device.status }}
              </div>
              <el-button
                  v-if="!isStarredPage"
                  class="star-btn"
                  :icon="isDeviceStarred(device.id) ? 'star' : 'star'"
                  :type="isDeviceStarred(device.id) ? 'warning' : 'text'"
                  @click.stop="toggleDeviceStar(device)"
              ></el-button>
            </div>
          </div>

          <div class="device-starred-params">
            <div v-if="starredParams[device.id] && starredParams[device.id].length > 0" class="starred-title">
              <i class="star-on"></i> 特别关注参数
            </div>
            <div v-if="starredParams[device.id] && starredParams[device.id].length > 0" class="starred-items">
              <div v-for="(param, index) in starredParams[device.id]" :key="index" class="starred-item">
                <span class="param-name">{{ param.param }}</span>
                <span class="param-value">{{ param.value }}</span>
                <span class="param-unit">{{ param.unit }}</span>
              </div>
            </div>
            <div v-else class="no-starred">
              暂无特别关注参数
            </div>
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-if="displayedDeviceList.length === 0" class="empty-container">
        <el-empty :description="isStarredPage ? '暂无特别关注设备' : '暂无设备数据'"></el-empty>
      </div>

      <!-- 分页控件 -->
      <div class="pagination-container" v-if="total > 0 && !isStarredPage">
        <el-pagination
            background
            layout="prev, pager, next"
            :page-size="pageSize"
            :total="total"
            :current-page="currentPage"
            @current-change="handlePageChange"
        ></el-pagination>
      </div>
    </div>

    <!-- 设备详情弹窗 -->
    <el-dialog
        v-model="detailVisible"
        :title="currentDevice.name"
        width="90%"
        top="5vh"
        custom-class="spc-detail-dialog"
    >
      <el-tabs v-model="activeTab" type="border-card">
        <!-- 产量及状态参数 -->
        <el-tab-pane label="产量及状态参数" name="output">
          <div class="table-container">
            <el-table :data="currentTabData" height="500" border>
              <el-table-column type="index" label="序号" width="60" align="center"></el-table-column>
              <el-table-column prop="param" label="参数" width="150"></el-table-column>
              <el-table-column label="(点)描述">
                <template #default="{ row }">
                  <el-tooltip :content="row.description" placement="top">
                    <el-link type="primary" :underline="false">{{ row.description.substring(0, 20) }}...</el-link>
                  </el-tooltip>
                </template>
              </el-table-column>
              <el-table-column prop="value" label="实时数据" width="120">
                <template #default="{ row }">
                  <span :class="{'alarm-value': row.isAlarm, 'warning-value': row.isWarning}">{{ row.value }}</span>
                </template>
              </el-table-column>
              <el-table-column prop="updateTime" label="更新时间" width="180"></el-table-column>
              <el-table-column label="操作" width="250" align="center">
                <template #default="{ row }">
                  <el-button size="small" type="primary" @click="showDataChart(row)">数据曲线</el-button>
                  <el-checkbox
                      v-model="row.starred"
                      :true-label="1"
                      :false-label="0"
                      @change="handleStarChange(row)"
                  >特别关注</el-checkbox>
                </template>
              </el-table-column>
            </el-table>

            <div class="dialog-pagination">
              <el-pagination
                  background
                  layout="prev, pager, next"
                  :page-size="dialogPageSize"
                  :total="currentTabTotal"
                  :current-page="dialogCurrentPage"
                  @current-change="handleDialogPageChange"
              ></el-pagination>
            </div>
          </div>
        </el-tab-pane>

        <!-- 报警参数 -->
        <el-tab-pane label="报警参数" name="alarm">
          <div class="table-container">
            <el-table :data="currentTabData" height="500" border>
              <el-table-column type="index" label="序号" width="60" align="center"></el-table-column>
              <el-table-column prop="param" label="参数" width="150"></el-table-column>
              <el-table-column label="(点)描述">
                <template #default="{ row }">
                  <el-tooltip :content="row.description" placement="top">
                    <el-link type="primary" :underline="false">{{ row.description.substring(0, 20) }}...</el-link>
                  </el-tooltip>
                </template>
              </el-table-column>
              <el-table-column prop="value" label="实时数据" width="120">
                <template #default="{ row }">
                  <span :class="{'alarm-value': row.isAlarm, 'warning-value': row.isWarning}">{{ row.value }}</span>
                </template>
              </el-table-column>
              <el-table-column prop="updateTime" label="更新时间" width="180"></el-table-column>
              <el-table-column label="操作" width="250" align="center">
                <template #default="{ row }">
                  <el-checkbox
                      v-model="row.starred"
                      :true-label="1"
                      :false-label="0"
                      @change="handleStarChange(row)"
                  >特别关注</el-checkbox>
                  <el-button size="small" type="primary" @click="showDataChart(row)">数据曲线</el-button>
                </template>
              </el-table-column>
            </el-table>

            <div class="dialog-pagination">
              <el-pagination
                  background
                  layout="prev, pager, next"
                  :page-size="dialogPageSize"
                  :total="currentTabTotal"
                  :current-page="dialogCurrentPage"
                  @current-change="handleDialogPageChange"
              ></el-pagination>
            </div>
          </div>
        </el-tab-pane>

        <!-- SOP参数 -->
        <el-tab-pane label="SOP参数" name="sop">
          <div class="table-container">
            <el-table :data="currentTabData" height="500" border>
              <el-table-column type="index" label="序号" width="60" align="center"></el-table-column>
              <el-table-column prop="param" label="参数" width="150"></el-table-column>
              <el-table-column label="(点)描述">
                <template #default="{ row }">
                  <el-tooltip :content="row.description" placement="top">
                    <el-link type="primary" :underline="false">{{ row.description.substring(0, 20) }}...</el-link>
                  </el-tooltip>
                </template>
              </el-table-column>
              <el-table-column prop="value" label="实时数据" width="120">
                <template #default="{ row }">
                  <span :class="{'alarm-value': row.isAlarm, 'warning-value': row.isWarning}">{{ row.value }}</span>
                </template>
              </el-table-column>
              <el-table-column prop="updateTime" label="更新时间" width="180"></el-table-column>
              <el-table-column label="操作" width="250" align="center">
                <template #default="{ row }">
                  <el-checkbox
                      v-model="row.starred"
                      :true-label="1"
                      :false-label="0"
                      @change="handleStarChange(row)"
                  >特别关注</el-checkbox>
                  <el-button size="small" type="primary" @click="showDataChart(row)">数据曲线</el-button>
                </template>
              </el-table-column>
            </el-table>

            <div class="dialog-pagination">
              <el-pagination
                  background
                  layout="prev, pager, next"
                  :page-size="dialogPageSize"
                  :total="currentTabTotal"
                  :current-page="dialogCurrentPage"
                  @current-change="handleDialogPageChange"
              ></el-pagination>
            </div>
          </div>
        </el-tab-pane>

        <!-- 关键参数 -->
        <el-tab-pane label="关键参数" name="keyParams">
          <div class="table-container">
            <el-table :data="currentTabData" height="500" border>
              <el-table-column type="index" label="序号" width="60" align="center"></el-table-column>
              <el-table-column prop="param" label="参数" width="150"></el-table-column>
              <el-table-column label="(点)描述">
                <template #default="{ row }">
                  <el-tooltip :content="row.description" placement="top">
                    <el-link type="primary" :underline="false">{{ row.description.substring(0, 20) }}...</el-link>
                  </el-tooltip>
                </template>
              </el-table-column>
              <el-table-column prop="value" label="实时数据" width="120">
                <template #default="{ row }">
                  <span :class="{'alarm-value': row.isAlarm, 'warning-value': row.isWarning}">{{ row.value }}</span>
                </template>
              </el-table-column>
              <el-table-column prop="updateTime" label="更新时间" width="180"></el-table-column>
              <el-table-column label="操作" width="250" align="center">
                <template #default="{ row }">
                  <el-checkbox
                      v-model="row.starred"
                      :true-label="1"
                      :false-label="0"
                      @change="handleStarChange(row)"
                  >特别关注</el-checkbox>
                  <el-button size="small" type="primary" @click="showDataChart(row)">数据曲线</el-button>
                </template>
              </el-table-column>
            </el-table>

            <div class="dialog-pagination">
              <el-pagination
                  background
                  layout="prev, pager, next"
                  :page-size="dialogPageSize"
                  :total="currentTabTotal"
                  :current-page="dialogCurrentPage"
                  @current-change="handleDialogPageChange"
              ></el-pagination>
            </div>
          </div>
        </el-tab-pane>

        <!-- 非关键参数 -->
        <el-tab-pane label="非关键参数" name="nonKeyParams">
          <div class="table-container">
            <el-table :data="currentTabData" height="500" border>
              <el-table-column type="index" label="序号" width="60" align="center"></el-table-column>
              <el-table-column prop="param" label="参数" width="150"></el-table-column>
              <el-table-column label="(点)描述">
                <template #default="{ row }">
                  <el-tooltip :content="row.description" placement="top">
                    <el-link type="primary" :underline="false">{{ row.description.substring(0, 20) }}...</el-link>
                  </el-tooltip>
                </template>
              </el-table-column>
              <el-table-column prop="value" label="实时数据" width="120">
                <template #default="{ row }">
                  <span :class="{'alarm-value': row.isAlarm, 'warning-value': row.isWarning}">{{ row.value }}</span>
                </template>
              </el-table-column>
              <el-table-column prop="updateTime" label="更新时间" width="180"></el-table-column>
              <el-table-column label="操作" width="250" align="center">
                <template #default="{ row }">
                  <el-checkbox
                      v-model="row.starred"
                      :true-label="1"
                      :false-label="0"
                      @change="handleStarChange(row)"
                  >特别关注</el-checkbox>
                  <el-button size="small" type="primary" @click="showDataChart(row)">数据曲线</el-button>
                </template>
              </el-table-column>
            </el-table>

            <div class="dialog-pagination">
              <el-pagination
                  background
                  layout="prev, pager, next"
                  :page-size="dialogPageSize"
                  :total="currentTabTotal"
                  :current-page="dialogCurrentPage"
                  @current-change="handleDialogPageChange"
              ></el-pagination>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>

      <template #footer>
        <el-button @click="detailVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import {ref, reactive, onMounted, nextTick, watch, computed} from 'vue'
import {ElMessage} from 'element-plus'
import {getSPCDeviceList, getSPCDeviceDetail} from '@/api/equipment/spcAPI.js'
import {getLineOptionsByWorkshop, getSegmentOptions} from '@/api/eqAPI.js'

// 查询表单
const filterForm = reactive({
  workshop: '',
  line: '',
  segment: '',
  model: '',
  name: ''
})

// 车间选项
const workshopOptions = ['C2', 'C3', 'C4', 'C5', 'C6']
const lineOptions = ref([])
const segmentOptions = ref([])

// 设备列表
const deviceList = ref([])
const currentPage = ref(1)
const pageSize = ref(8)
const total = ref(0)

// 设备详情
const detailVisible = ref(false)
const currentDevice = ref({})
const activeTab = ref('output')

// 弹窗分页
const dialogCurrentPage = ref(1)
const dialogPageSize = ref(10)
const currentTabData = ref([])
const currentTabTotal = ref(0)

// 特别关注参数存储，按设备ID区分
const starredParams = ref({})
// 特别关注设备存储
const starredDevices = ref(new Set())

// 是否在特别关注页面
const isStarredPage = ref(false)

// 状态样式映射
const getStatusClass = (status) => {
  switch (status) {
    case '运行中':
      return 'status-running'
    case '待机中':
      return 'status-standby'
    case '故障中':
      return 'status-fault'
    case '维护中':
      return 'status-maintenance'
    default:
      return ''
  }
}

// 计算显示的设备列表
const displayedDeviceList = computed(() => {
  if (isStarredPage.value) {
    return deviceList.value.filter(device => starredDevices.value.has(device.id))
  }
  return deviceList.value
})

// 检查设备是否被特别关注
const isDeviceStarred = (deviceId) => {
  return starredDevices.value.has(deviceId)
}

// 切换设备特别关注状态
const toggleDeviceStar = (device) => {
  if (starredDevices.value.has(device.id)) {
    starredDevices.value.delete(device.id)
    ElMessage.success(`已取消关注 ${device.name}`)
  } else {
    starredDevices.value.add(device.id)
    ElMessage.success(`已特别关注 ${device.name}`)
  }

  // 保存到localStorage
  localStorage.setItem('starredDevices', JSON.stringify(Array.from(starredDevices.value)))
}

// 切换到特别关注页面
const switchToStarredPage = () => {
  isStarredPage.value = true
  // 不需要重新加载数据，因为displayedDeviceList是计算属性
}

// 车间变化处理
const handleWorkshopChange = async (workshop) => {
  if (workshop) {
    try {
      lineOptions.value = await getLineOptionsByWorkshop(workshop)
    } catch (error) {
      ElMessage.error('获取产线数据失败')
      lineOptions.value = []
    }
  } else {
    lineOptions.value = []
    filterForm.line = ''
    filterForm.segment = ''
  }
  filterForm.line = ''
  filterForm.segment = ''
}

// 产线变化处理
const handleLineChange = async (line) => {
  if (line) {
    try {
      segmentOptions.value = await getSegmentOptions()
    } catch (error) {
      ElMessage.error('获取工段数据失败')
      segmentOptions.value = []
    }
  } else {
    filterForm.segment = ''
    segmentOptions.value = []
  }
  filterForm.segment = ''
}

// 加载设备列表
const loadDeviceList = async () => {
  try {
    const params = {
      page: currentPage.value,
      size: pageSize.value,
      workshop: filterForm.workshop,
      line: filterForm.line,
      segment: filterForm.segment,
      model: filterForm.model,
      name: filterForm.name
    }

    const result = await getSPCDeviceList(params)
    deviceList.value = result.list
    total.value = result.total
  } catch (error) {
    ElMessage.error('加载设备列表失败')
  }
}

// 查询处理
const handleSearch = () => {
  currentPage.value = 1
  loadDeviceList()
}

// 重置查询条件
const resetFilter = () => {
  filterForm.workshop = ''
  filterForm.line = ''
  filterForm.segment = ''
  filterForm.model = ''
  filterForm.name = ''
  lineOptions.value = []
  segmentOptions.value = []
  handleSearch()
}

// 分页变化
const handlePageChange = (page) => {
  currentPage.value = page
  loadDeviceList()
}

// 显示设备详情
const showDeviceDetail = async (device) => {
  try {
    const detail = await getSPCDeviceDetail(device.id)
    currentDevice.value = detail

    // 初始化特别关注参数
    if (!starredParams.value[device.id]) {
      starredParams.value[device.id] = []
    }

    // 为所有参数添加starred属性
    Object.keys(detail).forEach(key => {
      if (Array.isArray(detail[key]) && detail[key].length > 0 && detail[key][0].param) {
        detail[key].forEach(param => {
          // 检查是否是特别关注参数
          const isStarred = starredParams.value[device.id].some(p =>
              p.param === param.param && p.tab === key
          )
          param.starred = isStarred ? 1 : 0
          param.tab = key // 记录参数所属标签页
        })
      }
    })

    detailVisible.value = true
    dialogCurrentPage.value = 1
    // 切换到第一个标签页的数据
    updateTabData(activeTab.value)
  } catch (error) {
    ElMessage.error('加载设备详情失败')
  }
}

// 更新当前标签页数据（带分页）
const updateTabData = (tabName) => {
  const allData = currentDevice.value[tabName] || []
  currentTabTotal.value = allData.length

  const startIndex = (dialogCurrentPage.value - 1) * dialogPageSize.value
  const endIndex = startIndex + dialogPageSize.value
  currentTabData.value = allData.slice(startIndex, endIndex)
}

// 监听标签页变化
watch(activeTab, (newVal) => {
  dialogCurrentPage.value = 1
  updateTabData(newVal)
})

// 弹窗分页变化
const handleDialogPageChange = (page) => {
  dialogCurrentPage.value = page
  updateTabData(activeTab.value)
}

// 处理特别关注变化
const handleStarChange = (row) => {
  const deviceId = currentDevice.value.id
  if (!starredParams.value[deviceId]) {
    starredParams.value[deviceId] = []
  }

  // 检查是否已存在
  const existingIndex = starredParams.value[deviceId].findIndex(
      p => p.param === row.param && p.tab === row.tab
  )

  if (row.starred && existingIndex === -1) {
    // 添加特别关注，检查是否超过5个
    if (starredParams.value[deviceId].length >= 5) {
      ElMessage.warning('最多只能添加5个特别关注参数')
      row.starred = 0
      return
    }
    starredParams.value[deviceId].push({...row})
  } else if (!row.starred && existingIndex !== -1) {
    // 移除特别关注
    starredParams.value[deviceId].splice(existingIndex, 1)
  }

  // 保存到localStorage
  localStorage.setItem('starredParams', JSON.stringify(starredParams.value))
}

// 数据曲线按钮（合并实时和历史）
const showDataChart = (param) => {
  ElMessage.info(`显示 ${param.param} 的数据曲线（实时和历史数据）`)
}

// 初始化加载设备列表
onMounted(() => {
  loadDeviceList()

  // 从localStorage加载特别关注数据
  const savedStarredParams = localStorage.getItem('starredParams')
  if (savedStarredParams) {
    starredParams.value = JSON.parse(savedStarredParams)
  }

  const savedStarredDevices = localStorage.getItem('starredDevices')
  if (savedStarredDevices) {
    starredDevices.value = new Set(JSON.parse(savedStarredDevices))
  }
})
</script>

<style scoped>
.spc-container {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: calc(100vh - 40px);
}

.filter-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.filter-header h2 {
  margin: 0;
  color: #303133;
}

.header-buttons {
  display: flex;
  gap: 10px;
}

.filter-container {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  margin-bottom: 20px;
}

.filter-form {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
}

.device-container {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
}

.device-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.device-card {
  border: 1px solid #ebeef5;
  border-radius: 8px;
  padding: 15px;
  background-color: #e6f7ff; /* 淡蓝色背景 */
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  cursor: pointer;
  transition: all 0.3s ease;
  height: 260px;
  display: flex;
  flex-direction: column;
}

.device-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
  border-color: #409eff;
}

.device-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid #b3d8ff;
}

.device-status-area {
  display: flex;
  align-items: center;
  gap: 8px;
}

.star-btn {
  padding: 6px;
}

.device-name {
  font-size: 18px;
  font-weight: bold;
  color: #303133;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.device-code {
  font-size: 12px;
  color: #606266;
  margin-top: 5px;
  font-weight: normal;
}

.device-status {
  font-size: 12px;
  padding: 4px 8px;
  border-radius: 4px;
  color: #fff;
}

.status-running {
  background-color: #67c23a;
}

.status-standby {
  background-color: #909399;
}

.status-fault {
  background-color: #f56c6c;
}

.status-maintenance {
  background-color: #e6a23c;
}

.device-starred-params {
  flex: 1;
  overflow-y: auto;
  padding: 5px;
}

.starred-title {
  font-size: 14px;
  color: #1890ff;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
}

.starred-title i {
  margin-right: 5px;
}

.starred-items {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.starred-item {
  display: flex;
  justify-content: space-between;
  padding: 8px;
  background-color: rgba(255, 255, 255, 0.7);
  border-radius: 4px;
  font-size: 14px;
}

.param-name {
  font-weight: 500;
  color: #303133;
}

.param-value {
  color: #1890ff;
  font-weight: bold;
}

.param-unit {
  color: #606266;
  font-size: 12px;
}

.no-starred {
  color: #909399;
  text-align: center;
  padding: 30px 0;
  font-size: 14px;
}

.empty-container {
  padding: 50px 0;
  text-align: center;
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

/* 详情弹窗样式 */
.spc-detail-dialog {
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.table-container {
  margin-top: 10px;
}

.dialog-pagination {
  display: flex;
  justify-content: center;
  margin-top: 15px;
}

/* 报警值和警告值样式 */
.alarm-value {
  color: #f56c6c;
  font-weight: bold;
}

.warning-value {
  color: #e6a23c;
  font-weight: bold;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .device-cards {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  }
}

@media (max-width: 768px) {
  .device-cards {
    grid-template-columns: repeat(auto-fill, minmax(100%, 1fr));
  }

  .filter-form {
    flex-direction: column;
    align-items: flex-start;
  }

  .filter-form .el-form-item {
    margin-bottom: 10px;
    width: 100%;
  }

  .filter-form .el-form-item:last-child {
    display: flex;
    gap: 10px;
    margin-top: 10px;
  }

  .filter-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
}
</style>
