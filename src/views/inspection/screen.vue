<template>
  <div class="screen">
    <!-- 顶部 -->
    <div class="header">
      <div class="title">点检数据实时大屏</div>
      <div class="subTitle">{{ now }}</div>
    </div>

    <!-- 六大指标卡片 -->
    <div class="cards">
      <Card v-for="c in cardList" :key="c.title" v-bind="c" />
    </div>

    <!-- 四块内容 -->
    <div class="blocks">
      <!-- 车间完成率 -->
      <Panel title="车间完成率"><PieChart :data="workshopPie" /></Panel>
      <!-- 产线完成率 -->
      <Panel title="产线完成率"><BarChart :data="lineBar" /></Panel>
      <!-- 不合格设备 -->
      <Panel title="不合格设备">
        <el-table :data="unqualified" height="260" stripe>
          <el-table-column prop="device" label="设备" />
          <el-table-column prop="reason" label="原因" />
          <el-table-column prop="nextTime" label="应检时间" />
        </el-table>
      </Panel>
      <!-- 未完成责任人 -->
      <Panel title="未完成责任人">
        <el-table :data="personTable" height="260" stripe>
          <el-table-column prop="person" label="责任人" />
          <el-table-column prop="count" label="未完成次数" />
        </el-table>
      </Panel>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import * as echarts from 'echarts'

/* ---------------- 模拟数据 ---------------- */
const list = ref([
  { workshop: '一车间', line: 'A产线', device: '设备A', status: '已完成', fault: 0, persons: ['张三'], nextTime: '2025-08-01 08:00' },
  { workshop: '二车间', line: 'B产线', device: '设备B', status: '未完成', fault: 1, persons: ['李四'], nextTime: '2025-07-30 09:00' },
  { workshop: '一车间', line: 'A产线', device: '设备C', status: '故障', fault: 3, persons: ['王五'], nextTime: '2025-07-29 10:00' },
  { workshop: '二车间', line: 'B产线', device: '设备D', status: '超时', fault: 2, persons: ['张三'], nextTime: '2025-07-28 11:00' },
  { workshop: '三车间', line: 'C产线', device: '设备E', status: '已完成', fault: 0, persons: ['赵六'], nextTime: '2025-08-02 12:00' },
  { workshop: '三车间', line: 'C产线', device: '设备F', status: '故障', fault: 4, persons: ['张三'], nextTime: '2025-07-27 13:00' }
  /* 可继续追加 */
])

/* ---------------- 时间 ---------------- */
const now = ref(new Date().toLocaleString())
setInterval(() => (now.value = new Date().toLocaleString()), 1000)

/* ---------------- 指标卡片 ---------------- */
const total = computed(() => list.value.length)
const finished = computed(() => list.value.filter(i => i.status === '已完成').length)
const completionRate = computed(((finished.value / total.value) * 100).toFixed(1))
const faultCount = computed(() => list.value.filter(i => i.status === '故障').length)
const timeoutCount = computed(() => list.value.filter(i => i.status === '超时').length)
const todayPending = computed(() => list.value.filter(i => i.status === '未完成').length)

const cardList = [
  { title: '总设备数', value: total.value, color: '#00c6ff' },
  { title: '已完成', value: finished.value, color: '#00ff7f' },
  { title: '完成率', value: completionRate.value + '%', color: '#ffdf00' },
  { title: '故障数', value: faultCount.value, color: '#ff4d4f' },
  { title: '超时未检', value: timeoutCount.value, color: '#ff8c00' },
  { title: '今日待检', value: todayPending.value, color: '#00ffff' }
]

/* ---------------- 图表数据 ---------------- */
const workshopPie = computed(() => {
  const g = {}
  list.value.forEach(d => {
    g[d.workshop] = g[d.workshop] || { total: 0, finished: 0 }
    g[d.workshop].total++
    if (d.status === '已完成') g[d.workshop].finished++
  })
  return Object.entries(g).map(([name, { total, finished }]) => ({ name, value: Math.round((finished / total) * 100) }))
})

