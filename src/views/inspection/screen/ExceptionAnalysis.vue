<template>
  <div class="exception-container">
    <el-card class="filter-card">
      <el-form :inline="true" :model="filterForm">
        <el-form-item label="异常类型">
          <el-select v-model="filterForm.exceptionType" placeholder="全部" style="width: 180px">
            <el-option label="全部" value="" />
            <el-option
              v-for="type in exceptionTypes"
              :key="type.value"
              :label="type.label"
              :value="type.value"
            />
          </el-select>
        </el-form-item>
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
        <el-form-item>
          <el-button type="primary" @click="loadData">查询</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-row :gutter="20" class="mt-20">
      <el-col :span="8">
        <pie-chart
          title="异常类型分布"
          :data="exceptionData.typeDistribution"
          name-key="type"
          value-key="count"
        />
      </el-col>
      <el-col :span="16">
        <line-chart
          title="异常趋势"
          :data="exceptionData.trendData"
          x-key="date"
          y-key="count"
          :area="true"
        />
      </el-col>
    </el-row>

    <el-card class="mt-20">
      <el-table
        :data="exceptionData.detailList"
        border
        @row-click="handleRowClick"
      >
        <el-table-column prop="exceptionTime" label="发生时间" width="160" />
        <el-table-column prop="deviceCode" label="设备编号" width="120" />
        <el-table-column prop="deviceName" label="设备名称" width="150" />
        <el-table-column prop="exceptionType" label="异常类型" width="120">
          <template #default="{row}">
            <el-tag :type="getTagType(row.exceptionType)">
              {{ row.exceptionType }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="exceptionLevel" label="严重程度" width="100">
          <template #default="{row}">
            <el-rate
              v-model="row.exceptionLevel"
              disabled
              :colors="['#99A9BF', '#F7BA2A', '#FF9900']"
            />
          </template>
        </el-table-column>
        <el-table-column prop="status" label="处理状态" width="100">
          <template #default="{row}">
            <el-tag :type="row.status === '已处理' ? 'success' : 'danger'">
              {{ row.status }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, reactive } from 'vue'
import { getReportData } from '@/api/inspection'
import PieChart from '@/components/charts/PieChart.vue'
import LineChart from '@/components/charts/LineChart.vue'

interface ExceptionData {
  typeDistribution: Array<{type: string; count: number}>
  trendData: Array<{date: string; count: number}>
  detailList: Array<{
    id: string
    exceptionTime: string
    deviceCode: string
    deviceName: string
    exceptionType: string
    exceptionLevel: number
    status: string
  }>
}

export default defineComponent({
  name: 'ExceptionAnalysis',
  components: { PieChart, LineChart },
  setup() {
    const filterForm = reactive({
      exceptionType: '',
      dateRange: []
    })

    const exceptionTypes = ref([
      { value: 'PARAM', label: '参数异常' },
      { value: 'DEVICE', label: '设备故障' },
      { value: 'OPERATION', label: '操作问题' }
    ])

    const exceptionData = ref<ExceptionData>({
      typeDistribution: [],
      trendData: [],
      detailList: []
    })

    const loadData = async () => {
      try {
        const params = {
          exceptionType: filterForm.exceptionType,
          startDate: filterForm.dateRange?.[0],
          endDate: filterForm.dateRange?.[1]
        }
        const res = await getReportData(params)
        exceptionData.value = res.data.exceptionAnalysis
      } catch (error) {
        console.error('获取异常分析数据失败:', error)
      }
    }

    const getTagType = (type: string) => {
      const typeMap: Record<string, string> = {
        '参数异常': 'warning',
        '设备故障': 'danger',
        '操作问题': 'info'
      }
      return typeMap[type] || ''
    }

    const handleRowClick = (row: any) => {
      // TODO: 跳转到异常详情页
      console.log('查看异常详情:', row.id)
    }

    // 初始化加载数据
    loadData()

    return {
      filterForm,
      exceptionTypes,
      exceptionData,
      loadData,
      getTagType,
      handleRowClick
    }
  }
})
</script>

<style scoped lang="scss">
.exception-container {
  padding: 20px;

  .filter-card {
    margin-bottom: 20px;
  }

  .mt-20 {
    margin-top: 20px;
  }
}
</style>
