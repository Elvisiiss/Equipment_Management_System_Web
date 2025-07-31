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
                accept=".csv,.xlsx"
                :auto-upload="false"
                :show-file-list="false"
                :on-change="handleFileChange"
            >
              <el-button type="primary" :icon="Upload">选择文件</el-button>
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
              >导出图片</el-button
              >
            </template>
            <div ref="chartRef" style="width:100%;height:calc(100% - 20px)" />
          </el-card>
        </el-col>
      </el-row>
    </el-main>
  </el-container>
</template>

<script setup>
import { ref, reactive, computed, nextTick, watch } from 'vue'
import * as echarts from 'echarts'
import { ElMessage } from 'element-plus'
import { Upload } from '@element-plus/icons-vue'
import Papa from 'papaparse'
import { db } from '@/utils/db'

// -------------------- 数据 --------------------
const keyword = ref('')
const records = ref([])
const currentPage = ref(1)
const pageSize = 10
const detail = ref(null) // 当前选中的履历
let chartInst = null
const chartRef = ref(null)

// -------------------- 计算属性 --------------------
const filtered = computed(() =>
    records.value.filter(r => r.fileName.includes(keyword.value))
)
const pageData = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return filtered.value.slice(start, start + pageSize)
})

// -------------------- 生命周期 --------------------
refreshList()

// -------------------- 方法 --------------------
async function refreshList () {
  records.value = await db.records.orderBy('uploadTime').reverse().toArray()
}

// 上传解析
function handleFileChange (uploadFile) {
  const file = uploadFile.raw
  const fileName = file.name
  const reader = new FileReader()
  reader.onload = async e => {
    try {
      const text = e.target.result
      // 简单判断 csv / xlsx
      let rows = []
      if (fileName.endsWith('.csv')) {
        rows = Papa.parse(text, { header: true, dynamicTyping: true }).data
      } else {
        ElMessage.error('暂时只支持 CSV')
        return
      }
      // 校验列
      if (!rows.length || !('subgroup' in rows[0]) || !('measure' in rows[0])) {
        ElMessage.error('文件必须包含 subgroup, measure 列！')
        return
      }
      await db.records.add({ fileName, uploadTime: Date.now(), data: rows })
      ElMessage.success('解析入库成功')
      refreshList()
    } catch (err) {
      ElMessage.error(err.message || '解析失败')
    }
  }
  reader.readAsText(file, 'utf-8')
}

// 选中履历
function handleSelect (row) {
  if (!row) return
  detail.value = row
  nextTick(drawChart)
}

// 绘制 X-R 图
function drawChart () {
  if (chartInst) chartInst.dispose()
  chartInst = echarts.init(chartRef.value)
  const raw = detail.value.data
  // 按 subgroup 分组
  const groups = {}
  raw.forEach(r => {
    const k = r.subgroup
    if (!groups[k]) groups[k] = []
    groups[k].push(r.measure)
  })

  const subgroups = Object.keys(groups).map(Number).sort((a, b) => a - b)
  const xbar = []
  const r = []

  subgroups.forEach(sg => {
    const arr = groups[sg]
    const avg = arr.reduce((s, v) => s + v, 0) / arr.length
    const range = Math.max(...arr) - Math.min(...arr)
    xbar.push({ subgroup: sg, value: avg })
    r.push({ subgroup: sg, value: range })
  })

  // 计算控制限（极差法）
  const n = Object.values(groups)[0].length || 1
  const A2 = { 2: 1.88, 3: 1.02, 4: 0.73, 5: 0.58, 6: 0.48, 7: 0.42, 8: 0.37, 9: 0.34, 10: 0.31 }[n] || 1.88
  const D4 = { 2: 3.27, 3: 2.57, 4: 2.28, 5: 2.11, 6: 2.00, 7: 1.92, 8: 1.86, 9: 1.82, 10: 1.78 }[n] || 3.27
  const D3 = 0

  const rBar = r.reduce((s, v) => s + v.value, 0) / r.length
  const xBarBar = xbar.reduce((s, v) => s + v.value, 0) / xbar.length

  const xucl = xBarBar + A2 * rBar
  const xlcl = xBarBar - A2 * rBar
  const rucl = D4 * rBar
  const rlcl = D3 * rBar

  const option = {
    title: [
      { text: 'X-Bar 图', left: '25%', top: 0 },
      { text: 'R 图', left: '75%', top: 0 }
    ],
    tooltip: { trigger: 'axis' },
    grid: [
      { left: '7%', right: '53%', top: '8%', bottom: '55%' },
      { left: '53%', right: '7%', top: '8%', bottom: '55%' }
    ],
    xAxis: [
      { type: 'category', gridIndex: 0, data: subgroups, name: 'subgroup' },
      { type: 'category', gridIndex: 1, data: subgroups, name: 'subgroup' }
    ],
    yAxis: [
      { type: 'value', gridIndex: 0, name: 'X̄' },
      { type: 'value', gridIndex: 1, name: 'R' }
    ],
    series: [
      {
        name: 'X̄',
        type: 'line',
        data: xbar.map(v => v.value),
        markLine: {
          silent: true,
          lineStyle: { color: '#5470c6' },
          data: [
            { type: 'average', name: 'CL' },
            { yAxis: xucl, name: 'UCL' },
            { yAxis: xlcl, name: 'LCL' }
          ]
        }
      },
      {
        name: 'R',
        type: 'line',
        xAxisIndex: 1,
        yAxisIndex: 1,
        data: r.map(v => v.value),
        markLine: {
          silent: true,
          lineStyle: { color: '#91cc75' },
          data: [
            { type: 'average', name: 'CL' },
            { yAxis: rucl, name: 'UCL' },
            { yAxis: rlcl, name: 'LCL' }
          ]
        }
      }
    ]
  }
  chartInst.setOption(option)
}

// 导出图表
function exportChart () {
  const url = chartInst.getDataURL({ type: 'png', pixelRatio: 2 })
  const a = document.createElement('a')
  a.href = url
  a.download = `SPC-${detail.value.fileName}.png`
  a.click()
}

// 监听窗口大小
window.addEventListener('resize', () => chartInst && chartInst.resize())
</script>

<style scoped>
.el-header {
  background-color: #409eff;
  color: #fff;
}
</style>
