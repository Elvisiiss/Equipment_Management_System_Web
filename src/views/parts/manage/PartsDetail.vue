<template>
  <div class="spare-part-detail-container">
    <!-- 加载状态 -->
    <div v-if="loading" class="loading-container">
      <el-icon class="is-loading" color="#4e6ef2" :size="50">
        <Loading />
      </el-icon>
      <p>加载中...</p>
    </div>

    <!-- 错误状态 -->
    <div v-else-if="error" class="error-container">
      <h2>加载失败</h2>
      <p>{{ error }}</p>
      <el-button type="primary" @click="fetchPartDetail" class="retry-btn">重试</el-button>
    </div>

    <!-- 内容区域 -->
    <div v-else-if="part">
      <!-- 头部信息 -->
      <el-card class="full-width-card">
        <el-row :gutter="20" align="middle">
          <el-col :span="6">
            <div class="part-image-placeholder">
              <el-icon :size="80" color="#909399"><Box /></el-icon>
            </div>
          </el-col>
          <el-col :span="12">
            <el-descriptions :column="2" border>
              <el-descriptions-item label="备件名称">
                <div class="title-container">
                  <span>{{ part.name }}</span>
                  <el-tag :type="part.isValuable ? 'warning' : 'info'" class="tag">
                    {{ part.isValuable ? '贵重' : '普通' }}
                  </el-tag>
                </div>
              </el-descriptions-item>
              <el-descriptions-item label="描述">{{ part.description }}</el-descriptions-item>
              <el-descriptions-item label="总库存">
                <span class="stat-value">{{ part.totalQuantity }}</span>
              </el-descriptions-item>
            </el-descriptions>
          </el-col>
        </el-row>
      </el-card>

      <!-- 仓库分布 -->
      <el-card class="full-width-card">
        <template #header>
          <div class="card-header">
            <span>📦 仓库分布</span>
            <el-icon class="collapse-icon" @click="isWarehouseCollapsed = !isWarehouseCollapsed">
              <ArrowUp v-if="!isWarehouseCollapsed" />
              <ArrowDown v-else />
            </el-icon>
          </div>
        </template>
        <div v-show="!isWarehouseCollapsed" class="card-content">
          <el-row :gutter="16">
            <el-col
                v-for="wh in part.warehouses"
                :key="wh.id"
                :xs="24"
                :sm="12"
                :md="8"
                class="warehouse-col"
            >
              <el-card class="warehouse-card" shadow="hover">
                <template #header>
                  <div class="warehouse-header">
                    <span>{{ wh.name }}</span>
                    <el-tag :type="wh.quantity <= wh.safetyStock ? 'danger' : 'success'" size="small">
                      {{ wh.quantity <= wh.safetyStock ? '库存不足' : '正常' }}
                    </el-tag>
                  </div>
                </template>
                <div class="warehouse-content">
                  <div class="warehouse-stats">
                    <div class="warehouse-stat">
                      <span class="label">当前库存</span>
                      <span class="value">{{ wh.quantity }}</span>
                    </div>
                    <div class="warehouse-stat">
                      <span class="label">安全库存</span>
                      <span class="value">{{ wh.safetyStock }}</span>
                    </div>
                  </div>
                  <div class="inventory-bar">
                    <el-progress
                        :percentage="calculateInventoryPercentage(wh.quantity, wh.safetyStock)"
                        :color="wh.quantity <= wh.safetyStock ? '#f56c6c' : '#67c23a'"
                        :show-text="false"
                    />
                  </div>
                </div>
              </el-card>
            </el-col>
          </el-row>
        </div>
      </el-card>

      <!-- 借出记录 -->
      <el-card class="full-width-card">
        <template #header>
          <div class="card-header">
            <span>📋 借出记录</span>
            <el-icon class="collapse-icon" @click="isBorrowCollapsed = !isBorrowCollapsed">
              <ArrowUp v-if="!isBorrowCollapsed" />
              <ArrowDown v-else />
            </el-icon>
          </div>
        </template>
        <div v-show="!isBorrowCollapsed" class="card-content">
          <div v-if="part.borrowedItems.length === 0" class="empty-state">
            <p>暂无借出记录</p>
          </div>

          <div v-else>
            <!-- 未归还 -->
            <div v-if="unreturnedItems.length > 0" class="borrow-section">
              <h3 class="subsection-title">未归还</h3>
              <el-table :data="unreturnedItems" stripe style="width:100%">
                <el-table-column type="index" label="序号" width="60" />
                <el-table-column prop="employee" label="员工" />
                <el-table-column prop="borrowDate" label="借出日期">
                  <template #default="{row}">
                    {{ formatDate(row.borrowDate) }}
                  </template>
                </el-table-column>
                <el-table-column prop="quantity" label="数量">
                  <template #default="{row}">
                    <el-tag type="info">
                      {{ row.quantity - (row.returnQuantity || 0) }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column prop="manager" label="仓库负责人" />
                <el-table-column prop="installed" label="状态">
                  <template #default="{row}">
                    <el-tag :type="row.installed ? 'success' : 'warning'">
                      {{ row.installed ? '已安装' : '未安装' }}
                    </el-tag>
                  </template>
                </el-table-column>
              </el-table>
            </div>

            <!-- 已归还 -->
            <div v-if="returnedItems.length > 0" class="borrow-section">
              <h3 class="subsection-title">已归还</h3>
              <el-table :data="returnedItems" stripe style="width:100%">
                <el-table-column type="index" label="序号" width="60" />
                <el-table-column prop="employee" label="员工" />
                <el-table-column prop="borrowDate" label="借出日期">
                  <template #default="{row}">
                    {{ formatDate(row.borrowDate) }}
                  </template>
                </el-table-column>
                <el-table-column prop="returnDate" label="归还日期">
                  <template #default="{row}">
                    {{ formatDate(row.returnDate) }}
                  </template>
                </el-table-column>
                <el-table-column prop="quantity" label="借出数量" />
                <el-table-column prop="returnQuantity" label="归还数量" />
                <el-table-column prop="returnManager" label="归还负责人" />
                <el-table-column prop="installed" label="状态">
                  <template #default="{row}">
                    <el-tag :type="row.installed ? 'success' : 'warning'">
                      {{ row.installed ? '已安装' : '未安装' }}
                    </el-tag>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </div>
        </div>
      </el-card>

      <!-- 操作按钮 -->
      <div class="action-buttons">
        <el-button @click="$router.go(-1)" class="back-btn">
          <el-icon><ArrowLeft /></el-icon>
          返回
        </el-button>
      </div>
    </div>

    <!-- 备件不存在 -->
    <div v-else class="not-found">
      <h2>备件不存在</h2>
      <p>您查找的备件可能已被删除或不存在</p>
      <el-button @click="$router.go(-1)" class="back-btn">返回</el-button>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { spareParts } from '@/api/parts/data/mockData'
import {
  Loading,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  Box
} from '@element-plus/icons-vue'

export default {
  name: 'SparePartDetail',
  components: {
    Loading,
    ArrowUp,
    ArrowDown,
    ArrowLeft,
    Box
  },
  setup() {
    const route = useRoute()
    const part = ref(null)
    const loading = ref(true)
    const error = ref(null)
    const isWarehouseCollapsed = ref(false)
    const isBorrowCollapsed = ref(false)

    // 获取备件详情
    const fetchPartDetail = () => {
      try {
        loading.value = true
        error.value = null
        const partId = parseInt(route.params.id)
        const foundPart = spareParts.find(p => p.id === partId)

        // 模拟异步请求
        setTimeout(() => {
          if (foundPart) {
            part.value = foundPart
          } else {
            part.value = null
          }
          loading.value = false
        }, 500)
      } catch (err) {
        error.value = '加载备件详情时发生错误'
        loading.value = false
        console.error('Error fetching part detail:', err)
      }
    }

    // 计算未归还的项目
    const unreturnedItems = computed(() => {
      if (!part.value) return []
      return part.value.borrowedItems.filter(item =>
          !item.returnDate || item.returnQuantity < item.quantity
      )
    })

    // 计算已归还的项目
    const returnedItems = computed(() => {
      if (!part.value) return []
      return part.value.borrowedItems.filter(item =>
          item.returnDate && item.returnQuantity >= item.quantity
      )
    })

    // 计算库存百分比
    const calculateInventoryPercentage = (quantity, safetyStock) => {
      const max = Math.max(quantity, safetyStock) * 1.5 // 以安全库存的1.5倍作为最大值
      return Math.min(100, (quantity / max) * 100)
    }

    // 格式化日期
    const formatDate = (dateString) => {
      if (!dateString) return '-'
      return new Date(dateString).toLocaleDateString('zh-CN')
    }

    onMounted(() => {
      fetchPartDetail()
    })

    return {
      part,
      loading,
      error,
      isWarehouseCollapsed,
      isBorrowCollapsed,
      unreturnedItems,
      returnedItems,
      fetchPartDetail,
      calculateInventoryPercentage,
      formatDate
    }
  }
}
</script>

<style scoped>
.spare-part-detail-container {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: 100vh;
}

/* 加载状态 */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
}

