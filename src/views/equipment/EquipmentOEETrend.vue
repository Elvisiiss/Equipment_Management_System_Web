<template>
  <div class="oee-app">
<!--    <div class="app-header">-->
    <!--      <h1>设备OEE趋势报表系统</h1>-->
    <!--      <p>全面监控设备综合效率，优化生产绩效</p>-->
    <!--    </div>-->

    <!--    <div class="stat-cards">-->
    <!--      <div class="stat-card card-availability">-->
    <!--        <h3>时间稼动率</h3>-->
    <!--        <div class="value">86.4%</div>-->
    <!--      </div>-->
    <!--      <div class="stat-card card-performance">-->
    <!--        <h3>性能稼动率</h3>-->
    <!--        <div class="value">78.2%</div>-->
    <!--      </div>-->
    <!--      <div class="stat-card card-quality">-->
    <!--        <h3>良率</h3>-->
    <!--        <div class="value">94.7%</div>-->
    <!--      </div>-->
    <!--      <div class="stat-card card-oee">-->
    <!--        <h3>设备综合效率 (OEE)</h3>-->
    <!--        <div class="value">82.5%</div>-->
    <!--      </div>-->
    <!--    </div>-->

    <div class="dashboard">
      <div class="control-panel">
        <h2 class="panel-title">查询条件设置</h2>

        <div class="filter-group">
          <label>时间维度</label>
          <div class="time-dimension">
            <el-radio-group v-model="timeType" @change="handleTimeTypeChange">
              <el-radio-button label="day">日</el-radio-button>
              <el-radio-button label="week">周</el-radio-button>
              <el-radio-button label="month">月</el-radio-button>
              <el-radio-button label="year">年</el-radio-button>
            </el-radio-group>
          </div>
        </div>

        <div class="filter-group">
          <label>时间范围</label>
          <div class="time-range">
            <!-- 日维度选择器 -->
            <div v-if="timeType === 'day'">
              <el-row>
                <el-col :span="24"> <!-- span=24 占满一行 -->
                  <div class="time-range-label">开始日期</div>
                  <el-date-picker
                      v-model="startDate"
                      type="date"
                      placeholder="选择开始日期"
                      :disabled-date="dayEndDateDisabled"
                      @change="handleDayStartChange"
                  />
                </el-col>
              </el-row>
              <el-row style="margin-top: 8px;"> <!-- 加间距，可选 -->
                <el-col :span="24">
                  <div class="time-range-label">结束日期</div>
                  <el-date-picker
                      v-model="endDate"
                      type="date"
                      placeholder="选择结束日期"
                      :disabled-date="dayStartDateDisabled"
                      @change="handleDayEndChange"
                  />
                </el-col>
              </el-row>
            </div>

            <!-- 周维度选择器 -->
            <div v-if="timeType === 'week'">
              <el-row>
                <el-col :span="24">
                  <div class="time-range-label">起始周</div>
                  <el-select
                      v-model="startWeek"
                      placeholder="选择起始周"
                      @change="handleWeekStartChange"
                  >
                    <el-option
                        v-for="week in fixedWeekOptions"
                        :key="week.value"
                        :label="week.label"
                        :value="week.value"
                        :disabled="endWeek && week.value > endWeek"
                    />
                  </el-select>
                </el-col>
              </el-row>
              <el-row style="margin-top: 8px;">
                <el-col :span="24">
                  <div class="time-range-label">结束周</div>
                  <el-select
                      v-model="endWeek"
                      placeholder="选择结束周"
                      @change="handleWeekEndChange"
                  >
                    <el-option
                        v-for="week in fixedWeekOptions"
                        :key="week.value"
                        :label="week.label"
                        :value="week.value"
                        :disabled="startWeek && week.value < startWeek"
                    />
                  </el-select>
                </el-col>
              </el-row>
            </div>


            <!-- 月维度选择器 -->
            <div v-if="timeType === 'month'">
              <el-row>
                <el-col :span="24">
                  <div class="time-range-item">
                    <div class="time-range-label">开始月份</div>
                    <el-date-picker
                        v-model="startMonth"
                        type="month"
                        placeholder="选择开始月份"
                        :disabled-date="monthEndDateDisabled"
                        @change="handleMonthStartChange"
                    />
                  </div>
                </el-col>
              </el-row>
              <el-row style="margin-top: 8px;">
                <el-col :span="24">
                  <div class="time-range-item">
                    <div class="time-range-label">结束月份</div>
                    <el-date-picker
                        v-model="endMonth"
                        type="month"
                        placeholder="选择结束月份"
                        :disabled-date="monthStartDateDisabled"
                        @change="handleMonthEndChange"
                    />
                  </div>
                </el-col>
              </el-row>
            </div>

            <!-- 年维度选择器 -->
            <div v-if="timeType === 'year'">
              <el-row>
                <el-col :span="24">
                  <div class="time-range-item">
                    <div class="time-range-label">开始年份</div>
                    <el-date-picker
                        v-model="startYear"
                        type="year"
                        placeholder="选择开始年份"
                        :disabled-date="yearEndDateDisabled"
                        @change="handleYearStartChange"
                    />
                  </div>
                </el-col>
              </el-row>
              <el-row style="margin-top: 8px;">
                <el-col :span="24">
                  <div class="time-range-item">
                    <div class="time-range-label">结束年份</div>
                    <el-date-picker
                        v-model="endYear"
                        type="year"
                        placeholder="选择结束年份"
                        :disabled-date="yearStartDateDisabled"
                        @change="handleYearEndChange"
                    />
                  </div>
                </el-col>
              </el-row>
            </div>
          </div>
        </div>

        <div class="filter-group">
          <label>班次</label>
          <el-select v-model="shift" placeholder="选择班次">
            <el-option label="全部班次" value="all"></el-option>
            <el-option label="白班 (8:00-20:00)" value="day"></el-option>
            <el-option label="夜班 (20:00-8:00)" value="night"></el-option>
          </el-select>
        </div>

        <div class="filter-group">
          <label>工站</label>
          <el-select v-model="station" placeholder="选择工站">
            <el-option label="全部工站" value="all"></el-option>
            <el-option label="冲压工站" value="stamping"></el-option>
            <el-option label="焊接工站" value="welding"></el-option>
            <el-option label="喷涂工站" value="painting"></el-option>
            <el-option label="装配工站" value="assembly"></el-option>
          </el-select>
        </div>

        <div class="filter-group">
          <label>车间</label>
          <el-select v-model="workshop" placeholder="选择车间">
            <el-option label="全部车间" value="all"></el-option>
            <el-option label="一车间" value="workshop1"></el-option>
            <el-option label="二车间" value="workshop2"></el-option>
            <el-option label="三车间" value="workshop3"></el-option>
          </el-select>
        </div>

        <div class="filter-group">
          <label>设备厂商</label>
          <el-select v-model="manufacturer" placeholder="选择设备厂商">
            <el-option label="全部厂商" value="all"></el-option>
            <el-option label="西门子" value="siemens"></el-option>
            <el-option label="发那科" value="fanuc"></el-option>
            <el-option label="ABB" value="abb"></el-option>
            <el-option label="库卡" value="kuka"></el-option>
          </el-select>
        </div>

        <div class="filter-group">
          <label>设备</label>
          <el-select v-model="equipment" placeholder="选择设备">
            <el-option label="全部设备" value="all"></el-option>
            <el-option label="冲压机-A型" value="press-a"></el-option>
            <el-option label="焊接机器人-B型" value="welder-b"></el-option>
            <el-option label="喷涂机-C型" value="painter-c"></el-option>
            <el-option label="装配线-D型" value="assembly-d"></el-option>
          </el-select>
        </div>

        <div class="filter-group">
          <label>稼动率核算方式</label>
          <el-select v-model="calculationMethod" placeholder="选择核算方式">
            <el-option label="包含离线时长" value="include"></el-option>
            <el-option label="不包含离线时长" value="exclude"></el-option>
          </el-select>
        </div>

        <div class="actions">
          <el-button type="primary" @click="fetchData">查询数据</el-button>
          <el-button @click="resetFilters">重置条件</el-button>
        </div>
      </div>

      <div class="chart-container">
        <div class="chart-title">{{ chartTitle }}</div>
        <div class="data-range-info" v-if="dataRangeInfo">
          {{ dataRangeInfo }}
        </div>
        <div id="oee-chart" ref="chartRef"></div>
        <div class="legend">
          <div class="legend-item"><div class="legend-color" style="background-color: #e74c3c;"></div>时间稼动率</div>
          <div class="legend-item"><div class="legend-color" style="background-color: #f39c12;"></div>性能稼动率</div>
          <div class="legend-item"><div class="legend-color" style="background-color: #2ecc71;"></div>良率</div>
          <div class="legend-item"><div class="legend-color" style="background-color: #3498db;"></div>OEE</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import * as echarts from 'echarts';
