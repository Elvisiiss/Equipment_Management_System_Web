<template>
  <div>
    <h3>5. 模具报废</h3>
    <el-card shadow="never">
      <el-form :model="scrapForm" label-width="100px">
        <el-form-item label="模具名称">
          <el-select v-model="scrapForm.moldName" placeholder="请选择模具" style="width: 100%">
            <el-option
                v-for="item in moldOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="报废原因">
          <el-select v-model="scrapForm.reason" placeholder="请选择报废原因" style="width: 100%">
            <el-option label="寿命到期" value="life" />
            <el-option label="严重损坏" value="damage" />
            <el-option label="技术淘汰" value="obsolete" />
          </el-select>
        </el-form-item>
        <el-form-item label="报废说明">
          <el-input
              v-model="scrapForm.note"
              type="textarea"
              :rows="3"
              placeholder="请输入报废说明" />
        </el-form-item>
        <el-form-item>
          <el-button @click="$emit('prev')">上一步</el-button>
          <el-button type="danger" @click="handleSubmit">确认报废</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const emit = defineEmits(['prev', 'submit'])

const scrapForm = reactive({
  moldName: '',
  reason: '',
  note: ''
})

const moldOptions = ref([
  { value: 'CX2030', label: 'CX2030' },
  { value: 'CX2031', label: 'CX2031' },
  { value: 'CX2032', label: 'CX2032' }
])

const handleSubmit = () => {
  if (!scrapForm.moldName) {
    ElMessage.warning('请选择模具')
    return
  }
  if (!scrapForm.reason) {
    ElMessage.warning('请选择报废原因')
    return
  }

  ElMessageBox.confirm('确定要报废该模具吗?', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    ElMessage.success('模具已报废')
    emit('submit')
    // 重置表单
    scrapForm.moldName = ''
    scrapForm.reason = ''
    scrapForm.note = ''
  }).catch(() => {
    ElMessage.info('已取消报废')
  })
}
</script>
