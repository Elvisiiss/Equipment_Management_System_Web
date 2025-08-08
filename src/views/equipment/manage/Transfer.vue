<template>
  <div class="page-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>设备转机记录</span>
          <el-button type="primary" @click="openAddDialog">新增转机</el-button>
        </div>
      </template>

      <!-- 查询区 -->
      <el-form :inline="true" :model="queryForm" size="small">
        <el-form-item label="设备编号">
          <el-input v-model="queryForm.deviceNo" placeholder="请输入" clearable />
        </el-form-item>
        <el-form-item label="转机日期">
          <el-date-picker
              v-model="queryForm.changeoverDate"
              type="date"
              value-format="YYYY-MM-DD"
              placeholder="选择日期"
              clearable
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleQuery">查询</el-button>
          <el-button @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>

      <!-- 列表 -->
      <el-table :data="tableData" style="width: 100%" v-loading="loading">
        <el-table-column prop="id" label="ID" width="70" />
        <el-table-column prop="deviceNo" label="设备编号" />
        <el-table-column prop="beforeProduct" label="原产品机种" />
        <el-table-column prop="afterProduct" label="新产品机种" />
        <el-table-column prop="changeoverTime" label="转机时间" width="160">
          <template #default="scope">
            {{ dayjs(scope.row.changeoverTime).format('YYYY-MM-DD HH:mm:ss') }}
          </template>
        </el-table-column>
        <el-table-column prop="operator" label="操作人" />
        <el-table-column prop="remark" label="备注" show-overflow-tooltip />
        <el-table-column label="操作" width="140" fixed="right">
          <template #default="scope">
            <el-button size="small" type="text" @click="openEditDialog(scope.row)">
              编辑
            </el-button>
            <el-popconfirm title="确定删除?" @confirm="handleDelete(scope.row.id)">
              <template #reference>
                <el-button size="small" type="text" style="color:#F56C6C">
                  删除
                </el-button>
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <el-pagination
          background
          class="pagination"
          layout="prev, pager, next, sizes, total"
          :total="total"
          v-model:current-page="queryForm.page"
          v-model:page-size="queryForm.size"
          @size-change="handleQuery"
          @current-change="handleQuery"
      />
    </el-card>

    <!-- 新增 / 编辑弹窗 -->
    <el-dialog
        :title="dialogTitle"
        v-model="dialogVisible"
        width="500px"
        @close="resetForm"
    >
      <el-form
          ref="formRef"
          :model="form"
          :rules="rules"
          label-width="110px"
          size="small"
      >
        <el-form-item label="设备编号" prop="deviceNo">
          <el-input v-model="form.deviceNo" placeholder="请输入" />
        </el-form-item>
        <el-form-item label="原产品机种" prop="beforeProduct">
          <el-input v-model="form.beforeProduct" placeholder="请输入" />
        </el-form-item>
        <el-form-item label="新产品机种" prop="afterProduct">
          <el-input v-model="form.afterProduct" placeholder="请输入" />
        </el-form-item>
        <el-form-item label="转机时间" prop="changeoverTime">
          <el-date-picker
              v-model="form.changeoverTime"
              type="datetime"
              value-format="YYYY-MM-DD HH:mm:ss"
              placeholder="选择时间"
              style="width:100%"
          />
        </el-form-item>
        <el-form-item label="操作人" prop="operator">
          <el-input v-model="form.operator" placeholder="请输入" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input
              v-model="form.remark"
              type="textarea"
              :rows="2"
              placeholder="选填"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import dayjs from 'dayjs'

// 模拟后端分页数据
const mockData = (() => {
  const arr = []
  for (let i = 1; i <= 42; i++) {
    arr.push({
      id: i,
      deviceNo: `EQ-${1000 + i}`,
      beforeProduct: `OldModel-${i}`,
      afterProduct: `NewModel-${i}`,
      changeoverTime: new Date(Date.now() - i * 3600 * 1000),
      operator: `Operator${i}`,
      remark: `备注${i}`
    })
  }
  return arr
})()

// 列表数据
const loading = ref(false)
const tableData = ref([])
const total = ref(0)

// 查询表单
const queryForm = reactive({
  deviceNo: '',
  changeoverDate: '',
  page: 1,
  size: 10
})

// 弹窗
const dialogVisible = ref(false)
const dialogTitle = ref('新增转机')
const isEdit = ref(false)

// 表单
const form = reactive({
  id: null,
  deviceNo: '',
  beforeProduct: '',
  afterProduct: '',
  changeoverTime: '',
  operator: '',
  remark: ''
})
const formRef = ref(null)

const rules = {
  deviceNo: [{ required: true, message: '请输入设备编号', trigger: 'blur' }],
  beforeProduct: [{ required: true, message: '请输入原产品机种', trigger: 'blur' }],
  afterProduct: [{ required: true, message: '请输入新产品机种', trigger: 'blur' }],
  changeoverTime: [{ required: true, message: '请选择转机时间', trigger: 'change' }],
  operator: [{ required: true, message: '请输入操作人', trigger: 'blur' }]
}

// 查询
const handleQuery = () => {
  loading.value = true
  // 模拟后端分页
  setTimeout(() => {
    let list = [...mockData]
    // 条件过滤
    if (queryForm.deviceNo) {
      list = list.filter((v) => v.deviceNo.includes(queryForm.deviceNo))
    }
    if (queryForm.changeoverDate) {
      list = list.filter(
          (v) =>
              dayjs(v.changeoverTime).format('YYYY-MM-DD') ===
              queryForm.changeoverDate
      )
    }
    total.value = list.length
    const offset = (queryForm.page - 1) * queryForm.size
    tableData.value = list.slice(offset, offset + queryForm.size)
    loading.value = false
  }, 300)
}
handleQuery()

// 重置查询
const resetQuery = () => {
  queryForm.deviceNo = ''
  queryForm.changeoverDate = ''
  queryForm.page = 1
  handleQuery()
}

// 打开新增
const openAddDialog = () => {
  dialogTitle.value = '新增转机'
  isEdit.value = false
  dialogVisible.value = true
  nextTick(() => resetForm())
}

// 打开编辑
const openEditDialog = (row) => {
  dialogTitle.value = '编辑转机'
  isEdit.value = true
  dialogVisible.value = true
  nextTick(() => {
    Object.assign(form, row)
  })
}

// 提交
const submitForm = () => {
  formRef.value.validate((valid) => {
    if (!valid) return
    // 模拟保存
    if (isEdit.value) {
      const idx = mockData.findIndex((v) => v.id === form.id)
      mockData.splice(idx, 1, { ...form })
      ElMessage.success('更新成功')
    } else {
      const maxId = Math.max(...mockData.map((v) => v.id), 0)
      mockData.unshift({ ...form, id: maxId + 1 })
      ElMessage.success('新增成功')
    }
    dialogVisible.value = false
    handleQuery()
  })
}

// 删除
const handleDelete = (id) => {
  const idx = mockData.findIndex((v) => v.id === id)
  mockData.splice(idx, 1)
  ElMessage.success('删除成功')
  handleQuery()
}

// 重置表单
const resetForm = () => {
  formRef.value?.resetFields()
  Object.assign(form, {
    id: null,
    deviceNo: '',
    beforeProduct: '',
    afterProduct: '',
    changeoverTime: '',
    operator: '',
    remark: ''
  })
}
</script>

<style scoped>
.page-container {
  padding: 20px;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>
