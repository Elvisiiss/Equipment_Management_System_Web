<template>
  <div class="spare-part-management">
    <div class="header">
      <h1>备件管理系统</h1>
      <p>高效管理您的备件库存和仓库分布</p>
    </div>

    <div class="card">
      <div class="card-header">
        <div class="search-section">
          <div class="search-input">
            <span class="search-icon">🔍</span>
            <input
                v-model="searchQuery"
                placeholder="搜索备件名称或描述..."
                type="text"
            >
          </div>
          <div class="filter-group">
            <select v-model="filterValuable">
              <option value="all">所有贵重属性</option>
              <option value="yes">贵重</option>
              <option value="no">非贵重</option>
            </select>
            <select v-model="filterStock">
              <option value="all">所有库存状态</option>
              <option value="low">库存不足</option>
              <option value="sufficient">库存充足</option>
            </select>
          </div>
        </div>
        <button class="btn-primary" @click="openAddDialog">
          <span class="btn-icon">+</span> 添加备件
        </button>
      </div>

      <div class="table-container">
        <table>
          <thead>
          <tr>
            <th>ID</th>
            <th>名称</th>
            <th>描述</th>
            <th>总库存</th>
            <th>是否贵重</th>
            <th>状态</th>
            <th>操作</th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="part in paginatedParts" :key="part.id">
            <td>{{ part.id }}</td>
            <td>
              <router-link
                  :to="`/parts/manage/partsDetail/${part.id}`"
                  class="part-link"
              >
                {{ part.name }}
              </router-link>
            </td>
            <td class="description-cell">{{ part.description }}</td>
            <td>
                <span :class="{'low-stock': part.totalQuantity <= 3}">
                  {{ part.totalQuantity }}
                </span>
            </td>
            <td>
                <span :class="['valuable-tag', part.isValuable ? 'valuable' : 'not-valuable']">
                  {{ part.isValuable ? '是' : '否' }}
                </span>
            </td>
            <td>
              <span v-if="part.totalQuantity === 0" class="status-tag out-of-stock">缺货</span>
              <span v-else-if="part.totalQuantity <= 3" class="status-tag low-stock">库存低</span>
              <span v-else class="status-tag in-stock">充足</span>
            </td>
            <td>
              <div class="action-buttons">
                <button class="btn-icon edit" @click="editPart(part)" title="编辑">
                  ✏️
                </button>
                <button
                    class="btn-icon delete"
                    @click="deletePart(part)"
                    :disabled="part.totalQuantity > 0"
                    :title="part.totalQuantity > 0 ? '有库存时无法删除' : '删除'"
                >
                  🗑️
                </button>
              </div>
            </td>
          </tr>
          </tbody>
        </table>

        <div v-if="filteredParts.length === 0" class="empty-state">
          <p>没有找到匹配的备件</p>
        </div>
      </div>

      <div v-if="filteredParts.length > 0" class="pagination">
        <button
            @click="prevPage"
            :disabled="currentPage === 1"
            class="pagination-btn"
        >
          上一页
        </button>
        <span class="page-info">第 {{ currentPage }} 页 / 共 {{ totalPages }} 页</span>
        <button
            @click="nextPage"
            :disabled="currentPage === totalPages"
            class="pagination-btn"
        >
          下一页
        </button>
      </div>
    </div>

    <!-- 添加/编辑备件对话框 -->
    <div v-if="showDialog" class="modal-overlay" @click.self="closeDialog">
      <div class="modal">
        <div class="modal-header">
          <h2>{{ isEditing ? '编辑备件' : '添加备件' }}</h2>
          <button class="close-btn" @click="closeDialog">×</button>
        </div>

        <div class="modal-body">
          <div class="form-group">
            <label>名称</label>
            <input
                v-model="currentPart.name"
                type="text"
                placeholder="输入备件名称"
            >
          </div>
          <div class="form-group">
            <label>描述</label>
            <textarea
                v-model="currentPart.description"
                placeholder="输入备件描述"
                rows="3"
            ></textarea>
          </div>
          <div class="form-group checkbox-group">
            <label class="checkbox-label">
              <input v-model="currentPart.isValuable" type="checkbox">
              <span class="checkmark"></span>
              是否为贵重备件
            </label>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn-secondary" @click="closeDialog">取消</button>
          <button class="btn-primary" @click="savePart">
            {{ isEditing ? '更新' : '保存' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import {ref, computed, onMounted, watch} from 'vue'
import { spareParts } from '@/api/parts/data/mockData'

export default {
  name: 'SparePartManagement',
  setup() {
    const parts = ref([])
    const searchQuery = ref('')
    const filterValuable = ref('all')
    const filterStock = ref('all')
    const showDialog = ref(false)
    const isEditing = ref(false)
    const currentPage = ref(1)
    const itemsPerPage = 5

    const currentPart = ref({
      id: null,
      name: '',
      description: '',
      isValuable: false
    })

    // 加载数据
    onMounted(() => {
      parts.value = [...spareParts]
    })

    // 过滤备件
    const filteredParts = computed(() => {
      return parts.value.filter(part => {
        // 文本搜索
        const matchesSearch = searchQuery.value === '' ||
            part.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
            part.description.toLowerCase().includes(searchQuery.value.toLowerCase())

        // 贵重属性过滤
        const matchesValuable = filterValuable.value === 'all' ||
            (filterValuable.value === 'yes' && part.isValuable) ||
            (filterValuable.value === 'no' && !part.isValuable)

        // 库存状态过滤
        const matchesStock = filterStock.value === 'all' ||
            (filterStock.value === 'low' && part.totalQuantity <= 3) ||
            (filterStock.value === 'sufficient' && part.totalQuantity > 3)

        return matchesSearch && matchesValuable && matchesStock
      })
    })

    // 分页相关计算
    const totalPages = computed(() => Math.ceil(filteredParts.value.length / itemsPerPage))

    const paginatedParts = computed(() => {
      const start = (currentPage.value - 1) * itemsPerPage
      const end = start + itemsPerPage
      return filteredParts.value.slice(start, end)
    })

    // 分页方法
    const nextPage = () => {
      if (currentPage.value < totalPages.value) {
        currentPage.value++
      }
    }

    const prevPage = () => {
      if (currentPage.value > 1) {
        currentPage.value--
      }
    }

    // 打开添加对话框
    const openAddDialog = () => {
      isEditing.value = false
      currentPart.value = {
        id: null,
        name: '',
        description: '',
        isValuable: false
      }
      showDialog.value = true
    }

    // 编辑备件
    const editPart = (part) => {
      isEditing.value = true
      currentPart.value = { ...part }
      showDialog.value = true
    }

    // 保存备件
    const savePart = () => {
      if (!currentPart.value.name.trim()) {
        alert('备件名称不能为空')
        return
      }

      if (isEditing.value) {
        // 更新现有备件
        const index = parts.value.findIndex(p => p.id === currentPart.value.id)
        if (index !== -1) {
          parts.value.splice(index, 1, {
            ...parts.value[index],
            name: currentPart.value.name,
            description: currentPart.value.description,
            isValuable: currentPart.value.isValuable
          })
        }
      } else {
        // 添加新备件
        const newPart = {
          id: Date.now(),
          name: currentPart.value.name,
          description: currentPart.value.description,
          totalQuantity: 0,
          isValuable: currentPart.value.isValuable,
          warehouses: [],
          borrowedItems: []
        }
        parts.value.push(newPart)
      }
      showDialog.value = false
    }

    // 删除备件
    const deletePart = (part) => {
      if (part.totalQuantity === 0) {
        if (confirm(`确定要删除备件 "${part.name}" 吗？此操作不可恢复。`)) {
          const index = parts.value.findIndex(p => p.id === part.id)
          if (index !== -1) {
            parts.value.splice(index, 1)
          }
        }
      }
    }

    // 关闭对话框
    const closeDialog = () => {
      showDialog.value = false
    }

    // 当过滤条件变化时重置页码
    const resetPagination = () => {
      currentPage.value = 1
    }

    // 监听过滤条件变化
    watch([searchQuery, filterValuable, filterStock], () => {
      resetPagination()
    })

    return {
      parts,
      searchQuery,
      filterValuable,
      filterStock,
      showDialog,
      isEditing,
      currentPart,
      currentPage,
      itemsPerPage,
      filteredParts,
      paginatedParts,
      totalPages,
      nextPage,
      prevPage,
      openAddDialog,
      editPart,
      savePart,
      deletePart,
      closeDialog
    }
  }
}
</script>

<style scoped>
.spare-part-management {
  padding: 24px;
  background-color: #f5f7fa;
  min-height: 100vh;
}

.header {
  margin-bottom: 24px;
}

.header h1 {
  color: #2c3e50;
  margin: 0 0 8px 0;
  font-size: 28px;
}

.header p {
  color: #7f8c8d;
  margin: 0;
  font-size: 16px;
}

.card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #eaeaea;
  flex-wrap: wrap;
  gap: 16px;
}

.search-section {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.search-input {
  position: relative;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #a0a0a0;
}

.search-input input {
  padding: 10px 10px 10px 40px;
  border: 1px solid #ddd;
  border-radius: 8px;
  width: 280px;
  font-size: 14px;
  transition: border-color 0.3s;
}

.search-input input:focus {
  outline: none;
  border-color: #3498db;
  box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
}

.filter-group {
  display: flex;
  gap: 12px;
}

.filter-group select {
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
  background-color: white;
  cursor: pointer;
}

.btn-primary {
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 10px 16px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: background-color 0.2s;
}

.btn-primary:hover {
  background-color: #2980b9;
}

.btn-icon {
  font-size: 16px;
}

.table-container {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th, td {
  padding: 16px;
  text-align: left;
  border-bottom: 1px solid #eaeaea;
}

th {
  background-color: #f8f9fa;
  font-weight: 600;
  color: #2c3e50;
  position: sticky;
  top: 0;
}

tbody tr {
  transition: background-color 0.2s;
}

tbody tr:hover {
  background-color: #f8f9fa;
}

.part-link {
  color: #3498db;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s;
}

.part-link:hover {
  color: #2980b9;
  text-decoration: underline;
}

.description-cell {
  max-width: 300px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.low-stock {
  color: #e74c3c;
  font-weight: 500;
}

.valuable-tag {
  padding: 4px 8px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
}

.valuable {
  background-color: #fff3cd;
  color: #856404;
}

.not-valuable {
  background-color: #d4edda;
  color: #155724;
}

.status-tag {
  padding: 4px 8px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
}

.out-of-stock {
  background-color: #f8d7da;
  color: #721c24;
}

.low-stock-status {
  background-color: #fff3cd;
  color: #856404;
}

.in-stock {
  background-color: #d4edda;
  color: #155724;
}

.action-buttons {
  display: flex;
  gap: 8px;
}

.action-buttons button {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 16px;
  padding: 6px;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.action-buttons button.edit:hover {
  background-color: #e3f2fd;
}

.action-buttons button.delete:hover:not(:disabled) {
  background-color: #ffebee;
}

.action-buttons button:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.empty-state {
  text-align: center;
  padding: 40px;
  color: #7f8c8d;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
  gap: 16px;
  border-top: 1px solid #eaeaea;
}

.pagination-btn {
  padding: 8px 16px;
  background-color: white;
  border: 1px solid #ddd;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.pagination-btn:hover:not(:disabled) {
  background-color: #f8f9fa;
  border-color: #ccc;
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-info {
  color: #7f8c8d;
  font-size: 14px;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 20px;
}

.modal {
  background: white;
  border-radius: 12px;
  width: 100%;
  max-width: 500px;
  overflow: hidden;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #eaeaea;
}

.modal-header h2 {
  margin: 0;
  color: #2c3e50;
  font-size: 20px;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #7f8c8d;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background-color 0.2s;
}

.close-btn:hover {
  background-color: #f5f5f5;
}

.modal-body {
  padding: 20px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #2c3e50;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.2s;
  box-sizing: border-box;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #3498db;
  box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
}

.checkbox-group {
  display: flex;
  align-items: center;
}

.checkbox-label {
  display: flex;
  align-items: center;
  cursor: pointer;
  font-weight: normal;
}

.checkbox-label input {
  width: auto;
  margin-right: 8px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 20px;
  border-top: 1px solid #eaeaea;
}

.btn-secondary {
  padding: 10px 16px;
  background-color: white;
  border: 1px solid #ddd;
  border-radius: 6px;
  color: #2c3e50;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-secondary:hover {
  background-color: #f8f9fa;
  border-color: #ccc;
}

@media (max-width: 768px) {
  .card-header {
    flex-direction: column;
    align-items: stretch;
  }

  .search-section {
    flex-direction: column;
  }

  .search-input input {
    width: 100%;
  }

  .filter-group {
    flex-direction: column;
  }
}
</style>
