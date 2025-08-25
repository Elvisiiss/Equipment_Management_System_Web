<template>
  <div class="replenish-form">
    <div class="part-info" v-if="part">
      <h4>{{ part.name }}</h4>
      <div class="info-grid">
        <div class="info-item">
          <span class="label">分类:</span>
          <span class="value">{{ getCategoryName(part.category) }}</span>
        </div>
        <div class="info-item">
          <span class="label">当前库存:</span>
          <span class="value">{{ part.currentStock }}</span>
        </div>
        <div class="info-item">
          <span class="label">安全库存:</span>
          <span class="value">{{ part.safetyStock }}</span>
        </div>
        <div class="info-item">
          <span class="label">库存状态:</span>
          <span class="value" :class="part.currentStock <= part.safetyStock ? 'warning' : 'normal'">
            {{ part.currentStock <= part.safetyStock ? '需补货' : '正常' }}
          </span>
        </div>
      </div>
    </div>

    <el-divider />

    <el-form
        :model="formData"
        :rules="formRules"
        ref="formRef"
        label-width="120px"
        label-position="top"
    >
      <el-form-item label="补货数量" prop="quantity">
        <el-input-number
            v-model="formData.quantity"
            :min="1"
            :max="10000"
            controls-position="right"
            style="width: 100%"
        />
        <div class="form-tip">补货后库存: {{ (part ? part.currentStock : 0) + formData.quantity }}</div>
      </el-form-item>

      <el-form-item label="预计到货日期" prop="expectedDate">
        <el-date-picker
            v-model="formData.expectedDate"
            type="date"
            placeholder="选择日期"
            style="width: 100%"
            :disabled-date="disabledDate"
        />
      </el-form-item>

      <el-form-item label="备注" prop="notes">
        <el-input
            v-model="formData.notes"
            type="textarea"
            :rows="3"
            placeholder="请输入补货备注信息（可选）"
        />
      </el-form-item>

      <el-form-item>
        <div class="form-actions">
          <el-button @click="handleCancel">取消</el-button>
          <el-button type="primary" @click="handleSubmit">确认补货</el-button>
        </div>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import { ref, reactive, watch } from 'vue'
import { ElMessage } from 'element-plus'

export default {
  name: 'ReplenishForm',
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
      partId: '',
      quantity: 1,
      expectedDate: '',
      notes: ''
    })

    // 表单验证规则
    const formRules = {
      quantity: [
        { required: true, message: '请输入补货数量', trigger: 'blur' },
        {
          validator: (rule, value, callback) => {
            if (value < 1) {
              callback(new Error('补货数量必须大于0'))
            } else {
              callback()
            }
          },
          trigger: 'blur'
        }
      ],
      expectedDate: [
        { required: true, message: '请选择预计到货日期', trigger: 'change' }
      ]
    }

    // 监听传入的part数据变化
    watch(() => props.part, (newVal) => {
      if (newVal) {
        formData.partId = newVal.id
        // 默认设置为明天
        const tomorrow = new Date()
        tomorrow.setDate(tomorrow.getDate() + 1)
        formData.expectedDate = tomorrow
      } else {
        // 重置表单
        resetForm()
      }
    }, { immediate: true })

    // 禁用今天之前的日期
    const disabledDate = (time) => {
      return time.getTime() < Date.now() - 24 * 60 * 60 * 1000
    }

    // 获取分类名称
    const getCategoryName = (category) => {
      const names = {
        electronic: '电子元件',
        mechanical: '机械零件',
        consumable: '耗材'
      }
      return names[category] || '其他'
    }

    // 重置表单
    const resetForm = () => {
      Object.assign(formData, {
        partId: '',
        quantity: 1,
        expectedDate: '',
        notes: ''
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
          // 格式化日期
          const submitData = {
            ...formData,
            expectedDate: typeof formData.expectedDate === 'string'
                ? formData.expectedDate
                : formData.expectedDate.toISOString().split('T')[0]
          }

          // 发出提交事件
          emit('submit', submitData)
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
      getCategoryName,
      disabledDate,
      handleSubmit,
      handleCancel
    }
  }
}
</script>

<style scoped>
.replenish-form {
  padding: 0 10px;
}

.part-info {
  margin-bottom: 20px;
}

.part-info h4 {
  margin: 0 0 15px 0;
  color: #fff;
  font-size: 16px;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  padding: 8px 12px;
  background-color: rgba(30, 40, 60, 0.5);
  border-radius: 4px;
}

.info-item .label {
  color: #a0aec0;
}

.info-item .value {
  color: #fff;
  font-weight: 500;
}

.info-item .value.warning {
  color: #e6a23c;
}

.info-item .value.normal {
  color: #67c23a;
}

.form-tip {
  font-size: 12px;
  color: #a0aec0;
  margin-top: 6px;
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

:deep(.el-textarea__inner) {
  background-color: rgba(30, 40, 60, 0.7);
  border: 1px solid rgba(66, 134, 244, 0.3);
  color: #fff;
  resize: vertical;
}

:deep(.el-date-editor .el-input__inner) {
  background-color: rgba(30, 40, 60, 0.7);
  border: 1px solid rgba(66, 134, 244, 0.3);
  color: #fff;
}

:deep(.el-picker-panel) {
  background-color: rgba(30, 40, 60, 0.9);
  border: 1px solid rgba(66, 134, 244, 0.3);
}

:deep(.el-picker-panel__icon-btn),
:deep(.el-date-picker__header-label) {
  color: #fff;
}

:deep(.el-picker-panel__icon-btn:hover) {
  color: #409eff;
}

:deep(.el-date-table th) {
  color: #a0aec0;
  border-bottom: 1px solid rgba(66, 134, 244, 0.2);
}

:deep(.el-date-table td) {
  color: #fff;
}

:deep(.el-date-table td.available:hover) {
  color: #409eff;
}

:deep(.el-date-table td.current:not(.disabled)) {
  color: #409eff;
}

:deep(.el-date-table td.today) {
  color: #409eff;
  position: relative;
}

:deep(.el-date-table td.today:before) {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 24px;
  height: 24px;
  border: 1px solid #409eff;
  border-radius: 50%;
}
</style>
