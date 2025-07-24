<template>
  <el-dialog v-model="visible" title="联机设备设置" width="600px">
    <el-form :model="form" label-width="120px">
      <el-form-item label="设备编号">
        <el-input v-model="form.code" disabled />
      </el-form-item>
      <el-form-item label="设备名称">
        <el-input v-model="form.name" disabled />
      </el-form-item>
      <el-form-item label="IP地址" required>
        <el-input v-model="form.ip" />
      </el-form-item>
      <el-form-item label="在线状态">
        <el-switch v-model="form.online" active-text="在线" inactive-text="离线" />
      </el-form-item>
      <el-form-item label="工作节拍(ms)" required>
        <el-input-number v-model="form.beat" :min="100" :max="5000" />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" @click="handleSubmit">确定</el-button>
    </template>
  </el-dialog>
</template>

<script>
import { ref, watch } from 'vue'

export default {
  props: {
    modelValue: Boolean,
    data: Object
  },

  emits: ['update:modelValue', 'submit'],

  setup(props, { emit }) {
    const visible = ref(false)
    const form = ref({
      id: null,
      code: '',
      name: '',
      ip: '',
      online: true,
      beat: 500
    })

    watch(() => props.modelValue, (val) => {
      visible.value = val
    })

    watch(visible, (val) => {
      emit('update:modelValue', val)
    })

    watch(() => props.data, (val) => {
      if (val) {
        form.value = { ...val }
      }
    }, { immediate: true })

    const handleSubmit = () => {
      emit('submit', form.value)
      visible.value = false
    }

    return {
      visible,
      form,
      handleSubmit
    }
  }
}
</script>
