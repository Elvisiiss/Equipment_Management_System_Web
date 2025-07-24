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
      <template v-if="currentLevel !== 'component'">
        <div
            v-for="(item, index) in currentItems"
            :key="index"
            class="item-card"
            @click="enterNextLevel(item)"
        >
          <h4>{{ item.name }}</h4>
          <div class="item-charts">
            <div class="small-chart">
              <h5>实时稼动率</h5>
              <div class="echarts" :id="`实时稼动率Chart${currentLevel}_${index}`"></div>
            </div>
            <div class="small-chart">
              <h5>状态分布</h5>
              <div class="echarts" :id="`状态分布Chart${currentLevel}_${index}`"></div>
            </div>
          </div>
        </div>
      </template>

      <template v-else>
        <div
            v-for="(item, index) in currentItems"
            :key="index"
            class="item-card"
        >
          <h4>{{ item.name }}</h4>
          <div class="component-status" :class="getStatusClass(item.status)">
            {{ item.status }}
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, nextTick } from 'vue';
import * as echarts from 'echarts';

// 当前浏览层级
const currentLevel = ref('workshop'); // workshop | productionLine | device | component
const currentTitle = ref('首页状态总览');

// 面包屑导航
const breadcrumb = ref([
  { name: '首页', level: 'workshop' }
]);

// 统计数据
const stats = ref({
  total: 0,
  normal: 0,
  alarm: 0,
  standby: 0,
  offline: 0
});

// 当前显示的项目
const currentItems = ref([]);
const currentParentId = ref(null);

// 生成随机数据
const generateRandomData = () => {
  const data = {
    workshops: [],
    productionLines: {},
    devices: {},
    components: {}
  };

  // 生成车间数据 (1-6个车间)
  const workshopCount = Math.floor(Math.random() * 6) + 1;
  for (let i = 1; i <= workshopCount; i++) {
    const workshop = {
      id: `workshop${i}`,
      name: `车间${i}`,
      total: Math.floor(Math.random() * 20) + 5,
      normal: 0,
      alarm: 0,
      standby: 0,
      offline: 0,
      son: []
    };

    // 生成产线数据 (每个车间2-5条产线)
    const lineCount = Math.floor(Math.random() * 4) + 2;
    data.productionLines[workshop.id] = [];
    for (let j = 1; j <= lineCount; j++) {
      const line = {
        id: `line${i}-${j}`,
        name: `产线${i}-${j}`,
        total: Math.floor(Math.random() * 15) + 3,
        normal: 0,
        alarm: 0,
        standby: 0,
        offline: 0,
        son: []
      };

      // 生成设备数据 (每条产线3-8台设备)
      const deviceCount = Math.floor(Math.random() * 6) + 3;
      data.devices[line.id] = [];
      for (let k = 1; k <= deviceCount; k++) {
        const device = {
          id: `device${i}-${j}-${k}`,
          name: `设备${i}-${j}-${k}`,
          total: Math.floor(Math.random() * 10) + 2,
          normal: 0,
          alarm: 0,
          standby: 0,
          offline: 0,
          son: []
        };

        // 生成备件数据 (每台设备2-6个备件)
        const componentCount = Math.floor(Math.random() * 5) + 2;
        data.components[device.id] = [];
        for (let m = 1; m <= componentCount; m++) {
          const statuses = ['正常', '报警', '待机', '离线'];
          const status = statuses[Math.floor(Math.random() * statuses.length)];

          const component = {
            id: `component${i}-${j}-${k}-${m}`,
            name: `备件${i}-${j}-${k}-${m}`,
            status: status
          };
          data.components[device.id].push(component);
          device.son.push(component);
        }

        // 计算设备状态
        device.normal = Math.floor(Math.random() * (device.total - 1)) + 1;
        device.alarm = Math.floor(Math.random() * (device.total - device.normal));
        device.standby = Math.floor(Math.random() * (device.total - device.normal - device.alarm));
        device.offline = device.total - device.normal - device.alarm - device.standby;

        data.devices[line.id].push(device);
        line.son.push(device);
      }

      // 计算产线状态
      line.normal = data.devices[line.id].reduce((sum, device) => sum + device.normal, 0);
      line.alarm = data.devices[line.id].reduce((sum, device) => sum + device.alarm, 0);
      line.standby = data.devices[line.id].reduce((sum, device) => sum + device.standby, 0);
      line.offline = data.devices[line.id].reduce((sum, device) => sum + device.offline, 0);

      data.productionLines[workshop.id].push(line);
      workshop.son.push(line);
    }

    // 计算车间状态
    workshop.normal = data.productionLines[workshop.id].reduce((sum, line) => sum + line.normal, 0);
    workshop.alarm = data.productionLines[workshop.id].reduce((sum, line) => sum + line.alarm, 0);
    workshop.standby = data.productionLines[workshop.id].reduce((sum, line) => sum + line.standby, 0);
    workshop.offline = data.productionLines[workshop.id].reduce((sum, line) => sum + line.offline, 0);

    data.workshops.push(workshop);
  }

  // 计算全局状态
  stats.value.total = data.workshops.reduce((sum, workshop) => sum + workshop.total, 0);
  stats.value.normal = data.workshops.reduce((sum, workshop) => sum + workshop.normal, 0);
  stats.value.alarm = data.workshops.reduce((sum, workshop) => sum + workshop.alarm, 0);
  stats.value.standby = data.workshops.reduce((sum, workshop) => sum + workshop.standby, 0);
  stats.value.offline = data.workshops.reduce((sum, workshop) => sum + workshop.offline, 0);

  return data;
};

