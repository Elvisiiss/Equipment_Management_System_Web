<template>
  <div class="container">
    <!-- 卡片一：查询条件 -->
    <div class="card search-card">
      <div class="search-conditions">
        <div class="search-item">
          <label for="workshop">车间：</label>
          <select id="workshop" v-model="selectedWorkshop">
            <option value="all">全部车间</option>
            <option value="C4">C4车间</option>
            <option value="C4-front">C4前段01-11</option>
          </select>
        </div>
        <div class="search-item">
          <label for="equipment">设备：</label>
          <select id="equipment" v-model="selectedEquipment">
            <option v-for="equip in filteredEquipments" :key="equip" :value="equip">{{ equip }}</option>
          </select>
        </div>
        <button class="search-btn" @click="searchEquipment">搜索</button>
      </div>
    </div>

    <!-- 卡片二：设备图片 -->
    <div class="card image-card" v-if="showEquipmentImage">
      <div class="equipment-info">
        <h3>{{ selectedEquipment }}</h3>
        <div class="info-row">
          <span>车间: {{ equipmentInfo.workshop }}</span>
          <span>设备型号: {{ equipmentInfo.model }}</span>
        </div>
        <div class="info-row">
          <span>厂商: {{ equipmentInfo.manufacturer }}</span>
          <span>进厂日期: {{ equipmentInfo.entryDate }}</span>
        </div>
        <div class="info-row">
          <span>责任工程师: {{ equipmentInfo.engineer }}</span>
        </div>
        <div class="equipment-image">
          <img src="https://via.placeholder.com/300x200?text=设备图片" alt="设备图片">
          <div class="no-image" v-if="!equipmentInfo.hasImage">暂无图片</div>
        </div>
      </div>
    </div>

    <!-- 卡片三：稼动率统计 -->
    <div class="card stats-card">
      <div class="stats-header">
        <div class="date-picker">
          <label>日期：</label>
          <input type="date" v-model="selectedDate">
        </div>
        <div class="shift-selector">
          <label>班次：</label>
          <select v-model="selectedShift">
            <option value="all">全部班次</option>
            <option value="day">白班</option>
            <option value="night">晚班</option>
          </select>
        </div>
      </div>

      <div class="stats-content">
        <div class="rate-charts">
          <div class="chart-container">
            <h4>总稼动率</h4>
            <div class="ring-chart">
              <svg width="150" height="150" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="45" fill="none" stroke="#eee" stroke-width="10" />
                <circle cx="50" cy="50" r="45" fill="none" stroke="#1890ff" stroke-width="10"
                        stroke-dasharray="283" :stroke-dashoffset="283 - (283 * totalRate / 100)"
                        stroke-linecap="round" transform="rotate(-90 50 50)" />
              </svg>
              <div class="chart-label">{{ totalRate }}%</div>
            </div>
            <div class="chart-description">运行时间/开机时间</div>
          </div>
          <div class="chart-container">
            <h4>净稼动率</h4>
            <div class="ring-chart">
              <svg width="150" height="150" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="45" fill="none" stroke="#eee" stroke-width="10" />
                <circle cx="50" cy="50" r="45" fill="none" stroke="#52c41a" stroke-width="10"
                        stroke-dasharray="283" :stroke-dashoffset="283 - (283 * netRate / 100)"
                        stroke-linecap="round" transform="rotate(-90 50 50)" />
              </svg>
              <div class="chart-label">{{ netRate }}%</div>
            </div>
            <div class="chart-description">运行时间/开机时间-交接班<br>计划停机</div>
          </div>
        </div>

        <div class="status-info">
          <div class="pie-chart-container">
            <h4>设备状态分布</h4>
            <div class="pie-chart">
              <svg width="200" height="200" viewBox="0 0 100 100">
                <g v-for="(item, index) in processedPieData" :key="index">
                  <path :d="getSectorPath(50, 50, 45, item.startAngle, item.endAngle)"
                        :fill="item.color" stroke="#fff" stroke-width="1" />
                </g>
              </svg>
              <div class="pie-legend">
                <div v-for="item in statusData" :key="item.name" class="legend-item">
                  <span class="legend-color" :style="{backgroundColor: item.color}"></span>
                  <span class="legend-label">{{ item.name }}</span>
                  <span class="legend-value">{{ ((item.value / totalStatusValue) * 100).toFixed(1) }}%</span>
                </div>
              </div>
            </div>
          </div>
          <div class="status-table-container">
            <table class="status-table">
              <thead>
              <tr>
                <th>状态</th>
                <th>时间</th>
                <th>比例</th>
              </tr>
              </thead>
              <tbody>
              <tr v-for="item in statusTableData" :key="item.status">
                <td>{{ item.status }}</td>
                <td>{{ item.duration }}</td>
                <td>{{ item.percentage }}%</td>
              </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div class="time-slots">
        <div class="time-slot" v-for="time in timeSlots" :key="time">{{ time }}</div>
      </div>
    </div>

    <!-- 卡片四：状态记录表 -->
    <div class="card status-table-card">
      <div class="table-header">
        <span>状态</span>
        <span>产量</span>
        <span>心跳</span>
      </div>
      <table class="detailed-status-table">
        <thead>
        <tr>
          <th>序号</th>
          <th>设备</th>
          <th>状态</th>
          <th>持续时长</th>
          <th>开始时间</th>
          <th>结束时间</th>
          <th>
            <button class="export-btn">导出excel</button>
          </th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="(record, index) in statusRecords" :key="index">
          <td>{{ record.id }}</td>
          <td>{{ record.equipment }}</td>
          <td>{{ record.status }}</td>
          <td>{{ record.duration }}</td>
          <td>{{ record.startTime }}</td>
          <td>{{ record.endTime }}</td>
          <td></td>
        </tr>
        </tbody>
      </table>
      <div class="table-footer">
        <span>共 {{ statusRecords.length }} 条</span>
        <div class="pagination">
          <span>每页 10 条</span>
          <button>上一页</button>
          <button>下一页</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue';

