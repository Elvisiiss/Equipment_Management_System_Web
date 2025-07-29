<template>
  <div class="workshop-management">
    <!-- 页面标题区域 -->
    <div class="page-header-custom">
      <div class="header-content">
        <span class="page-title">车间管理</span>
        <span class="page-subtitle">管理系统中的所有车间信息</span>
      </div>
      <div class="header-stats">
        <el-tag>当前页: {{ workshops.length }} 车间</el-tag>
        <el-tag v-if="isBatchMode && selectedWorkshopIds.length > 0" type="success">
          已选择: {{ selectedWorkshopIds.length }}
        </el-tag>
      </div>
    </div>

    <!-- 操作栏 -->
    <el-row :gutter="16" class="action-bar">
      <el-col :span="10">
        <el-input
            v-model="searchKeyword"
            placeholder="搜索车间名称..."
            @keyup.enter="fetchWorkshops"
            clearable
            class="search-input"
        >
          <template #append>
            <el-button @click="fetchWorkshops" :icon="Search">搜索</el-button>
          </template>
        </el-input>
      </el-col>

      <el-col :span="2">
        <div class="sort-controls">
          <el-select
              v-model="sortOption"
              placeholder="排序方式"
              @change="handleSortChange"
              class="sort-select"
          >
            <el-option label="ID升序" value="id-asc" />
            <el-option label="ID降序" value="id-desc" />
            <el-option label="创建时间升序" value="createtime-asc" />
            <el-option label="创建时间降序" value="createtime-desc" />
          </el-select>
        </div>
      </el-col>

      <el-col :span="12" style="text-align: right;">
        <transition name="batch-actions" mode="out-in">
          <el-button-group v-if="isBatchMode" key="batch" class="batch-actions">
            <el-button @click="selectCurrentPage" size="small">
              {{ areAllCurrentPageSelected ? '取消全选' : '全选本页' }}
            </el-button>
            <el-button
                @click="batchEnable"
                type="success"
                size="small"
                :disabled="selectedDisabledCount === 0"
            >
              启用 ({{ selectedDisabledCount }})
            </el-button>
            <el-button
                @click="batchDisable"
                type="warning"
                size="small"
                :disabled="selectedEnabledCount === 0"
            >
              禁用 ({{ selectedEnabledCount }})
            </el-button>
            <el-button
                @click="batchDelete"
                type="danger"
                size="small"
                :disabled="selectedWorkshopIds.length === 0"
            >
              删除 ({{ selectedWorkshopIds.length }})
            </el-button>
          </el-button-group>
        </transition>

        <el-button
            @click="toggleBatchMode"
            :type="isBatchMode ? 'danger' : 'primary'"
            plain
        >
          {{ isBatchMode ? '取消批量操作' : '批量操作' }}
        </el-button>
      </el-col>
    </el-row>

    <!-- 车间表格 -->
    <el-table
        ref="tableRef"
        :data="workshops"
        v-loading="loading"
        @selection-change="handleSelectionChange"
        @row-click="handleRowClick"
        stripe
        style="width: 100%"
    >
      <el-table-column
          v-if="isBatchMode"
          type="selection"
          width="55"
          :selectable="() => true"
      />

      <el-table-column prop="id" label="ID" width="80" align="center">
        <template #default="{ row }">
          <el-tag size="small" type="info">#{{ row.id }}</el-tag>
        </template>
      </el-table-column>

      <el-table-column prop="position" label="车间名称" min-width="150">
        <template #default="{ row }">
          <div class="workshop-info">
            <div class="workshop-icon">
              <i class="icon-factory"></i>
            </div>
            <div class="workshop-details">
              <span class="workshop-name">{{ row.position }}</span>
              <div class="workshop-size" v-if="row.position_size">
                <i class="icon-size"></i> {{ row.position_size }}
              </div>
            </div>
          </div>
        </template>
      </el-table-column>

      <el-table-column prop="status" label="状态" width="100" align="center">
        <template #default="{ row }">
          <el-tag :type="row.status === 0 ? 'success' : 'danger'" size="small">
            {{ row.status === 0 ? '启用' : '禁用' }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column prop="app_is_display" label="APP显示" width="100" align="center">
        <template #default="{ row }">
          <el-tag :type="row.app_is_display === 1 ? 'success' : 'info'" size="small">
            {{ row.app_is_display === 1 ? '是' : '否' }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column prop="createtime" label="创建时间" width="180" align="center">
        <template #default="{ row }">
          {{ formatDate(row.createtime * 1000) }}
        </template>
      </el-table-column>

      <el-table-column prop="weigh" label="权重" width="80" align="center">
        <template #default="{ row }">
          <el-tag type="info">{{ row.weigh }}</el-tag>
        </template>
      </el-table-column>

      <el-table-column v-if="!isBatchMode" label="操作" width="180" align="center" fixed="right">
        <template #default="{ row }">
          <el-button
              @click.stop="toggleWorkshopStatus(row)"
              :type="row.status === 0 ? 'warning' : 'success'"
              size="small"
              plain
          >
            {{ row.status === 0 ? '禁用' : '启用' }}
          </el-button>
          <el-button
              @click.stop="confirmDelete(row)"
              type="danger"
              size="small"
              plain
          >
            删除
          </el-button>
        </template>
      </el-table-column>

      <!-- 空状态 -->
      <template #empty>
        <el-empty
            :image-size="120"
            :description="searchKeyword ? '没有找到匹配的车间' : '暂无车间数据'"
        />
      </template>
    </el-table>

    <!-- 分页组件 -->
    <div class="pagination-wrapper" v-if="totalPages > 1">
      <el-config-provider :locale="zhCn">
        <el-pagination
            v-model:current-page="currentPageForEl"
            :page-size="pageSize"
            :total="totalPages * pageSize"
            layout="prev, pager, next, jumper"
            @current-change="handlePageChange"
            :small="false"
            :prev-text="'上一页'"
            :next-text="'下一页'"
            class="custom-pagination"
        />
      </el-config-provider>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { Search } from '@element-plus/icons-vue'
import { ElMessage, ElConfigProvider, ElMessageBox } from 'element-plus'
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'
import workshopAPI from '@/api/LifeCycle/workshop.js'

// 响应式数据
const workshops = ref([])
const currentPage = ref(0)
const pageSize = ref(10)
const totalPages = ref(1)
const searchKeyword = ref('')
const isBatchMode = ref(false)
const selectedWorkshopIds = ref([])
const loading = ref(false)
const sortBy = ref('id')
const sortDir = ref('asc')
const sortOption = ref('id-asc')
const tableRef = ref()

// Element Plus 分页需要的数据
const currentPageForEl = computed({
  get() {
    return currentPage.value + 1
  },
  set(val) {
    currentPage.value = val - 1
  }
})

// 计算当前页是否全选
const areAllCurrentPageSelected = computed(() => {
  const currentPageIds = workshops.value.map(workshop => workshop.id)
  return currentPageIds.length > 0 &&
      currentPageIds.every(id => selectedWorkshopIds.value.includes(id))
})

// 计算选中车间中各状态的数量
const selectedWorkshops = computed(() => {
  return workshops.value.filter(workshop => selectedWorkshopIds.value.includes(workshop.id))
})

const selectedEnabledCount = computed(() => {
  return selectedWorkshops.value.filter(workshop => workshop.status === 0).length
})

const selectedDisabledCount = computed(() => {
  return selectedWorkshops.value.filter(workshop => workshop.status === 1).length
})

// 生命周期钩子
onMounted(() => {
  fetchWorkshops()
})

// 方法
const fetchWorkshops = async () => {
  loading.value = true
  try {
    const response = await workshopAPI.getWorkshopList(
        currentPage.value,
        pageSize.value,
        searchKeyword.value,
        sortBy.value,
        sortDir.value
    );
    workshops.value = response.data.content || [];
    totalPages.value = response.data.totalPages || 1;
  } catch (error) {
    console.error("获取车间列表失败:", error);
    workshops.value = [];
    totalPages.value = 1;
    ElMessage.error('获取车间列表失败')
  } finally {
    loading.value = false
  }
};

// Element Plus 分页处理
const handlePageChange = (page) => {
  currentPage.value = page - 1
  fetchWorkshops()
}

// Element Plus 表格选择处理
const handleSelectionChange = (selection) => {
  selectedWorkshopIds.value = selection.map(workshop => workshop.id)
}

// Element Plus 行点击处理
const handleRowClick = (row) => {
  if (isBatchMode.value) {
    const isSelected = selectedWorkshopIds.value.includes(row.id)
    if (isSelected) {
      // 取消选择
      tableRef.value.toggleRowSelection(row, false)
      selectedWorkshopIds.value = selectedWorkshopIds.value.filter(id => id !== row.id)
    } else {
      // 选择
      tableRef.value.toggleRowSelection(row, true)
      selectedWorkshopIds.value.push(row.id)
    }
  }
}

const toggleWorkshopStatus = async (workshop) => {
  try {
    await workshopAPI.updateWorkshopStatus(workshop.id, workshop.status === 0 ? 1 : 0)
    const index = workshops.value.findIndex(w => w.id === workshop.id)
    if (index !== -1) {
      workshops.value[index].status = workshop.status === 0 ? 1 : 0
    }
    ElMessage.success(`车间已${workshop.status === 0 ? '禁用' : '启用'}`)
  } catch (error) {
    ElMessage.error('操作失败')
  }
}

const toggleBatchMode = () => {
  isBatchMode.value = !isBatchMode.value
  if (!isBatchMode.value) {
    // 取消批量操作时，清除所有选择状态
    selectedWorkshopIds.value = []
    // 清除表格的选择状态
    if (tableRef.value) {
      tableRef.value.clearSelection()
    }
  }
}

const selectCurrentPage = () => {
  const currentPageIds = workshops.value.map(workshop => workshop.id)
  const currentPageWorkshops = workshops.value

  if (areAllCurrentPageSelected.value) {
    // 如果当前页已全选，则取消当前页的选中
    currentPageWorkshops.forEach(workshop => {
      tableRef.value.toggleRowSelection(workshop, false)
    })
    selectedWorkshopIds.value = selectedWorkshopIds.value.filter(
        id => !currentPageIds.includes(id)
    )
  } else {
    // 否则选中当前页所有车间
    currentPageWorkshops.forEach(workshop => {
      tableRef.value.toggleRowSelection(workshop, true)
    })
    const combinedIds = new Set([...selectedWorkshopIds.value, ...currentPageIds])
    selectedWorkshopIds.value = Array.from(combinedIds)
  }
}

const batchDisable = async () => {
  if (selectedWorkshopIds.value.length === 0) return
  try {
    await workshopAPI.batchUpdateWorkshops('disable', selectedWorkshopIds.value.join(','))
    fetchWorkshops()
    ElMessage.success(`已禁用 ${selectedWorkshopIds.value.length} 个车间`)
    selectedWorkshopIds.value = []
  } catch (error) {
    console.error('批量禁用失败', error)
    ElMessage.error('批量禁用失败')
  }
}

const batchEnable = async () => {
  if (selectedWorkshopIds.value.length === 0) return
  try {
    await workshopAPI.batchUpdateWorkshops('enable', selectedWorkshopIds.value.join(','))
    fetchWorkshops()
    ElMessage.success(`已启用 ${selectedWorkshopIds.value.length} 个车间`)
    selectedWorkshopIds.value = []
  } catch (error) {
    console.error('批量启用失败', error)
    ElMessage.error('批量启用失败')
  }
}

const batchDelete = async () => {
  if (selectedWorkshopIds.value.length === 0) return
  try {
    await ElMessageBox.confirm(
        `确定要删除选中的 ${selectedWorkshopIds.value.length} 个车间吗？此操作不可恢复。`,
        '警告',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }
    )

    await workshopAPI.batchUpdateWorkshops('delete', selectedWorkshopIds.value.join(','))
    fetchWorkshops()
    ElMessage.success(`已删除 ${selectedWorkshopIds.value.length} 个车间`)
    selectedWorkshopIds.value = []
  } catch (error) {
    if (error !== 'cancel') {
      console.error('批量删除失败', error)
      ElMessage.error('批量删除失败')
    }
  }
}

const confirmDelete = async (workshop) => {
  try {
    await ElMessageBox.confirm(
        `确定要删除车间 "${workshop.position}" 吗？此操作不可恢复。`,
        '警告',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }
    )

    await workshopAPI.deleteWorkshop(workshop.id)
    fetchWorkshops()
    ElMessage.success('车间删除成功')
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除车间失败', error)
      ElMessage.error('删除车间失败')
    }
  }
}

