<template>
  <div class="efficiency-container">
    <el-card class="filter-card">
      <el-form :inline="true" :model="filterForm">
        <el-form-item label="时间范围">
          <el-date-picker
            v-model="filterForm.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="yyyy-MM-dd"
          />
        </el-form-item>
        <el-form-item label="设备类型">
          <el-select v-model="filterForm.deviceType" placeholder="全部">
            <el-option label="全部" value="" />
            <el-option 
              v-for="type in deviceTypes"
              :key="type.value"
              :label="type.label"
              :value="type.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="loadData">查询</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-row :gutter="20" class="mt-20">
      <el-col :span="12">
        <pie-chart
          title="设备类型效率分布"
          :data="efficiencyData.deviceDistribution"
          name-key="type"
          value-key="rate"
        />
      </el-col>
      <el-col :span="12">
        <bar-chart
          title="班组效率对比"
          :data="efficiencyData.teamComparison"
          x-key="team"
          :y-keys="['completionRate', 'avgDuration']"
          :y-names="['完成率', '平均耗时(min)']"
        />
      </el-col>
    </el-row>

    <el-card class="mt-20">
      <el-table :data="efficiencyData.detailList" border>
        <el-table-column prop="deviceCode" label="设备编号" width="120" />
        <el-table-column prop="deviceName" label="设备名称" width="150" />
        <el-table-column prop="completionRate" label="完成率" width="100">
          <template #default="{row}">
            <el-tag :type="row.completionRate >= 0.9 ? 'success' : 'warning'">
              {{ (row.completionRate * 100).toFixed(1) }}%
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="avgDuration" label="平均耗时(min)" width="120" />
        <el-table-column prop="abnormalCount" label="异常次数" width="100" />
      </el-table>
    </el-card>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, reactive } from 'vue'
import { getReportData } from '@/api/inspection'
import PieChart from '@/components/charts/PieChart.vue'
import BarChart from '@/components/charts/BarChart.vue'

interface EfficiencyData {
  deviceDistribution: Array<{type: string; rate: number}>
  teamComparison: Array<{team: string; completionRate: number; avgDuration: number}>
  detailList: Array<{
    deviceCode: string
    deviceName: string
    completionRate: number
    avgDuration: number
    abnormalCount: number
  }>
}

export default defineComponent({
  name: 'EfficiencyAnalysis',
  components: { PieChart, BarChart },
  setup() {
    const filterForm = reactive({
      dateRange: [],
      deviceType: ''
    })

    const deviceTypes = ref([
      { value: 'CNC', label: 'CNC设备' },
      { value: 'INJ', label: '注塑机' },
      { value: 'ASM', label: '组装线' }
    ])

    const efficiencyData = ref<EfficiencyData>({
      deviceDistribution: [],
      teamComparison: [],
      detailList: []
    })

    const loadData = async () => {
      try {
        const params = {
          startDate: filterForm.dateRange?.[0],
          endDate: filterForm.dateRange?.[1],
          deviceType: filterForm.deviceType
        }
        const res = await getReportData(params)
        efficiencyData.value = res.data.efficiencyAnalysis
      } catch (error) {
        console.error('获取效率分析数据失败:', error)
      }
    }

    // 初始化加载数据
    loadData()

    return {
      filterForm,
      deviceTypes,
      efficiencyData,
      loadData
    }
  }
})
</script>

<style scoped lang="scss">
.efficiency-container {
  padding: 20px;
  
  .filter-card {
    margin-bottom: 20px;
  }
  
  .mt-20 {
    margin-top: 20px;
  }
}
</style>
