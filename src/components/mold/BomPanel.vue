<template>
  <el-card>
    <template #header>模治具 BOM 设定</template>
    <el-form :model="form" label-width="100">
      <el-form-item label="产品料号">
        <el-input v-model="form.pn" />
      </el-form-item>
      <el-form-item label="工序">
        <el-input v-model="form.step" />
      </el-form-item>
      <el-form-item label="模具清单">
        <el-select v-model="form.molds" multiple filterable>
          <el-option v-for="m in moldList" :key="m" :label="m" :value="m" />
        </el-select>
      </el-form-item>
      <el-button type="primary" @click="saveBom">保存</el-button>
    </el-form>
  </el-card>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import { ElMessage } from 'element-plus'
const form = reactive({pn:'', step:'', molds:[]})
const moldList = ['M-001','M-002','M-003','M-004']
const saveBom = ()=>ElMessage.success('BOM 已保存')
</script>
