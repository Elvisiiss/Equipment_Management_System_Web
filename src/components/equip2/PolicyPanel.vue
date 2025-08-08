<template>
  <div>
    <div v-for="p in policies" :key="p.id" style="margin-bottom: 12px">
      <el-row :gutter="8">
        <el-col :span="12">{{ p.name }}</el-col>
        <el-col :span="12">
          <el-select v-if="typeof p.value === 'string'" v-model="p.value">
            <el-option label="运行中" value="运行中" />
            <el-option label="闲置" value="闲置" />
            <el-option label="无排程" value="无排程" />
            <el-option label="保养" value="保养" />
          </el-select>
          <el-switch v-else v-model="p.value" />
        </el-col>
      </el-row>
    </div>
    <el-button type="primary" @click="$emit('save', policies)">保存</el-button>
  </div>
</template>

<script setup>
import { toRef } from 'vue'
const props = defineProps({ policies: Array })
const policies = toRef(props, 'policies')
</script>
