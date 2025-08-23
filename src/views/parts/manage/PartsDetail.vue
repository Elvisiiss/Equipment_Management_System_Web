<template>
  <div class="spare-part-detail-container">
    <!-- 加载状态 -->
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>加载中...</p>
    </div>

    <!-- 错误状态 -->
    <div v-else-if="error" class="error-container">
      <h2>加载失败</h2>
      <p>{{ error }}</p>
      <button @click="fetchPartDetail" class="retry-btn">重试</button>
    </div>

    <!-- 内容区域 -->
    <div v-else-if="part" class="spare-part-detail">
      <!-- 头部信息 -->
      <div class="header-section">
        <div class="title-container">
          <h1>{{ part.name }}</h1>
          <span class="tag" :class="{ valuable: part.isValuable }">
            {{ part.isValuable ? '贵重' : '普通' }}
          </span>
        </div>
        <p class="description">{{ part.description }}</p>
        <div class="stats">
          <div class="stat-item">
            <span class="stat-label">总库存</span>
            <span class="stat-value">{{ part.totalQuantity }}</span>
          </div>
        </div>
      </div>

      <!-- 仓库分布 -->
      <div class="section">
        <h2 class="section-title">
          <span class="icon">📦</span>
          仓库分布
        </h2>
        <div class="warehouse-cards">
          <div v-for="wh in part.warehouses" :key="wh.id" class="warehouse-card">
            <div class="warehouse-header">
              <h3>{{ wh.name }}</h3>
              <span class="status-badge" :class="{ warning: wh.quantity <= wh.safetyStock }">
                {{ wh.quantity <= wh.safetyStock ? '库存不足' : '正常' }}
              </span>
            </div>
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
              <div
                  class="inventory-fill"
                  :class="{ low: wh.quantity <= wh.safetyStock }"
                  :style="{ width: calculateInventoryPercentage(wh.quantity, wh.safetyStock) }"
              ></div>
            </div>
          </div>
        </div>
      </div>

      <!-- 借出记录 -->
      <div class="section">
        <h2 class="section-title">
          <span class="icon">📋</span>
          借出记录
        </h2>

        <div v-if="part.borrowedItems.length === 0" class="empty-state">
          <p>暂无借出记录</p>
        </div>

        <div v-else>
          <!-- 未归还 -->
          <div v-if="unreturnedItems.length > 0" class="borrow-section">
            <h3 class="subsection-title">未归还</h3>
            <div class="table-container">
              <table class="data-table">
                <thead>
                <tr>
                  <th>员工</th>
                  <th>借出日期</th>
                  <th>数量</th>
                  <th>仓库负责人</th>
                  <th>状态</th>
                </tr>
                </thead>
                <tbody>
                <tr v-for="(item, index) in unreturnedItems" :key="index">
                  <td>{{ item.employee }}</td>
                  <td>{{ formatDate(item.borrowDate) }}</td>
                  <td>
                      <span class="quantity-badge">
                        {{ item.quantity - (item.returnQuantity || 0) }}
                      </span>
                  </td>
                  <td>{{ item.manager }}</td>
                  <td>
                      <span class="status-tag" :class="{ installed: item.installed }">
                        {{ item.installed ? '已安装' : '未安装' }}
                      </span>
                  </td>
                </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- 已归还 -->
          <div v-if="returnedItems.length > 0" class="borrow-section">
            <h3 class="subsection-title">已归还</h3>
            <div class="table-container">
              <table class="data-table">
                <thead>
                <tr>
                  <th>员工</th>
                  <th>借出日期</th>
                  <th>归还日期</th>
                  <th>借出数量</th>
                  <th>归还数量</th>
                  <th>归还负责人</th>
                  <th>状态</th>
                </tr>
                </thead>
                <tbody>
                <tr v-for="(item, index) in returnedItems" :key="index">
                  <td>{{ item.employee }}</td>
                  <td>{{ formatDate(item.borrowDate) }}</td>
                  <td>{{ formatDate(item.returnDate) }}</td>
                  <td>{{ item.quantity }}</td>
                  <td>{{ item.returnQuantity }}</td>
                  <td>{{ item.returnManager }}</td>
                  <td>
                      <span class="status-tag" :class="{ installed: item.installed }">
                        {{ item.installed ? '已安装' : '未安装' }}
                      </span>
                  </td>
                </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="action-buttons">
        <button @click="$router.go(-1)" class="back-btn">
          <span class="btn-icon">←</span>
          返回
        </button>
      </div>
    </div>

    <!-- 备件不存在 -->
    <div v-else class="not-found">
      <h2>备件不存在</h2>
      <p>您查找的备件可能已被删除或不存在</p>
      <button @click="$router.go(-1)" class="back-btn">返回</button>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { spareParts } from '@/api/parts/data/mockData'

