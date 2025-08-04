<template>
  <Layout title="设备转固">
    <el-form :model="form" label-width="120px">
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="资产编码">
            <el-input v-model="form.assetCode" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="资产名称">
            <el-input v-model="form.assetName" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="使用部门">
            <el-select v-model="form.dept" placeholder="请选择" style="width:100%">
              <el-option label="生产一部" value="P1" />
              <el-option label="生产二部" value="P2" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="存放地点">
            <el-input v-model="form.location" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="启用日期">
            <el-date-picker v-model="form.startDate" style="width:100%" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="原值(元)">
            <el-input-number v-model="form.cost" :precision="2" />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <footer>
      <el-button type="primary" @click="submit">确认转固</el-button>
    </footer>
  </Layout>
</template>

<script setup>
import { reactive } from 'vue'
import Layout from './Layout.vue'
import { ElMessage } from 'element-plus'

const form = reactive({
  assetCode: 'FA' + Date.now(),
  assetName: '',
  dept: '',
  location: '',
  startDate: '',
  cost: 0
})

const submit = () => ElMessage.success('已转固！')
</script>
