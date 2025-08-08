<template>
  <el-dialog v-model="visible" title="产品变更" width="400px">
    <el-form>
      <el-form-item label="新产品">
        <el-input v-model="product" placeholder="请输入新产品机种" />
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
const product = ref('')
const visible = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v)
})
watch(visible, (v) => {
  if (v) product.value = ''
})
const confirm = () => {
  if (!product.value) return
  emit('confirm', { product: product.value })
}
</script>
