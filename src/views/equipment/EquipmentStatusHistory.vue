<template>
  <div class="esr-container">
    <div class="header">
      <h1>设备运行状态履历 (ESR)</h1>
      <div class="controls">
        <select v-model="viewMode" @change="changeViewMode">
          <option value="day">按天</option>
          <option value="shift">按班</option>
        </select>
        <date-picker v-model="selectedDate" type="date" placeholder="选择日期" @change="fetchData" />
      </div>
    </div>

    <div class="stat-cards">
      <div class="stat-card">
        <h3>总稼动率</h3>
        <div class="value">{{ stats.totalUtilization }}%</div>
        <div class="trend" :class="stats.totalUtilizationTrend">
          <span v-if="stats.totalUtilizationTrend === 'up'">↑</span>
          <span v-else-if="stats.totalUtilizationTrend === 'down'">↓</span>
          {{ stats.totalUtilizationChange }}%
        </div>
      </div>

      <div class="stat-card">
        <h3>净稼动率</h3>
        <div class="value">{{ stats.netUtilization }}%</div>
        <div class="trend" :class="stats.netUtilizationTrend">
          <span v-if="stats.netUtilizationTrend === 'up'">↑</span>
          <span v-else-if="stats.netUtilizationTrend === 'down'">↓</span>
          {{ stats.netUtilizationChange }}%
        </div>
      </div>

      <div class="stat-card">
        <h3>当前状态</h3>
        <div class="value" :class="stats.currentStatus.toLowerCase()">
          {{ stats.currentStatus }}
        </div>
        <div class="status-duration">
          持续时间: {{ formatDuration(stats.statusDuration) }}
        </div>
      </div>

      <div class="stat-card">
        <h3>产量</h3>
        <div class="value">{{ stats.productionCount }}</div>
        <div class="target">
          目标: {{ stats.productionTarget }} ({{ stats.productionAchievement }}%)
        </div>
      </div>

      <div class="stat-card">
        <h3>心跳状态</h3>
        <div class="value" :class="stats.heartbeatStatus.toLowerCase()">
          {{ stats.heartbeatStatus }}
        </div>
        <div class="last-heartbeat">
          最后心跳: {{ formatTime(stats.lastHeartbeat) }}
        </div>
      </div>
    </div>



    <div class="esr-chart-section">
      <h2 v-if="viewMode === 'day'">设备状态履历图 ESR (按天)</h2>
      <h2 v-else>设备状态履历图 ESR (按班)</h2>

      <div class="time-axis" v-if="viewMode === 'day'">
        <div class="time-label" v-for="hour in 24" :key="hour">
          {{ hour - 1 }}:00
        </div>
      </div>
      <div class="time-axis" v-else>
        <div class="time-label">0:00</div>
        <div class="time-label">1:00</div>
        <div class="time-label">2:00</div>
        <div class="time-label">3:00</div>
        <div class="time-label">4:00</div>
        <div class="time-label">5:00</div>
        <div class="time-label">6:00</div>
        <div class="time-label">7:00</div>
        <div class="time-label">8:00</div>
        <div class="time-label">9:00</div>
        <div class="time-label">10:00</div>
        <div class="time-label">11:00</div>
        <div class="time-label">12:00</div>
        <div class="time-label">13:00</div>
        <div class="time-label">14:00</div>
        <div class="time-label">15:00</div>
        <div class="time-label">16:00</div>
        <div class="time-label">17:00</div>
        <div class="time-label">18:00</div>
        <div class="time-label">19:00</div>
        <div class="time-label">20:00</div>
        <div class="time-label">21:00</div>
      </div>

      <div class="status-grid">
        <div class="status-row" v-for="device in filteredDevices" :key="device.id">
          <div class="device-name">{{ device.id }}</div>
          <div class="device-status" :class="device.status">{{ device.status }}</div>
          <div class="status-bars">
            <div class="status-bar"
                 v-for="(segment, index) in device.statusSegments"
                 :key="index"
                 :class="segment.status"
                 :style="{ width: segment.width + '%' }"></div>
          </div>
        </div>
      </div>
    </div>

    <div class="production-table" v-if="viewMode === 'shift'">
      <h2>当前产量及移动率统计</h2>
      <div class="time-range">
        统计时间: [{{ selectedDate.toISOString().split('T')[0] }} 07:30:00 ~ {{ selectedDate.toISOString().split('T')[0] }} 19:30:00]
      </div>
      <table>
        <thead>
        <tr>
          <th>设备</th>
          <th>当前状态</th>
          <th>产量</th>
          <th>移动率</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="device in filteredProductionData" :key="device.id">
          <td>{{ device.id }}</td>
          <td :class="device.status.toLowerCase()">{{ device.status }}</td>
          <td>{{ device.production }}</td>
          <td>{{ device.utilization }}%</td>
        </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue';
