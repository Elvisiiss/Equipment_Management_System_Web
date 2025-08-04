<template>
  <el-card>
    <template #header><span>治具台账中心</span></template>
    <el-row :gutter="10" style="margin-bottom:10px">
      <el-col :span="8">
        <el-input v-model="query.name" placeholder="治具名称"></el-input>
      </el-col>
      <el-col :span="6">
        <el-button type="primary" @click="getList">查询</el-button>
        <el-button @click="reset">重置</el-button>
      </el-col>
    </el-row>

    <el-table :data="list" border>
      <el-table-column prop="code" label="治具编号" />
      <el-table-column prop="name" label="治具名称" />
      <el-table-column prop="totalLife" label="寿命上限" />
      <el-table-column prop="used" label="已用次数" />
      <el-table-column prop="status" label="状态">
        <template #default="{row}">
          <el-tag :type="row.status==='报废'?'danger':'success'">{{row.status}}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="120">
        <template #default>
          <el-button size="small" type="text">报废</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination
        background
        layout="prev, pager, next"
        :total="total"
        v-model:current-page="query.page"
        style="margin-top:10px;justify-content:flex-end"/>
  </el-card>
</template>

<script setup>
import { reactive, ref } from 'vue'
const query = reactive({ name:'', page:1 })
const total = ref(20)
const list = ref([])
const getList = () => {
  // 模拟数据
  list.value = Array.from({length:10}).map((_,i)=>({
    code:'JZ'+String(i).padStart(4,'0'),
    name:'治具'+i,
    totalLife:10000,
    used:i*123,
    status:i%3===0?'报废':'正常'
  }))
}
const reset = () => { query.name=''; query.page=1; getList() }
getList()
</script>
