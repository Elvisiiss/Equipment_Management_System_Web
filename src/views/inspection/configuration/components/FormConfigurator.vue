<template>
  <div class="form-configurator">
    <div class="config-area">
      <div class="toolbox">
        <h4>表单字段</h4>
        <div class="field-types">
          <el-button
            v-for="field in fieldTypes"
            :key="field.type"
            size="small"
            @click="addField(field)"
          >
            <el-icon><component :is="field.icon" /></el-icon>
            {{ field.label }}
          </el-button>
        </div>
      </div>

      <div class="form-preview">
        <h4>表单预览</h4>
        <el-form
          ref="previewForm"
          :model="previewData"
          label-width="100px"
          style="margin-top: 20px"
        >
          <draggable
            v-model="formFields"
            group="formFields"
            item-key="id"
            handle=".drag-handle"
            @end="onDragEnd"
          >
            <template #item="{element, index}">
              <div class="form-item-container">
                <div class="item-header">
                  <el-icon class="drag-handle"><Rank /></el-icon>
                  <span class="field-title">{{ element.label || `字段${index + 1}` }}</span>
                  <el-button
                    type="danger"
                    size="small"
                    text
                    @click="removeField(index)"
                  >
                    <el-icon><Delete /></el-icon>
                  </el-button>
                </div>

                <!-- 根据字段类型渲染不同表单控件 -->
                <el-form-item
                  :label="element.label || `字段${index + 1}`"
                  :prop="element.id"
                  :rules="getRules(element)"
                >
                  <template v-if="element.type === 'text'">
                    <el-input
                      v-model="previewData[element.id]"
                      :placeholder="element.placeholder || '请输入'"
                      :maxlength="element.maxLength"
                      show-word-limit
                    />
                  </template>

                  <template v-else-if="element.type === 'number'">
                    <el-input-number
                      v-model="previewData[element.id]"
                      :min="element.min"
                      :max="element.max"
                      :step="element.step"
                      :precision="element.precision"
                    />
                  </template>

                  <template v-else-if="element.type === 'select'">
                    <el-select
                      v-model="previewData[element.id]"
                      :placeholder="element.placeholder || '请选择'"
                      style="width: 100%"
                    >
                      <el-option
                        v-for="opt in element.options"
                        :key="opt.value"
                        :label="opt.label"
                        :value="opt.value"
                      />
                    </el-select>
                  </template>

                  <template v-else-if="element.type === 'switch'">
                    <el-switch v-model="previewData[element.id]" />
                  </template>

                  <template v-else-if="element.type === 'date'">
                    <el-date-picker
                      v-model="previewData[element.id]"
                      type="date"
                      :placeholder="element.placeholder || '选择日期'"
                      style="width: 100%"
                    />
                  </template>
                </el-form-item>

                <!-- 字段配置区域 -->
                <div class="field-config">
                  <el-form
                    :model="element"
                    label-width="80px"
                    size="small"
                  >
                    <el-form-item label="字段标签">
                      <el-input v-model="element.label" />
                    </el-form-item>
                    <el-form-item label="字段ID">
                      <el-input v-model="element.id" disabled />
                    </el-form-item>
                    <el-form-item label="是否必填">
                      <el-switch v-model="element.required" />
                    </el-form-item>

                    <!-- 根据字段类型显示不同配置项 -->
                    <template v-if="element.type === 'text'">
                      <el-form-item label="最大长度">
                        <el-input-number
                          v-model="element.maxLength"
                          :min="1"
                          :max="500"
                        />
                      </el-form-item>
                      <el-form-item label="占位文本">
                        <el-input v-model="element.placeholder" />
                      </el-form-item>
                    </template>

                    <template v-else-if="element.type === 'number'">
                      <el-form-item label="最小值">
                        <el-input-number v-model="element.min" />
                      </el-form-item>
                      <el-form-item label="最大值">
                        <el-input-number v-model="element.max" />
                      </el-form-item>
                      <el-form-item label="步长">
                        <el-input-number v-model="element.step" :min="0.1" />
                      </el-form-item>
                      <el-form-item label="小数位">
                        <el-input-number
                          v-model="element.precision"
                          :min="0"
                          :max="6"
                        />
                      </el-form-item>
                    </template>

                    <template v-else-if="element.type === 'select'">
                      <el-form-item label="选项配置">
                        <div
                          v-for="(opt, idx) in element.options"
                          :key="idx"
                          class="option-item"
                        >
                          <el-input
                            v-model="opt.label"
                            placeholder="选项标签"
                            style="width: 120px; margin-right: 10px"
                          />
                          <el-input
                            v-model="opt.value"
                            placeholder="选项值"
                            style="width: 120px; margin-right: 10px"
                          />
                          <el-button
                            type="danger"
                            size="small"
                            text
                            @click="removeOption(element, idx)"
                          >
                            <el-icon><Delete /></el-icon>
                          </el-button>
                        </div>
                        <el-button
                          type="primary"
                          size="small"
                          @click="addOption(element)"
                        >
                          添加选项
                        </el-button>
                      </el-form-item>
                    </template>
                  </el-form>
                </div>
              </div>
            </template>
          </draggable>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import draggable from 'vuedraggable'