import Chart from 'chart.js/auto';
import DatePicker from 'vue-datepicker-next';
import 'vue-datepicker-next/index.css';

export default {
  components: {
    DatePicker
  },
  setup() {
    const viewMode = ref('day');
    const selectedDate = ref(new Date());
    const pieChart = ref(null);
    const pieChartInstance = ref(null);

    const stats = ref({
      totalUtilization: 85.3,
      totalUtilizationTrend: 'up',
      totalUtilizationChange: 2.1,
      netUtilization: 72.8,
      netUtilizationTrend: 'down',
      netUtilizationChange: 1.5,
      currentStatus: '运行中',
      statusDuration: 12345, // 秒
      productionCount: 1250,
      productionTarget: 1500,
      productionAchievement: 83.3,
      heartbeatStatus: '正常',
      lastHeartbeat: new Date(),
      statusDistribution: {
        running: 65,
        idle: 15,
        maintenance: 10,
        error: 5,
        setup: 5
      }
    });

    const filters = ref({
      workstation: 'all',
      equipment: 'all',
      workshop: 'all',
      manufacturer: 'all',
      status: 'all',
      shift: 'day',
      utilizationMethod: 'include'
    });

    const workstations = ref(['WS-01', 'WS-02', 'WS-03']);
    const equipments = ref(['EQ-01', 'EQ-02', 'EQ-03', 'EQ-04']);
    const workshops = ref(['车间A', '车间B', '车间C']);
    const manufacturers = ref(['厂商A', '厂商B', '厂商C']);

    const devices = ref([
      { id: 'C4-51-01', status: '运行', statusSegments: generateStatusSegments('running') },
      { id: 'C4-51-02', status: '离线', statusSegments: generateStatusSegments('offline') },
      { id: 'C4-51-03', status: '运行', statusSegments: generateStatusSegments('running') },
      { id: 'C4-51-04', status: '待机', statusSegments: generateStatusSegments('idle') },
      { id: 'C4-51-05', status: '待机', statusSegments: generateStatusSegments('idle') },
      { id: 'C4-51-06', status: '离线', statusSegments: generateStatusSegments('offline') },
      { id: 'C4-51-07', status: '运行', statusSegments: generateStatusSegments('running') },
      { id: 'C4-51-08', status: '运行', statusSegments: generateStatusSegments('running') },
      { id: 'C4-51-09', status: '运行', statusSegments: generateStatusSegments('running') },
      { id: 'C4-51-10', status: '离线', statusSegments: generateStatusSegments('offline') },
      { id: 'C4-51-11', status: '运行', statusSegments: generateStatusSegments('running') },
      { id: 'C4-51-12', status: '运行', statusSegments: generateStatusSegments('running') }
    ]);

    const productionData = ref([
      { id: 'C4-51-01', status: '运行', production: '6,960', utilization: '96.04' },
      { id: 'C4-51-02', status: '离线', production: '0', utilization: '0' },
      { id: 'C4-51-03', status: '运行', production: '6,730', utilization: '91.6' },
      { id: 'C4-51-04', status: '待机', production: '6,390', utilization: '85.81' },
      { id: 'C4-51-05', status: '待机', production: '6,616', utilization: '88.66' },
      { id: 'C4-51-06', status: '离线', production: '0', utilization: '0' },
      { id: 'C4-51-07', status: '运行', production: '6,654', utilization: '95.6' },
      { id: 'C4-51-08', status: '运行', production: '7,357', utilization: '89.22' },
      { id: 'C4-51-09', status: '运行', production: '6,608', utilization: '98.23' },
      { id: 'C4-51-10', status: '离线', production: '0', utilization: '0' },
      { id: 'C4-51-11', status: '运行', production: '5,707', utilization: '97.8' },
      { id: 'C4-51-12', status: '运行', production: '7,000', utilization: '98.25' }
    ]);

    const formattedDate = computed(() => {
      return selectedDate.value.toISOString().split('T')[0];
    });

    const filteredDevices = computed(() => {
      return devices.value.filter(device => {
        // Apply filters based on current view mode
        if (viewMode.value === 'shift' && filters.value.status !== 'all') {
          if (filters.value.status === 'running' && device.status !== '运行') return false;
          if (filters.value.status === 'idle' && device.status !== '待机') return false;
          if (filters.value.status === 'offline' && device.status !== '离线') return false;
        }
        return true;
      });
    });

    const filteredProductionData = computed(() => {
      return productionData.value.filter(device => {
        if (filters.value.status !== 'all') {
          if (filters.value.status === 'running' && device.status !== '运行') return false;
          if (filters.value.status === 'idle' && device.status !== '待机') return false;
          if (filters.value.status === 'offline' && device.status !== '离线') return false;
        }
        return true;
      });
    });

    function generateStatusSegments(mainStatus) {
      const segments = [];
      const statuses = ['running', 'idle', 'offline', 'maintenance', 'error'];

      // Generate random segments for demonstration
      let remaining = 100;
      for (let i = 0; i < 5; i++) {
        if (remaining <= 0) break;

        const status = i === 0 ? mainStatus :
            Math.random() > 0.8 ? statuses[Math.floor(Math.random() * statuses.length)] : 'empty';

        if (status === 'empty') continue;

        const width = i === 0 ?
            Math.min(remaining, Math.floor(Math.random() * 60) + 40) :
            Math.min(remaining, Math.floor(Math.random() * 20));

        if (width > 0) {
          segments.push({
            status,
            width
          });
          remaining -= width;
        }
      }

      return segments;
    }

    const formatDuration = (seconds) => {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      const secs = seconds % 60;
      return `${hours}h ${minutes}m ${secs}s`;
    };

    const formatTime = (date) => {
      return date.toLocaleTimeString();
    };

    const fetchData = () => {
      console.log('Fetching data with filters:', filters.value);
      // Here you would make an API call with the current filters
      updatePieChart();
    };

    const resetFilters = () => {
      filters.value = {
        workstation: 'all',
        equipment: 'all',
        workshop: 'all',
        manufacturer: 'all',
        status: 'all',
        shift: 'day',
        utilizationMethod: 'include'
      };
      fetchData();
    };

    const changeViewMode = () => {
      resetFilters();
      fetchData();
    };

    const updatePieChart = () => {
      if (pieChartInstance.value) {
        pieChartInstance.value.destroy();
      }

      const ctx = pieChart.value.getContext('2d');
      pieChartInstance.value = new Chart(ctx, {
        type: 'pie',
        data: {
          labels: ['运行中', '空闲', '维护中', '故障', '准备中'],
          datasets: [{
            data: [
              stats.value.statusDistribution.running,
              stats.value.statusDistribution.idle,
              stats.value.statusDistribution.maintenance,
              stats.value.statusDistribution.error,
              stats.value.statusDistribution.setup
            ],
            backgroundColor: [
              '#4CAF50',
              '#2196F3',
              '#FFC107',
              '#F44336',
              '#9C27B0'
            ],
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              position: 'right',
            },
            tooltip: {
              callbacks: {
                label: function(context) {
                  const label = context.label || '';
                  const value = context.raw || 0;
                  const total = context.dataset.data.reduce((a, b) => a + b, 0);
                  const percentage = Math.round((value / total) * 100);
                  return `${label}: ${value}% (${percentage}%)`;
                }
              }
            }
          }
        }
      });
    };

    onMounted(() => {
      fetchData();
    });

    return {
      viewMode,
      selectedDate,
      formattedDate,
      stats,
      filters,
      workstations,
      equipments,
      workshops,
      manufacturers,
      devices,
      productionData,
      filteredDevices,
      filteredProductionData,
      pieChart,
      fetchData,
      resetFilters,
      changeViewMode,
      formatDuration,
      formatTime
    };
  }
};
</script>

