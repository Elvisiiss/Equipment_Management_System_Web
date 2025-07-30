<template>
  <div class="spare-part-code">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2>备件编码管理</h2>
      <el-button type="primary" @click="handleCreate">+ 新建备件编码</el-button>
    </div>

    <!-- 搜索栏 -->
    <div class="search-bar">
      <el-input
          v-model="searchKeyword"
          placeholder="搜索备件名称或编码..."
          style="width: 300px"
          @keyup.enter="handleSearch"
      >
        <template #append>
          <el-button @click="handleSearch" :icon="Search" />
        </template>
      </el-input>
    </div>

    <!-- 数据表格 -->
    <el-table :data="tableData" v-loading="loading" border>
      <el-table-column prop="code" label="备件编码" width="150" />
      <el-table-column prop="name" label="备件名称" />
      <el-table-column prop="category" label="类别" width="120" />
      <el-table-column prop="model" label="型号" width="120" />
      <el-table-column prop="unit" label="单位" width="80" />
      <el-table-column prop="createdAt" label="创建时间" width="180" />
      <el-table-column label="操作" width="200" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" size="small" @click="handleEdit(row)">
            编辑
          </el-button>
          <el-button type="info" size="small" @click="handleDetail(row)">
            详情
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div class="pagination">
      <el-pagination
          v-model:current-page="currentPage"
          :page-size="pageSize"
          :total="total"
          layout="prev, pager, next"
          @current-change="handlePageChange"
      />
    </div>

    <!-- 新建/编辑对话框 -->
    <el-dialog
        v-model="dialogVisible"
        :title="dialogTitle"
        width="600px"
        @close="handleDialogClose"
    >
      <el-form
          ref="formRef"
          :model="formData"
          :rules="formRules"
          label-width="100px"
      >
        <el-form-item label="备件编码" prop="code">
          <el-input v-model="formData.code" placeholder="例：SP-2024-001" />
        </el-form-item>
        <el-form-item label="备件名称" prop="name">
          <el-input v-model="formData.name" />
        </el-form-item>
        <el-form-item label="类别" prop="category">
          <el-select v-model="formData.category" style="width: 100%">
            <el-option label="机械零件" value="机械零件" />
            <el-option label="电气元件" value="电气元件" />
            <el-option label="传动部件" value="传动部件" />
            <el-option label="密封件" value="密封件" />
          </el-select>
        </el-form-item>
        <el-form-item label="型号" prop="model">
          <el-input v-model="formData.model" />
        </el-form-item>
        <el-form-item label="规格" prop="specifications">
          <el-input v-model="formData.specifications" type="textarea" :rows="2" />
        </el-form-item>
        <el-form-item label="单位" prop="unit">
          <el-select v-model="formData.unit" style="width: 100%">
            <el-option label="个" value="个" />
            <el-option label="套" value="套" />
            <el-option label="件" value="件" />
            <el-option label="条" value="条" />
            <el-option label="米" value="米" />
          </el-select>
        </el-form-item>
        <el-form-item label="安全库存" prop="safetyStock">
          <el-input-number v-model="formData.safetyStock" :min="0" />
        </el-form-item>
        <el-form-item label="寿命期限(天)" prop="lifespan">
          <el-input-number v-model="formData.lifespan" :min="0" />
        </el-form-item>
        <el-form-item label="预警天数" prop="warningDays">
          <el-input-number v-model="formData.warningDays" :min="0" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input v-model="formData.description" type="textarea" :rows="3" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { Search } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import sparePartAPI from '@/api/sparePart'

// 数据
const loading = ref(false)
const searchKeyword = ref('')
const tableData = ref([])
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

// 对话框
const dialogVisible = ref(false)
const dialogTitle = ref('')
const isEdit = ref(false)
const currentId = ref(null)

// 表单
const formRef = ref()
const formData = reactive({
  code: '',
  name: '',
  category: '',
  model: '',
  specifications: '',
  unit: '',
  safetyStock: 0,
  lifespan: 0,
  warningDays: 0,
  description: ''
})

const formRules = {
  code: [{ required: true, message: '请输入备件编码', trigger: 'blur' }],
  name: [{ required: true, message: '请输入备件名称', trigger: 'blur' }],
  category: [{ required: true, message: '请选择类别', trigger: 'change' }],
  unit: [{ required: true, message: '请选择单位', trigger: 'change' }]
}

// 方法
const loadData = async () => {
  loading.value = true
  try {
    const res = await sparePartAPI.getSparePartCodes(
        currentPage.value - 1,
        pageSize.value,
        searchKeyword.value
    )
    tableData.value = res.data.content
    total.value = res.data.totalElements
  } catch (error) {
    ElMessage.error('加载数据失败')
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  currentPage.value = 1
  loadData()
}

const handlePageChange = () => {
  loadData()
}

const handleCreate = () => {
  dialogTitle.value = '新建备件编码'
  isEdit.value = false
  resetForm()
  dialogVisible.value = true
}

const handleEdit = (row) => {
  dialogTitle.value = '编辑备件编码'
  isEdit.value = true
  currentId.value = row.id
  Object.assign(formData, row)
  dialogVisible.value = true
}

const handleDetail = (row) => {
  // 跳转到详情页面
  console.log('查看详情:', row)
}

const handleSubmit = async () => {
  await formRef.value.validate()
  try {
    if (isEdit.value) {
      await sparePartAPI.updateSparePartCode(currentId.value, formData)
      ElMessage.success('更新成功')
    } else {
      await sparePartAPI.createSparePartCode(formData)
      ElMessage.success('创建成功')
    }
    dialogVisible.value = false
    loadData()
  } catch (error) {
    ElMessage.error('操作失败')
  }
}

const handleDialogClose = () => {
  formRef.value.resetFields()
  resetForm()
}

const resetForm = () => {
  Object.assign(formData, {
    code: '',
    name: '',
    category: '',
    model: '',
    specifications: '',
    unit: '',
    safetyStock: 0,
    lifespan: 0,
    warningDays: 0,
    description: ''
  })
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.spare-part-code {
  padding: 20px;
  background: #f5f7fa;
  min-height: 100vh;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.search-bar {
  margin-bottom: 20px;
  background: white;
  padding: 15px;
  border-radius: 8px;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}
</style>