const formatDate = (timestamp) => {
  if (!timestamp) return ''
  const date = new Date(timestamp)
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString()
}

// 处理排序选择变化
const handleSortChange = (value) => {
  const [field, direction] = value.split('-')
  sortBy.value = field
  sortDir.value = direction
  fetchWorkshops()
}
</script>

<style scoped>
.workshop-management {
  padding: 20px;
  background: #f8faff;
  min-height: 100vh;
}

.page-header-custom {
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 16px 0;
  border-bottom: 2px solid #e6f0ff;
}

.header-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.page-title {
  font-size: 20px;
  font-weight: 600;
  color: #1a3a6e;
}

.page-subtitle {
  font-size: 14px;
  color: #5b7ba8;
}

.header-stats {
  display: flex;
  gap: 8px;
  align-items: center;
}

.action-bar {
  margin-bottom: 20px;
}

/* 排序控件样式 */
.sort-controls {
  width: 100%;
}

.sort-select {
  width: 100%;
  min-width: 120px;
}

.sort-controls :deep(.el-select) {
  width: 100%;
}

.sort-controls :deep(.el-select .el-input__inner) {
  font-size: 14px;
  text-align: center;
}

.sort-controls :deep(.el-input__wrapper) {
  background-color: #ffffff;
  border: 2px solid #d4e8ff;
  transition: all 0.3s ease;
  border-radius: 6px;
}

