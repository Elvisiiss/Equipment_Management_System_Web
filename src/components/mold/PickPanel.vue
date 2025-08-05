<template>
  <el-card>
    <template #header>模具领用作业</template>
    <el-steps :active="step" finish-status="success">
      <el-step title="刷员工卡" />
      <el-step title="扫工单" />
      <el-step title="扫模具/库位" />
      <el-step title="绑定机台" />
    </el-steps>
    <el-button @click="step++" v-if="step<4">下一步（演示）</el-button>
  </el-card>
</template>

<script setup lang="ts">
import { ref } from 'vue'
const step = ref(0)
</script>
