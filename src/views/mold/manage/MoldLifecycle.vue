<!-- mold/manage/life.vue -->
<template>
  <div class="container">
    <div class="header-actions">
      <div class="search-box">
        <input
            v-model="keyword"
            placeholder="搜索模治具..."
            @keyup.enter="searchMolds"
        />
        <button class="btn btn-primary" @click="searchMolds">搜索</button>
      </div>
      <button class="btn btn-primary" @click="openModal('add')">新增模治具</button>
    </div>

    <table>
      <thead>
      <tr>
        <th>序号</th>
        <th>模治具编码</th>
        <th>模治具名称</th>
        <th>类型</th>
        <th>状态</th>
        <th>操作</th>
      </tr>
      </thead>
      <tbody>
      <tr
          v-for="(mold, index) in pagedData"
          :key="mold.id"
          @click="goToDetail(mold.id)"
      >
        <td>{{ (page - 1) * pageSize + index + 1 }}</td>
        <td>{{ mold.code }}</td>
        <td>{{ mold.name }}</td>
        <td>{{ mold.type }}</td>
        <td>
            <span :class="['status-badge', statusClass(mold.status)]">
              {{ mold.status }}
            </span>
        </td>
        <td @click.stop>
          <button class="btn btn-warning" @click="openModal('edit', mold.id)">
            编辑
          </button>
          <button class="btn btn-danger" @click="deleteMold(mold.id)">
            删除
          </button>
        </td>
      </tr>
      </tbody>
    </table>

    <!-- 分页 -->
    <div class="pagination">
      <button
          class="btn"
          :disabled="page <= 1"
          @click="page--"
      >
        上一页
      </button>
      <span>{{ page }} / {{ totalPages }}</span>
      <button
          class="btn"
          :disabled="page >= totalPages"
          @click="page++"
      >
        下一页
      </button>
    </div>

    <div v-if="filteredMolds.length === 0" class="empty-state">
      <p>暂无模治具数据</p>
    </div>

    <!-- 模态框 -->
    <div v-if="showModal" class="modal" @click.self="closeModal">
      <div class="modal-content">
        <div class="modal-header">
          <h2>{{ modalTitle }}</h2>
          <span class="close" @click="closeModal">&times;</span>
        </div>

        <form @submit.prevent="saveMold">
          <input v-model="form.id" type="hidden" />
          <div class="form-group">
            <label>模治具编码</label>
            <input v-model="form.code" required />
          </div>
          <div class="form-group">
            <label>模治具名称</label>
            <input v-model="form.name" required />
          </div>
          <div class="form-group">
            <label>类型</label>
            <input v-model="form.type" required />
          </div>
          <div class="form-group">
            <label>状态</label>
            <select v-model="form.status" required>
              <option value="闲置">闲置</option>
              <option value="使用中">使用中</option>
              <option value="维修">维修</option>
              <option value="保养">保养</option>
            </select>
          </div>
          <div class="form-actions">
            <button type="button" class="btn" @click="closeModal">取消</button>
            <button type="submit" class="btn btn-primary">保存</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, computed, ref } from 'vue'
import { useRouter } from 'vue-router'

// 模拟数据
const molds = ref([
  { id: 1, code: 'M001', name: '注塑模具A', type: '注塑', status: '使用中' },
  { id: 2, code: 'M002', name: '冲压模具B', type: '冲压', status: '闲置' },
  { id: 3, code: 'M003', name: '切割治具C', type: '切割', status: '维修' },
  { id: 4, code: 'M004', name: '组装治具D', type: '组装', status: '保养' }
])

// 搜索关键字
const keyword = ref('')

// 过滤后的数据
const filteredMolds = computed(() => {
  if (!keyword.value) return molds.value
  const kw = keyword.value.toLowerCase()
  return molds.value.filter(
      (m) =>
          m.code.toLowerCase().includes(kw) ||
          m.name.toLowerCase().includes(kw) ||
          m.type.toLowerCase().includes(kw)
  )
})

// 分页
const page = ref(1)
const pageSize = 10
const totalPages = computed(() => Math.ceil(filteredMolds.value.length / pageSize))
const pagedData = computed(() => {
  const start = (page.value - 1) * pageSize
  return filteredMolds.value.slice(start, start + pageSize)
})

// 路由跳转
const router = useRouter()
function goToDetail(id) {
  router.push(`/mold/manage/operation?id=${id}`)
}

// 状态样式映射
function statusClass(status) {
  const map = {
    闲置: 'status-idle',
    使用中: 'status-using',
    维修: 'status-repair',
    保养: 'status-maintenance'
  }
  return map[status] || 'status-idle'
}

// 模态框
const showModal = ref(false)
const modalTitle = ref('新增模治具')

const form = reactive({
  id: '',
  code: '',
  name: '',
  type: '',
  status: '闲置'
})

function openModal(mode, id = null) {
  modalTitle.value = mode === 'add' ? '新增模治具' : '编辑模治具'
  if (mode === 'add') {
    Object.assign(form, {
      id: '',
      code: '',
      name: '',
      type: '',
      status: '闲置'
    })
  } else {
    const mold = molds.value.find((m) => m.id === id)
    if (mold) Object.assign(form, mold)
  }
  showModal.value = true
}

function closeModal() {
  showModal.value = false
}

function saveMold() {
  if (form.id) {
    // 编辑
    const idx = molds.value.findIndex((m) => m.id === form.id)
    if (idx !== -1) Object.assign(molds.value[idx], { ...form })
  } else {
    // 新增
    const newId = Math.max(...molds.value.map((m) => m.id), 0) + 1
    molds.value.push({ ...form, id: newId })
  }
  closeModal()
}

function deleteMold(id) {
  if (confirm('确定要删除这个模治具吗？')) {
    molds.value = molds.value.filter((m) => m.id !== id)
  }
}

function searchMolds() {
  page.value = 1 // 搜索后回到第一页
}
</script>

<style scoped>
.container {
  max-width: 1200px;
  margin: 40px auto;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 30px;
}

h1 {
  color: #333;
  margin-bottom: 30px;
  text-align: center;
}

.header-actions {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
  align-items: center;
}

.search-box {
  display: flex;
  gap: 10px;
  align-items: center;
}

.search-box input {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  width: 200px;
}

.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s;
}

.btn:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.btn-primary {
  background-color: #1890ff;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background-color: #40a9ff;
}

.btn-success {
  background-color: #52c41a;
  color: white;
}

.btn-danger {
  background-color: #ff4d4f;
  color: white;
}

.btn-warning {
  background-color: #faad14;
  color: white;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th,
td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #f0f0f0;
}

th {
  background-color: #fafafa;
  font-weight: 600;
  color: #262626;
}

tr:hover {
  background-color: #f5f5f5;
  cursor: pointer;
}

.status-badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.status-idle {
  background-color: #f0f9ff;
  color: #1890ff;
}

.status-using {
  background-color: #f6ffed;
  color: #52c41a;
}

.status-repair {
  background-color: #fff2e8;
  color: #fa541c;
}

.status-maintenance {
  background-color: #fffbe6;
  color: #faad14;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 12px;
  margin-top: 20px;
}

.modal {
  position: fixed;
  z-index: 1000;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-content {
  background-color: white;
  padding: 30px;
  border-radius: 8px;
  width: 400px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.close {
  font-size: 24px;
  cursor: pointer;
  color: #999;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: 500;
  color: #333;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.form-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  margin-top: 20px;
}

.empty-state {
  text-align: center;
  padding: 60px;
  color: #999;
}
</style>
