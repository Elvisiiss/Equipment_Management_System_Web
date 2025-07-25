<template>
  <div class="line-chart-container">
    <canvas ref="chartCanvas"></canvas>
  </div>
</template>

<script>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue';
import { Chart, registerables } from 'chart.js';

export default {
  name: 'LineChart',
  props: {
    data: {
      type: Object,
      required: true
    },
    options: {
      type: Object,
      default: () => ({})
    }
  },
  setup(props) {
    const chartCanvas = ref(null);
    let chartInstance = null;

    // 注册Chart.js组件
    Chart.register(...registerables);

    // 初始化图表
    const initChart = () => {
      if (chartCanvas.value) {
        // 如果已有图表实例，先销毁
        if (chartInstance) {
          chartInstance.destroy();
        }

        const ctx = chartCanvas.value.getContext('2d');
        chartInstance = new Chart(ctx, {
          type: 'line',
          data: props.data,
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'top',
              },
              tooltip: {
                mode: 'index',
                intersect: false,
              }
            },
            hover: {
              mode: 'nearest',
              intersect: true
            },
            scales: {
              y: {
                beginAtZero: false,
                title: {
                  display: true,
                  text: '稼动率(%)'
                },
                min: 70,
                max: 100
              }
            },
            ...props.options
          }
        });
      }
    };

    // 监听数据变化
    watch(() => props.data, (newData) => {
      if (chartInstance) {
        chartInstance.data = newData;
        chartInstance.update();
      }
    }, { deep: true });

    // 组件挂载时初始化图表
    onMounted(() => {
      initChart();
    });

    // 组件卸载前销毁图表
    onBeforeUnmount(() => {
      if (chartInstance) {
        chartInstance.destroy();
      }
    });

    return {
      chartCanvas
    };
  }
};
</script>

<style scoped>
.line-chart-container {
  position: relative;
  width: 100%;
  height: 100%;
}
</style>
