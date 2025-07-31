<!--  ─ 1.4 设备SPC监控-->
<!--  │　│　├─ 1.4.1 SPC数据（解析/履历）-->
<!--  │　│　├─ 1.4.2 X-R监控图-->
<template>
  <el-container style="height:100vh;">
    <el-header style="line-height:60px;font-size:20px;">SPC 监控页面</el-header>

    <el-main>
      <el-row :gutter="20" style="height:100%">
        <!-- 左侧面板：上传 + 履历查询 -->
        <el-col :span="8" style="display:flex;flex-direction:column;">
          <!-- 上传 -->
          <el-card shadow="hover" style="margin-bottom:10px;">
            <template #header>上传 SPC 文件</template>
            <el-upload
                ref="upload"
                accept=".csv"
                :auto-upload="false"
                :show-file-list="false"
                :on-change="handleFileChange"
            >
              <el-button type="primary" :icon="Upload">选择文件</el-button>
              <template #tip>
                <div class="el-upload__tip">仅支持CSV格式文件</div>
              </template>
            </el-upload>
          </el-card>

          <!-- 履历查询 -->
          <el-card shadow="hover" style="flex:1;overflow:hidden;">
            <template #header>
              <span>履历清单</span>
              <el-input
                  v-model="keyword"
                  placeholder="搜索文件名"
                  size="small"
                  prefix-icon="Search"
                  clearable
                  style="width:180px;float:right;margin-top:-4px"
              />
            </template>
            <el-table
                :data="pageData"
                height="calc(100% - 40px)"
                style="width:100%"
                highlight-current-row
                @current-change="handleSelect"
            >
              <el-table-column prop="fileName" label="文件" show-overflow-tooltip />
              <el-table-column prop="uploadTime" label="时间" width="150">
                <template #default="scope">
                  {{ new Date(scope.row.uploadTime).toLocaleString() }}
                </template>
              </el-table-column>
            </el-table>
            <el-pagination
                background
                small
                layout="prev, pager, next"
                :total="filtered.length"
                :page-size="pageSize"
                v-model:current-page="currentPage"
                style="margin-top:4px;text-align:right"
            />
          </el-card>
        </el-col>

        <!-- 右侧：X-R 控制图 -->
        <el-col :span="16">
          <el-card shadow="hover" style="height:100%;">
            <template #header>
              <span>X-R 控制图</span>
              <el-button
                  v-if="detail"
                  type="success"
                  size="small"
                  style="float:right;margin-top:-4px"
                  @click="exportChart"
              >导出图片</el-button>
            </template>

            <!-- 重构的图表容器 -->
            <div v-if="!detail" class="empty-chart">
              <el-empty description="请从左侧选择数据文件" />
            </div>

            <div v-else-if="chartLoading" class="chart-loading">
              <el-icon class="is-loading" :size="30"><Loading /></el-icon>
              <span>图表生成中...</span>
            </div>

            <div v-else class="chart-container">
              <div class="chart-title">X-Bar 控制图</div>
              <div ref="xBarChart" class="chart-area"></div>

              <div class="chart-divider"></div>

              <div class="chart-title">R 控制图</div>
              <div ref="rChart" class="chart-area"></div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </el-main>
  </el-container>
</template>

<script setup>
import { ref, reactive, computed, nextTick, onMounted, onBeforeUnmount } from 'vue'
import { ElMessage } from 'element-plus'
import { Upload, Loading } from '@element-plus/icons-vue'
import Papa from 'papaparse'
import { db } from '@/utils/db'
import * as echarts from 'echarts'

// -------------------- 数据 --------------------
const keyword = ref('')
const records = ref([])
const currentPage = ref(1)
const pageSize = 10
const detail = ref(null) // 当前选中的履历
const chartLoading = ref(false)
const xBarChart = ref(null)
const rChart = ref(null)
let xBarChartInst = null
let rChartInst = null

// -------------------- 计算属性 --------------------
const filtered = computed(() =>
    records.value.filter(r => r.fileName.includes(keyword.value)))
const pageData = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return filtered.value.slice(start, start + pageSize)
})

// -------------------- 生命周期 --------------------
onMounted(() => {
  refreshList()
  // 添加响应式监听
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  // 清理图表实例和事件监听
  if (xBarChartInst) {
    xBarChartInst.dispose()
    xBarChartInst = null
  }
  if (rChartInst) {
    rChartInst.dispose()
    rChartInst = null
  }
  window.removeEventListener('resize', handleResize)
})

// -------------------- 方法 --------------------
async function refreshList() {
  try {
    records.value = await db.records.orderBy('uploadTime').reverse().toArray()
  } catch (err) {
    ElMessage.error(`加载历史记录失败: ${err.message}`)
  }
}

