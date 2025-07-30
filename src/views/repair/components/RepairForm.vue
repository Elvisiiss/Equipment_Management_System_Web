<template>
  <div class="repair-form">
    <el-form :model="formData" :rules="rules" ref="formRef" label-width="100px">
      <el-form-item label="设备" prop="deviceCode">
        <el-select v-model="formData.deviceCode" placeholder="请选择设备">
          <el-option label="贴片机#1" value="SMT-001" />
          <el-option label="回流焊#2" value="REFLOW-002" />
        </el-select>
      </el-form-item>

      <el-form-item label="故障描述" prop="faultDesc">
        <el-input
            v-model="formData.faultDesc"
            type="textarea"
            :rows="3"
            placeholder="请描述故障现象"
        />
      </el-form-item>

      <el-form-item label="优先级" prop="priority">
        <el-select v-model="formData.priority">
          <el-option label="低" value="低" />
          <el-option label="中" value="中" />
          <el-option label="高" value="高" />
          <el-option label="紧急" value="紧急" />
        </el-select>
      </el-form-item>

      <el-form-item label="故障图片">
        <el-upload
            action="#"
            list-type="picture-card"
            :auto-upload="false"
            :on-change="handleImageChange"
        >
          <el-icon><Plus /></el-icon>
        </el-upload>
      </el-form-item>

      <el-form-item label="备件需求">
        <el-button type="primary" size="small" @click="showPartsDialog = true">
          选择备件
        </el-button>
        <div v-if="formData.parts.length > 0" class="parts-list">
          <div v-for="(part, index) in formData.parts" :key="index" class="part-item">
            <span>{{ part.name }} x {{ part.quantity }}</span>
            <el-icon @click="removePart(index)"><Delete /></el-icon>
          </div>
        </div>
      </el-form-item>
    </el-form>

    <!-- 备件选择对话框 -->
    <el-dialog v-model="showPartsDialog" title="选择备件" width="500px">
      <el-form>
        <el-form-item label="备件">
          <el-select v-model="selectedPart.name" placeholder="请选择">
            <el-option label="电机" value="电机" />
            <el-option label="传感器" value="传感器" />
            <el-option label="轴承" value="轴承" />
          </el-select>
        </el-form-item>
        <el-form-item label="数量">
          <el-input-number v-model="selectedPart.quantity" :min="1" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showPartsDialog = false">取消</el-button>
        <el-button type="primary" @click="addPart">添加</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, watch } from 'vue'
import { Plus, Delete } from '@element-plus/icons-vue'

const props = defineProps({
  data: {
    type: Object,
    default: () => ({})
  },
  isEdit: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['submit', 'cancel'])

const formRef = ref()
const showPartsDialog = ref(false)
const selectedPart = reactive({ name: '', quantity: 1 })

const formData = reactive({
  deviceCode: '',
  faultDesc: '',
  priority: '中',
  faultImages: [],
  parts: []
})

const rules = {
  deviceCode: [{ required: true, message: '请选择设备', trigger: 'change' }],
  faultDesc: [{ required: true, message: '请输入故障描述', trigger: 'blur' }],
  priority: [{ required: true, message: '请选择优先级', trigger: 'change' }]
}

watch(() => props.data, (newVal) => {
  if (newVal && Object.keys(newVal).length > 0) {
    Object.assign(formData, newVal)
  }
}, { immediate: true })

const handleImageChange = (file) => {
  formData.faultImages.push(file)
}

const addPart = () => {
  if (selectedPart.name) {
    formData.parts.push({ ...selectedPart })
    selectedPart.name = ''
    selectedPart.quantity = 1
    showPartsDialog.value = false
  }
}

const removePart = (index) => {
  formData.parts.splice(index, 1)
}

const submit = async () => {
  await formRef.value.validate()
  emit('submit', formData)
}

defineExpose({ submit })
</script>

<style scoped>
.repair-form {
  padding: 20px;
}

.parts-list {
  margin-top: 10px;
}

.part-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 5px 10px;
  background: #f5f7fa;
  border-radius: 4px;
  margin-bottom: 5px;
}

.part-item .el-icon {
  cursor: pointer;
  color: #f56c6c;
}
</style>
