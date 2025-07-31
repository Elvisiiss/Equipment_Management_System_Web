<template>
  <div class="page">
    <!-- 顶部工具栏 -->
    <div class="toolbar">
      <span class="title">点检配置列表</span>
      <el-button type="primary" @click="openAdd">新建点检配置</el-button>
    </div>

    <!-- 筛选区 -->
    <div class="filter-bar">
      <el-select v-model="filterWorkshop" clearable placeholder="车间" style="width: 150px; margin-right: 8px">
        <el-option v-for="w in workshopOptions" :key="w" :label="w" :value="w" />
      </el-select>
      <el-select v-model="filterLine" clearable placeholder="产线" style="width: 150px; margin-right: 8px">
        <el-option v-for="l in lineOptions" :key="l" :label="l" :value="l" />
      </el-select>
      <el-select v-model="filterDevice" clearable placeholder="设备" style="width: 150px">
        <el-option v-for="d in deviceOptions" :key="d" :label="d" :value="d" />
      </el-select>
    </div>

    <!-- 列表 -->
    <el-table :data="filteredTableData" style="width: 100%" stripe>
      <el-table-column prop="workshop" label="车间" />
      <el-table-column prop="line" label="产线" />
      <el-table-column prop="device" label="设备" />
      <el-table-column prop="project" label="点检项目" />
      <el-table-column prop="type" label="点检类型" />
      <el-table-column label="点检人员">
        <template #default="{ row }">{{ row.persons.join('、') }}</template>
      </el-table-column>
      <el-table-column prop="remindFreq" label="提醒频率" />
      <el-table-column prop="remindClock" label="提醒时刻" />
      <el-table-column label="操作" width="160">
        <template #default="{ $index }">
          <el-button size="small" @click="openEdit($index)">编辑</el-button>
          <el-button size="small" type="danger" @click="remove($index)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 新建 / 编辑弹窗 -->
    <el-dialog
        v-model="dialogVisible"
        :title="isEdit ? '编辑点检配置' : '新建点检配置'"
        width="480px"
        @close="resetForm"
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="车间" prop="workshop">
          <el-select v-model="form.workshop" clearable placeholder="请选择">
            <el-option v-for="w in workshopOptions" :key="w" :label="w" :value="w" />
          </el-select>
        </el-form-item>

        <el-form-item label="产线" prop="line">
          <el-select v-model="form.line" clearable placeholder="请选择">
            <el-option v-for="l in lineOptions" :key="l" :label="l" :value="l" />
          </el-select>
        </el-form-item>

        <el-form-item label="设备" prop="device">
          <el-select v-model="form.device" clearable placeholder="请选择">
            <el-option v-for="d in deviceOptions" :key="d" :label="d" :value="d" />
          </el-select>
        </el-form-item>

        <el-form-item label="点检类型" prop="type">
          <el-select v-model="form.type" clearable placeholder="请选择">
            <el-option v-for="item in typeOptions" :key="item" :label="item" :value="item" />
          </el-select>
        </el-form-item>

        <el-form-item label="点检人员" prop="persons">
          <el-select v-model="form.persons" multiple clearable placeholder="请选择">
            <el-option v-for="item in personOptions" :key="item" :label="item" :value="item" />
          </el-select>
        </el-form-item>

        <el-form-item label="点检内容" prop="content">
          <el-input v-model="form.content" type="textarea" :rows="3" placeholder="请输入点检内容" />
        </el-form-item>

        <!-- 提醒频率 -->
        <el-form-item label="提醒频率" prop="remindFreq">
          <el-select v-model="form.remindFreq" clearable placeholder="请选择">
            <el-option
                v-for="item in remindFreqOptions"
                :key="item"
                :label="item"
                :value="item"
            />
          </el-select>
        </el-form-item>

        <!-- 提醒时刻（几点几分） -->
        <el-form-item label="提醒时刻" prop="remindClock">
          <el-time-picker
              v-model="form.remindClock"
              format="HH:mm"
              value-format="HH:mm"
              placeholder="选择时间"
              style="width: 100%"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <div style="text-align: right">
          <el-button @click="handleCancel">取 消</el-button>
          <el-button type="primary" @click="submit">确 定</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { ElMessage } from 'element-plus'

const formRef = ref()

const rules = reactive({
  workshop: [{ required: true, message: '请选择车间', trigger: 'change' }],
  line:     [{ required: true, message: '请选择产线', trigger: 'change' }],
  device:   [{ required: true, message: '请选择设备', trigger: 'change' }],
  type:     [{ required: true, message: '请选择点检类型', trigger: 'change' }],
  persons:  [{ type: 'array', required: true, message: '请选择点检人员', trigger: 'change' }],
  remindFreq: [{ required: true, message: '请选择提醒频率', trigger: 'change' }],
  remindClock: [{ required: true, message: '请选择提醒时刻', trigger: 'change' }]
})

