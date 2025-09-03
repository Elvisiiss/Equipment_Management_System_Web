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

      <!-- 第二列：设备点检管理 -->
      <div class="panel inspection-panel">
        <div class="panel-header">
          <div class="panel-title">
            <i class="el-icon-s-marketing"></i>
            设备点检管理
          </div>
          <div class="time-filter">
            <el-select v-model="timeRange" placeholder="选择时间范围" @change="loadInspectionData">
              <el-option label="今日" value="today"></el-option>
              <el-option label="本周" value="week"></el-option>
              <el-option label="本月" value="month"></el-option>
              <el-option label="本季度" value="quarter"></el-option>
            </el-select>
          </div>
        </div>

        <!-- 点检概览卡片 -->
        <div class="overview-cards">
          <el-card shadow="hover" class="overview-card">
            <div class="card-content">
              <div class="card-icon completion-rate">
                <i class="el-icon-success"></i>
              </div>
              <div class="card-info">
                <div class="card-value">{{ inspectionStats.completionRate }}%</div>
                <div class="card-label">点检完成率</div>
              </div>
            </div>
          </el-card>

          <el-card shadow="hover" class="overview-card">
            <div class="card-content">
              <div class="card-icon on-time-rate">
                <i class="el-icon-timer"></i>
              </div>
              <div class="card-info">
                <div class="card-value">{{ inspectionStats.onTimeRate }}%</div>
                <div class="card-label">准时率</div>
              </div>
            </div>
          </el-card>

          <el-card shadow="hover" class="overview-card">
            <div class="card-content">
              <div class="card-icon exception-rate">
                <i class="el-icon-warning"></i>
              </div>
              <div class="card-info">
                <div class="card-value">{{ inspectionStats.exceptionRate }}%</div>
                <div class="card-label">异常率</div>
              </div>
            </div>
          </el-card>

          <el-card shadow="hover" class="overview-card">
            <div class="card-content">
              <div class="card-icon total-count">
                <i class="el-icon-document"></i>
              </div>
              <div class="card-info">
                <div class="card-value">{{ inspectionStats.totalCount }}</div>
                <div class="card-label">点检总数</div>
              </div>
            </div>
          </el-card>
        </div>

        <!-- 点检趋势图 -->
        <div class="chart-container">
          <el-card shadow="never" class="chart-card">
            <template #header>
              <div class="chart-header">
                <span>点检完成趋势</span>
                <el-radio-group v-model="chartType" size="small">
                  <el-radio-button label="day">日</el-radio-button>
                  <el-radio-button label="week">周</el-radio-button>
                  <el-radio-button label="month">月</el-radio-button>
                </el-radio-group>
              </div>
            </template>
            <div class="trend-chart" ref="trendChartRef"></div>
          </el-card>
        </div>

        <!-- 点检记录列表 -->
        <div class="panel-content">
          <div class="table-header">
            <h3>点检记录</h3>
            <el-button type="primary" icon="plus" @click="addInspectionRecord" :disabled="!currentDevice">
              新增点检
            </el-button>
          </div>
          <div class="table-container">
            <el-table
                :data="inspectionRecords"
                border
                highlight-current-row
                v-loading="inspectionLoading"
                style="width: 100%"
            >
              <el-table-column prop="date" label="点检日期" width="120" sortable></el-table-column>
              <el-table-column prop="inspector" label="点检人" width="120"></el-table-column>
              <el-table-column prop="planTime" label="计划时间" width="120"></el-table-column>
              <el-table-column prop="actualTime" label="实际时间" width="120"></el-table-column>
              <el-table-column prop="status" label="状态" width="100">
                <template #default="{ row }">
                  <el-tag :type="getStatusType(row.status)" size="small">
                    {{ row.status }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="result" label="点检结果">
                <template #default="{ row }">
                  <span :class="{'exception-text': row.result === '异常'}">{{ row.result }}</span>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="120" fixed="right">
                <template #default="{ row }">
                  <el-button type="text" size="small" @click="viewInspectionDetail(row)">详情</el-button>
                  <el-button type="text" size="small" @click="editInspectionRecord(row)">编辑</el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </div>
      </div>
    </div>

    <!-- 页脚 -->
    <div class="footer">
      © 2023 设备点检管理系统 | Vue3 + Element Plus 实现
    </div>

    <!-- 点检记录编辑弹窗 -->
    <el-dialog
        v-model="inspectionDialogVisible"
        :title="isEditInspection ? '编辑点检记录' : '新增点检记录'"
        width="600px"
        :close-on-click-modal="false"
    >
      <el-form :model="inspectionForm" label-width="100px" ref="inspectionFormRef">
        <el-form-item label="设备名称" prop="deviceName">
          <el-input v-model="currentDevice.mcName" disabled />
        </el-form-item>
        <el-form-item label="点检日期" prop="date" required>
          <el-date-picker
              v-model="inspectionForm.date"
              type="date"
              placeholder="选择点检日期"
              value-format="YYYY-MM-DD"
          />
        </el-form-item>
        <el-form-item label="计划时间" prop="planTime" required>
          <el-time-picker
              v-model="inspectionForm.planTime"
              placeholder="选择计划时间"
              value-format="HH:mm:ss"
          />
        </el-form-item>
        <el-form-item label="实际时间" prop="actualTime">
          <el-time-picker
              v-model="inspectionForm.actualTime"
              placeholder="选择实际时间"
              value-format="HH:mm:ss"
          />
        </el-form-item>
        <el-form-item label="点检人" prop="inspector" required>
          <el-input v-model="inspectionForm.inspector" placeholder="请输入点检人姓名" />
        </el-form-item>
        <el-form-item label="点检结果" prop="result" required>
          <el-select v-model="inspectionForm.result" placeholder="请选择点检结果">
            <el-option label="正常" value="正常"></el-option>
            <el-option label="异常" value="异常"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input
              v-model="inspectionForm.remark"
              type="textarea"
              :rows="3"
              placeholder="请输入备注信息"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="inspectionDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitInspectionRecord">确定</el-button>
      </template>
    </el-dialog>

    <!-- 点检详情弹窗 -->
    <el-dialog
        v-model="detailDialogVisible"
        title="点检记录详情"
        width="700px"
        :close-on-click-modal="false"
    >
      <el-descriptions :column="2" border v-if="currentInspection">
        <el-descriptions-item label="设备名称">{{ currentInspection.deviceName }}</el-descriptions-item>
        <el-descriptions-item label="点检日期">{{ currentInspection.date }}</el-descriptions-item>
        <el-descriptions-item label="点检人">{{ currentInspection.inspector }}</el-descriptions-item>
        <el-descriptions-item label="计划时间">{{ currentInspection.planTime }}</el-descriptions-item>
        <el-descriptions-item label="实际时间">{{ currentInspection.actualTime || '未完成' }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="getStatusType(currentInspection.status)" size="small">
            {{ currentInspection.status }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="点检结果" :span="2">
          <span :class="{'exception-text': currentInspection.result === '异常'}">
            {{ currentInspection.result }}
          </span>
        </el-descriptions-item>
        <el-descriptions-item label="备注" :span="2">{{ currentInspection.remark || '无' }}</el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick, watch } from 'vue'
import * as echarts from 'echarts'
import {
  ElMessage,
  ElMessageBox,
  ElTable,
  ElTableColumn,
  ElDialog,
  ElForm,
  ElFormItem,
  ElInput,
  ElSelect,
  ElOption,
  ElDatePicker,
  ElTimePicker,
  ElCard,
  ElTag,
  ElButton,
  ElRadioGroup,
  ElRadioButton,
  ElDescriptions,
  ElDescriptionsItem
} from 'element-plus'

// 导入API
import {
  getDeviceTree
} from '@/api/equipment/EquipmentLedger'

// 响应式变量定义
const tableData = ref([])
const currentDevice = ref(null)
const deviceLoading = ref(false)
const timeRange = ref('week')
const chartType = ref('week')
const inspectionLoading = ref(false)

// 点检统计数据和记录
const inspectionStats = reactive({
  completionRate: 92.5,
  onTimeRate: 85.3,
  exceptionRate: 7.2,
  totalCount: 124
})

const inspectionRecords = ref([])
const trendChartRef = ref(null)
let trendChart = null

// 弹窗相关
const inspectionDialogVisible = ref(false)
const detailDialogVisible = ref(false)
const isEditInspection = ref(false)
const inspectionForm = reactive({
  id: null,
  date: '',
  planTime: '',
  actualTime: '',
  inspector: '',
  result: '正常',
  remark: ''
})
const currentInspection = ref(null)
const inspectionFormRef = ref(null)

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
    if (node.devices && node.devices.length > 0) {
      node.devices.forEach(device => {
        const deviceNode = {
          ...device,
          type: 'device',
          name: device.mcName,
          deviceCode: device.mcNumber,
          workshopName: findAreaNameById(node.devices[0].areaId, 'WORKSHOP'),
          lineName: findAreaNameById(node.devices[0].areaId, 'LINE'),
          sectionName: findAreaNameById(node.devices[0].areaId, 'SECTION')
        }

        delete deviceNode.subNodes;
        delete deviceNode.children;

        tableNode.children.push(deviceNode)
      })
    }

    // 递归处理子节点 - 只有组织节点可以有子节点
    if (node.subNodes && node.subNodes.length > 0) {
      node.subNodes.forEach(subNode => {
        if (subNode.areaType) {
          tableNode.children.push(convertNode(subNode))
        }
      })
    }

    return tableNode
  }

  return data.map(node => convertNode(node))
}

