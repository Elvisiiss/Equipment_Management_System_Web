<!-- QualityOEE.vue -->
<template>
  <el-card>
    <el-tabs v-model="activeDim" @tab-change="handleTabChange">
      <el-tab-pane label="日" name="day"/>
      <el-tab-pane label="周" name="week"/>
      <el-tab-pane label="月" name="month"/>
      <el-tab-pane label="年" name="year"/>
    </el-tabs>

    <!-- 查询条件 -->
    <el-form :model="queryForm" inline>
      <!-- 公共字段 -->
      <el-form-item label="车间">
        <el-select v-model="queryForm.workshop" clearable filterable placeholder="请选择">
          <el-option v-for="w in mockOptions.workshop" :key="w" :label="w" :value="w"/>
        </el-select>
      </el-form-item>
      <el-form-item label="产线">
        <el-select v-model="queryForm.line" clearable filterable placeholder="请选择">
          <el-option v-for="l in mockOptions.line" :key="l" :label="l" :value="l"/>
        </el-select>
      </el-form-item>
      <el-form-item label="工段">
        <el-select v-model="queryForm.section" clearable filterable placeholder="请选择">
          <el-option v-for="s in mockOptions.section" :key="s" :label="s" :value="s"/>
        </el-select>
      </el-form-item>
      <el-form-item label="设备编码">
        <el-input v-model="queryForm.equipCode" clearable placeholder="设备编码"/>
      </el-form-item>
      <el-form-item label="设备名称">
        <el-input v-model="queryForm.equipName" clearable placeholder="设备名称"/>
      </el-form-item>
      <el-form-item label="厂商">
        <el-select v-model="queryForm.vendor" clearable placeholder="请选择">
          <el-option v-for="v in mockOptions.vendor" :key="v" :label="v" :value="v"/>
        </el-select>
      </el-form-item>
      <el-form-item label="班次">
        <el-select v-model="queryForm.shift" clearable placeholder="请选择">
          <el-option v-for="s in mockOptions.shift" :key="s" :label="s" :value="s"/>
        </el-select>
      </el-form-item>

      <!-- 维度特有字段 -->
      <template v-if="activeDim==='day'">
        <el-form-item label="开始时间">
          <el-date-picker v-model="queryForm.start" type="date" value-format="YYYY-MM-DD"/>
        </el-form-item>
        <el-form-item label="结束时间">
          <el-date-picker v-model="queryForm.end" type="date" value-format="YYYY-MM-DD"/>
        </el-form-item>
      </template>

      <template v-if="activeDim==='week'">
        <el-form-item label="年份">
          <el-date-picker v-model="queryForm.year" type="year" format="YYYY" value-format="YYYY"/>
        </el-form-item>
        <el-form-item label="开始周">
          <el-input-number v-model="queryForm.startWeek" :min="1" :max="53"/>
        </el-form-item>
        <el-form-item label="结束周">
          <el-input-number v-model="queryForm.endWeek" :min="1" :max="53"/>
        </el-form-item>
      </template>

      <template v-if="activeDim==='month'">
        <el-form-item label="起始月">
          <el-date-picker v-model="queryForm.startMonth" type="month" value-format="YYYY-MM"/>
        </el-form-item>
        <el-form-item label="结束月">
          <el-date-picker v-model="queryForm.endMonth" type="month" value-format="YYYY-MM"/>
        </el-form-item>
      </template>

      <template v-if="activeDim==='year'">
        <el-form-item label="年份范围">
          <el-date-picker
              v-model="queryForm.yearRange"
              type="yearrange"
              range-separator="至"
              start-placeholder="开始年份"
              end-placeholder="结束年份"
              value-format="YYYY"
          />
        </el-form-item>
      </template>

      <el-form-item>
        <el-button type="primary" @click="query">查询</el-button>
        <el-button @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- 图表 -->
    <div ref="chartRef" style="height:350px;margin-top:16px"/>

    <!-- 表格 -->
    <el-table :data="tableData" stripe style="width:100%;margin-top:16px">
      <el-table-column prop="date" label="日期"/>
      <el-table-column prop="good" label="良品"/>
      <el-table-column prop="bad" label="不良品"/>
      <el-table-column prop="output" label="产量"/>
      <el-table-column prop="total" label="总数"/>
      <el-table-column label="良率(%)">
        <template #default="{row}">{{ (row.good / (row.good + row.bad) * 100).toFixed(2) }}</template>
      </el-table-column>
    </el-table>
  </el-card>
</template>

<script setup>
import {nextTick, onMounted, reactive, ref, watch} from 'vue'
import {ElMessage} from 'element-plus'
import * as echarts from 'echarts'

/* 当前维度 */
const activeDim = ref('day')

/* 图表实例 */
let chart = null
const chartRef = ref()

/* 查询表单结构 */
const queryForm = reactive({
  /* 公共 */
  workshop: '',
  line: '',
  section: '',
  equipCode: '',
  equipName: '',
  vendor: '',
  shift: '',
  /* 日 */
  start: '',
  end: '',
  /* 周 */
  year: '',
  startWeek: 1,
  endWeek: 53,
  /* 月 */
  startMonth: '',
  endMonth: '',
  /* 年 */
  yearRange: []
})

/* 下拉选项 */
const mockOptions = {
  workshop: ['A车间', 'B车间', 'C车间'],
  line: ['L1', 'L2', 'L3'],
  section: ['S1', 'S2'],
  vendor: ['V1', 'V2'],
  shift: ['早班', '中班', '晚班']
}

/* 表格数据 */
const tableData = ref([])

/* 模拟请求 */
function fetchData() {
  const dim = activeDim.value
  const days = dim === 'day' ? 7 : dim === 'week' ? 10 : dim === 'month' ? 12 : 5
  const data = []
  for (let i = 0; i < days; i++) {
    const good = Math.floor(Math.random() * 1000) + 200
    const bad = Math.floor(Math.random() * 200) + 10
    let label
    if (dim === 'day') label = `2025-08-${String(i + 1).padStart(2, '0')}`
    else if (dim === 'week') label = `第${i + 1}周`
    else if (dim === 'month') label = `2025-${String(i + 1).padStart(2, '0')}`
    else label = `${2020 + i}年`
    data.push({
      date: label,
      good,
      bad,
      output: good + bad,
      total: good + bad
    })
  }
  tableData.value = data
  renderChart(data)
}

/* 渲染柱状图 */
function renderChart(list) {
  if (!chart) chart = echarts.init(chartRef.value)
  chart.setOption({
    title: {text: `${activeDim.value}维度质量稼动率`, left: 'center'},
    tooltip: {trigger: 'axis'},
    xAxis: {type: 'category', data: list.map(i => i.date)},
    yAxis: {type: 'value', name: '数量'},
    series: [
      {name: '良品', type: 'bar', data: list.map(i => i.good), itemStyle: {color: '#67C23A'}},
      {name: '不良品', type: 'bar', data: list.map(i => i.bad), itemStyle: {color: '#F56C6C'}}
    ],
    legend: {data: ['良品', '不良品'], top: 30}
  })
}

/* 查询 */
function query() {
  fetchData()
  ElMessage.success('查询成功')
}

/* 重置 */
function resetQuery() {
  Object.keys(queryForm).forEach(k => queryForm[k] = '')
  queryForm.startWeek = 1
  queryForm.endWeek = 53
}

/* Tab 切换 */
function handleTabChange() {
  resetQuery()
  nextTick(fetchData)
}

/* 首次进入 */
onMounted(() => {
  fetchData()
})
</script>

<style>
body {
  margin: 0;
  font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
}
</style>
