<template>
  <div class="esr-container">
    <div class="header">
      <h1>设备运行状态履历 (ESR)</h1>
      <div class="view-mode-selector">
        <select v-model="viewMode" @change="changeViewMode">
          <option value="day">按天</option>
          <option value="shift">按班</option>
        </select>
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
    </div>

    <div class="esr-table-section">
      <div class="filter-section">
        <div class="filter-row">
          <div class="filter-item">
            <label>日期：</label>
            <date-picker v-model="selectedDate" type="date" placeholder="选择日期" @change="fetchData" />
          </div>
          <div class="filter-item" v-if="viewMode === 'shift'">
            <label>设备厂商：</label>
            <select v-model="filter.vendor">
              <option value="all">全部</option>
              <option value="vendor1">厂商1</option>
              <option value="vendor2">厂商2</option>
            </select>
          </div>
          <div class="filter-item">
            <label>当前状态：</label>
            <select v-model="filter.status">
              <option value="all">全部</option>
              <option value="running">运行</option>
              <option value="idle">待机</option>
              <option value="offline">离线</option>
            </select>
          </div>
        </div>
        <div class="filter-row">
          <div class="filter-item" v-if="viewMode === 'shift'">
            <label>车间：</label>
            <select v-model="filter.workshop">
              <option value="all">全部</option>
              <option value="workshop1">车间1</option>
              <option value="workshop2">车间2</option>
            </select>
          </div>
          <div class="filter-item" v-if="viewMode === 'shift'">
            <label>班次：</label>
            <select v-model="filter.shift">
              <option value="day">白班</option>
              <option value="night">夜班</option>
              <option value="custom">自定义</option>
            </select>
          </div>
          <div class="filter-item" v-if="viewMode === 'shift'">
            <label>移动率核算方式：</label>
            <select v-model="filter.calculationMethod">
              <option value="include">包含离线时长</option>
              <option value="exclude">不包含离线时长</option>
            </select>
          </div>
        </div>
        <div class="filter-row">
          <div class="filter-item">
            <label>工站：</label>
            <select v-model="filter.station">
              <option value="all">全部</option>
              <option value="station1">工站1</option>
              <option value="station2">工站2</option>
            </select>
          </div>
          <div class="filter-item">
            <label>设备：</label>
            <select v-model="filter.device">
              <option value="all">全部</option>
              <option v-for="device in allDevices" :value="device.id">{{ device.id }}</option>
            </select>
          </div>
          <div class="filter-actions">
            <button class="search-btn" @click="fetchData">搜索</button>
            <button class="reset-btn" @click="resetFilters">重置</button>
          </div>
        </div>
      </div>

      <div class="table-container">
        <div class="barchart-container" v-if="viewMode === 'shift'">
          <div class="barchart-header">
            <div class="header-cell device">设备</div>
            <div class="header-cell status">当前状态</div>
            <div class="header-cell production">产量</div>
            <div class="header-cell moving-rate">移动率</div>
            <div class="header-cell timeline">时间线</div>
          </div>


          <div class="time-axis">
            <div class="empty-space" style="width: 430px;"></div>
            <div class="time-label1" v-for="(hour, index) in 13" :key="index">
              {{ 7 + index }}:30  <!-- 从7开始，每次递增1 -->
            </div>
          </div>

          <div class="barchart-body">
            <div class="barchart-row" v-for="device in filteredShiftDevices" :key="device.id">
              <div class="row-cell device">{{ device.id }}</div>
              <div class="row-cell status">
                <span :class="device.status.toLowerCase()">{{ device.status }}</span>
              </div>
              <div class="row-cell production">{{ device.production }}</div>
              <div class="row-cell moving-rate">{{ device.movingRate }}%</div>
              <!--              <div class="row-cell timeline">-->
              <!--                <div class="timeline-container">-->
              <!--                  <div-->
              <!--                      class="timeline-segment"-->
              <!--                      v-for="(segment, index) in getTimelineSegments(device)"-->
              <!--                      :key="index"-->
              <!--                      :class="segment.status"-->
              <!--                      :style="{ width: segment.width + '%' }"-->
              <!--                      :title="`${segment.hour}: ${segment.status}`"-->
              <!--                  ></div>-->
              <!--                </div>-->
              <!--              </div>-->
            </div>
          </div>
        </div>

        <div class="day-view-container" v-else>
          <div class="barchart-header">
            <div class="header-cell device">设备</div>
            <div class="header-cell status">当前状态</div>
            <div class="header-cell timeline">时间线</div>
          </div>


          <div class="time-axis">
            <div class="empty-space" style="width: 160px;"></div>
            <div class="time-label" v-for="hour in 22" :key="hour">{{ hour-1 }}:00</div>
          </div>
          <div class="status-grid">
            <div class="status-row" v-for="device in filteredDevices" :key="device.id">
              <div class="device-name">{{ device.id }}</div>
              <div class="device-status" :class="device.status.toLowerCase()">{{ device.status }}</div>
              <div class="status-bars">
                <div class="status-bar"
                     v-for="(status, index) in device.hourlyStatus"
                     :key="index"
                     :class="getStatusClass(status)"
                     :title="`${index}:00 - ${status}`"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="table-footer" v-if="viewMode === 'shift'">
        当前产量及移动率统计时间: [{{ statsTimeRange }}]
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue';
import DatePicker from 'vue-datepicker-next';
import 'vue-datepicker-next/index.css';