import {
  ElRadioGroup,
  ElRadioButton,
  ElSelect,
  ElOption,
  ElDatePicker,
  ElButton
} from 'element-plus';

// 时间维度
const timeType = ref('day');


// 时间范围变量
const startDate = ref(null);
const endDate = ref(null);
const startWeek = ref(null)
const endWeek = ref(null)
const startMonth = ref(null);
const endMonth = ref(null);
const startYear = ref(null);
const endYear = ref(null);



// 其他查询条件
const shift = ref('all');
const station = ref('all');
const workshop = ref('all');
const manufacturer = ref('all');
const equipment = ref('all');
const calculationMethod = ref('include');

// 图表标题
const chartTitle = ref('日设备 OEE 趋势报表');

// 图表DOM引用
const chartRef = ref(null);
let chartInstance = null;

// 日期范围信息
const dataRangeInfo = computed(() => {
  if (timeType.value === 'day' && startDate.value && endDate.value) {
    const start = formatDate(startDate.value);
    const end = formatDate(endDate.value);
    return `数据范围: ${start} 至 ${end}`;
  }
  if (timeType.value === 'month' && startMonth.value && endMonth.value) {
    const start = formatMonth(startMonth.value);
    const end = formatMonth(endMonth.value);
    return `数据范围: ${start} 至 ${end}`;
  }
  if (timeType.value === 'year' && startYear.value && endYear.value) {
    const start = formatYear(startYear.value);
    const end = formatYear(endYear.value);
    return `数据范围: ${start} 至 ${end}`;
  }
  return '';
});

