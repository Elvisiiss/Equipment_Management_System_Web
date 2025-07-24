<template>
  <el-dialog v-model="visible" :title="data ? '编辑设备' : '新增设备'" width="600px">
    <el-form :model="form" label-width="100px">
      <el-form-item label="设备编号" required>
        <el-input v-model="form.code" />
      </el-form-item>
      <el-form-item label="设备名称" required>
        <el-input v-model="form.name" />
      </el-form-item>
      <el-form-item label="设备型号" required>
        <el-select v-model="form.model" placeholder="请选择型号">
          <el-option
              v-for="item in models"
              :key="item.value"
              :label="item.label"
              :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="所属车间" required>
        <el-select v-model="form.workshop" placeholder="请选择车间">
          <el-option
              v-for="item in workshops"
              :key="item.value"
              :label="item.label"
              :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="基础状态" required>
        <el-select v-model="form.status" placeholder="请选择状态">
          <el-option label="正常" value="正常" />
          <el-option label="维修中" value="维修中" />
          <el-option label="待检" value="待检" />
        </el-select>
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
    data: Object,
    workshops: Array,
    models: Array
  },

  emits: ['update:modelValue', 'submit'],

  setup(props, { emit }) {
    const visible = ref(false)
    const form = ref({
      id: null,
      code: '',
      name: '',
      model: '',
      workshop: '',
      status: '正常'
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
          code: '',
          name: '',
          model: '',
          workshop: '',
          status: '正常'
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
