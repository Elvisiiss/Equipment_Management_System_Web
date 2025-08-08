<template>
  <el-dialog v-model="visible" title="转机登记" width="400px">
    <el-form>
      <el-form-item label="原产品">
        <el-input :model-value="device?.product || '空'" disabled />
      </el-form-item>
      <el-form-item label="新产品">
        <el-input v-model="to" placeholder="请输入新产品机种" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" @click="confirm">确定</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
const props = defineProps({ modelValue: Boolean, device: Object })
const emit = defineEmits(['update:modelValue', 'confirm'])
const to = ref('')
const visible = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v)
})
watch(visible, (v) => {
  if (v) to.value = ''
})
const confirm = () => {
  if (!to.value) return
  emit('confirm', { from: props.device?.product || '空', to: to.value })
}
</script>
