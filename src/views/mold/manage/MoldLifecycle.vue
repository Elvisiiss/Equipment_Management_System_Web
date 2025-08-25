<template>
  <!-- 查询条件 -->
  <div class="query-bar">
    <el-form :model="query" inline>
      <el-form-item label="模治具编码" class="wide">
        <el-input v-model="query.code" placeholder="请输入" clearable />
      </el-form-item>
      <el-form-item label="模治具名称" class="wide">
        <el-input v-model="query.name" placeholder="请输入" clearable />
      </el-form-item>
      <el-form-item label="类型" class="wide">
        <el-input v-model="query.type" placeholder="请输入" clearable />
      </el-form-item>
      <el-form-item label="状态" class="wide">
        <el-select v-model="query.status" clearable placeholder="全部">
          <el-option label="闲置" value="闲置" />
          <el-option label="使用中" value="使用中" />
          <el-option label="Hold" value="Hold" />
        </el-select>
      </el-form-item>
    </el-form>

    <!-- 第二行：按钮区域 -->
    <el-form inline>
      <el-form-item>
        <el-button type="primary" @click="searchMolds">查询</el-button>
        <el-button @click="resetQuery">重置</el-button>
        <el-button type="primary" @click="openModal('add')">新增模治具</el-button>
      </el-form-item>
    </el-form>
  </div>

  <div class="container">
    <!-- 表格 -->
    <el-table
        :data="pagedData"
        stripe
        style="width: 100%"
        @row-click="handleRowClick"
    >
      <el-table-column type="index" label="序号" width="60"
                       :index="(page-1)*pageSize+1" />
      <el-table-column prop="code" label="模治具编码" />
      <el-table-column prop="name" label="模治具名称" />
      <el-table-column prop="type" label="类型" />
      <el-table-column label="状态">
        <template #default="scope">
          <span :class="['status-badge', statusClass(scope.row.status)]">
            {{ scope.row.status }}
          </span>
        </template>
      </el-table-column>
      <el-table-column prop="lifeLimit" label="寿命上限(次)" />
      <el-table-column prop="usedTimes" label="已使用(次)" />
      <el-table-column label="操作" width="120">
        <template #default="scope">
          <el-link type="primary" @click.stop="openModal('edit', scope.row.id)">
            编辑
          </el-link>
          <el-divider direction="vertical" />
          <el-link type="primary" @click.stop="deleteMold(scope.row.id)">
            删除
          </el-link>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <el-pagination
        v-model:currentPage="page"
        :page-size="pageSize"
        :total="filteredMolds.length"
        layout="prev, pager, next"
        style="margin-top: 16px; justify-content: center"
    />

    <div v-if="filteredMolds.length === 0" class="empty-state">
      <p>暂无模治具数据</p>
    </div>

    <!-- 模态框 -->
    <el-dialog
        v-model="showModal"
        :title="modalTitle"
        width="400px"
        @close="closeModal"
    >
      <el-form :model="form" label-width="100px">
        <el-form-item label="模治具编码">
          <el-input v-model="form.code" required />
        </el-form-item>
        <el-form-item label="模治具名称">
          <el-input v-model="form.name" required />
        </el-form-item>
        <el-form-item label="类型">
          <el-input v-model="form.type" required />
        </el-form-item>
        <el-form-item label="寿命上限(次)">
          <el-input-number v-model="form.lifeLimit" :min="0" required style="width:100%" />
        </el-form-item>
        <el-form-item label="已使用(次)">
          <el-input-number v-model="form.usedTimes" :min="0" required style="width:100%" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="form.status" required style="width:100%">
            <el-option value="闲置" label="闲置" />
            <el-option value="使用中" label="使用中" />
            <el-option value="Hold" label="Hold" />
          </el-select>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="closeModal">取消</el-button>
        <el-button type="primary" @click="saveMold">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { reactive, computed, ref } from 'vue'
import { useRouter } from 'vue-router'

// 模拟数据
const molds = ref([
  { id: 1, code: 'M001', name: '注塑模具A', type: '注塑', status: '使用中', lifeLimit: 100000, usedTimes: 1234 },
  { id: 2, code: 'M002', name: '冲压模具B', type: '冲压', status: '闲置', lifeLimit: 80000, usedTimes: 0 },
  { id: 3, code: 'M003', name: '切割治具C', type: '切割', status: 'Hold', lifeLimit: 50000, usedTimes: 1200 },
  { id: 4, code: 'M004', name: '组装治具D', type: '组装', status: 'Hold', lifeLimit: 60000, usedTimes: 3000 }
])

/* 查询条件 */
const query = reactive({
  code: '',
  name: '',
  type: '',
  status: ''
})

function resetQuery() {
  query.code = ''
  query.name = ''
  query.type = ''
  query.status = ''
  searchMolds()
}

/* 过滤后的数据 */
const filteredMolds = computed(() => {
  return molds.value.filter(m =>
      (!query.code   || m.code.toLowerCase().includes(query.code.toLowerCase())) &&
      (!query.name   || m.name.toLowerCase().includes(query.name.toLowerCase())) &&
      (!query.type   || m.type.toLowerCase().includes(query.type.toLowerCase())) &&
      (!query.status || m.status === query.status)
  )
})

/* 分页 */
const page = ref(1)
const pageSize = 10
const pagedData = computed(() => {
  const start = (page.value - 1) * pageSize
  return filteredMolds.value.slice(start, start + pageSize)
})

/* 状态样式 */
function statusClass(status) {
  const map = {
    闲置: 'status-idle',
    使用中: 'status-using',
    Hold: 'status-hold'
  }
  return map[status] || 'status-idle'
}

/* 路由 */
const router = useRouter()
function handleRowClick(row) {
  router.push(`/mold/manage/operation?id=${row.id}`)
}

/* 模态框 */
const showModal = ref(false)
const modalTitle = ref('新增模治具')
const form = reactive({
  id: '',
  code: '',
  name: '',
  type: '',
  status: '闲置',
  lifeLimit: 0,
  usedTimes: 0
})

function openModal(mode, id = null) {
  modalTitle.value = mode === 'add' ? '新增模治具' : '编辑模治具'
  if (mode === 'add') {
    Object.assign(form, {
      id: '', code: '', name: '', type: '', status: '闲置', lifeLimit: 0, usedTimes: 0
    })
  } else {
    const mold = molds.value.find(m => m.id === id)
    if (mold) Object.assign(form, mold)
  }
  showModal.value = true
}

function closeModal() {
  showModal.value = false
}

function saveMold() {
  if (form.id) {
    const idx = molds.value.findIndex(m => m.id === form.id)
    if (idx !== -1) Object.assign(molds.value[idx], form)
  } else {
    const newId = Math.max(...molds.value.map(m => m.id), 0) + 1
    molds.value.push({ ...form, id: newId })
  }
  closeModal()
}

function deleteMold(id) {
  ElMessageBox.confirm('确定要删除这个模治具吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    molds.value = molds.value.filter(m => m.id !== id)
  })
}

function searchMolds() {
  page.value = 1
}
</script>

<style scoped>
.query-bar {
  padding: 16px 0;
  background: transparent;
}
.container {
  max-width: 1200px;
  margin: 0 auto;
}
.wide .el-input,
.wide .el-select {
  width: 200px;
}
</style>
