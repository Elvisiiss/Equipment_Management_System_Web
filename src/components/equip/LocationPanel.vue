<template>
  <div class="location-management">
    <h3>逻辑位置管理</h3>

    <!-- 搜索和操作栏 -->
    <div class="operation-bar">
      <el-input
          v-model="searchKeyword"
          placeholder="搜索位置名称或编码"
          style="width: 300px"
          clearable
          @clear="handleSearch"
          @keyup.enter="handleSearch"
      >
        <template #append>
          <el-button :icon="Search" @click="handleSearch" />
        </template>
      </el-input>

      <div class="right-buttons">
        <el-button type="primary" :icon="Plus" @click="handleAdd">
          新增位置
        </el-button>
        <el-button :icon="Upload" @click="importDialogVisible = true">
          批量导入
        </el-button>
      </div>
    </div>

    <!-- 位置卡片列表 -->
    <div class="location-grid">
      <el-card
          v-for="location in filteredLocations"
          :key="location.id"
          class="location-card"
          shadow="hover"
      >
        <div class="card-header">
          <span class="location-name">{{ location.name }}</span>
          <span class="location-code">{{ location.code }}</span>
        </div>

        <div class="card-content">
          <div class="info-row">
            <span class="label">设备数量：</span>
            <el-tag size="small">{{ location.deviceCount }}</el-tag>
          </div>
          <div class="info-row">
            <span class="label">位置类型：</span>
            <span>{{ location.type }}</span>
          </div>
          <div class="info-row" v-if="location.description">
            <span class="label">描述：</span>
            <span class="description">{{ location.description }}</span>
          </div>
        </div>

        <div class="card-actions">
          <el-button
              type="primary"
              size="small"
              :icon="Edit"
              @click="handleEdit(location)"
          >
            编辑
          </el-button>
          <el-button
              type="danger"
              size="small"
              :icon="Delete"
              @click="handleDelete(location)"
          >
            删除
          </el-button>
        </div>
      </el-card>
    </div>

    <!-- 分页 -->
    <div class="pagination">
      <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :total="totalLocations"
          layout="total, prev, pager, next, jumper"
          @current-change="handlePageChange"
      />
    </div>

    <!-- 新增/编辑对话框 -->
    <el-dialog
        v-model="dialogVisible"
        :title="currentLocation.id ? '编辑逻辑位置' : '新增逻辑位置'"
        width="500px"
    >
      <el-form
          :model="currentLocation"
          label-width="100px"
          label-position="left"
      >
        <el-form-item label="位置名称" required>
          <el-input v-model="currentLocation.name" placeholder="请输入位置名称" />
        </el-form-item>
        <el-form-item label="位置编码">
          <el-input v-model="currentLocation.code" placeholder="请输入位置编码" />
        </el-form-item>
        <el-form-item label="位置类型">
          <el-select v-model="currentLocation.type" placeholder="请选择位置类型">
            <el-option
                v-for="item in locationTypes"
                :key="item.value"
                :label="item.label"
                :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="设备数量">
          <el-input-number
              v-model="currentLocation.deviceCount"
              :min="0"
              controls-position="right"
          />
        </el-form-item>
        <el-form-item label="位置描述">
          <el-input
              v-model="currentLocation.description"
              type="textarea"
              :rows="3"
              placeholder="请输入位置描述"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>

    <!-- 导入对话框 -->
    <el-dialog v-model="importDialogVisible" title="批量导入" width="400px">
      <div class="import-content">
        <el-upload
            class="upload-demo"
            drag
            action=""
            :limit="1"
            accept=".xlsx,.xls"
            :auto-upload="false"
            :on-change="handleFileChange"
        >
          <el-icon class="el-icon--upload"><upload-filled /></el-icon>
          <div class="el-upload__text">
            将文件拖到此处，或<em>点击上传</em>
          </div>
          <template #tip>
            <div class="el-upload__tip">
              仅支持 Excel 文件，<el-link type="primary" :underline="false">下载模板</el-link>
            </div>
          </template>
        </el-upload>
      </div>

      <template #footer>
        <el-button @click="importDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleImport">开始导入</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { Search, Plus, Upload, Edit, Delete } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// 模拟数据