export default {
  setup() {
    // 卡片一数据
    const selectedWorkshop = ref('all');
    const selectedEquipment = ref('');
    const showEquipmentImage = ref(false);

    const allEquipments = [
      'C4-51-12', 'C4-51-13', 'C4-51-14',
      'C4-01-01', 'C4-01-02', 'C4-01-03'
    ];

    const filteredEquipments = computed(() => {
      if (selectedWorkshop.value === 'all') return allEquipments;
      if (selectedWorkshop.value === 'C4') return allEquipments.filter(e => e.startsWith('C4-51'));
      if (selectedWorkshop.value === 'C4-front') return allEquipments.filter(e => e.startsWith('C4-01'));
      return [];
    });

    const equipmentInfo = ref({
      workshop: 'C4车间',
      model: '深圳序佑盖板全自动',
      manufacturer: '序佑',
      entryDate: '',
      engineer: '',
      hasImage: false
    });

    const searchEquipment = () => {
      if (selectedEquipment.value) {
        showEquipmentImage.value = true;
        // 模拟获取设备信息
        equipmentInfo.value = {
          workshop: 'C4车间',
          model: '深圳序佑盖板全自动',
          manufacturer: '序佑',
          entryDate: '2023-05-15',
          engineer: '张三',
          hasImage: false
        };
      }
    };

    // 卡片三数据
    const selectedDate = ref('2025-07-28');
    const selectedShift = ref('day');
    const totalRate = ref(4.63);
    const netRate = ref(7.25);

    const statusData = ref([
      { name: '运行', value: 15, color: '#4CAF50' },
      { name: '待机', value: 60, color: '#FFC107' },
      { name: '报警', value: 5, color: '#F44336' },
      { name: '离线', value: 10, color: '#9E9E9E' },
      { name: '无数据', value: 10, color: '#607D8B' }
    ]);

    // 计算饼图数据
    const totalStatusValue = computed(() => {
      return statusData.value.reduce((sum, item) => sum + item.value, 0);
    });

    const processedPieData = computed(() => {
      let startAngle = 0;
      return statusData.value.map(item => {
        const angle = (item.value / totalStatusValue.value) * 360;
        const endAngle = startAngle + angle;
        const result = {
          ...item,
          startAngle,
          endAngle
        };
        startAngle = endAngle;
        return result;
      });
    });

    // 计算扇形路径
    const getSectorPath = (cx, cy, r, startAngle, endAngle) => {
      const startRad = (startAngle - 90) * Math.PI / 180;
      const endRad = (endAngle - 90) * Math.PI / 180;

      const x1 = cx + r * Math.cos(startRad);
      const y1 = cy + r * Math.sin(startRad);
      const x2 = cx + r * Math.cos(endRad);
      const y2 = cy + r * Math.sin(endRad);

      const largeArcFlag = endAngle - startAngle <= 180 ? 0 : 1;

      return `
        M ${cx} ${cy}
        L ${x1} ${y1}
        A ${r} ${r} 0 ${largeArcFlag} 1 ${x2} ${y2}
        L ${cx} ${cy}
        Z
      `;
    };

    const statusTableData = computed(() => {
      const total = totalStatusValue.value;
      return statusData.value.map(item => ({
        status: item.name,
        duration: calculateDuration(item.value, total),
        percentage: ((item.value / total) * 100).toFixed(1)
      }));
    });

    const calculateDuration = (value, total) => {
      const totalMinutes = 24 * 60; // 假设一天24小时
      const minutes = Math.round((value / total) * totalMinutes);
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return hours > 0 ? `${hours}小时${mins}分` : `${mins}分`;
    };

    const timeSlots = ref(['12:30', '13:30', '14:30', '15:30', '16:30', '17:30', '18:30']);

    // 卡片四数据
    const statusRecords = ref([
      { id: 1, equipment: 'C4-51-12', status: '待机', duration: '2小时47分20秒', startTime: '2025-07-28 07:30:00', endTime: '2025-07-28 10:17:20' },
      { id: 2, equipment: 'C4-51-12', status: '运行', duration: '2分11秒', startTime: '2025-07-28 10:17:20', endTime: '2025-07-28 10:19:31' },
      { id: 3, equipment: 'C4-51-12', status: '待机', duration: '1分13秒', startTime: '2025-07-28 10:19:31', endTime: '2025-07-28 10:20:44' },
      { id: 4, equipment: 'C4-51-12', status: '运行', duration: '5分24秒', startTime: '2025-07-28 10:20:44', endTime: '2025-07-28 10:26:08' },
      { id: 5, equipment: 'C4-51-12', status: '待机', duration: '40秒', startTime: '2025-07-28 10:26:08', endTime: '2025-07-28 10:26:48' },
      { id: 6, equipment: 'C4-51-12', status: '运行', duration: '3分58秒', startTime: '2025-07-28 10:26:48', endTime: '2025-07-28 10:30:46' },
      { id: 7, equipment: 'C4-51-12', status: '待机', duration: '1小时8分15秒', startTime: '2025-07-28 10:30:46', endTime: '2025-07-28 11:39:01' }
    ]);

    return {
      selectedWorkshop,
      selectedEquipment,
      filteredEquipments,
      showEquipmentImage,
      equipmentInfo,
      searchEquipment,
      selectedDate,
      selectedShift,
      totalRate,
      netRate,
      statusData,
      processedPieData,
      statusTableData,
      totalStatusValue,
      timeSlots,
      statusRecords,
      getSectorPath
    };
  }
};
</script>
<style scoped>
.container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.card {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
  padding: 20px;
}

