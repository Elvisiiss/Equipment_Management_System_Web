<template>
  <div class="part-form">
    <el-form
        :model="formData"
        :rules="formRules"
        ref="formRef"
        label-width="120px"
        label-position="top"
    >
      <el-form-item label="备件名称" prop="name">
        <el-input v-model="formData.name" placeholder="请输入备件名称" />
      </el-form-item>

      <el-form-item label="分类" prop="category">
        <el-select v-model="formData.category" placeholder="请选择分类" style="width: 100%">
          <el-option label="电子元件" value="electronic" />
          <el-option label="机械零件" value="mechanical" />
          <el-option label="耗材" value="consumable" />
        </el-select>
      </el-form-item>

      <el-form-item label="当前库存" prop="currentStock">
        <el-input-number
            v-model="formData.currentStock"
            :min="0"
            :max="10000"
            controls-position="right"
            style="width: 100%"
        />
      </el-form-item>

      <el-form-item label="安全库存" prop="safetyStock">
        <el-input-number
            v-model="formData.safetyStock"
            :min="1"
            :max="1000"
            controls-position="right"
            style="width: 100%"
        />
      </el-form-item>

      <el-form-item label="存放仓库" prop="warehouse">
        <el-select v-model="formData.warehouse" placeholder="请选择仓库" style="width: 100%">
          <el-option label="主仓库" value="主仓库" />
          <el-option label="东区仓库" value="东区仓库" />
          <el-option label="西区仓库" value="西区仓库" />
          <el-option label="备用仓库" value="备用仓库" />
        </el-select>
      </el-form-item>

      <el-form-item label="单价 (元)" prop="price">
        <el-input-number
            v-model="formData.price"
            :min="0.01"
            :max="100000"
            :precision="2"
            controls-position="right"
            style="width: 100%"
        />
      </el-form-item>

      <el-form-item>
        <div class="form-actions">
          <el-button @click="handleCancel">取消</el-button>
          <el-button type="primary" @click="handleSubmit">提交</el-button>
        </div>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import { ref, reactive, watch, onMounted } from 'vue'
import { ElMessage } from 'element-plus'

export default {
  name: 'PartForm',
  props: {
    part: {
      type: Object,
      default: null
    }
  },
  emits: ['submit', 'cancel'],
  setup(props, { emit }) {
    const formRef = ref(null)
    const formData = reactive({
      id: '',
      name: '',
      category: '',
      currentStock: 0,
      safetyStock: 10,
      warehouse: '',
      price: 0.0
    })

    // 表单验证规则
    const formRules = {
      name: [
        { required: true, message: '请输入备件名称', trigger: 'blur' }
      ],
      category: [
        { required: true, message: '请选择分类', trigger: 'change' }
      ],
      currentStock: [
        { required: true, message: '请输入当前库存', trigger: 'blur' }
      ],
      safetyStock: [
        { required: true, message: '请输入安全库存', trigger: 'blur' }
      ],
      warehouse: [
        { required: true, message: '请选择存放仓库', trigger: 'change' }
      ],
      price: [
        { required: true, message: '请输入单价', trigger: 'blur' }
      ]
    }

    // 监听传入的part数据变化
    watch(() => props.part, (newVal) => {
      if (newVal) {
        Object.assign(formData, newVal)
      } else {
        // 重置表单
        resetForm()
      }
    }, { immediate: true })

    // 重置表单
    const resetForm = () => {
      Object.assign(formData, {
        id: '',
        name: '',
        category: '',
        currentStock: 0,
        safetyStock: 10,
        warehouse: '',
        price: 0.0
      })

      if (formRef.value) {
        formRef.value.resetFields()
      }
    }

    // 提交表单
    const handleSubmit = () => {
      if (!formRef.value) return

      formRef.value.validate((valid) => {
        if (valid) {
          // 验证当前库存是否小于安全库存
          if (formData.currentStock < formData.safetyStock) {
            ElMessage.warning('当前库存低于安全库存，请注意及时补货')
          }

          // 发出提交事件
          emit('submit', { ...formData })
        } else {
          ElMessage.error('请完善表单信息')
          return false
        }
      })
    }

    // 取消操作
    const handleCancel = () => {
      emit('cancel')
    }

    return {
      formRef,
      formData,
      formRules,
      handleSubmit,
      handleCancel
    }
  }
}
</script>

<style scoped>
.part-form {
  padding: 20px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  width: 100%;
}

:deep(.el-form-item__label) {
  color: #a0aec0;
  font-weight: 500;
}

:deep(.el-input__inner) {
  background-color: rgba(30, 40, 60, 0.7);
  border: 1px solid rgba(66, 134, 244, 0.3);
  color: #fff;
}

:deep(.el-input-number__decrease),
:deep(.el-input-number__increase) {
  background-color: rgba(66, 134, 244, 0.2);
  color: #fff;
  border: none;
}

:deep(.el-input-number__decrease:hover),
:deep(.el-input-number__increase:hover) {
  background-color: rgba(66, 134, 244, 0.4);
}

:deep(.el-select .el-input__inner) {
  background-color: rgba(30, 40, 60, 0.7);
  border: 1px solid rgba(66, 134, 244, 0.3);
  color: #fff;
}

:deep(.el-select-dropdown) {
  background-color: rgba(30, 40, 60, 0.9);
  border: 1px solid rgba(66, 134, 244, 0.3);
}

:deep(.el-select-dropdown__item) {
  color: #fff;
}

:deep(.el-select-dropdown__item.hover),
:deep(.el-select-dropdown__item:hover) {
  background-color: rgba(66, 134, 244, 0.3);
}

:deep(.el-select-dropdown__item.selected) {
  background-color: rgba(66, 134, 244, 0.5);
  color: #fff;
}
</style>