// 初始化数据
const dataStore = ref(generateRandomData());

// 初始化显示车间
onMounted(() => {
  currentItems.value = dataStore.value.workshops;
  nextTick(() => {
    initCharts();
  });
});

// 进入下一级
const enterNextLevel = (item) => {
  if (currentLevel.value === 'workshop') {
    currentLevel.value = 'productionLine';
    currentTitle.value = `${item.name}运行状态`;
    currentItems.value = dataStore.value.productionLines[item.id] || [];
    currentParentId.value = item.id;
    updateStats(item);
    breadcrumb.value.push({ name: item.name, level: 'productionLine', id: item.id });
  }
  else if (currentLevel.value === 'productionLine') {
    currentLevel.value = 'device';
    currentTitle.value = `${item.name}运行状态`;
    currentItems.value = dataStore.value.devices[item.id] || [];
    currentParentId.value = item.id;
    updateStats(item);
    breadcrumb.value.push({ name: item.name, level: 'device', id: item.id });
  }
  else if (currentLevel.value === 'device') {
    currentLevel.value = 'component';
    currentTitle.value = `${item.name}运行状态`;
    currentItems.value = dataStore.value.components[item.id] || [];
    currentParentId.value = item.id;
    breadcrumb.value.push({ name: item.name, level: 'component', id: item.id });

    // 清空统计卡片数据
    stats.value = { total: 0, normal: 0, alarm: 0, standby: 0, offline: 0 };
    return;
  }

  nextTick(() => {
    initCharts();
  });
};

// 导航到面包屑的某一级
const navigateTo = (index) => {
  if (index === breadcrumb.value.length - 1) return;

  const target = breadcrumb.value[index];
  breadcrumb.value = breadcrumb.value.slice(0, index + 1);

  if (target.level === 'workshop') {
    currentLevel.value = 'workshop';
    currentTitle.value = '首页状态总览';
    currentItems.value = dataStore.value.workshops;
    resetStats();
  }
  else if (target.level === 'productionLine') {
    currentLevel.value = 'productionLine';
    currentTitle.value = `${target.name}运行状态`;

    // 找到对应的车间
    const workshop = dataStore.value.workshops.find(w => w.id === target.id);
    if (workshop) {
      currentItems.value = workshop.son || [];
      updateStats(workshop);
    }
  }
  else if (target.level === 'device') {
    currentLevel.value = 'device';
    currentTitle.value = `${target.name}运行状态`;

    // 找到对应的产线
    const workshopId = breadcrumb.value[1]?.id;
    if (workshopId) {
      const productionLine = dataStore.value.productionLines[workshopId]?.find(p => p.id === target.id);
      if (productionLine) {
        currentItems.value = productionLine.son || [];
        updateStats(productionLine);
      }
    }
  }
  else if (target.level === 'component') {
    currentLevel.value = 'component';
    currentTitle.value = `${target.name}运行状态`;

    // 找到对应的设备
    const deviceId = target.id;
    if (deviceId) {
      currentItems.value = dataStore.value.components[deviceId] || [];
      stats.value = { total: 0, normal: 0, alarm: 0, standby: 0, offline: 0 };
      return;
    }
  }

  nextTick(() => {
    initCharts();
  });
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
    total: dataStore.value.workshops.reduce((sum, w) => sum + w.total, 0),
    normal: dataStore.value.workshops.reduce((sum, w) => sum + w.normal, 0),
    alarm: dataStore.value.workshops.reduce((sum, w) => sum + w.alarm, 0),
    standby: dataStore.value.workshops.reduce((sum, w) => sum + w.standby, 0),
    offline: dataStore.value.workshops.reduce((sum, w) => sum + w.offline, 0)
  };
};

