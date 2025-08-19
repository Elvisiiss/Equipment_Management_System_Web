<template>
  <el-card shadow="hover" style="margin-top:20px">
    <div style="margin-bottom:10px;font-weight:bold;font-size:16px">{{ title }}</div>
    <el-table-v2
        :columns="columns"
        :data="coloredData"
        :width="700"
        :height="400"
        fixed
    />
  </el-card>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  data: { type: Array, default: () => [] },
  title: { type: String, default: '' }
})

/* 前三名颜色 */
const rankColors = ['#F56C6C', '#E6A23C', '#67C23A']

const coloredData = computed(() =>
    props.data.map((row, idx) => ({
      ...row,
      rowColor: idx < 3 ? rankColors[idx] : ''
    }))
)

const columns = [
  { key: 'index', title: '排名', width: 80, cellRenderer: ({ rowIndex }) => rowIndex + 1 },
  { key: 'name', title: '名称', width: 200 },
  { key: 'value', title: '数值(h)', width: 120 },
  { key: 'count', title: '次数', width: 100 },
  { key: 'totalTime', title: '总时长(h)', width: 120 },
  {
    key: 'operate',
    title: '操作',
    width: 100,
    cellRenderer: ({ rowData }) =>
        h(
            'el-button',
            { type: 'text', onClick: () => emit('row-click', rowData) },
            '明细'
        )
  }
]
</script>
