<template>
  <Layout title="基础资料录入">
    <el-tabs v-model="activeTab">
      <el-tab-pane label="资产转移" name="transfer">
        <el-form :model="transferForm" label-width="100px">
          <el-form-item label="转移资产">
            <el-input v-model="transferForm.asset" />
          </el-form-item>
          <el-form-item label="目标部门">
            <el-select v-model="transferForm.toDept">
              <el-option label="生产一部" value="P1" />
              <el-option label="生产二部" value="P2" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary">提交转移</el-button>
          </el-form-item>
        </el-form>
      </el-tab-pane>

      <el-tab-pane label="资产借用" name="borrow"> <!-- 省略 --> </el-tab-pane>
      <el-tab-pane label="资产盘点" name="check"> <!-- 省略 --> </el-tab-pane>
      <el-tab-pane label="维修记录" name="repair"> <!-- 省略 --> </el-tab-pane>
      <el-tab-pane label="巡检记录" name="inspect"> <!-- 省略 --> </el-tab-pane>
      <el-tab-pane label="保养记录" name="maintain"> <!-- 省略 --> </el-tab-pane>
    </el-tabs>
  </Layout>
</template>

<script setup>
import { ref, reactive } from 'vue'
import Layout from './Layout.vue'

const activeTab = ref('transfer')
const transferForm = reactive({ asset: '', toDept: '' })
</script>
