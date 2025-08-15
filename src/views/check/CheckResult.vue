<template>
  <div class="approval-config">
    <el-button type="primary" @click="openDialog()">新增流程</el-button>

    <!-- 流程列表 -->
    <el-table :data="tableData" style="width: 100%; margin-top: 16px">
      <el-table-column prop="taskId" label="任务 ID" width="100" />
      <el-table-column prop="taskName" label="任务名称" />
      <el-table-column prop="taskType" label="任务类别" width="120" />
      <el-table-column label="审批人">
        <template #default="scope">
          {{ scope.row.approvers.map(u => u.label).join('、') }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="180">
        <template #default="scope">
          <el-button size="small" @click="openDialog(scope.row)">编辑</el-button>
          <el-popconfirm title="确定删除吗？" @confirm="handleDelete(scope.row.taskId)">
            <template #reference>
              <el-button size="small" type="danger">删除</el-button>
            </template>
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>

    <!-- 新增 / 编辑弹窗 -->
    <el-dialog
        v-model="dialogVisible"
        :title="isEdit ? '编辑流程' : '新增流程'"
        width="400"
        @close="resetForm"
    >
      <el-form ref="formRef" :model="form" label-width="100">
        <el-form-item
            label="任务名称"
            prop="taskName"
            :rules="[{ required: true, message: '请输入任务名称', trigger: 'blur' }]"
        >
          <el-input v-model="form.taskName" placeholder="请输入任务名称" />
        </el-form-item>

        <el-form-item
            label="任务类别"
            prop="taskType"
            :rules="[{ required: true, message: '请选择任务类别', trigger: 'change' }]"
        >
          <el-select v-model="form.taskType" placeholder="请选择任务类别">
            <el-option label="闲置" value="闲置" />
            <el-option label="报废" value="报废" />
            <el-option label="转移" value="转移" />
            <el-option label="验证" value="验证" />
          </el-select>
        </el-form-item>

        <el-form-item
            label="审批人"
            prop="approvers"
            :rules="[{ required: true, message: '请选择审批人', trigger: 'change' }]"
        >
          <el-select
              v-model="form.approvers"
              multiple
              filterable
              placeholder="请选择审批人"
          >
            <el-option
                v-for="user in allUsers"
                :key="user.value"
                :label="user.label"
                :value="user"
            />
          </el-select>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, nextTick } from 'vue'
import { ElMessage } from 'element-plus'

// 模拟用户池（真实环境可从接口获取）
const allUsers = [
  { value: 1, label: '张三' },
  { value: 2, label: '李四' },
  { value: 3, label: '王五' },
  { value: 4, label: '赵六' },
  { value: 5, label: '孙七' }
]

// 表格数据
const tableData = ref([
  {
    taskId: 'T1001',
    taskName: '设备闲置审批',
    taskType: '闲置',
    approvers: [allUsers[0], allUsers[2]]
  },
  {
    taskId: 'T1002',
    taskName: '电脑报废审批',
    taskType: '报废',
    approvers: [allUsers[1], allUsers[3]]
  }
])

// 弹窗相关
const dialogVisible = ref(false)
const isEdit = ref(false)
const formRef = ref()
const form = reactive({
  taskId: '',
  taskName: '',
  taskType: '',
  approvers: []
})

// 打开弹窗
function openDialog(row) {
  if (row) {
    // 编辑
    isEdit.value = true
    nextTick(() => {
      Object.assign(form, {
        taskId: row.taskId,
        taskName: row.taskName,
        taskType: row.taskType,
        approvers: row.approvers
      })
    })
  } else {
    // 新增
    isEdit.value = false
  }
  dialogVisible.value = true
}

// 提交保存
function handleSubmit() {
  formRef.value.validate(valid => {
    if (!valid) return
    if (isEdit.value) {
      // 更新
      const idx = tableData.value.findIndex(item => item.taskId === form.taskId)
      if (idx > -1) {
        tableData.value.splice(idx, 1, { ...form })
      }
    } else {
      // 新增
      tableData.value.push({
        ...form,
        taskId: `T${Date.now()}`
      })
    }
    ElMessage.success(isEdit.value ? '更新成功' : '新增成功')
    dialogVisible.value = false
  })
}

// 删除
function handleDelete(taskId) {
  tableData.value = tableData.value.filter(item => item.taskId !== taskId)
  ElMessage.success('删除成功')
}

// 重置表单
function resetForm() {
  form.taskId = ''
  form.taskName = ''
  form.taskType = ''
  form.approvers = []
  formRef.value?.clearValidate()
}
</script>

<style scoped>
.approval-config {
  padding: 16px;
}
</style>
