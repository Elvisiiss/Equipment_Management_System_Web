<template>
  <el-card>
    <template #header>生产验证</template>
    <el-alert v-if="!pass" title="模具不匹配，已锁定机台！" type="error" show-icon />
    <el-alert v-else title="验证通过，可开始生产" type="success" show-icon />
    <el-button @click="pass=!pass">模拟切换结果</el-button>
  </el-card>
</template>

<script setup lang="ts">
import { ref } from 'vue'
const pass = ref(false)
</script>