import {
  Rank,
  Delete,
  Edit,
  Checked,
  Close,
  Plus,
  Minus
} from '@element-plus/icons-vue'

// 支持的字段类型
const fieldTypes = [
  {
    type: 'text',
    label: '文本',
    icon: 'Edit'
  },
  {
    type: 'number',
    label: '数字',
    icon: 'Checked'
  },
  {
    type: 'select',
    label: '选择',
    icon: 'Select'
  },
  {
    type: 'switch',
    label: '开关',
    icon: 'Switch'
  },
  {
    type: 'date',
    label: '日期',
    icon: 'Date'
  }
]

const props = defineProps({
  modelValue: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:modelValue'])

const formFields = ref([])
const previewData = ref({})
const previewForm = ref(null)

// 初始化表单字段
watch(
  () => props.modelValue,
  (val) => {
    formFields.value = [...val]
    initPreviewData()
  },
  { immediate: true }
)

// 同步字段变化到父组件
watch(
  formFields,
  (val) => {
    emit('update:modelValue', val)
  },
  { deep: true }
)

// 初始化预览数据
const initPreviewData = () => {
  previewData.value = {}
  formFields.value.forEach((field) => {
    previewData.value[field.id] = getDefaultValue(field.type)
  })
}

// 获取字段默认值
const getDefaultValue = (type) => {
  switch (type) {
    case 'text':
      return ''
    case 'number':
      return 0
    case 'select':
      return ''
    case 'switch':
      return false
    case 'date':
      return ''
    default:
      return ''
  }
}

// 获取字段验证规则
const getRules = (field) => {
  if (!field.required) return []
  return [
    {
      required: true,
      message: `${field.label || '该字段'}不能为空`,
      trigger: 'blur'
    }
  ]
}

// 添加字段
const addField = (fieldType) => {
  const field = {
    id: `field_${Date.now()}`,
    type: fieldType.type,
    label: '',
    required: false
  }

  // 根据字段类型添加特定属性
  switch (fieldType.type) {
    case 'text':
      field.maxLength = 50
      field.placeholder = '请输入'
      break
    case 'number':
      field.min = 0
      field.max = 100
      field.step = 1
      field.precision = 0
      break
    case 'select':
      field.options = [
        { label: '选项1', value: 'option1' },
        { label: '选项2', value: 'option2' }
      ]
      break
    case 'switch':
      break
    case 'date':
      break
  }

  formFields.value.push(field)
  previewData.value[field.id] = getDefaultValue(field.type)
}

// 删除字段
const removeField = (index) => {
  const fieldId = formFields.value[index].id
  formFields.value.splice(index, 1)
  delete previewData.value[fieldId]
}

// 添加选项
const addOption = (field) => {
  if (!field.options) field.options = []
  field.options.push({
    label: `选项${field.options.length + 1}`,
    value: `option${field.options.length + 1}`
  })
}

// 删除选项
const removeOption = (field, index) => {
  field.options.splice(index, 1)
}

// 拖拽结束
const onDragEnd = () => {
  // 可以在这里添加排序后的处理逻辑
}
</script>

<style scoped lang="scss">
.form-configurator {
  height: 100%;
  display: flex;
  flex-direction: column;

  .config-area {
    display: flex;
    height: 100%;
  }

  .toolbox {
    width: 200px;
    padding: 10px;
    border-right: 1px solid #eee;
    background-color: #f5f7fa;

    h4 {
      margin: 0 0 10px;
      font-size: 14px;
      color: #666;
    }

    .field-types {
      display: flex;
      flex-direction: column;
      gap: 8px;

      .el-button {
        justify-content: flex-start;
      }
    }
  }

  .form-preview {
    flex: 1;
    padding: 10px 20px;
    overflow-y: auto;

    h4 {
      margin: 0 0 10px;
      font-size: 14px;
      color: #666;
    }
  }

  .form-item-container {
    padding: 12px;
    margin-bottom: 16px;
    border: 1px solid #ebeef5;
    border-radius: 4px;
    background-color: #fafafa;
    transition: all 0.3s;

    &:hover {
      border-color: #c0c4cc;
      box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    }

    .item-header {
      display: flex;
      align-items: center;
      margin-bottom: 10px;
      padding-bottom: 8px;
      border-bottom: 1px dashed #dcdfe6;

      .drag-handle {
        margin-right: 8px;
        cursor: move;
        color: #909399;
      }

      .field-title {
        flex: 1;
        font-size: 14px;
        font-weight: 500;
      }
    }

    .field-config {
      margin-top: 10px;
      padding: 10px;
      background-color: #f5f7fa;
      border-radius: 4px;

      .option-item {
        display: flex;
        align-items: center;
        margin-bottom: 8px;
      }
    }
  }
}
</style>
