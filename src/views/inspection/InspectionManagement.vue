<template>
  <div class="inspection-management">
    <h2>设备点检管理总览</h2>

    <div class="dashboard">
      <div class="stats-row">
        <div class="stat-card">
          <h3>总设备数</h3>
          <div class="stat-value">{{ stats.totalEquipment }}</div>
        </div>
        <div class="stat-card">
          <h3>今日点检完成</h3>
          <div class="stat-value">{{ stats.todayCompleted }}/{{ stats.todayTotal }}</div>
        </div>
        <div class="stat-card">
          <h3>本周点检完成</h3>
          <div class="stat-value">{{ stats.weekCompleted }}/{{ stats.weekTotal }}</div>
        </div>
        <div class="stat-card">
          <h3>异常设备</h3>
          <div class="stat-value">{{ stats.abnormalCount }}</div>
        </div>
      </div>

      <div class="chart-row">
        <div class="chart-container">
          <h3>近7天点检完成率</h3>
          <div class="chart-placeholder">
            <!-- 这里应该是图表，用假数据模拟 -->
            <div v-for="(item, index) in completionRateData" :key="index" class="chart-bar">
              <div class="bar-label">{{ item.date }}</div>
              <div class="bar-container">
                <div class="bar-completed" :style="{ width: `${item.rate * 100}%` }"></div>
              </div>
              <div class="bar-value">{{ Math.round(item.rate * 100) }}%</div>
            </div>
          </div>
        </div>

        <div class="chart-container">
          <h3>设备状态分布</h3>
          <div class="chart-placeholder pie-chart">
            <!-- 饼图模拟 -->
            <div class="pie-chart-container">
              <div
                  v-for="item in statusDistribution"
                  :key="item.status"
                  class="pie-segment"
                  :style="{
                  backgroundColor: item.color,
                  transform: `rotate(${item.startAngle}deg)`,
                  opacity: item.percentage > 0 ? 1 : 0
                }"
                  :title="`${item.status}: ${item.percentage}%`"
              ></div>
            </div>
            <div class="pie-legend">
              <div v-for="item in statusDistribution" :key="'legend-' + item.status" class="legend-item">
                <span class="legend-color" :style="{ backgroundColor: item.color }"></span>
                <span class="legend-text">{{ item.status }}: {{ item.count }} ({{ item.percentage }}%)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="equipment-status">
        <h3>设备点检状态</h3>
        <table>
          <thead>
          <tr>
            <th>设备名称</th>
            <th>点检周期</th>
            <th>上次点检时间</th>
            <th>点检结果</th>
            <th>点检人</th>
            <th>下次点检时间</th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="item in equipmentStatus" :key="item.id">
            <td>{{ item.name }}</td>
            <td>{{ getPeriodText(item.period) }}</td>
            <td>{{ formatDate(item.lastInspection) }}</td>
            <td :class="getStatusClass(item.status)">{{ getStatusText(item.status) }}</td>
            <td>{{ item.inspector || '-' }}</td>
            <td>{{ formatDate(item.nextInspection) }}</td>
          </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const stats = ref({
  totalEquipment: 24,
  todayCompleted: 18,
  todayTotal: 20,
  weekCompleted: 85,
  weekTotal: 96,
  abnormalCount: 3,
});

const completionRateData = ref([
  { date: '05-10', rate: 0.95 },
  { date: '05-09', rate: 0.92 },
  { date: '05-08', rate: 0.89 },
  { date: '05-07', rate: 0.91 },
  { date: '05-06', rate: 0.87 },
  { date: '05-05', rate: 0.93 },
  { date: '05-04', rate: 0.90 },
]);

const statusDistribution = computed(() => {
  const total = equipmentStatus.value.length;
  let currentAngle = 0;

  const distribution = [
    { status: '正常', count: equipmentStatus.value.filter(e => e.status === 'normal').length, color: '#c8e6c9' },
    { status: '调试通过', count: equipmentStatus.value.filter(e => e.status === 'debug').length, color: '#fff9c4' },
    { status: '异常', count: equipmentStatus.value.filter(e => e.status === 'abnormal').length, color: '#ffcdd2' },
    { status: '未点检', count: equipmentStatus.value.filter(e => e.status === 'not-inspected').length, color: '#ffffff' },
  ];

  return distribution.map(item => {
    const percentage = total > 0 ? Math.round((item.count / total) * 100) : 0;
    const angle = (item.count / total) * 360;
    const result = {
      ...item,
      percentage,
      startAngle: currentAngle,
      endAngle: currentAngle + angle,
    };
    currentAngle += angle;
    return result;
  });
});

