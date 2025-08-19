<template>
  <div class="oee-app">
    <div class="control-panel">
      <el-form :model="queryForm" inline label-width="90px" size="small">
        <!-- 时间维度 -->
        <el-form-item label="时间维度">
          <el-radio-group v-model="timeType" @change="handleTimeTypeChange">
            <el-radio-button label="day">日</el-radio-button>
            <el-radio-button label="week">周</el-radio-button>
            <el-radio-button label="month">月</el-radio-button>
            <el-radio-button label="year">年</el-radio-button>
          </el-radio-group>
        </el-form-item>

        <!-- 开始 / 结束 -->
        <el-form-item label="开始时间">
          <el-date-picker
              v-if="timeType === 'day'"
              v-model="startDate"
              type="date"
              placeholder="开始日期"
              :disabled-date="dayEndDateDisabled"
              @change="handleDayStartChange"
          />
          <el-date-picker
              v-if="timeType === 'month'"
              v-model="startMonth"
              type="month"
              placeholder="开始月份"
              :disabled-date="monthEndDateDisabled"
              @change="handleMonthStartChange"
          />
          <el-date-picker
              v-if="timeType === 'year'"
              v-model="startYear"
              type="year"
              placeholder="开始年份"
              :disabled-date="yearEndDateDisabled"
              @change="handleYearStartChange"
          />
          <el-select
              v-if="timeType === 'week'"
              v-model="startWeek"
              placeholder="开始周"
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
        </el-form-item>

        <el-form-item label="结束时间">
          <el-date-picker
              v-if="timeType === 'day'"
              v-model="endDate"
              type="date"
              placeholder="结束日期"
              :disabled-date="dayStartDateDisabled"
              @change="handleDayEndChange"
          />
          <el-date-picker
              v-if="timeType === 'month'"
              v-model="endMonth"
              type="month"
              placeholder="结束月份"
              :disabled-date="monthStartDateDisabled"
              @change="handleMonthEndChange"
          />
          <el-date-picker
              v-if="timeType === 'year'"
              v-model="endYear"
              type="year"
              placeholder="结束年份"
              :disabled-date="yearStartDateDisabled"
              @change="handleYearEndChange"
          />
          <el-select
              v-if="timeType === 'week'"
              v-model="endWeek"
              placeholder="结束周"
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
        </el-form-item>

        <!-- 车间 -->
        <el-form-item label="车间">
          <el-select v-model="workshop" placeholder="选择车间">
            <el-option label="全部车间" value="all" />
            <el-option label="一车间" value="workshop1" />
            <el-option label="二车间" value="workshop2" />
            <el-option label="三车间" value="workshop3" />
          </el-select>
        </el-form-item>

        <!-- 产线 -->
        <el-form-item label="产线">
          <el-select v-model="productionLine" placeholder="选择产线">
            <el-option label="全部产线" value="all" />
            <el-option label="31产线" value="line31" />
            <el-option label="32产线" value="line32" />
            <el-option label="33产线" value="line33" />
          </el-select>
        </el-form-item>

        <!-- 工段 -->
        <el-form-item label="工段">
          <el-select v-model="workSection" placeholder="选择工段">
            <el-option label="全部工段" value="all" />
            <el-option label="CFOG段" value="section1" />
            <el-option label="贴合段" value="section2" />
            <el-option label="组装段" value="section3" />
          </el-select>
        </el-form-item>

        <!-- 设备名称 -->
        <el-form-item label="设备名称">
          <el-select v-model="equipment" placeholder="选择设备">
            <el-option label="全部设备" value="all" />
            <el-option label="冲压机-A型" value="press-a" />
            <el-option label="焊接机器人-B型" value="welder-b" />
            <el-option label="喷涂机-C型" value="painter-c" />
          </el-select>
        </el-form-item>

        <!-- 厂商 -->
        <el-form-item label="厂商">
          <el-select v-model="manufacturer" placeholder="选择设备厂商">
            <el-option label="全部厂商" value="all" />
            <el-option label="西门子" value="siemens" />
            <el-option label="发那科" value="fanuc" />
            <el-option label="ABB" value="abb" />
          </el-select>
        </el-form-item>

        <!-- 班次 -->
        <el-form-item label="班次">
          <el-select v-model="shift" placeholder="选择班次">
            <el-option label="全部班次" value="all" />
            <el-option label="白班 (8:00-20:00)" value="day" />
            <el-option label="夜班 (20:00-8:00)" value="night" />
          </el-select>
        </el-form-item>

        <!-- 核算方式 -->
        <el-form-item label="核算方式">
          <el-select v-model="calculationMethod" placeholder="选择核算方式">
            <el-option label="包含离线时长" value="include" />
            <el-option label="不包含离线时长" value="exclude" />
          </el-select>
        </el-form-item>

        <!-- 按钮 -->
        <el-form-item>
          <el-button type="primary" @click="fetchData">查询数据</el-button>
          <el-button @click="resetFilters">重置条件</el-button>
        </el-form-item>
      </el-form>
    </div>

    <div class="chart-container">
      <div class="chart-title">{{ chartTitle }}</div>
      <div class="data-range-info" v-if="dataRangeInfo">
        {{ dataRangeInfo }}
      </div>
      <div id="oee-chart" ref="chartRef"></div>
      <div class="legend">
        <div class="legend-item">
          <div class="legend-color" style="background-color: #e74c3c;"></div>时间稼动率
        </div>
        <div class="legend-item">
          <div class="legend-color" style="background-color: #f39c12;"></div>性能稼动率
        </div>
        <div class="legend-item">
          <div class="legend-color" style="background-color: #2ecc71;"></div>良率
        </div>
        <div class="legend-item">
          <div class="legend-color" style="background-color: #3498db;"></div>OEE
        </div>
      </div>
    </div>

    <div class="table-container">
      <div class="table-title">OEE 明细数据</div>
      <el-table
          :data="currentTableData"
          border
          style="width: 100%"
          @row-click="handleRowClick"
      >
        <el-table-column prop="index" label="序号" width="80" align="center" />
        <el-table-column prop="name" :label="currentLevelLabel" width="180" align="center" />
        <el-table-column prop="availability" label="时间稼动率(%)" width="150" align="center" />
        <el-table-column prop="performance" label="性能稼动率(%)" width="150" align="center" />
        <el-table-column prop="quality" label="良率(%)" width="150" align="center" />
        <el-table-column prop="oee" label="OEE(%)" width="150" align="center">
          <template #default="scope">
            <el-button type="text" @click.stop="handleOeeClick(scope.row)">
              {{ scope.row.oee }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>
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
  ElButton,
  ElTable,
  ElTableColumn,
  ElForm,
  ElFormItem
} from 'element-plus';

