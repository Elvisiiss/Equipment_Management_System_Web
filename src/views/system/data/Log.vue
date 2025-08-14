<template>
  <div class="log-container">
    <el-card>
      <!-- 卡片头部 -->
      <template #header>
        <div class="card-header">
          <span>日志管理</span>
          <!-- 这里演示“新增”按钮，真实系统一般由后端自动写入 -->
          <el-button type="primary" @click="openAdd">模拟新增一条日志</el-button>
        </div>
      </template>

      <!-- 查询 -->
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="操作人">
          <el-input v-model="searchForm.operator" placeholder="请输入" clearable />
        </el-form-item>
        <el-form-item label="操作内容">
          <el-input v-model="searchForm.action" placeholder="请输入" clearable />
        </el-form-item>
        <el-form-item label="IP">
          <el-input v-model="searchForm.ip" placeholder="请输入" clearable />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>

      <!-- 表格 -->
      <el-table :data="tableData" stripe style="width: 100%">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="time" label="时间" width="160" />
        <el-table-column prop="action" label="操作" min-width="200" show-overflow-tooltip />
        <el-table-column prop="operator" label="操作人" width="120" />
        <el-table-column prop="ip" label="IP" width="130" />
        <el-table-column label="操作" width="100">
          <template #default="scope">
            <el-popconfirm title="确定删除吗？" @confirm="handleDelete(scope.row.id)">
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

    <!-- 新增 / 编辑弹窗（仅管理员可手动改） -->
    <el-dialog
        v-model="dialogVisible"
        :title="isAdd ? '新增日志' : '编辑日志'"
        width="480"
        @closed="resetForm"
    >
      <el-form
          ref="formRef"
          :model="form"
          :rules="rules"
          label-width="90"
          style="padding-right: 20px"
      >
        <el-form-item label="时间" prop="time">
          <el-date-picker
              v-model="form.time"
              type="datetime"
              placeholder="选择时间"
              style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="操作" prop="action">
          <el-input
              v-model="form.action"
              type="textarea"
              :rows="3"
              placeholder="例如：删除了设备【清洗机-A01】"
          />
        </el-form-item>
        <el-form-item label="操作人" prop="operator">
          <el-input v-model="form.operator" placeholder="登录账号自动填入" />
        </el-form-item>
        <el-form-item label="IP" prop="ip">
          <el-input v-model="form.ip" placeholder="客户端IP自动填入" />
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
import { faker } from '@faker-js/faker'

/* ------------------ 数据 ------------------ */
const tableData = ref([])
const total = ref(0)
const page = ref(1)
const pageSize = 10

const searchForm = reactive({
  operator: '',
  action: '',
  ip: ''
})

const dialogVisible = ref(false)
const isAdd = ref(true)
const formRef = ref()
const form = reactive({
  id: null,
  time: new Date(),
  action: '',
  operator: '',
  ip: ''
})
const rules = {
  time: [{ required: true, message: '请选择时间', trigger: 'blur' }],
  action: [{ required: true, message: '请输入操作描述', trigger: 'blur' }],
  operator: [{ required: true, message: '请输入操作人', trigger: 'blur' }],
  ip: [{ required: true, message: '请输入IP', trigger: 'blur' }]
}

/* ------------------ 模拟数据 ------------------ */
let mockId = 1
const mockList = ref([])

// 生成若干随机日志
const generateMockLogs = (num = 50) => {
  const logs = []
  for (let i = 0; i < num; i++) {
    logs.push({
      id: mockId++,
      time: faker.date.recent(30).toLocaleString('zh-CN'),
      action: faker.helpers.arrayElement([
        `报废了设备【${faker.commerce.productName()}】`,
        `添加了设备【${faker.commerce.productName()}】`,
        `删除了字典【${faker.lorem.word()}】`,
        `修改了设备状态为【${faker.helpers.arrayElement(['运行', '待机', '报警'])}】`,
        `登录系统`,
        `退出系统`
      ]),
      operator: faker.internet.userName(),
      ip: faker.internet.ipv4()
    })
  }
  return logs
}

const fetchData = () => {
  let list = [...mockList.value]
  if (searchForm.operator) {
    list = list.filter(item =>
        item.operator.toLowerCase().includes(searchForm.operator.toLowerCase())
    )
  }
  if (searchForm.action) {
    list = list.filter(item =>
        item.action.toLowerCase().includes(searchForm.action.toLowerCase())
    )
  }
  if (searchForm.ip) {
    list = list.filter(item =>
        item.ip.toLowerCase().includes(searchForm.ip.toLowerCase())
    )
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
  searchForm.operator = ''
  searchForm.action = ''
  searchForm.ip = ''
  handleSearch()
}
const handlePageChange = () => fetchData()

// 新增按钮：随机生成一条日志
const openAdd = () => {
  isAdd.value = true
  const log = generateMockLogs(1)[0]
  Object.assign(form, {
    id: null,
    time: new Date(),
    action: log.action,
    operator: log.operator,
    ip: log.ip
  })
  dialogVisible.value = true
}

const openEdit = row => {
  isAdd.value = false
  Object.assign(form, {
    ...row,
    time: new Date(row.time) // 字符串转 Date
  })
  dialogVisible.value = true
}

const resetForm = () => {
  formRef.value?.resetFields()
  form.id = null
  form.time = new Date()
  form.action = ''
  form.operator = ''
  form.ip = ''
}

const submit = () => {
  formRef.value.validate(valid => {
    if (!valid) return
    if (isAdd.value) {
      mockList.value.unshift({
        id: mockId++,
        time: form.time.toLocaleString('zh-CN'),
        action: form.action.trim(),
        operator: form.operator.trim(),
        ip: form.ip.trim()
      })
      ElMessage.success('新增成功')
    } else {
      const idx = mockList.value.findIndex(item => item.id === form.id)
      if (idx > -1) {
        mockList.value[idx] = {
          ...mockList.value[idx],
          time: form.time.toLocaleString('zh-CN'),
          action: form.action.trim(),
          operator: form.operator.trim(),
          ip: form.ip.trim()
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
  mockList.value = generateMockLogs(60)
  fetchData()
})
</script>

<style scoped>
.log-container {
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
