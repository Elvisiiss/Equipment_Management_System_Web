<template>
  <div class="container">
    <!-- 导航面包屑 -->
    <div class="breadcrumb">
      <span
          v-for="(item, index) in breadcrumb"
          :key="index"
          @click="navigateTo(index)"
          :class="{ 'clickable': index < breadcrumb.length - 1 }"
      >
        {{ item.name }}
        <span v-if="index < breadcrumb.length - 1"> > </span>
      </span>
    </div>

    <!-- 标题 -->
    <h2 class="overview-title">{{ currentTitle }}</h2>

    <!-- 状态统计卡片 -->
    <div class="status-cards">
      <div class="status-card purple">
        <span>总数</span>
        <span class="number">{{ stats.total }}</span>
      </div>
      <div class="status-card green">
        <span>正常运行</span>
        <span class="number">{{ stats.normal }}</span>
      </div>
      <div class="status-card red">
        <span>报警</span>
        <span class="number">{{ stats.alarm }}</span>
      </div>
      <div class="status-card orange">
        <span>待机</span>
        <span class="number">{{ stats.standby }}</span>
      </div>
      <div class="status-card gray">
        <span>离线</span>
        <span class="number">{{ stats.offline }}</span>
      </div>
    </div>

    <!-- 环形图 -->
    <div class="chart-row">
      <div class="chart-container">
        <h3>【实时稼动率】</h3>
        <div class="echarts" id="稼动率Chart"></div>
      </div>
      <div class="chart-container">
        <h3>【状态分布】</h3>
        <div class="echarts" id="状态分布Chart"></div>
      </div>
    </div>

    <!-- 当前层级项目卡片 -->
    <div class="items-row">
      <div
          v-for="(item, index) in currentItems"
          :key="index"
          class="item-card"
          @click="enterNextLevel(item)"
      >
        <h4>{{ item.name }}</h4>
        <div class="item-charts">
          <div class="small-chart">
            <h5>开机率</h5>
            <div class="echarts" :id="`开机率Chart${currentLevel}_${index}`"></div>
          </div>
          <div class="small-chart">
            <h5>稼动率</h5>
            <div class="echarts" :id="`稼动率Chart${currentLevel}_${index}`"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import * as echarts from 'echarts';

// 当前浏览层级
const currentLevel = ref('workshop'); // workshop | productionLine | device | component
const currentTitle = ref('车间运行状态总览');

// 面包屑导航
const breadcrumb = ref([
  { name: '首页', level: 'workshop' }
]);

// 统计数据
const stats = ref({
  total: 32,
  normal: 17,
  alarm: 2,
  standby: 4,
  offline: 9
});

// 模拟数据
const workshops = ref([
  { id: 'workshop1', name: '车间一', total: 6, normal: 3, alarm: 1, standby: 1, offline: 1 },
  { id: 'workshop2', name: '车间二', total: 6, normal: 4, alarm: 0, standby: 1, offline: 1 },
  { id: 'workshop3', name: '车间三', total: 6, normal: 2, alarm: 1, standby: 2, offline: 1 },
  { id: 'workshop4', name: '车间四', total: 6, normal: 3, alarm: 0, standby: 1, offline: 2 },
  { id: 'workshop5', name: '车间五', total: 6, normal: 3, alarm: 0, standby: 1, offline: 2 },
  { id: 'workshop6', name: '车间六', total: 6, normal: 2, alarm: 0, standby: 1, offline: 3 }
]);

// 模拟产线数据
const productionLines = ref({
  workshop1: [
    { id: 'line1-1', name: '产线1-1', total: 5, normal: 3, alarm: 1, standby: 1, offline: 0 },
    { id: 'line1-2', name: '产线1-2', total: 5, normal: 2, alarm: 0, standby: 1, offline: 2 },
    { id: 'line1-3', name: '产线1-3', total: 5, normal: 3, alarm: 0, standby: 1, offline: 1 },
    { id: 'line1-4', name: '产线1-4', total: 5, normal: 2, alarm: 1, standby: 1, offline: 1 },
    { id: 'line1-5', name: '产线1-5', total: 5, normal: 4, alarm: 0, standby: 0, offline: 1 },
    { id: 'line1-6', name: '产线1-6', total: 5, normal: 3, alarm: 0, standby: 1, offline: 1 }
  ],
  // 其他车间的产线数据类似...
});