// 时间维度
const timeType = ref('day');

// 时间范围变量
const startDate = ref(null);
const endDate = ref(null);
const startWeek = ref(null);
const endWeek = ref(null);
const startMonth = ref(null);
const endMonth = ref(null);
const startYear = ref(null);
const endYear = ref(null);

// 其他查询条件
const shift = ref('all');
const workshop = ref('all');
const productionLine = ref('all');
const workSection = ref('all');
const manufacturer = ref('all');
const equipment = ref('all');
const calculationMethod = ref('include');

// 图表标题
const chartTitle = ref('日设备 OEE 趋势报表');

// 图表DOM引用
const chartRef = ref(null);
let chartInstance = null;

// 表格数据
const currentLevel = ref('workshop');
const currentLevelLabel = ref('车间名称');
const currentTableData = ref([]);
const dataStack = ref([]);

// 模拟数据
const workshopData = [
  { id: 'workshop1', name: '一车间', availability: 85, performance: 78, quality: 95, oee: 63.3 },
  { id: 'workshop2', name: '二车间', availability: 82, performance: 80, quality: 93, oee: 61.0 },
  { id: 'workshop3', name: '三车间', availability: 88, performance: 75, quality: 94, oee: 62.0 }
];

const productionLineData = {
  workshop1: [
    { id: 'line31', name: '31产线', availability: 83, performance: 77, quality: 94, oee: 60.1 },
    { id: 'line32', name: '32产线', availability: 85, performance: 79, quality: 95, oee: 63.8 },
    { id: 'line33', name: '33产线', availability: 87, performance: 80, quality: 96, oee: 66.8 }
  ],
  workshop2: [
    { id: 'line34', name: '34产线', availability: 82, performance: 78, quality: 93, oee: 59.5 },
    { id: 'line35', name: '35产线', availability: 84, performance: 81, quality: 94, oee: 64.1 },
    { id: 'line36', name: '36产线', availability: 86, performance: 79, quality: 95, oee: 64.6 }
  ],
  workshop3: [
    { id: 'line37', name: '37产线', availability: 85, performance: 80, quality: 96, oee: 65.3 },
    { id: 'line38', name: '38产线', availability: 83, performance: 82, quality: 94, oee: 63.9 },
    { id: 'line39', name: '39产线', availability: 88, performance: 78, quality: 95, oee: 65.2 }
  ]
};

const workSectionData = {
  line31: [
    { id: 'section1', name: 'CFOG段', availability: 82, performance: 75, quality: 93, oee: 57.2 },
    { id: 'section2', name: '贴合段', availability: 84, performance: 77, quality: 94, oee: 60.9 },
    { id: 'section3', name: '组装段', availability: 85, performance: 80, quality: 95, oee: 64.6 },
    { id: 'section4', name: '30米线段', availability: 83, performance: 78, quality: 94, oee: 60.8 }
  ]
};