const mockLocations = [
  {
    id: 1,
    name: '冲压生产线',
    code: 'PRESS-001',
    type: '生产线',
    deviceCount: 5,
    description: '主要负责金属板材冲压成型'
  },
  {
    id: 2,
    name: '焊接工作站',
    code: 'WELD-002',
    type: '工作站',
    deviceCount: 3,
    description: '自动化焊接设备组'
  },
  {
    id: 3,
    name: '喷涂车间',
    code: 'PAINT-003',
    type: '车间',
    deviceCount: 8,
    description: '产品表面喷涂处理区域'
  },
  {
    id: 4,
    name: '质检区域',
    code: 'QC-004',
    type: '区域',
    deviceCount: 4,
    description: '产品质量检测区域'
  },
  {
    id: 5,
    name: '包装线',
    code: 'PACK-005',
    type: '生产线',
    deviceCount: 2,
    description: '产品包装和装箱区域'
  },
  {
    id: 6,
    name: '原料仓库',
    code: 'STORE-006',
    type: '仓库',
    deviceCount: 0,
    description: '原材料存储区域'
  }
]

// 响应式数据
const locations = ref([])
const searchKeyword = ref('')
const currentPage = ref(1)
const pageSize = ref(8)
const totalLocations = ref(0)
const dialogVisible = ref(false)
const importDialogVisible = ref(false)
const currentLocation = ref({
  id: null,
  name: '',
  code: '',
  type: '',
  deviceCount: 0,
  description: ''
})

const locationTypes = [
  { value: '车间', label: '车间' },
  { value: '生产线', label: '生产线' },
  { value: '工作站', label: '工作站' },
  { value: '区域', label: '区域' },
  { value: '仓库', label: '仓库' }
]

const filteredLocations = computed(() => {
  let result = locations.value
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    result = result.filter(
        item =>
            item.name.toLowerCase().includes(keyword) ||
            (item.code && item.code.toLowerCase().includes(keyword))
    )
  }
  totalLocations.value = result.length
  return result.slice(
      (currentPage.value - 1) * pageSize.value,
      currentPage.value * pageSize.value
  )
})

// 生命周期钩子
onMounted(() => {
  // 模拟API请求
  setTimeout(() => {
    locations.value = [...mockLocations]
    totalLocations.value = mockLocations.length
  }, 500)
})

// 方法
const handleSearch = () => {
  currentPage.value = 1
}

const handleAdd = () => {
  currentLocation.value = {
    id: null,
    name: '',
    code: '',
    type: '',
    deviceCount: 0,
    description: ''
  }
  dialogVisible.value = true
}

const handleEdit = location => {
  currentLocation.value = { ...location }
  dialogVisible.value = true
}

const handleDelete = location => {
  ElMessageBox.confirm(`确定要删除位置 "${location.name}" 吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
      .then(() => {
        locations.value = locations.value.filter(item => item.id !== location.id)
        ElMessage.success('删除成功')
      })
      .catch(() => {})
}

const handleSubmit = () => {
  if (!currentLocation.value.name) {
    ElMessage.warning('请输入位置名称')
    return
  }

  if (currentLocation.value.id) {
    // 编辑
    const index = locations.value.findIndex(
        item => item.id === currentLocation.value.id
    )
    if (index !== -1) {
      locations.value.splice(index, 1, { ...currentLocation.value })
    }
    ElMessage.success('修改成功')
  } else {
    // 新增
    const newId =
        locations.value.length > 0
            ? Math.max(...locations.value.map(item => item.id)) + 1
            : 1
    locations.value.unshift({
      ...currentLocation.value,
      id: newId
    })
    ElMessage.success('新增成功')
  }
  dialogVisible.value = false
}

const handlePageChange = () => {
  // 可以在这里添加分页请求逻辑
}

const handleFileChange = file => {
  console.log('选择文件:', file)
}

const handleImport = () => {
  // 模拟导入
  ElMessage.success('导入成功')
  importDialogVisible.value = false
}
</script>

<style scoped>
.location-management {
  padding: 20px;
}

.operation-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.right-buttons {
  display: flex;
  gap: 10px;
}

.location-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
  margin-bottom: 20px;
}

.location-card {
  transition: all 0.3s;
}

.location-card:hover {
  transform: translateY(-3px);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid #eee;
}

.location-name {
  font-weight: bold;
  font-size: 16px;
}

.location-code {
  color: #666;
  font-size: 12px;
}

.card-content {
  margin-bottom: 12px;
}

.info-row {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  font-size: 14px;
}

.info-row:last-child {
  margin-bottom: 0;
}

.label {
  color: #666;
  min-width: 70px;
}

.description {
  color: #666;
  word-break: break-word;
}

.card-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.pagination {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.import-content {
  padding: 20px;
  text-align: center;
}
</style>
