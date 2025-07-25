<template>
  <canvas ref="chartCanvas"></canvas>
</template>

<script>
import { ref, onMounted, watch } from 'vue'
import { Chart, registerables } from 'chart.js'

export default {
  name: 'PieChart',
  props: {
    data: Object,
    options: Object
  },
  setup(props) {
    const chartCanvas = ref(null)
    let chartInstance = null

    onMounted(() => {
      Chart.register(...registerables)
      if (chartCanvas.value) {
        chartInstance = new Chart(chartCanvas.value, {
          type: 'pie',
          data: props.data,
          options: props.options
        })
      }
    })

    watch(() => props.data, (newData) => {
      if (chartInstance) {
        chartInstance.data = newData
        chartInstance.update()
      }
    }, { deep: true })

    return {
      chartCanvas
    }
  }
}
</script>

<style scoped>
canvas {
  width: 100% !important;
  height: 100% !important;
}
</style>