.sort-controls :deep(.el-input__wrapper:hover) {
  border-color: #409eff;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.15);
}

.sort-controls :deep(.el-input__wrapper.is-focus) {
  border-color: #409eff;
  box-shadow: 0 0 0 3px rgba(64, 158, 255, 0.15);
}

/* 搜索框样式优化 */
.search-input :deep(.el-input__wrapper) {
  background-color: #ffffff;
  border: 2px solid #d4e8ff;
  transition: all 0.3s ease;
  border-radius: 8px;
}

.search-input :deep(.el-input__wrapper:hover) {
  background-color: #fff;
  border-color: #409eff;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.15);
}

.search-input :deep(.el-input__wrapper.is-focus) {
  background-color: #fff;
  border-color: #409eff;
  box-shadow: 0 0 0 3px rgba(64, 158, 255, 0.15);
}

/* 搜索按钮突出样式 */
.search-input :deep(.el-input-group__append) {
  background: linear-gradient(135deg, #409eff, #367bd6);
  border: none;
  border-radius: 0 8px 8px 0;
  border-left: none;
  box-shadow: none;
}

.search-input :deep(.el-input-group__append .el-button) {
  background: transparent;
  border: none;
  color: #ffffff;
  font-weight: 600;
  letter-spacing: 0.5px;
  transition: all 0.3s ease;
  border-left: none;
}

.search-input :deep(.el-input-group__append .el-button:hover) {
  background: rgba(255, 255, 255, 0.1);
  transform: translateY(-1px);
}

/* 移除搜索框和按钮之间的分割线 */
.search-input :deep(.el-input__wrapper) {
  border-right: none;
}

.search-input :deep(.el-input__wrapper.is-focus) {
  border-right: none;
}

.search-input :deep(.el-input-group__append) {
  border-left: none;
}

.batch-actions {
  margin-right: 10px;
}

.batch-actions-enter-active,
.batch-actions-leave-active {
  transition: all 0.3s ease;
}

.batch-actions-enter-from,
.batch-actions-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.workshop-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.workshop-icon {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #409eff, #367bd6);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 20px;
}

.workshop-icon i {
  font-size: 24px;
}

.workshop-details {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.workshop-name {
  font-weight: 500;
  color: #1a3a6e;
  font-size: 15px;
}

.workshop-size {
  font-size: 12px;
  color: #5b7ba8;
  display: flex;
  align-items: center;
  gap: 4px;
}

/* 表格样式优化 - 减少灰色使用 */
:deep(.el-table) {
  background-color: #ffffff;
  border: 1px solid #e6f0ff;
  border-radius: 8px;
  overflow: hidden;
}

:deep(.el-table__header) {
  background: linear-gradient(135deg, #f8faff, #e6f0ff);
}

:deep(.el-table__header th) {
  background: transparent;
  color: #1a3a6e;
  font-weight: 600;
  border-bottom: 2px solid #d4e8ff;
}

:deep(.el-table__body tr) {
  background-color: #ffffff;
  transition: all 0.3s ease;
}

:deep(.el-table__body tr:hover) {
  background-color: #f8faff;
}

:deep(.el-table__body tr.el-table__row--striped) {
  background-color: #f8faff;
}

:deep(.el-table__body tr.el-table__row--striped:hover) {
  background-color: #e6f0ff;
}

:deep(.el-table__body td) {
  border-bottom: 1px solid #f0f4ff;
  color: #333;
}

/* 分页样式优化 */
.pagination-wrapper {
  display: flex;
  justify-content: center;
  padding: 20px 0;
}

.custom-pagination :deep(.el-pagination__jump) {
  color: #1a3a6e;
}

.custom-pagination :deep(.el-pagination__classifier) {
  color: #1a3a6e;
}

/* 图标样式 */
@font-face {
  font-family: 'iconfont';
  src: url('//at.alicdn.com/t/c/font_4462337_6g5q6etr9k7.woff2?t=1710841570115') format('woff2'),
  url('//at.alicdn.com/t/c/font_4462337_6g5q6etr9k7.woff?t=1710841570115') format('woff'),
  url('//at.alicdn.com/t/c/font_4462337_6g5q6etr9k7.ttf?t=1710841570115') format('truetype');
}

.icon-factory:before, .icon-size:before {
  font-family: "iconfont" !important;
  font-style: normal;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.icon-factory:before {
  content: "\e60e";
}

.icon-size:before {
  content: "\e89f";
  font-size: 14px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .workshop-management {
    padding: 12px;
  }

  .header-stats {
    flex-wrap: wrap;
  }

  .batch-actions {
    margin-right: 0;
    margin-bottom: 10px;
  }
}
</style>