// 根据区域ID查找区域名称（简化实现）
const findAreaNameById = (areaId, areaType) => {
  return ''
}

// 初始化设备树
const initDeviceTree = async () => {
  deviceLoading.value = true
  try {
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
  loadInspectionData()
  ElMessage.success('数据已刷新')
}

// 选择设备
const handleDeviceChange = (device) => {
  if (!device || device.type !== 'device') return
  currentDevice.value = device
  loadInspectionData()
}

// 加载点检数据
const loadInspectionData = () => {
  inspectionLoading.value = true

  // 模拟API调用
  setTimeout(() => {
    // 生成模拟的点检记录
    inspectionRecords.value = [
      { id: 1, deviceName: currentDevice.value?.mcName || '设备1', date: '2023-09-15', inspector: '张三', planTime: '08:00:00', actualTime: '08:05:23', status: '已完成', result: '正常', remark: '' },
      { id: 2, deviceName: currentDevice.value?.mcName || '设备1', date: '2023-09-14', inspector: '李四', planTime: '08:00:00', actualTime: '07:55:12', status: '已完成', result: '正常', remark: '' },
      { id: 3, deviceName: currentDevice.value?.mcName || '设备1', date: '2023-09-13', inspector: '王五', planTime: '08:00:00', actualTime: '08:12:45', status: '已完成', result: '异常', remark: '发现异常震动' },
      { id: 4, deviceName: currentDevice.value?.mcName || '设备1', date: '2023-09-12', inspector: '赵六', planTime: '08:00:00', actualTime: null, status: '未完成', result: '待检', remark: '' },
      { id: 5, deviceName: currentDevice.value?.mcName || '设备1', date: '2023-09-11', inspector: '钱七', planTime: '08:00:00', actualTime: '08:03:11', status: '已完成', result: '正常', remark: '' }
    ]

    inspectionLoading.value = false
    initTrendChart()
  }, 800)
}

// 初始化趋势图表
const initTrendChart = () => {
  if (!trendChartRef.value) return

  // 销毁现有图表实例
  if (trendChart) {
    trendChart.dispose()
  }

  trendChart = echarts.init(trendChartRef.value)

  // 根据chartType生成不同的数据
  let xData = []
  let completedData = []
  let exceptionData = []

  if (chartType.value === 'day') {
    // 生成24小时数据
    for (let i = 0; i < 24; i++) {
      xData.push(`${i}:00`)
      completedData.push(Math.floor(Math.random() * 10) + 15)
      exceptionData.push(Math.floor(Math.random() * 5))
    }
  } else if (chartType.value === 'week') {
    // 生成一周数据
    const days = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
    days.forEach(day => {
      xData.push(day)
      completedData.push(Math.floor(Math.random() * 20) + 30)
      exceptionData.push(Math.floor(Math.random() * 8))
    })
  } else {
    // 生成月数据（30天）
    for (let i = 1; i <= 30; i++) {
      xData.push(`${i}日`)
      completedData.push(Math.floor(Math.random() * 10) + 5)
      exceptionData.push(Math.floor(Math.random() * 3))
    }
  }

  const option = {
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: ['完成数', '异常数']
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: xData
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: '完成数',
        type: 'line',
        smooth: true,
        data: completedData,
        itemStyle: {
          color: '#409EFF'
        }
      },
      {
        name: '异常数',
        type: 'line',
        smooth: true,
        data: exceptionData,
        itemStyle: {
          color: '#F56C6C'
        }
      }
    ]
  }

  trendChart.setOption(option)

  // 响应窗口大小变化
  window.addEventListener('resize', () => {
    if (trendChart) {
      trendChart.resize()
    }
  })
}

