<template>
  <el-dialog v-model="visible" title="手动切换状态" width="400px">
    <el-form>
      <el-form-item label="新状态">
        <el-select v-model="status">
          <el-option
              v-for="s in allow"
              :key="s"
              :label="s"
              :value="s"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="原因">
        <el-input v-model="reason" />
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
const props = defineProps({
  modelValue: Boolean,
  device: Object,
  rules: Object
})
const emit = defineEmits(['update:modelValue', 'confirm'])
const status = ref('')
const reason = ref('')
const visible = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v)
})
const allow = computed(() => props.rules[props.device?.status] || [])
watch(visible, (v) => {
  if (v) {
    status.value = ''
    reason.value = ''
  }
})
const confirm = () => {
  if (!status.value) return
  emit('confirm', { status: status.value, reason: reason.value })
}
</script>