const equipmentData = {
  section1: [
    { id: 'equip1', name: '冲压机-A1', availability: 80, performance: 75, quality: 92, oee: 55.2 },
    { id: 'equip2', name: '焊接机器人-B1', availability: 82, performance: 78, quality: 93, oee: 59.5 },
    { id: 'equip3', name: '喷涂机-C1', availability: 85, performance: 80, quality: 94, oee: 63.9 }
  ]
};

const fixedWeekOptions = [
  { label: '第20周', value: 20 },
  { label: '第21周', value: 21 },
  { label: '第22周', value: 22 },
  { label: '第23周', value: 23 },
  { label: '第24周', value: 24 },
  { label: '第25周', value: 25 },
  { label: '第26周', value: 26 },
  { label: '第27周', value: 27 },
  { label: '第28周', value: 28 },
  { label: '第29周', value: 29 }
];

const initTableData = () => {
  currentLevel.value = 'workshop';
  currentLevelLabel.value = '车间名称';
  currentTableData.value = workshopData.map((item, index) => ({
    ...item,
    index: index + 1
  }));
  dataStack.value = [];
};

const handleRowClick = (row) => {};

const handleOeeClick = (row) => {
  dataStack.value.push({
    level: currentLevel.value,
    label: currentLevelLabel.value,
    data: [...currentTableData.value]
  });

  if (currentLevel.value === 'workshop') {
    currentLevel.value = 'productionLine';
    currentLevelLabel.value = '产线名称';
    currentTableData.value = productionLineData[row.id]?.map((item, index) => ({
      ...item,
      index: index + 1
    })) || [];
  } else if (currentLevel.value === 'productionLine') {
    currentLevel.value = 'workSection';
    currentLevelLabel.value = '工段名称';
    currentTableData.value = workSectionData[row.id]?.map((item, index) => ({
      ...item,
      index: index + 1
    })) || [];
  } else if (currentLevel.value === 'workSection') {
    currentLevel.value = 'equipment';
    currentLevelLabel.value = '设备名称';
    currentTableData.value = equipmentData[row.id]?.map((item, index) => ({
      ...item,
      index: index + 1
    })) || [];
  }
};

const goBack = () => {
  if (dataStack.value.length > 0) {
    const prevData = dataStack.value.pop();
    currentLevel.value = prevData.level;
    currentLevelLabel.value = prevData.label;
    currentTableData.value = prevData.data;
  }
};

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

const handleTimeTypeChange = (val) => {
  switch (val) {
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

const initDayRange = () => {
  const today = new Date();
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(today.getDate() - 7);
  startDate.value = oneWeekAgo;
  endDate.value = today;
};

const initWeekRange = () => {
  startWeek.value = 25;
  endWeek.value = 29;
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

const handleWeekStartChange = () => {
  fetchData();
};

const handleWeekEndChange = () => {
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

const fetchData = () => {
  console.log('获取数据中...');
  setTimeout(() => {
    renderChart();
    initTableData();
  }, 500);
};

const resetFilters = () => {
  timeType.value = 'day';
  shift.value = 'all';
  workshop.value = 'all';
  productionLine.value = 'all';
  workSection.value = 'all';
  manufacturer.value = 'all';
  equipment.value = 'all';
  calculationMethod.value = 'include';
  chartTitle.value = '日设备 OEE 趋势报表';

  initDayRange();
  renderChart();
  initTableData();
};

const renderChart = () => {
  if (!chartRef.value) return;

  if (chartInstance) {
    chartInstance.dispose();
  }

  chartInstance = echarts.init(chartRef.value);

  let xAxisData = [];
  let availabilityData = [];
  let performanceData = [];
  let qualityData = [];
  let oeeData = [];

  switch (timeType.value) {
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
      formatter: function (params) {
        let result = params[0].name + '<br/>';
        params.forEach(item => {
          let suffix = item.seriesType === 'line' ? '%' : '%';
          result += `<span style="display:inline-block;margin-right:5px;border-radius:50%;width:10px;height:10px;background-color:${item.color};"></span>${item.seriesName}: ${item.value}${suffix}<br/>`;
        });
        return result;
      }
    },
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

const handleResize = () => {
  if (chartInstance) {
    chartInstance.resize();
  }
};

onMounted(() => {
  initDayRange();
  renderChart();
  initTableData();
  window.addEventListener('resize', handleResize);
});

onBeforeUnmount(() => {
  if (chartInstance) {
    chartInstance.dispose();
    chartInstance = null;
  }
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
  display: flex;
  flex-direction: column;
  gap: 20px;
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

.table-container {
  background: white;
  border-radius: 12px;
  padding: 25px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  animation: fadeInUp 0.8s ease;
}

.table-title {
  text-align: center;
  font-size: 1.6rem;
  color: #1a6dcc;
  margin-bottom: 25px;
  font-weight: 600;
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

.data-range-info {
  text-align: center;
  margin-bottom: 15px;
  font-size: 1.1rem;
  color: #555;
  font-weight: 500;
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

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 992px) {
  .control-panel .el-form-item {
    width: 100%;
  }
}
</style>
