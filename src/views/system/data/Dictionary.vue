<template>
  <div class="dict-container">
    <el-card>
      <!-- 卡片头部 -->
      <template #header>
        <div class="card-header">
          <span>字典管理</span>
          <el-button type="primary" @click="openAdd">新增</el-button>
        </div>
      </template>

      <!-- 查询 -->
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="类型">
          <!-- 完全自由输入 -->
          <el-input
              v-model="searchForm.type"
              placeholder="请输入类型"
              clearable
              style="width: 160px"
          />
        </el-form-item>

        <el-form-item label="值">
          <el-input
              v-model="searchForm.value"
              placeholder="请输入值"
              clearable
          />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>

      <!-- 表格 -->
      <el-table :data="tableData" stripe style="width: 100%">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="type" label="类型" />
        <el-table-column prop="value" label="值" />
        <el-table-column label="操作" width="180">
          <template #default="scope">
            <el-button size="small" @click="openEdit(scope.row)">编辑</el-button>
            <el-popconfirm
                title="确定删除吗？"
                @confirm="handleDelete(scope.row.id)"
            >
              <template #reference>
                <el-button size="small" type="danger">删除</el-button>
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
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
        :title="isAdd ? '新增字典' : '编辑字典'"
        width="400"
        @closed="resetForm"
    >
      <el-form
          ref="formRef"
          :model="form"
          :rules="rules"
          label-width="80"
          style="padding-right: 20px"
      >
        <!-- 类型：手动输入 -->
        <el-form-item label="类型" prop="type">
          <el-input v-model="form.type" placeholder="请输入类型" />
        </el-form-item>

        <el-form-item label="值" prop="value">
          <el-input v-model="form.value" placeholder="请输入值" />
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
const tableData = ref([])
const total = ref(0)
const page = ref(1)
const pageSize = 10

const searchForm = reactive({
  type: '',
  value: ''
})

const dialogVisible = ref(false)
const isAdd = ref(true)
const formRef = ref()
const form = reactive({
  id: null,
  type: '',
  value: ''
})
const rules = {
  type: [{ required: true, message: '请输入类型', trigger: 'blur' }],
  value: [{ required: true, message: '请输入值', trigger: 'blur' }]
}

/* ------------------ 模拟数据 ------------------ */
let mockId = 1
const mockList = ref([
  { id: mockId++, type: '设备状态', value: '已验收' },
  { id: mockId++, type: '设备状态', value: '待验收' },
  { id: mockId++, type: '设备状态', value: '样机' },
  { id: mockId++, type: '设备状态', value: '闲置' },
  { id: mockId++, type: '设备状态', value: '运行' },
  { id: mockId++, type: '设备状态', value: '待机' },
  { id: mockId++, type: '设备状态', value: '报警/故障' },
  { id: mockId++, type: '设备状态', value: '脱机/离线' },
  { id: mockId++, type: '设备类别', value: '清洗机' },
  { id: mockId++, type: '设备类别', value: 'COG机' },
  { id: mockId++, type: '设备类别', value: 'FOG机' },
  { id: mockId++, type: '设备类别', value: 'AOI机' },
  { id: mockId++, type: '设备类别', value: '组装机' },
  { id: mockId++, type: '性别', value: '男' },
  { id: mockId++, type: '性别', value: '女' },
  { id: mockId++, type: '性别', value: '未知' }
])

/* ------------------ 方法 ------------------ */
const fetchData = () => {
  let list = mockList.value
  if (searchForm.type) {
    list = list.filter(item =>
        item.type.toLowerCase().includes(searchForm.type.toLowerCase())
    )
  }
  if (searchForm.value) {
    list = list.filter(item =>
        item.value.toLowerCase().includes(searchForm.value.toLowerCase())
    )
  }
  total.value = list.length
  const start = (page.value - 1) * pageSize
  const end = start + pageSize
  tableData.value = list.slice(start, end)
}

const handleSearch = () => {
  page.value = 1
  fetchData()
}
const resetSearch = () => {
  searchForm.type = ''
  searchForm.value = ''
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
  form.type = ''
  form.value = ''
}
const submit = () => {
  formRef.value.validate(valid => {
    if (!valid) return
    if (isAdd.value) {
      mockList.value.unshift({
        id: mockId++,
        type: form.type.trim(),
        value: form.value.trim()
      })
      ElMessage.success('新增成功')
    } else {
      const idx = mockList.value.findIndex(item => item.id === form.id)
      if (idx > -1) {
        mockList.value[idx] = {
          ...mockList.value[idx],
          type: form.type.trim(),
          value: form.value.trim()
        }
        ElMessage.success('修改成功')
      }
    }
    dialogVisible.value = false
    fetchData()
  })
}
const handleDelete = id => {
  const idx = mockList.value.findIndex(item => item.id === id)
  if (idx > -1) {
    mockList.value.splice(idx, 1)
    ElMessage.success('删除成功')
    fetchData()
  }
}

/* ------------------ 初始化 ------------------ */
onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.dict-container {
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