// 上传解析
function handleFileChange(uploadFile) {
  const file = uploadFile.raw
  if (!file) return

  // 校验文件类型
  if (!file.name.endsWith('.csv')) {
    ElMessage.error('仅支持CSV格式文件')
    return
  }

  const reader = new FileReader()
  reader.onload = async e => {
    try {
      const text = e.target.result
      const result = Papa.parse(text, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true
      })

      // 校验解析结果
      if (result.errors.length > 0) {
        throw new Error('CSV解析错误: ' + result.errors[0].message)
      }

      const rows = result.data
      // 校验必要列
      if (!rows.length || !('subgroup' in rows[0]) || !('measure' in rows[0])) {
        throw new Error('CSV必须包含 subgroup 和 measure 列')
      }

      // 保存到数据库
      await db.records.add({
        fileName: file.name,
        uploadTime: Date.now(),
        data: rows
      })

      ElMessage.success('文件解析入库成功')
      refreshList()
    } catch (err) {
      ElMessage.error(`文件处理失败: ${err.message}`)
    }
  }
  reader.readAsText(file, 'utf-8')
}

// 选中履历
function handleSelect(row) {
  if (!row) return
  detail.value = row
  chartLoading.value = true // 先显示加载状态

  // 确保DOM更新完成后，先关闭加载状态，再等待容器渲染
  nextTick(() => {
    setTimeout(() => {
      try {
        // 1. 先关闭加载状态，让图表容器DOM渲染出来
        chartLoading.value = false
        // 2. 再次等待DOM更新，确保容器已存在
        nextTick(() => {
          drawCharts() // 此时容器已渲染，可安全绘制图表
        })
      } catch (err) {
        chartLoading.value = false
        ElMessage.error(`图表渲染失败: ${err.message}`)
      }
    }, 100)
  })
}

// 响应窗口大小变化
function handleResize() {
  if (xBarChartInst) {
    try {
      xBarChartInst.resize()
    } catch (e) {
      console.error('X-Bar图表调整大小失败:', e)
    }
  }
  if (rChartInst) {
    try {
      rChartInst.resize()
    } catch (e) {
      console.error('R图表调整大小失败:', e)
    }
  }
}

// 绘制X-R图 (修复DOM初始化问题)
function drawCharts() {
  // 销毁旧图表实例
  if (xBarChartInst) {
    xBarChartInst.dispose()
    xBarChartInst = null
  }
  if (rChartInst) {
    rChartInst.dispose()
    rChartInst = null
  }

  // 确保DOM元素存在
  if (!xBarChart.value || !rChart.value) {
    throw new Error('图表容器未找到')
  }

  // 初始化图表
  xBarChartInst = echarts.init(xBarChart.value)
  rChartInst = echarts.init(rChart.value)

  const rawData = detail.value.data

  // 按subgroup分组并排序
  const groups = {}
  rawData.forEach(item => {
    const sg = item.subgroup
    if (sg === undefined || sg === null) return

    if (!groups[sg]) groups[sg] = []
    if (typeof item.measure === 'number') {
      groups[sg].push(item.measure)
    }
  })

  // 获取有效子组
  const subgroups = Object.keys(groups)
      .filter(sg => groups[sg].length > 0)
      .sort((a, b) => {
        // 处理数字和字符串混合情况
        const numA = Number(a)
        const numB = Number(b)
        return isNaN(numA) || isNaN(numB) ? a.localeCompare(b) : numA - numB
      })

  if (subgroups.length === 0) {
    throw new Error('没有有效的子组数据')
  }

  // 计算X-Bar和R值
  const xBarData = []
  const rData = []

  subgroups.forEach(sg => {
    const values = groups[sg]
    const avg = values.reduce((sum, val) => sum + val, 0) / values.length
    const range = Math.max(...values) - Math.min(...values)

    xBarData.push(avg)
    rData.push(range)
  })

  // 计算控制限
  const n = groups[subgroups[0]].length // 子组样本数
  const xBarAvg = xBarData.reduce((sum, val) => sum + val, 0) / xBarData.length
  const rAvg = rData.reduce((sum, val) => sum + val, 0) / rData.length

  // 控制图系数表 (子组大小2-10)
  const controlFactors = {
    2: { A2: 1.880, D3: 0, D4: 3.267 },
    3: { A2: 1.023, D3: 0, D4: 2.574 },
    4: { A2: 0.729, D3: 0, D4: 2.282 },
    5: { A2: 0.577, D3: 0, D4: 2.114 },
    6: { A2: 0.483, D3: 0, D4: 2.004 },
    7: { A2: 0.419, D3: 0.076, D4: 1.924 },
    8: { A2: 0.373, D3: 0.136, D4: 1.864 },
    9: { A2: 0.337, D3: 0.184, D4: 1.816 },
    10: { A2: 0.308, D3: 0.223, D4: 1.777 }
  }

  const factors = controlFactors[n] || controlFactors[5] // 默认使用5个样本的系数
  const A2 = factors.A2
  const D3 = factors.D3
  const D4 = factors.D4

  const xUCL = xBarAvg + A2 * rAvg
  const xLCL = xBarAvg - A2 * rAvg
  const rUCL = D4 * rAvg
  const rLCL = D3 * rAvg

  // 配置X-Bar控制图
  const xBarOption = {
    tooltip: {
      trigger: 'axis',
      formatter: (params) => {
        const data = params[0]
        return `子组: ${data.name}<br/>平均值: ${data.value.toFixed(4)}`
      }
    },
    grid: {
      left: '5%',
      right: '5%',
      bottom: '15%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: subgroups,
      name: '子组号',
      nameLocation: 'middle',
      nameGap: 25
    },
    yAxis: {
      type: 'value',
      name: '平均值',
      scale: true
    },
    series: [{
      name: 'X-Bar',
      type: 'line',
      data: xBarData,
      symbol: 'circle',
      symbolSize: 8,
      lineStyle: {
        width: 2
      },
      markLine: {
        silent: true,
        data: [
          { name: 'UCL', yAxis: xUCL, lineStyle: { color: '#f56c6c', type: 'dashed' } },
          { name: 'CL', yAxis: xBarAvg, lineStyle: { color: '#67c23a' } },
          { name: 'LCL', yAxis: xLCL, lineStyle: { color: '#f56c6c', type: 'dashed' } }
        ],
        label: {
          position: 'end',
          formatter: (param) => `${param.name}: ${param.value.toFixed(4)}`
        }
      }
    }]
  }

  // 配置R控制图
  const rOption = {
    tooltip: {
      trigger: 'axis',
      formatter: (params) => {
        const data = params[0]
        return `子组: ${data.name}<br/>极差: ${data.value.toFixed(4)}`
      }
    },
    grid: {
      left: '5%',
      right: '5%',
      bottom: '15%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: subgroups,
      name: '子组号',
      nameLocation: 'middle',
      nameGap: 25
    },
    yAxis: {
      type: 'value',
      name: '极差',
      scale: true,
      min: 0 // 确保极差从0开始
    },
    series: [{
      name: 'R',
      type: 'line',
      data: rData,
      symbol: 'circle',
      symbolSize: 8,
      lineStyle: {
        width: 2
      },
      markLine: {
        silent: true,
        data: [
          { name: 'UCL', yAxis: rUCL, lineStyle: { color: '#f56c6c', type: 'dashed' } },
          { name: 'CL', yAxis: rAvg, lineStyle: { color: '#67c23a' } },
          { name: 'LCL', yAxis: rLCL, lineStyle: { color: '#f56c6c', type: 'dashed' } }
        ],
        label: {
          position: 'end',
          formatter: (param) => `${param.name}: ${param.value.toFixed(4)}`
        }
      }
    }]
  }

  // 渲染图表
  xBarChartInst.setOption(xBarOption)
  rChartInst.setOption(rOption)
}