// 日期格式化函数
const formatDate = (date) => {
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
};

const formatMonth = (date) => {
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long'
  });
};

const formatYear = (date) => {
  return date.getFullYear().toString();
};

// 处理时间维度变化
const handleTimeTypeChange = (val) => {
  switch(val) {
    case 'day':
      chartTitle.value = '日设备 OEE 趋势报表';
      initDayRange();
      break;
    case 'week':
      chartTitle.value = '周设备 OEE 趋势报表';
      initWeekRange();
      break;
    case 'month':
      chartTitle.value = '月设备 OEE 趋势报表';
      initMonthRange();
      break;
    case 'year':
      chartTitle.value = '年设备 OEE 趋势报表';
      initYearRange();
      break;
  }
  renderChart();
};

// 初始化日期范围
const initDayRange = () => {
  const today = new Date();
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(today.getDate() - 7);
  startDate.value = oneWeekAgo;
  endDate.value = today;
};

const initWeekRange = () => {
  // 周维度的初始化逻辑
};

const initMonthRange = () => {
  const now = new Date();
  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(now.getMonth() - 3);
  startMonth.value = threeMonthsAgo;
  endMonth.value = now;
};

const initYearRange = () => {
  const now = new Date();
  const twoYearsAgo = new Date();
  twoYearsAgo.setFullYear(now.getFullYear() - 2);
  startYear.value = twoYearsAgo;
  endYear.value = now;
};

// 日期禁用函数
const dayEndDateDisabled = (time) => {
  if (!endDate.value) return false;
  return time.getTime() > endDate.value.getTime();
};

const dayStartDateDisabled = (time) => {
  if (!startDate.value) return false;
  return time.getTime() < startDate.value.getTime();
};

const monthEndDateDisabled = (time) => {
  if (!endMonth.value) return false;
  return time.getTime() > endMonth.value.getTime();
};

const monthStartDateDisabled = (time) => {
  if (!startMonth.value) return false;
  return time.getTime() < startMonth.value.getTime();
};

const yearEndDateDisabled = (time) => {
  if (!endYear.value) return false;
  return time.getFullYear() > endYear.value.getFullYear();
};

const yearStartDateDisabled = (time) => {
  if (!startYear.value) return false;
  return time.getFullYear() < startYear.value.getFullYear();
};

// 处理日期变化
const handleDayStartChange = () => {
  if (startDate.value && endDate.value && startDate.value > endDate.value) {
    endDate.value = new Date(startDate.value);
  }
  fetchData();
};

const handleDayEndChange = () => {
  if (startDate.value && endDate.value && startDate.value > endDate.value) {
    startDate.value = new Date(endDate.value);
  }
  fetchData();
};

const handleMonthStartChange = () => {
  if (startMonth.value && endMonth.value && startMonth.value > endMonth.value) {
    endMonth.value = new Date(startMonth.value);
  }
  fetchData();
};

const handleMonthEndChange = () => {
  if (startMonth.value && endMonth.value && startMonth.value > endMonth.value) {
    startMonth.value = new Date(endMonth.value);
  }
  fetchData();
};