// 模拟设备数据
const devices = ref({
  'line1-1': [
    { id: 'device1-1-1', name: '设备1-1-1', total: 4, normal: 2, alarm: 1, standby: 1, offline: 0 },
    { id: 'device1-1-2', name: '设备1-1-2', total: 4, normal: 3, alarm: 0, standby: 1, offline: 0 },
    { id: 'device1-1-3', name: '设备1-1-3', total: 4, normal: 2, alarm: 0, standby: 1, offline: 1 },
    { id: 'device1-1-4', name: '设备1-1-4', total: 4, normal: 4, alarm: 0, standby: 0, offline: 0 },
    { id: 'device1-1-5', name: '设备1-1-5', total: 4, normal: 3, alarm: 0, standby: 1, offline: 0 }
  ],
  // 其他产线的设备数据类似...
});

// 模拟备件数据
const components = ref({
  'device1-1-1': [
    { id: 'component1-1-1-1', name: '备件1-1-1-1', status: '正常' },
    { id: 'component1-1-1-2', name: '备件1-1-1-2', status: '正常' },
    { id: 'component1-1-1-3', name: '备件1-1-1-3', status: '报警' },
    { id: 'component1-1-1-4', name: '备件1-1-1-4', status: '正常' }
  ],
  // 其他设备的备件数据类似...
});

// 当前显示的项目
const currentItems = ref([]);
const currentParentId = ref(null);

// 初始化显示车间
onMounted(() => {
  currentItems.value = workshops.value;
  initCharts();
});

// 进入下一级
const enterNextLevel = (item) => {
  if (currentLevel.value === 'workshop') {
    currentLevel.value = 'productionLine';
    currentTitle.value = `${item.name} - 产线运行状态`;
    currentItems.value = productionLines.value[item.id] || [];
    currentParentId.value = item.id;
    updateStats(item);
    breadcrumb.value.push({ name: item.name, level: 'productionLine', id: item.id });
  }
  else if (currentLevel.value === 'productionLine') {
    currentLevel.value = 'device';
    currentTitle.value = `${item.name} - 设备运行状态`;
    currentItems.value = devices.value[item.id] || [];
    currentParentId.value = item.id;
    updateStats(item);
    breadcrumb.value.push({ name: item.name, level: 'device', id: item.id });
  }
  else if (currentLevel.value === 'device') {
    currentLevel.value = 'component';
    currentTitle.value = `${item.name} - 备件状态`;
    currentItems.value = components.value[item.id] || [];
    currentParentId.value = item.id;
    updateStats(item);
    breadcrumb.value.push({ name: item.name, level: 'component', id: item.id });
  }

  initCharts();
};

// 导航到面包屑的某一级
const navigateTo = (index) => {
  if (index === breadcrumb.value.length - 1) return;

  const target = breadcrumb.value[index];
  breadcrumb.value = breadcrumb.value.slice(0, index + 1);

  if (target.level === 'workshop') {
    currentLevel.value = 'workshop';
    currentTitle.value = '车间运行状态总览';
    currentItems.value = workshops.value;
    resetStats();
  }
  else if (target.level === 'productionLine') {
    currentLevel.value = 'productionLine';
    currentTitle.value = `${target.name} - 产线运行状态`;
    currentItems.value = productionLines.value[target.id] || [];
    updateStats(workshops.value.find(w => w.id === target.id) || {});
  }
  else if (target.level === 'device') {
    currentLevel.value = 'device';
    currentTitle.value = `${target.name} - 设备运行状态`;
    currentItems.value = devices.value[target.id] || [];
    updateStats(productionLines.value[currentParentId.value].find(p => p.id === target.id) || {});
  }

  initCharts();
};