.search-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.search-conditions {
  display: flex;
  align-items: center;
  gap: 20px;
}

.search-item {
  display: flex;
  align-items: center;
}

.search-item label {
  margin-right: 8px;
  white-space: nowrap;
}

.search-item select, .search-item input {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  min-width: 150px;
}

.search-btn {
  padding: 8px 20px;
  background-color: #1890ff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.search-btn:hover {
  background-color: #40a9ff;
}

.image-card {
  min-height: 200px;
}

.equipment-info h3 {
  margin-top: 0;
  margin-bottom: 15px;
  font-size: 18px;
}

.info-row {
  display: flex;
  margin-bottom: 10px;
}

.info-row span {
  margin-right: 30px;
  min-width: 200px;
}

.equipment-image {
  margin-top: 20px;
  text-align: center;
  position: relative;
}

.equipment-image img {
  max-width: 100%;
  border: 1px solid #eee;
}

.no-image {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: #999;
  font-size: 16px;
}

.stats-card {
  position: relative;
}

.stats-header {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}

.date-picker, .shift-selector {
  display: flex;
  align-items: center;
}

.date-picker label, .shift-selector label {
  margin-right: 8px;
}

.stats-content {
  display: flex;
  gap: 20px;
}

.rate-charts {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.chart-container {
  text-align: center;
}

.chart-container h4 {
  margin: 0 0 10px 0;
  font-size: 16px;
}

.ring-chart {
  position: relative;
  width: 150px;
  height: 150px;
  margin: 0 auto;
}

.chart-label {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 18px;
  font-weight: bold;
}

.chart-description {
  margin-top: 10px;
  font-size: 12px;
  color: #666;
}

.status-info {
  flex: 2;
  display: flex;
  gap: 20px;
}

.pie-chart-container {
  flex: 1;
}

.pie-chart-container h4 {
  margin: 0 0 10px 0;
  font-size: 16px;
  text-align: center;
}

/* 保持之前的样式不变，只添加新增的样式 */
.pie-chart {
  position: relative;
  width: 100%;
  height: 200px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.pie-legend {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  background: #f9f9f9;
  padding: 10px;
  border-radius: 4px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.legend-item {
  display: flex;
  align-items: center;
  margin: 5px 0;
}

.legend-color {
  display: inline-block;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  margin-right: 8px;
}

.legend-label {
  margin-right: 8px;
  font-size: 12px;
}

.legend-value {
  font-size: 12px;
  font-weight: bold;
}

/* 其他样式保持不变... */
.pie-chart {
  position: relative;
  width: 100%;
  height: 200px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.pie-legend {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  background: #f9f9f9;
  padding: 10px;
  border-radius: 4px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.legend-item {
  display: flex;
  align-items: center;
  margin: 5px 0;
}

.legend-color {
  display: inline-block;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  margin-right: 8px;
}

.legend-label {
  margin-right: 8px;
  font-size: 12px;
}

.legend-value {
  font-size: 12px;
  font-weight: bold;
}

.status-table-container {
  flex: 1;
}

.status-table {
  width: 100%;
  border-collapse: collapse;
}

.status-table th, .status-table td {
  padding: 8px 12px;
  text-align: left;
  border-bottom: 1px solid #eee;
}

.status-table th {
  background-color: #f5f5f5;
  font-weight: 500;
}

.time-slots {
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
  padding-top: 10px;
  border-top: 1px solid #eee;
}

.time-slot {
  color: #666;
  font-size: 12px;
}

.table-header {
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px solid #eee;
  margin-bottom: 15px;
}

.detailed-status-table {
  width: 100%;
  border-collapse: collapse;
}

.detailed-status-table th, .detailed-status-table td {
  padding: 12px 15px;
  text-align: left;
  border-bottom: 1px solid #eee;
}

.detailed-status-table th {
  background-color: #f5f5f5;
  font-weight: 500;
}

.export-btn {
  padding: 5px 10px;
  background-color: #1890ff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.export-btn:hover {
  background-color: #40a9ff;
}

.table-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 15px;
  padding-top: 10px;
  border-top: 1px solid #eee;
}

.pagination {
  display: flex;
  align-items: center;
  gap: 10px;
}

.pagination button {
  padding: 5px 10px;
  background-color: #f5f5f5;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
}

.pagination button:hover {
  background-color: #e9e9e9;
}
</style>