/* ---------------- 列表数据 ---------------- */
const tableData = ref([
  {
    workshop: '一车间',
    line: 'A产线',
    device: '设备A',
    project: '设备A主轴',
    type: '日点检',
    persons: ['张三'],
    remindFreq: '每日提醒',
    remindClock: '08:00',
    nextTime: '2025-08-01 08:00'
  },
  {
    workshop: '二车间',
    line: 'B产线',
    device: '设备B',
    project: '设备B液压',
    type: '周点检',
    persons: ['李四', '王五'],
    remindFreq: '每周提醒',
    remindClock: '09:00',
    nextTime: '2025-08-04 09:00'
  }
])

/* ---------------- 筛选 ---------------- */
const filterWorkshop = ref('')
const filterLine = ref('')
const filterDevice = ref('')

const workshopOptions = ['一车间', '二车间', '三车间']
const lineOptions = ['A产线', 'B产线', 'C产线']
const deviceOptions = ['设备A', '设备B', '设备C', '设备D']

const filteredTableData = computed(() =>
    tableData.value.filter(r =>
        (!filterWorkshop.value || r.workshop === filterWorkshop.value) &&
        (!filterLine.value || r.line === filterLine.value) &&
        (!filterDevice.value || r.device === filterDevice.value)
    )
)

/* ---------------- 弹窗 ---------------- */
const dialogVisible = ref(false)
const isEdit = ref(false)
let editIndex = -1

const form = reactive({
  workshop: '',
  line: '',
  device: '',
  project: '',
  type: '',
  persons: [],
  content: '',
  remindFreq: '',
  remindClock: ''
})

const typeOptions      = ['日点检', '周点检', '月点检']
const personOptions    = ['张三', '李四', '王五', '赵六']
const remindFreqOptions = ['每日提醒', '每周提醒', '每月提醒', '每季度提醒']

function openAdd() {
  isEdit.value = false
  resetForm()
  dialogVisible.value = true
}

function openEdit(index) {
  isEdit.value = true
  editIndex = index
  const row = tableData.value[index]
  Object.assign(form, row)
  form.persons = [...row.persons]
  dialogVisible.value = true
}

function submit() {
  formRef.value.validate(valid => {
    if (!valid) return

    // 计算下一次提醒时间
    const next = nextTimeFromFreqAndClock(form.remindFreq, form.remindClock)

    const rowData = {
      workshop: form.workshop,
      line: form.line,
      device: form.device,
      project: form.device,
      type: form.type,
      persons: [...form.persons],
      content: form.content,
      remindFreq: form.remindFreq,
      remindClock: form.remindClock,
      nextTime: next
    }

    if (isEdit.value) {
      tableData.value.splice(editIndex, 1, rowData)
      ElMessage.success('修改成功！')
    } else {
      tableData.value.unshift(rowData)
      ElMessage.success('新建成功！')
    }
    dialogVisible.value = false
  })
}

function remove(index) {
  tableData.value.splice(index, 1)
  ElMessage.success('已删除')
}

function resetForm() {
  Object.keys(form).forEach(k => (form[k] = ''))
  form.persons = []
}

function handleCancel() {
  formRef.value.resetFields()
  dialogVisible.value = false
}

/**
 * 根据「提醒频率 + 提醒时刻」生成下一次提醒时间
 * @param freq  每日/每周/每月/每季度
 * @param clock 08:00 等 HH:mm
 */
function nextTimeFromFreqAndClock(freq, clock) {
  const [h, m] = clock.split(':').map(Number)
  const now = new Date()
  const dt = new Date(now)
  dt.setHours(h, m, 0, 0)

  switch (freq) {
    case '每日提醒':
      dt.setDate(dt.getDate() + (dt <= now ? 1 : 0))
      break
    case '每周提醒':
      dt.setDate(dt.getDate() + 7 * (dt <= now ? 1 : 0))
      break
    case '每月提醒':
      dt.setMonth(dt.getMonth() + (dt <= now ? 1 : 0))
      break
    case '每季度提醒':
      dt.setMonth(dt.getMonth() + 3 * (dt <= now ? 1 : 0))
      break
  }
  return dt.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>

<style scoped>
.page {
  padding: 16px;
}
.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}
.title {
  font-size: 18px;
  font-weight: 600;
}
.filter-bar {
  margin-bottom: 12px;
}
</style>
