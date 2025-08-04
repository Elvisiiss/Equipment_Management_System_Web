<template>
  <Layout title="设备请购">
    <el-form ref="formRef" :model="form" label-width="110px">
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="请购单号" required>
            <el-input v-model="form.code" placeholder="系统自动生成" disabled />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="请购人">
            <el-input v-model="form.requester" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="设备名称" required>
            <el-input v-model="form.name" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="规格型号">
            <el-input v-model="form.model" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="数量" required>
            <el-input-number v-model="form.qty" :min="1" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="预算(元)">
            <el-input-number v-model="form.budget" :precision="2" :step="100" />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="请购原因">
            <el-input v-model="form.reason" type="textarea" :rows="3" />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <footer>
      <el-button type="primary" @click="submit">提交请购</el-button>
      <el-button @click="$router.back()">取消</el-button>
    </footer>
  </Layout>
</template>

<script setup>
import { reactive } from 'vue'
import Layout from './Layout.vue'
import { ElMessage } from 'element-plus'

const form = reactive({
  code: 'CG' + Date.now(),
  requester: '',
  name: '',
  model: '',
  qty: 1,
  budget: 0,
  reason: ''
})

const submit = () => ElMessage.success('已提交请购单！')
</script>