// 更新统计数据
const updateStats = (item) => {
  stats.value = {
    total: item.total || 0,
    normal: item.normal || 0,
    alarm: item.alarm || 0,
    standby: item.standby || 0,
    offline: item.offline || 0
  };
};

// 重置统计数据
const resetStats = () => {
  stats.value = {
    total: 32,
    normal: 17,
    alarm: 2,
    standby: 4,
    offline: 9
  };
};

// 初始化图表
const initCharts = () => {
  // 初始化大环形图
  initRingChart('稼动率Chart', '稼动率', [
    { value: stats.value.normal, name: '稼动率' },
    { value: stats.value.total - stats.value.normal, name: '停机率' }
  ]);

  initRingChart('状态分布Chart', '状态分布', [
    { value: stats.value.normal, name: '正常运行' },
    { value: stats.value.alarm, name: '报警' },
    { value: stats.value.standby, name: '待机' },
    { value: stats.value.offline, name: '离线' }
  ]);

  // 初始化小环形图
  currentItems.value.forEach((item, index) => {
    const total = item.total || 1;
    const normal = item.normal || 0;

    initRingChart(`开机率Chart${currentLevel.value}_${index}`, '开机率', [
      { value: normal, name: '开机' },
      { value: total - normal, name: '关机' }
    ]);

    initRingChart(`稼动率Chart${currentLevel.value}_${index}`, '稼动率', [
      { value: normal, name: '稼动' },
      { value: total - normal, name: '停机' }
    ]);
  });
};

// 初始化环形图的通用函数
const initRingChart = (domId, title, data) => {
  const element = document.getElementById(domId);
  if (!element) return;

  // 先销毁已有的图表实例
  const existingChart = echarts.getInstanceByDom(element);
  if (existingChart) {
    existingChart.dispose();
  }

  const myChart = echarts.init(element);
  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)'
    },
    series: [
      {
        name: title,
        type: 'pie',
        radius: ['50%', '70%'],
        avoidLabelOverlap: false,
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 16,
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: false
        },
        data: data
      }
    ]
  };
  myChart.setOption(option);
};

// 监听currentItems变化重新渲染图表
watch(currentItems, () => {
  initCharts();
}, { deep: true });
</script>

<style scoped>
.container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.breadcrumb {
  margin-bottom: 20px;
  font-size: 16px;
}

.clickable {
  color: #1890ff;
  cursor: pointer;
}

.clickable:hover {
  text-decoration: underline;
}

.overview-title {
  text-align: center;
  margin: 20px 0;
  color: #333;
}

.status-cards {
  display: flex;
  gap: 15px;
  margin: 0 20px 30px;
}

.status-card {
  flex: 1;
  padding: 15px;
  border-radius: 8px;
  color: white;
  text-align: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.purple { background-color: #6b5b95; }
.green { background-color: #2aa198; }
.red { background-color: #dc322f; }
.orange { background-color: #f39c12; }
.gray { background-color: #859900; }

.number {
  font-size: 24px;
  font-weight: bold;
  margin-top: 5px;
}

.chart-row {
  display: flex;
  justify-content: center;
  gap: 50px;
  margin-bottom: 40px;
}

.chart-container {
  text-align: center;
}

.echarts {
  width: 250px;
  height: 250px;
}

.items-row {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  justify-content: center;
  margin: 0 20px;
}

.item-card {
  flex: 1 1 calc(16.666% - 20px);
  min-width: 150px;
  max-width: 200px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 15px;
  text-align: center;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
  cursor: pointer;
  transition: transform 0.2s;
  box-sizing: border-box;
}

.item-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.item-charts {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-top: 10px;
}

.small-chart .echarts {
  width: 60px;
  height: 60px;
}

@media (max-width: 768px) {
  .status-cards {
    flex-wrap: wrap;
  }

  .status-card {
    flex: 1 1 calc(50% - 15px);
    min-width: calc(50% - 15px);
  }

  .chart-row {
    flex-direction: column;
    gap: 30px;
  }

  .item-card {
    flex: 1 1 calc(50% - 20px);
    max-width: calc(50% - 20px);
  }
}
</style>
