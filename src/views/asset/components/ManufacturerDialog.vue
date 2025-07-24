<template>
  <el-dialog v-model="visible" :title="data ? '编辑厂商' : '新增厂商'" width="600px">
    <el-form :model="form" label-width="100px">
      <el-form-item label="厂商名称" required>
        <el-input v-model="form.name" />
      </el-form-item>
      <el-form-item label="联系人" required>
        <el-input v-model="form.contact" />
      </el-form-item>
      <el-form-item label="联系电话" required>
        <el-input v-model="form.phone" />
      </el-form-item>
      <el-form-item label="电子邮箱" required>
        <el-input v-model="form.email" />
      </el-form-item>
      <el-form-item label="地址" required>
        <el-input v-model="form.address" type="textarea" />
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
      contact: '',
      phone: '',
      email: '',
      address: ''
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
          contact: '',
          phone: '',
          email: '',
          address: ''
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
