<template>
  <div class="base-mc">
    <!-- 页面标题和操作按钮 -->
    <div class="page-header">
      <h2>设备管理</h2>
      <el-button type="primary" @click="handleCreate">
        <el-icon><Plus /></el-icon> 新增设备
      </el-button>
    </div>

    <!-- 搜索栏 -->
    <div class="search-bar">
      <el-input
          v-model="searchKeyword"
          placeholder="搜索设备名称或编号..."
          clearable
          @keyup.enter="handleSearch"
      >
        <template #append>
          <el-button @click="handleSearch" :icon="Search" />
        </template>
      </el-input>
    </div>

    <!-- 数据表格 -->
    <el-table :data="tableData" v-loading="loading" border stripe height="calc(100vh - 280px)">
      <el-table-column prop="mcNumber" label="设备编号" width="150" />
      <el-table-column prop="mcName" label="设备名称" width="180" />
      <el-table-column prop="assetNumber" label="资产编号" width="150" />
      <el-table-column prop="serialNumber" label="序列号" width="150" />
      <el-table-column prop="status" label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="getStatusType(row.status)">{{ getStatusLabel(row.status) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="enterFactoryTime" label="入厂时间" width="120" />
      <el-table-column prop="position" label="位置" width="150" />
      <el-table-column label="操作" width="200" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" size="small" @click="handleEdit(row)">编辑</el-button>
          <el-button type="danger" size="small" @click="handleDelete(row)">删除</el-button>
          <!-- 新增：保养按钮 -->
          <el-button type="success" size="small" @click="goToMaintenance(row)">保养</el-button>
          <!-- 新增：维修按钮 -->
          <el-button type="warning" size="small" @click="handleRepair(row)">维修</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div class="pagination">
      <el-pagination
          v-model:current-page="currentPage"
          :page-size="pageSize"
          :total="total"
          layout="total, prev, pager, next, jumper"
          @current-change="handlePageChange"
      />
    </div>

    <!-- 新增/编辑对话框 -->
    <el-dialog
        v-model="dialogVisible"
        :title="dialogTitle"
        width="800px"
        @close="handleDialogClose"
    >
      <el-form
          ref="formRef"
          :model="formData"
          :rules="formRules"
          label-width="120px"
          label-position="left"
      >
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="设备名称" prop="mcName">
              <el-input v-model="formData.mcName" placeholder="请输入设备名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="设备编号" prop="mcNumber">
              <el-input v-model="formData.mcNumber" placeholder="请输入设备编号" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="资产编号" prop="assetNumber">
              <el-input v-model="formData.assetNumber" placeholder="请输入资产编号" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="序列号" prop="serialNumber">
              <el-input v-model="formData.serialNumber" placeholder="请输入序列号" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="入厂时间" prop="enterFactoryTime">
              <el-date-picker
                  v-model="formData.enterFactoryTime"
                  type="date"
                  placeholder="选择日期"
                  style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="设备状态" prop="status">
              <el-select v-model="formData.status" style="width: 100%">
                <el-option label="运行中" :value="1" />
                <el-option label="停机" :value="2" />
                <el-option label="维修中" :value="3" />
                <el-option label="已报废" :value="4" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="位置坐标X" prop="mcCoordinateX">
              <el-input v-model="formData.mcCoordinateX" placeholder="请输入X坐标" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="位置坐标Y" prop="mcCoordinateY">
              <el-input v-model="formData.mcCoordinateY" placeholder="请输入Y坐标" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="设备图片" prop="image">
          <el-upload
              action="#"
              list-type="picture-card"
              :auto-upload="false"
              :on-change="handleImageChange"
              :file-list="fileList"
          >
            <el-icon><Plus /></el-icon>
          </el-upload>
        </el-form-item>

        <el-form-item label="设备铭牌" prop="mcNameplateFile">
          <el-upload action="#" :auto-upload="false" :on-change="handleNameplateChange">
            <el-button type="primary">上传铭牌文件</el-button>
          </el-upload>
        </el-form-item>

        <el-form-item label="备注信息" prop="remark">
          <el-input v-model="formData.remark" type="textarea" :rows="3" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit">保存</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { Search, Plus } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import baseMcAPI from '@/api/equipment'
import { useRouter } from 'vue-router'
const router = useRouter()
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
const fileList = ref([])

// 表单
const formRef = ref()
const formData = reactive({
  mcName: '',
  mcNumber: '',
  assetNumber: '',
  serialNumber: '',
  enterFactoryTime: '',
  status: 1,
  mcCoordinateX: '',
  mcCoordinateY: '',
  image: '',
  mcNameplateFile: '',
  remark: ''
})

const formRules = {
  mcName: [{ required: true, message: '请输入设备名称', trigger: 'blur' }],
  mcNumber: [{ required: true, message: '请输入设备编号', trigger: 'blur' }],
  status: [{ required: true, message: '请选择设备状态', trigger: 'change' }]
}

// 加载数据
const loadData = async () => {
  loading.value = true
  try {
    const res = await baseMcAPI.getBaseMcList(
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

// 搜索
const handleSearch = () => {
  currentPage.value = 1
  loadData()
}

// 分页变化
const handlePageChange = () => {
  loadData()
}

// 创建设备
const handleCreate = () => {
  dialogTitle.value = '新增设备'
  isEdit.value = false
  resetForm()
  dialogVisible.value = true
}

// 编辑设备
const handleEdit = (row) => {
  dialogTitle.value = '编辑设备'
  isEdit.value = true
  currentId.value = row.id
  Object.assign(formData, row)

  // 处理图片
  if (row.image) {
    fileList.value = [{
      name: '设备图片',
      url: row.image
    }]
  } else {
    fileList.value = []
  }

  dialogVisible.value = true
}

// 删除设备
const handleDelete = (row) => {
  ElMessageBox.confirm('确定要删除此设备吗？删除后无法恢复。', '删除确认', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await baseMcAPI.deleteBaseMc(row.id)
      ElMessage.success('删除成功')
      loadData()
    } catch (error) {
      ElMessage.error('删除失败')
    }
  }).catch(() => {})
}

// 提交表单
const handleSubmit = async () => {
  await formRef.value.validate()
  try {
    if (isEdit.value) {
      await baseMcAPI.updateBaseMc(currentId.value, formData)
      ElMessage.success('更新成功')
    } else {
      await baseMcAPI.createBaseMc(formData)
      ElMessage.success('创建成功')
    }
    dialogVisible.value = false
    loadData()
  } catch (error) {
    ElMessage.error('操作失败')
  }
}

// 跳转保养页面
const goToMaintenance = (row) => {
  router.push({
    path: '/maintenance/form',
    query: {
      id: row.id, // 传递设备ID
      name: row.mcName // 传递设备名称
    }
  })
}

// 维修按钮事件（暂未实现）
const handleRepair = (row) => {
  ElMessage.info('维修功能开发中，设备ID：' + row.id)
}

// 关闭对话框
const handleDialogClose = () => {
  formRef.value.resetFields()
  resetForm()
  fileList.value = []
}

// 重置表单
const resetForm = () => {
  Object.assign(formData, {
    mcName: '',
    mcNumber: '',
    assetNumber: '',
    serialNumber: '',
    enterFactoryTime: '',
    status: 1,
    mcCoordinateX: '',
    mcCoordinateY: '',
    image: '',
    mcNameplateFile: '',
    remark: ''
  })
}

// 图片上传处理
const handleImageChange = (file) => {
  formData.image = URL.createObjectURL(file.raw)
}

// 铭牌文件上传处理
const handleNameplateChange = (file) => {
  formData.mcNameplateFile = file.name
}

// 状态标签样式
const getStatusType = (status) => {
  const types = { 1: 'success', 2: 'warning', 3: 'danger', 4: 'info' }
  return types[status] || 'info'
}

// 状态标签文本
const getStatusLabel = (status) => {
  const labels = { 1: '运行中', 2: '停机', 3: '维修中', 4: '已报废' }
  return labels[status] || '未知状态'
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.base-mc {
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
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.el-table {
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  border-radius: 8px;
}

.el-dialog .el-form {
  padding: 0 20px;
}

.el-row {
  margin-bottom: 10px;
}
</style>