.loading-container p {
  margin-top: 16px;
  color: #606266;
}

/* 错误状态 */
.error-container {
  text-align: center;
  padding: 60px 20px;
}

.error-container h2 {
  color: #f56c6c;
  margin-bottom: 12px;
}

.retry-btn {
  margin-top: 16px;
}

/* 内容区域 */
.full-width-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.collapse-icon {
  cursor: pointer;
}

.card-content {
  padding-top: 15px;
}

.title-container {
  display: flex;
  align-items: center;
  gap: 10px;
}

.tag {
  margin-left: 8px;
}

.stat-value {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.part-image-placeholder {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 180px;
  background-color: #f5f7fa;
  border-radius: 6px;
}

/* 仓库卡片 */
.warehouse-col {
  margin-bottom: 16px;
}

.warehouse-card :deep(.el-card__header) {
  padding: 12px 16px;
}

.warehouse-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.warehouse-content {
  padding: 0 4px;
}

.warehouse-stats {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
}

.warehouse-stat {
  display: flex;
  flex-direction: column;
}

.warehouse-stat .label {
  font-size: 12px;
  color: #909399;
  margin-bottom: 4px;
}

.warehouse-stat .value {
  font-size: 16px;
  font-weight: 500;
}

.inventory-bar {
  margin-top: 8px;
}

/* 表格样式 */
.borrow-section {
  margin-bottom: 24px;
}

.subsection-title {
  font-size: 16px;
  font-weight: 500;
  margin-top: 0;
  margin-bottom: 16px;
  color: #606266;
}

/* 空状态 */
.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: #909399;
}

/* 按钮样式 */
.action-buttons {
  display: flex;
  justify-content: center;
  margin-top: 32px;
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 6px;
}

/* 未找到样式 */
.not-found {
  text-align: center;
  padding: 60px 20px;
}

.not-found h2 {
  color: #606266;
  margin-bottom: 12px;
}

.not-found p {
  color: #909399;
  margin-bottom: 24px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .spare-part-detail-container {
    padding: 12px;
  }
}
</style>
