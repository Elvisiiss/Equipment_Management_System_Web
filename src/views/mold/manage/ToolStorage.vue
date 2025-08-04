<template>
  <el-card>
    <template #header><span>存储与权限</span></template>
    <el-row :gutter="20">
      <el-col :span="12">
        <h4>库位地图</h4>
        <el-table :data="locations" border>
          <el-table-column prop="loc" label="库位"/>
          <el-table-column prop="tool" label="当前治具"/>
          <el-table-column label="操作">
            <template #default="{row}">
              <el-button size="small" type="text" @click="pickLoc(row)">选择</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-col>
      <el-col :span="12">
        <h4>权限规则示例</h4>
        <el-form :model="permForm">
          <el-form-item label="员工卡号">
            <el-input v-model="permForm.card" placeholder="刷卡"/>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="checkPerm">校验权限</el-button>
          </el-form-item>
        </el-form>
        <el-alert v-if="permMsg" :title="permMsg" :type="permType"/>
      </el-col>
    </el-row>
  </el-card>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
const locations = ref([
  {loc:'A01', tool:'JZ0001'},
  {loc:'A02', tool:''},
  {loc:'A03', tool:'JZ0003'},
])
const permForm = ref({card:''})
const permMsg = ref(''); const permType = ref('info')
const pickLoc = (row) => ElMessage.info(`已选库位 ${row.loc}`)
const checkPerm = () => {
  permMsg.value = '权限校验通过 ✔️'
  permType.value = 'success'
}
</script>