export default {
  components: {
    DatePicker
  },
  setup() {
    const viewMode = ref('shift');
    const selectedDate = ref(new Date());
    const statsTimeRange = ref('2025-07-26 07:30:00 ~ 2025-07-26 19:30:00');

    const filter = ref({
      vendor: 'all',
      status: 'all',
      workshop: 'all',
      shift: 'day',
      calculationMethod: 'include',
      station: 'all',
      device: 'all'
    });

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
    });

    const allDevices = ref([
      { id: 'C4-51-01', status: '运行', hourlyStatus: Array(24).fill('running') },
      { id: 'C4-51-02', status: '离线', hourlyStatus: Array(24).fill('offline') },
      { id: 'C4-51-03', status: '运行', hourlyStatus: Array(24).fill('running') },
      { id: 'C4-51-04', status: '待机', hourlyStatus: Array(24).fill('idle') },
      { id: 'C4-51-05', status: '运行', hourlyStatus: Array(24).fill('running') },
      { id: 'C4-51-06', status: '离线', hourlyStatus: Array(24).fill('offline') },
      { id: 'C4-51-07', status: '运行', hourlyStatus: Array(24).fill('running') },
      { id: 'C4-51-08', status: '运行', hourlyStatus: Array(24).fill('running') },
      { id: 'C4-51-09', status: '运行', hourlyStatus: Array(24).fill('running') },
      { id: 'C4-51-10', status: '运行', hourlyStatus: Array(24).fill('running') },
      { id: 'C4-51-11', status: '离线', hourlyStatus: Array(24).fill('offline') },
      { id: 'C4-51-12', status: '运行', hourlyStatus: Array(24).fill('running') },
      { id: 'C4-51-13', status: '运行', hourlyStatus: Array(24).fill('running') },
      { id: 'C4-51-14', status: '离线', hourlyStatus: Array(24).fill('offline') },
      { id: 'C4-51-15', status: '离线', hourlyStatus: Array(24).fill('offline') },
    ]);

    const shiftDevices = ref([
      { id: 'C4-51-01', status: '运行', production: '6,960', movingRate: '96.04', shiftStatus: {} },
      { id: 'C4-51-02', status: '离线', production: '0', movingRate: '0', shiftStatus: {} },
      { id: 'C4-51-03', status: '运行', production: '6,730', movingRate: '91.6', shiftStatus: {} },
      { id: 'C4-51-04', status: '待机', production: '6,390', movingRate: '85.81', shiftStatus: {} },
      { id: 'C4-51-05', status: '待机', production: '6,616', movingRate: '88.66', shiftStatus: {} },
      { id: 'C4-51-06', status: '离线', production: '0', movingRate: '0', shiftStatus: {} },
      { id: 'C4-51-07', status: '运行', production: '6,654', movingRate: '95.6', shiftStatus: {} },
      { id: 'C4-51-08', status: '运行', production: '7,357', movingRate: '89.22', shiftStatus: {} },
      { id: 'C4-51-09', status: '运行', production: '6,608', movingRate: '98.23', shiftStatus: {} },
      { id: 'C4-51-10', status: '离线', production: '0', movingRate: '0', shiftStatus: {} },
      { id: 'C4-51-11', status: '运行', production: '5,707', movingRate: '97.8', shiftStatus: {} },
      { id: 'C4-51-12', status: '运行', production: '7,000', movingRate: '98.25', shiftStatus: {} },
    ]);

    const shiftHours = ref(['07:30', '08:30', '09:30', '10:30', '11:30', '12:30', '13:30', '14:30', '15:30', '16:30', '17:30', '18:30', '19:30']);

    const filteredDevices = computed(() => {
      return allDevices.value.filter(device => {
        if (filter.value.device !== 'all' && device.id !== filter.value.device) return false;
        if (filter.value.status !== 'all' && device.status.toLowerCase() !== filter.value.status) return false;
        return true;
      });
    });

    const filteredShiftDevices = computed(() => {
      return shiftDevices.value.filter(device => {
        if (filter.value.device !== 'all' && device.id !== filter.value.device) return false;
        if (filter.value.status !== 'all' && device.status.toLowerCase() !== filter.value.status) return false;
        if (filter.value.vendor !== 'all' && device.vendor !== filter.value.vendor) return false;
        if (filter.value.workshop !== 'all' && device.workshop !== filter.value.workshop) return false;
        return true;
      });
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

    const getStatusClass = (status) => {
      if (!status) return '';
      const statusMap = {
        'running': 'running',
        'idle': 'idle',
        'offline': 'offline',
        'maintenance': 'maintenance',
        'error': 'error'
      };
      return statusMap[status] || '';
    };

    const getTimelineSegments = (device) => {
      const segments = [];
      const hourCount = shiftHours.value.length;
      const segmentWidth = 100 / hourCount;

      shiftHours.value.forEach((hour, index) => {
        const status = device.shiftStatus[hour] || 'offline';
        segments.push({
          hour,
          status,
          width: segmentWidth
        });
      });

      return segments;
    };

    const showDeviceDetail = (deviceId) => {
      console.log('Showing details for device:', deviceId);
    };

    const fetchData = () => {
      console.log(`Fetching data for ${selectedDate.value.toISOString()} in ${viewMode.value} mode`);
    };

    const resetFilters = () => {
      filter.value = {
        vendor: 'all',
        status: 'all',
        workshop: 'all',
        shift: 'day',
        calculationMethod: 'include',
        station: 'all',
        device: 'all'
      };
      fetchData();
    };

    const changeViewMode = () => {
      resetFilters();
      fetchData();
    };

    onMounted(() => {
      // 初始化shiftDevices的shiftStatus
      shiftDevices.value.forEach(device => {
        shiftHours.value.forEach(hour => {
          device.shiftStatus[hour] = ['running', 'idle', 'offline'][Math.floor(Math.random() * 3)];
        });
      });

      fetchData();
    });

    return {
      viewMode,
      selectedDate,
      stats,
      allDevices,
      shiftDevices,
      shiftHours,
      statsTimeRange,
      filter,
      filteredDevices,
      filteredShiftDevices,
      fetchData,
      formatDuration,
      formatTime,
      getStatusClass,
      getTimelineSegments,
      showDeviceDetail,
      resetFilters,
      changeViewMode
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
  padding-bottom: 15px;
  border-bottom: 1px solid #e8e8e8;
}

.header h1 {
  margin: 0;
  font-size: 24px;
  color: #333;
}

.view-mode-selector select {
  padding: 8px 12px;
  border-radius: 4px;
  border: 1px solid #ddd;
  background: white;
}

.stats-section {
  margin-bottom: 20px;
}

.stat-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 15px;
}

.stat-card {
  background: white;
  border-radius: 8px;
  padding: 15px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  border: 1px solid #e8e8e8;
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

.stat-card .value.running,
.stat-card .value.运行,
.stat-card .value.运行中,
.stat-card .value.正常 {
  color: #4CAF50;
}

.stat-card .value.idle,
.stat-card .value.待机,
.stat-card .value.空闲 {
  color: #2196F3;
}

.stat-card .value.offline,
.stat-card .value.离线 {
  color: #999;
}

.stat-card .value.maintenance,
.stat-card .value.维护中 {
  color: #FFC107;
}

.stat-card .value.error,
.stat-card .value.异常,
.stat-card .value.故障 {
  color: #F44336;
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

.esr-table-section {
  background: #f5f5f5;
  border-radius: 8px;
  padding: 20px;
}

.filter-section {
  background: white;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 15px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.filter-row {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  margin-bottom: 10px;
}

.filter-item {
  display: flex;
  align-items: center;
  min-width: 200px;
}

.filter-item label {
  margin-right: 8px;
  font-size: 14px;
  white-space: nowrap;
}

.filter-item select {
  padding: 8px 12px;
  border-radius: 4px;
  border: 1px solid #ddd;
  background: white;
  flex-grow: 1;
}

.filter-actions {
  display: flex;
  gap: 10px;
  margin-left: auto;
}

.search-btn, .reset-btn {
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.search-btn {
  background-color: #4CAF50;
  color: white;
  border: none;
}

.search-btn:hover {
  background-color: #45a049;
}

.reset-btn {
  background-color: #f5f5f5;
  border: 1px solid #ddd;
}

.reset-btn:hover {
  background-color: #e0e0e0;
}

.table-container {
  overflow-x: auto;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.barchart-container {
  overflow: hidden;
}

.barchart-header {
  display: flex;
  background-color: #f8f9fa;
  font-weight: 600;
  color: #333;
  border-bottom: 1px solid #eee;
}

.header-cell {
  padding: 12px 15px;
  text-align: left;
}

.header-cell.device {
  width: 120px;
}

.header-cell.status {
  width: 100px;
}

.header-cell.production {
  width: 100px;
}

.header-cell.moving-rate {
  width: 100px;
}

.header-cell.timeline {
  flex-grow: 1;
}

.barchart-body {
  overflow-y: auto;
  max-height: 600px;
}

.barchart-row {
  display: flex;
  border-bottom: 1px solid #eee;
}

.barchart-row:hover {
  background-color: #f5f5f5;
}

.row-cell {
  padding: 12px 15px;
  display: flex;
  align-items: center;
}

.row-cell.device {
  width: 120px;
}

.row-cell.status {
  width: 100px;
}

.row-cell.status span {
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 14px;
}

.row-cell.status .running {
  color: #4CAF50;
  background-color: #e8f5e9;
}

.row-cell.status .idle {
  color: #2196F3;
  background-color: #e3f2fd;
}

.row-cell.status .offline {
  color: #999;
  background-color: #f5f5f5;
}

.row-cell.production {
  width: 100px;
}

.row-cell.moving-rate {
  width: 100px;
}

.row-cell.timeline {
  flex-grow: 1;
  padding: 8px 15px;
}

.timeline-container {
  display: flex;
  height: 24px;
  border-radius: 4px;
  overflow: hidden;
}

.timeline-segment {
  height: 100%;
}

.timeline-segment.running {
  background-color: #4CAF50;
}

.timeline-segment.idle {
  background-color: #2196F3;
}

.timeline-segment.offline {
  background-color: #999;
}

.timeline-segment.maintenance {
  background-color: #FFC107;
}

.timeline-segment.error {
  background-color: #F44336;
}

.day-view-container {
  padding: 15px;
}

.time-axis {
  display: flex;
  flex-wrap: wrap; /* 允许时间标签换行 */
  margin-bottom: 10px;
  padding: 5px 0;
  border-bottom: 1px solid #f0f0f0;
  width: 100%; /* 固定宽度 */
  overflow: hidden; /* 移除滚动 */
}

.time-label {
  width: 41px; /* 固定每个时间标签的宽度 */
  text-align: center;
  font-size: 11px;
  color: #666;
  flex-shrink: 0; /* 禁止缩小 */
}
.time-label1 {
  width: 50px; /* 固定每个时间标签的宽度 */
  text-align: center;
  font-size: 11px;
  color: #666;
  flex-shrink: 0; /* 禁止缩小 */
}

.status-grid {
  border: 1px solid #e8e8e8;
  border-radius: 4px;
  overflow: auto; /* 允许纵向滚动（如果需要） */
  width: 100%;
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

.device-status.idle {
  color: #2196F3;
}

.device-status.offline {
  color: #999;
}

.status-bars {
  flex: 1;
  height: 20px;
  display: flex;
  background-color: #f5f5f5;
  border-radius: 3px;
  overflow: hidden;
  width: calc(60px * 24); /* 固定总宽度（24小时 × 60px） */
}

.status-bar {
  width: 60px; /* 每个状态条固定宽度 */
  height: 100%;
  border-right: 1px solid white;
}

.status-bar.running {
  background-color: #4CAF50;
}

.status-bar.idle {
  background-color: #2196F3;
}

.status-bar.offline {
  background-color: #999;
}

.status-bar.maintenance {
  background-color: #FFC107;
}

.status-bar.error {
  background-color: #F44336;
}

.table-footer {
  margin-top: 15px;
  font-size: 12px;
  color: #666;
  text-align: right;
}
</style>
