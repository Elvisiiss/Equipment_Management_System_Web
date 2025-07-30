<template>
  <el-dialog
      v-model="visible"
      :title="isEdit ? '编辑库位' : '新建库位'"
      width="500px"
      @close="handleClose"
  >
    <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
      <el-form-item label="库位编码" prop="code">
        <el-input v-model="form.code" placeholder="例：A-01-001" />
      </el-form-item>
      <el-form-item label="库位名称" prop="name">
        <el-input v-model="form.name" />
      </el-form-item>
      <el-form-item label="库位类型" prop="type">
        <el-select v-model="form.type" style="width: 100%">
          <el-option label="立体库" value="STEREO" />
          <el-option label="平面库" value="FLAT" />
          <el-option label="线边库" value="EDGE" />
        </el-select>
      </el-form-item>
      <el-form-item label="区域" prop="area">
        <el-select v-model="form.area" style="width: 100%">
          <el-option label="A区" value="A" />
          <el-option label="B区" value="B" />
          <el-option label="C区" value="C" />
        </el-select>
      </el-form-item>
      <el-form-item label="容量" prop="capacity">
        <el-input-number v-model="form.capacity" :min="1" style="width: 100%" />
      </el-form-item>
      <el-form-item label="备注" prop="remark">
        <el-input v-model="form.remark" type="textarea" :rows="3" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" @click="handleSubmit">确定</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import locationAPI from '@/api/location'
import { ElMessage } from 'element-plus'

const props = defineProps({
  modelValue: Boolean,
  data: { type: Object, default: null }
})

const emit = defineEmits(['update:modelValue', 'success'])

const formRef = ref()
const form = ref({
  code: '',
  name: '',
  type: 'FLAT',
  area: 'A',
  capacity: 100,
  remark: ''
})

const rules = {
  code: [{ required: true, message: '请输入库位编码', trigger: 'blur' }],
  name: [{ required: true, message: '请输入库位名称', trigger: 'blur' }],
  type: [{ required: true, message: '请选择库位类型', trigger: 'change' }],
  area: [{ required: true, message: '请选择区域', trigger: 'change' }]
}

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const isEdit = computed(() => !!props.data)

watch(() => props.data, (newData) => {
  if (newData) {
    form.value = { ...newData }
  } else {
    form.value = {
      code: '',
      name: '',
      type: 'FLAT',
      area: 'A',
      capacity: 100,
      remark: ''
    }
  }
}, { immediate: true })

const handleSubmit = async () => {
  await formRef.value.validate()
  try {
    if (isEdit.value) {
      await locationAPI.updateLocation(props.data.id, form.value)
      ElMessage.success('更新成功')
    } else {
      await locationAPI.createLocation(form.value)
      ElMessage.success('创建成功')
    }
    visible.value = false
    emit('success')
  } catch (error) {
    ElMessage.error('操作失败')
  }
}

const handleClose = () => {
  formRef.value?.resetFields()
}
</script>
