<template>
  <el-card>
    <template #header>状态管理</template>
    <el-table :data="statusList" border>
      <el-table-column prop="mold" label="模具号" />
      <el-table-column prop="status" label="状态">
        <template #default="{row}">
          <el-tag :type="tagType(row.status)">{{ row.status }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作">
        <template #default="{row}">
          <el-select v-model="row.status" @change="(v)=>changeStatus(row.mold,v)">
            <el-option v-for="s in allStatus" :key="s" :label="s" :value="s" />
          </el-select>
        </template>
      </el-table-column>
    </el-table>
  </el-card>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import { ElMessage } from 'element-plus'
const statusList = reactive([
  {mold:'M-001', status:'可用'},
  {mold:'M-002', status:'保养中'},
  {mold:'M-003', status:'维修中'},
  {mold:'M-004', status:'管制中'}
])
const allStatus = ['可用','生产中','保养中','维修中','管制中','报废']
const tagType = (s:string)=>{
  const map:any = {可用:'success',生产中:'',保养中:'warning',维修中:'danger',管制中:'info',报废:'info'}
  return map[s]
}
const changeStatus = (mold:string, status:string)=>ElMessage.success(`${mold} 已设为 ${status}`)
</script>
