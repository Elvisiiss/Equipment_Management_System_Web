<template>
  <Layout title="设备报废">
    <el-form :model="form" label-width="110px">
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="资产编码">
            <el-input v-model="form.code" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="资产名称">
            <el-input v-model="form.name" disabled />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="报废原因" required>
            <el-input v-model="form.reason" type="textarea" :rows="3" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="申请人">
            <el-input v-model="form.applicant" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="申请日期">
            <el-date-picker v-model="form.applyDate" style="width:100%" />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <footer>
      <el-button type="danger" @click="submit">提交报废申请</el-button>
    </footer>
  </Layout>
</template>

<script setup>
import { reactive } from 'vue'
import Layout from './Layout.vue'
import { ElMessage } from 'element-plus'

const form = reactive({
  code: '',
  name: '自动带出',
  reason: '',
  applicant: '',
  applyDate: new Date()
})

const submit = () => ElMessage.success('报废申请已提交！')
</script>