// 获取状态对应的样式类
const getStatusClass = (status) => {
  switch (status) {
    case '正常': return 'status-normal';
    case '报警': return 'status-alarm';
    case '待机': return 'status-standby';
    case '离线': return 'status-offline';
    default: return '';
  }
};

// 初始化图表
const initCharts = () => {
  // 初始化大环形图 - 实时稼动率（单环进度图）
  initProgressChart('稼动率Chart', stats.value);

  // 初始化大环形图 - 状态分布
  initRingChart('状态分布Chart', '状态分布', [
    { value: stats.value.normal, name: '正常运行' },
    { value: stats.value.alarm, name: '报警' },
    { value: stats.value.standby, name: '待机' },
    { value: stats.value.offline, name: '离线' }
  ]);

  // 初始化小环形图
  currentItems.value.forEach((item, index) => {
    // 实时稼动率（单环进度图）
    initProgressChart(`实时稼动率Chart${currentLevel.value}_${index}`, item, true);

    // 状态分布
    initRingChart(`状态分布Chart${currentLevel.value}_${index}`, '状态分布', [
      { value: item.normal || 0, name: '正常运行' },
      { value: item.alarm || 0, name: '报警' },
      { value: item.standby || 0, name: '待机' },
      { value: item.offline || 0, name: '离线' }
    ], true);
  });
};

// 初始化环形进度图（实时稼动率）
const initProgressChart = (domId, data, isSmall = false) => {
  const element = document.getElementById(domId);
  if (!element) return;

  // 先销毁已有的图表实例
  const existingChart = echarts.getInstanceByDom(element);
  if (existingChart) {
    existingChart.dispose();
  }

  const total = data.total || 1;
  const normal = data.normal || 0;
  const utilization = Math.round((normal / total) * 100);

  // 根据稼动率确定颜色
  let color;
  if (utilization >= 95) {
    color = '#2aa198'; // 绿色
  } else if (utilization >= 80) {
    color = '#f39c12'; // 黄色
  } else {
    color = '#dc322f'; // 红色
  }

  const myChart = echarts.init(element);
  const option = {
    tooltip: {
      formatter: `稼动率: ${utilization}%`
    },
    series: [
      {
        name: '稼动率',
        type: 'gauge',
        radius: isSmall ? '70%' : '90%',
        startAngle: 225,
        endAngle: -45,
        min: 0,
        max: 100,
        splitNumber: 0,
        axisLine: {
          lineStyle: {
            width: isSmall ? 6 : 15,
            color: [[1, '#eee']]
          }
        },
        pointer: {
          show: false
        },
        axisTick: {
          show: false
        },
        splitLine: {
          show: false
        },
        axisLabel: {
          show: false
        },
        detail: {
          valueAnimation: true,
          fontSize: isSmall ? 12 : 20,
          fontWeight: 'bold',
          formatter: `{value}%`,
          color: '#333',
          offsetCenter: [0, 0]
        },
        data: [
          {
            value: utilization,
            name: '稼动率',
            itemStyle: {
              color: color
            }
          }
        ]
      }
    ]
  };

  myChart.setOption(option);
};

// 初始化环形图的通用函数（状态分布）
const initRingChart = (domId, title, data, isSmall = false) => {
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
    legend: {
      show: false
    },
    series: [
      {
        name: title,
        type: 'pie',
        radius: isSmall ? ['60%', '70%'] : ['50%', '70%'],
        avoidLabelOverlap: false,
        label: {
          show: false
        },
        emphasis: {
          label: {
            show: false
          }
        },
        labelLine: {
          show: false
        },
        data: [
          { value: data[0].value, name: data[0].name, itemStyle: { color: '#2aa198' } },
          { value: data[1].value, name: data[1].name, itemStyle: { color: '#dc322f' } },
          { value: data[2].value, name: data[2].name, itemStyle: { color: '#f39c12' } },
          { value: data[3].value, name: data[3].name, itemStyle: { color: '#859900' } }
        ]
      }
    ]
  };
  myChart.setOption(option);
};

// 监听currentItems变化重新渲染图表
watch(currentItems, () => {
  if (currentLevel.value !== 'component') {
    nextTick(() => {
      initCharts();
    });
  }
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

.component-status {
  margin-top: 15px;
  padding: 8px;
  border-radius: 4px;
  font-weight: bold;
}

.status-normal { background-color: #e6f7ff; color: #2aa198; }
.status-alarm { background-color: #fff2f0; color: #dc322f; }
.status-standby { background-color: #fffbe6; color: #f39c12; }
.status-offline { background-color: #f9f9f9; color: #859900; }

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