const handleYearStartChange = () => {
  if (startYear.value && endYear.value && startYear.value.getFullYear() > endYear.value.getFullYear()) {
    endYear.value = new Date(startYear.value);
  }
  fetchData();
};

const handleYearEndChange = () => {
  if (startYear.value && endYear.value && startYear.value.getFullYear() > endYear.value.getFullYear()) {
    startYear.value = new Date(endYear.value);
  }
  fetchData();
};

// 获取数据
const fetchData = () => {
  console.log('获取数据中...');
  // 模拟API请求
  setTimeout(() => {
    renderChart();
  }, 500);
};

// 重置条件
const resetFilters = () => {
  timeType.value = 'day';
  shift.value = 'all';
  station.value = 'all';
  workshop.value = 'all';
  manufacturer.value = 'all';
  equipment.value = 'all';
  calculationMethod.value = 'include';
  chartTitle.value = '日设备 OEE 趋势报表';

  initDayRange();
  renderChart();
};

// 渲染图表
const renderChart = () => {
  if (!chartRef.value) return;

  if (chartInstance) {
    chartInstance.dispose();
  }

  chartInstance = echarts.init(chartRef.value);

  // 根据时间维度生成不同的数据
  let xAxisData = [];
  let availabilityData = [];
  let performanceData = [];
  let qualityData = [];
  let oeeData = [];

  switch(timeType.value) {
    case 'day':
      xAxisData = ['2025-07-20', '2025-07-21', '2025-07-22', '2025-07-23', '2025-07-24'];
      availabilityData = [85, 82, 88, 86, 90];
      performanceData = [75, 78, 82, 80, 85];
      qualityData = [95, 94, 96, 93, 98];
      oeeData = [60.5, 60.2, 70.1, 64.0, 74.9];
      break;
    case 'week':
      xAxisData = ['第25周', '第26周', '第27周', '第28周', '第29周'];
      availabilityData = [82, 85, 88, 84, 87];
      performanceData = [78, 80, 83, 79, 82];
      qualityData = [94, 95, 96, 93, 97];
      oeeData = [60.8, 64.6, 69.5, 61.7, 69.2];
      break;
    case 'month':
      xAxisData = ['1月', '2月', '3月', '4月', '5月', '6月', '7月'];
      availabilityData = [80, 82, 85, 83, 86, 88, 87];
      performanceData = [75, 77, 80, 78, 82, 84, 83];
      qualityData = [92, 93, 94, 95, 96, 95, 97];
      oeeData = [55.2, 59.0, 64.0, 61.4, 68.5, 70.3, 69.8];
      break;
    case 'year':
      xAxisData = ['2020', '2021', '2022', '2023', '2024', '2025'];
      availabilityData = [78, 80, 82, 85, 87, 89];
      performanceData = [72, 75, 78, 80, 83, 85];
      qualityData = [90, 92, 93, 94, 95, 96];
      oeeData = [50.5, 55.2, 59.6, 64.1, 68.7, 72.6];
      break;
  }

  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross',
        crossStyle: {
          color: '#999'
        }
      },
      formatter: function(params) {
        let result = params[0].name + '<br/>';
        params.forEach(item => {
          let suffix = item.seriesType === 'line' ? '%' : '%';
          result += `<span style="display:inline-block;margin-right:5px;border-radius:50%;width:10px;height:10px;background-color:${item.color};"></span>${item.seriesName}: ${item.value}${suffix}<br/>`;
        });
        return result;
      }
    },
    // legend: {
    //   data: ['时间稼动率', '性能稼动率', '良率', 'OEE'],
    //   bottom: 10
    // },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '15%',
      top: '15%',
      containLabel: true
    },
    xAxis: [
      {
        type: 'category',
        data: xAxisData,
        axisPointer: {
          type: 'shadow'
        }
      }
    ],
    yAxis: [
      {
        type: 'value',
        name: '百分比 (%)',
        min: 0,
        max: 100,
        interval: 20,
        axisLabel: {
          formatter: '{value}%'
        }
      }
    ],
    series: [
      {
        name: '时间稼动率',
        type: 'bar',
        barWidth: '20%',
        itemStyle: {
          color: '#e74c3c'
        },
        data: availabilityData
      },
      {
        name: '性能稼动率',
        type: 'bar',
        barWidth: '20%',
        itemStyle: {
          color: '#f39c12'
        },
        data: performanceData
      },
      {
        name: '良率',
        type: 'bar',
        barWidth: '20%',
        itemStyle: {
          color: '#2ecc71'
        },
        data: qualityData
      },
      {
        name: 'OEE',
        type: 'line',
        yAxisIndex: 0,
        symbol: 'circle',
        symbolSize: 8,
        itemStyle: {
          color: '#3498db'
        },
        lineStyle: {
          width: 3
        },
        data: oeeData
      }
    ]
  };

  chartInstance.setOption(option);
};

