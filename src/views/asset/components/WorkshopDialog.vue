<template>
  <el-dialog v-model="visible" :title="data ? '编辑车间' : '新增车间'" width="600px">
    <el-form :model="form" label-width="100px">
      <el-form-item label="车间名称" required>
        <el-input v-model="form.name" />
      </el-form-item>
      <el-form-item label="生产区域" required>
        <el-input v-model="form.area" />
      </el-form-item>
      <el-form-item label="位置" required>
        <el-input v-model="form.location" />
      </el-form-item>
      <el-form-item label="负责人" required>
        <el-input v-model="form.manager" />
      </el-form-item>
      <el-form-item label="设备范围" required>
        <el-input v-model="form.equipmentRange" />
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
      name: '',
      area: '',
      location: '',
      manager: '',
      equipmentRange: ''
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
      } else {
        form.value = {
          id: null,
          name: '',
          area: '',
          location: '',
          manager: '',
          equipmentRange: ''
        }
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