<style scoped>
.esr-container {
  padding: 20px;
  font-family: Arial, sans-serif;
  max-width: 1200px;
  margin: 0 auto;
  background-color: #fff;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.controls {
  display: flex;
  gap: 10px;
}

.controls select {
  padding: 8px 12px;
  border-radius: 4px;
  border: 1px solid #ddd;
}

.stat-cards {
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.stat-card {
  flex: 1;
  min-width: 180px;
  background: white;
  border-radius: 4px;
  padding: 12px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  border: 1px solid #e8e8e8;
}

.stat-card h3 {
  margin-top: 0;
  margin-bottom: 8px;
  color: #666;
  font-size: 13px;
}

.stat-card .value {
  font-size: 20px;
  font-weight: bold;
  margin: 5px 0;
}

.stat-card .value.running, .stat-card .value.正常 {
  color: #4CAF50;
}

.stat-card .value.idle, .stat-card .value.待机 {
  color: #2196F3;
}

.stat-card .value.offline, .stat-card .value.离线 {
  color: #F44336;
}

.trend {
  font-size: 11px;
}

.trend.up {
  color: #4CAF50;
}

.trend.down {
  color: #F44336;
}

.status-duration, .last-heartbeat, .target {
  font-size: 11px;
  color: #666;
}

.filter-section {
  background: #f5f5f5;
  border-radius: 4px;
  padding: 15px;
  margin-bottom: 15px;
}

.filter-row {
  display: flex;
  flex-wrap: wrap;
  margin-bottom: 10px;
  gap: 15px;
}

.filter-item {
  display: flex;
  align-items: center;
}

.filter-item label {
  margin-right: 5px;
  color: #666;
  font-size: 13px;
  white-space: nowrap;
}

.filter-item select {
  padding: 5px 8px;
  border-radius: 3px;
  border: 1px solid #ddd;
  font-size: 13px;
}

.filter-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-bottom: 20px;
}