const equipmentStatus = ref([
  { id: 1, name: '设备A', period: 'daily', lastInspection: '2023-05-10T09:00:00', status: 'normal', inspector: '张三', nextInspection: '2023-05-11T09:00:00' },
  { id: 2, name: '设备B', period: 'weekly', lastInspection: '2023-05-09T14:30:00', status: 'abnormal', inspector: '李四', nextInspection: '2023-05-16T14:30:00' },
  { id: 3, name: '设备C', period: 'monthly', lastInspection: '2023-05-08T10:15:00', status: 'debug', inspector: '王五', nextInspection: '2023-06-08T10:15:00' },
  { id: 4, name: '设备D', period: 'quarterly', lastInspection: '2023-04-01T08:00:00', status: 'normal', inspector: '赵六', nextInspection: '2023-07-01T08:00:00' },
  { id: 5, name: '设备E', period: 'half-yearly', lastInspection: '2023-01-15T11:00:00', status: 'not-inspected', inspector: null, nextInspection: '2023-07-15T11:00:00' },
  { id: 6, name: '设备F', period: 'yearly', lastInspection: '2022-12-20T13:45:00', status: 'normal', inspector: '张三', nextInspection: '2023-12-20T13:45:00' },
]);

const getPeriodText = (period) => {
  const map = {
    daily: '日',
    weekly: '周',
    monthly: '月',
    quarterly: '季',
    'half-yearly': '半年',
    yearly: '年',
  };
  return map[period] || period;
};

const formatDate = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return `${date.getFullYear()}-${padZero(date.getMonth() + 1)}-${padZero(date.getDate())} ${padZero(date.getHours())}:${padZero(date.getMinutes())}`;
};

const padZero = (num) => {
  return num < 10 ? `0${num}` : num;
};

const getStatusClass = (status) => {
  return {
    normal: 'status-normal',
    abnormal: 'status-abnormal',
    debug: 'status-debug',
    'not-inspected': 'status-not-inspected',
  }[status];
};

const getStatusText = (status) => {
  return {
    normal: '正常',
    abnormal: '异常',
    debug: '调试通过',
    'not-inspected': '未点检',
  }[status];
};
</script>

<style scoped>
.inspection-management {
  padding: 20px;
}
.dashboard {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.stats-row {
  display: flex;
  gap: 20px;
}
.stat-card {
  flex: 1;
  padding: 15px;
  background-color: #f5f5f5;
  border-radius: 8px;
  text-align: center;
}
.stat-card h3 {
  margin-top: 0;
  color: #666;
}
.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #333;
}
.chart-row {
  display: flex;
  gap: 20px;
  height: 300px;
}
.chart-container {
  flex: 1;
  padding: 15px;
  background-color: #f5f5f5;
  border-radius: 8px;
}
.chart-container h3 {
  margin-top: 0;
}
.chart-placeholder {
  height: calc(100% - 30px);
  background-color: white;
  border: 1px solid #ddd;
  padding: 10px;
  position: relative;
}
.chart-bar {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}
.bar-label {
  width: 50px;
  font-size: 12px;
}
.bar-container {
  flex: 1;
  height: 20px;
  background-color: #eee;
  margin: 0 10px;
  position: relative;
}
.bar-completed {
  height: 100%;
  background-color: #4caf50;
}
.bar-value {
  width: 40px;
  font-size: 12px;
  text-align: right;
}
.pie-chart {
  display: flex;
  align-items: center;
}
.pie-chart-container {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  background-color: #f5f5f5;
  position: relative;
  overflow: hidden;
  margin-right: 20px;
}
.pie-segment {
  position: absolute;
  width: 100%;
  height: 100%;
  clip-path: polygon(50% 50%, 50% 0%, 100% 0%, 100% 100%, 50% 50%);
  transform-origin: 50% 50%;
}
.pie-legend {
  flex: 1;
}
.legend-item {
  display: flex;
  align-items: center;
  margin-bottom: 5px;
}
.legend-color {
  display: inline-block;
  width: 15px;
  height: 15px;
  margin-right: 8px;
  border: 1px solid #ddd;
}
.equipment-status {
  margin-top: 20px;
}
table {
  width: 100%;
  border-collapse: collapse;
}
th, td {
  border: 1px solid #ddd;
  padding: 8px 12px;
  text-align: left;
}
th {
  background-color: #f2f2f2;
}
.status-normal {
  background-color: #c8e6c9;
}
.status-abnormal {
  background-color: #ffcdd2;
}
.status-debug {
  background-color: #fff9c4;
}
.status-not-inspected {
  background-color: #ffffff;
}
</style>