// 获取状态标签类型
const getStatusType = (status) => {
  switch (status) {
    case '已完成': return 'success'
    case '进行中': return 'warning'
    case '未完成': return 'info'
    case '异常': return 'danger'
    default: return 'info'
  }
}

// 新增点检记录
const addInspectionRecord = () => {
  isEditInspection.value = false
  inspectionForm.id = null
  inspectionForm.date = new Date().toISOString().split('T')[0]
  inspectionForm.planTime = '08:00:00'
  inspectionForm.actualTime = ''
  inspectionForm.inspector = ''
  inspectionForm.result = '正常'
  inspectionForm.remark = ''
  inspectionDialogVisible.value = true
}

// 编辑点检记录
const editInspectionRecord = (record) => {
  isEditInspection.value = true
  inspectionForm.id = record.id
  inspectionForm.date = record.date
  inspectionForm.planTime = record.planTime
  inspectionForm.actualTime = record.actualTime || ''
  inspectionForm.inspector = record.inspector
  inspectionForm.result = record.result
  inspectionForm.remark = record.remark || ''
  inspectionDialogVisible.value = true
}

// 查看点检详情
const viewInspectionDetail = (record) => {
  currentInspection.value = record
  detailDialogVisible.value = true
}

// 提交点检记录
const submitInspectionRecord = () => {
  if (!inspectionForm.date || !inspectionForm.planTime || !inspectionForm.inspector) {
    ElMessage.error('请填写必填字段')
    return
  }

  if (isEditInspection.value) {
    // 更新记录
    const index = inspectionRecords.value.findIndex(r => r.id === inspectionForm.id)
    if (index !== -1) {
      inspectionRecords.value[index] = {
        ...inspectionRecords.value[index],
        date: inspectionForm.date,
        planTime: inspectionForm.planTime,
        actualTime: inspectionForm.actualTime,
        inspector: inspectionForm.inspector,
        result: inspectionForm.result,
        remark: inspectionForm.remark,
        status: inspectionForm.actualTime ? '已完成' : '未完成'
      }
    }
    ElMessage.success('点检记录更新成功')
  } else {
    // 新增记录
    inspectionRecords.value.unshift({
      id: Date.now(),
      deviceName: currentDevice.value.mcName,
      date: inspectionForm.date,
      inspector: inspectionForm.inspector,
      planTime: inspectionForm.planTime,
      actualTime: inspectionForm.actualTime,
      status: inspectionForm.actualTime ? '已完成' : '未完成',
      result: inspectionForm.result,
      remark: inspectionForm.remark
    })
    ElMessage.success('点检记录添加成功')
  }

  inspectionDialogVisible.value = false
  // 重新计算统计数据
  calculateStats()
}

