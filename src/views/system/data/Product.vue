<template>
  <div class="product-container">
    <el-card>
      <!-- 顶部工具栏 -->
      <template #header>
        <div class="card-header">
          <span>产品型号管理</span>
          <el-button type="primary" @click="openAdd">新增</el-button>
        </div>
      </template>

      <!-- 查询 -->
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="产品编码">
          <el-input v-model="searchForm.code" placeholder="请输入" clearable />
        </el-form-item>
        <el-form-item label="产品名称">
          <el-input v-model="searchForm.name" placeholder="请输入" clearable />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>

      <!-- 表格 -->
      <el-table :data="tableData" stripe style="width: 100%">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="code" label="产品编码" />
        <el-table-column prop="name" label="产品名称" />
        <el-table-column label="操作" width="180">
          <template #default="scope">
            <el-button size="small" @click="openEdit(scope.row)">编辑</el-button>
            <el-popconfirm title="确定删除吗？" @confirm="handleDelete(scope.row.id)">
              <template #reference>
                <el-button size="small" type="danger">删除</el-button>
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页（示例） -->
      <el-pagination
          background
          layout="prev, pager, next"
          :total="total"
          v-model:current-page="page"
          :page-size="pageSize"
          @current-change="handlePageChange"
          style="margin-top: 16px; text-align: right"
      />
    </el-card>

    <!-- 新增 / 编辑弹窗 -->
    <el-dialog
        v-model="dialogVisible"
        :title="isAdd ? '新增产品' : '编辑产品'"
        width="400"
        @closed="resetForm"
    >
      <el-form
          ref="formRef"
          :model="form"
          :rules="rules"
          label-width="90"
          style="padding-right: 20px"
      >
        <el-form-item label="产品编码" prop="code">
          <el-input v-model="form.code" placeholder="请输入" />
        </el-form-item>
        <el-form-item label="产品名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submit">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'

/* ------------------ 数据 ------------------ */
// 表格
const tableData = ref([])
const total = ref(0)
const page = ref(1)
const pageSize = 10

// 查询条件
const searchForm = reactive({
  code: '',
  name: ''
})

// 弹窗
const dialogVisible = ref(false)
const isAdd = ref(true)
const formRef = ref()
const form = reactive({
  id: null,
  code: '',
  name: ''
})
const rules = {
  code: [{ required: true, message: '请输入产品编码', trigger: 'blur' }],
  name: [{ required: true, message: '请输入产品名称', trigger: 'blur' }]
}

/* ------------------ 模拟数据（仅前端演示） ------------------ */
let mockId = 1
let mockList = []

const fetchData = () => {
  // 简单分页 & 查询过滤
  let list = [...mockList]
  if (searchForm.code) {
    list = list.filter(item => item.code.includes(searchForm.code))
  }
  if (searchForm.name) {
    list = list.filter(item => item.name.includes(searchForm.name))
  }
  total.value = list.length
  const start = (page.value - 1) * pageSize
  const end = start + pageSize
  tableData.value = list.slice(start, end)
}

/* ------------------ 事件 ------------------ */
const handleSearch = () => {
  page.value = 1
  fetchData()
}
const resetSearch = () => {
  searchForm.code = ''
  searchForm.name = ''
  handleSearch()
}
const handlePageChange = () => fetchData()

const openAdd = () => {
  isAdd.value = true
  dialogVisible.value = true
}
const openEdit = row => {
  isAdd.value = false
  Object.assign(form, row)
  dialogVisible.value = true
}
const resetForm = () => {
  formRef.value?.resetFields()
  form.id = null
  form.code = ''
  form.name = ''
}
const submit = () => {
  formRef.value.validate(valid => {
    if (!valid) return
    if (isAdd.value) {
      // 新增
      const newItem = { id: mockId++, code: form.code, name: form.name }
      mockList.unshift(newItem)
      ElMessage.success('新增成功')
    } else {
      // 编辑
      const idx = mockList.findIndex(item => item.id === form.id)
      if (idx > -1) {
        mockList[idx] = { ...mockList[idx], code: form.code, name: form.name }
        ElMessage.success('修改成功')
      }
    }
    dialogVisible.value = false
    fetchData()
  })
}
const handleDelete = id => {
  mockList = mockList.filter(item => item.id !== id)
  ElMessage.success('删除成功')
  fetchData()
}

/* ------------------ 初始化 ------------------ */
onMounted(() => {
  // 制造几行假数据
  mockList = Array.from({ length: 25 }, (_, i) => ({
    id: mockId++,
    code: `P${1001 + i}`,
    name: `产品型号-${1001 + i}`
  }))
  fetchData()
})
</script>

<style scoped>
.product-container {
  padding: 20px;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.search-form {
  margin-bottom: 16px;
}
</style>
