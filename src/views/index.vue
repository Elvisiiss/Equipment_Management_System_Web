<template>
  <!-- 设备运行状态总览标题 -->
  <h2 class="overview-title">车间运行状态总览</h2>

  <!-- 第一行：状态统计卡片 -->
  <div class="status-cards">
    <div class="status-card purple">
      <span>总数</span>
      <span class="number">32</span>
    </div>
    <div class="status-card green">
      <span>正常运行</span>
      <span class="number">17</span>
    </div>
    <div class="status-card red">
      <span>报警</span>
      <span class="number">2</span>
    </div>
    <div class="status-card orange">
      <span>待机</span>
      <span class="number">4</span>
    </div>
    <div class="status-card gray">
      <span>离线</span>
      <span class="number">9</span>
    </div>
  </div>

  <!-- 第二行：环形图（稼动率、正常运行） -->
  <div class="chart-row">
    <div class="chart-container">
      <h3>【当天设备实时稼动率】</h3>
      <div class="echarts" id="稼动率Chart"></div>
    </div>
    <div class="chart-container">
      <h3>【当天设备状态分布】</h3>
      <div class="echarts" id="状态分布Chart"></div>
    </div>
  </div>

  <!-- 第三行：车间卡片（含开机率、稼动率环形图） -->
  <div class="workshop-row">
    <div
        v-for="(workshop, index) in workshops"
        :key="index"
        class="workshop-card"
        @click="goToWorkshop(workshop)"
    >
      <h4>{{ workshop.name }}</h4>
      <div class="workshop-charts">
        <div class="small-chart">
          <h5>开机率</h5>
          <div class="echarts" :id="`开机率Chart${index}`"></div>
        </div>
        <div class="small-chart">
          <h5>稼动率</h5>
          <div class="echarts" :id="`稼动率Chart${index}`"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import * as echarts from 'echarts';
import { useRouter } from 'vue-router';
// 模拟车间数据
const workshops = ref([
  { id: 'workshop1', name: '车间一' },
  { id: 'workshop2', name: '车间二' },
  { id: 'workshop3', name: '车间三' },
  { id: 'workshop4', name: '车间四' },
  { id: 'workshop5', name: '车间五' },
  { id: 'workshop6', name: '车间六' },
]);

const router = useRouter();
// 跳转至车间详情页（需结合 vue-router 使用）
const goToWorkshop = (workshop) => {
  console.log(`跳转到 ${workshop.name} 车间页面`);
  router.push({ name: 'Workshop', params: { id: workshop.id } });
};

// 初始化环形图的通用函数
const initRingChart = (domId, title, data) => {
  const myChart = echarts.init(document.getElementById(domId));
  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)'
    },
    series: [
      {
        name: title,
        type: 'pie',
        radius: ['50%', '70%'], // 环形图内外半径
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

onMounted(() => {
  // 初始化第二行环形图
  initRingChart('稼动率Chart', '稼动率', [
    { value: 38.1, name: '稼动率' },
    { value: 61.9, name: '停机率' }
  ]);

  initRingChart('状态分布Chart', '状态分布', [
    { value: 17, name: '正常运行' },
    { value: 2, name: '报警' },
    { value: 4, name: '待机' },
    { value: 9, name: '离线' }
  ]);

  // 初始化第三行车间卡片里的环形图
  workshops.value.forEach((_, index) => {
    // 模拟数据，实际项目中替换为接口数据
    initRingChart(`开机率Chart${index}`, '开机率', [
      { value: 42.88, name: '开机' },
      { value: 57.12, name: '关机' }
    ]);

    initRingChart(`稼动率Chart${index}`, '稼动率', [
      { value: 42.47, name: '稼动' },
      { value: 57.53, name: '停机' }
    ]);
  });
});
</script>

<style scoped>
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

/* 第三行车间卡片容器样式修改 */
.workshop-row {
  display: flex;
  /* 让子元素在一行均匀分布，两端对齐 */
  justify-content: space-around;
  /* 允许换行，这里因为固定 6 个卡片，一般不会换行，可根据需求调整 */
  flex-wrap: wrap;
  margin: 0 20px;
}

/* 车间卡片样式修改 */
.workshop-card {
  /* 让卡片在容器中均匀分配宽度，可根据实际需求调整 flex-basis 值 */
  flex: 1 1 calc(16.666% - 20px);
  max-width: calc(16.666% - 20px);
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 15px;
  text-align: center;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
  cursor: pointer;
  transition: transform 0.2s;
  box-sizing: border-box;
  margin: 0 10px;
}

.workshop-card:hover {
  transform: translateY(-3px);
}

.workshop-charts {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-top: 10px;
}

.small-chart .echarts {
  width: 60px;
  height: 60px;
}
</style>