// 计算统计数据
const calculateStats = () => {
  const total = inspectionRecords.value.length
  const completed = inspectionRecords.value.filter(r => r.status === '已完成').length
  const onTime = inspectionRecords.value.filter(r => {
    if (!r.actualTime || !r.planTime) return false
    // 简单判断是否准时（实际时间不超过计划时间10分钟）
    const planTime = new Date(`2000-01-01T${r.planTime}`)
    const actualTime = new Date(`2000-01-01T${r.actualTime}`)
    const diffMs = actualTime - planTime
    return diffMs <= 10 * 60 * 1000 // 10分钟
  }).length
  const exceptions = inspectionRecords.value.filter(r => r.result === '异常').length

  inspectionStats.totalCount = total
  inspectionStats.completionRate = total > 0 ? ((completed / total) * 100).toFixed(1) : 0
  inspectionStats.onTimeRate = completed > 0 ? ((onTime / completed) * 100).toFixed(1) : 0
  inspectionStats.exceptionRate = completed > 0 ? ((exceptions / completed) * 100).toFixed(1) : 0
}

// 监听图表类型变化
watch(chartType, () => {
  initTrendChart()
})

// 监听设备变化
watch(currentDevice, () => {
  loadInspectionData()
})

// 生命周期钩子
onMounted(() => {
  initDeviceTree()
  nextTick(() => {
    initTrendChart()
  })
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

.inspection-panel {
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

.time-filter {
  width: 140px;
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

/* 点检概览卡片样式 */
.overview-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  padding: 16px;
}

.overview-card {
  border-radius: 8px;
}

.card-content {
  display: flex;
  align-items: center;
}

.card-icon {
  width: 60px;
  height: 60px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
  font-size: 28px;
  color: white;
}

.card-icon.completion-rate {
  background-color: #67c23a;
}

.card-icon.on-time-rate {
  background-color: #409EFF;
}

.card-icon.exception-rate {
  background-color: #e6a23c;
}

.card-icon.total-count {
  background-color: #909399;
}

.card-value {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 4px;
}

.card-label {
  color: #909399;
  font-size: 14px;
}

/* 图表容器 */
.chart-container {
  padding: 0 16px;
  margin-bottom: 16px;
}

.chart-card {
  border-radius: 8px;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.trend-chart {
  height: 300px;
  width: 100%;
}

/* 表格头部 */
.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 16px 0;
  margin-bottom: 16px;
}

.table-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
}

/* 异常文本样式 */
.exception-text {
  color: #f56c6c;
  font-weight: 500;
}

/* 响应式调整 */
@media (max-width: 1200px) {
  .overview-cards {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 992px) {
  .main-content {
    flex-direction: column;
  }

  .device-panel, .inspection-panel {
    width: 100%;
    margin-right: 0;
    margin-bottom: 16px;
  }

  .device-panel {
    height: 400px;
  }
}

@media (max-width: 768px) {
  .overview-cards {
    grid-template-columns: 1fr;
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
