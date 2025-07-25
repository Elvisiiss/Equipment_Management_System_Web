<template>
  <div class="esr-container">
    <div class="header">
      <h1>设备运行状态履历 (ESR)</h1>
      <div class="controls">
        <select v-model="viewMode" @change="fetchData">
          <option value="day">按天</option>
          <option value="shift">按班</option>
        </select>
        <date-picker v-model="selectedDate" type="date" placeholder="选择日期" @change="fetchData" />
      </div>
    </div>

    <div class="stats-section">
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

      <div class="chart-container">
        <div class="pie-chart">
          <h3>设备状态分布</h3>
          <canvas ref="pieChart"></canvas>
        </div>
      </div>
    </div>

    <div class="esr-chart-section">
      <h2 v-if="viewMode === 'day'">设备运行状态履历图 (按天)</h2>
      <h2 v-else>设备状态履历 (按班)</h2>
      <div class="chart-container">
        <canvas ref="esrChart"></canvas>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, watch } from 'vue';
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
    const esrChart = ref(null);
    const pieChartInstance = ref(null);
    const esrChartInstance = ref(null);

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
      // 模拟API调用
      console.log(`Fetching data for ${selectedDate.value.toISOString()} in ${viewMode.value} mode`);

      // 这里应该是实际的API调用
      // axios.get(`/api/esr?date=${selectedDate.value.toISOString()}&mode=${viewMode.value}`)
      //   .then(response => {
      //     // 更新数据
      //   });

      // 模拟数据更新
      if (viewMode.value === 'day') {
        updateDayChart();
      } else {
        updateShiftChart();
      }

      updatePieChart();
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

    const updateDayChart = () => {
      if (esrChartInstance.value) {
        esrChartInstance.value.destroy();
      }

      const ctx = esrChart.value.getContext('2d');
      esrChartInstance.value = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: Array.from({length: 24}, (_, i) => `${i}:00`),
          datasets: [
            {
              label: '运行中',
              data: generateRandomData(24, 60, 90),
              backgroundColor: '#4CAF50',
              stack: 'stack'
            },
            {
              label: '空闲',
              data: generateRandomData(24, 5, 20),
              backgroundColor: '#2196F3',
              stack: 'stack'
            },
            {
              label: '维护中',
              data: generateRandomData(24, 0, 10),
              backgroundColor: '#FFC107',
              stack: 'stack'
            },
            {
              label: '故障',
              data: generateRandomData(24, 0, 5),
              backgroundColor: '#F44336',
              stack: 'stack'
            },
            {
              label: '准备中',
              data: generateRandomData(24, 0, 5),
              backgroundColor: '#9C27B0',
              stack: 'stack'
            }
          ]
        },
        options: {
          responsive: true,
          scales: {
            x: {
              stacked: true,
              title: {
                display: true,
                text: '时间 (小时)'
              }
            },
            y: {
              stacked: true,
              max: 100,
              title: {
                display: true,
                text: '百分比 (%)'
              }
            }
          },
          plugins: {
            title: {
              display: true,
              text: '设备状态按小时分布'
            },
            tooltip: {
              callbacks: {
                label: function(context) {
                  const label = context.dataset.label || '';
                  const value = context.raw || 0;
                  return `${label}: ${value}%`;
                },
                footer: function(tooltipItems) {
                  const total = tooltipItems.reduce((sum, item) => sum + item.parsed.y, 0);
                  return `总计: ${total}%`;
                }
              }
            }
          }
        }
      });
    };

    const updateShiftChart = () => {
      if (esrChartInstance.value) {
        esrChartInstance.value.destroy();
      }

      const ctx = esrChart.value.getContext('2d');
      esrChartInstance.value = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: ['早班 (8:00-16:00)', '中班 (16:00-24:00)', '晚班 (0:00-8:00)'],
          datasets: [
            {
              label: '运行中',
              data: generateRandomData(3, 50, 85),
              backgroundColor: '#4CAF50',
              stack: 'stack'
            },
            {
              label: '空闲',
              data: generateRandomData(3, 10, 30),
              backgroundColor: '#2196F3',
              stack: 'stack'
            },
            {
              label: '维护中',
              data: generateRandomData(3, 5, 15),
              backgroundColor: '#FFC107',
              stack: 'stack'
            },
            {
              label: '故障',
              data: generateRandomData(3, 0, 5),
              backgroundColor: '#F44336',
              stack: 'stack'
            },
            {
              label: '准备中',
              data: generateRandomData(3, 0, 5),
              backgroundColor: '#9C27B0',
              stack: 'stack'
            }
          ]
        },
        options: {
          responsive: true,
          scales: {
            x: {
              stacked: true,
              title: {
                display: true,
                text: '班次'
              }
            },
            y: {
              stacked: true,
              max: 100,
              title: {
                display: true,
                text: '百分比 (%)'
              }
            }
          },
          plugins: {
            title: {
              display: true,
              text: '设备状态按班次分布'
            },
            tooltip: {
              callbacks: {
                label: function(context) {
                  const label = context.dataset.label || '';
                  const value = context.raw || 0;
                  return `${label}: ${value}%`;
                },
                footer: function(tooltipItems) {
                  const total = tooltipItems.reduce((sum, item) => sum + item.parsed.y, 0);
                  return `总计: ${total}%`;
                }
              }
            }
          }
        }
      });
    };

    const generateRandomData = (count, min, max) => {
      return Array.from({length: count}, () =>
          Math.floor(Math.random() * (max - min + 1)) + min
      );
    };

    onMounted(() => {
      fetchData();
    });

    return {
      viewMode,
      selectedDate,
      stats,
      pieChart,
      esrChart,
      fetchData,
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

.stats-section {
  background: #f5f5f5;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 30px;
}

.stat-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 15px;
  margin-bottom: 20px;
}

.stat-card {
  background: white;
  border-radius: 8px;
  padding: 15px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.stat-card h3 {
  margin-top: 0;
  color: #666;
  font-size: 14px;
}

.stat-card .value {
  font-size: 24px;
  font-weight: bold;
  margin: 10px 0;
}

.stat-card .value.running, .stat-card .value.正常 {
  color: #4CAF50;
}

.stat-card .value.idle {
  color: #2196F3;
}

.stat-card .value.maintenance {
  color: #FFC107;
}

.stat-card .value.error, .stat-card .value.异常 {
  color: #F44336;
}

.stat-card .value.setup {
  color: #9C27B0;
}

.trend {
  font-size: 12px;
}

.trend.up {
  color: #4CAF50;
}

.trend.down {
  color: #F44336;
}

.status-duration, .last-heartbeat, .target {
  font-size: 12px;
  color: #666;
}

.chart-container {
  background: white;
  border-radius: 8px;
  padding: 15px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.pie-chart {
  max-width: 400px;
  margin: 0 auto;
}

.pie-chart h3 {
  text-align: center;
  margin-top: 0;
}

.esr-chart-section {
  background: #f5f5f5;
  border-radius: 8px;
  padding: 20px;
}

.esr-chart-section h2 {
  margin-top: 0;
}
</style>