const lineBar = computed(() => {
  const g = {}
  list.value.forEach(d => {
    g[d.line] = g[d.line] || { total: 0, finished: 0 }
    g[d.line].total++
    if (d.status === '已完成') g[d.line].finished++
  })
  return Object.entries(g).map(([name, { total, finished }]) => ({ name, value: Math.round((finished / total) * 100) }))
})

const unqualified = computed(() =>
    list.value
        .filter(i => i.status !== '已完成')
        .map(i => ({ device: i.device, reason: i.status, nextTime: i.nextTime }))
        .slice(0, 10)
)

const personTable = computed(() => {
  const map = {}
  list.value
      .filter(i => i.status !== '已完成')
      .forEach(i => i.persons.forEach(p => (map[p] = (map[p] || 0) + 1)))
  return Object.entries(map)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([person, count]) => ({ person, count }))
})

/* ---------------- 图表渲染 ---------------- */
const workshopPieEl = ref()
const lineBarEl = ref()
const faultBarEl = ref()
const personBarEl = ref()

function render() {
  // 车间环形
  echarts.init(workshopPieEl.value).setOption({
    tooltip: { formatter: '{b}: {c}%' },
    series: [{ type: 'pie', radius: ['40%', '70%'], label: { show: true }, data: workshopPie.value }]
  })
  // 产线条形
  echarts.init(lineBarEl.value).setOption({
    tooltip: {},
    xAxis: { type: 'category', data: lineBar.value.map(i => i.name) },
    yAxis: { type: 'value', max: 100 },
    series: [{ type: 'bar', data: lineBar.value.map(i => i.value), itemStyle: { color: '#67c23a' } }]
  })
  // 设备故障 TOP10
  echarts.init(faultBarEl.value).setOption({
    tooltip: {},
    xAxis: { type: 'category', data: list.value.filter(i => i.fault > 0).sort((a, b) => b.fault - a.fault).slice(0, 10).map(i => i.device) },
    yAxis: { type: 'value' },
    series: [{ type: 'bar', data: list.value.filter(i => i.fault > 0).sort((a, b) => b.fault - a.fault).slice(0, 10).map(i => i.fault), itemStyle: { color: '#f56c6c' } }]
  })
  // 责任人未完成 TOP10
  echarts.init(personBarEl.value).setOption({
    tooltip: {},
    xAxis: { type: 'category', data: personTable.value.map(i => i.person) },
    yAxis: { type: 'value' },
    series: [{ type: 'bar', data: personTable.value.map(i => i.count), itemStyle: { color: '#409eff' } }]
  })
}

/* ---------------- 缩放 ---------------- */
const zoom = ref(1)
function calcZoom() {
  zoom.value = Math.min(window.innerWidth / 1920, window.innerHeight / 1080)
}
onMounted(() => {
  nextTick(render)
  calcZoom()
  window.addEventListener('resize', () => {
    calcZoom()
    Object.values([workshopPieEl, lineBarEl, faultBarEl, personBarEl]).forEach(el =>
        echarts.getInstanceByDom(el.value)?.resize()
    )
  })
})
</script>

<style scoped>
.screen {
  width: 1920px;
  height: 1080px;
  transform-origin: top left;
  background: #0e1a2b;
  color: #fff;
  font-family: 'Arial', sans-serif;
  overflow: hidden;
}
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 40px;
  height: 80px;
  background: linear-gradient(90deg, #001529, #003366);
  font-size: 32px;
}
.cards {
  display: flex;
  justify-content: space-around;
  padding: 20px 40px;
}
.blocks {
  display: flex;
  justify-content: space-between;
  padding: 0 40px;
  height: 320px;
}
.tables {
  display: flex;
  justify-content: space-between;
  padding: 0 40px;
  height: 320px;
}
</style>
