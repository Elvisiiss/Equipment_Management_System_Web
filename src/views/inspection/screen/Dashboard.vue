<template>
  <div class="dashboard-container">
    <el-row :gutter="20">
      <!-- 概览指标 -->
      <el-col :span="6">
        <stat-card 
          title="点检完成率" 
          :value="dashboardData.completionRate" 
          type="percentage"
          icon="el-icon-success"
        />
      </el-col>
      <el-col :span="6">
        <stat-card 
          title="准时率" 
          :value="dashboardData.onTimeRate" 
          type="percentage"
          icon="el-icon-time"
        />
      </el-col>
      <el-col :span="6">
        <stat-card 
          title="异常率" 
          :value="dashboardData.abnormalRate" 
          type="percentage"
          icon="el-icon-warning"
          trend="down"
        />
      </el-col>
    </el-row>

    <!-- 趋势图表 -->
    <el-row :gutter="20" class="mt-20">
      <el-col :span="12">
        <line-chart 
          title="点检完成趋势"
          :data="dashboardData.trendData"
          x-key="date"
          :y-keys="['completion', 'onTime']"
        />
      </el-col>
      <el-col :span="12">
        <bar-chart
          title="设备异常排名"
          :data="dashboardData.abnormalRank"
          x-key="device"
          y-key="count"
        />
      </el-col>
    </el-row>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue'
import { getDashboardData } from '@/api/inspection'
import StatCard from '@/components/money/StatCard.vue'
import LineChart from '@/components/charts/LineChart.vue'
import BarChart from '@/components/charts/BarChart.vue'

export default defineComponent({
  name: 'InspectionDashboard',
  components: { StatCard, LineChart, BarChart },
  setup() {
    const dashboardData = ref({
      completionRate: 0,
      onTimeRate: 0,
      abnormalRate: 0,
      trendData: [],
      abnormalRank: []
    })

    const loadData = async () => {
      try {
        const res = await getDashboardData()
        dashboardData.value = res.data
      } catch (error) {
        console.error('获取看板数据失败:', error)
      }
    }

    onMounted(() => {
      loadData()
    })

    return {
      dashboardData
    }
  }
})
</script>

<style scoped lang="scss">
.dashboard-container {
  padding: 20px;
  background-color: #f5f7fa;
  
  .mt-20 {
    margin-top: 20px;
  }
}
</style>