.search-btn, .reset-btn {
  padding: 5px 15px;
  border-radius: 4px;
  border: 1px solid #ddd;
  background-color: #fff;
  cursor: pointer;
  font-size: 13px;
}

.search-btn {
  background-color: #1890ff;
  color: white;
  border-color: #1890ff;
}

.chart-container {
  background: white;
  border-radius: 4px;
  padding: 15px;
  margin-bottom: 20px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  border: 1px solid #e8e8e8;
}

.pie-chart {
  max-width: 100%;
}

.pie-chart h3 {
  text-align: center;
  margin-top: 0;
  font-size: 14px;
}

.esr-chart-section {
  background: white;
  border-radius: 4px;
  padding: 15px;
  margin-bottom: 20px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  border: 1px solid #e8e8e8;
}

.esr-chart-section h2 {
  margin-top: 0;
  font-size: 15px;
  color: #333;
  padding-bottom: 10px;
  border-bottom: 1px solid #e8e8e8;
}

.time-axis {
  display: flex;
  overflow-x: auto;
  margin-bottom: 10px;
  padding: 5px 0;
  border-bottom: 1px solid #f0f0f0;
}

.time-label {
  min-width: 60px;
  text-align: center;
  font-size: 11px;
  color: #666;
}

.status-grid {
  border: 1px solid #e8e8e8;
  border-radius: 4px;
  overflow: hidden;
}

.status-row {
  display: flex;
  align-items: center;
  padding: 8px 10px;
  border-bottom: 1px solid #f0f0f0;
}

.status-row:last-child {
  border-bottom: none;
}

.device-name {
  width: 100px;
  font-weight: bold;
  font-size: 13px;
}

.device-status {
  width: 60px;
  font-size: 13px;
}

.device-status.running {
  color: #4CAF50;
}

.device-status.idle, .device-status.待机 {
  color: #2196F3;
}

.device-status.offline, .device-status.离线 {
  color: #F44336;
}

.status-bars {
  flex: 1;
  height: 20px;
  display: flex;
  background-color: #f5f5f5;
  border-radius: 3px;
  overflow: hidden;
}

.status-bar {
  height: 100%;
}

.status-bar.running {
  background-color: #4CAF50;
}

.status-bar.idle {
  background-color: #2196F3;
}

.status-bar.offline {
  background-color: #F44336;
}

.status-bar.maintenance {
  background-color: #FFC107;
}

.status-bar.error {
  background-color: #9C27B0;
}

.production-table {
  background: white;
  border-radius: 4px;
  padding: 15px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  border: 1px solid #e8e8e8;
}

.production-table h2 {
  margin-top: 0;
  font-size: 15px;
  color: #333;
  padding-bottom: 10px;
  border-bottom: 1px solid #e8e8e8;
}

.time-range {
  font-size: 12px;
  color: #666;
  margin-bottom: 15px;
}

table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

th, td {
  padding: 8px 10px;
  text-align: left;
  border-bottom: 1px solid #f0f0f0;
}

th {
  background-color: #fafafa;
  font-weight: 500;
}

tr:hover {
  background-color: #fafafa;
}

.running {
  color: #4CAF50;
}

.idle, .待机 {
  color: #2196F3;
}

.offline, .离线 {
  color: #F44336;
}
</style>
