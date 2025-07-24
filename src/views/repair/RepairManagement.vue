<script setup>
import { ref, computed } from 'vue';

// 假数据
const repairStats = ref({
  total: 125,
  pending: 8,
  inProgress: 15,
  completed: 102
});

const recentRepairs = ref([
  { deviceId: 'DEV-001', type: '硬件故障', status: '已处理', time: '2023-05-05 09:00' },
  { deviceId: 'DEV-002', type: '软件故障', status: '处理中', time: '2023-05-05 10:30' },
  { deviceId: 'DEV-003', type: '网络问题', status: '待处理', time: '2023-05-05 11:15' }
]);

const deviceTypes = ref([
  { name: '打印机', count: 45 },
  { name: '电脑', count: 60 },
  { name: '网络设备', count: 20 }
]);

const faultTypes = computed(() => {
  return [
    { name: '硬件故障', value: 65 },
    { name: '软件故障', value: 40 },
    { name: '网络问题', value: 20 }
  ];
});

const monthlyStats = computed(() => {
  return {
    labels: ['1月', '2月', '3月', '4月', '5月'],
    data: [15, 20, 25, 30, 35]
  };
});
</script>

<template>
  <div class="repair-management">
    <h1>设备维修管理总览</h1>

    <div class="stats-cards">
      <div class="stat-card">
        <h3>总报修数</h3>
        <p class="big-number">{{ repairStats.total }}</p>
      </div>
      <div class="stat-card">
        <h3>待处理</h3>
        <p class="big-number">{{ repairStats.pending }}</p>
      </div>
      <div class="stat-card">
        <h3>处理中</h3>
        <p class="big-number">{{ repairStats.inProgress }}</p>
      </div>
      <div class="stat-card">
        <h3>已完成</h3>
        <p class="big-number">{{ repairStats.completed }}</p>
      </div>
    </div>

    <div class="charts-row">
      <div class="chart-container">
        <h3>设备类型分布</h3>
        <div class="pie-chart">
          <div v-for="item in deviceTypes" :key="item.name" class="pie-segment"
               :style="`--value: ${item.count}`">
            <span>{{ item.name }} ({{ item.count }})</span>
          </div>
        </div>
      </div>

      <div class="chart-container">
        <h3>故障类型分布</h3>
        <div class="bar-chart">
          <div v-for="item in faultTypes" :key="item.name" class="bar">
            <div class="bar-fill" :style="`width: ${item.value}%`"></div>
            <span>{{ item.name }} ({{ item.value }})</span>
          </div>
        </div>
      </div>
    </div>

    <div class="monthly-trend">
      <h3>月度报修趋势</h3>
      <div class="trend-chart">
        <div v-for="(month, index) in monthlyStats.labels" :key="month" class="trend-bar">
          <div class="trend-fill" :style="`height: ${monthlyStats.data[index]}px`"></div>
          <span>{{ month }}</span>
        </div>
      </div>
    </div>

    <div class="recent-repairs">
      <h3>最近报修记录</h3>
      <table>
        <thead>
        <tr>
          <th>设备编号</th>
          <th>故障类型</th>
          <th>状态</th>
          <th>时间</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="item in recentRepairs" :key="item.deviceId">
          <td>{{ item.deviceId }}</td>
          <td>{{ item.type }}</td>
          <td>{{ item.status }}</td>
          <td>{{ item.time }}</td>
        </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.repair-management {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}
.stats-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 30px;
}
.stat-card {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  text-align: center;
}
.big-number {
  font-size: 2.5rem;
  font-weight: bold;
  margin: 10px 0;
}
.charts-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 30px;
}
.chart-container {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}
.pie-chart {
  width: 100%;
  height: 300px;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
}
.pie-segment {
  width: calc(var(--value) * 2px);
  height: calc(var(--value) * 2px);
  border-radius: 50%;
  margin: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
  background: conic-gradient(
      from 0deg,
      #4CAF50 0% 33%,
      #2196F3 33% 66%,
      #FFC107 66% 100%
  );
}
.bar-chart {
  margin-top: 20px;
}
.bar {
  margin-bottom: 15px;
}
.bar-fill {
  height: 20px;
  background: #4CAF50;
  margin-bottom: 5px;
}
.monthly-trend {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  margin-bottom: 30px;
}
.trend-chart {
  display: flex;
  height: 200px;
  align-items: flex-end;
  gap: 30px;
  padding-top: 20px;
}
.trend-bar {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.trend-fill {
  width: 30px;
  background: #2196F3;
  margin-bottom: 5px;
}
table {
  width: 100%;
  border-collapse: collapse;
}
th, td {
  border: 1px solid #ddd;
  padding: 12px;
  text-align: left;
}
th {
  background-color: #f2f2f2;
}
</style>
