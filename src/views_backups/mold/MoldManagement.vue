
<template>
  <div class="mold-management">
    <h2>模具管理总览</h2>

    <!-- 统计卡片 -->
    <div class="stats-cards">
      <div class="card">
        <h3>模具总数</h3>
        <div class="value">{{ moldStats.total }}</div>
      </div>
      <div class="card">
        <h3>使用中</h3>
        <div class="value">{{ moldStats.inUse }}</div>
      </div>
      <div class="card">
        <h3>库存中</h3>
        <div class="value">{{ moldStats.inStock }}</div>
      </div>
      <div class="card">
        <h3>需保养</h3>
        <div class="value">{{ moldStats.needMaintenance }}</div>
      </div>
    </div>

    <!-- 图表区域 -->
    <div class="chart-area">
      <div class="chart">
        <h3>每月保养次数</h3>
        <div class="bar-chart">
          <div v-for="item in maintenanceData" :key="item.month" class="bar-container">
            <div class="bar" :style="{ height: item.count * 20 + 'px' }"></div>
            <div class="label">{{ item.month }}</div>
            <div class="value">{{ item.count }}</div>
          </div>
        </div>
      </div>
      <div class="chart">
        <h3>模具状态分布</h3>
        <div class="pie-chart">
          <div v-for="item in statusData" :key="item.status" class="pie-segment"
               :style="{ '--percentage': (item.count / moldStats.total) * 100 + '%' }">
            <div class="segment-label">{{ item.status }} ({{ item.count }})</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 最近操作记录 -->
    <div class="recent-operations">
      <h3>最近操作记录</h3>
      <table>
        <thead>
        <tr>
          <th>记录ID</th>
          <th>模具ID</th>
          <th>操作类型</th>
          <th>操作人</th>
          <th>日期</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="op in recentOperations" :key="op.id">
          <td>{{ op.id }}</td>
          <td>{{ op.mold }}</td>
          <td>{{ op.type }}</td>
          <td>{{ op.operator }}</td>
          <td>{{ op.date }}</td>
        </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

// 假数据
const moldStats = ref({
  total: 56,
  inUse: 32,
  inStock: 24,
  needMaintenance: 5
})

const recentOperations = ref([
  { id: 'OP001', mold: 'M001', type: '安装', operator: '张三', date: '2023-06-01' },
  { id: 'OP002', mold: 'M002', type: '入库', operator: '李四', date: '2023-05-30' },
  { id: 'OP003', mold: 'M003', type: '保养', operator: '王五', date: '2023-05-28' }
])

const maintenanceData = computed(() => {
  return [
    { month: '1月', count: 3 },
    { month: '2月', count: 5 },
    { month: '3月', count: 4 },
    { month: '4月', count: 6 },
    { month: '5月', count: 2 },
    { month: '6月', count: 5 }
  ]
})

const statusData = computed(() => {
  return [
    { status: '使用中', count: moldStats.value.inUse },
    { status: '库存中', count: moldStats.value.inStock },
    { status: '维修中', count: 2 },
    { status: '报废', count: 1 }
  ]
})
</script>

<style scoped>
.mold-management {
  padding: 20px;
  background-color: #f5f7fa;
}
.stats-cards {
  display: flex;
  gap: 20px;
  margin-bottom: 30px;
}
.card {
  flex: 1;
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  text-align: center;
}
.card h3 {
  margin-top: 0;
  color: #666;
}
.card .value {
  font-size: 2.5rem;
  font-weight: bold;
  color: #333;
}
.chart-area {
  display: flex;
  gap: 20px;
  margin-bottom: 30px;
}
.chart {
  flex: 1;
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}
.bar-chart {
  display: flex;
  height: 200px;
  align-items: flex-end;
  gap: 30px;
  padding: 20px 0;
}
.bar-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
}
.bar {
  width: 40px;
  background-color: #4a89dc;
  border-radius: 4px 4px 0 0;
  transition: height 0.5s;
}
.label {
  margin-top: 10px;
}
.value {
  margin-top: 5px;
  font-weight: bold;
}
.pie-chart {
  width: 200px;
  height: 200px;
  border-radius: 50%;
  background: conic-gradient(
      #4a89dc 0% var(--percentage-1),
      #37bc9b var(--percentage-1) var(--percentage-2),
      #f6bb42 var(--percentage-2) var(--percentage-3),
      #da4453 var(--percentage-3) 100%
  );
  margin: 20px auto;
  position: relative;
}
.pie-segment {
  position: absolute;
  width: 100%;
  height: 100%;
  clip-path: polygon(50% 50%, 50% 0, 100% 0, 100% 100%, 0 100%, 0 0, 50% 0);
}
.segment-label {
  position: absolute;
  font-size: 12px;
  padding: 5px;
  background-color: rgba(255,255,255,0.8);
  border-radius: 4px;
}
.recent-operations {
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}
table {
  width: 100%;
  border-collapse: collapse;
}
th, td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: left;
}
th {
  background-color: #f2f2f2;
}
</style>
