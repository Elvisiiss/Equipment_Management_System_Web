<template>
  <el-dialog v-model="visible" title="设备报警" width="400px">
    <p>{{ alarm.msg }}</p>
    <template #footer>
      <el-button @click="ignore">忽略</el-button>
      <el-button type="primary" @click="ignore">处理</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { computed } from 'vue'
const props = defineProps({
  modelValue: Boolean,
  alarm: Object
})
const emit = defineEmits(['update:modelValue', 'ignore'])
const visible = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v)
})
const ignore = () => emit('ignore')
</script>
