<template>
  <div class="chart-container">
    <canvas ref="chartCanvas"></canvas>
  </div>
</template>

<script>
import { ref, onMounted, watch, onBeforeUnmount } from 'vue'
import Chart from 'chart.js/auto'

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
    const chartCanvas = ref(null)
    let chartInstance = null

    // 默认图表选项
    const defaultOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
          labels: {
            color: '#a0aec0',
            font: {
              size: 12
            }
          }
        },
        tooltip: {
          mode: 'index',
          intersect: false,
          backgroundColor: 'rgba(30, 40, 60, 0.8)',
          titleColor: '#fff',
          bodyColor: '#fff',
          borderColor: 'rgba(66, 134, 244, 0.5)',
          borderWidth: 1
        }
      },
      scales: {
        x: {
          grid: {
            color: 'rgba(66, 134, 244, 0.1)'
          },
          ticks: {
            color: '#a0aec0'
          }
        },
        y: {
          grid: {
            color: 'rgba(66, 134, 244, 0.1)'
          },
          ticks: {
            color: '#a0aec0'
          }
        }
      },
      interaction: {
        mode: 'nearest',
        axis: 'x',
        intersect: false
      },
      elements: {
        line: {
          tension: 0.3
        },
        point: {
          radius: 4,
          hoverRadius: 6
        }
      }
    }

    // 初始化图表
    const initChart = () => {
      if (!chartCanvas.value) return

      // 合并默认选项和传入的选项
      const mergedOptions = { ...defaultOptions, ...props.options }

      // 销毁现有图表实例
      if (chartInstance) {
        chartInstance.destroy()
      }

      // 创建新图表实例
      chartInstance = new Chart(chartCanvas.value, {
        type: 'line',
        data: props.data,
        options: mergedOptions
      })
    }

    // 响应数据变化更新图表
    watch(() => props.data, () => {
      initChart()
    }, { deep: true })

    // 组件挂载时初始化图表
    onMounted(() => {
      initChart()
    })

    // 组件卸载前销毁图表实例
    onBeforeUnmount(() => {
      if (chartInstance) {
        chartInstance.destroy()
      }
    })

    return {
      chartCanvas
    }
  }
}
</script>

<style scoped>
.chart-container {
  height: 300px;
  position: relative;
}
</style>