// 导出图表
function exportChart() {
  if (!xBarChartInst || !rChartInst) return

  try {
    // 创建临时容器导出
    const container = document.createElement('div')
    container.style.position = 'fixed'
    container.style.left = '-9999px'
    document.body.appendChild(container)

    // 创建X-Bar图
    const xBarTemp = document.createElement('div')
    xBarTemp.style.width = '800px'
    xBarTemp.style.height = '400px'
    container.appendChild(xBarTemp)
    const xBarTempChart = echarts.init(xBarTemp)
    xBarTempChart.setOption(xBarChartInst.getOption())

    // 创建R图
    const rTemp = document.createElement('div')
    rTemp.style.width = '800px'
    rTemp.style.height = '400px'
    container.appendChild(rTemp)
    const rTempChart = echarts.init(rTemp)
    rTempChart.setOption(rChartInst.getOption())

    // 延迟确保图表渲染完成
    setTimeout(() => {
      const xBarUrl = xBarTempChart.getDataURL({ type: 'png', pixelRatio: 2 })
      const rUrl = rTempChart.getDataURL({ type: 'png', pixelRatio: 2 })

      const link = document.createElement('a')
      link.href = xBarUrl
      link.download = `X-Bar控制图_${detail.value.fileName}.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      setTimeout(() => {
        const link2 = document.createElement('a')
        link2.href = rUrl
        link2.download = `R控制图_${detail.value.fileName}.png`
        document.body.appendChild(link2)
        link2.click()
        document.body.removeChild(link2)

        // 清理临时元素
        document.body.removeChild(container)
      }, 300)

      ElMessage.success('图表导出成功')
    }, 500)
  } catch (err) {
    ElMessage.error(`图表导出失败: ${err.message}`)
  }
}
</script>

<style scoped>
.el-header {
  background-color: #409eff;
  color: #fff;
}

/* 图表容器样式 */
.chart-container {
  height: calc(100% - 40px);
  display: flex;
  flex-direction: column;
}

.chart-title {
  font-size: 16px;
  font-weight: bold;
  text-align: center;
  padding: 8px 0;
  background-color: #f5f7fa;
}

.chart-area {
  height: 45%;
  width: 100%;
  min-height: 250px; /* 确保最小高度 */
}

.chart-divider {
  height: 10px;
}

.empty-chart {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.chart-loading {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #606266;
}

.chart-loading .el-icon {
  margin-bottom: 10px;
  animation: rotating 2s linear infinite;
}

@keyframes rotating {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
