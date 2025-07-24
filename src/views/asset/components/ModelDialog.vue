<template>
  <el-dialog v-model="visible" :title="data ? '编辑型号' : '新增型号'" width="600px">
    <el-form :model="form" label-width="100px">
      <el-form-item label="型号代码" required>
        <el-input v-model="form.code" />
      </el-form-item>
      <el-form-item label="型号名称" required>
        <el-input v-model="form.name" />
      </el-form-item>
      <el-form-item label="所属厂商" required>
        <el-input v-model="form.manufacturer" />
      </el-form-item>
      <el-form-item label="技术参数" required>
        <el-input v-model="form.parameters" type="textarea" />
      </el-form-item>
      <el-form-item label="适配场景" required>
        <el-input v-model="form.scenario" type="textarea" />
      </el-form-item>
      <el-form-item label="支持文档">
        <el-upload
            v-model:file-list="form.documents"
            action="#"
            multiple
            :auto-upload="false"
        >
          <el-button type="primary">点击上传</el-button>
        </el-upload>
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
      manufacturer: '',
      parameters: '',
      scenario: '',
      documents: []
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
          manufacturer: '',
          parameters: '',
          scenario: '',
          documents: []
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
