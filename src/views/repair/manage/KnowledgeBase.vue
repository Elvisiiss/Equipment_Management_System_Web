<template>
  <div class="knowledge-base">
    <div class="page-header">
      <h2>维修知识库</h2>
      <el-button type="primary" @click="handleCreate">新增知识</el-button>
    </div>

    <div class="search-bar">
      <el-form :inline="true" :model="searchForm">
        <el-form-item label="关键词">
          <el-input
              v-model="searchForm.keyword"
              placeholder="搜索标题或内容"
              @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item label="设备">
          <el-select v-model="searchForm.deviceCode" placeholder="全部设备" clearable>
            <el-option label="贴片机#1" value="SMT-001" />
            <el-option label="回流焊#2" value="REFLOW-002" />
          </el-select>
        </el-form-item>
        <el-form-item label="类型">
          <el-select v-model="searchForm.type" placeholder="全部类型" clearable>
            <el-option label="故障案例" value="故障案例" />
            <el-option label="SOP" value="SOP" />
            <el-option label="技术资料" value="技术资料" />
            <el-option label="维修经验" value="维修经验" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <div class="content">
      <el-row :gutter="20">
        <el-col :span="6" v-for="item in knowledgeList" :key="item.id">
          <el-card class="knowledge-card" shadow="hover">
            <div class="card-header">
              <span class="type-tag">{{ item.type }}</span>
              <span class="view-count">{{ item.viewCount }}次浏览</span>
            </div>
            <h3 class="title">{{ item.title }}</h3>
            <p class="device">设备: {{ item.deviceCode }}</p>
            <p class="time">创建时间: {{ item.createTime }}</p>
            <div class="actions">
              <el-button type="primary" size="small" @click="handleView(item)">
                查看详情
              </el-button>
              <el-button type="warning" size="small" @click="handleEdit(item)">
                编辑
              </el-button>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <div class="pagination">
      <el-pagination
          v-model:current-page="currentPage"
          :page-size="pageSize"
          :total="total"
          layout="total, prev, pager, next"
          @current-change="handlePageChange"
      />
    </div>

    <!-- 知识详情对话框 -->
    <el-dialog
        v-model="detailVisible"
        title="知识详情"
        width="800px"
    >
      <div class="knowledge-detail">
        <h2>{{ currentKnowledge.title }}</h2>
        <div class="meta-info">
          <span>设备: {{ currentKnowledge.deviceCode }}</span>
          <span>类型: {{ currentKnowledge.type }}</span>
          <span>创建时间: {{ currentKnowledge.createTime }}</span>
          <span>浏览次数: {{ currentKnowledge.viewCount }}</span>
        </div>
        <div class="content" v-html="currentKnowledge.content"></div>
      </div>
    </el-dialog>

    <!-- 新建/编辑对话框 -->
    <el-dialog
        v-model="editVisible"
        :title="editTitle"
        width="600px"
        @close="handleEditClose"
    >
      <el-form :model="knowledgeForm" label-width="80px">
        <el-form-item label="标题">
          <el-input v-model="knowledgeForm.title" />
        </el-form-item>
        <el-form-item label="设备">
          <el-select v-model="knowledgeForm.deviceCode" style="width: 100%">
            <el-option label="贴片机#1" value="SMT-001" />
            <el-option label="回流焊#2" value="REFLOW-002" />
          </el-select>
        </el-form-item>
        <el-form-item label="类型">
          <el-select v-model="knowledgeForm.type" style="width: 100%">
            <el-option label="故障案例" value="故障案例" />
            <el-option label="SOP" value="SOP" />
            <el-option label="技术资料" value="技术资料" />
            <el-option label="维修经验" value="维修经验" />
          </el-select>
        </el-form-item>
        <el-form-item label="内容">
          <el-input
              v-model="knowledgeForm.content"
              type="textarea"
              :rows="8"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import repairAPI from '@/api/repair'

const loading = ref(false)
const knowledgeList = ref([])
const currentPage = ref(1)
const pageSize = ref(12)
const total = ref(0)
const detailVisible = ref(false)
const editVisible = ref(false)
const editTitle = ref('')
const isEdit = ref(false)

const searchForm = reactive({
  keyword: '',
  deviceCode: '',
  type: ''
})

const currentKnowledge = ref({})
const knowledgeForm = reactive({
  title: '',
  deviceCode: '',
  type: '',
  content: ''
})

const loadData = async () => {
  loading.value = true
  try {
    const res = await repairAPI.getKnowledgeBase(
        currentPage.value - 1,
        pageSize.value,
        searchForm.keyword,
        searchForm.deviceCode
    )
    if (res.success) {
      knowledgeList.value = res.data.content
      total.value = res.data.totalElements
    }
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

const handleReset = () => {
  searchForm.keyword = ''
  searchForm.deviceCode = ''
  searchForm.type = ''
  handleSearch()
}

const handleCreate = () => {
  editTitle.value = '新增知识'
  isEdit.value = false
  Object.keys(knowledgeForm).forEach(key => knowledgeForm[key] = '')
  editVisible.value = true
}

const handleEdit = (item) => {
  editTitle.value = '编辑知识'
  isEdit.value = true
  Object.assign(knowledgeForm, item)
  editVisible.value = true
}

const handleView = (item) => {
  currentKnowledge.value = item
  detailVisible.value = true
}

const handleSubmit = async () => {
  try {
    if (isEdit.value) {
      await repairAPI.updateKnowledge(currentKnowledge.value.id, knowledgeForm)
      ElMessage.success('更新成功')
    } else {
      await repairAPI.createKnowledge(knowledgeForm)
      ElMessage.success('创建成功')
    }
    editVisible.value = false
    loadData()
  } catch (error) {
    ElMessage.error('操作失败')
  }
}

const handleEditClose = () => {
  Object.keys(knowledgeForm).forEach(key => knowledgeForm[key] = '')
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.knowledge-base {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.search-bar {
  margin-bottom: 20px;
  padding: 20px;
  background: #f5f7fa;
  border-radius: 8px;
}

.content {
  margin-bottom: 20px;
}

.knowledge-card {
  margin-bottom: 20px;
  height: 200px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.type-tag {
  padding: 2px 8px;
  background: #e6f7ff;
  color: #1890ff;
  border-radius: 4px;
  font-size: 12px;
}

.view-count {
  font-size: 12px;
  color: #999;
}

.title {
  font-size: 16px;
  margin: 10px 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.device, .time {
  font-size: 14px;
  color: #666;
  margin: 5px 0;
}

.actions {
  margin-top: 15px;
}

.knowledge-detail {
  padding: 20px;
}

.knowledge-detail h2 {
  margin-bottom: 20px;
}

.meta-info {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
  color: #666;
  font-size: 14px;
}

.content {
  line-height: 1.8;
}
</style>