export default {
  name: 'SparePartDetail',
  setup() {
    const route = useRoute()
    const part = ref(null)
    const loading = ref(true)
    const error = ref(null)

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
      return `${(quantity / max) * 100}%`
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
  min-height: 100vh;
  background-color: #f5f7fa;
  padding: 20px;
}

/* 加载状态 */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #e3e3e3;
  border-top: 4px solid #4e6ef2;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
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
  background-color: #4e6ef2;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  margin-top: 16px;
}

.retry-btn:hover {
  background-color: #3a5bd9;
}

/* 内容区域 */
.spare-part-detail {
  max-width: 1000px;
  margin: 0 auto;
}

.header-section {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  margin-bottom: 24px;
}

.title-container {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}

.title-container h1 {
  font-size: 24px;
  font-weight: 600;
  margin: 0;
  margin-right: 12px;
}

.tag {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.tag.valuable {
  background-color: #fff6e6;
  color: #e6a23c;
}

.description {
  color: #606266;
  margin-bottom: 20px;
  line-height: 1.6;
}

.stats {
  display: flex;
  gap: 24px;
}

.stat-item {
  display: flex;
  flex-direction: column;
}

.stat-label {
  font-size: 14px;
  color: #909399;
  margin-bottom: 4px;
}

.stat-value {
  font-size: 20px;
  font-weight: 600;
  color: #303133;
}

/* 部分样式 */
.section {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  margin-bottom: 24px;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  margin-top: 0;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
}

.section-title .icon {
  margin-right: 8px;
}

.subsection-title {
  font-size: 16px;
  font-weight: 500;
  margin-top: 0;
  margin-bottom: 16px;
  color: #606266;
}

/* 仓库卡片 */
.warehouse-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

.warehouse-card {
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  padding: 16px;
  transition: box-shadow 0.3s;
}

.warehouse-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.warehouse-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.warehouse-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 500;
}

.status-badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.status-badge.warning {
  background-color: #fef0f0;
  color: #f56c6c;
}

.warehouse-stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 16px;
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
  height: 8px;
  background-color: #f2f6fc;
  border-radius: 4px;
  overflow: hidden;
}

.inventory-fill {
  height: 100%;
  background-color: #67c23a;
  border-radius: 4px;
  transition: width 0.3s;
}

.inventory-fill.low {
  background-color: #f56c6c;
}

/* 表格样式 */
.table-container {
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th {
  background-color: #f5f7fa;
  padding: 12px 16px;
  text-align: left;
  font-weight: 500;
  color: #606266;
  border-bottom: 1px solid #e4e7ed;
}

.data-table td {
  padding: 12px 16px;
  border-bottom: 1px solid #e4e7ed;
}

.data-table tr:last-child td {
  border-bottom: none;
}

.data-table tr:hover {
  background-color: #f5f7fa;
}

.quantity-badge {
  display: inline-block;
  padding: 4px 8px;
  background-color: #ecf5ff;
  color: #409eff;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.status-tag {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  background-color: #f4f4f5;
  color: #909399;
}

.status-tag.installed {
  background-color: #f0f9eb;
  color: #67c23a;
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
  padding: 10px 20px;
  background-color: #4e6ef2;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s;
}

.back-btn:hover {
  background-color: #3a5bd9;
}

.btn-icon {
  margin-right: 6px;
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

  .header-section,
  .section {
    padding: 16px;
  }

  .stats {
    flex-direction: column;
    gap: 16px;
  }

  .warehouse-cards {
    grid-template-columns: 1fr;
  }

  .data-table {
    min-width: 600px;
  }
}
</style>