// 窗口大小变化时重绘图表
const handleResize = () => {
  if (chartInstance) {
    chartInstance.resize();
  }
};

onMounted(() => {
  // 初始化日期范围
  initDayRange();

  // 初始化图表
  renderChart();

  // 监听窗口大小变化
  window.addEventListener('resize', handleResize);
});

onBeforeUnmount(() => {
  // 销毁图表实例
  if (chartInstance) {
    chartInstance.dispose();
    chartInstance = null;
  }

  // 移除事件监听
  window.removeEventListener('resize', handleResize);
});
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: 'Segoe UI', 'Microsoft YaHei', sans-serif;
}

body {
  background: linear-gradient(135deg, #f5f7fa 0%, #e4edf5 100%);
  min-height: 100vh;
  padding: 20px;
}

.oee-app {
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
}

.app-header {
  text-align: center;
  margin-bottom: 30px;
  padding: 20px;
  background: linear-gradient(90deg, #1a6dcc 0%, #2c9caf 100%);
  border-radius: 12px;
  color: white;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
  animation: fadeInDown 0.8s ease;
}

.app-header h1 {
  font-size: 2.2rem;
  margin-bottom: 10px;
  letter-spacing: 1px;
}

.app-header p {
  font-size: 1.1rem;
  opacity: 0.9;
}

.dashboard {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 25px;
}

.control-panel {
  background: white;
  border-radius: 12px;
  padding: 25px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  animation: fadeInLeft 0.8s ease;
}

.chart-container {
  background: white;
  border-radius: 12px;
  padding: 25px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  animation: fadeInRight 0.8s ease;
  height: 600px;
}

.panel-title {
  font-size: 1.4rem;
  color: #1a6dcc;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 2px solid #eaeef5;
  font-weight: 600;
}

.filter-group {
  margin-bottom: 22px;
}

.filter-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #555;
}

.filter-group .el-select {
  width: 100%;
}

.time-range {
  display: flex;
  gap: 15px;
  margin-top: 10px;
}

.time-range .el-date-editor {
  flex: 1;
}

.time-range-item {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.time-range-label {
  font-size: 0.85rem;
  color: #666;
  margin-bottom: 5px;
}

.actions {
  display: flex;
  gap: 15px;
  margin-top: 25px;
}

.actions button {
  flex: 1;
  padding: 12px;
  font-size: 1rem;
  font-weight: 500;
}

.chart-title {
  text-align: center;
  font-size: 1.6rem;
  color: #1a6dcc;
  margin-bottom: 25px;
  font-weight: 600;
}

#oee-chart {
  width: 100%;
  height: 500px;
}

.legend {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 20px;
  margin-top: 15px;
}

.legend-item {
  display: flex;
  align-items: center;
  font-size: 0.9rem;
}

.legend-color {
  width: 16px;
  height: 16px;
  border-radius: 3px;
  margin-right: 8px;
}

.time-dimension {
  display: flex;
  justify-content: center;
  margin-bottom: 25px;
}

.time-dimension .el-radio-button {
  margin: 0 5px;
}

.stat-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  background: white;
  border-radius: 10px;
  padding: 20px;
  text-align: center;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
}

.stat-card h3 {
  font-size: 1rem;
  color: #666;
  margin-bottom: 12px;
}

.stat-card .value {
  font-size: 1.8rem;
  font-weight: 700;
}

.card-availability { border-top: 4px solid #e74c3c; }
.card-performance { border-top: 4px solid #f39c12; }
.card-quality { border-top: 4px solid #2ecc71; }
.card-oee { border-top: 4px solid #3498db; }

.data-range-info {
  text-align: center;
  margin-bottom: 15px;
  font-size: 1.1rem;
  color: #555;
  font-weight: 500;
}

@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeInLeft {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes fadeInRight {
  from {
    opacity: 0;
    transform: translateX(20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@media (max-width: 992px) {
  .dashboard {
    grid-template-columns: 1fr;
  }

  .stat-cards {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 576px) {
  .stat-cards {
    grid-template-columns: 1fr;
  }

  .time-range {
    flex-direction: column;
  }
}
</style>
