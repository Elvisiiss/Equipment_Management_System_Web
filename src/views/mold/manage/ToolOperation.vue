<template>
  <el-card>
    <template #header><span>治具作业台</span></template>
    <el-form inline :model="form">
      <el-form-item label="工单号">
        <el-input v-model="form.wo" placeholder="工单号/扫码录入"/>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="validateTool">验证治具</el-button>
      </el-form-item>
      <el-form-item label="治具条码">
        <el-input v-model="form.barcode" placeholder="扫码治具条码"/>
      </el-form-item>
      <el-form-item>
        <el-button type="success" @click="bindTool">绑定/领用</el-button>
        <el-button type="warning" @click="returnTool">归还</el-button>
      </el-form-item>
    </el-form>

    <el-alert v-if="result" :title="result" :type="resultType" style="margin:10px 0"/>
  </el-card>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
const form = ref({ wo:'', barcode:'' })
const result = ref('')
const resultType = ref('info')
const validateTool = () => {
  result.value = '治具与料号匹配 ✔️'
  resultType.value = 'success'
}
const bindTool = () => {
  ElMessage.success('已领用并绑定机台')
}
const returnTool = () => {
  ElMessage.success('归还成功，请放回库位')
}
</script>
